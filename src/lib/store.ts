import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';

// General hook for managing data with Supabase and localStorage fallback
export function useCMSData<T extends { id: string }>(collectionName: string, initialData: T[]) {
  const [data, setData] = useState<T[]>(initialData);
  const [isLoading, setIsLoading] = useState(true);

  const checkSupabase = () => {
    return isSupabaseConfigured();
  };

  useEffect(() => {
    const loadData = async () => {
      // 1. Instant load from local cache
      try {
        const saved = localStorage.getItem(`cms_${collectionName}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setData(parsed);
          }
        }
      } catch (e) {
        console.error(`Failed to load local cache for ${collectionName}:`, e);
      }
      setIsLoading(false);

      // 2. Background fetch from Supabase
      if (checkSupabase()) {
        const fetchData = async () => {
          try {
            const { data: supaData, error } = await supabase
              .from(collectionName)
              .select('*')
              .order('created_at', { ascending: false });

            if (!error && supaData) {
              const localDataRaw = localStorage.getItem(`cms_${collectionName}`);
              let localData: any[] = [];
              try { localData = JSON.parse(localDataRaw || '[]'); } catch (e) {}

              const enrichedData = supaData.map(item => {
                const localItem = localData.find((l: any) => l.id === item.id) || {};
                
                const enriched = { ...localItem, ...item };
                
                if ((collectionName === 'players' || collectionName === 'registrations') && item.skillset && typeof item.skillset === 'object') {
                  // Merge skillset properties back up to the main object
                  // Ensure we don't overwrite true root properties
                  Object.keys(item.skillset).forEach(k => {
                    if (!(k in enriched) || enriched[k] === undefined || enriched[k] === null) {
                      enriched[k] = item.skillset[k];
                    }
                  });
                }
                return enriched;
              });
              setData(enrichedData as T[]);
              try {
                localStorage.setItem(`cms_${collectionName}`, JSON.stringify(enrichedData));
              } catch (e) {
                console.warn('Failed to cache Supabase data locally');
              }
            } else if (error) {
              if (!error.message.includes('Could not find the table')) {
                console.warn(`Supabase fetch error for ${collectionName}:`, error.message);
              }
            }
          } catch (err) {
            console.warn(`Exception fetching Supabase data for ${collectionName}:`, err);
          }
        };

        fetchData();

        // Implement Auto-refresh every 10 seconds as backup
        const interval = setInterval(fetchData, 10000);

        // Real-time Subscriptions for instant updates
        // Use a unique channel ID to avoid collisions between multiple components
        const channelId = `realtime:${collectionName}:${Math.random().toString(36).substring(2, 9)}`;
        const channel = supabase
          .channel(channelId)
          .on('postgres_changes', { event: '*', schema: 'public', table: collectionName }, () => {
            fetchData();
          })
          .subscribe();

        return () => {
          clearInterval(interval);
          supabase.removeChannel(channel);
        };
      }
    };
    const cleanup = loadData();
    return () => {
      if (typeof cleanup === 'function') (cleanup as any)();
      else if (cleanup instanceof Promise) cleanup.then(c => typeof c === 'function' && c());
    };
  }, [collectionName]);

  const addItems = async (newItem: any) => {
    // Basic sanitization: Ensure id exists
    const item = { ...newItem, id: newItem.id || Math.random().toString(36).substring(2, 11) };
    
    // Optimistic Update
    setData(prev => {
      const updated = [item, ...prev];
      try {
        localStorage.setItem(`cms_${collectionName}`, JSON.stringify(updated));
      } catch (e) {
        console.error('Storage error:', e);
      }
      return updated;
    });

    if (checkSupabase()) {
      try {
        // Sanitize for Supabase: Lowercase keys to match DB schema
        const sanitizedItem: any = {};
        Object.keys(item).forEach(key => {
          sanitizedItem[key.toLowerCase()] = item[key];
        });
        
        let payload = { ...sanitizedItem };
        let attempt = 0;
        while (attempt < 20) {
          attempt++;
          const { error } = await supabase.from(collectionName).insert([payload]);
          if (!error) break;
          
          if (error.code === 'PGRST204' || error.code === '42703' || error.message?.includes('does not exist')) {
            const match = error.message && typeof error.message === 'string' ? error.message.match(/Could not find the ['"]([^'"]+)['"]/i) || error.message.match(/column\s+['"]?([^'"\s]+)['"]?\s+of\s+relation/i) : null;
            if (match && match[1]) {
              const missingColumn = match[1].toLowerCase();
              console.warn(`[Auto-Fix] Removing missing column '${missingColumn}' and retrying insert...`);
              if (payload.hasOwnProperty(missingColumn)) {
                if ((collectionName === 'players' || collectionName === 'registrations') && missingColumn !== 'skillset') {
                  payload.skillset = payload.skillset || {};
                  payload.skillset[missingColumn] = payload[missingColumn];
                }
                delete payload[missingColumn];
                if (Object.keys(payload).length === 0) break;
                continue;
              } else {
                console.warn(`[Auto-Fix] Missing column '${missingColumn}' not found in payload. Stopping retries.`);
                break;
              }
            } else {
              break;
            }
          }
          if (attempt === 1) {
            console.error(`[Sync] First attempt insert error on ${collectionName}:`, error);
          }
          throw error;
        }
      } catch (err) {
        console.error(`Failed to sync add to ${collectionName}:`, err);
      }
    }
  };

  const updateItem = async (id: string, updatedFields: any) => {
    // Optimistic Update
    setData(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, ...updatedFields } : item);
      try {
        localStorage.setItem(`cms_${collectionName}`, JSON.stringify(updated));
      } catch (e) {
        console.error('Storage error:', e);
      }
      return updated;
    });

    if (checkSupabase()) {
      try {
        // Sanitize for Supabase: Lowercase keys
        const sanitizedFields: any = {};
        Object.keys(updatedFields).forEach(key => {
          sanitizedFields[key.toLowerCase()] = updatedFields[key];
        });
        
        let payload = { ...sanitizedFields };
        let attempt = 0;
        while (attempt < 20) {
          attempt++;
          const { error } = await supabase.from(collectionName).update(payload).eq('id', id);
          if (!error) break;
          
          if (error.code === 'PGRST204' || error.code === '42703' || error.message?.includes('does not exist')) {
            const match = error.message && typeof error.message === 'string' ? error.message.match(/Could not find the ['"]([^'"]+)['"]/i) || error.message.match(/column\s+['"]?([^'"\s]+)['"]?\s+of\s+relation/i) : null;
            if (match && match[1]) {
              const missingColumn = match[1].toLowerCase();
              console.warn(`[Auto-Fix] Removing missing column '${missingColumn}' and retrying update...`);
              if (payload.hasOwnProperty(missingColumn)) {
                if ((collectionName === 'players' || collectionName === 'registrations') && missingColumn !== 'skillset') {
                  payload.skillset = payload.skillset || {};
                  payload.skillset[missingColumn] = payload[missingColumn];
                }
                delete payload[missingColumn];
                if (Object.keys(payload).length === 0) break;
                continue;
              } else {
                console.warn(`[Auto-Fix] Missing column '${missingColumn}' not found in payload. Stopping retries.`);
                break;
              }
            } else {
              break;
            }
          }
          if (attempt === 1) {
            console.error(`[Sync] First attempt update error on ${collectionName}:`, error);
          }
          throw error;
        }
      } catch (err) {
        console.error(`Failed to sync update to ${collectionName}:`, err);
      }
    }
  };

  const deleteItem = async (id: string) => {
    // Optimistic Update
    setData(prev => {
      const updated = prev.filter(item => item.id !== id);
      try {
        localStorage.setItem(`cms_${collectionName}`, JSON.stringify(updated));
      } catch (e) {
        console.error('Storage error:', e);
      }
      return updated;
    });

    if (checkSupabase()) {
      try {
        const { error } = await supabase.from(collectionName).delete().eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.error(`Failed to sync delete from ${collectionName}:`, err);
      }
    }
  };

  return { data, addItems, updateItem, deleteItem, isLoading };
}

