import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, Edit2, Trash2, Image as ImageIcon, Star, Shield, Award, Calendar, ChevronRight, Loader2, Check, ChevronDown
} from 'lucide-react';
import Layout from '../components/ui/Layout';
import { cn } from '../lib/utils';
import { useCMSData } from '../lib/store';
import { uploadFile } from '../lib/supabase';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';

const initialCoaches = [
  { 
    id: '1', 
    name: 'Andre Wijaya', 
    license: 'Lisensi B', 
    specialty: 'Head Coach', 
    experience: '12', 
    photo: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=600',
    rating: 4.9,
    activeTeams: ['U14-Pro', 'U15-Pro']
  },
  { 
    id: '2', 
    name: 'Sarah Kurniawan', 
    license: 'Lisensi C', 
    specialty: 'Assistant Coach', 
    experience: '8', 
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600',
    rating: 4.8,
    activeTeams: ['U12-Junior', 'U13-Dev']
  },
  { 
    id: '3', 
    name: 'Mike Tyson', 
    license: 'Lisensi D', 
    specialty: 'Fitness Coach', 
    experience: '15', 
    photo: 'https://images.unsplash.com/photo-1533227268408-a7746955c711?auto=format&fit=crop&q=80&w=600',
    rating: 4.9,
    activeTeams: ['All Categories']
  },
  { 
    id: '4', 
    name: 'Budi Hartono', 
    license: 'Coaching Clinic', 
    specialty: 'Goalkeeper Coach', 
    experience: '10', 
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=600',
    rating: 4.7,
    activeTeams: ['GK Academy']
  },
];

