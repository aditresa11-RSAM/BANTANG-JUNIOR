import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';

// General hook for managing data with Supabase and localStorage fallback
export function useCMSData<T extends { id: string }>(collectionName: string, initialData: T[]) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const checkSupabase = () => {
    return isSupabaseConfigured();
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      if (checkSupabase()) {
        try {
          const { data: supaData, error } = await supabase.from(collectionName).select('*').order('created_at', { ascending: false });
          // If we got data and it's not empty, use it and cache it locally
          if (!error && supaData) {
            // Check if we actually got results (could be empty array which is fine)
            if (supaData.length > 0) {
              setData(supaData as T[]);
              // Also update local cache for offline/faster subsequent loads
              try {
                localStorage.setItem(`cms_${collectionName}`, JSON.stringify(supaData));
              } catch (e) {
                 console.warn('Failed to cache Supabase data locally');
              }
              setIsLoading(false);
              return;
            }
          }
          if (error) {
            // Suppress table missing errors as it's expected if tables haven't been created
            if (!error.message.includes('Could not find the table')) {
              console.warn(`Supabase fetch error for ${collectionName}:`, error.message);
            }
          }
        } catch (err) {
          console.warn(`Exception fetching Supabase data for ${collectionName}:`, err);
        }
      }
      // Fallback to localStorage if Supabase is not configured, or if it returned empty/error
      try {
        const saved = localStorage.getItem(`cms_${collectionName}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setData(parsed);
          } else {
            setData(initialData);
          }
        } else {
          setData(initialData);
          localStorage.setItem(`cms_${collectionName}`, JSON.stringify(initialData));
        }
      } catch (e) {
        console.error(`Failed to handle local data for ${collectionName}:`, e);
        setData(initialData);
      }
      setIsLoading(false);
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

