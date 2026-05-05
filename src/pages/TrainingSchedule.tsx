import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, Users, Plus, MoreVertical, Filter, CheckCircle2, AlertCircle, Edit2, Trash2, Save, BookOpen, Activity, ChevronDown
} from 'lucide-react';
import Layout from '../components/ui/Layout';
import { cn } from '../lib/utils';
import { useCMSData } from '../lib/store';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';

const CATEGORIES = ['Semua Tim', 'U8', 'U9', 'U10', 'U11', 'U12', 'U13', 'U14', 'U15', 'GK', 'Elite'];

const dt = new Date();
const currentYear = dt.getFullYear();
const currentMonth = String(dt.getMonth() + 1).padStart(2, '0');

const initialSessions = [
  { id: '1', title: 'Individual Technique & Ball Mastery', date: `${currentYear}-${currentMonth}-28`, time: '16:00 - 17:30', category: 'U12', coach: 'Coach Andre', field: 'Lapangan A', status: 'Upcoming', materials: 'Ball Control DRILL', notes: 'Fokus pada sentuhan pertama' },
  { id: '2', title: 'Tactical Awareness & Positioning', date: `${currentYear}-${currentMonth}-28`, time: '16:00 - 18:00', category: 'U15', coach: 'Coach Sarah', field: 'Lapangan B', status: 'Upcoming', materials: 'Positional Play', notes: 'Transisi cepat bertahan ke menyerang' },
  { id: '3', title: 'Physical Conditioning (Endurance)', date: `${currentYear}-${currentMonth}-29`, time: '08:00 - 10:00', category: 'U14', coach: 'Coach Mike', field: 'Gym Area', status: 'Upcoming', materials: 'Endurance Circuit', notes: '' },
  { id: '4', title: 'Goalkeeper Specialist Training', date: `${currentYear}-${currentMonth}-29`, time: '16:00 - 17:30', category: 'GK', coach: 'Coach Budi', field: 'Lapangan C', status: 'Upcoming', materials: 'Reflex & Distribution', notes: '' },
  { id: '5', title: 'Set Piece Execution', date: `${currentYear}-${currentMonth}-25`, time: '16:00 - 18:00', category: 'U15', coach: 'Coach Sarah', field: 'Lapangan B', status: 'Completed', materials: 'Corners & Free Kicks', notes: 'Evaluasi akurasi umpan' },
];

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function TrainingSchedule() {
  const { data: sessions, addItems, updateItem, deleteItem } = useCMSData('training_schedule', initialSessions);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState('list'); // 'list' or 'calendar'
  const [filterCat, setFilterCat] = useState('Semua Tim');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMonthSelectOpen, setIsMonthSelectOpen] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: '' });
  const [formData, setFormData] = useState({
    title: '', date: new Date().toISOString().split('T')[0], time: '16:00 - 18:00', category: 'U15', coach: '', location: '', status: 'Upcoming', description: '', notes: ''
  });

  const formattedDate = `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const selectMonth = (monthIdx: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), monthIdx, 1));
    setIsMonthSelectOpen(false);
  };

  const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const startDayOfWeek = currentMonthStart.getDay();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

  const handleOpenAdd = () => {
    setEditingSession(null);
    const dateStr = currentDate.toISOString().split('T')[0];
    setFormData({ title: '', date: dateStr, time: '16:00 - 18:00', category: 'U15', coach: '', location: '', status: 'Upcoming', description: '', notes: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (session: any) => {
    setEditingSession(session);
    setFormData(session);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      id: editingSession ? editingSession.id : undefined,
      title: formData.title,
      date: formData.date,
      time: formData.time,
      category: formData.category,
      coach: formData.coach,
      location: formData.location || (formData as any).field,
      field: formData.location || (formData as any).field, // backward compatibility
      description: formData.description || (formData as any).materials,
      materials: formData.description || (formData as any).materials, // backward compatibility
      notes: formData.notes || '',
      status: formData.status || 'Upcoming'
    };

    if (editingSession) {
      updateItem(editingSession.id, payload);
    } else {
      addItems(payload);
    }
    setIsModalOpen(false);
  };

  // Filter logic
  const currentMonthSessions = sessions.filter((s:any) => {
     const sessDate = new Date(s.date);
     return sessDate.getMonth() === currentDate.getMonth() && sessDate.getFullYear() === currentDate.getFullYear();
  });

  const filteredSessions = currentMonthSessions.filter((s:any) => {
     if (filterCat !== 'Semua Tim' && s.category !== filterCat) return false;
     return true;
  }).sort((a:any, b:any) => new Date(a.date).getTime() - new Date(b.date).getTime());

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
            <h1 className="text-4xl font-display font-black text-white uppercase tracking-tight">JADWAL LATIHAN</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
              <button onClick={() => setViewType('list')} className={cn("px-4 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-widest", viewType === 'list' ? "bg-blue-600 text-white shadow-lg" : "text-white/40 hover:text-white hover:bg-white/5")}>List</button>
              <button onClick={() => setViewType('calendar')} className={cn("px-4 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-widest", viewType === 'calendar' ? "bg-blue-600 text-white shadow-lg" : "text-white/40 hover:text-white hover:bg-white/5")}>Calendar</button>
            </div>
            <button onClick={handleOpenAdd} className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black shadow-[0_0_20px_rgba(250,204,21,0.3)] !py-2.5 px-6 rounded-2xl flex items-center gap-2 transition-all font-black text-xs uppercase tracking-[0.1em]">
              <Plus className="w-4 h-4" /> Tambah Sesi
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="glass-card p-4 rounded-[2rem] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 bg-[#0a0f1c]/80 shadow-2xl">
          <div className="flex items-center gap-4 relative">
             <button onClick={prevMonth} className="p-3 hover:bg-white/10 rounded-xl transition-all border border-white/5 bg-white/5"><ChevronLeft className="w-5 h-5 text-white" /></button>
             <button onClick={() => setIsMonthSelectOpen(!isMonthSelectOpen)} className="font-display font-black text-xl tracking-tight min-w-[200px] text-center text-white hover:text-blue-400 transition-colors uppercase flex items-center justify-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-500" /> {formattedDate}
             </button>
             <button onClick={nextMonth} className="p-3 hover:bg-white/10 rounded-xl transition-all border border-white/5 bg-white/5"><ChevronRight className="w-5 h-5 text-white" /></button>

             {/* Month Dropdown */}
             <AnimatePresence>
                {isMonthSelectOpen && (
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                     className="absolute top-16 left-1/2 -translate-x-1/2 w-64 bg-[#0c1322] border border-white/10 rounded-3xl p-4 shadow-2xl z-50 grid grid-cols-3 gap-2 backdrop-blur-2xl"
                   >
                      {months.map((m, idx) => (
                         <button 
                            key={m} 
                            onClick={() => selectMonth(idx)}
                            className={cn(
                               "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                               currentDate.getMonth() === idx ? "bg-blue-600 text-white" : "text-white/40 hover:bg-white/5 hover:text-white"
                            )}
                         >{m.substring(0,3)}</button>
                      ))}
                   </motion.div>
                )}
             </AnimatePresence>
          </div>

          <div className="relative z-40">
            <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex items-center gap-2 px-6 py-3 border border-white/10 rounded-2xl bg-black/40 text-xs font-black text-white hover:bg-white/10 transition-all uppercase tracking-widest shadow-inner relative z-50">
              <Filter className="w-4 h-4 text-blue-400" /> {filterCat} <ChevronDown className="w-4 h-4 text-white/40 ml-2" />
            </button>
            <AnimatePresence>
               {isFilterOpen && (
                 <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="absolute top-14 right-0 w-48 bg-[#0c1322] border border-white/10 rounded-3xl p-2 shadow-2xl z-[60] backdrop-blur-2xl flex flex-col gap-1 max-h-[300px] overflow-y-auto hide-scrollbar"
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

        {/* List View */}
        <AnimatePresence mode="wait">
          {viewType === 'list' ? (
            <motion.div key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-10">
              {[ 'Upcoming', 'Completed' ].map((section) => {
                const sectSessions = filteredSessions.filter((s:any) => s.status === section);
                if (sectSessions.length === 0) return null;
                return (
                 <div key={section} className="space-y-6">
                  <h3 className="text-xs font-black uppercase text-white/30 tracking-[0.3em] flex items-center gap-4">
                    {section === 'Upcoming' ? <Activity className="w-4 h-4 text-blue-500" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    {section} <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                  </h3>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {sectSessions.map((session:any) => (
                      <div key={session.id} className="group bg-gradient-to-br from-[#0c1322] to-[#0a0f1c] rounded-[2rem] border border-white/5 hover:border-blue-500/30 hover:shadow-[0_0_40px_rgba(37,99,235,0.1)] transition-all p-3 relative overflow-hidden flex flex-col sm:flex-row gap-4">
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                           <button onClick={() => handleOpenEdit(session)} className="p-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white shadow border border-blue-500/20 backdrop-blur transition-all"><Edit2 className="w-3.5 h-3.5"/></button>
                           <button onClick={() => setDeleteConfirm({ isOpen: true, id: session.id })} className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white shadow border border-red-500/20 backdrop-blur transition-all"><Trash2 className="w-3.5 h-3.5"/></button>
                        </div>
                        <div className={cn("w-full sm:w-28 h-28 sm:h-full rounded-2xl flex flex-col items-center justify-center border transition-colors shrink-0", section === 'Completed' ? "bg-white/5 border-white/5 text-white/30" : "bg-blue-500/10 border-blue-500/20 text-blue-400")}>
                          <span className="text-4xl font-display font-black leading-none">{session.date.split('-')[2]}</span>
                          <span className="text-[10px] font-black uppercase tracking-widest mt-1">{months[parseInt(session.date.split('-')[1]) - 1].substring(0, 3)}</span>
                        </div>
                        <div className="flex-1 min-w-0 py-2 pr-12">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={cn("px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border", section === 'Completed' ? "border-white/10 text-white/30 bg-white/5" : "border-blue-500/30 text-blue-400 bg-blue-500/10")}>{session.category}</span>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/40 uppercase tracking-widest"><Clock className="w-3.5 h-3.5 text-yellow-500" /> {session.time}</div>
                          </div>
                          <h4 className="text-lg font-black tracking-tight text-white group-hover:text-amber-400 transition-colors mb-4">{session.title}</h4>
                          <div className="flex flex-wrap gap-4 mt-auto">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-white/50 uppercase tracking-widest"><MapPin className="w-3.5 h-3.5 text-emerald-400" /> {session.location || session.field}</div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-white/50 uppercase tracking-widest"><Users className="w-3.5 h-3.5 text-purple-400" /> {session.coach}</div>
                            {(session.description || session.materials) && <div className="flex items-center gap-2 text-[10px] font-bold text-white/50 uppercase tracking-widest"><BookOpen className="w-3.5 h-3.5 text-pink-400" /> {session.description || session.materials}</div>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                 </div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div key="calendar" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="glass-card rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl bg-[#0a0f1c]/60">
              <div className="grid grid-cols-7 border-b border-white/10 bg-black/40">
                {days.map(day => <div key={day} className="py-5 text-center text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">{day}</div>)}
              </div>
              <div className="grid grid-cols-7">
                {Array.from({ length: 35 }).map((_, i) => {
                  const dayNum = i - startDayOfWeek + 1;
                  const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2,'0')}-${String(dayNum).padStart(2, '0')}`;
                  const daySessions = filteredSessions.filter((s:any) => s.date === dateStr);
                  const isToday = dayNum === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
                  const isCurrentMonth = dayNum > 0 && dayNum <= daysInMonth;
                  
                  return (
                    <div key={i} className={cn("aspect-square p-2 border-r border-b border-white/5 hover:bg-white/[0.04] transition-colors relative min-h-[140px]", !isCurrentMonth && "opacity-20 pointer-events-none")}>
                      <span className={cn("text-xs font-black w-8 h-8 flex items-center justify-center rounded-xl mb-3 mt-1 ml-1", isToday ? "bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.3)]" : "text-white/40")}>{isCurrentMonth ? dayNum : ''}</span>
                      {daySessions.length > 0 && (
                        <div className="space-y-1.5 px-1 h-[90px] overflow-y-auto hide-scrollbar relative z-10 cursor-pointer">
                          {daySessions.map((s:any) => (
                             <div key={s.id} onClick={(e) => { e.stopPropagation(); handleOpenEdit(s); }} className="p-2 rounded-xl bg-gradient-to-br from-blue-600/20 to-blue-800/10 border border-blue-500/20 cursor-pointer hover:border-blue-400/50 hover:bg-blue-600/30 transition-all shadow-md">
                               <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 leading-tight truncate mb-1">{s.category}</p>
                               <p className="text-xs font-bold text-white truncate">{s.title}</p>
                               <p className="text-[9px] font-bold text-blue-300 mt-1">{s.time.split(' - ')[0]}</p>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingSession ? "EDIT SESI LATIHAN" : "TAMBAH SESI LATIHAN"}>
        <form onSubmit={handleSubmit} className="p-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-2 block">Judul Latihan</label>
              <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-black/60 border border-white/10 rounded-2xl py-4 px-5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-bold" placeholder="Cth: Tactical Awareness" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-2 block">Tanggal</label>
              <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full bg-black/60 border border-white/10 rounded-2xl py-4 px-5 text-sm text-white focus:outline-none focus:border-blue-500 [color-scheme:dark] transition-all font-bold" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-2 block">Waktu / Jam</label>
              <input type="text" required value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} className="w-full bg-black/60 border border-white/10 rounded-2xl py-4 px-5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all font-bold" placeholder="16:00 - 18:00" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-2 block">Kategori</label>
              <select required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-black/60 border border-white/10 rounded-2xl py-4 px-5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all font-bold appearance-none">
                <option value="" disabled>Pilih Kategori</option>
                {CATEGORIES.filter(c => c !== 'Semua Tim').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-2 block">Pelatih</label>
              <input type="text" required value={formData.coach} onChange={(e) => setFormData({...formData, coach: e.target.value})} className="w-full bg-black/60 border border-white/10 rounded-2xl py-4 px-5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all font-bold" placeholder="Cth: Coach Andre" />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-2 block">Lapangan / Lokasi</label>
              <input type="text" required value={formData.location || (formData as any).field || ''} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full bg-black/60 border border-white/10 rounded-2xl py-4 px-5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all font-bold" placeholder="Cth: Lapangan A" />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-2 block">Materi Latihan (Opsional)</label>
              <input type="text" value={formData.description || (formData as any).materials || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-black/60 border border-white/10 rounded-2xl py-4 px-5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all font-bold" placeholder="Cth: Ball Control Drill" />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-2 block">Catatan Khusus (Opsional)</label>
              <textarea value={formData.notes || ''} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="w-full bg-black/60 border border-white/10 rounded-2xl py-4 px-5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all resize-none h-24" placeholder="Tulis catatan tambahan..."></textarea>
            </div>
            <div className="col-span-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-4 block">Status Latihan</label>
              <div className="flex gap-4">
                {['Upcoming', 'Completed'].map(s => (
                  <label key={s} className="flex-1 cursor-pointer">
                    <input type="radio" name="status" value={s} checked={formData.status === s} onChange={(e) => setFormData({...formData, status: e.target.value})} className="peer hidden" />
                    <div className="text-center py-4 px-4 rounded-2xl border border-white/10 text-xs font-black uppercase tracking-widest text-white/50 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-500 peer-checked:shadow-[0_10px_20px_rgba(37,99,235,0.2)] transition-all">
                      {s}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="pt-6 flex gap-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-xs font-black text-white/40 border border-white/10 rounded-2xl hover:bg-white/5 transition-all uppercase tracking-[0.2em]">Batalkan</button>
            <button type="submit" className="flex-1 py-4 text-xs font-black text-black bg-blue-500 rounded-2xl hover:bg-blue-400 shadow-[0_10px_30px_rgba(59,130,246,0.3)] transition-all uppercase tracking-[0.2em]">Simpan Jadwal</button>
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
