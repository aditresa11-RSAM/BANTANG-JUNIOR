import React, { useState } from 'react';
import Layout from '../components/ui/Layout';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Calendar, Search, Filter, CheckCircle2, XCircle, Clock, 
  AlertCircle, FileDown, ChevronRight, User, TrendingUp, FilterX
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useCMSData } from '../lib/store';

export default function Attendance() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterCat, setFilterCat] = useState('All');
  const [search, setSearch] = useState('');
  const { data: players } = useCMSData('players', []);
  const { data: attendance, addItems: addAttendance } = useCMSData('attendance', []);

  const categories = ['All', 'U10', 'U12', 'U15', 'U17'];

  const filteredPlayers = players.filter(p => {
    const matchCat = filterCat === 'All' || p.category === filterCat;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const getStatus = (playerId: string) => {
    return attendance.find(a => a.player_id === playerId && a.date === date)?.status || 'none';
  };

  const handleStatusChange = (playerId: string, status: string) => {
    const record = attendance.find(a => a.player_id === playerId && a.date === date);
    if (record) {
       addAttendance({ player_id: playerId, date, status, id: record.id });
    } else {
       addAttendance({ player_id: playerId, date, status });
    }
  };

  const stats = {
    present: filteredPlayers.filter(p => getStatus(p.id) === 'present').length,
    late: filteredPlayers.filter(p => getStatus(p.id) === 'late').length,
    sick: filteredPlayers.filter(p => getStatus(p.id) === 'sick').length,
    absent: filteredPlayers.filter(p => getStatus(p.id) === 'absent').length,
    total: filteredPlayers.length
  };

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-display font-black text-white tracking-tight uppercase flex items-center gap-3">
              Absensi <span className="text-[var(--color-primary)]">Pemain</span>
            </h1>
            <p className="text-sm text-white/40 font-medium uppercase tracking-widest flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--color-primary)]" />
              Monitoring Kehadiran & Kedisiplinan
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/10 transition-all">
              <FileDown className="w-4 h-4" /> Export Laporan
            </button>
            <div className="flex-1 lg:flex-none relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[var(--color-primary)] [color-scheme:dark]" 
              />
            </div>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Hadir" value={stats.present} total={stats.total} color="text-emerald-400" icon={CheckCircle2} />
          <StatCard label="Telat" value={stats.late} total={stats.total} color="text-amber-400" icon={Clock} />
          <StatCard label="Izin/Sakit" value={stats.sick} total={stats.total} color="text-blue-400" icon={AlertCircle} />
          <StatCard label="Alpa" value={stats.absent} total={stats.total} color="text-red-400" icon={XCircle} />
        </div>

        {/* CONTROLS */}
        <div className="glass-card p-4 rounded-3xl border border-white/10 flex flex-col md:flex-row items-center gap-4">
          <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5 w-full md:w-auto overflow-x-auto hide-scrollbar">
            {categories.map(c => (
              <button 
                key={c} 
                onClick={() => setFilterCat(c)} 
                className={cn(
                  "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap", 
                  filterCat === c ? "bg-white/10 text-white shadow-xl" : "text-white/30 hover:text-white/60"
                )}
              >
                {c === 'All' ? 'Semua Kategori' : c}
              </button>
            ))}
          </div>
          
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input 
              type="text" 
              placeholder="Cari nama pemain..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[var(--color-primary)] transition-all" 
            />
          </div>
          
          <button className="p-3.5 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-white hover:bg-white/10 transition-all">
            <FilterX className="w-5 h-5" />
          </button>
        </div>

        {/* PLAYERS LIST/TABLE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredPlayers.map((p, idx) => (
              <motion.div 
                key={p.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card p-4 rounded-3xl border border-white/5 hover:border-white/20 transition-all flex items-center group relative overflow-hidden h-24"
              >
                <div className="w-16 h-16 rounded-2xl bg-black/40 overflow-hidden shrink-0 border border-white/10">
                  <img src={p.photo} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                
                <div className="ml-4 flex-1 min-w-0">
                  <h3 className="text-sm font-black text-white uppercase tracking-tight truncate mb-0.5">{p.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-white/5 text-[9px] font-black text-white/40 uppercase tracking-wider">{p.category}</span>
                    <span className="text-[9px] text-white/20 uppercase font-black tracking-widest">{p.position}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <AttendanceAction status="present" active={getStatus(p.id) === 'present'} onClick={() => handleStatusChange(p.id, 'present')} />
                  <AttendanceAction status="late" active={getStatus(p.id) === 'late'} onClick={() => handleStatusChange(p.id, 'late')} />
                  <AttendanceAction status="sick" active={getStatus(p.id) === 'sick'} onClick={() => handleStatusChange(p.id, 'sick')} />
                  <AttendanceAction status="absent" active={getStatus(p.id) === 'absent'} onClick={() => handleStatusChange(p.id, 'absent')} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredPlayers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <User className="w-12 h-12 text-white/10 mb-4" />
            <p className="text-sm font-black text-white/20 uppercase tracking-[0.2em]">Pemain tidak ditemukan</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

function StatCard({ label, value, total, color, icon: Icon }: any) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="glass-card p-5 rounded-3xl border border-white/10 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-[0.15] transition-opacity">
        <Icon className="w-16 h-16" />
      </div>
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{label}</p>
          <span className={cn("text-[10px] font-black", color)}>{percentage}%</span>
        </div>
        <div className="flex items-baseline gap-2">
          <h4 className="text-3xl font-display font-black text-white tracking-tighter">{value}</h4>
          <span className="text-xs text-white/20 uppercase font-black tracking-widest">/ {total}</span>
        </div>
        <div className="mt-4 w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            className={cn("h-full rounded-full", color.replace('text-', 'bg-'))}
          />
        </div>
      </div>
    </div>
  );
}

function AttendanceAction({ status, active, onClick }: { status: string, active: boolean, onClick: () => void }) {
  const configs: Record<string, any> = {
    present: { icon: CheckCircle2, activeColor: 'bg-emerald-500 text-black', hoverColor: 'hover:bg-emerald-500/20 hover:text-emerald-400', label: 'H' },
    late: { icon: Clock, activeColor: 'bg-amber-500 text-black', hoverColor: 'hover:bg-amber-500/20 hover:text-amber-400', label: 'T' },
    sick: { icon: AlertCircle, activeColor: 'bg-blue-500 text-black', hoverColor: 'hover:bg-blue-500/20 hover:text-blue-400', label: 'I' },
    absent: { icon: XCircle, activeColor: 'bg-red-500 text-black', hoverColor: 'hover:bg-red-500/20 hover:text-red-400', label: 'A' },
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-10 h-10 rounded-xl flex flex-col items-center justify-center transition-all border shrink-0",
        active 
          ? cn(config.activeColor, "border-transparent shadow-lg scale-110") 
          : cn("bg-black/40 border-white/10 text-white/20", config.hoverColor)
      )}
    >
      <Icon className="w-4 h-4 mb-0.5" />
      <span className="text-[8px] font-black">{config.label}</span>
    </button>
  );
}
