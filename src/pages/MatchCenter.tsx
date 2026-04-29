import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Target, Users, MapPin, Clock, Calendar, ChevronRight, TrendingUp, Activity, Award, Zap, BarChart2, Table as TableIcon, Plus, Edit2, Trash2, Save, Image as ImageIcon, Loader2 } from 'lucide-react';
import Layout from '../components/ui/Layout';
import { cn } from '../lib/utils';
import { useSettings } from '../App';
import { useCMSData } from '../lib/store';
import { uploadFile } from '../lib/supabase';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';

const initialUpcomingMatches = [
  { id: '1', tournament: 'Bantang Academy League', rival: 'City Football Academy', rivalLogo: 'https://cdn-icons-png.flaticon.com/128/3163/3163351.png', date: '2026-05-02', time: '15:00', venue: 'Gelora Bantang Stadium', category: 'U15' },
  { id: '2', tournament: 'Regional Junior Cup', rival: 'Persija Academy', rivalLogo: 'https://cdn-icons-png.flaticon.com/128/3163/3163351.png', date: '2026-05-04', time: '09:00', venue: 'National Training Center', category: 'U12' },
];

const initialResults = [
  { id: '1', tournament: 'Friendly Match', rival: 'United FA', score: '3 - 1', date: '2026-04-24', category: 'U14', result: 'Win', scorers: ['Alvaro (2)', 'De Bruyne'] },
  { id: '2', tournament: 'Bantang Academy League', rival: 'Red Bull Academy', score: '2 - 2', date: '2026-04-20', category: 'U15', result: 'Draw', scorers: ['Alvaro', 'Haaland'] },
];

