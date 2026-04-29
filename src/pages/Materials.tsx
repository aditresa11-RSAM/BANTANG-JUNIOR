import React, { useState } from 'react';
import Layout from '../components/ui/Layout';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Plus, Search, Filter, Edit2, Trash2, Clock, 
  Dumbbell, Brain, HeartPulse, Shield, Star, PlayCircle, 
  FileText, ChevronRight, Loader2, Image as ImageIcon,
  MoreVertical, Calendar, User
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useCMSData } from '../lib/store';
import { Modal } from '../components/ui/Modal';
import { uploadFile } from '../lib/supabase';

const TRAINING_CATEGORIES = [
  { id: 'technique', name: 'Teknik Dasar', icon: Star, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { id: 'physical', name: 'Fisik', icon: Dumbbell, color: 'text-red-400', bg: 'bg-red-400/10' },
  { id: 'tactic', name: 'Taktik', icon: Brain, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { id: 'mental', name: 'Mental', icon: HeartPulse, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { id: 'goalkeeper', name: 'Goalkeeper', icon: Shield, color: 'text-amber-400', bg: 'bg-amber-400/10' },
];

export default function Materials() {
  const [filterTab, setFilterTab] = useState('All');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const { data: materials, addItems: addMaterial, updateItem: updateMaterial, deleteItem: deleteMaterial } = useCMSData('training_materials', []);
  
  const [formData, setFormData] = useState({
    title: '', category: 'technique', description: '', duration: '60 mnt', age_group: 'U12', level: 'Beginner', media_url: ''
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const publicUrl = await uploadFile(file, 'materials');
        if (publicUrl) {
          setFormData({ ...formData, media_url: publicUrl });
        }
      } catch (error) {
        console.error("Upload failed:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const filteredMaterials = materials.filter(m => {
    const matchCat = filterTab === 'All' || m.category === filterTab;
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase()) || m.description?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateMaterial(editing.id, formData);
    } else {
      addMaterial({ ...formData });
    }
    setIsModalOpen(false);
  };

  const openAdd = () => {
    setEditing(null);
    setFormData({title:'', category:'technique', description:'', duration:'60 mnt', age_group:'U12', level:'Beginner', media_url:''});
    setIsModalOpen(true);
  };

  const openEdit = (m: any) => {
    setEditing(m);
    setFormData(m);
    setIsModalOpen(true);
  };

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-display font-black text-white tracking-tight uppercase flex items-center gap-3">
              Materi <span className="text-[var(--color-primary)]">Latihan</span>
            </h1>
            <p className="text-sm text-white/40 font-medium uppercase tracking-widest flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[var(--color-primary)]" />
              Library Kurikulum & Materi Drill
            </p>
          </div>

          <button 
            onClick={openAdd}
            className="w-full lg:w-auto px-8 py-4 bg-[var(--color-primary)] text-black font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-yellow-500 transition-all shadow-[0_10px_30px_rgba(250,204,21,0.2)] flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" /> Tambah Materi Baru
          </button>
        </div>

        {/* FILTERS & SEARCH */}
        <div className="glass-card p-4 rounded-3xl border border-white/10 flex flex-col xl:flex-row items-center gap-4">
          <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5 overflow-x-auto hide-scrollbar w-full xl:w-auto">
            <button 
              onClick={() => setFilterTab('All')} 
              className={cn(
                "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap", 
                filterTab === 'All' ? "bg-white/10 text-white shadow-xl" : "text-white/30 hover:text-white/60"
              )}
            >
              Semua Materi
            </button>
            {TRAINING_CATEGORIES.map(cat => (
              <button 
                key={cat.id} 
                onClick={() => setFilterTab(cat.id)} 
                className={cn(
                  "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap", 
                  filterTab === cat.id ? "bg-white/10 text-white shadow-xl" : "text-white/30 hover:text-white/60"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input 
              type="text" 
              placeholder="Cari materi, teknik, atau drill..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[var(--color-primary)] transition-all" 
            />
          </div>
        </div>

        {/* MATERIALS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredMaterials.map((m, idx) => {
              const category = TRAINING_CATEGORIES.find(c => c.id === m.category) || TRAINING_CATEGORIES[0];
              const Icon = category.icon;
              
              return (
                <motion.div 
                  key={m.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-card group rounded-[2rem] overflow-hidden border border-white/5 hover:border-[var(--color-primary)]/30 transition-all duration-500 flex flex-col h-full shadow-xl"
                >
                  <div className="h-48 bg-black/40 relative overflow-hidden">
                    <img 
                      src={m.media_url || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=600"} 
                      className="w-full h-full object-cover opacity-60 group-hover:scale-110 group-hover:opacity-80 transition-all duration-1000" 
                      alt={m.title} 
                    />
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#0a0a0c] to-transparent" />
                    
                    <div className="absolute top-4 left-4 flex gap-2">
                       <span className={cn("px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest backdrop-blur-md border border-white/10", category.bg, category.color)}>
                         {category.name}
                       </span>
                    </div>

                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 duration-300">
                       <button onClick={() => openEdit(m)} className="p-2 bg-white/10 hover:bg-blue-500 rounded-xl text-white backdrop-blur-md border border-white/20 transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                       <button onClick={() => deleteMaterial(m.id)} className="p-2 bg-white/10 hover:bg-red-500 rounded-xl text-white backdrop-blur-md border border-white/20 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4">
                       <h3 className="text-sm font-black text-white uppercase tracking-tight line-clamp-1 mb-1 group-hover:text-[var(--color-primary)] transition-colors">{m.title}</h3>
                       <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-white/40 flex items-center gap-1 uppercase tracking-widest"><Clock className="w-3 h-3" /> {m.duration}</span>
                          <span className="text-[10px] font-bold text-white/40 flex items-center gap-1 uppercase tracking-widest"><User className="w-3 h-3" /> {m.age_group}</span>
                       </div>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col bg-surface/50">
                    <p className="text-xs text-white/40 leading-relaxed line-clamp-3 mb-6 font-medium italic">"{m.description}"</p>
                    <div className="mt-auto flex items-center justify-between">
                       <div className="flex gap-1.5">
                          <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                             <Icon className={cn("w-3 h-3", category.color)} />
                          </div>
                          <span className="text-[9px] font-black text-white/60 uppercase tracking-widest leading-[24px]">{m.level}</span>
                       </div>
                       <button className="flex items-center gap-1.5 text-[9px] font-black text-[var(--color-primary)] uppercase tracking-widest hover:gap-3 transition-all">
                          Lihat Detail <ChevronRight className="w-3 h-3" />
                       </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredMaterials.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
            <BookOpen className="w-16 h-16 text-white/5 mb-6" />
            <p className="text-lg font-black text-white/10 uppercase tracking-[0.3em]">Materi tidak tersedia</p>
          </div>
        )}

        {/* MODAL FORM */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? "EDIT MATERI LATIHAN" : "TAMBAH MATERI BARU"}>
          <form onSubmit={handleSubmit} className="p-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">Judul Materi</label>
                <input required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all" placeholder="Contoh: Tactical Pressure Drill" />
              </div>

              <div>
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">Kategori Latihan</label>
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-[var(--color-primary)] appearance-none">
                  {TRAINING_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">Usia Target</label>
                <select value={formData.age_group} onChange={(e) => setFormData({...formData, age_group: e.target.value})} className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]">
                  <option value="U8">U8</option>
                  <option value="U9">U9</option>
                  <option value="U10">U10</option>
                  <option value="U11">U11</option>
                  <option value="U12">U12</option>
                  <option value="U13">U13</option>
                  <option value="U14">U14</option>
                  <option value="U15">U15</option>
                  <option value="All">Semua Usia</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">Instruksi & Deskripsi</label>
                <textarea required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full h-32 bg-black/60 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-[var(--color-primary)] resize-none" placeholder="Tulis instruksi detail materi di sini..." />
              </div>

              <div>
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">Estimasi Durasi</label>
                <input value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]" placeholder="Contoh: 45 mnt" />
              </div>

              <div>
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">Level Kesulitan</label>
                <input value={formData.level} onChange={(e) => setFormData({...formData, level: e.target.value})} className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]" placeholder="Beginner / Advanced" />
              </div>

              <div className="col-span-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">Thumbnail / Media</label>
                <div className="flex gap-4 items-center">
                  <div className="w-24 h-24 rounded-3xl bg-black border border-white/10 overflow-hidden relative group">
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                        <Loader2 className="w-6 h-6 text-[var(--color-primary)] animate-spin" />
                      </div>
                    )}
                    {formData.media_url ? (
                      <img src={formData.media_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/5"><ImageIcon className="w-8 h-8" /></div>
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <input value={formData.media_url} onChange={(e) => setFormData({...formData, media_url: e.target.value})} className="w-full bg-black/60 border border-white/10 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-[var(--color-primary)]" placeholder="URL Gambar atau upload..." />
                    <label className="block w-full py-2.5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-center cursor-pointer hover:bg-[var(--color-primary)] hover:text-black hover:border-transparent transition-all uppercase tracking-widest">
                       Upload File Media
                       <input type="file" accept="image/*,video/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 flex gap-4">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="flex-1 py-4 text-xs font-black text-white/40 border border-white/10 rounded-2xl hover:bg-white/5 transition-all uppercase tracking-[0.2em]"
              >
                Batalkan
              </button>
              <button 
                type="submit" 
                className="flex-1 py-4 text-xs font-black text-black bg-[var(--color-primary)] rounded-2xl hover:bg-yellow-500 transition-all uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(250,204,21,0.2)]"
              >
                Simpan Materi
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
}
