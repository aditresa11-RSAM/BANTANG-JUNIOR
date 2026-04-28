import { createClient } from '@supabase/supabase-js';

// @ts-ignore
let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
// @ts-ignore
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (supabaseUrl && !supabaseUrl.startsWith('http')) {
  supabaseUrl = `https://${supabaseUrl}`;
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');

export const isSupabaseConfigured = () => {
  return (
    supabaseUrl && 
    supabaseUrl !== '' && 
    supabaseUrl !== 'https://placeholder.supabase.co' &&
    supabaseUrl.includes('.supabase.co') &&
    supabaseAnonKey && 
    supabaseAnonKey !== '' && 
    supabaseAnonKey !== 'placeholder' &&
    supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY'
  );
};

export async function uploadFile(file: File, bucket: string = 'images'): Promise<string | null> {
  const resizeImage = (): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          resolve(canvas.toDataURL('image/jpeg', 0.6));
        };
        img.onerror = () => {
          resolve(''); // Fallback securely
        }
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        resolve('');
      };
      reader.readAsDataURL(file);
    });
  };

  const base64Data = await resizeImage();
  if (!base64Data) return null;

  if (!isSupabaseConfigured()) {
    console.warn('Supabase URL not configured.');
    return base64Data;
  }

  try {
    const response = await fetch(base64Data);
    const blob = await response.blob();
    const fileName = `${Math.random().toString(36).substring(2)}.jpg`;
    
    // Convert to web compatible fast upload
    const uploadPromise = supabase.storage.from(bucket).upload(fileName, blob, {
      contentType: 'image/jpeg',
      upsert: true
    });

    const timeoutPromise = new Promise<{data: any, error: any}>((_, reject) => {
      setTimeout(() => reject(new Error('Upload timeout after 5 seconds')), 5000);
    });

    const { data, error } = await Promise.race([uploadPromise, timeoutPromise]);

    if (error) {
      console.warn(`Supabase array failed: ${error.message || 'Unknown error'}, falling back to base64.`);
      return base64Data;
    }

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return publicUrl;
  } catch (err) {
    console.warn(`Exception during Supabase upload, falling back to base64.`, err);
    return base64Data;
  }
}

// Types for the database (simplified)
export type Role = 'admin' | 'coach' | 'parent' | 'player';

export interface UserProfile {
  id: string;
  username: string;
  role: Role;
  name: string;
}

export interface Player {
  id: string;
  name: string;
  dob: string;
  position: string;
  height: number;
  weight: number;
  jersey_number: number;
  category: string;
  photo_url?: string;
  parent_id?: string;
}

export interface SkillSet {
  dribbling: number;
  passing: number;
  shooting: number;
  speed: number;
  stamina: number;
  tactical: number;
  strength: number;
  discipline: number;
}