export default function MatchCenter() {
  const { appName, logoUrl } = useSettings();
  const { data: upcomingMatches, addItems: addUpcoming, updateItem: updateUpcoming, deleteItem: deleteUpcoming } = useCMSData('upcoming_matches', initialUpcomingMatches);
  const { data: results, addItems: addResult, updateItem: updateResult, deleteItem: deleteResult } = useCMSData('match_results', initialResults);

  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingMatch, setEditingMatch] = useState<any>(null);
  const [matchType, setMatchType] = useState<'upcoming' | 'result'>('upcoming');
  const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, id: string, type: 'upcoming' | 'result'}>({ isOpen: false, id: '', type: 'upcoming' });
  const [matchForm, setMatchForm] = useState({
    tournament: '', rival: '', rivalLogo: '', date: '', time: '', venue: '', category: '', score: '', result: 'Win', scorers: [] as string[]
  });

  const handleOpenAdd = (type: 'upcoming' | 'result') => {
    setMatchType(type);
    setEditingMatch(null);
    setMatchForm({ tournament: '', rival: '', rivalLogo: '', date: '', time: '', venue: '', category: '', score: '0 - 0', result: 'Win', scorers: [] });
    setIsMatchModalOpen(true);
  };

  const handleOpenEdit = (match: any, type: 'upcoming' | 'result') => {
    setMatchType(type);
    setEditingMatch(match);
    // Normalize: ensure scorers is an array
    const normalizedMatch = {
      ...match,
      scorers: Array.isArray(match.scorers) ? match.scorers : []
    };
    setMatchForm(normalizedMatch);
    setIsMatchModalOpen(true);
  };

  const handleMatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (matchType === 'upcoming') {
      if (editingMatch) updateUpcoming(editingMatch.id, matchForm);
      else addUpcoming({ ...matchForm, rivalLogo: matchForm.rivalLogo || 'https://cdn-icons-png.flaticon.com/128/3163/3163351.png' });
    } else {
      if (editingMatch) updateResult(editingMatch.id, matchForm);
      else addResult(matchForm);
    }
    setIsMatchModalOpen(false);
  };

  const handleRivalLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const publicUrl = await uploadFile(file, 'matches');
        if (publicUrl) {
          setMatchForm({ ...matchForm, rivalLogo: publicUrl });
        }
      } catch (error) {
        console.error("Upload failed:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <Layout>
      <div className="space-y-10 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-display font-bold text-glow uppercase tracking-tight">MATCH CENTER</h1>
            <p className="text-white/40 text-sm">CMS Admin: Kelola jadwal pertandingan, hasil, dan statistik tim.</p>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => handleOpenAdd('upcoming')} className="glow-button !py-2 flex items-center gap-2">
                <Plus className="w-4 h-4" /> Tambah Jadwal
             </button>
             <button onClick={() => handleOpenAdd('result')} className="px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold hover:bg-green-500/20 transition-all flex items-center gap-2">
                <Plus className="w-4 h-4" /> Input Hasil
             </button>
          </div>
        </div>

        {/* Hero Upcoming Match */}
        <div className="relative overflow-hidden glass-card">
           <div className="absolute inset-0 z-0">
              <img src="https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&q=80&w=2693" className="w-full h-full object-cover opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/80 to-transparent" />
           </div>
           
           {upcomingMatches.length > 0 && (
             <div className="relative z-10 p-10 flex flex-col items-center">
                <div className="px-4 py-1.5 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 text-[var(--color-primary)] text-xs font-black uppercase tracking-widest mb-8">
                   NEXT MATCH • {upcomingMatches[0].tournament}
                </div>

                <div className="flex items-center justify-center gap-8 md:gap-24 mb-10 w-full max-w-4xl px-4">
                   <div className="flex flex-col items-center gap-6 flex-1">
                      <div className="w-32 h-32 md:w-40 md:h-40 flex items-center justify-center shrink-0">
                         {logoUrl ? (
                           <img src={logoUrl} alt="Home Team" className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(250,204,21,0.2)]" />
                         ) : (
                           <Trophy className="w-20 h-20 text-[var(--color-primary)] drop-shadow-[0_0_20px_rgba(250,204,21,0.2)]" />
                         )}
                      </div>
                      <div className="text-center w-full px-2 mt-4">
                         <p className="text-xl md:text-3xl font-display font-black tracking-tight text-[var(--color-primary)] uppercase break-words line-clamp-2 leading-tight">{appName}</p>
                         <p className="text-[10px] text-white/40 uppercase font-black mt-1">HOME</p>
                      </div>
                   </div>

                   <div className="flex flex-col items-center">
                      <div className="text-5xl md:text-7xl font-display font-black text-white/10 tracking-tighter mb-4 uppercase">VS</div>
                      <div className="px-5 py-2 glass-card border-[var(--color-primary)]/20 text-[var(--color-primary)] text-xl font-display font-black shadow-[0_0_20px_var(--color-primary-glow)]">
                         {upcomingMatches[0].time}
                      </div>
                   </div>

                   <div className="flex flex-col items-center gap-6 flex-1">
                      <div className="w-32 h-32 md:w-40 md:h-40 flex items-center justify-center shrink-0">
                         <img src={upcomingMatches[0].rivalLogo || upcomingMatches[0].rivallogo} className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.1)] grayscale-0" />
                      </div>
                      <div className="text-center w-full px-2 mt-4">
                         <p className="text-xl md:text-3xl font-display font-black tracking-tight uppercase break-words line-clamp-2 leading-tight">{upcomingMatches[0].rival}</p>
                         <p className="text-[10px] text-white/40 uppercase font-black mt-1">AWAY</p>
                      </div>
                   </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-8 text-white/40">
                   <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[var(--color-primary)]" />
                      <span className="text-xs font-bold uppercase tracking-widest">{upcomingMatches[0].date}</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[var(--color-primary)]" />
                      <span className="text-xs font-bold uppercase tracking-widest">{upcomingMatches[0].venue}</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[var(--color-primary)]" />
                      <span className="text-xs font-bold uppercase tracking-widest">{upcomingMatches[0].category}</span>
                   </div>
                </div>
             </div>
           )}
        </div>

        {/* List Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Upcoming List */}
           <div className="space-y-6">
              <h3 className="text-xs font-black uppercase text-white/20 tracking-[0.3em] flex items-center gap-3">
                 UPCOMING <div className="h-px flex-1 bg-white/5" />
              </h3>
              <div className="space-y-4">
                 {upcomingMatches.map((match: any) => (
                   <div key={match.id} className="glass-card p-6 flex items-center gap-6 group hover:bg-white/[0.02] transition-colors relative h-28">
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                          <button onClick={() => handleOpenEdit(match, 'upcoming')} className="p-2 rounded-lg bg-black/40 text-blue-400 hover:text-white transition-colors"><Edit2 className="w-3.5 h-3.5"/></button>
                          <button onClick={() => setDeleteConfirm({ isOpen: true, id: match.id, type: 'upcoming' })} className="p-2 rounded-lg bg-black/40 text-red-500 hover:text-white transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex flex-col items-center justify-center text-center border border-white/5">
                        <span className="text-xs font-bold leading-none text-white">{(match.date || '').split('-')[2] || '--'}</span>
                        <span className="text-[9px] uppercase text-white/40 mt-1">{(match.date || '').split('-')[1] ? new Date(match.date).toLocaleString('default', { month: 'short' }).toUpperCase() : 'MAY'}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-[9px] font-black text-[var(--color-primary)] uppercase tracking-widest mb-1">{match.category} • {match.tournament}</p>
                        <h4 className="font-bold flex flex-wrap items-center gap-2 text-white text-sm">
                           <span>{appName}</span> <span className="text-white/30 text-[10px] uppercase font-black px-1">vs</span> <span>{match.rival}</span>
                        </h4>
                      </div>
                      <div className="text-right">
                         <p className="text-xs font-black uppercase flex items-center gap-2 justify-end text-white/60">
                            <Clock className="w-3 h-3 text-[var(--color-primary)]" /> {match.time}
                         </p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           {/* Results List */}
           <div className="space-y-6">
              <h3 className="text-xs font-black uppercase text-white/20 tracking-[0.3em] flex items-center gap-3">
                 RECENT RESULTS <div className="h-px flex-1 bg-white/5" />
              </h3>
              <div className="space-y-4">
                 {results.map((match: any) => (
                   <div key={match.id} className="glass-card p-6 block group hover:bg-white/[0.02] transition-colors relative">
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                          <button onClick={() => handleOpenEdit(match, 'result')} className="p-2 rounded-lg bg-black/40 text-blue-400 hover:text-white transition-colors"><Edit2 className="w-3.5 h-3.5"/></button>
                          <button onClick={() => setDeleteConfirm({ isOpen: true, id: match.id, type: 'result' })} className="p-2 rounded-lg bg-black/40 text-red-500 hover:text-white transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                         <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">{match.category} • {match.tournament}</span>
                         <span className={cn(
                           "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                           match.result === 'Win' ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-white/5 text-white/40 border border-white/5"
                         )}>{match.result}</span>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                         <div className="flex items-center gap-4 flex-1 min-w-0">
                           <div className="w-12 h-12 shrink-0 flex items-center justify-center">
                             {logoUrl ? <img src={logoUrl} className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(250,204,21,0.15)]" /> : <Trophy className="w-6 h-6 text-[var(--color-primary)]" />}
                           </div>
                           <span className="font-bold text-[var(--color-primary)] uppercase min-w-0 flex-1 break-words line-clamp-2 text-sm leading-tight">{appName}</span>
                         </div>
                         <div className="text-2xl md:text-3xl font-display font-black tracking-tighter text-white px-6 shrink-0">{match.score}</div>
                         <div className="flex items-center gap-4 flex-1 justify-end min-w-0">
                           <span className="font-bold text-white uppercase text-right break-words line-clamp-2 text-sm leading-tight">{match.rival}</span>
                           <div className="w-12 h-12 shrink-0 flex items-center justify-center">
                              <img src={match.rivalLogo || match.rivallogo} alt={match.rival} className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]" />
                           </div>
                         </div>
                      </div>
                      <div className="flex items-center justify-between">
                         <div className="flex gap-2 flex-wrap">
                           {Array.isArray(match.scorers) && match.scorers.map((s: string) => (
                             <span key={s} className="text-[9px] text-white/30 flex items-center gap-1 uppercase"><Zap className="w-2.5 h-2.5" /> {s}</span>
                           ))}
                         </div>
                         <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10">
                            <BarChart2 className="w-4 h-4 text-white/40" />
                         </button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      <Modal
        isOpen={isMatchModalOpen}
        onClose={() => setIsMatchModalOpen(false)}
        title={editingMatch ? "Edit Data Pertandingan" : "Tambah Data Pertandingan"}
      >
        <form onSubmit={handleMatchSubmit} className="space-y-4">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 mb-4">
            <button type="button" onClick={() => setMatchType('upcoming')} className={cn("flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all", matchType === 'upcoming' ? "bg-[var(--color-primary)] text-black" : "text-white/40")}>UPCOMING</button>
            <button type="button" onClick={() => setMatchType('result')} className={cn("flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all", matchType === 'result' ? "bg-green-500 text-black" : "text-white/40")}>RESULT</button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Turnamen / Kompetisi</label>
              <input type="text" required value={matchForm.tournament} onChange={(e) => setMatchForm({...matchForm, tournament: e.target.value})} className="w-full bg-surface-raised border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]" placeholder="Cth: Academy League" />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Kategori Tim</label>
              <input type="text" required value={matchForm.category} onChange={(e) => setMatchForm({...matchForm, category: e.target.value})} className="w-full bg-surface-raised border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]" placeholder="U15" />
            </div>

            <div className="col-span-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Lawan (Rival)</label>
              <input type="text" required value={matchForm.rival} onChange={(e) => setMatchForm({...matchForm, rival: e.target.value})} className="w-full bg-surface-raised border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]" placeholder="Cth: Persija Academy" />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Logo Tim Lawan</label>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#0a0f1c] border border-white/10 overflow-hidden relative">
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                      <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    </div>
                  )}
                  {matchForm.rivalLogo ? (
                    <img src={matchForm.rivalLogo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/10">
                       <ImageIcon className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <label className="flex-1 py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-blue-400 text-center cursor-pointer hover:bg-white/10 transition-colors">
                  Upload Logo
                  <input type="file" accept="image/*" className="hidden" onChange={handleRivalLogoUpload} disabled={isUploading} />
                </label>
              </div>
            </div>

            {matchType === 'upcoming' ? (
              <>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Tanggal</label>
                  <input type="date" required value={matchForm.date} onChange={(e) => setMatchForm({...matchForm, date: e.target.value})} className="w-full bg-surface-raised border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--color-primary)] [color-scheme:dark]" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Waktu</label>
                  <input type="text" required value={matchForm.time} onChange={(e) => setMatchForm({...matchForm, time: e.target.value})} className="w-full bg-surface-raised border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]" placeholder="15:00" />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Venue / Lokasi</label>
                  <input type="text" required value={matchForm.venue} onChange={(e) => setMatchForm({...matchForm, venue: e.target.value})} className="w-full bg-surface-raised border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]" placeholder="Gelora Bantang" />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Score (Home - Away)</label>
                  <input type="text" required value={matchForm.score} onChange={(e) => setMatchForm({...matchForm, score: e.target.value})} className="w-full bg-surface-raised border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]" placeholder="3 - 1" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Hasil</label>
                  <select value={matchForm.result} onChange={(e) => setMatchForm({...matchForm, result: e.target.value})} className="w-full bg-surface-raised border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]">
                    <option value="Win">Win</option>
                    <option value="Draw">Draw</option>
                    <option value="Loss">Loss</option>
                  </select>
                </div>
                <div className="col-span-2">
                   <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Pencetak Gol (Pisah Koma)</label>
                   <input type="text" value={(matchForm.scorers || []).join(', ')} onChange={(e) => setMatchForm({...matchForm, scorers: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '')})} className="w-full bg-surface-raised border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]" placeholder="Alvaro, Haaland" />
                </div>
              </>
            )}
          </div>

          <div className="pt-6 flex gap-3">
             <button type="button" onClick={() => setIsMatchModalOpen(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-colors">
               Batal
             </button>
             <button type="submit" className="flex-1 py-3 rounded-xl bg-[var(--color-primary)] text-black font-bold text-sm hover:shadow-[0_0_20px_var(--color-primary-glow)] transition-all">
               <Save className="w-4 h-4" /> Simpan
             </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal 
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '', type: 'upcoming' })}
        onConfirm={() => {
          if (deleteConfirm.type === 'upcoming') deleteUpcoming(deleteConfirm.id);
          else deleteResult(deleteConfirm.id);
        }}
        message={`Yakin ingin menghapus pertandingan ini?`}
      />
    </Layout>
  );
}

