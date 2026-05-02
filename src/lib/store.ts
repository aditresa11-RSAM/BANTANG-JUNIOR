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
        try {
          const { data: supaData, error } = await supabase
            .from(collectionName)
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && supaData) {
            setData(supaData as T[]);
            try {
              localStorage.setItem(`cms_${collectionName}`, JSON.stringify(supaData));
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
      }
    };
    loadData();
  }, [collectionName]);

  const addItems = async (newItem: any) => {
    // Basic sanitization: Ensure id exists
    const item = { ...newItem, id: newItem.id || Math.random().toString(36).substring(2, 11) };
    
    // Optimistic Update
    const previousData = [...data];
    setData(prev => [item, ...prev]);

    if (checkSupabase()) {
      try {
        // Sanitize for Supabase: Lowercase keys to match DB schema
        const sanitizedItem: any = {};
        Object.keys(item).forEach(key => {
          sanitizedItem[key.toLowerCase()] = item[key];
        });
        const { error } = await supabase.from(collectionName).insert([sanitizedItem]);
        if (error) throw error;
      } catch (err) {
        console.error(`Failed to sync add to ${collectionName}:`, err);
      }
    }
    
    // Sync to local
    try {
      const updated = [item, ...previousData];
      localStorage.setItem(`cms_${collectionName}`, JSON.stringify(updated));
    } catch (e) {
      console.error('Storage error:', e);
    }
  };

  const updateItem = async (id: string, updatedFields: any) => {
    // Optimistic Update
    setData(prev => prev.map(item => item.id === id ? { ...item, ...updatedFields } : item));

    if (checkSupabase()) {
      try {
        // Sanitize for Supabase: Lowercase keys
        const sanitizedFields: any = {};
        Object.keys(updatedFields).forEach(key => {
          sanitizedFields[key.toLowerCase()] = updatedFields[key];
        });
        const { error } = await supabase.from(collectionName).update(sanitizedFields).eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.error(`Failed to sync update to ${collectionName}:`, err);
      }
    }

    // Sync to local
    try {
      const updated = data.map(item => item.id === id ? { ...item, ...updatedFields } : item);
      localStorage.setItem(`cms_${collectionName}`, JSON.stringify(updated));
    } catch (e) {
      console.error('Storage error:', e);
    }
  };

  const deleteItem = async (id: string) => {
    // Optimistic Update
    setData(prev => prev.filter(item => item.id !== id));

    if (checkSupabase()) {
      try {
        const { error } = await supabase.from(collectionName).delete().eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.error(`Failed to sync delete from ${collectionName}:`, err);
      }
    }

    // Sync to local
    try {
      const updated = data.filter(item => item.id !== id);
      localStorage.setItem(`cms_${collectionName}`, JSON.stringify(updated));
    } catch (e) {
      console.error('Storage error:', e);
    }
  };

  return { data, addItems, updateItem, deleteItem, isLoading };
}

