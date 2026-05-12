import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Image as ImageIcon, 
  Video, 
  Filter, 
  Maximize2, 
  Download,
  Share2,
  Calendar,
  Layers,
  Heart,
  Edit2,
  Trash2,
  Save,
  Play
} from 'lucide-react';
import Layout from '../components/ui/Layout';
import { cn } from '../lib/utils';
import { useCMSData } from '../lib/store';
import { uploadFile, uploadRawFile } from '../lib/supabase';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Loader2, X } from 'lucide-react';

const getMediaDetails = (url: string, type: string) => {
  let category = type || 'image';
  let thumbnailUrl = '';
  let embedUrl = url;

  if (!url) return { type: category, thumbnailUrl, embedUrl };

  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    category = 'youtube';
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('youtu.be/')[1]?.split('?')[0] || url.split('embed/')[1]?.split('?')[0];
    if (videoId) {
      thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0&modestbranding=1`;
    }
  } else if (url.includes('drive.google.com')) {
    category = 'drive';
    const fileId = url.match(/\/d\/(.+?)(\/|$)/)?.[1];
    if (fileId) {
      thumbnailUrl = `https://drive.google.com/thumbnail?id=${fileId}`;
      embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
    }
  } else {
    thumbnailUrl = url;
  }

  return { type: category, thumbnailUrl, embedUrl };
};

const categories = ['All', 'Training', 'Matches', 'Events', 'Highlights', 'Documentation'];

