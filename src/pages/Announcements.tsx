import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Megaphone, Bell, Plus, Calendar, Pin, AlertCircle, Edit2, Trash2, Search, Filter, Image as ImageIcon, FileText, Send, ChevronDown, CheckCircle2 } from 'lucide-react';
import Layout from '../components/ui/Layout';
import { cn } from '../lib/utils';
import { useCMSData } from '../lib/store';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';

const CATEGORIES = ['Semua', 'Umum', 'Jadwal', 'Match', 'Pembayaran', 'Event', 'Darurat'];
const TARGETS = ['Semua Anggota', 'U8', 'U9', 'U10', 'U11', 'U12', 'U13', 'U14', 'U15', 'GK', 'Elite', 'Pelatih/Admin'];

const initialRecords = [
  { id: '1', title: 'Laga Uji Coba Internasional', date: '2026-04-29', category: 'Match', content: 'Diinformasikan kepada seluruh pemain Elite U14 dan U15 untuk persiapan laga uji coba melawan Akademi XYZ hari Sabtu ini. Harap datang 1 jam lebih awal.', isPinned: true, priority: 'Important', target: 'Elite', image: null, pdf: null },
  { id: '2', title: 'Update Jadwal Lapangan A', date: '2026-04-28', category: 'Jadwal', content: 'Lapangan A sedang dalam perawatan rutin. Sesi U10 dan U12 dipindahkan ke Lapangan C untuk sementara waktu.', isPinned: false, priority: 'Normal', target: 'U10, U12, U14', image: null, pdf: null },
  { id: '3', title: 'Iuran Bulanan Mei 2026', date: '2026-04-25', category: 'Pembayaran', content: 'Mengingatkan kembali jatuh tempo pembayaran iuran bulan depan adalah tanggal 10. Bagi yang sudah membayar mohon lampirkan bukti.', isPinned: false, priority: 'Normal', target: 'Semua Anggota', image: null, pdf: null },
];

