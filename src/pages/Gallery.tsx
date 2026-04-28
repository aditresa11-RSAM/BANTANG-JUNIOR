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
import { uploadFile } from '../lib/supabase';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Loader2 } from 'lucide-react';

const initialMedia = [
  { id: '1', type: 'photo', url: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&q=80&w=1000', title: 'Latihan Bersama Coach', category: 'Training' },
  { id: '2', type: 'photo', url: 'https://images.unsplash.com/photo-1517466787929-bc94061c5c50?auto=format&fit=crop&q=80&w=1000', title: 'Trophy Celebration', category: 'Event' },
  { id: '3', type: 'video', url: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&q=80&w=1000', title: 'Top 10 Goals Week 4', category: 'Highlights' },
  { id: '4', type: 'photo', url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1000', title: 'New Facility Launch', category: 'Facility' },
];

const categories = ['All', 'Training', 'Tournament', 'Event', 'Highlights', 'Facility'];

export default function Gallery() {
  const { data: media, addItems, updateItem, deleteItem } = useCMSData('gallery', initialMedia);
  const [activeTab, setActiveTab] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: '', title: '' });
  const [formData, setFormData] = useState({
    title: '', category: 'Training', type: 'photo', url: ''
  });
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);

  const filteredMedia = activeTab === 'All' ? media : media.filter((m: any) => m.category === activeTab);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({ title: '', category: 'Training', type: 'photo', url: '' });
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
    if (editingItem) {
      updateItem(editingItem.id, formData);
    } else {
      addItems({ ...formData, url: formData.url || 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&q=80&w=1000' });
    }
    setIsModalOpen(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const publicUrl = await uploadFile(file, 'gallery');
        if (publicUrl) {
          setFormData({ ...formData, url: publicUrl });
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
            <p className="text-white/40 text-sm">CMS Admin: Kelola arsip visual momen berharga akademi kami.</p>
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
           </div>
           
           <div className="flex items-center gap-2 w-full md:w-auto">
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white/40">
                 <Filter className="w-4 h-4" /> Sort By Newest
              </button>
           </div>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           {filteredMedia.map((item: any) => (
             <motion.div 
               layout
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               key={item.id}
               className="glass-card group overflow-hidden relative"
             >
                <div className="aspect-[4/5] overflow-hidden relative">
                   <img src={item.url} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                   
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

                      <div className="absolute bottom-6 left-6 right-6">
                         <div className="flex items-center gap-2 mb-2">
                            {item.type === 'video' ? <Video className="w-4 h-4 text-red-500" /> : <ImageIcon className="w-4 h-4 text-[var(--color-primary)]" />}
                            <span className="text-[10px] font-black uppercase text-white/60 tracking-widest">{item.category}</span>
                         </div>
                         <h3 className="text-lg font-display font-bold leading-tight text-white">{item.title}</h3>
                      </div>
                   </div>

                   {item.type === 'video' && (
                     <div className="absolute top-4 left-4 p-2 bg-red-600 rounded-lg shadow-lg">
                        <Play className="w-3 h-3 text-white fill-white" />
                     </div>
                   )}
                </div>
             </motion.div>
           ))}
        </div>

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
                {formData.url ? (
                  <img src={formData.url} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-white/5 flex flex-col items-center justify-center text-white/20">
                    <ImageIcon className="w-8 h-8 mb-2" />
                    <span className="text-xs">Pilih Gambar / Frame Video</span>
                  </div>
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <div className="bg-[var(--color-primary)] text-black px-4 py-2 rounded-xl font-bold flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Pilih File
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
          </div>

          <div className="space-y-4">
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
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Jenis Media</label>
                <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full bg-surface-raised border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]">
                  <option value="photo">Photo</option>
                  <option value="video">Video</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
             <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-colors">
               Batal
             </button>
             <button type="submit" className="flex-1 py-3 rounded-xl bg-[var(--color-primary)] text-black font-bold text-sm hover:shadow-[0_0_20px_var(--color-primary-glow)] transition-all">
               {editingItem ? 'Simpan' : 'Upload'}
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
    </Layout>
  );
}