export default function Gallery() {
  const { data: media, addItems, updateItem, deleteItem, isLoading } = useCMSData('gallery', []);
  const [activeTab, setActiveTab] = useState('All');
  const [mediaTypeFilter, setMediaTypeFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: '', title: '' });
  const [formData, setFormData] = useState({
    title: '', category: 'Training', type: 'image', media_url: '', thumbnail_url: ''
  });
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);

  const filteredMedia = media.filter((m: any) => 
    (activeTab === 'All' || m.category === activeTab) &&
    (mediaTypeFilter === 'All' || (mediaTypeFilter === 'Photo' ? m.type === 'image' : m.type !== 'image'))
  );

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({ title: '', category: 'Training', type: 'image', media_url: '', thumbnail_url: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingItem(item);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const details = getMediaDetails(formData.media_url, formData.type);
    const finalData = {
      ...formData,
      type: details.type,
      thumbnail_url: details.thumbnailUrl || formData.thumbnail_url
    };

    if (editingItem) {
      updateItem(editingItem.id, finalData);
    } else {
      addItems(finalData);
    }
    setIsModalOpen(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        let publicUrl;
        if (file.type.startsWith('video/')) {
          publicUrl = await uploadRawFile(file, 'gallery');
        } else {
          publicUrl = await uploadFile(file, 'gallery');
        }
        
        if (publicUrl) {
          const type = file.type.startsWith('video/') ? 'video' : 'image';
          setFormData({ ...formData, media_url: publicUrl, thumbnail_url: publicUrl, type });
        }
      } catch (error) {
        console.error("Upload failed:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDelete = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirm({ isOpen: true, id, title });
  };

  return (
    <Layout>
      <div className="space-y-10 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-display font-bold text-glow uppercase tracking-tight">MEDIA ARCHIVE</h1>
            <p className="text-white/40 text-sm">CMS Admin: Data tersimpan permanen di database Supabase.</p>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={handleOpenAdd} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] !py-2 px-6 rounded-xl flex items-center gap-2 transition-all font-semibold uppercase tracking-wider text-xs">
                <Plus className="w-4 h-4" /> Upload Media
             </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="glass-card p-4 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
              {categories.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setActiveTab(cat)}
                  className={cn(
                    "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                    activeTab === cat ? "bg-[var(--color-primary)] text-black shadow-[0_0_15px_var(--color-primary-glow)]" : "bg-white/5 text-white/40 hover:text-white"
                  )}
                >
                  {cat}
                </button>
              ))}
              <div className="h-6 w-px bg-white/10 mx-2" />
              {['All', 'Photo', 'Video'].map(type => (
                <button
                  key={type}
                  onClick={() => setMediaTypeFilter(type)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                    mediaTypeFilter === type ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
                  )}
                >
                  {type}
                </button>
              ))}
           </div>
           
           <div className="flex items-center gap-2 w-full md:w-auto">
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white/40">
                 <Filter className="w-4 h-4" /> Sort By Newest
              </button>
           </div>
        </div>

        {/* Media Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-[4/5] rounded-[2rem] bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredMedia.map((item: any) => {
              const { embedUrl, thumbnailUrl } = getMediaDetails(item.media_url, item.type);
              const displayThumbnail = item.thumbnail_url || thumbnailUrl;
              
              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={item.id}
                  className="glass-card group overflow-hidden relative cursor-pointer"
                  onClick={() => { setSelectedMedia({...item, embedUrl}); setIsDetailModalOpen(true); }}
                >
                     <div className="aspect-[4/5] overflow-hidden relative">
                      {item.type === 'video' && !item.media_url?.includes('youtube.com') && !item.media_url?.includes('youtu.be') && !item.media_url?.includes('drive.google.com') ? (
                          <video 
                             src={item.media_url} 
                             className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                             muted
                             playsInline
                          />
                      ) : (
                          <img 
                             src={displayThumbnail || null} 
                             alt={item.title} 
                             className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                             onError={(e) => {
                               (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&q=80&w=1000';
                             }}
                          />
                      )}
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                         <div className="absolute top-4 right-4 flex flex-col gap-2">
                            <button onClick={(e) => handleOpenEdit(item, e)} className="p-2 backdrop-blur-md bg-black/40 rounded-xl border border-white/20 hover:bg-blue-500 hover:text-white transition-all text-blue-400">
                               <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={(e) => handleDelete(item.id, item.title, e)} className="p-2 backdrop-blur-md bg-black/40 rounded-xl border border-white/20 hover:bg-red-500 hover:text-white transition-all text-red-400">
                               <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 bg-white/20 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                           <Play className="w-6 h-6 text-white fill-white" />
                         </div>

                         <div className="absolute bottom-6 left-6 right-6">
                            <div className="flex items-center gap-2 mb-2">
                               <span className="text-[10px] font-black uppercase text-white/80 tracking-widest bg-black/40 px-2 py-1 rounded">
                                 {item.type.toUpperCase()}
                               </span>
                               <span className="text-[10px] font-black uppercase text-white/60 tracking-widest">{item.category}</span>
                            </div>
                            <h3 className="text-lg font-display font-bold leading-tight text-white">{item.title}</h3>
                         </div>
                      </div>
                      
                      {/* Static indicator for videos */}
                      {item.type !== 'image' && (
                        <div className="absolute top-4 left-4 p-2 bg-red-600 rounded">
                           <Video className="w-3 h-3 text-white" />
                        </div>
                      )}
                   </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Load More */}
        <div className="flex justify-center mt-12">
           <button className="px-10 py-3 rounded-full border border-white/10 hover:bg-white/5 transition-all text-sm font-bold uppercase tracking-widest text-white/40">
              Muat Lebih Banyak
           </button>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Media" : "Upload New Media"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center mb-6">
            <div className="relative group w-full h-48">
              <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-white/10 group-hover:border-blue-500 transition-colors relative">
                {isUploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  </div>
                )}
                {formData.media_url ? (
                  formData.type === 'video' && !formData.media_url.includes('youtube.com') && !formData.media_url.includes('youtu.be') && !formData.media_url.includes('drive.google.com') ? (
                    <video src={formData.media_url} className="w-full h-full object-cover" muted playsInline />
                  ) : (
                    <img src={getMediaDetails(formData.media_url, formData.type).thumbnailUrl || formData.thumbnail_url || null} alt="Preview" className="w-full h-full object-cover" />
                  )
                ) : (
                  <div className="w-full h-full bg-white/5 flex flex-col items-center justify-center text-white/20">
                    <ImageIcon className="w-8 h-8 mb-2" />
                    <span className="text-xs">Pilih Gambar atau Video</span>
                  </div>
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10">
                <div className="bg-[var(--color-primary)] text-black px-4 py-2 rounded-xl font-bold flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Pilih File
                </div>
                <input type="file" accept="image/*,video/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">URL Media (Image/YouTube/Drive)</label>
              <input type="text" value={formData.media_url} onChange={(e) => setFormData({...formData, media_url: e.target.value})} className="w-full bg-surface-raised border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]" placeholder="https://..." />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Judul Media</label>
              <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-surface-raised border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]" placeholder="Cth: Full Training Day" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Kategori</label>
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-surface-raised border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]">
                  {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Tipe Sumber</label>
                <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value as any})} className="w-full bg-surface-raised border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]">
                  <option value="image">Image / Local Upload</option>
                  <option value="youtube">YouTube</option>
                  <option value="drive">Google Drive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
             <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-colors">
               Batal
             </button>
             <button type="submit" className="flex-1 py-3 rounded-xl bg-[var(--color-primary)] text-black font-bold text-sm hover:shadow-[0_0_20px_var(--color-primary-glow)] transition-all">
               {editingItem ? 'Simpan' : 'Simpan ke Database'}
             </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal 
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '', title: '' })}
        onConfirm={() => deleteItem(deleteConfirm.id)}
        message={`Yakin ingin menghapus media "${deleteConfirm.title}"?`}
      />

      {/* DETAIL VIEW MODAL */}
      <AnimatePresence>
        {isDetailModalOpen && selectedMedia && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setIsDetailModalOpen(false)} />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
            >
               <button 
                 onClick={() => setIsDetailModalOpen(false)}
                 className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 border border-white/10 text-white/50 hover:text-white hover:bg-red-500/20 transition-all"
               >
                 <X className="w-5 h-5" />
               </button>

               {selectedMedia.type === 'youtube' || selectedMedia.type === 'drive' ? (
                 <iframe 
                   src={selectedMedia.embedUrl} 
                   className="w-full h-full border-none" 
                   allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
                   allowFullScreen
                 />
               ) : selectedMedia.type === 'video' ? (
                 <video src={selectedMedia.media_url} className="w-full h-full object-contain" controls autoPlay playsInline />
               ) : (
                 <img src={selectedMedia.media_url || null} className="w-full h-full object-contain" alt={selectedMedia.title} />
               )}

               <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none">
                  <span className="inline-block px-3 py-1 bg-[var(--color-primary)] text-black text-[10px] font-black uppercase tracking-widest rounded-full mb-3">{selectedMedia.category}</span>
                  <h2 className="text-2xl font-display font-black text-white uppercase">{selectedMedia.title}</h2>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}

