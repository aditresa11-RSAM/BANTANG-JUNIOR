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
  const fallbackToBase64 = (): Promise<string> => {
    console.warn('Falling back to base64 format for image storage');
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          
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
          
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  if (!isSupabaseConfigured()) {
    console.warn('Supabase URL not configured.');
    return fallbackToBase64();
  }

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file);

    if (error) {
      console.warn(`Supabase storage upload failed: ${error.message || 'Unknown error'}, falling back to base64.`);
      return fallbackToBase64();
    }

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return publicUrl;
  } catch (err) {
    console.warn(`Exception during Supabase upload, falling back to base64.`, err);
    return fallbackToBase64();
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
