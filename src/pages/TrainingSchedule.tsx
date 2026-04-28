import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, Users, Plus, MoreVertical, Filter, CheckCircle2, AlertCircle, Edit2, Trash2, Save
} from 'lucide-react';
import Layout from '../components/ui/Layout';
import { cn } from '../lib/utils';
import { useCMSData } from '../lib/store';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';

// Mock schedule initial
const initialSessions = [
  { id: '1', title: 'Individual Technique & Ball Mastery', date: '2026-04-28', time: '16:00 - 17:30', category: 'U12', coach: 'Coach Andre', field: 'Lapangan A', status: 'Upcoming' },
  { id: '2', title: 'Tactical Awareness & Positioning', date: '2026-04-28', time: '16:00 - 18:00', category: 'U15', coach: 'Coach Sarah', field: 'Lapangan B', status: 'Upcoming' },
  { id: '3', title: 'Physical Conditioning (Endurance)', date: '2026-04-29', time: '08:00 - 10:00', category: 'U17', coach: 'Coach Mike', field: 'Gym Area', status: 'Upcoming' },
  { id: '4', title: 'Goalkeeper Specialist Training', date: '2026-04-29', time: '16:00 - 17:30', category: 'All GK', coach: 'Coach Budi', field: 'Lapangan C', status: 'Upcoming' },
  { id: '5', title: 'Set Piece Execution', date: '2026-04-25', time: '16:00 - 18:00', category: 'U15', coach: 'Coach Sarah', field: 'Lapangan B', status: 'Completed' },
];

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function TrainingSchedule() {
  const { data: sessions, addItems, updateItem, deleteItem } = useCMSData('schedules', initialSessions);

  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 28)); // April 2026
  const [viewType, setViewType] = useState('list'); // 'list' or 'calendar'
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: '' });
  const [formData, setFormData] = useState({
    title: '', date: '2026-04-28', time: '16:00 - 18:00', category: 'U15', coach: 'Coach', field: 'Lapangan A', status: 'Upcoming'
  });

  const formattedDate = `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  const handleOpenAdd = () => {
    setEditingSession(null);
    setFormData({ title: '', date: '2026-04-28', time: '16:00 - 18:00', category: 'U15', coach: '', field: '', status: 'Upcoming' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (session: any) => {
    setEditingSession(session);
    setFormData(session);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSession) {
      updateItem(editingSession.id, formData);
    } else {
      addItems(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-3 rounded-xl text-sm flex items-start gap-3 backdrop-blur-md">
          <CalendarIcon className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <strong>Mode Admin Aktif.</strong> Anda dapat menambah, mengubah, atau menghapus jadwal latihan dengan mudah. Data tersimpan real-time ke Database.
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-display font-bold text-glow uppercase">KALENDER LATIHAN</h1>
            <p className="text-white/40 text-sm mt-1">CMS Admin: Monitor seluruh sesi latihan dan ketersediaan lapangan.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
              <button onClick={() => setViewType('list')} className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all", viewType === 'list' ? "bg-[var(--color-primary)] text-black" : "text-white/40 hover:text-white")}>LIST</button>
              <button onClick={() => setViewType('calendar')} className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all", viewType === 'calendar' ? "bg-[var(--color-primary)] text-black" : "text-white/40 hover:text-white")}>CALENDAR</button>
            </div>
            <button onClick={handleOpenAdd} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] !py-2 px-4 rounded-xl flex items-center gap-2 transition-all font-semibold text-sm">
              <Plus className="w-4 h-4" /> Tambah Sesi
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="glass-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors border border-white/5"><ChevronLeft className="w-5 h-5 text-white/60" /></button>
            <h2 className="font-display font-bold text-lg tracking-tight min-w-[150px] text-center">{formattedDate}</h2>
            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors border border-white/5"><ChevronRight className="w-5 h-5 text-white/60" /></button>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-xl bg-white/5 text-xs font-bold text-white/60 hover:text-white transition-all">
              <Filter className="w-4 h-4" /> FILTER CATEGORY
            </button>
          </div>
        </div>

        {/* List View */}
        <AnimatePresence mode="wait">
          {viewType === 'list' ? (
            <motion.div key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
              {[ 'Upcoming', 'Completed' ].map((section) => (
                <div key={section} className="space-y-4">
                  <h3 className="text-xs font-black uppercase text-white/20 tracking-[0.3em] flex items-center gap-3">
                    {section} <div className="h-px flex-1 bg-white/5" />
                  </h3>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {sessions.filter((s:any) => s.status === section).map((session:any) => (
                      <div key={session.id} className="glass-card group hover:border-[var(--color-primary)]/30 transition-all p-1 relative overflow-hidden">
                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                           <button onClick={() => handleOpenEdit(session)} className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 shadow backdrop-blur"><Edit2 className="w-4 h-4"/></button>
                           <button onClick={() => setDeleteConfirm({ isOpen: true, id: session.id })} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 shadow backdrop-blur"><Trash2 className="w-4 h-4"/></button>
                        </div>
                        <div className="flex items-center gap-4 p-5 relative z-0">
                          <div className={cn("w-16 h-16 rounded-2xl flex flex-col items-center justify-center border transition-colors", section === 'Completed' ? "bg-white/5 border-white/5 text-white/30" : "bg-[var(--color-primary)]/5 border-[var(--color-primary)]/20 text-[var(--color-primary)] shadow-[inset_0_0_20px_rgba(0,242,255,0.05)]")}>
                            <span className="text-xl font-display font-black leading-none">{session.date.split('-')[2]}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider">{months[parseInt(session.date.split('-')[1]) - 1].substring(0, 3)}</span>
                          </div>
                          <div className="flex-1 min-w-0 pr-16">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={cn("px-2 py-[2px] rounded text-[8px] font-black uppercase tracking-widest border", section === 'Completed' ? "border-white/10 text-white/30" : "border-[var(--color-primary)]/30 text-[var(--color-primary)]")}>{session.category}</span>
                              <div className="flex items-center gap-1 text-[10px] text-white/40"><Clock className="w-3 h-3" /> {session.time}</div>
                            </div>
                            <h4 className="font-bold truncate group-hover:text-[var(--color-primary)] transition-colors">{session.title}</h4>
                            <div className="flex items-center gap-4 mt-2">
                              <div className="flex items-center gap-1 text-[10px] text-white/40"><MapPin className="w-3 h-3" /> {session.field}</div>
                              <div className="flex items-center gap-1 text-[10px] text-white/40"><Users className="w-3 h-3" /> {session.coach}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div key="calendar" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="glass-card overflow-hidden">
              <div className="grid grid-cols-7 border-b border-white/10">
                {days.map(day => <div key={day} className="py-4 text-center text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] bg-white/[0.02]">{day}</div>)}
              </div>
              <div className="grid grid-cols-7">
                {Array.from({ length: 35 }).map((_, i) => {
                  const dayNum = i - 2; // Offset for grid start
                  const dateStr = `2026-04-${String(dayNum).padStart(2, '0')}`;
                  const daySessions = sessions.filter((s:any) => s.date === dateStr);
                  const isToday = dayNum === 28;
                  
                  return (
                    <div key={i} className={cn("aspect-square p-2 border-r border-b border-white/5 hover:bg-white/[0.02] transition-colors relative min-h-[120px]", dayNum <= 0 && "opacity-20 pointer-events-none")}>
                      <span className={cn("text-xs font-bold w-6 h-6 flex items-center justify-center rounded-lg mb-2", isToday ? "bg-[var(--color-primary)] text-black" : "text-white/40")}>{dayNum > 0 ? dayNum : ''}</span>
                      {daySessions.length > 0 && (
                        <div className="space-y-1">
                          {daySessions.map((s:any) => (
                             <div key={s.id} onClick={(e) => { e.stopPropagation(); handleOpenEdit(s); }} className="p-1.5 rounded-lg bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 cursor-pointer hover:bg-[var(--color-primary)]/20 transition-colors">
                               <p className="text-[9px] font-black uppercase text-[var(--color-primary)] leading-none truncate mb-0.5">{s.category} {s.title.split(' ')[0]}</p>
                               <p className="text-[8px] text-[var(--color-primary)]/60">{s.time.split(' - ')[0]}</p>
                             </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingSession ? "Edit Sesi Latihan" : "Tambah Sesi Latihan"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Judul Latihan</label>
            <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-surface-raised border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]" placeholder="Cth: Tactical Awareness" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Tanggal</label>
              <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full bg-surface-raised border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--color-primary)] [color-scheme:dark]" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Waktu / Jam</label>
              <input type="text" required value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} className="w-full bg-surface-raised border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]" placeholder="16:00 - 18:00" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Kategori</label>
              <input type="text" required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-surface-raised border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]" placeholder="Cth: U15" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Pelatih</label>
              <input type="text" required value={formData.coach} onChange={(e) => setFormData({...formData, coach: e.target.value})} className="w-full bg-surface-raised border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]" placeholder="Cth: Coach Andre" />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Lapangan / Lokasi</label>
              <input type="text" required value={formData.field} onChange={(e) => setFormData({...formData, field: e.target.value})} className="w-full bg-surface-raised border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]" placeholder="Cth: Lapangan A" />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Status Latihan</label>
              <div className="flex gap-3">
                {['Upcoming', 'Completed'].map(s => (
                  <label key={s} className="flex-1 cursor-pointer">
                    <input type="radio" name="status" value={s} checked={formData.status === s} onChange={(e) => setFormData({...formData, status: e.target.value})} className="peer hidden" />
                    <div className="text-center py-2 px-4 rounded-xl border border-white/10 text-sm text-white/50 peer-checked:bg-[var(--color-primary)] peer-checked:text-black peer-checked:border-[var(--color-primary)] font-bold transition-all">
                      {s}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-colors">Batal</button>
            <button type="submit" className="flex-1 py-3 rounded-xl bg-[var(--color-primary)] text-black font-bold text-sm flex items-center justify-center gap-2 hover:shadow-[0_0_20px_var(--color-primary-glow)] transition-all">
              <Save className="w-4 h-4" /> {editingSession ? "Simpan Perubahan" : "Tambah Sesi"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal 
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '' })}
        onConfirm={() => deleteItem(deleteConfirm.id)}
        message={`Yakin ingin menghapus sesi latihan ini?`}
      />
    </Layout>
  );
}
