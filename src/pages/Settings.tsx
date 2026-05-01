import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Settings as SettingsIcon,
  Image as ImageIcon,
  Save,
  Trash2,
  CheckCircle2,
  Palette,
  Upload,
  X,
  Loader2,
  Server,
  AlertTriangle,
  Database,
  Cloud,
  Code
} from 'lucide-react';
import Layout from '../components/ui/Layout';
import { useSettings } from '../App';
import { uploadFile, isSupabaseConfigured, supabase } from '../lib/supabase';

export default function Settings() {
  const { appName, setAppName, logoUrl, setLogoUrl, heroBgUrl, setHeroBgUrl } = useSettings();
  
  const [localAppName, setLocalAppName] = useState(appName);
  const [localLogoUrl, setLocalLogoUrl] = useState(logoUrl || '');
  const [localHeroBgUrl, setLocalHeroBgUrl] = useState(heroBgUrl || '');
  const [isSaved, setIsSaved] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>('');

  const clearImageCache = () => {
    if (window.confirm("Peringatan: Ini akan menghapus data gambar lokal (base64) yang belum tersimpan di Cloud. Gunakan ini jika Anda mendapat error 'Quota Exceeded'. Data teks (nama, skor, dll) akan tetap aman. Lanjutkan?")) {
      const tables = [
        'players', 'dashboard_sliders', 'coaches', 
        'upcoming_matches', 'match_results', 'gallery', 
        'financials', 'schedules', 'scouting', 'medicals',
        'training_materials', 'attendance', 'tactics'
      ];
      
      let count = 0;
      let tablesCleaned: string[] = [];

      tables.forEach(table => {
        const key = `cms_${table}`;
        const data = localStorage.getItem(key);
        if (data) {
          try {
            let items = JSON.parse(data);
            let updated = false;
            const imageFields = ['photo', 'img', 'photoUrl', 'rivalLogo', 'url', 'media_url'];
            
            const cleanedItems = items.map((item: any) => {
              imageFields.forEach(field => {
                const value = item[field];
                // Check for any base64 data (images or videos)
                if (typeof value === 'string' && value.startsWith('data:')) {
                  item[field] = ''; // Strip heavy data
                  updated = true;
                  count++;
                }
              });
              return item;
            });

            if (updated) {
              try {
                // Remove first to ensure we have space to write the smaller version
                localStorage.removeItem(key);
                localStorage.setItem(key, JSON.stringify(cleanedItems));
                tablesCleaned.push(table);
              } catch (writeError) {
                console.error(`Failed to rewrite ${table} during cleaning:`, writeError);
              }
            }
          } catch (e) {
            console.error(`Error parsing ${table} record:`, e);
          }
        }
      });
      
      if (count > 0) {
        alert(`Berhasil membersihkan ${count} file gambar lokal dari tabel: ${tablesCleaned.join(', ')}. Silakan coba sinkronisasi ulang.`);
      } else {
        alert("Tidak ditemukan data gambar lokal (base64) untuk dibersihkan. Memori penuh mungkin disebabkan oleh data lain.");
      }
    }
  };

  const syncImagesToCloud = async () => {
    if (!isDbConfigured) return;
    setIsSyncing(true);
    setSyncStatus('Menganalisa data gambar lokal...');

    const tables = [
      'players', 'dashboard_sliders', 'coaches', 
      'upcoming_matches', 'match_results', 'gallery', 
      'financials', 'schedules', 'scouting', 'medicals',
      'training_materials', 'attendance', 'tactics'
    ];

    try {
      let totalUpdated = 0;
      
      // 1. Sync standalone settings first
      setSyncStatus('Memeriksa logo & background akademi...');
      const settingsKeys = [
        { key: 'ssb_logo_url', setter: setLogoUrl, localSetter: setLocalLogoUrl },
        { key: 'ssb_hero_bg_url', setter: setHeroBgUrl, localSetter: setLocalHeroBgUrl }
      ];

      for (const s of settingsKeys) {
        const val = localStorage.getItem(s.key);
        if (val && val.startsWith('data:image')) {
          try {
            const res = await fetch(val);
            const blob = await res.blob();
            const file = new File([blob], `${s.key}.png`, { type: 'image/png' });
            const publicUrl = await uploadFile(file, 'settings');
            if (publicUrl) {
              localStorage.setItem(s.key, publicUrl);
              s.setter(publicUrl);
              s.localSetter(publicUrl);
              totalUpdated++;
            }
          } catch (e) {
            console.error(`Failed to sync ${s.key}:`, e);
          }
        }
      }

      // 2. Sync table data
      for (const table of tables) {
        const localData = localStorage.getItem(`cms_${table}`);
        if (!localData) continue;

        let items = JSON.parse(localData);
        let tableUpdated = false;

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const imageFields = ['photo', 'img', 'photoUrl', 'rivalLogo', 'url', 'media_url'];
          
          for (const field of imageFields) {
            if (item[field] && item[field].startsWith('data:image')) {
              setSyncStatus(`Mengunggah gambar: ${item.name || item.title || table}...`);
              try {
                // Convert base64 to file
                const res = await fetch(item[field]);
                const blob = await res.blob();
                const file = new File([blob], `${table}_${item.id}_${field}.png`, { type: 'image/png' });
                
                const publicUrl = await uploadFile(file, table === 'dashboard_sliders' ? 'dashboard' : (table === 'training_materials' ? 'materials' : table));
                if (publicUrl) {
                  item[field] = publicUrl;
                  tableUpdated = true;
                  totalUpdated++;
                }
              } catch (uploadError) {
                console.error("Single item upload failed:", uploadError);
              }
            }
          }
        }

        if (tableUpdated) {
          try {
            const stringified = JSON.stringify(items);
            // Optimization: Remove old first to avoid double storage during setItem transaction
            localStorage.removeItem(`cms_${table}`);
            localStorage.setItem(`cms_${table}`, stringified);
          } catch (storageError: any) {
            if (storageError.name === 'QuotaExceededError' || storageError.code === 22) {
              setSyncStatus(`Error: Kuota penuh saat menyimpan ${table}. Segera klik 'Bersihkan Cache Gambar'!`);
              setIsSyncing(false);
              return;
            }
            throw storageError;
          }
        }
      }
      setSyncStatus(`Selesai! ${totalUpdated} gambar berhasil diunggah.`);
    } catch (error: any) {
      console.error('Image sync error:', error);
      setSyncStatus(`Gagal: ${error.message || 'Error sinkronisasi'}`);
    } finally {
      setTimeout(() => setIsSyncing(false), 3000);
    }
  };
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const heroBgInputRef = useRef<HTMLInputElement>(null);

  const isDbConfigured = isSupabaseConfigured();

  const handleSave = async () => {
    setAppName(localAppName);
    setLogoUrl(localLogoUrl || null);
    setHeroBgUrl(localHeroBgUrl || null);
    
    // Save to Supabase Storage and DB if configured
    if (isSupabaseConfigured()) {
       try {
          // 1. Save JSON for backup
          const settingsObj = {
             appName: localAppName,
             logoUrl: localLogoUrl,
             heroBgUrl: localHeroBgUrl
          };
          const blob = new Blob([JSON.stringify(settingsObj)], { type: 'application/json' });
          await supabase.storage.from('settings').upload('global_settings.json', blob, { upsert: true });
          
          // 2. Save to DB for real-time reactivity
          const { error } = await supabase.from('settings').upsert({
            id: 'main',
            app_name: localAppName,
            logo_url: localLogoUrl,
            hero_bg_url: localHeroBgUrl,
            updated_at: new Date().toISOString()
          });

          if (error) throw error;
       } catch(e: any) {
          console.error("Failed to save settings to Supabase", e);
          alert("Gagal sinkronisasi Cloud: " + (e.message || "Pastikan Supabase Anda sudah benar."));
       }
    }

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReset = () => {
    setLocalAppName('SSB BANTANG JUNIOR');
    setLocalLogoUrl('https://storage.googleapis.com/aistudio-yeti-pre-prod-user-assets/q2q3jltn5bcm-IMG_20250218_065922.png');
    setLocalHeroBgUrl('https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=2693');
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran logo melebihi 2MB. Silakan pilih file yang lebih kecil.");
        if (fileInputRef.current) {
           fileInputRef.current.value = '';
        }
        return;
      }
      setIsUploadingLogo(true);
      try {
        const publicUrl = await uploadFile(file, 'settings');
        if (publicUrl) {
          setLocalLogoUrl(publicUrl);
        }
      } catch (error: any) {
        console.error("Upload failed:", error);
        alert(error.message || "Gagal mengunggah logo. Pastikan koneksi internet stabil dan bucket 'settings' sudah ada di Supabase.");
      } finally {
        setIsUploadingLogo(false);
      }
    }
  };

  const handleRemoveLogo = () => {
    setLocalLogoUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleHeroBgChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert("Ukuran gambar melebihi 3MB. Silakan pilih file yang lebih kecil.");
        if (heroBgInputRef.current) {
           heroBgInputRef.current.value = '';
        }
        return;
      }
      setIsUploadingHero(true);
      try {
        const publicUrl = await uploadFile(file, 'settings');
        if (publicUrl) {
          setLocalHeroBgUrl(publicUrl);
        }
      } catch (error: any) {
        console.error("Upload failed:", error);
        alert(error.message || "Gagal mengunggah background. Pastikan koneksi internet stabil dan bucket 'settings' sudah ada di Supabase.");
      } finally {
        setIsUploadingHero(false);
      }
    }
  };

  const handleRemoveHeroBg = () => {
    setLocalHeroBgUrl('');
    if (heroBgInputRef.current) {
      heroBgInputRef.current.value = '';
    }
  };

   const sqlSchema = `
-- Supabase SQL Editor Script (Full Schema)
-- Paste this script to SQL Editor in your Supabase Dashboard.

-- 1. Create/Patch Players
CREATE TABLE IF NOT EXISTS players (
    id TEXT PRIMARY KEY, 
    name TEXT NOT NULL, 
    overall NUMERIC, 
    category TEXT, 
    position TEXT, 
    photo TEXT, 
    photourl TEXT,
    dribbling NUMERIC, 
    passing NUMERIC, 
    shooting NUMERIC, 
    pace NUMERIC, 
    strength NUMERIC, 
    tactical NUMERIC, 
    vision NUMERIC, 
    teamwork NUMERIC, 
    goals NUMERIC, 
    assists NUMERIC, 
    appearances NUMERIC, 
    attendance NUMERIC, 
    dob TEXT,
    age NUMERIC,
    stamina NUMERIC,
    jersey NUMERIC,
    status TEXT DEFAULT 'Aktif',
    height NUMERIC, 
    weight NUMERIC, 
    dominantfoot TEXT, 
    parent_id TEXT,
    skillset JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Patch missing columns for existing tables
DO $$ 
BEGIN 
    -- Players
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='players' AND column_name='dob') THEN ALTER TABLE players ADD COLUMN dob TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='players' AND column_name='photourl') THEN ALTER TABLE players ADD COLUMN photourl TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='players' AND column_name='age') THEN ALTER TABLE players ADD COLUMN age NUMERIC; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='players' AND column_name='stamina') THEN ALTER TABLE players ADD COLUMN stamina NUMERIC; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='players' AND column_name='jersey') THEN ALTER TABLE players ADD COLUMN jersey NUMERIC; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='players' AND column_name='status') THEN ALTER TABLE players ADD COLUMN status TEXT DEFAULT 'Aktif'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='players' AND column_name='pace') THEN ALTER TABLE players ADD COLUMN pace NUMERIC; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='players' AND column_name='strength') THEN ALTER TABLE players ADD COLUMN strength NUMERIC; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='players' AND column_name='tactical') THEN ALTER TABLE players ADD COLUMN tactical NUMERIC; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='players' AND column_name='vision') THEN ALTER TABLE players ADD COLUMN vision NUMERIC; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='players' AND column_name='teamwork') THEN ALTER TABLE players ADD COLUMN teamwork NUMERIC; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='players' AND column_name='goals') THEN ALTER TABLE players ADD COLUMN goals NUMERIC; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='players' AND column_name='assists') THEN ALTER TABLE players ADD COLUMN assists NUMERIC; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='players' AND column_name='appearances') THEN ALTER TABLE players ADD COLUMN appearances NUMERIC; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='players' AND column_name='attendance') THEN ALTER TABLE players ADD COLUMN attendance NUMERIC; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='players' AND column_name='parent_id') THEN ALTER TABLE players ADD COLUMN parent_id TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='players' AND column_name='skillset') THEN ALTER TABLE players ADD COLUMN skillset JSONB; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='players' AND column_name='height') THEN ALTER TABLE players ADD COLUMN height NUMERIC; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='players' AND column_name='weight') THEN ALTER TABLE players ADD COLUMN weight NUMERIC; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='players' AND column_name='dominantfoot') THEN ALTER TABLE players ADD COLUMN dominantfoot TEXT; END IF;

    -- Upcoming Matches
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='upcoming_matches' AND column_name='result') THEN ALTER TABLE upcoming_matches ADD COLUMN result TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='upcoming_matches' AND column_name='venue') THEN ALTER TABLE upcoming_matches ADD COLUMN venue TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='upcoming_matches' AND column_name='time') THEN ALTER TABLE upcoming_matches ADD COLUMN time TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='upcoming_matches' AND column_name='rivallogo') THEN ALTER TABLE upcoming_matches ADD COLUMN rivallogo TEXT; END IF;

    -- Results
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='match_results' AND column_name='rivallogo') THEN ALTER TABLE match_results ADD COLUMN rivallogo TEXT; END IF;

    -- Scouting
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='scouting' AND column_name='currentteam') THEN ALTER TABLE scouting ADD COLUMN currentteam TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='scouting' AND column_name='match_rating') THEN ALTER TABLE scouting ADD COLUMN match_rating NUMERIC; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='scouting' AND column_name='photo') THEN ALTER TABLE scouting ADD COLUMN photo TEXT; END IF;

    -- Medicals
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='medicals' AND column_name='estimatedreturn') THEN ALTER TABLE medicals ADD COLUMN estimatedreturn TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='medicals' AND column_name='playername') THEN ALTER TABLE medicals ADD COLUMN playername TEXT; END IF;

    -- Dashboard Sliders
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dashboard_sliders' AND column_name='subtitle') THEN ALTER TABLE dashboard_sliders ADD COLUMN subtitle TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dashboard_sliders' AND column_name='description') THEN ALTER TABLE dashboard_sliders ADD COLUMN description TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dashboard_sliders' AND column_name='media_type') THEN ALTER TABLE dashboard_sliders ADD COLUMN media_type TEXT DEFAULT 'image'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dashboard_sliders' AND column_name='video_url') THEN ALTER TABLE dashboard_sliders ADD COLUMN video_url TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dashboard_sliders' AND column_name='autoplay') THEN ALTER TABLE dashboard_sliders ADD COLUMN autoplay BOOLEAN DEFAULT true; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dashboard_sliders' AND column_name='loop') THEN ALTER TABLE dashboard_sliders ADD COLUMN loop BOOLEAN DEFAULT true; END IF;

    -- Schedules
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='schedules' AND column_name='activity') THEN ALTER TABLE schedules ADD COLUMN activity TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='schedules' AND column_name='venue') THEN ALTER TABLE schedules ADD COLUMN venue TEXT; END IF;

    -- Coaches
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='coaches' AND column_name='photo') THEN ALTER TABLE coaches ADD COLUMN photo TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='coaches' AND column_name='photourl') THEN ALTER TABLE coaches ADD COLUMN photourl TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='coaches' AND column_name='specialty') THEN ALTER TABLE coaches ADD COLUMN specialty TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='coaches' AND column_name='activeteams') THEN ALTER TABLE coaches ADD COLUMN activeteams JSONB; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='coaches' AND column_name='experience') THEN ALTER TABLE coaches ADD COLUMN experience TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='coaches' AND column_name='role') THEN ALTER TABLE coaches ADD COLUMN role TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='coaches' AND column_name='rating') THEN ALTER TABLE coaches ADD COLUMN rating TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='coaches' AND column_name='phone') THEN ALTER TABLE coaches ADD COLUMN phone TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='coaches' AND column_name='email') THEN ALTER TABLE coaches ADD COLUMN email TEXT; END IF;

END $$;

CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY,
    app_name TEXT,
    logo_url TEXT,
    hero_bg_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS dashboard_sliders (
    id TEXT PRIMARY KEY, 
    title TEXT, 
    subtitle TEXT, 
    description TEXT, 
    img TEXT, 
    media_type TEXT DEFAULT 'image',
    video_url TEXT,
    autoplay BOOLEAN DEFAULT true,
    loop BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS coaches (
    id TEXT PRIMARY KEY, 
    name TEXT NOT NULL, 
    role TEXT, 
    experience TEXT, 
    license TEXT, 
    photo TEXT, 
    photourl TEXT,
    specialty TEXT,
    rating NUMERIC,
    activeteams JSONB,
    phone TEXT,
    email TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS upcoming_matches (
    id TEXT PRIMARY KEY, 
    tournament TEXT, 
    rival TEXT, 
    rivallogo TEXT, 
    date TEXT, 
    time TEXT, 
    venue TEXT, 
    category TEXT, 
    result TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS match_results (
    id TEXT PRIMARY KEY, 
    tournament TEXT, 
    rival TEXT, 
    rivallogo TEXT,
    score TEXT, 
    date TEXT, 
    category TEXT, 
    result TEXT, 
    scorers JSONB, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS gallery (
    id TEXT PRIMARY KEY, 
    type TEXT, 
    url TEXT, 
    title TEXT, 
    thumbnail TEXT,
    category TEXT, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS financials (
    id TEXT PRIMARY KEY, 
    player TEXT, 
    date TEXT, 
    amount NUMERIC, 
    type TEXT, 
    status TEXT, 
    description TEXT,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS schedules (
    id TEXT PRIMARY KEY, 
    title TEXT, 
    date TEXT, 
    time TEXT, 
    category TEXT, 
    coach TEXT, 
    field TEXT, 
    activity TEXT,
    venue TEXT,
    status TEXT, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS scouting (
    id TEXT PRIMARY KEY, 
    name TEXT, 
    position TEXT, 
    currentteam TEXT, 
    price TEXT, 
    status TEXT, 
    rating NUMERIC, 
    match_rating NUMERIC, 
    photo TEXT, 
    notes TEXT,
    age NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS medicals (
    id TEXT PRIMARY KEY, 
    name TEXT, 
    playername TEXT,
    position TEXT, 
    injury TEXT, 
    estimatedreturn TEXT, 
    status TEXT, 
    progress NUMERIC, 
    photo TEXT, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS training_materials (
    id TEXT PRIMARY KEY, 
    title TEXT, 
    category TEXT, 
    description TEXT, 
    duration TEXT, 
    age_group TEXT, 
    level TEXT, 
    media_url TEXT, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS attendance (
    id TEXT PRIMARY KEY, 
    player_id TEXT, 
    date TEXT, 
    status TEXT, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS tactics (
    id TEXT PRIMARY KEY, 
    formation JSONB, 
    mode TEXT, 
    strategy TEXT, 
    notes TEXT, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. DISABLE RLS & PERMISSIVE POLICIES (CRITICAL for data sync from AI Studio)
DO $$ 
DECLARE 
    t text;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' 
    LOOP
        EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', t);
        EXECUTE format('DROP POLICY IF EXISTS "Allow All" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Allow All Auth" ON %I', t);
        EXECUTE format('CREATE POLICY "Allow All" ON %I FOR ALL TO anon USING (true) WITH CHECK (true)', t);
        EXECUTE format('CREATE POLICY "Allow All Auth" ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true)', t);
    END LOOP;
END $$;

-- 4. STORAGE BUCKETS (CRITICAL for settings & images)
-- Jalankan ini di SQL Editor untuk membuat bucket otomatis
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('players', 'players', true),
  ('settings', 'settings', true),
  ('gallery', 'gallery', true),
  ('coaches', 'coaches', true),
  ('dashboard', 'dashboard', true),
  ('matches', 'matches', true),
  ('materials', 'materials', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Grant access policies to storage for public buckets
-- Remove existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow All Storage" ON storage.objects;
DROP POLICY IF EXISTS "Permissive Upload" ON storage.objects;

-- Create a single permissive policy for the MVP
CREATE POLICY "Allow All Storage" ON storage.objects 
FOR ALL TO anon, authenticated, public 
USING (bucket_id IN ('players', 'settings', 'gallery', 'coaches', 'dashboard', 'matches', 'materials')) 
WITH CHECK (bucket_id IN ('players', 'settings', 'gallery', 'coaches', 'dashboard', 'matches', 'materials'));
  `;

  const syncToCloud = async () => {
      if (!isDbConfigured) return;
      setIsSyncing(true);
      setSyncStatus('Menganalisa tabel data lokal...');
      
      const tables = [
        'players', 'dashboard_sliders', 'coaches', 
        'upcoming_matches', 'match_results', 'gallery', 
        'financials', 'schedules', 'scouting', 'medicals',
        'training_materials', 'attendance', 'tactics'
      ];
      
      const allowedColumns: Record<string, string[]> = {
        players: ['id', 'name', 'overall', 'category', 'position', 'photo', 'photourl', 'dribbling', 'passing', 'shooting', 'pace', 'strength', 'tactical', 'vision', 'teamwork', 'goals', 'assists', 'appearances', 'attendance', 'age', 'height', 'weight', 'dominantfoot', 'dob', 'stamina', 'jersey', 'status', 'created_at', 'parent_id', 'skillset'],
        dashboard_sliders: ['id', 'title', 'subtitle', 'description', 'img', 'media_type', 'video_url', 'autoplay', 'loop', 'created_at'],
        coaches: ['id', 'name', 'role', 'experience', 'license', 'photourl', 'photo', 'specialty', 'rating', 'activeteams', 'phone', 'email', 'created_at'],
        upcoming_matches: ['id', 'tournament', 'rival', 'rivallogo', 'date', 'time', 'venue', 'category', 'result', 'created_at'],
        match_results: ['id', 'tournament', 'rival', 'rivallogo', 'score', 'date', 'category', 'result', 'scorers', 'created_at'],
        gallery: ['id', 'type', 'url', 'title', 'category', 'thumbnail', 'created_at'],
        financials: ['id', 'player', 'date', 'amount', 'type', 'status', 'description', 'category', 'created_at'],
        schedules: ['id', 'title', 'date', 'time', 'category', 'coach', 'field', 'status', 'venue', 'activity', 'created_at'],
        scouting: ['id', 'name', 'position', 'currentteam', 'price', 'status', 'rating', 'match_rating', 'photo', 'notes', 'age', 'created_at'],
        medicals: ['id', 'name', 'position', 'injury', 'estimatedreturn', 'status', 'progress', 'photo', 'playername', 'created_at'],
        training_materials: ['id', 'title', 'category', 'description', 'duration', 'age_group', 'level', 'media_url', 'created_at'],
        attendance: ['id', 'player_id', 'date', 'status', 'created_at'],
        tactics: ['id', 'name', 'mode', 'formation_id', 'strategy', 'positions', 'paths', 'is_template', 'created_at']
      };
      
      try {
         for (const table of tables) {
             setSyncStatus(`Syncing tabel ${table}...`);
             const localData = localStorage.getItem(`cms_${table}`);
             if (localData) {
                 try {
                     const parsed = JSON.parse(localData);
                     if (parsed && Array.isArray(parsed) && parsed.length > 0) {
                         const chunkSize = 20;
                         for (let i = 0; i < parsed.length; i += chunkSize) {
                             const chunk = parsed.slice(i, i + chunkSize).map(item => {
                                 const temp: any = { ...item };
                                 
                                 // Mappings for UI -> DB inconsistency
                                 if ('desc' in temp) temp.description = temp.desc;
                                 if ('match' in temp) temp.match_rating = temp.match;
                                 if ('birth' in temp) temp.dob = temp.birth;
                                 if ('team' in temp) temp.currentteam = temp.team;
                                 if ('returnDate' in temp) temp.estimatedreturn = temp.returnDate;
                                 if ('rivalLogo' in temp) temp.rivallogo = temp.rivalLogo;
                                 if ('photoUrl' in temp) temp.photourl = temp.photoUrl;
                                 if ('dominantFoot' in temp) temp.dominantfoot = temp.dominantFoot;
                                 if ('activeTeams' in temp) temp.activeteams = temp.activeTeams;
                                 if ('playerName' in temp) temp.playername = temp.playerName;
                                 if ('estimatedReturn' in temp) temp.estimatedreturn = temp.estimatedReturn;
                                 if ('currentTeam' in temp) temp.currentteam = temp.currentTeam;
                                 if ('specialty' in temp && table === 'coaches' && !temp.role) temp.role = temp.specialty;
                                 if ('role' in temp && table === 'coaches' && !temp.specialty) temp.specialty = temp.role;
                                 if ('photo' in temp && !temp.photourl) temp.photourl = temp.photo;
                                 if ('photourl' in temp && !temp.photo) temp.photo = temp.photourl;

                                 // Final Sanitization: Lowercase keys and remove any field not in allowedColumns
                                 const sanitized: any = {};
                                 const allowed = allowedColumns[table];
                                 if (allowed) {
                                     Object.keys(temp).forEach(key => {
                                         const lowKey = key.toLowerCase();
                                         if (allowed.includes(lowKey)) {
                                             sanitized[lowKey] = temp[key];
                                         }
                                     });
                                 }
                                 
                                 if (!sanitized.id) sanitized.id = Math.random().toString(36).substring(2, 11);
                                 if (!sanitized.created_at) sanitized.created_at = new Date().toISOString();

                                 return sanitized;
                             });

                             const { error } = await supabase.from(table.trim()).upsert(chunk, { onConflict: 'id' });
                             if (error) {
                                if (error.code === 'PGRST125') {
                                  throw new Error(`URL Supabase salah atau Tabel '${table}' tidak ditemukan. Paste kembali SQL script di bawah.`);
                                }
                                if (error.code === 'PGRST204') {
                                  throw new Error(`Kolom di tabel '${table}' tidak lengkap (PGRST204: ${error.message}). JALANKAN ULANG SQL script di bawah.`);
                                }
                                if (error.code === '42501') {
                                  throw new Error(`Akses ditolak ke '${table}' (RLS Policy 42501). JALANKAN ULANG bagian DISABLE RLS di SQL script.`);
                                }
                                throw new Error(`[Supabase Error] ${error.message} (Code: ${error.code})`);
                             }
                          }
                      }
                  } catch (parseError: any) {
                      console.error(`Failed to sync ${table}:`, parseError);
                      setSyncStatus(`Error ${table}: ${parseError.message}`);
                      setIsSyncing(false);
                      return;
                  }
              }
          }
          
          // Also sync settings
          setSyncStatus('Syncing pengaturan aplikasi...');
          const settingsObj = { appName, logoUrl, heroBgUrl };
          const blob = new Blob([JSON.stringify(settingsObj)], { type: 'application/json' });
          await supabase.storage.from('settings').upload('global_settings.json', blob, { upsert: true });
          
          // Sync settings to table
          await supabase.from('settings').upsert({
            id: 'main',
            app_name: appName,
            logo_url: logoUrl,
            hero_bg_url: heroBgUrl,
            updated_at: new Date().toISOString()
          });

          setSyncStatus('Sinkronisasi selesai!');
          setTimeout(() => setSyncStatus(''), 4000);
      } catch(e: any) {
          setSyncStatus(`Error: ${e.message}`);
      } finally {
          setIsSyncing(false);
      }
  };

  return (
    <Layout>
      <div className="max-w-4xl space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-display font-bold text-glow uppercase tracking-tight flex items-center gap-3">
              <SettingsIcon className="w-8 h-8 text-[var(--color-primary)]" />
              PENGATURAN APLIKASI
            </h1>
            <p className="text-white/40 text-sm mt-2">Atur identitas akademi dan tampilan aplikasi</p>
          </div>
          <div className="flex items-center gap-3">
             <button 
                onClick={handleReset}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-2"
             >
                <Trash2 className="w-4 h-4" /> Reset Default
             </button>
             <button 
                onClick={handleSave}
                className="glow-button !py-2 flex items-center gap-2"
             >
                {isSaved ? <CheckCircle2 className="w-4 h-4 text-black" /> : <Save className="w-4 h-4 text-black" />}
                {isSaved ? 'Tersimpan' : 'Simpan Perubahan'}
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Status Database */}
          <div className="space-y-6">
             <h3 className="text-xs font-black uppercase text-[var(--color-primary)] tracking-[0.3em] flex items-center gap-3">
                <Database className="w-4 h-4" /> STATUS SISTEM & DATABASE <div className="h-px flex-1 bg-gradient-to-r from-[var(--color-primary)]/20 to-transparent" />
             </h3>
             
             <div className={`glass-card p-6 border-l-4 ${isDbConfigured ? 'border-l-emerald-500' : 'border-l-amber-500'}`}>
               <div className="flex items-start gap-4">
                 <div className={`p-3 rounded-full ${isDbConfigured ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'}`}>
                   {isDbConfigured ? <Cloud className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
                 </div>
                 <div className="flex-1">
                   <h4 className="text-lg font-bold text-white mb-1">
                     {isDbConfigured ? 'Database Cloud Supabase Aktif' : 'Mode Penyimpanan Lokal (Risiko Data Hilang)'}
                   </h4>
                   {isDbConfigured ? (
                     <div className="space-y-4">
                       <p className="text-sm text-white/60">
                         Aplikasi berhasil terhubung ke server Supabase. Agar data dari AI Studio (Local Storage) bisa tampil saat aplikasi ini di-deploy ke Vercel, jalankan panduan ini.
                       </p>
                       <div className="bg-black/50 p-4 border border-white/10 rounded-xl space-y-4">
                          <div>
                             <h5 className="text-[var(--color-primary)] text-xs font-bold uppercase mb-2 flex items-center gap-2"><Code className="w-4 h-4" /> 1. Execute SQL Tables</h5>
                             <p className="text-[10px] text-white/50 mb-2">Buka dashboard Supabase -&gt; SQL Editor, dan paste kode berikut agar Supabase dapat menyimpan data (wajib sebelum sinkronisasi):</p>
                             <textarea 
                                readOnly 
                                value={sqlSchema} 
                                className="w-full h-24 bg-white/5 border border-white/10 rounded text-xs text-emerald-400 p-2 font-mono"
                             />
                          </div>
                          <div>
                             <h5 className="text-[var(--color-primary)] text-xs font-bold uppercase mb-2">2. Publish Data</h5>
                             <p className="text-[10px] text-white/50 mb-2">Pindahkan semua data dari Storage Browser (AI Studio) Anda ke Server Supabase Database.</p>
                             <div className="flex flex-col gap-3">
                               <button
                                  onClick={syncToCloud}
                                  disabled={isSyncing}
                                  className="px-4 py-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-400 hover:text-black font-bold text-xs rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                               >
                                  {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cloud className="w-4 h-4" />}
                                  Push Data AI Studio ke Supabase
                               </button>
                               <button
                                  onClick={syncImagesToCloud}
                                  disabled={isSyncing}
                                  className="px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-400 hover:text-black font-bold text-xs rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                               >
                                  {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                  Sinkronisasi Gambar (Lokal ke Cloud)
                               </button>
                               <button
                                  onClick={clearImageCache}
                                  className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-400 hover:text-black font-bold text-xs rounded transition-colors flex items-center justify-center gap-2"
                               >
                                  <Trash2 className="w-4 h-4" />
                                  Bersihkan Cache Gambar Lokal (Fix Quota)
                               </button>
                            </div>
                             {syncStatus && <span className="ml-3 text-xs text-yellow-500">{syncStatus}</span>}
                          </div>
                       </div>
                     </div>
                   ) : (
                     <div className="space-y-3">
                       <p className="text-sm text-white/60">
                         Saat ini aplikasi menyimpan data menggunakan browser (Local Storage). Ini berarti saat di deploy ke <strong>Vercel</strong>, semua datanya akan TAMPIL KOSONG.
                       </p>
                       <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                         <h5 className="text-xs font-bold text-[var(--color-primary)] uppercase mb-2">Cara Mengatasi (Agar Data Muncul di Vercel):</h5>
                         <ol className="list-decimal pl-4 text-xs text-white/70 space-y-2">
                           <li>Buat proyek baru di <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 underline">Supabase.com</a>.</li>
                           <li>Buka menu <strong>Storage</strong> di Supabase dan buat bucket-bucket berikut (Set as **Public**):</li>
                             <div className="flex flex-wrap gap-2 mt-2">
                               {['players', 'settings', 'gallery', 'coaches', 'dashboard', 'matches', 'materials'].map(b => (
                                 <span key={b} className="font-mono text-[10px] text-emerald-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">{b}</span>
                               ))}
                             </div>
                           <li className="text-yellow-400 font-bold">Pastikan Bucket Policies diubah menjadi PUBLIC agar gambar muncul di Vercel.</li>
                           <li>Masukkan <strong>VITE_SUPABASE_URL</strong> dan <strong>VITE_SUPABASE_ANON_KEY</strong> ke Environment Variables Vercel & AI Studio Anda.</li>
                         </ol>
                       </div>
                     </div>
                   )}
                 </div>
               </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Identitas Aplikasi */}
          <div className="space-y-6">
             <h3 className="text-xs font-black uppercase text-[var(--color-primary)] tracking-[0.3em] flex items-center gap-3">
                <Palette className="w-4 h-4" /> IDENTITAS AKADEMI <div className="h-px flex-1 bg-gradient-to-r from-[var(--color-primary)]/20 to-transparent" />
             </h3>

             <div className="glass-card p-6 space-y-6">
                {/* Nama Aplikasi */}
                <div className="space-y-2">
                   <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Nama Akademi</label>
                   <input
                     type="text"
                     value={localAppName}
                     onChange={(e) => setLocalAppName(e.target.value)}
                     className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[var(--color-primary)]/50 focus:bg-white/10 transition-all font-display font-bold text-lg"
                     placeholder="SSB BANTANG JUNIOR"
                   />
                </div>

                {/* Logo Upload */}
                <div className="space-y-3">
                   <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Logo Akademi</label>
                   
                   <div className="flex items-center gap-4">
                     <div className="w-20 h-20 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden relative">
                       {isUploadingLogo && (
                         <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                           <Loader2 className="w-5 h-5 text-[var(--color-primary)] animate-spin" />
                         </div>
                       )}
                       {localLogoUrl ? (
                         <img src={localLogoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                       ) : (
                         <ImageIcon className="w-8 h-8 text-white/20" />
                       )}
                     </div>
                     
                     <div className="flex flex-col gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          ref={fileInputRef}
                          className="hidden"
                          id="logo-upload"
                        />
                        <label 
                          htmlFor="logo-upload"
                          className="px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-2 w-fit"
                        >
                           <Upload className="w-3.5 h-3.5" /> Upload Logo
                        </label>
                        {localLogoUrl && (
                          <button 
                            onClick={handleRemoveLogo}
                            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 w-fit"
                          >
                             <X className="w-3.5 h-3.5" /> Hapus Logo
                          </button>
                        )}
                     </div>
                   </div>
                   <p className="text-[10px] text-white/30 tracking-wide mt-2">
                      Upload gambar logo resolusi tinggi (PNG/JPG transparan direkomendasikan).
                   </p>
                </div>

                {/* Hero Background Upload */}
                <div className="space-y-3 pt-6 border-t border-white/5">
                   <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Background Hero (Landing Page)</label>
                   
                   <div className="space-y-4">
                     <div className="w-full h-32 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden relative group">
                       {isUploadingHero && (
                         <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                           <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
                         </div>
                       )}
                       {localHeroBgUrl ? (
                         <img src={localHeroBgUrl} alt="Hero BG" className="w-full h-full object-cover" />
                       ) : (
                         <div className="flex flex-col items-center gap-2">
                            <ImageIcon className="w-8 h-8 text-white/20" />
                            <span className="text-[10px] text-white/30 font-bold">TIDAK ADA BACKGROUND</span>
                         </div>
                       )}
                       <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleHeroBgChange}
                            ref={heroBgInputRef}
                            className="hidden"
                            id="hero-bg-upload"
                          />
                          <label 
                            htmlFor="hero-bg-upload"
                            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg cursor-pointer transition-colors"
                            title="Upload Background"
                          >
                             <Upload className="w-5 h-5 text-white" />
                          </label>
                          {localHeroBgUrl && (
                            <button 
                              onClick={handleRemoveHeroBg}
                              className="p-2 bg-red-500/40 hover:bg-red-500/60 rounded-lg transition-colors"
                              title="Hapus Background"
                            >
                               <X className="w-5 h-5 text-white" />
                            </button>
                          )}
                       </div>
                     </div>
                     
                     <div className="flex justify-between items-center">
                        <p className="text-[10px] text-white/30 tracking-wide max-w-[200px]">
                           Upload gambar lanskap untuk background Landing Page. Maks. 3MB.
                        </p>
                        <label 
                          htmlFor="hero-bg-upload"
                          className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-widest cursor-pointer hover:underline"
                        >
                           Ganti Gambar
                        </label>
                     </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Preview */}
          <div className="space-y-6">
             <h3 className="text-xs font-black uppercase text-[var(--color-primary)] tracking-[0.3em] flex items-center gap-3">
                PREVIEW <div className="h-px flex-1 bg-gradient-to-r from-[var(--color-primary)]/20 to-transparent" />
             </h3>

             <div className="glass-card p-8 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-navy-dark)] to-[var(--color-navy)]/10" />
                
                <div className="relative z-10 flex flex-col items-center gap-6 text-center">
                   <div className={`w-32 h-32 rounded-3xl flex items-center justify-center overflow-hidden ${localLogoUrl ? '' : 'bg-[var(--color-primary)] shadow-[0_0_30px_var(--color-primary-glow)]'}`}>
                      {localLogoUrl ? (
                        <img src={localLogoUrl} alt="Logo Preview" className="w-full h-full object-contain drop-shadow-2xl" />
                      ) : (
                        <span className="text-black font-black text-4xl">{localAppName.charAt(0) || 'B'}</span>
                      )}
                   </div>
                   <div>
                     <h2 className="text-2xl font-display font-bold text-[var(--color-primary)]">{localAppName || 'Menu'}</h2>
                     <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mt-2">Academy Management</p>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Integration Guide */}
        <div className="space-y-6">
           <h3 className="text-xs font-black uppercase text-[var(--color-primary)] tracking-[0.3em] flex items-center gap-3">
              <Server className="w-4 h-4" /> INTEGRASI GITHUB & VERCEL <div className="h-px flex-1 bg-gradient-to-r from-[var(--color-primary)]/20 to-transparent" />
           </h3>

           <div className="glass-card p-8 space-y-8 border-t-2 border-t-[var(--color-primary)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                          <span className="font-bold text-xs text-white">01</span>
                       </div>
                       <h4 className="font-bold text-white uppercase text-sm">GitHub Export</h4>
                    </div>
                    <p className="text-xs text-white/50 leading-relaxed">
                       Gunakan menu <strong>Project Settings -&gt; Export to GitHub</strong> di AI Studio untuk memindahkan kode ini ke repositori Anda sendiri. GitHub akan menjadi pusat sinkronisasi kode antara AI Studio dan Vercel.
                    </p>
                 </div>

                 <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/20 flex items-center justify-center">
                          <span className="font-bold text-xs text-[var(--color-primary)]">02</span>
                       </div>
                       <h4 className="font-bold text-white uppercase text-sm">Vercel Deployment</h4>
                    </div>
                    <p className="text-xs text-white/50 leading-relaxed">
                       Hubungkan repositori GitHub Anda ke <strong>Vercel</strong>. Pastikan Anda menambahkan Environment Variables berikut di dashboard Vercel:
                    </p>
                    <div className="space-y-2">
                       <div className="flex items-center justify-between p-2 bg-black/40 rounded border border-white/5 font-mono text-[10px]">
                          <span className="text-white/40">VITE_SUPABASE_URL</span>
                          <span className="text-emerald-400 font-bold">Your_URL</span>
                       </div>
                       <div className="flex items-center justify-between p-2 bg-black/40 rounded border border-white/5 font-mono text-[10px]">
                          <span className="text-white/40">VITE_SUPABASE_ANON_KEY</span>
                          <span className="text-emerald-400 font-bold">Your_Key</span>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-4">
                 <AlertTriangle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                 <div>
                    <h5 className="text-xs font-bold text-blue-400 uppercase mb-1">Penting: Data & Image Sync</h5>
                    <p className="text-[10px] text-white/60 leading-relaxed">
                       Aplikasi di Vercel/GitHub akan otomatis menampilkan data dan gambar dari Supabase (bukan AI Studio). Pastikan Anda telah menekan tombol <span className="text-emerald-400 font-black">SINKRONISASI</span> di atas sebelum mengekspor kode.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </Layout>

  );
}

