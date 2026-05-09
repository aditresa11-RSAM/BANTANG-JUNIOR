import { createClient } from '@supabase/supabase-js';

// @ts-ignore
let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
// @ts-ignore
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (supabaseUrl && !supabaseUrl.startsWith('http')) {
  supabaseUrl = `https://${supabaseUrl}`;
}

// More thorough URL cleaning: users often copy-paste with trailing slashes or extra paths
if (supabaseUrl) {
  try {
    const url = new URL(supabaseUrl);
    supabaseUrl = `${url.protocol}//${url.hostname}`;
  } catch (e) {
    // If not a valid URL yet, at least clean trailing slash
    if (supabaseUrl.endsWith('/')) {
      supabaseUrl = supabaseUrl.slice(0, -1);
    }
  }
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
  const isSupabase = isSupabaseConfigured();

  // 1. NATIVE SUPABASE UPLOAD (High Quality, Prevents Pixelation/Black Backgrounds)
  if (isSupabase) {
    let timeoutId: any;
    try {
      const fileExt = file.name.split('.').pop() || 'png';
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const uploadPromise = supabase.storage.from(bucket).upload(fileName, file, {
        upsert: true,
        contentType: file.type || 'image/jpeg'
      });

      const timeoutPromise = new Promise<{data: any, error: any}>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Upload timeout after 15 seconds')), 15000);
      });

      const { data, error } = await Promise.race([uploadPromise, timeoutPromise]);
      clearTimeout(timeoutId);
      
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
        return publicUrl;
      } else {
        console.warn('Supabase native upload failed:', error.message);
        console.warn('Falling back to local base64 compression...');
      }
    } catch (e: any) {
      if (timeoutId) clearTimeout(timeoutId);
      console.error('Supabase upload exception:', e);
      console.warn('Falling back to local base64 compression...');
    }
  }

  // 2. FALLBACK BASE64 COMPRESSION (For Local Storage)
  console.log('Using local base64 fallback for image...');
  const getCompressedBase64 = (): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          let MAX_WIDTH = 1200;
          let MAX_HEIGHT = 1200;

          // Increase limit for Background / Hero images to avoid pixelation
          if (bucket === 'settings' || bucket === 'gallery') {
             MAX_WIDTH = 1920;
             MAX_HEIGHT = 1080;
          }
          
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
          
          const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
          
          if (!isPng && ctx) {
            // Fill with white instead of black for transparent jpg covers
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
          }

          ctx?.drawImage(img, 0, 0, width, height);
          
          // Preserve PNG transparency, use WebP for crisp JPEG alternatives
          const format = isPng ? 'image/png' : 'image/webp';
          resolve(canvas.toDataURL(format, 0.85));
        };
        img.onerror = () => resolve('');
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  return await getCompressedBase64();
}

export async function uploadRawFile(file: File, bucket: string = 'videos'): Promise<string | null> {
  const isSupabase = isSupabaseConfigured();
  if (isSupabase) {
    try {
      const fileExt = file.name.split('.').pop() || 'mp4';
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage.from(bucket).upload(fileName, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
      return publicUrl;
    } catch (e: any) {
      console.error('Raw upload error:', e);
      throw new Error(`Gagal upload ke Supabase (${bucket}): ${e.message}`);
    }
  }
  return URL.createObjectURL(file); // Fallback to blob URL for session persistence
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
