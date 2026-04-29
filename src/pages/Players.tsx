import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  Users, Search, Filter, Plus, ChevronRight, UserPlus, FileDown, Trash2, Edit2, Activity,
  CheckCircle2, Clock, MapPin, TrendingUp, SlidersHorizontal, LayoutGrid, List, AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import Layout from '../components/ui/Layout';
import { cn } from '../lib/utils';
import { useCMSData } from '../lib/store';
import { useSettings } from '../App';
import { uploadFile } from '../lib/supabase';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Loader2 } from 'lucide-react';

const initialPlayers = [
  { id: '1', name: 'Alvaro Morata', category: 'U14', position: 'Striker', age: 14, height: 178, weight: 68, jersey: 9, status: 'Active', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', dominantFoot: 'Right', dob: '2012-05-14', overall: 85, dribbling: 82, passing: 80, shooting: 88, stamina: 85, attendance: 95 },
  { id: '2', name: 'Kevin De Bruyne', category: 'U15', position: 'Midfielder', age: 14, height: 165, weight: 55, jersey: 10, status: 'Active', photo: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&q=80&w=200', dominantFoot: 'Right', dob: '2012-06-28', overall: 88, dribbling: 86, passing: 94, shooting: 82, stamina: 80, attendance: 98 },
  { id: '3', name: 'Virgil Van Dijk', category: 'U13', position: 'Defender', age: 13, height: 185, weight: 75, jersey: 4, status: 'Injured', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200', dominantFoot: 'Right', dob: '2013-01-08', overall: 84, dribbling: 70, passing: 80, shooting: 60, stamina: 88, attendance: 75 },
  { id: '4', name: 'Erling Haaland', category: 'U15', position: 'Striker', age: 15, height: 182, weight: 72, jersey: 99, status: 'Active', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', dominantFoot: 'Left', dob: '2011-07-21', overall: 90, dribbling: 84, passing: 75, shooting: 96, stamina: 88, attendance: 90 },
  { id: '5', name: 'Pedri Gonzalez', category: 'U12', position: 'Midfielder', age: 12, height: 158, weight: 48, jersey: 8, status: 'Active', photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200', dominantFoot: 'Right', dob: '2014-11-25', overall: 86, dribbling: 88, passing: 90, shooting: 78, stamina: 85, attendance: 100 },
];

const categories = ['All', 'U8', 'U9', 'U10', 'U11', 'U12', 'U13', 'U14', 'U15'];
const positions: string[] = ['All', 'Goalkeeper', 'Defender', 'Midfielder', 'Striker'];

export default function Players() {
  const { data: players, addItems, updateItem, deleteItem } = useCMSData('players', initialPlayers);
  const { appName, logoUrl } = useSettings();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activePosition, setActivePosition] = useState('All');
  const [sortBy, setSortBy] = useState('overall_desc'); // overall_desc, overall_asc, age_asc, age_desc
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: '', name: '' });
  
  const defaultForm = {
    name: '', category: 'U15', position: 'Striker', dob: '', height: 170, weight: 60, jersey: 10, status: 'Active', photo: '', dominantFoot: 'Right',
    dribbling: 70, passing: 70, shooting: 70, stamina: 70, attendance: 100
  };
  const [formData, setFormData] = useState(defaultForm);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const publicUrl = await uploadFile(file, 'players');
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

  const calculateAge = (dob: string) => {
    if (!dob) return 0;
    const diff = Date.now() - new Date(dob).getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  };

  const filteredAndSortedPlayers = useMemo(() => {
    let result = players.filter((p: any) => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = activeCategory === 'All' || p.category === activeCategory;
      const matchPos = activePosition === 'All' || p.position === activePosition;
      return matchSearch && matchCat && matchPos;
    });

    result.sort((a: any, b: any) => {
      const aAge = calculateAge(a.dob) || a.age;
      const bAge = calculateAge(b.dob) || b.age;
      const aOvr = a.overall || 0;
      const bOvr = b.overall || 0;

      switch(sortBy) {
        case 'overall_desc': return bOvr - aOvr;
        case 'overall_asc': return aOvr - bOvr;
        case 'age_desc': return bAge - aAge;
        case 'age_asc': return aAge - bAge;
        default: return 0;
      }
    });

    return result;
  }, [players, searchTerm, activeCategory, activePosition, sortBy]);

  const handleOpenAdd = () => {
    setEditingPlayer(null);
    setFormData(defaultForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (player: any) => {
    setEditingPlayer(player);
    setFormData(player);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const age = calculateAge(formData.dob);
    // calculate overall from skills
    const overall = Math.round((Number(formData.dribbling) + Number(formData.passing) + Number(formData.shooting) + Number(formData.stamina)) / 4);
    
    const dataToSave = { 
      ...formData, 
      age,
      dribbling: Number(formData.dribbling),
      passing: Number(formData.passing),
      shooting: Number(formData.shooting),
      stamina: Number(formData.stamina),
      attendance: Number(formData.attendance),
      photo: formData.photo || `https://i.pravatar.cc/150?u=${Math.random()}`,
      overall: overall || 0 
    };

    if (editingPlayer) {
      updateItem(editingPlayer.id, dataToSave);
    } else {
      addItems({ ...dataToSave, id: Date.now().toString() });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteConfirm({ isOpen: true, id, name });
  };

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
        
        {/* Elite Header */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0c1322] via-[#0f172a] to-[#0a0f1c] border border-white/5 p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
           <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.15),transparent_50%)] pointer-events-none" />
           <div className="relative z-10 flex items-center gap-6">
              <div className="w-20 h-20 flex items-center justify-center shrink-0">
                 {logoUrl ? (
                   <img src={logoUrl} alt="Logo" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(250,204,21,0.2)]" />
                 ) : (
                   <Users className="w-10 h-10 text-[var(--color-primary)] drop-shadow-[0_0_15px_rgba(250,204,21,0.2)]" />
                 )}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-display font-black text-white uppercase tracking-tight">Database Pemain</h1>
                <p className="text-[var(--color-primary)] text-sm font-bold tracking-widest mt-1 uppercase">{appName}</p>
              </div>
           </div>
           <div className="relative z-10 flex items-center gap-3 w-full md:w-auto">
             <button onClick={handleOpenAdd} className="w-full md:w-auto bg-[var(--color-primary)] hover:bg-yellow-500 text-[#0a0f1c] px-6 py-3 rounded-xl justify-center flex items-center gap-2 transition-all font-bold uppercase tracking-wider text-xs shadow-[0_0_20px_rgba(250,204,21,0.3)]">
                <Plus className="w-4 h-4 font-bold" /> Tambah Pemain
             </button>
           </div>
        </div>

        {/* Global Filters & Search Bar */}
        <div className="glass-card p-4 rounded-2xl flex flex-col xl:flex-row gap-4 items-center justify-between border-blue-500/10">
           {/* Search */}
           <div className="relative w-full xl:w-80 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input 
                type="text" 
                placeholder="Cari talenta, posisi, atau nomor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0a0f1c]/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:bg-blue-500/5 transition-all text-white placeholder:text-white/30"
              />
           </div>

           {/* Quick Filters */}
           <div className="flex bg-[#0a0f1c]/50 p-1 rounded-xl border border-white/10 overflow-x-auto hide-scrollbar w-full xl:w-auto">
             {categories.map(cat => (
               <button 
                 key={cat} onClick={() => setActiveCategory(cat)}
                 className={cn("px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all", 
                   activeCategory === cat ? "bg-blue-600 text-white shadow-lg" : "text-white/40 hover:text-white hover:bg-white/5")}
               >
                 {cat}
               </button>
             ))}
           </div>

           <div className="flex items-center gap-3 w-full xl:w-auto overflow-x-auto hide-scrollbar">
              <select 
                value={activePosition} onChange={(e) => setActivePosition(e.target.value)}
                className="bg-[#0a0f1c]/50 border border-white/10 rounded-xl py-2.5 px-4 text-xs font-bold uppercase text-white/70 focus:outline-none focus:border-blue-500 min-w-max"
              >
                {positions.map(p => <option key={p} value={p}>{p}</option>)}
              </select>

              <select 
                value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#0a0f1c]/50 border border-white/10 rounded-xl py-2.5 px-4 text-xs font-bold uppercase text-white/70 focus:outline-none focus:border-blue-500 min-w-max"
              >
                <option value="overall_desc">Rating (High to Low)</option>
                <option value="overall_asc">Rating (Low to High)</option>
                <option value="age_desc">Umur (Old to Young)</option>
                <option value="age_asc">Umur (Young to Old)</option>
              </select>

              <div className="flex bg-[#0a0f1c]/50 p-1 rounded-xl border border-white/10 shrink-0">
                <button onClick={() => setViewMode('grid')} className={cn("p-2 rounded-lg transition-colors", viewMode === 'grid' ? "bg-white/10 text-white" : "text-white/40 hover:text-white")}><LayoutGrid className="w-4 h-4" /></button>
                <button onClick={() => setViewMode('list')} className={cn("p-2 rounded-lg transition-colors", viewMode === 'list' ? "bg-white/10 text-white" : "text-white/40 hover:text-white")}><List className="w-4 h-4" /></button>
              </div>
           </div>
        </div>

        {/* Player Roster Content */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            <AnimatePresence>
              {filteredAndSortedPlayers.map((player: any) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={player.id}
                  className="relative group cursor-pointer"
                >
                  <Link to={`/players/${player.id}`} className="block h-full">
                    <div className="h-full rounded-2xl bg-gradient-to-b from-[#131b2f] to-[#0a0f1c] border border-white/10 overflow-hidden hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(37,99,235,0.2)] transition-all duration-300 transform group-hover:-translate-y-1">
                      
                      {/* Player Image & Header Area */}
                      <div className="relative h-48 bg-[#0a0f1c] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-[#131b2f] via-transparent to-transparent z-10" />
                        <img src={player.photo} alt={player.name} className="w-full h-full object-cover object-top opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                        
                        {/* Overall Badge */}
                        <div className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg border-2 border-[#131b2f]">
                          <span className="font-display font-black text-black text-sm">{player.overall || 0}</span>
                        </div>
                        
                        {/* Category Badge */}
                        <div className="absolute top-3 left-3 z-20 px-2 py-1 rounded bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest border border-blue-400/30">
                          {player.category}
                        </div>
                      </div>

                      {/* Player Info Area */}
                      <div className="p-4 relative z-20 bg-[#131b2f]">
                        <div className="flex items-end gap-2 mb-1">
                          <span className="text-3xl font-display font-black text-white/10 leading-none">{player.jersey}</span>
                          <h3 className="font-bold text-white text-base truncate flex-1 uppercase tracking-tight">{player.name}</h3>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-4">
                           <span className="text-xs text-blue-400 font-bold uppercase">{player.position}</span>
                           <span className="w-1 h-1 rounded-full bg-white/20" />
                           <span className="text-xs text-white/50">{player.age || calculateAge(player.dob)} YO</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-white/40 uppercase">
                          <div className="bg-[#0a0f1c] p-2 rounded-lg border border-white/5 text-center">
                            <span className="block text-white/20 mb-0.5">Height</span>
                            <span className="font-bold text-white/70">{player.height} CM</span>
                          </div>
                          <div className="bg-[#0a0f1c] p-2 rounded-lg border border-white/5 text-center">
                            <span className="block text-white/20 mb-0.5">Foot</span>
                            <span className="font-bold text-white/70">{player.dominantFoot?.substring(0, 3)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Admin Actions Overlay */}
                  <div className="absolute -top-3 -right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleOpenEdit(player); }} className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg hover:bg-blue-400 transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(player.id, player.name); }} className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-xl bg-[#131b2f]/50">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 bg-[#0a0f1c]/50">
                    <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">OVR</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Player</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Kategori</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Fisik</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest text-right">Aksi Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence>
                  {filteredAndSortedPlayers.map((player: any) => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={player.id}
                      className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                      onClick={() => document.getElementById(`link-${player.id}`)?.click()}
                    >
                      <td className="px-6 py-4">
                        <Link id={`link-${player.id}`} to={`/players/${player.id}`} className="hidden" />
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-600/20 text-yellow-500 flex items-center justify-center font-display font-black text-sm border border-yellow-500/30 shadow-inner">
                          {player.overall || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img src={player.photo} alt={player.name} className="w-12 h-12 rounded-xl object-cover ring-2 ring-transparent group-hover:ring-blue-500/50 transition-all" />
                          <div>
                            <p className="font-bold text-sm tracking-tight text-white uppercase">{player.name}</p>
                            <p className="text-[11px] text-blue-400 font-bold uppercase">{player.position} <span className="text-white/30 font-normal">| #{player.jersey}</span></p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest">
                          {player.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[10px] text-white/50 flex flex-col gap-0.5 font-mono uppercase">
                          <span>{player.height}cm / {player.weight}kg</span>
                          <span>{player.age || calculateAge(player.dob)} Y.O • {player.dominantFoot?.substring(0, 1)} Foot</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider",
                          player.status === 'Active' ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                          player.status === 'Injured' ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                        )}>
                          {player.status === 'Active' ? <CheckCircle2 className="w-3 h-3" /> :
                           player.status === 'Injured' ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {player.status}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={(e) => { e.stopPropagation(); handleOpenEdit(player); }} className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(player.id, player.name); }} className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            {filteredAndSortedPlayers.length === 0 && (
              <div className="p-20 text-center">
                <Users className="w-12 h-12 text-white/10 mx-auto mb-4" />
                <h3 className="font-bold text-white/60">Tidak ada talenta ditemukan</h3>
              </div>
            )}
          </div>
        )}

      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPlayer ? "EDIT DATA SCOUTING" : "TAMBAH TALENTA BARU"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Nama Lengkap</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>
            
            <div className="col-span-2 md:col-span-1">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Tanggal Lahir</label>
              <input type="date" required value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500 [color-scheme:dark]" />
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Foto Profil</label>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#0a0f1c] border border-white/10 overflow-hidden relative">
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                      <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    </div>
                  )}
                  {formData.photo ? (
                    <img src={formData.photo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/10">
                       <ImageIcon className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <label className="flex-1 py-2.5 px-4 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-blue-400 text-center cursor-pointer hover:bg-white/10 transition-colors">
                  Upload Foto
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                </label>
              </div>
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Foto URL (Opsional)</label>
              <input type="text" value={formData.photo} onChange={(e) => setFormData({...formData, photo: e.target.value})} className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="https://..." />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Kategori</label>
              <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500">
                {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Posisi</label>
              <select value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500">
                {positions.filter(p => p !== 'All').map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div className="col-span-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Statistik Skill & Kehadiran</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-[#0a0f1c]/50 p-4 rounded-xl border border-white/5">
                 <div>
                    <label className="text-[9px] uppercase tracking-widest text-white/40 font-bold mb-1 block">Dribbling</label>
                    <input type="number" min="0" max="100" required value={formData.dribbling || 70} onChange={(e) => setFormData({...formData, dribbling: Number(e.target.value)})} className="w-full bg-[#131b2f] border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-[var(--color-primary)]" />
                 </div>
                 <div>
                    <label className="text-[9px] uppercase tracking-widest text-white/40 font-bold mb-1 block">Passing</label>
                    <input type="number" min="0" max="100" required value={formData.passing || 70} onChange={(e) => setFormData({...formData, passing: Number(e.target.value)})} className="w-full bg-[#131b2f] border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-[var(--color-primary)]" />
                 </div>
                 <div>
                    <label className="text-[9px] uppercase tracking-widest text-white/40 font-bold mb-1 block">Shooting</label>
                    <input type="number" min="0" max="100" required value={formData.shooting || 70} onChange={(e) => setFormData({...formData, shooting: Number(e.target.value)})} className="w-full bg-[#131b2f] border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-[var(--color-primary)]" />
                 </div>
                 <div>
                    <label className="text-[9px] uppercase tracking-widest text-white/40 font-bold mb-1 block">Stamina</label>
                    <input type="number" min="0" max="100" required value={formData.stamina || 70} onChange={(e) => setFormData({...formData, stamina: Number(e.target.value)})} className="w-full bg-[#131b2f] border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-[var(--color-primary)]" />
                 </div>
                 <div>
                    <label className="text-[9px] uppercase tracking-widest text-[var(--color-primary)] font-bold mb-1 block">Kehadiran (%)</label>
                    <input type="number" min="0" max="100" required value={formData.attendance || 100} onChange={(e) => setFormData({...formData, attendance: Number(e.target.value)})} className="w-full bg-[#131b2f] border border-[var(--color-primary)]/30 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-[var(--color-primary)]" />
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 col-span-2">
               <div>
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Tinggi (cm)</label>
                  <input type="number" required value={formData.height} onChange={(e) => setFormData({...formData, height: Number(e.target.value)})} className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500" />
               </div>
               <div>
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Berat (kg)</label>
                  <input type="number" required value={formData.weight} onChange={(e) => setFormData({...formData, weight: Number(e.target.value)})} className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500" />
               </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Kaki Dominan</label>
               <select value={formData.dominantFoot} onChange={(e) => setFormData({...formData, dominantFoot: e.target.value})} className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500">
                  <option value="Right">Kanan</option>
                  <option value="Left">Kiri</option>
                  <option value="Both">Keduanya</option>
               </select>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">No Punggung</label>
              <input type="number" required value={formData.jersey} onChange={(e) => setFormData({...formData, jersey: Number(e.target.value)})} className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>

            <div className="col-span-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Status</label>
              <div className="flex bg-[#0a0f1c] p-1 rounded-xl border border-white/10">
                {['Active', 'Injured', 'Away'].map(s => (
                  <button type="button" key={s} onClick={() => setFormData({...formData, status: s})} className={cn("flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-colors", formData.status === s ? "bg-white/10 text-white" : "text-white/40 hover:text-white")}>
                     {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 flex gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 h-12 rounded-xl border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-colors">
              Batal
            </button>
            <button type="submit" className="flex-1 py-3 h-12 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all uppercase tracking-wider">
              {editingPlayer ? 'Simpan' : 'Tambah'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal 
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '', name: '' })}
        onConfirm={() => deleteItem(deleteConfirm.id)}
        message={`Yakin ingin menghapus pemain ${deleteConfirm.name}?`}
      />
    </Layout>
  );
}
