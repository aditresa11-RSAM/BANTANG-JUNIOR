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
        const { data: supaData, error } = await supabase.from(collectionName).select('*').order('created_at', { ascending: false });
        if (!error && supaData) {
          setData(supaData as T[]);
          setIsLoading(false);
          return;
        }
      }
      // Fallback
      const saved = localStorage.getItem(`cms_${collectionName}`);
      if (saved) {
        setData(JSON.parse(saved));
      } else {
        setData(initialData);
        localStorage.setItem(`cms_${collectionName}`, JSON.stringify(initialData));
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