export default function Announcements() {
  const { data: records, addItems, updateItem, deleteItem } = useCMSData('announcements', initialRecords);

  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('Semua');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: '' });
  
  const [formData, setFormData] = useState({
    title: '', date: new Date().toISOString().split('T')[0], category: 'Umum', content: '', target: 'Semua Anggota', priority: 'Normal', is_pinned: false, image: null, pdf: null
  });

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setFormData({ title: '', date: new Date().toISOString().split('T')[0], category: 'Umum', content: '', target: 'Semua Anggota', priority: 'Normal', is_pinned: false, image: null, pdf: null });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec: any) => {
    setEditingRecord(rec);
    setFormData(rec);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRecord) {
      updateItem(editingRecord.id, formData);
    } else {
      addItems(formData);
      // Simulate real-time push notification feature for newly added priority
      if(formData.priority === 'Important') {
        alert("Notifikasi Push Real-time Darurat berhasil dikirim ke " + formData.target);
      }
    }
    setIsModalOpen(false);
  };

  const togglePin = (rec: any) => {
    updateItem(rec.id, { ...rec, is_pinned: !(rec.is_pinned || rec.isPinned) });
  };

  const filtered = records.filter((r:any) => {
    if (filterCat !== 'Semua' && r.category !== filterCat) return false;
    if (search && !(r.title || '').toLowerCase().includes(search.toLowerCase()) && !(r.content || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a:any, b:any) => {
    const aPinned = a.is_pinned || a.isPinned;
    const bPinned = b.is_pinned || b.isPinned;
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const getCatIcon = (cat: string) => {
    if (cat === 'Match' || cat === 'Event') return <Bell className="w-5 h-5" />;
    if (cat === 'Darurat') return <AlertCircle className="w-5 h-5" />;
    return <Megaphone className="w-5 h-5" />;
  };
  const getCatColor = (cat: string) => {
    if (cat === 'Match') return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (cat === 'Jadwal') return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    if (cat === 'Pembayaran') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    if (cat === 'Darurat') return 'bg-red-500/20 text-red-500 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse';
    if (cat === 'Event') return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
    return 'bg-[var(--color-primary)]/20 text-[var(--color-primary)] border-[var(--color-primary)]/30';
  };

  return (
    <Layout>
      <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto animate-in fade-in duration-700 pb-12 font-sans">
        
        {/* Header Setup */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-display font-black tracking-tight text-white uppercase flex items-center gap-4">
              PENGUMUMAN
              <div className="relative">
                 <Megaphone className="w-8 h-8 text-[var(--color-primary)] animate-[bounce_3s_ease-in-out_infinite]" />
                 <span className="absolute -top-1 -right-1 flex h-3 w-3">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                 </span>
              </div>
            </h1>
            <p className="text-white/60 mt-2 font-medium">CMS Admin: Broadcast Pesan, Berita & Update Penting Akademi ke Seluruh Anggota.</p>
          </div>
          <button onClick={handleOpenAdd} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] !py-3 px-6 rounded-2xl flex items-center gap-2 transition-all font-black text-xs uppercase tracking-[0.1em]">
            <Send className="w-4 h-4" /> Bikin Pengumuman
          </button>
        </div>

        {/* CMS Controls */}
        <div className="glass-card p-4 rounded-[2rem] border border-white/5 flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#0a0f1c]/80 shadow-2xl">
           <div className="relative w-full sm:w-96 group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-blue-400 transition-colors" />
             <input type="text" placeholder="Cari info pengumuman..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:bg-blue-900/10 transition-all font-medium" />
           </div>
           
           <div className="relative z-40 w-full sm:w-auto">
             <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="w-full sm:w-auto flex items-center justify-between gap-3 px-6 py-3 border border-white/10 rounded-2xl bg-black/40 text-xs font-black text-white hover:bg-white/10 transition-all uppercase tracking-widest shadow-inner relative z-50">
               <div className="flex z-10 items-center gap-2">
                 <Filter className="w-4 h-4 text-blue-400" /> {filterCat}
               </div>
               <ChevronDown className="w-4 h-4 text-white/40 z-10" />
             </button>
             <AnimatePresence>
                {isFilterOpen && (
                  <motion.div 
                     initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                     className="absolute top-14 right-0 w-full sm:w-48 bg-[#0c1322] border border-white/10 rounded-3xl p-2 shadow-2xl z-[60] backdrop-blur-2xl flex flex-col gap-1 max-h-[300px] overflow-y-auto hide-scrollbar"
                  >
                     {CATEGORIES.map(cat => (
                        <button 
                           key={cat} 
                           onClick={() => { setFilterCat(cat); setIsFilterOpen(false); }}
                           className={cn(
                              "w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                              filterCat === cat ? "bg-blue-600/20 text-blue-400" : "text-white/40 hover:bg-white/5 hover:text-white"
                           )}
                        >
                           {cat}
                        </button>
                     ))}
                  </motion.div>
                )}
             </AnimatePresence>
           </div>
        </div>

        {/* Content List */}
        <div className="grid grid-cols-1 gap-6">
           <AnimatePresence>
              {filtered.map((ann:any) => (
                <motion.div layout key={ann.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className={cn("group bg-gradient-to-br from-[#0c1322] to-[#0a0f1c] rounded-[2rem] border transition-all p-6 relative overflow-hidden", ann.priority === 'Important' ? 'border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.1)]' : 'border-white/5 hover:border-blue-500/30 hover:shadow-[0_0_40px_rgba(37,99,235,0.1)]')}>
                  
                  {ann.priority === 'Important' && (
                     <div className="absolute top-0 right-0 py-1.5 px-6 bg-red-500/90 text-white font-black text-[9px] uppercase tracking-[0.2em] rounded-bl-2xl shadow-lg flex items-center gap-2">
                       <AlertCircle className="w-3 h-3" /> URGENT
                     </div>
                  )}

                  {(ann.is_pinned || ann.isPinned) && (
                     <Pin className="absolute top-1 left-1 opacity-20 w-32 h-32 text-blue-500 rotate-12 pointer-events-none" />
                  )}

                  <div className="flex flex-col lg:flex-row gap-6 relative z-10 w-full">
                     <div className="absolute top-0 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity mt-8 lg:-mt-2">
                        <button onClick={() => togglePin(ann)} className={cn("p-2 rounded-xl backdrop-blur transition-all border", (ann.is_pinned || ann.isPinned) ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-white/5 text-white/40 hover:text-white hover:bg-white/10")} title="Pin Pengumuman"><Pin className="w-4 h-4 fill-current"/></button>
                        <button onClick={() => handleOpenEdit(ann)} className="p-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white shadow border border-blue-500/20 backdrop-blur transition-all" title="Edit Pengumuman"><Edit2 className="w-4 h-4"/></button>
                        <button onClick={() => setDeleteConfirm({ isOpen: true, id: ann.id })} className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white shadow border border-red-500/20 backdrop-blur transition-all" title="Hapus Pengumuman"><Trash2 className="w-4 h-4"/></button>
                     </div>

                     <div className={cn(
                       "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border",
                       getCatColor(ann.category)
                     )}>
                       {getCatIcon(ann.category)}
                     </div>

                     <div className="flex-1 min-w-0 pr-0 lg:pr-32">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                           <span className={cn("px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border", getCatColor(ann.category))}>{ann.category}</span>
                           <span className="text-xs font-bold text-white/40 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {ann.date}</span>
                           {ann.target && (
                             <span className="text-[10px] uppercase font-bold tracking-widest text-[#94a3b8] flex items-center gap-1.5 bg-[#1e293b] px-2 py-0.5 rounded-lg border border-white/5">🎯 TO: {ann.target}</span>
                           )}
                        </div>
                        <h3 className="text-xl font-display font-black text-white group-hover:text-blue-400 transition-colors mb-3 pr-20 lg:pr-0">{ann.title}</h3>
                        <p className="text-sm text-white/60 leading-relaxed font-medium mb-4 whitespace-pre-wrap">{ann.content}</p>
                        
                        {(ann.image || ann.pdf) && (
                           <div className="flex flex-wrap gap-3 mt-5">
                             {ann.image && (
                               <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-xs font-bold text-blue-300 hover:bg-blue-900/20 cursor-pointer transition-all">
                                 <ImageIcon className="w-4 h-4" /> Lihat Lampiran Foto
                               </div>
                             )}
                             {ann.pdf && (
                               <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-xs font-bold text-rose-300 hover:bg-rose-900/20 cursor-pointer transition-all">
                                 <FileText className="w-4 h-4" /> Download Dokumen PDF
                               </div>
                             )}
                           </div>
                        )}
                     </div>
                  </div>
                </motion.div>
              ))}
           </AnimatePresence>
           {filtered.length === 0 && (
             <div className="text-center py-20 bg-[#0a0f1c] rounded-[2rem] border border-white/5">
                <Megaphone className="w-16 h-16 mx-auto text-white/5 mb-4" />
                <p className="text-lg font-bold text-white/40">Tidak ada pengumuman yang sesuai</p>
             </div>
           )}
        </div>

      </div>

      {/* Editor Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingRecord ? "EDIT PENGUMUMAN" : "BUAT PENGUMUMAN BARU"}>
        <form onSubmit={handleSubmit} className="p-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-2 block">Judul Pengumuman</label>
              <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-black/60 border border-white/10 rounded-2xl py-4 px-5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all font-bold" placeholder="Cth: Laga Uji Coba vs SSB Pelita" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-2 block">Kategori</label>
              <select required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-black/60 border border-white/10 rounded-2xl py-4 px-5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all font-bold appearance-none">
                {CATEGORIES.filter(c => c !== 'Semua').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-2 block">Target Penerima</label>
              <select required value={formData.target} onChange={(e) => setFormData({...formData, target: e.target.value})} className="w-full bg-black/60 border border-white/10 rounded-2xl py-4 px-5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all font-bold appearance-none">
                {TARGETS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-2 block">Isi Pesan / Konten</label>
              <textarea required value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} className="w-full bg-black/60 border border-white/10 rounded-2xl py-4 px-5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all resize-none h-32 font-medium" placeholder="Tuliskan berita lengkap pengumuman di sini..."></textarea>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-4 block">Prioritas</label>
              <div className="flex gap-4">
                {['Normal', 'Important'].map(s => (
                  <label key={s} className="flex-1 cursor-pointer">
                    <input type="radio" name="priority" value={s} checked={formData.priority === s} onChange={(e) => setFormData({...formData, priority: e.target.value})} className="peer hidden" />
                    <div className={cn(
                       "text-center py-4 px-4 rounded-2xl border border-white/10 text-xs font-black uppercase tracking-widest text-white/50 transition-all",
                       s === 'Important' ? "peer-checked:bg-red-600 peer-checked:text-white peer-checked:border-red-500 peer-checked:shadow-[0_0_20px_rgba(239,68,68,0.4)]" : "peer-checked:bg-[var(--color-primary)] peer-checked:text-black peer-checked:border-[var(--color-primary)]"
                    )}>
                      {s === 'Important' ? 'Darurat (Push Notif)' : 'Normal Info'}
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-2 block">Tanggal Publikasi</label>
              <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full bg-black/60 border border-white/10 rounded-2xl py-4 px-5 text-sm text-white focus:outline-none focus:border-blue-500 [color-scheme:dark] transition-all font-bold h-[54px]" />
            </div>
            
            <div className="col-span-2 p-5 rounded-2xl border border-dashed border-white/20 bg-white/5 mt-2 text-center group cursor-pointer hover:bg-white/10 transition-colors">
               <div className="flex flex-col items-center gap-2">
                  <div className="flex gap-4 mb-2 opacity-60 group-hover:opacity-100 transition-opacity">
                     <ImageIcon className="w-8 h-8 text-blue-400" />
                     <FileText className="w-8 h-8 text-rose-400" />
                  </div>
                  <span className="text-sm font-bold text-white">Upload Lampiran Media & Dokumen</span>
                  <span className="text-xs text-white/40 font-medium">Drag & Drop foto banner atau PDF jadwal (Opsional). (Fitur mockup)</span>
               </div>
            </div>

            <div className="col-span-2 flex items-center gap-3 bg-blue-900/20 border border-blue-500/20 p-4 rounded-2xl">
                <input type="checkbox" id="pin" checked={formData.is_pinned || (formData as any).isPinned} onChange={(e) => setFormData({...formData, is_pinned: e.target.checked})} className="w-5 h-5 rounded border-white/10 bg-black/50 text-blue-500 focus:ring-blue-500" />
                <label htmlFor="pin" className="text-sm font-bold text-blue-200 cursor-pointer">Sematkan di Atas (Pin to Top)</label>
            </div>
          </div>
          <div className="pt-6 flex gap-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-xs font-black text-white/40 border border-white/10 rounded-2xl hover:bg-white/5 transition-all uppercase tracking-[0.2em]">Batalkan</button>
            <button type="submit" className="flex-1 py-4 text-xs font-black text-white bg-blue-600 rounded-2xl hover:bg-blue-500 shadow-[0_10px_30px_rgba(37,99,235,0.3)] transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-2">
              <Send className="w-4 h-4" /> {editingRecord ? "Perbarui" : "Publikasi"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal 
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '' })}
        onConfirm={() => { deleteItem(deleteConfirm.id); setDeleteConfirm({ isOpen: false, id: '' }); }}
        message="Yakin menghapus pengumuman ini? Tindakan ini tidak bisa dibatalkan."
      />
    </Layout>
  );
}
