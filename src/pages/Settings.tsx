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
    
    // Save to Supabase Storage if configured
    if (isSupabaseConfigured()) {
       try {
          const settingsObj = {
             appName: localAppName,
             logoUrl: localLogoUrl,
             heroBgUrl: localHeroBgUrl
          };
          const blob = new Blob([JSON.stringify(settingsObj)], { type: 'application/json' });
          const { error } = await supabase.storage.from('settings').upload('global_settings.json', blob, { upsert: true });
          
          if (error) {
            console.error("Supabase Storage Error:", error);
            // Check if it's a "bucket not found" error
            if (error.message.includes('not found') || error.message.includes('bucket')) {
              alert("PERINGATAN: Pengaturan tersimpan secara lokal tapi GAGAL dikirim ke Cloud karena bucket 'settings' tidak ditemukan di Supabase. Orang lain mungkin tidak akan melihat perubahan ini.");
            } else {
              alert("Gagal sinkronisasi ke Cloud: " + error.message);
            }
          }
       } catch(e: any) {
          console.error("Failed to save settings to Supabase", e);
          alert("Gelar kesalahan sinkronisasi Cloud: " + (e.message || "Pastikan Supabase Anda sudah benar."));
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
      } catch (error) {
        console.error("Upload failed:", error);
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
      } catch (error) {
        console.error("Upload failed:", error);
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
-- Supabase SQL Editor Script
-- Paste this script to SQL Editor in your Supabase Dashboard to create tables for data sync.

CREATE TABLE IF NOT EXISTS players (id TEXT PRIMARY KEY, name TEXT, overall NUMERIC, category TEXT, position TEXT, photo TEXT, dribbling NUMERIC, passing NUMERIC, shooting NUMERIC, pace NUMERIC, strength NUMERIC, tactical NUMERIC, vision NUMERIC, teamwork NUMERIC, goals NUMERIC, assists NUMERIC, appearances NUMERIC, attendance NUMERIC, age NUMERIC, height NUMERIC, weight NUMERIC, dominantFoot TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL);
CREATE TABLE IF NOT EXISTS dashboard_sliders (id TEXT PRIMARY KEY, title TEXT, subtitle TEXT, description TEXT, img TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL);
CREATE TABLE IF NOT EXISTS coaches (id TEXT PRIMARY KEY, name TEXT, role TEXT, experience TEXT, license TEXT, photoUrl TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL);
CREATE TABLE IF NOT EXISTS upcoming_matches (id TEXT PRIMARY KEY, tournament TEXT, rival TEXT, rivalLogo TEXT, date TEXT, time TEXT, venue TEXT, category TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL);
CREATE TABLE IF NOT EXISTS match_results (id TEXT PRIMARY KEY, tournament TEXT, rival TEXT, score TEXT, date TEXT, category TEXT, result TEXT, scorers JSONB, created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL);
CREATE TABLE IF NOT EXISTS gallery (id TEXT PRIMARY KEY, type TEXT, url TEXT, title TEXT, category TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL);
CREATE TABLE IF NOT EXISTS financials (id TEXT PRIMARY KEY, player TEXT, date TEXT, amount NUMERIC, type TEXT, status TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL);
CREATE TABLE IF NOT EXISTS schedules (id TEXT PRIMARY KEY, title TEXT, date TEXT, time TEXT, category TEXT, coach TEXT, field TEXT, status TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL);
CREATE TABLE IF NOT EXISTS scouting (id TEXT PRIMARY KEY, name TEXT, position TEXT, currentTeam TEXT, price TEXT, status TEXT, rating NUMERIC, match_rating NUMERIC, photo TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL);
CREATE TABLE IF NOT EXISTS medicals (id TEXT PRIMARY KEY, name TEXT, position TEXT, injury TEXT, estimatedReturn TEXT, status TEXT, progress NUMERIC, photo TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL);
CREATE TABLE IF NOT EXISTS training_materials (id TEXT PRIMARY KEY, title TEXT, category TEXT, description TEXT, duration TEXT, age_group TEXT, level TEXT, media_url TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL);
CREATE TABLE IF NOT EXISTS attendance (id TEXT PRIMARY KEY, player_id TEXT, date TEXT, status TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL);
CREATE TABLE IF NOT EXISTS tactics (id TEXT PRIMARY KEY, formation JSONB, mode TEXT, strategy TEXT, notes TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL);
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
      
      try {
         for (const table of tables) {
             setSyncStatus(`Syncing tabel ${table}...`);
             const localData = localStorage.getItem(`cms_${table}`);
             if (localData) {
                 try {
                     const parsed = JSON.parse(localData);
                     if (parsed && Array.isArray(parsed) && parsed.length > 0) {
                         // Chunk the upserts to avoid payload limits
                         const chunkSize = 20;
                         for (let i = 0; i < parsed.length; i += chunkSize) {
                             const chunk = parsed.slice(i, i + chunkSize).map(item => {
                                 const cleaned = { ...item };
                                 if ('desc' in cleaned) {
                                     cleaned.description = cleaned.desc;
                                     delete cleaned.desc;
                                 }
                                 if ('match' in cleaned) {
                                     cleaned.match_rating = cleaned.match;
                                     delete cleaned.match;
                                 }
                                 return cleaned;
                             });

                             const { error } = await supabase.from(table.trim()).upsert(chunk, { onConflict: 'id' });
                             if (error) {
                                if (error.code === 'PGRST125') {
                                  throw new Error(`[Supabase Error] URL Supabase tidak valid atau Tabel '${table}' belum dibuat. Pastikan URL hanya berisi https://xxx.supabase.co dan Anda sudah menjalankan SQL Script di atas.`);
                                }
                                throw new Error(`[Supabase Error] ${error.message} (Code: ${error.code})`);
                             }
                         }
                     }
                 } catch (parseError) {
                     console.error(`Failed to parse local data for ${table}:`, parseError);
                 }
             }
         }
         
         // Also sync settings
         setSyncStatus('Syncing pengaturan aplikasi...');
         const settingsObj = { appName, logoUrl, heroBgUrl };
         const blob = new Blob([JSON.stringify(settingsObj)], { type: 'application/json' });
         await supabase.storage.from('settings').upload('global_settings.json', blob, { upsert: true });

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
                <div className="absolute inset-0 bg-gradient-to-br from-[#0B1120] to-[#172554]/20" />
                
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
      </div>
    </Layout>
  );
}

