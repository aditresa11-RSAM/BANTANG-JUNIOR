import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Layout from '../components/ui/Layout';
import { useCMSData } from '../lib/store';
import { uploadRawFile, supabase } from '../lib/supabase';
import { 
  Image as ImageIcon, Video, Youtube, Plus, Edit2, Trash2, 
  Save, X, MoveUp, MoveDown, Eye, ToggleLeft, ToggleRight, 
  Upload, Cloud, AlertCircle, CheckCircle2, PlayCircle
} from 'lucide-react';
import ReactPlayer from 'react-player';

export interface HeroManagement {
  id: string;
  title: string;
  subtitle: string;
  hero_type: 'image' | 'video' | 'youtube' | 'gdrive';
  image_url: string;
  video_url: string;
  youtube_url: string;
  gdrive_url: string;
  thumbnail_url: string;
  cta_primary_text: string;
  cta_primary_link: string;
  overlay_color: string;
  overlay_opacity: number;
  text_position: 'left' | 'center' | 'right';
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export default function ManageHero() {
  const { 
    data: heroesRaw, 
    addItems: addHero, 
    updateItem: updateHero, 
    deleteItem: removeHero,
    isLoading: loading 
  } = useCMSData<HeroManagement>('hero_management', []);

  const [orderedHeroes, setOrderedHeroes] = useState<HeroManagement[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<HeroManagement>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toastMessage, setToastMessage] = useState<{title: string, type: 'success' | 'error'} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (heroesRaw) {
      setOrderedHeroes([...heroesRaw].sort((a, b) => (a.order_index || 0) - (b.order_index || 0)));
    }
  }, [heroesRaw]);

  const showToast = (title: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ title, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenModal = (hero?: HeroManagement) => {
    if (hero) {
      setEditingId(hero.id);
      setFormData(hero);
    } else {
      setEditingId(null);
      setFormData({
        hero_type: 'image',
        image_url: '',
        video_url: '',
        youtube_url: '',
        gdrive_url: '',
        title: '',
        subtitle: '',
        cta_primary_text: 'GABUNG SEKARANG',
        cta_primary_link: '/register-player',
        overlay_color: '#000000',
        overlay_opacity: 60,
        text_position: 'center',
        is_active: true,
        order_index: orderedHeroes.length,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({});
    setUploadProgress(0);
  };

  const validateYoutubeUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&mute=1&loop=1&playlist=${match[2]}&controls=0&rel=0&modestbranding=1` : url;
  };

  const validateGdriveUrl = (url: string) => {
    if (url.includes('drive.google.com/file/d/')) {
      const match = url.match(/d\/([a-zA-Z0-9_-]+)/);
      return match ? `https://drive.google.com/file/d/${match[1]}/preview` : url;
    }
    return url;
  };

  const handleSave = async () => {
    const errorMsg = () => {
      const t = formData.hero_type;
      if (t === 'image' && !formData.image_url) return 'Media gambar wajib diisi/upload!';
      if (t === 'video' && !formData.video_url) return 'Media video wajib diisi/upload!';
      if (t === 'youtube' && !formData.youtube_url) return 'Link YouTube wajib diisi!';
      if (t === 'gdrive' && !formData.gdrive_url) return 'Link Google Drive wajib diisi!';
      return null;
    };

    const err = errorMsg();
    if (err) return showToast(err, 'error');

    let finalData = { ...formData, updated_at: new Date().toISOString() };
    
    if (finalData.hero_type === 'youtube' && finalData.youtube_url) {
      finalData.youtube_url = validateYoutubeUrl(finalData.youtube_url);
    } else if (finalData.hero_type === 'gdrive' && finalData.gdrive_url) {
      finalData.gdrive_url = validateGdriveUrl(finalData.gdrive_url);
    }

    try {
      if (editingId) {
        await updateHero(editingId, finalData);
        showToast('Hero berhasil diperbarui');
      } else {
        await addHero({
          ...finalData,
          created_at: new Date().toISOString()
        } as Omit<HeroManagement, 'id'>);
        showToast('Hero berhasil ditambahkan');
      }
      handleCloseModal();
    } catch (e: any) {
      showToast("Gagal menyimpan data: " + e.message, 'error');
    }
  };

  const handleDelete = async (hero: HeroManagement) => {
    if(!window.confirm('Yakin ingin menghapus media hero ini? File yang terupload (jika ada) di database Supabase juga akan dihapus permanen.')) return;

    setIsDeleting(hero.id);
    try {
      // 1. Delete from storage if it's an uploaded file
      const tryDeleteStorage = async (url: string, bucket: string) => {
        if (!url || !url.includes('supabase.co')) return;
        try {
          const [, path] = url.split(`/storage/v1/object/public/${bucket}/`);
          if (path) {
            await supabase.storage.from(bucket).remove([path]);
          }
        } catch (e) {
          console.warn('Gagal menghapus file storage', e);
        }
      };

      if (hero.hero_type === 'image' && hero.image_url) await tryDeleteStorage(hero.image_url, 'dashboard');
      if (hero.hero_type === 'video' && hero.video_url) await tryDeleteStorage(hero.video_url, 'dashboard');

      // 2. Delete from Database
      await removeHero(hero.id);
      showToast('Hero berhasil dihapus permanen');
    } catch (e: any) {
      showToast('Gagal menghapus hero: ' + e.message, 'error');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (formData.hero_type === 'image' && !file.type.startsWith('image/')) {
      return showToast('Hanya file gambar (JPG, PNG, WEBP) yang diperbolehkan', 'error');
    }
    if (formData.hero_type === 'video' && !file.type.startsWith('video/')) {
      return showToast('Hanya file video (MP4, WEBM) yang diperbolehkan', 'error');
    }

    setIsUploading(true);
    setUploadProgress(10);
    try {
      // simulate progress
      const progressInterval = setInterval(() => setUploadProgress(p => Math.min(p + 15, 90)), 300);
      const url = await uploadRawFile(file, 'dashboard');
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (url) {
        if (formData.hero_type === 'image') setFormData(prev => ({ ...prev, image_url: url }));
        if (formData.hero_type === 'video') setFormData(prev => ({ ...prev, video_url: url }));
        showToast('File berhasil diupload dan diamankan di Storage');
      }
    } catch (error: any) {
      showToast('Upload gagal: ' + error.message, 'error');
    } finally {
      setTimeout(() => { setIsUploading(false); setUploadProgress(0); }, 500);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const moveOrder = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === orderedHeroes.length - 1) return;

    const newOrdered = [...orderedHeroes];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    const tempIndex = newOrdered[index].order_index;
    newOrdered[index].order_index = newOrdered[swapIndex].order_index;
    newOrdered[swapIndex].order_index = tempIndex;

    await updateHero(newOrdered[index].id, { order_index: newOrdered[index].order_index });
    await updateHero(newOrdered[swapIndex].id, { order_index: newOrdered[swapIndex].order_index });
  };

  const toggleActive = async (hero: HeroManagement) => {
    await updateHero(hero.id, { is_active: !hero.is_active });
  };

  const renderMiniPreview = (hero: Partial<HeroManagement>) => {
    const url = 
      hero.hero_type === 'image' ? hero.image_url : 
      hero.hero_type === 'video' ? hero.video_url : 
      hero.hero_type === 'youtube' ? hero.youtube_url : 
      hero.gdrive_url;

    const hasMedia = !!url;

    return (
      <div className="w-full h-full bg-[#0a0f1c] relative border border-white/5 rounded-xl overflow-hidden shadow-inner flex shrink-0">
        {hasMedia ? (
          <>
            {hero.hero_type === 'image' && (
              <img src={url} alt="hero" className="absolute inset-0 w-full h-full object-cover" />
            )}
            {hero.hero_type === 'youtube' && (
              <div className="absolute inset-0 w-full h-[150%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <ReactPlayer
                  url={url} width="100%" height="100%"
                  playing muted loop playsinline
                  config={{ youtube: { playerVars: { disablekb: 1, rel: 0, showinfo: 0, modestbranding: 1 } } }}
                />
              </div>
            )}
            {hero.hero_type === 'video' && (
              <video src={url} className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop playsInline />
            )}
            {hero.hero_type === 'gdrive' && (
              <iframe src={validateGdriveUrl(url || '')} className="absolute inset-0 w-full h-full border-0 pointer-events-none object-cover" allow="autoplay" />
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-primary)]/5">
             <span className="text-white/20 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
               <AlertCircle className="w-4 h-4" /> Media Kosong
             </span>
          </div>
        )}

        <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: `linear-gradient(to top, ${hero.overlay_color}${Math.floor((hero.overlay_opacity || 60) * 2.55).toString(16).padStart(2, '0')}, transparent)` }} />
        
        <div className={`absolute inset-0 z-20 flex flex-col justify-center p-6 w-full pointer-events-none
          ${hero.text_position === 'left' ? 'items-start text-left' : hero.text_position === 'right' ? 'items-end text-right' : 'items-center text-center'}
        `}>
          <h3 className="text-white font-display font-black text-xl lg:text-3xl drop-shadow-lg mb-2 line-clamp-2" dangerouslySetInnerHTML={{ __html: (hero.title || 'Judul Hero').replace(/\n/g, '<br />') }} />
          <p className="text-white/80 text-xs max-w-sm drop-shadow mb-4 line-clamp-2">{hero.subtitle || 'Deskripsi slider hero disini'}</p>
          {hero.cta_primary_text && (
            <div className="px-4 py-2 bg-gradient-to-r from-[var(--color-primary)] to-[#c59c25] rounded-lg text-black font-bold text-[10px] uppercase shadow-lg">
              {hero.cta_primary_text}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto space-y-8 pb-32 pt-6 lg:px-8 w-full max-w-[1400px]">
        
        {/* Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-3 backdrop-blur-md border border-white/20
                ${toastMessage.type === 'success' ? 'bg-emerald-500/90 text-white' : 'bg-rose-500/90 text-white'}
              `}
            >
              {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {toastMessage.title}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-black text-white uppercase tracking-tight flex items-center gap-3">
              <ImageIcon className="w-8 h-8 text-[var(--color-primary)]" />
              Hero Management
            </h1>
            <p className="text-white/40 text-sm mt-1">Kelola gambar/video background halaman utama landing page terhubung dengan Supabase.</p>
          </div>
          <button onClick={() => handleOpenModal()} className="px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-yellow-500 font-bold text-black flex items-center gap-2 hover:scale-105 transition-transform uppercase tracking-wider text-sm shadow-[0_10px_30px_rgba(234,179,8,0.2)]">
            <Plus className="w-5 h-5 text-black" /> Tambah Hero
          </button>
        </div>

        {orderedHeroes.length === 0 ? (
          <div className="glass-card p-12 text-center flex flex-col items-center">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 shadow-inner">
              <ImageIcon className="w-10 h-10 text-[var(--color-primary)]/50" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Belum Ada Media Layar Utama</h3>
            <p className="text-white/40 text-sm mb-6 max-w-md mx-auto">Upload gambar hero, video MP4, atau link YouTube untuk mempercantik halaman depan.</p>
            <button onClick={() => handleOpenModal()} className="px-6 py-3 bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/30 hover:bg-[var(--color-primary)] hover:text-black rounded-xl font-bold transition-all uppercase tracking-wider text-xs">
              Mulai Konfigurasi Hero
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
            {orderedHeroes.map((hero, index) => (
              <div key={hero.id} className={`glass-card p-4 sm:p-6 flex flex-col sm:flex-row gap-6 border transition-all 
                ${hero.is_active ? 'border-white/10 hover:border-[var(--color-primary)]/30 hover:bg-white-[0.02]' : 'border-red-500/30 bg-red-900/10 opacity-70'}
              `}>
                <div className="w-full sm:w-64 h-48 sm:h-full shrink-0 relative rounded-xl overflow-hidden shadow-xl group cursor-pointer block">
                  {renderMiniPreview(hero)}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity" onClick={() => handleOpenModal(hero)}>
                    <Edit2 className="w-8 h-8 text-white drop-shadow-md" />
                  </div>
                </div>

                <div className="flex-1 min-w-0 flex flex-col h-full space-y-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest bg-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center gap-1.5 shadow-sm">
                         {hero.hero_type === 'image' && <ImageIcon className="w-3 h-3" />}
                         {hero.hero_type === 'video' && <Video className="w-3 h-3" />}
                         {hero.hero_type === 'youtube' && <Youtube className="w-3 h-3" />}
                         {hero.hero_type === 'gdrive' && <Cloud className="w-3 h-3" />}
                         {hero.hero_type}
                      </span>
                      {!hero.is_active && <span className="text-[9px] uppercase font-bold px-2 py-1 rounded bg-rose-500/20 text-rose-400">NONAKTIF</span>}
                    </div>
                    <div>
                      <h4 className="text-xl font-display font-bold text-white leading-tight line-clamp-2">{hero.title || 'Tanpa Judul'}</h4>
                      <p className="text-sm text-white/50 line-clamp-2 mt-1">{hero.subtitle || 'Tidak ada deskripsi subtitle / kosong'}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 w-full pt-4 border-t border-white/5">
                    <div className="flex items-center mr-auto bg-black/40 rounded-lg p-0.5 border border-white/5">
                      <button onClick={() => moveOrder(index, 'up')} disabled={index === 0} className="p-2 hover:bg-white/10 rounded-md text-white/40 hover:text-white disabled:opacity-20 transition-colors">
                        <MoveUp className="w-4 h-4" />
                      </button>
                      <div className="w-px h-4 bg-white/5 mx-1" />
                      <button onClick={() => moveOrder(index, 'down')} disabled={index === orderedHeroes.length - 1} className="p-2 hover:bg-white/10 rounded-md text-white/40 hover:text-white disabled:opacity-20 transition-colors">
                        <MoveDown className="w-4 h-4" />
                      </button>
                    </div>

                    <button onClick={() => toggleActive(hero)} className={`px-3 sm:px-4 py-2.5 flex items-center justify-center gap-2 rounded-xl text-xs font-bold border transition-all
                      ${hero.is_active ? 'bg-white/5 border-white/10 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 text-white/70' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'}`
                    }>
                      {hero.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      <span className="hidden sm:inline">{hero.is_active ? 'Disable' : 'Enable'}</span>
                    </button>
                    <button onClick={() => handleOpenModal(hero)} className="px-3 sm:px-4 py-2.5 flex items-center justify-center gap-2 rounded-xl text-xs font-bold bg-white/5 border border-white/10 hover:bg-blue-500/20 hover:text-blue-400 hover:border-blue-500/30 transition-all text-white/70">
                      <Edit2 className="w-4 h-4" /> <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button onClick={() => handleDelete(hero)} disabled={isDeleting === hero.id} className="p-2.5 flex items-center justify-center gap-2 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                      {isDeleting === hero.id ? <div className="w-4 h-4 rounded-full border-2 border-rose-500/30 border-t-rose-500 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 perspective-[1000px]">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-[#060c18]/90 backdrop-blur-md"
              onClick={handleCloseModal}
            />
            
            <motion.div 
              initial={{ opacity: 0, rotateX: 10, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, rotateX: -10, y: 40, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-[#0c162d] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)] rounded-[2rem] w-full max-w-7xl max-h-[92vh] overflow-y-auto overflow-x-hidden relative z-10 custom-scrollbar flex flex-col"
            >
              <div className="sticky top-0 z-50 bg-[#0c162d]/90 backdrop-blur-xl border-b border-white/5 p-6 lg:px-10 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-[var(--color-primary)] to-emerald-500 rounded-xl relative shadow-[0_5px_20px_rgba(234,179,8,0.3)]">
                    <Edit2 className="w-6 h-6 text-black relative z-10" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">{editingId ? 'Edit Hero' : 'Tambah Hero'}</h2>
                    <p className="text-white/40 text-[11px] uppercase tracking-wider font-bold">Sinkronisasi Database Aktif</p>
                  </div>
                </div>
                <button onClick={handleCloseModal} className="p-3 bg-white/5 hover:bg-rose-500 hover:text-white rounded-full transition-all text-white/50 group">
                  <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>

              <div className="p-6 lg:p-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                
                {/* Editor Column */}
                <div className="lg:col-span-5 space-y-8 h-full flex flex-col">
                  
                  {/* Media Type Selector */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" /> Tipe Konten Media
                    </label>
                    <div className="grid grid-cols-4 gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5 shadow-inner">
                      {[
                        { id: 'image', icon: ImageIcon, label: 'Image' },
                        { id: 'video', icon: Video, label: 'Video MP4' },
                        { id: 'youtube', icon: Youtube, label: 'YouTube' },
                        { id: 'gdrive', icon: Cloud, label: 'GDrive' }
                      ].map((t) => (
                        <button 
                          key={t.id}
                          onClick={() => setFormData({...formData, hero_type: t.id as any})} 
                          className={`py-3.5 px-2 rounded-xl text-[10px] font-bold uppercase transition-all flex flex-col items-center justify-center gap-2 
                            ${formData.hero_type === t.id ? 'bg-[var(--color-primary)] text-black shadow-md scale-[1.02]' : 'text-white/40 hover:bg-white/10 hover:text-white transform-none'}
                          `}
                        >
                          <t.icon className={`w-5 h-5 ${formData.hero_type === t.id ? 'text-black' : ''}`} /> 
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Media Input */}
                  <div className="space-y-4 p-5 bg-white-[0.02] border border-white/5 rounded-3xl">
                    <div className="flex items-center justify-between mb-1">
                       <label className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">Sumber File URL</label>
                    </div>
                    
                    {(formData.hero_type === 'image' || formData.hero_type === 'video') && (
                      <div className="relative group">
                        <div 
                          onClick={() => !isUploading && fileInputRef.current?.click()}
                          className={`w-full h-36 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-all overflow-hidden relative
                            ${isUploading ? 'border-[var(--color-primary)] bg-gradient-to-t from-[var(--color-primary)]/10 to-transparent cursor-wait' : 'border-white/10 bg-black/40 hover:bg-white/5 hover:border-[var(--color-primary)]/50'}
                          `}
                        >
                          {isUploading ? (
                            <>
                              <div className="w-12 h-12 border-[3px] border-[var(--color-primary)]/20 border-t-[var(--color-primary)] rounded-full animate-spin z-10" />
                              <span className="text-[var(--color-primary)] text-xs font-bold uppercase tracking-widest z-10 shadow-black drop-shadow-md">Mengupload {uploadProgress}%</span>
                              <div className="absolute inset-0 bg-[#0c162d]/50 animate-pulse" />
                            </>
                          ) : (
                            <>
                              <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center group-hover:scale-110 transition-transform group-hover:bg-[var(--color-primary)] group-hover:text-black">
                                <Upload className="w-5 h-5" />
                              </div>
                              <div className="text-center">
                                <span className="text-white/80 text-xs font-bold block mb-1 mt-1 font-sans">Pilih atau letakkan file {formData.hero_type === 'image' ? 'Gambar' : 'Video MP4'} disini</span>
                                <span className="text-white/30 text-[10px] uppercase font-bold tracking-wider">Storage Aman & Cepat</span>
                              </div>
                            </>
                          )}
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept={formData.hero_type === 'image' ? 'image/jpeg,image/png,image/webp' : 'video/mp4,video/webm'} />
                        
                        {/* URL Check Indicator */}
                        {((formData.hero_type === 'image' && formData.image_url) || (formData.hero_type === 'video' && formData.video_url)) && !isUploading && (
                           <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 mt-3 rounded-xl flex items-center justify-between text-xs font-bold">
                             <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Tersimpan di Cloud Storage</span>
                             <button onClick={() => fileInputRef.current?.click()} className="text-white hover:text-[var(--color-primary)] transition-colors underline decoration-[var(--color-primary)] underline-offset-4">Ganti</button>
                           </div>
                        )}
                      </div>
                    )}
                    
                    {formData.hero_type === 'youtube' && (
                      <div className="relative">
                        <div className="absolute top-1/2 -translate-y-1/2 left-4">
                           <Youtube className="w-5 h-5 text-red-500" />
                        </div>
                        <input type="text" value={formData.youtube_url || ''} onChange={(e) => setFormData({...formData, youtube_url: e.target.value})} placeholder="https://youtube.com/watch?v=..." className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pr-4 pl-12 text-white font-mono text-sm focus:border-red-500 outline-none transition-colors" />
                      </div>
                    )}
                    {formData.hero_type === 'gdrive' && (
                      <div className="relative">
                        <div className="absolute top-1/2 -translate-y-1/2 left-4">
                           <Cloud className="w-5 h-5 text-emerald-500" />
                        </div>
                        <input type="text" value={formData.gdrive_url || ''} onChange={(e) => setFormData({...formData, gdrive_url: e.target.value})} placeholder="https://drive.google.com/file/d/..." className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pr-4 pl-12 text-white font-mono text-sm focus:border-emerald-500 outline-none transition-colors" />
                      </div>
                    )}
                  </div>

                  <hr className="border-t border-white/5 my-2" />

                  <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Teks Besar</label>
                      <textarea 
                        value={formData.title || ''}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="Judul Hero Menarik\nBisa dua baris"
                        rows={2}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-display font-black text-lg sm:text-xl focus:border-[var(--color-primary)] outline-none resize-none transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Deskripsi Tambahan</label>
                      <textarea 
                        value={formData.subtitle || ''}
                        onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                        placeholder="Kalimat detail atau slogan tambahan yang akan tampil di bawah judul utama..."
                        rows={3}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white text-sm focus:border-[var(--color-primary)] outline-none resize-none transition-colors"
                      />
                    </div>
                  </div>

                </div>

                {/* Preview & Style Configuration Column */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                  
                  {/* Realtime Landing Page Preview */}
                  <div className="flex-1 min-h-[350px] relative bg-black rounded-[2rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col group p-1.5">
                     <div className="absolute top-6 left-6 z-40 bg-black/60 backdrop-blur-md rounded-full px-4 py-1.5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-primary)] flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> Live Rendering
                     </div>
                     
                     <div className="w-full h-full rounded-[1.5rem] overflow-hidden relative pointer-events-none">
                        {renderMiniPreview(formData)}
                     </div>
                  </div>

                  {/* Settings Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-auto bg-white/[0.02] p-5 rounded-[2rem] border border-white/5">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Interaksi Tombol Utama</label>
                      <div className="space-y-2">
                        <input type="text" value={formData.cta_primary_text || ''} onChange={(e) => setFormData({...formData, cta_primary_text: e.target.value})} placeholder="Label: DAFTAR SEKARANG" className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 px-5 text-white text-sm font-bold focus:border-[var(--color-primary)] outline-none transition-colors" />
                        <input type="text" value={formData.cta_primary_link || ''} onChange={(e) => setFormData({...formData, cta_primary_link: e.target.value})} placeholder="URL: /halaman-tujuan" className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 px-5 text-white/60 font-mono text-sm focus:border-[var(--color-primary)] outline-none transition-colors" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Tata Letak Visual</label>
                      <div className="bg-black/40 p-3 rounded-xl border border-white/5 flex flex-col gap-3">
                        <div className="flex items-center gap-3 w-full bg-white/5 rounded-lg p-2">
                           <input type="color" value={formData.overlay_color || '#000000'} onChange={(e) => setFormData({...formData, overlay_color: e.target.value})} className="w-10 h-10 rounded shrink-0 cursor-pointer bg-transparent border-0 p-0" />
                           <div className="flex-1 px-1">
                             <div className="flex justify-between text-[10px] text-white/50 mb-2 font-bold uppercase tracking-wider">
                               GELAP <span className="text-[var(--color-primary)]">{formData.overlay_opacity || 0}%</span>
                             </div>
                             <input type="range" min="0" max="100" value={formData.overlay_opacity || 0} onChange={(e) => setFormData({...formData, overlay_opacity: parseInt(e.target.value)})} className="w-full accent-[var(--color-primary)]" />
                           </div>
                        </div>
                        <div className="flex bg-white/5 p-1 rounded-lg">
                          {['left', 'center', 'right'].map((pos) => (
                            <button key={pos} onClick={() => setFormData({...formData, text_position: pos as any})} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-md transition-all ${formData.text_position === pos ? 'bg-white text-black shadow-md scale-100' : 'text-white/40 hover:bg-white/10 scale-95'}`}>
                              {pos}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              <div className="sticky bottom-0 z-50 bg-[#0c162d]/90 backdrop-blur-xl border-t border-white/5 p-6 lg:px-10 flex justify-end gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                <button onClick={handleCloseModal} className="px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 font-bold transition-all text-sm uppercase tracking-wider text-white/70 min-w-[120px]">
                  Batal
                </button>
                <button onClick={handleSave} disabled={isUploading} className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[#c59c25] font-black text-black flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform uppercase tracking-wider disabled:opacity-50 disabled:cursor-wait min-w-[200px] shadow-[0_10px_30px_rgba(234,179,8,0.2)]">
                  <Save className="w-5 h-5" /> {editingId ? 'Simpan Perubahan' : 'Terbitkan Hero'}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