export default function Coaches() {
  const { data: coaches, addItems, updateItem, deleteItem } = useCMSData('coaches', initialCoaches);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingCoach, setEditingCoach] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: '', name: '' });
  const [formData, setFormData] = useState({
    name: '', license: '', specialty: '', experience: '', photo: '', rating: 4.5, activeTeams: [] as string[]
  });
  const [isJabatanOpen, setIsJabatanOpen] = useState(false);

  const handleOpenAdd = () => {
    setEditingCoach(null);
    setFormData({ name: '', license: '', specialty: '', experience: '', photo: '', rating: 4.5, activeTeams: [] });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (coach: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingCoach(coach);
    // Normalize data: ensure activeTeams exists and prioritize activeteams if it's from DB
    const normalizedCoach = {
      ...coach,
      activeTeams: Array.isArray(coach.activeTeams) 
        ? coach.activeTeams 
        : (Array.isArray(coach.activeteams) ? coach.activeteams : [])
    };
    setFormData(normalizedCoach);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCoach) {
      updateItem(editingCoach.id, formData);
    } else {
      addItems({ ...formData, id: Date.now().toString(), photo: formData.photo || 'https://images.unsplash.com/photo-1544168190-79c15427015f?auto=format&fit=crop&q=80&w=600' });
    }
    setIsModalOpen(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const publicUrl = await uploadFile(file, 'coaches');
        if (publicUrl) {
          setFormData({ ...formData, photo: publicUrl });
        }
      } catch (error) {
        console.error("Upload failed:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDelete = (id: string, name: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteConfirm({ isOpen: true, id, name });
  };

  return (
    <Layout>
      <div className="space-y-10 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
        {/* Elite Header */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#081225] via-[#0c162d] to-[#050a14] border border-blue-500/10 p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
           <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.1),transparent_50%)] pointer-events-none" />
           <div className="relative z-10">
             <h1 className="text-3xl md:text-4xl font-display font-black text-white uppercase tracking-tighter drop-shadow-lg">STAFF PELATIH</h1>
             <p className="text-blue-400/80 font-medium tracking-widest text-xs mt-1 uppercase">SSB BANTANG JUNIOR</p>
           </div>
           <button onClick={handleOpenAdd} className="relative z-10 w-full md:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] px-6 py-3 rounded-xl justify-center flex items-center gap-2 transition-all font-bold uppercase tracking-wider text-xs border border-blue-400/30">
             <Plus className="w-4 h-4" /> Recuit Coach
           </button>
        </div>

        {/* Coaches Grid (Max 3 per row as requested) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           <AnimatePresence>
             {coaches.map((coach: any) => (
               <motion.div 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={coach.id} 
                className="relative group cursor-pointer"
                onClick={() => navigate(`/coaches/${coach.id}`)}
               >
                  <div className="h-[480px] rounded-3xl overflow-hidden relative shadow-xl border border-white/5 group-hover:border-blue-500/30 transition-all duration-500 bg-gradient-to-br from-[#0c162d] to-[#0a0f1c]">
                     
                     {/* Background & Photo (Full frame) */}
                     <div className="absolute inset-0 bg-[#081225] overflow-hidden">
                        <img src={coach.photo} alt="" className="w-full h-full object-cover opacity-40 blur-2xl scale-150" />
                     </div>
                     <div className="absolute inset-0 flex items-center justify-center p-6 pb-20">
                        <img 
                          src={coach.photo} 
                          alt={coach.name} 
                          className="max-w-full max-h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)] group-hover:scale-110 transition-transform duration-700 ease-out" 
                        />
                     </div>
                     <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#0a0f1c] via-[#0a0f1c]/40 to-transparent opacity-90" />
                     
                     {/* Top Badges */}
                     <div className="absolute top-4 left-4 right-4 flex justify-end z-20">
                        <div className="flex items-center gap-1 bg-[#0a0f1c]/60 backdrop-blur-md px-3 py-1 rounded border border-white/10 text-[10px] font-bold text-white shadow-lg">
                           <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                           {coach.rating}
                        </div>
                     </div>

                     {/* Profile Info (Bottom) */}
                     <div className="absolute bottom-4 left-4 right-4 z-20 transform transition-all duration-500 group-hover:-translate-y-4">
                        <h3 className="text-2xl font-display font-black text-white uppercase tracking-tighter mb-1 drop-shadow-md group-hover:text-blue-400 transition-colors">{coach.name}</h3>
                        <p className="text-xs font-bold text-yellow-500/90 uppercase tracking-widest mb-0.5 flex items-center gap-2">
                           <Shield className="w-3 h-3" /> {coach.specialty || coach.role}
                        </p>
                        <p className="text-[10px] font-black text-blue-400/80 uppercase tracking-[0.2em] mb-3">
                           {coach.license}
                        </p>
                        
                        {/* Hidden on default, slide up on hover */}
                        <div className="h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-500 overflow-hidden">
                           <div className="pt-2 border-t border-white/10 mb-4 grid grid-cols-2 gap-3">
                              <div>
                                 <span className="block text-[9px] uppercase text-white/40 font-bold mb-0.5 tracking-wider">Experience</span>
                                 <span className="text-sm font-bold text-white tracking-widest">{coach.experience} YRS</span>
                              </div>
                              <div>
                                 <span className="block text-[9px] uppercase text-white/40 font-bold mb-0.5 tracking-wider">Squads</span>
                                 <span className="text-xs font-bold text-white/80">{(coach.activeTeams || coach.activeteams)?.length || 0} Teams</span>
                              </div>
                           </div>
                           <button className="w-full py-2.5 rounded-xl bg-blue-600/90 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors">
                              Lihat Profil <ChevronRight className="w-4 h-4" />
                           </button>
                        </div>
                     </div>

                     {/* Action Buttons: Bottom Right, moved up slightly if hovered? Or absolute bottom right fixed. */}
                     {/* The request says "Pojok kanan bawah card, Bulat kecil, icon only, glass transp" */}
                     {/* To avoid overlapping with expanded info, we put them at the very bottom right, z-30 */}
                     <div className="absolute bottom-3 right-3 flex gap-2 z-30 transition-transform duration-500">
                        <button 
                          onClick={(e) => handleOpenEdit(coach, e)} 
                          title="Edit Pelatih"
                          className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-blue-400 hover:bg-blue-500 hover:text-white hover:border-blue-500 hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={(e) => handleDelete(coach.id, coach.name, e)} 
                          title="Hapus Pelatih"
                          className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                     </div>

                  </div>
               </motion.div>
             ))}
           </AnimatePresence>
        </div>

      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCoach ? "EDIT DATA PELATIH" : "RECRUIT NEW COACH"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-white/10 group-hover:border-blue-500 transition-colors bg-[#0a0f1c] relative">
                {isUploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                  </div>
                )}
                {formData.photo ? (
                  <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
              </div>
              <label className="absolute -bottom-3 -right-3 p-2 bg-blue-600 text-white rounded-xl cursor-pointer hover:scale-110 transition-transform shadow-lg border border-blue-400/30">
                <Plus className="w-4 h-4 font-bold" />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Nama Lengkap</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="Cth: Andre Wijaya" />
            </div>
            
            <div className="col-span-2 md:col-span-1">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Lisensi Kepelatihan</label>
              <select required value={formData.license} onChange={(e) => setFormData({...formData, license: e.target.value})} className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500">
                <option value="">Pilih Lisensi Pelatih</option>
                <option value="Lisensi B">Lisensi B</option>
                <option value="Lisensi C">Lisensi C</option>
                <option value="Lisensi D">Lisensi D</option>
                <option value="Coaching Clinic">Coaching Clinic</option>
              </select>
            </div>

            <div className="col-span-2 md:col-span-2 relative">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Jabatan (Pilih 1 atau Lebih)</label>
              
              <div 
                className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus-within:border-blue-500 cursor-pointer min-h-[44px] relative"
                onClick={() => setIsJabatanOpen(!isJabatanOpen)}
              >
                <div className="flex flex-wrap gap-1.5 pr-8">
                  {formData.specialty ? formData.specialty.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                    <span key={s} className="bg-blue-600/30 text-blue-400 px-2 py-0.5 rounded text-xs border border-blue-500/30">
                      {s}
                    </span>
                  )) : (
                    <span className="text-white/50">Pilih Jabatan</span>
                  )}
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>

              {isJabatanOpen && (
                <div className="absolute top-[100%] left-0 w-full mt-2 bg-[#0a0f1c] border border-white/10 rounded-xl shadow-xl z-50 py-2"
                     onMouseLeave={() => setIsJabatanOpen(false)}>
                  {['Head Coach', 'Assistant Coach', 'Goalkeeper Coach', 'Fitness Coach', 'Tactical Analyst'].map(opt => {
                    const selectedSpecs = formData.specialty ? formData.specialty.split(',').map(s => s.trim()).filter(Boolean) : [];
                    const isSelected = selectedSpecs.includes(opt);
                    return (
                      <div 
                        key={opt}
                        className="px-4 py-2 hover:bg-white/5 cursor-pointer flex items-center gap-2"
                        onClick={() => {
                          let newSpecs;
                          if (isSelected) {
                            newSpecs = selectedSpecs.filter(s => s !== opt);
                          } else {
                            newSpecs = [...selectedSpecs, opt];
                          }
                          setFormData({...formData, specialty: newSpecs.join(', ')});
                        }}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-white/30'}`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-sm text-white/80">{opt}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Pengalaman (Tahun)</label>
              <input type="number" required value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="Cth: 12" />
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Rating (1.0-5.0)</label>
              <input type="number" step="0.1" max="5" min="0" required value={formData.rating} onChange={(e) => setFormData({...formData, rating: Number(e.target.value)})} className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>

            <div className="col-span-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Tim Aktif (Pisah Koma)</label>
              <input 
                type="text" 
                value={(formData.activeTeams || []).join(', ')} 
                onChange={(e) => setFormData({...formData, activeTeams: e.target.value.split(',').map(t => t.trim()).filter(t => t !== '')})} 
                className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500" 
                placeholder="U17, U19" 
              />
            </div>
            
             <div className="col-span-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Foto URL (Opsional jika upload)</label>
              <input type="text" value={formData.photo} onChange={(e) => setFormData({...formData, photo: e.target.value})} className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="https://..." />
            </div>
          </div>

          <div className="pt-6 flex gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 h-12 rounded-xl border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-colors">
              Batal
            </button>
            <button type="submit" className="flex-1 py-3 h-12 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all uppercase tracking-wider">
              {editingCoach ? 'Simpan' : 'Recruit'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal 
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '', name: '' })}
        onConfirm={() => deleteItem(deleteConfirm.id)}
        message={`Yakin ingin menghapus data pelatih ${deleteConfirm.name}?`}
      />
    </Layout>
  );
}


