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
          if (!error && supaData && supaData.length > 0) {
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
          if (error) {
            console.warn(`Supabase fetch error for ${collectionName}:`, error.message);
          }
        } catch (err) {
          console.warn(`Exception fetching Supabase data for ${collectionName}:`, err);
        }
      }
      // Fallback to localStorage if Supabase is not configured, or if it returned empty/error
      const saved = localStorage.getItem(`cms_${collectionName}`);
      if (saved) {
        try {
          setData(JSON.parse(saved));
        } catch (e) {
          console.error(`Failed to parse cached data for ${collectionName}`, e);
          setData(initialData);
        }
      } else {
        setData(initialData);
        try {
          localStorage.setItem(`cms_${collectionName}`, JSON.stringify(initialData));
        } catch (e) {
           console.error('Storage quota exceeded');
        }
      }
      setIsLoading(false);
    };
    loadData();
  }, [collectionName]);

  const addItems = async (newItem: Omit<T, 'id'>) => {
    const item = { ...newItem, id: Math.random().toString(36).substr(2, 9) } as unknown as T;
    
    if (checkSupabase()) {
      const { error } = await supabase.from(collectionName).insert([item]);
      if (!error) {
        setData(prev => [item, ...prev]);
        return;
      }
    }
    
    // Fallback
    setData(prev => {
      const updated = [item, ...prev];
      try {
        localStorage.setItem(`cms_${collectionName}`, JSON.stringify(updated));
      } catch (e) {
        console.error('Storage quota exceeded, unable to save to localStorage', e);
        // Continue using in-memory state
      }
      return updated;
    });
  };

  const updateItem = async (id: string, updatedFields: any) => {
    if (checkSupabase()) {
      const { error } = await supabase.from(collectionName).update(updatedFields).eq('id', id);
      if (!error) {
        setData(prev => prev.map(item => item.id === id ? { ...item, ...updatedFields } : item));
        return;
      }
    }

    // Fallback
    setData(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, ...updatedFields } : item);
      try {
        localStorage.setItem(`cms_${collectionName}`, JSON.stringify(updated));
      } catch (e) {
        console.error('Storage quota exceeded, unable to save to localStorage', e);
      }
      return updated;
    });
  };

  const deleteItem = async (id: string) => {
    if (checkSupabase()) {
      const { error } = await supabase.from(collectionName).delete().eq('id', id);
      if (!error) {
        setData(prev => prev.filter(item => item.id !== id));
        return;
      }
    }

    // Fallback
    setData(prev => {
      const updated = prev.filter(item => item.id !== id);
      try {
        localStorage.setItem(`cms_${collectionName}`, JSON.stringify(updated));
      } catch (e) {
        console.error('Storage quota exceeded, unable to save to localStorage', e);
      }
      return updated;
    });
  };

  return { data, addItems, updateItem, deleteItem, isLoading };
}

