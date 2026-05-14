import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';

// General hook for managing data with Supabase and localStorage fallback
export function useCMSData<T extends { id: string }>(collectionName: string, initialData: T[]) {
  const [data, setData] = useState<T[]>(() => {
    try {
      const saved = localStorage.getItem(`cms_${collectionName}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error(`Failed to load local cache for ${collectionName}:`, e);
    }
    return initialData;
  });
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

              // 1. Identify items currently in Supabase
              const supaIds = new Set(supaData.map(s => s.id));
              
              // 2. Identify items that are LOCAL ONLY (not in Supabase)
              // We keep these because they might be recent additions that failed to sync
              const localOnly = localData.filter((l: any) => l.id && !supaIds.has(l.id));

              // 3. Enrich Supabase data with any extra local metadata (like notes if they weren't synced yet)
              const enrichedSupaData = supaData.map(item => {
                const localItem = localData.find((l: any) => l.id === item.id) || {};
                
                const enriched = { ...localItem, ...item };
                
                if ((collectionName === 'players' || collectionName === 'registrations') && item.skillset && typeof item.skillset === 'object') {
                  Object.keys(item.skillset).forEach(k => {
                    if (!(k in enriched) || enriched[k] === undefined || enriched[k] === null) {
                      enriched[k] = item.skillset[k];
                    }
                  });
                }
                return enriched;
              });

              // 4. Combine: Local-only items go first (usually most recent), then the Supabase items
              const combinedData = [...localOnly, ...enrichedSupaData];
              
              // Sort by date if possible (assuming date field exists)
              combinedData.sort((a, b) => {
                const dateA = a.date || a.created_at || 0;
                const dateB = b.date || b.created_at || 0;
                return new Date(dateB).getTime() - new Date(dateA).getTime();
              });

              setData(combinedData as T[]);
              try {
                localStorage.setItem(`cms_${collectionName}`, JSON.stringify(combinedData));
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
    const item = { ...newItem, id: newItem.id || `local_${Math.random().toString(36).substring(2, 11)}`, created_at: new Date().toISOString() };
    
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
          // Skip internal props if any
          if (key.startsWith('_')) return;
          sanitizedItem[key.toLowerCase()] = item[key];
        });
        
        // Ensure id is kept as is (Supabase usually case-insensitive but id is critical)
        sanitizedItem.id = item.id;
        
        let payload = { ...sanitizedItem };
        let attempt = 0;
        while (attempt < 5) { // Reduced attempts to be faster
          attempt++;
          const { error } = await supabase.from(collectionName).insert([payload]);
          if (!error) {
            console.log(`[Sync] Successfully added to ${collectionName}`);
            break;
          }
          
          // Graceful handling for missing tables or schema issues
          const msg = error.message?.toLowerCase() || '';
          if (error.code === 'PGRST205' || error.code === '42P01' || msg.includes('schema cache') || (msg.includes('relation') && msg.includes('does not exist'))) {
            console.warn(`[Sync] Table '${collectionName}' missing. Saved only to Local Storage.`);
            return; 
          }

          if (error.code === 'PGRST204' || error.code === '42703' || msg.includes('does not exist')) {
            const match = msg.match(/column\s+['"]?([^'"\s]+)['"]?\s+of\s+relation/i) || msg.match(/Could not find the ['"]([^'"]+)['"]/i);
            if (match && match[1]) {
              const missingColumn = match[1].toLowerCase();
              console.warn(`[Auto-Fix] Removing missing column '${missingColumn}' and retrying insert...`);
              if (payload.hasOwnProperty(missingColumn)) {
                delete payload[missingColumn];
                if (Object.keys(payload).length === 0) break;
                continue;
              }
            }
          }
          
          if (attempt === 1) {
            console.warn(`[Sync] Insert error on ${collectionName}:`, error);
          }
          // If we can't fix it, just stop trying to sync but don't crash
          if (attempt >= 5) break;
        }
      } catch (err: any) {
        console.warn(`[Sync] Non-fatal exception syncing to ${collectionName}:`, err);
        // We don't throw anymore to ensure UI stays interactive and local state is maintained
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
          if (key.startsWith('_')) return;
          sanitizedFields[key.toLowerCase()] = updatedFields[key];
        });
        
        let payload = { ...sanitizedFields };
        let attempt = 0;
        while (attempt < 5) {
          attempt++;
          const { error } = await supabase.from(collectionName).update(payload).eq('id', id);
          if (!error) break;
          
          const msg = error.message?.toLowerCase() || '';
          if (error.code === 'PGRST205' || error.code === '42P01' || msg.includes('schema cache') || (msg.includes('relation') && msg.includes('does not exist'))) {
            return; // Ignore gracefully
          }

          if (error.code === 'PGRST204' || error.code === '42703' || msg.includes('does not exist')) {
            const match = msg.match(/column\s+['"]?([^'"\s]+)['"]?\s+of\s+relation/i) || msg.match(/Could not find the ['"]([^'"]+)['"]/i);
            if (match && match[1]) {
              const missingColumn = match[1].toLowerCase();
              if (payload.hasOwnProperty(missingColumn)) {
                delete payload[missingColumn];
                if (Object.keys(payload).length === 0) break;
                continue;
              }
            }
          }
          if (attempt === 1) {
            console.warn(`[Sync] Update error on ${collectionName}:`, error);
          }
          if (attempt >= 5) break;
        }
      } catch (err) {
        console.warn(`[Sync] Non-fatal exception updating ${collectionName}:`, err);
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
        if (error && (error.code === 'PGRST205' || error.code === '42P01' || error.message?.includes('schema cache') || (error.message?.includes('relation') && error.message?.includes('does not exist')))) return;
        if (error) throw error;
      } catch (err) {
        console.error(`Failed to sync delete from ${collectionName}:`, err);
      }
    }
  };

  return { data, addItems, updateItem, deleteItem, isLoading };
}

