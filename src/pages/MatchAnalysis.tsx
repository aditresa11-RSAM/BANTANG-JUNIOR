import React, { useState, useEffect } from 'react';
import Layout from '../components/ui/Layout';
import { useCMSData } from '../lib/store';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, Users, Trophy, Target, Video, Activity, Zap, 
  Shield, Play, AlertCircle, Edit, Trash2, Plus, Download, 
  ChevronDown, Hexagon, FileText, Crosshair
} from 'lucide-react';
import { cn } from '../lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Modal } from '../components/ui/Modal';
import { supabase } from '../lib/supabase';
import { useSettings } from '../App';

const getEmbedInfo = (url: string) => {
  if (!url) return null;
  if (url.includes('supabase.co') && url.endsWith('.mp4')) {
    return {
      type: 'raw',
      embedUrl: url,
      thumbnail: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=2693'
    };
  }
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})/);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=0&rel=0&modestbranding=1`,
      thumbnail: `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`
    };
  }
  const driveMatch = url.match(/(?:drive\.google\.com\/file\/d\/|drive\.google\.com\/open\?id=)([^/]+)/);
  if (driveMatch && driveMatch[1]) {
    return {
      type: 'drive',
      embedUrl: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
      thumbnail: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=2693'
    };
  }
  return null;
};

const HeatmapOverlay = () => (
  <div className="absolute inset-0 z-10 pointer-events-none opacity-80 mix-blend-screen" style={{
    backgroundImage: `radial-gradient(circle at 20% 50%, rgba(250,204,21,0.6) 0%, transparent 40%),
                      radial-gradient(circle at 70% 30%, rgba(239,68,68,0.5) 0%, transparent 40%),
                      radial-gradient(circle at 80% 70%, rgba(59,130,246,0.4) 0%, transparent 50%),
                      radial-gradient(circle at 40% 60%, rgba(250,204,21,0.4) 0%, transparent 30%)`,
    filter: 'blur(8px)'
  }} />
);

export default function MatchAnalysis() {
  const { logoUrl } = useSettings();
  const { data: dbMatches } = useCMSData('match_results', []);
  const { data: dbMatchStats, updateItem: updateStats, addItems: addStats } = useCMSData('match_stats', []);
  const { data: dbPlayerStats, updateItem: updatePStat, addItems: addPStat, deleteItem: delPStat } = useCMSData('player_match_stats', []);
  const { data: dbCoachNotes, updateItem: updateNote, addItems: addNote } = useCMSData('coach_notes', []);
  const { data: dbHighlights, updateItem: updateVideo, addItems: addVideo, deleteItem: delVideo } = useCMSData('match_highlights', []);

  // Sort matches by date DESC
  const displayMatches = [...(dbMatches || [])].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const [activeTab, setActiveTab] = useState('ringkasan');
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);

  const currentMatchId = activeMatchId || (displayMatches[0]?.id || null);
  const selectedMatch = displayMatches.find((m: any) => m.id === currentMatchId) || null;

  const currentStats = dbMatchStats?.find((s: any) => s.match_id === currentMatchId) || { possession: 0, shots: 0, shots_on_target: 0, pass_accuracy: 0 };
  const currentPlayers = dbPlayerStats?.filter((p: any) => p.match_id === currentMatchId) || [];
  const currentCoachNote = dbCoachNotes?.find((n: any) => n.match_id === currentMatchId);
  const currentHighlights = dbHighlights?.filter((v: any) => v.match_id === currentMatchId) || [];

  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [statsForm, setStatsForm] = useState({ 
    possession: 58, shots: 16, shots_on_target: 8, pass_accuracy: 85, score: '3 - 1',
    gk_saves: 0, gk_conceded: 0, gk_clean_sheet: false, gk_save_pct: 0,
    gk_high_claim: 0, gk_punches: 0, gk_sweeper: 0, gk_errors: 0, gk_dist_pct: 0
  });

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteForm, setNoteForm] = useState({ note: '' });

  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [playerForm, setPlayerForm] = useState({ name: '', rating: 7.5, position: 'FW', goals: 0, passing: 80, photo: '' });

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoForm, setVideoForm] = useState({ id: null, title: '', url: '', category: 'Goal', minute: '', desc: '', file: null as File | null });
  const [isUploading, setIsUploading] = useState(false);
  const [videoError, setVideoError] = useState('');
  
  const [activeVideo, setActiveVideo] = useState<any>(null); // For fullscreen player

  const tabs = [
    { id: 'ringkasan', label: 'RINGKASAN', icon: Activity },
    { id: 'statistik', label: 'STATISTIK', icon: BarChart3 },
    { id: 'taktik', label: 'TAKTIK', icon: Target },
    { id: 'pemain', label: 'PLAYER ANALYSIS', icon: Users },
    { id: 'highlights', label: 'HIGHLIGHTS', icon: Video },
    { id: 'catatan', label: 'CATATAN PELATIH', icon: Edit }
  ];

  // Derived / Mock values for visual completeness
  const statVal = (val: number) => val || 0;
  const oppPossession = 100 - statVal(currentStats.possession);
  const oppShots = Math.max(0, Math.floor(statVal(currentStats.shots) * 0.6));
  const oppShotsTarget = Math.max(0, Math.floor(statVal(currentStats.shots_on_target) * 0.5));
  const oppPassAcc = Math.max(40, statVal(currentStats.pass_accuracy) - 7);
  
  const corners = Math.max(0, Math.floor(statVal(currentStats.shots) * 0.4));
  const oppCorners = Math.max(0, Math.floor(oppShots * 0.4));
  const fouls = 12;
  const oppFouls = 10;
  const offsides = 2;
  const oppOffsides = 1;
  const yellowCards = 1;
  const redCards = 0;

  const manOfTheMatch = currentPlayers.length > 0 
    ? currentPlayers.reduce((prev: any, current: any) => (prev.rating > current.rating) ? prev : current)
    : null;

  // HANDLERS
  const handleEditStats = () => {
    if (!currentMatchId) return;
    setStatsForm({
      possession: statVal(currentStats?.possession) || 58,
      shots: statVal(currentStats?.shots) || 16,
      shots_on_target: statVal(currentStats?.shots_on_target) || 8,
      pass_accuracy: statVal(currentStats?.pass_accuracy) || 85,
      score: currentStats?.score || selectedMatch?.score || "0 - 0",
      gk_saves: statVal(currentStats?.gk_saves) || 0,
      gk_conceded: statVal(currentStats?.gk_conceded) || 0,
      gk_clean_sheet: currentStats?.gk_clean_sheet || false,
      gk_save_pct: statVal(currentStats?.gk_save_pct) || 0,
      gk_high_claim: statVal(currentStats?.gk_high_claim) || 0,
      gk_punches: statVal(currentStats?.gk_punches) || 0,
      gk_sweeper: statVal(currentStats?.gk_sweeper) || 0,
      gk_errors: statVal(currentStats?.gk_errors) || 0,
      gk_dist_pct: statVal(currentStats?.gk_dist_pct) || 0
    });
    setIsStatsModalOpen(true);
  };

  const saveStats = () => {
    if (!currentMatchId) return;
    const payload = { 
      match_id: currentMatchId, 
      possession: Number(statsForm.possession), 
      shots: Number(statsForm.shots), 
      shots_on_target: Number(statsForm.shots_on_target), 
      pass_accuracy: Number(statsForm.pass_accuracy),
      score: statsForm.score,
      gk_saves: Number(statsForm.gk_saves),
      gk_conceded: Number(statsForm.gk_conceded),
      gk_clean_sheet: Boolean(statsForm.gk_clean_sheet),
      gk_save_pct: Number(statsForm.gk_save_pct),
      gk_high_claim: Number(statsForm.gk_high_claim),
      gk_punches: Number(statsForm.gk_punches),
      gk_sweeper: Number(statsForm.gk_sweeper),
      gk_errors: Number(statsForm.gk_errors),
      gk_dist_pct: Number(statsForm.gk_dist_pct)
    };
    if (currentStats?.id) {
      updateStats(currentStats.id, payload);
    } else {
      addStats(payload);
    }
    setIsStatsModalOpen(false);
  };

  const handleEditNote = () => {
     if (!currentMatchId) return;
     setNoteForm({ note: currentCoachNote?.note || "" });
     setIsNoteModalOpen(true);
  };

  const saveNote = () => {
     if (!currentMatchId) return;
     if (currentCoachNote?.id) {
        updateNote(currentCoachNote.id, { note: noteForm.note });
     } else {
        addNote({ match_id: currentMatchId, note: noteForm.note });
     }
     setIsNoteModalOpen(false);
  };

  const handleAddPlayer = () => {
     if (!currentMatchId) return;
     setPlayerForm({ name: '', rating: 7.5, position: 'FW', goals: 0, passing: 80, photo: '' });
     setIsPlayerModalOpen(true);
  };

  const savePlayer = () => {
     if (!currentMatchId || !playerForm.name.trim()) return;
     addPStat({ match_id: currentMatchId, name: playerForm.name, rating: Number(playerForm.rating), position: playerForm.position, goals: playerForm.goals, passing: playerForm.passing, photo: playerForm.photo });
     setIsPlayerModalOpen(false);
  };

  const handleAddVideo = () => {
     if (!currentMatchId) return;
     setVideoForm({ id: null, title: '', url: '', category: 'Goal', minute: '', desc: '', file: null });
     setVideoError('');
     setIsVideoModalOpen(true);
  };

  const saveVideo = async () => {
     if (!currentMatchId) return;
     if (!videoForm.title) { setVideoError('Judul wajib diisi.'); return; }
     setIsUploading(true);
     setVideoError('');
     
     let finalUrl = videoForm.url;
     if (videoForm.file) {
        const fileExt = videoForm.file.name.split('.').pop() || 'mp4';
        const fileName = `${currentMatchId}_${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage.from('match-videos').upload(fileName, videoForm.file);
        if (uploadError) { setVideoError(`Upload gagal: ${uploadError.message}`); setIsUploading(false); return; }
        const { data: { publicUrl } } = supabase.storage.from('match-videos').getPublicUrl(fileName);
        finalUrl = publicUrl;
     } else if (!finalUrl) {
       setVideoError('Harap upload video atau masukkan link.'); setIsUploading(false); return;
     }

     const payload = { 
       match_id: currentMatchId, title: videoForm.title, url: finalUrl, 
       category: videoForm.category, minute: videoForm.minute, description: videoForm.desc 
     };

     if (videoForm.id) updateVideo(videoForm.id, payload);
     else addVideo(payload);
     
     setIsUploading(false);
     setIsVideoModalOpen(false);
  };

  const renderComparisonBar = (label: string, leftLabel: string, rightLabel: string, leftPct: number, rightPct: number) => (
    <div className="flex items-center gap-4 text-xs font-black">
       <span className="w-8 text-[var(--color-primary)] text-right">{leftLabel}</span>
       <div className="flex-1 flex gap-1 h-1.5 opacity-80">
          <div className="h-full bg-[var(--color-primary)] rounded-l-full transition-all" style={{ width: `${leftPct}%` }} />
          <div className="h-full bg-indigo-500 rounded-r-full transition-all" style={{ width: `${rightPct}%` }} />
       </div>
       <span className="w-24 text-center text-white/50 uppercase tracking-widest">{label}</span>
       <div className="flex-1 flex gap-1 h-1.5 opacity-80">
          <div className="h-full bg-indigo-500 rounded-l-full transition-all" style={{ width: `${rightPct}%` }} />
          <div className="h-full bg-[var(--color-primary)] rounded-r-full transition-all" style={{ width: `${leftPct}%` }} />
       </div>
       <span className="w-8 text-indigo-400 text-left">{rightLabel}</span>
    </div>
  );

  return (
    <Layout>
      <div className="w-full max-w-[1600px] mx-auto pb-20 animate-in fade-in duration-700">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
             <img src={logoUrl || 'https://cdn-icons-png.flaticon.com/128/3163/3163351.png'} className="w-12 h-12 md:w-16 md:h-16 object-contain" />
             <div>
                <h1 className="text-2xl md:text-4xl font-display font-black text-white tracking-tighter uppercase text-glow">
                   ANALISA <span className="text-[var(--color-primary)]">PERTANDINGAN</span>
                </h1>
                <p className="text-[10px] md:text-xs text-white/50 uppercase tracking-[0.2em] mt-1">
                   Analisa lengkap performa tim dan pemain dalam setiap pertandingan.
                </p>
             </div>
          </div>

          <div className="relative group w-full md:w-auto min-w-[250px]">
             <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Target className="w-4 h-4 text-[var(--color-primary)]" />
             </div>
             <select 
                value={currentMatchId || ''}
                onChange={(e) => setActiveMatchId(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-[#0a1428] border border-white/20 rounded-xl text-sm font-bold text-white appearance-none hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all cursor-pointer outline-none shadow-[0_0_20px_rgba(0,0,0,0.5)]"
             >
                {displayMatches.map((m: any) => (
                  <option key={m.id} value={m.id} className="bg-[#0B1D3A]">
                    vs {m.rival} ({m.date})
                  </option>
                ))}
             </select>
             <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <ChevronDown className="w-4 h-4 text-white/40 group-hover:text-[var(--color-primary)] transition-colors" />
             </div>
          </div>
        </div>

        {displayMatches.length === 0 || !selectedMatch ? (
           <div className="flex flex-col items-center justify-center py-32 text-center glass-card border border-white/5 rounded-3xl">
              <Trophy className="w-20 h-20 text-[var(--color-primary)]/20 mb-6 drop-shadow-[0_0_20px_rgba(250,204,21,0.2)]" />
              <h3 className="text-2xl font-display font-black text-white uppercase tracking-widest mb-2">Belum ada data pertandingan</h3>
              <p className="text-sm text-white/40 max-w-md">Silakan buat pertandingan dan input hasil di menu Match Center terlebih dahulu. Data akan otomatis muncul di sini.</p>
           </div>
        ) : (
           <div className="space-y-8">
              {/* MATCH SUMMARY CARD */}
              <div className="glass-card p-6 md:p-10 rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#0a1428] to-[#050f1f] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-primary)]/10 blur-[100px] rounded-full pointer-events-none" />
                 <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
                 
                 <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
                    
                    {/* Info */}
                    <div className="lg:w-1/4 w-full text-center lg:text-left">
                       <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
                          <Trophy className="w-5 h-5 text-[var(--color-primary)]" />
                          <span className="text-xs md:text-sm font-black text-white">{selectedMatch.tournament || selectedMatch.category || 'Competitif Match'}</span>
                       </div>
                       <p className="text-[10px] text-white/50 uppercase tracking-widest mb-1">{selectedMatch.date} • {selectedMatch.time || '15:30 WIB'}</p>
                       <p className="text-[10px] text-white/50 uppercase tracking-widest">{selectedMatch.venue || 'Home Stadium'}</p>
                    </div>

                    {/* Score */}
                    <div className="flex-1 flex items-start justify-center gap-4 md:gap-10 w-full">
                       <div className="flex flex-col items-center flex-1">
                          <img src={logoUrl || 'https://cdn-icons-png.flaticon.com/128/3163/3163351.png'} alt="Home" className="w-16 h-16 md:w-24 md:h-24 object-contain drop-shadow-[0_0_15px_rgba(250,204,21,0.2)] mb-4" />
                          <p className="text-xs md:text-sm font-black text-white px-2 text-center uppercase tracking-widest leading-tight">SSB BANTANG JUNIOR</p>
                          <div className="mt-4 text-[9px] text-white/60 space-y-1 text-center font-medium">
                             {Array.isArray(selectedMatch.scorers) ? selectedMatch.scorers.map((s:string, i:number) => <p key={i}>{s} ⚽</p>) : null}
                          </div>
                       </div>
                       
                       <div className="flex flex-col items-center pt-2 md:pt-4">
                          <div className="flex items-center gap-4 md:gap-8">
                             <span className="text-5xl md:text-7xl font-display font-black text-white drop-shadow-[0_0_20px_rgba(250,204,21,0.3)]">{selectedMatch.score ? selectedMatch.score.split('-')[0]?.trim() : '0'}</span>
                             <div className="flex flex-col items-center px-2">
                               <span className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-widest mb-2 shadow-black drop-shadow-md">Full Time</span>
                               <span className="text-3xl font-black text-white/20">-</span>
                             </div>
                             <span className="text-5xl md:text-7xl font-display font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">{selectedMatch.score ? selectedMatch.score.split('-')[1]?.trim() : '0'}</span>
                          </div>
                          {selectedMatch.result && (
                             <div className={cn("mt-4 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest", 
                               selectedMatch.result === 'Win' ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : 
                               selectedMatch.result === 'Loss' ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : 
                               "bg-amber-500/20 text-amber-400 border border-amber-500/30")}>
                               {selectedMatch.result}
                             </div>
                          )}
                       </div>

                       <div className="flex flex-col items-center flex-1">
                          <img src={selectedMatch.rivallogo || selectedMatch.rivalLogo} alt="Away" className="w-16 h-16 md:w-24 md:h-24 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] mb-4" />
                          <p className="text-xs md:text-sm font-black text-white px-2 text-center uppercase tracking-widest leading-tight">{selectedMatch.rival}</p>
                       </div>
                    </div>

                    {/* Highlight Preview */}
                    <div className="lg:w-1/4 flex justify-center lg:justify-end w-full">
                       {currentHighlights.length > 0 ? (
                          <div className="relative w-full max-w-[220px] aspect-video rounded-2xl overflow-hidden group cursor-pointer border border-white/10 shadow-2xl" onClick={() => setActiveTab('highlights')}>
                             <img src={getEmbedInfo(currentHighlights[0].url)?.thumbnail || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=600'} className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity blur-[1px] group-hover:blur-0" />
                             <div className="absolute inset-0 bg-gradient-to-t from-[#0a1428] via-transparent to-transparent" />
                             <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-10 h-10 bg-[var(--color-primary)] text-black rounded-full flex items-center justify-center translate-y-4 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all shadow-[0_0_20px_rgba(250,204,21,0.5)]">
                                   <Play className="w-4 h-4 ml-1 fill-black" />
                                </div>
                             </div>
                             <div className="absolute top-2 left-2 text-[8px] font-black text-white uppercase bg-black/60 px-2 py-1 rounded backdrop-blur max-w-[90%] truncate">Lihat Highlights</div>
                             <div className="absolute bottom-2 left-2 text-[10px] font-black text-white flex items-center gap-1.5"><Video className="w-3 h-3 text-[var(--color-primary)]" /> {currentHighlights.length} Video</div>
                          </div>
                       ) : (
                          <div className="w-full max-w-[220px] aspect-[16/9] rounded-2xl border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:bg-white/10 hover:border-[var(--color-primary)]/50 transition-colors group" onClick={() => setActiveTab('highlights')}>
                             <Video className="w-6 h-6 text-white/20 mb-2 group-hover:text-[var(--color-primary)] transition-colors" />
                             <p className="text-[10px] text-white/40 group-hover:text-white uppercase font-black tracking-widest">Tambah Video Highlight</p>
                          </div>
                       )}
                    </div>
                 </div>
              </div>

              {/* TABS */}
              <div className="flex border-b border-white/10 overflow-x-auto no-scrollbar">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-6 py-4 text-[10px] md:text-xs font-black uppercase tracking-[0.1em] transition-all whitespace-nowrap relative group",
                      activeTab === tab.id ? "text-[var(--color-primary)]" : "text-white/40 hover:text-white"
                    )}
                  >
                    <tab.icon className={cn("w-4 h-4 transition-transform", activeTab === tab.id ? "scale-110 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" : "")} />
                    {tab.label}
                    {activeTab === tab.id && (
                       <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--color-primary)] drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
                    )}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {activeTab === 'ringkasan' && (
                  <motion.div key="ringkasan" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                     <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Ringkasan Pertandingan</h3>
                        <button onClick={handleEditStats} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition flex items-center gap-2 border border-white/10">
                           <Edit className="w-3.5 h-3.5" /> Edit Stats
                        </button>
                     </div>
                     
                     {/* STATS GRID */}
                     <div className="grid grid-cols-2 lg:grid-cols-8 gap-4">
                        {[
                           { label: 'Possession', val: `${statVal(currentStats.possession)}%`, icon: Activity },
                           { label: 'Total Shots', val: statVal(currentStats.shots), icon: Crosshair },
                           { label: 'Shots on Target', val: statVal(currentStats.shots_on_target), icon: Target },
                           { label: 'Pass Accuracy', val: `${statVal(currentStats.pass_accuracy)}%`, icon: Zap },
                           { label: 'Corners', val: corners, icon: Hexagon },
                           { label: 'Fouls', val: fouls, icon: AlertCircle },
                           { label: 'Yellow Cards', val: yellowCards, icon: FileText, color: 'text-amber-400' },
                           { label: 'Red Cards', val: redCards, icon: FileText, color: 'text-rose-500' }
                        ].map((s, i) => (
                           <div key={i} className="glass-card p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center group hover:bg-white/5 hover:border-white/20 transition-all">
                              <s.icon className={cn("w-6 h-6 mb-3 opacity-50 group-hover:opacity-100 transition-opacity", s.color || "text-white")} />
                              <h4 className="text-xl md:text-2xl font-display font-black text-white leading-none tracking-tight">{s.val}</h4>
                              <p className="text-[9px] text-white/50 uppercase tracking-widest mt-2">{s.label}</p>
                           </div>
                        ))}
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                        {/* HEATMAP / ATTACK DISTRIBUTION */}
                        <div className="glass-card p-6 md:p-8 rounded-[2rem] border border-white/5 relative overflow-hidden">
                           <h4 className="text-xs font-black text-white uppercase tracking-widest mb-6 px-2">Performa Tim</h4>
                           <div className="flex items-center justify-between text-[10px] text-white/50 font-bold uppercase mb-4 px-2 tracking-widest">
                              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" /> Bantang Junior</span>
                              <span>{selectedMatch.rival}</span>
                           </div>
                           
                           {/* Pitch Heatmap Mock */}
                           <div className="w-full aspect-[2/1] bg-green-900 border-2 border-white/20 rounded-xl relative overflow-hidden mb-6">
                              {/* Field Lines */}
                              <div className="absolute inset-0 border border-white/30 m-4 pointer-events-none" />
                              <div className="absolute top-0 bottom-0 left-1/2 -ml-[1px] w-[2px] bg-white/30 pointer-events-none" />
                              <div className="absolute top-1/2 left-1/2 -mt-8 -ml-8 w-16 h-16 border-2 border-white/30 rounded-full pointer-events-none" />
                              <div className="absolute top-1/4 bottom-1/4 left-4 w-16 border-2 border-white/30 border-l-0 pointer-events-none" />
                              <div className="absolute top-1/4 bottom-1/4 right-4 w-16 border-2 border-white/30 border-r-0 pointer-events-none" />
                              <HeatmapOverlay />
                           </div>

                           <h4 className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-4 px-2">Distribusi Serangan</h4>
                           <div className="grid grid-cols-3 gap-2 px-2">
                              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                                 <p className="text-lg font-black text-white">43%</p>
                                 <p className="text-[9px] text-[var(--color-primary)] font-bold uppercase">Kiri</p>
                              </div>
                              <div className="bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 rounded-xl p-3 text-center relative overflow-hidden">
                                 <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary)]/20 to-transparent" />
                                 <p className="text-lg font-black text-[var(--color-primary)] relative z-10">34%</p>
                                 <p className="text-[9px] text-[var(--color-primary)] font-bold uppercase relative z-10">Tengah</p>
                              </div>
                              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                                 <p className="text-lg font-black text-white">23%</p>
                                 <p className="text-[9px] text-white/50 font-bold uppercase">Kanan</p>
                              </div>
                           </div>
                        </div>

                        {/* COMPARISON STATS & MOTM */}
                        <div className="flex flex-col gap-6">
                           <div className="glass-card p-6 md:p-8 rounded-[2rem] border border-white/5 flex-1">
                              <h4 className="text-xs font-black text-white uppercase tracking-widest mb-8 text-center">Statistik Perbandingan</h4>
                              <div className="space-y-6">
                                 {renderComparisonBar('Possession', `${statVal(currentStats.possession)}%`, `${oppPossession}%`, statVal(currentStats.possession), oppPossession)}
                                 {renderComparisonBar('Total Shots', statVal(currentStats.shots).toString(), oppShots.toString(), (statVal(currentStats.shots) / (statVal(currentStats.shots) + oppShots)) * 100 || 50, (oppShots / (statVal(currentStats.shots) + oppShots)) * 100 || 50)}
                                 {renderComparisonBar('Shots on Target', statVal(currentStats.shots_on_target).toString(), oppShotsTarget.toString(), (statVal(currentStats.shots_on_target) / (statVal(currentStats.shots_on_target) + oppShotsTarget)) * 100 || 50, (oppShotsTarget / (statVal(currentStats.shots_on_target) + oppShotsTarget)) * 100 || 50)}
                                 {renderComparisonBar('Pass Accuracy', `${statVal(currentStats.pass_accuracy)}%`, `${oppPassAcc}%`, statVal(currentStats.pass_accuracy), oppPassAcc)}
                                 {renderComparisonBar('Corners', corners.toString(), oppCorners.toString(), (corners/(corners+oppCorners))*100 || 50, (oppCorners/(corners+oppCorners))*100 || 50)}
                                 {renderComparisonBar('Fouls', fouls.toString(), oppFouls.toString(), (fouls/(fouls+oppFouls))*100 || 50, (oppFouls/(fouls+oppFouls))*100 || 50)}
                                 {renderComparisonBar('Offsides', offsides.toString(), oppOffsides.toString(), (offsides/(offsides+oppOffsides))*100 || 50, (oppOffsides/(offsides+oppOffsides))*100 || 50)}
                              </div>
                           </div>

                           {/* MOTM */}
                           {manOfTheMatch && (
                              <div className="glass-card p-4 rounded-3xl border border-[var(--color-primary)]/30 bg-gradient-to-r from-[var(--color-primary)]/10 to-transparent relative overflow-hidden flex items-center justify-between">
                                 <div className="absolute top-0 left-0 w-32 h-32 bg-[var(--color-primary)]/20 blur-[50px] rounded-full" />
                                 <div className="relative z-10 flex items-center gap-4">
                                    <div className="w-14 h-14 bg-black/50 overflow-hidden border border-[var(--color-primary)]/50 rounded-full flex items-center justify-center shrink-0">
                                       {manOfTheMatch.photo ? (
                                         <img src={manOfTheMatch.photo} className="w-full h-full object-cover" />
                                       ) : (
                                         <span className="text-xl font-bold text-[var(--color-primary)]">{manOfTheMatch.name.charAt(0)}</span>
                                       )}
                                    </div>
                                    <div>
                                       <p className="text-[10px] text-[var(--color-primary)] font-black uppercase tracking-widest mb-0.5">Man of the Match</p>
                                       <h4 className="text-base font-black text-white uppercase">{manOfTheMatch.name}</h4>
                                       <p className="text-[10px] text-white/60 font-bold uppercase">{statVal(manOfTheMatch.goals)} Goal • {statVal(manOfTheMatch.passing)}% Pass Acc</p>
                                    </div>
                                 </div>
                                 <div className="relative z-10 bg-[#0a1428] border border-[var(--color-primary)]/30 w-12 h-12 flex flex-col items-center justify-center rounded-xl shadow-[0_0_15px_rgba(250,204,21,0.3)]">
                                    <span className="text-sm font-black text-[var(--color-primary)]">{manOfTheMatch.rating}</span>
                                 </div>
                              </div>
                           )}
                        </div>
                     </div>
                  </motion.div>
                )}

                {activeTab === 'statistik' && (
                  <motion.div key="statistik" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                     <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                           <Shield className="w-4 h-4 text-[var(--color-primary)]" /> Statistik Goalkeeper (GK)
                        </h3>
                        <button onClick={handleEditStats} className="px-4 py-2 bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 text-[var(--color-primary)] rounded-lg text-[10px] font-bold uppercase tracking-widest transition flex items-center gap-2 border border-[var(--color-primary)]/20">
                           <Edit className="w-3.5 h-3.5" /> Edit GK Stats
                        </button>
                     </div>
                     
                     <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="glass-card p-4 rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent text-center relative overflow-hidden group">
                           <div className="absolute inset-0 bg-emerald-500/10 blur-[20px] opacity-0 group-hover:opacity-100 transition-opacity" />
                           <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-1 relative z-10">Saves</p>
                           <h4 className="text-3xl font-display font-black text-white relative z-10">{statVal(currentStats.gk_saves)}</h4>
                        </div>
                        <div className="glass-card p-4 rounded-xl border border-rose-500/20 bg-gradient-to-br from-rose-500/5 to-transparent text-center relative overflow-hidden group">
                           <div className="absolute inset-0 bg-rose-500/10 blur-[20px] opacity-0 group-hover:opacity-100 transition-opacity" />
                           <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest mb-1 relative z-10">Goals Conceded</p>
                           <h4 className="text-3xl font-display font-black text-white relative z-10">{statVal(currentStats.gk_conceded)}</h4>
                        </div>
                        <div className="glass-card p-4 rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent text-center relative overflow-hidden group">
                           <div className="absolute inset-0 bg-blue-500/10 blur-[20px] opacity-0 group-hover:opacity-100 transition-opacity" />
                           <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-1 relative z-10">Clean Sheet</p>
                           <h4 className="text-xl mt-1 font-display font-black text-white relative z-10">{currentStats.gk_clean_sheet ? "YES" : "NO"}</h4>
                        </div>
                        <div className="glass-card p-4 rounded-xl border border-[var(--color-primary)]/20 bg-gradient-to-br from-[var(--color-primary)]/5 to-transparent text-center relative overflow-hidden group">
                           <div className="absolute inset-0 bg-[var(--color-primary)]/10 blur-[20px] opacity-0 group-hover:opacity-100 transition-opacity" />
                           <p className="text-[10px] text-[var(--color-primary)] font-bold uppercase tracking-widest mb-1 relative z-10">Save %</p>
                           <h4 className="text-3xl font-display font-black text-white relative z-10">{statVal(currentStats.gk_save_pct)}%</h4>
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="glass-card p-5 rounded-2xl border border-white/5 text-center flex flex-col justify-center gap-1">
                           <span className="text-[9px] text-white/40 uppercase tracking-widest font-black">High Claim</span>
                           <span className="text-xl font-display font-black text-white">{statVal(currentStats.gk_high_claim)}</span>
                        </div>
                        <div className="glass-card p-5 rounded-2xl border border-white/5 text-center flex flex-col justify-center gap-1">
                           <span className="text-[9px] text-white/40 uppercase tracking-widest font-black">Punches</span>
                           <span className="text-xl font-display font-black text-white">{statVal(currentStats.gk_punches)}</span>
                        </div>
                        <div className="glass-card p-5 rounded-2xl border border-white/5 text-center flex flex-col justify-center gap-1">
                           <span className="text-[9px] text-white/40 uppercase tracking-widest font-black">Sweeper Actions</span>
                           <span className="text-xl font-display font-black text-white">{statVal(currentStats.gk_sweeper)}</span>
                        </div>
                        <div className="glass-card p-5 rounded-2xl border border-rose-500/10 text-center flex flex-col justify-center gap-1">
                           <span className="text-[9px] text-rose-500 uppercase tracking-widest font-black">Error (Goal)</span>
                           <span className="text-xl font-display font-black text-rose-500">{statVal(currentStats.gk_errors)}</span>
                        </div>
                        <div className="glass-card p-5 rounded-2xl border border-white/5 text-center flex flex-col justify-center gap-1">
                           <span className="text-[9px] text-white/40 uppercase tracking-widest font-black">Dist. Success</span>
                           <span className="text-xl font-display font-black text-blue-400">{statVal(currentStats.gk_dist_pct)}%</span>
                        </div>
                     </div>
                     
                     <div className="text-center py-10 mt-8 border-t border-white/5">
                        <BarChart3 className="w-12 h-12 text-white/10 mx-auto mb-4" />
                        <h3 className="text-sm font-black text-white/50 uppercase tracking-widest">Detail Statistik Outfield</h3>
                        <p className="text-white/30 text-xs mt-2">Dapat diakses melalui ringkasan kartu di tab utama. Fitur analitik pro tim segera hadir.</p>
                     </div>
                  </motion.div>
                )}

                {/* PEMAIN TAB */}
                {activeTab === 'pemain' && (
                  <motion.div key="pemain" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="flex items-center justify-between mb-8">
                       <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                          <Users className="w-4 h-4 text-[var(--color-primary)]" /> Performa Pemain
                       </h3>
                       <div className="flex gap-4">
                          <button onClick={handleAddPlayer} className="px-5 py-2.5 bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition flex items-center gap-2 border border-[var(--color-primary)]/20 shadow-[0_0_15px_rgba(250,204,21,0.1)]">
                             <Plus className="w-4 h-4" /> Tambah Pemain
                          </button>
                       </div>
                    </div>

                    {currentPlayers.length > 0 ? (
                       <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                          {currentPlayers.map((player: any) => (
                             <div key={player.id} className="glass-card rounded-3xl border border-white/10 relative group overflow-hidden bg-gradient-to-t from-[#0a1428] to-[#0B1D3A] shadow-xl hover:-translate-y-2 transition-all duration-300 p-5">
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex gap-2 w-full justify-end">
                                   <button onClick={() => delPStat(player.id)} className="p-2 bg-rose-500/80 hover:bg-rose-500 text-white rounded-lg transition border border-white/20 shadow-lg">
                                      <Trash2 className="w-3.5 h-3.5" />
                                   </button>
                                </div>
                                <div className="flex flex-col items-center">
                                   <div className="w-16 h-16 bg-black/50 overflow-hidden border-2 border-white/10 rounded-full flex items-center justify-center mb-4 group-hover:border-[var(--color-primary)] transition-colors">
                                      {player.photo ? (
                                        <img src={player.photo} className="w-full h-full object-cover" />
                                      ) : (
                                        <span className="text-2xl font-black text-white/50">{player.name.charAt(0)}</span>
                                      )}
                                   </div>
                                   <div className="absolute top-5 left-5 bg-black border border-[var(--color-primary)]/50 text-[var(--color-primary)] text-[10px] font-black px-2 py-0.5 rounded shadow-lg">{player.rating}</div>
                                   
                                   <h4 className="text-sm font-black text-white text-center mb-1">{player.name}</h4>
                                   <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-4">{player.position || 'CMF'}</p>
                                   
                                   <div className="w-full flex items-center justify-center gap-4 text-xs font-black text-white">
                                      <div className="flex flex-col items-center"><span className="text-white/40 text-[9px] uppercase">Goal</span>{statVal(player.goals)}</div>
                                      <div className="flex flex-col items-center"><span className="text-white/40 text-[9px] uppercase">Pass</span>{statVal(player.passing)}%</div>
                                   </div>
                                </div>
                             </div>
                          ))}
                       </div>
                    ) : (
                       <div className="glass-card flex flex-col items-center justify-center p-20 text-center rounded-[2.5rem] border border-white/5 border-dashed">
                          <Users className="w-16 h-16 text-white/10 mb-4" />
                          <h4 className="text-xl font-display font-black text-white uppercase tracking-widest mb-2">Belum Ada Data Pemain</h4>
                          <p className="text-white/40 text-xs mb-6 max-w-sm">Tambahkan data performa statistik pemain individu untuk pertandingan ini.</p>
                       </div>
                    )}
                  </motion.div>
                )}
                
                {/* TAKTIK TAB */}
                {activeTab === 'taktik' && (
                  <motion.div key="taktik" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="glass-card p-6 md:p-8 rounded-[2.5rem] border border-white/5">
                      <h3 className="text-xs font-black uppercase tracking-widest mb-8 flex items-center gap-3">
                         <Shield className="w-4 h-4 text-blue-500" /> Structural Shape (4-3-3)
                      </h3>
                      <div className="aspect-[4/3] max-w-sm mx-auto bg-green-800 border-[3px] border-white/20 rounded-xl relative overflow-hidden py-8">
                         <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[size:20px_20px]" />
                         <div className="absolute inset-0 border border-white/10 m-4 rounded pointer-events-none" />
                         <div className="absolute top-1/2 left-0 right-0 border-t border-white/10 pointer-events-none" />
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-white/10 rounded-full pointer-events-none" />
                         
                         <div className="relative w-full h-full flex flex-col justify-between px-8 z-10">
                            <div className="flex justify-center gap-12">
                               <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] border-2 border-[#0a1428] shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                               <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] border-2 border-[#0a1428] shadow-[0_0_10px_rgba(250,204,21,0.5)] -mt-4" />
                               <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] border-2 border-[#0a1428] shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                            </div>
                            <div className="flex justify-center gap-16">
                               <div className="w-6 h-6 rounded-full bg-white border-2 border-[#0a1428]" />
                               <div className="w-6 h-6 rounded-full bg-white border-2 border-[#0a1428] mt-2" />
                               <div className="w-6 h-6 rounded-full bg-white border-2 border-[#0a1428]" />
                            </div>
                            <div className="flex justify-between px-2">
                               <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white" />
                               <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white mt-2" />
                               <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white mt-2" />
                               <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white" />
                            </div>
                            <div className="flex justify-center mt-[-5px]">
                               <div className="w-6 h-6 rounded-full bg-amber-600 border-2 border-white" />
                            </div>
                         </div>
                      </div>
                    </div>
                    
                    <div className="glass-card p-6 md:p-8 rounded-[2.5rem] border border-white/5 space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-3">
                         <Target className="w-4 h-4 text-rose-500" /> Tactical Notes
                      </h3>
                      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                         <p className="text-[10px] text-[var(--color-primary)] font-black mb-1.5 uppercase tracking-widest">Attacking Phase</p>
                         <p className="text-xs text-white/70 leading-relaxed">Winger melakukan inverted runs ke dalam channel, sementara fullback overlap untuk memberikan width. Build-up dari bawah melalui pivot.</p>
                      </div>
                      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                         <p className="text-[10px] text-blue-400 font-black mb-1.5 uppercase tracking-widest">Defensive Phase</p>
                         <p className="text-xs text-white/70 leading-relaxed">High press saat kehilangan bola (counter-pressing) selama 5 detik. Jika gagal, turun membentuk mid-block 4-1-4-1 yang solid.</p>
                      </div>
                      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                         <p className="text-[10px] text-emerald-400 font-black mb-1.5 uppercase tracking-widest">Transitions</p>
                         <p className="text-xs text-white/70 leading-relaxed">Fokus pada transisi positif cepat mencari ruang di belakang garis pertahanan lawan dengan direct pass ke striker tengah.</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* HIGHLIGHTS TAB */}
                {activeTab === 'highlights' && (
                  <motion.div key="highlights" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="flex items-center justify-between mb-8">
                       <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                          <Video className="w-4 h-4 text-[var(--color-primary)]" /> Highlights Pertandingan
                       </h3>
                       <button onClick={handleAddVideo} className="px-5 py-2.5 bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition flex items-center gap-2 border border-[var(--color-primary)]/20 shadow-[0_0_15px_rgba(250,204,21,0.1)]">
                          <Plus className="w-4 h-4" /> Tambah Highlight
                       </button>
                    </div>
                    
                    {currentHighlights.length > 0 ? (
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {currentHighlights.map((video: any) => {
                             const embedInfo = getEmbedInfo(video.url);
                             return (
                                <div key={video.id} className="glass-card rounded-[1.5rem] border border-white/10 relative group overflow-hidden bg-gradient-to-t from-[#0a1428] to-[#0B1D3A] shadow-xl hover:-translate-y-1 transition-all duration-300">
                                   <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex gap-2">
                                      <button onClick={() => delVideo(video.id)} className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition border border-white/20 shadow-lg">
                                         <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                   </div>
                                   
                                   <div className="w-full aspect-video relative cursor-pointer" onClick={() => setActiveVideo(video)}>
                                      <img src={embedInfo?.thumbnail || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=600'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                                      <div className="absolute inset-0 flex items-center justify-center">
                                         <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-[var(--color-primary)] transition-all">
                                            <Play className="w-5 h-5 text-white group-hover:text-black group-hover:fill-black ml-1" />
                                         </div>
                                      </div>
                                      <div className="absolute bottom-2 left-2 flex gap-1.5">
                                         {video.category && (
                                           <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-md border border-white/10",
                                              video.category === 'Goal' ? "bg-emerald-500 text-white" :
                                              video.category === 'Assist' ? "bg-blue-500 text-white" :
                                              video.category === 'Save' ? "bg-amber-500 text-black" :
                                              video.category === 'Error' ? "bg-rose-500 text-white" :
                                              "bg-purple-500 text-white"
                                           )}>
                                              {video.category}
                                           </span>
                                         )}
                                      </div>
                                      {video.minute && (
                                         <div className="absolute bottom-2 right-2 text-[10px] font-black text-white bg-black/60 px-2 py-1 rounded border border-white/10">
                                            {video.minute}'
                                         </div>
                                      )}
                                   </div>
                                   <div className="p-4">
                                      <h4 className="text-sm font-bold text-white mb-1 truncate">{video.title}</h4>
                                      <p className="text-[10px] text-white/50 line-clamp-2">{video.description || 'Tidak ada deskripsi.'}</p>
                                   </div>
                                </div>
                             )
                          })}
                       </div>
                    ) : (
                       <div className="glass-card flex flex-col items-center justify-center p-20 text-center rounded-[2.5rem] border border-white/5 border-dashed">
                          <Video className="w-16 h-16 text-white/10 mb-4" />
                          <h4 className="text-xl font-display font-black text-white uppercase tracking-widest mb-2">Video Highlight Kosong</h4>
                          <p className="text-white/40 text-xs mb-6 max-w-sm">Tambahkan video highlight dari pertandingan ini melalui direct upload (MP4) atau embed link YouTube/Drive.</p>
                          <button onClick={handleAddVideo} className="px-6 py-3 bg-[var(--color-primary)] text-black font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center gap-2 hover:scale-105 transition-transform shadow-[0_10px_20px_rgba(250,204,21,0.2)]">
                             <Plus className="w-4 h-4" /> Tambah Video Highlight
                          </button>
                       </div>
                    )}
                  </motion.div>
                )}

                {/* CATATAN PELATIH TAB */}
                {activeTab === 'catatan' && (
                  <motion.div key="catatan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="glass-card p-6 md:p-8 rounded-[2.5rem] border border-white/5 flex flex-col items-center text-center">
                       <img src="https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&q=80&w=800" className="w-24 h-24 rounded-full object-cover border-4 border-white/10 mb-4 shadow-xl" />
                       <h4 className="text-lg font-black text-white uppercase">Coach Budi Santoso</h4>
                       <p className="text-[10px] uppercase font-bold text-[var(--color-primary)] tracking-widest mb-4">Head Coach</p>
                       <p className="text-[10px] text-white/40">{selectedMatch.date}</p>
                       <button onClick={handleEditNote} className="mt-6 w-full py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition">
                          Edit Catatan
                       </button>
                    </div>
                    
                    <div className="lg:col-span-2 glass-card p-6 md:p-8 rounded-[2.5rem] border border-white/5 flex flex-col justify-between">
                       <div>
                          <h3 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                             <FileText className="w-4 h-4 text-amber-500" /> Evaluasi & Insight
                          </h3>
                          <div className="text-sm text-white/70 leading-relaxed font-medium space-y-4">
                             {currentCoachNote ? (
                               currentCoachNote.note.split('\n').map((para:string, i:number) => <p key={i}>{para}</p>)
                             ) : (
                               <p className="italic opacity-50">Belum ada evaluasi pelatih untuk pertandingan ini.</p>
                             )}
                          </div>
                       </div>
                       
                       <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
                          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-primary)]">Fokus Latihan Berikutnya</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
                               <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                               <span className="text-xs font-bold text-white uppercase">Finishing & Shooting</span>
                            </div>
                            <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
                               <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                               <span className="text-xs font-bold text-white uppercase">Defensive Transition</span>
                            </div>
                            <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
                               <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                               <span className="text-xs font-bold text-white uppercase">Stamina & Recovery</span>
                            </div>
                          </div>
                       </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
           </div>
        )}
      </div>

      {/* MODALS */}
      <Modal isOpen={isStatsModalOpen} onClose={() => setIsStatsModalOpen(false)} title="Edit Statistik Pertandingan">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-white/40 mb-1.5 block">Skor Akhir</label>
            <input type="text" value={statsForm.score ?? ''} onChange={e => setStatsForm({...statsForm, score: e.target.value})} className="w-full bg-[#0B1D3A] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-[var(--color-primary)] outline-none" />
          </div>
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-white/40 mb-1.5 block">Possession (%)</label>
            <input type="number" value={statsForm.possession} onChange={e => setStatsForm({...statsForm, possession: Number(e.target.value)})} className="w-full bg-[#0B1D3A] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-[var(--color-primary)] outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-white/40 mb-1.5 block">Total Shots</label>
              <input type="number" value={statsForm.shots} onChange={e => setStatsForm({...statsForm, shots: Number(e.target.value)})} className="w-full bg-[#0B1D3A] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-[var(--color-primary)] outline-none" />
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-white/40 mb-1.5 block">Shots on Target</label>
              <input type="number" value={statsForm.shots_on_target} onChange={e => setStatsForm({...statsForm, shots_on_target: Number(e.target.value)})} className="w-full bg-[#0B1D3A] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-[var(--color-primary)] outline-none" />
            </div>
          </div>
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-white/40 mb-1.5 block">Pass Accuracy (%)</label>
            <input type="number" value={statsForm.pass_accuracy} onChange={e => setStatsForm({...statsForm, pass_accuracy: Number(e.target.value)})} className="w-full bg-[#0B1D3A] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-[var(--color-primary)] outline-none" />
          </div>

          <div className="pt-4 mt-6 border-t border-white/10">
            <h4 className="text-sm font-black text-[var(--color-primary)] uppercase tracking-widest mb-4">Statistik Kiper (GK)</h4>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-white/40 mb-1.5 block">Saves</label>
                <input type="number" value={statsForm.gk_saves} onChange={e => setStatsForm({...statsForm, gk_saves: Number(e.target.value)})} className="w-full bg-[#0B1D3A] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-[var(--color-primary)] outline-none" />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-white/40 mb-1.5 block">Goals Conceded</label>
                <input type="number" value={statsForm.gk_conceded} onChange={e => setStatsForm({...statsForm, gk_conceded: Number(e.target.value)})} className="w-full bg-[#0B1D3A] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-[var(--color-primary)] outline-none" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-white/40 mb-1.5 block">Save %</label>
                <input type="number" value={statsForm.gk_save_pct} onChange={e => setStatsForm({...statsForm, gk_save_pct: Number(e.target.value)})} className="w-full bg-[#0B1D3A] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-[var(--color-primary)] outline-none" />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-white/40 mb-1.5 block">Dist. Success %</label>
                <input type="number" value={statsForm.gk_dist_pct} onChange={e => setStatsForm({...statsForm, gk_dist_pct: Number(e.target.value)})} className="w-full bg-[#0B1D3A] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-[var(--color-primary)] outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-white/40 mb-1.5 block">High Claims</label>
                <input type="number" value={statsForm.gk_high_claim} onChange={e => setStatsForm({...statsForm, gk_high_claim: Number(e.target.value)})} className="w-full bg-[#0B1D3A] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-[var(--color-primary)] outline-none" />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-white/40 mb-1.5 block">Punches</label>
                <input type="number" value={statsForm.gk_punches} onChange={e => setStatsForm({...statsForm, gk_punches: Number(e.target.value)})} className="w-full bg-[#0B1D3A] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-[var(--color-primary)] outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-white/40 mb-1.5 block">Sweeper Actions</label>
                <input type="number" value={statsForm.gk_sweeper} onChange={e => setStatsForm({...statsForm, gk_sweeper: Number(e.target.value)})} className="w-full bg-[#0B1D3A] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-[var(--color-primary)] outline-none" />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-white/40 mb-1.5 block">Errors to Goal</label>
                <input type="number" value={statsForm.gk_errors} onChange={e => setStatsForm({...statsForm, gk_errors: Number(e.target.value)})} className="w-full bg-[#0B1D3A] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-[var(--color-primary)] outline-none" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input type="checkbox" id="clean_sheet" checked={statsForm.gk_clean_sheet} onChange={e => setStatsForm({...statsForm, gk_clean_sheet: e.target.checked})} className="w-4 h-4 accent-[var(--color-primary)]" />
              <label htmlFor="clean_sheet" className="text-sm font-black text-white hover:text-[var(--color-primary)] cursor-pointer uppercase tracking-widest">Clean Sheet</label>
            </div>
          </div>

          <button onClick={saveStats} className="w-full mt-4 py-3.5 bg-[var(--color-primary)] text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:scale-105 transition-transform shadow-[0_10px_20px_rgba(250,204,21,0.2)]">Simpan Statistik</button>
        </div>
      </Modal>

      <Modal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} title="Upload Highlight Video">
        <div className="space-y-4">
          {videoError && (
             <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] uppercase font-bold p-3 rounded-xl">{videoError}</div>
          )}
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-white/40 mb-1.5 block">Upload Video (MP4)</label>
            <input type="file" accept="video/mp4,video/webm" onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  setVideoForm({...videoForm, file: e.target.files[0]});
                }
            }} className="w-full bg-[#0B1D3A] border border-white/10 rounded-xl p-3 text-white text-xs file:bg-[var(--color-primary)] file:text-black file:border-0 file:px-4 file:py-1 file:rounded-md file:mr-4 file:font-black file:text-[10px] file:uppercase focus:border-[var(--color-primary)] outline-none" />
          </div>
          <div className="flex items-center gap-4 py-2">
             <div className="flex-1 h-px bg-white/10" />
             <span className="text-[9px] text-white/40 uppercase tracking-widest font-black">ATAU LINK EMBED</span>
             <div className="flex-1 h-px bg-white/10" />
          </div>
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-white/40 mb-1.5 block">Link Video (YouTube/Drive)</label>
            <input type="text" value={videoForm.url ?? ''} onChange={e => setVideoForm({...videoForm, url: e.target.value})} placeholder="https://..." disabled={!!videoForm.file} className="w-full bg-[#0B1D3A] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-[var(--color-primary)] outline-none disabled:opacity-50" />
          </div>
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-white/40 mb-1.5 block">Judul *</label>
            <input type="text" value={videoForm.title ?? ''} onChange={e => setVideoForm({...videoForm, title: e.target.value})} placeholder="Contoh: Gol Jarak Jauh" className="w-full bg-[#0B1D3A] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-[var(--color-primary)] outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="text-xs font-black uppercase tracking-widest text-white/40 mb-1.5 block">Kategori</label>
               <select value={videoForm.category} onChange={e => setVideoForm({...videoForm, category: e.target.value})} className="w-full bg-[#0B1D3A] border border-white/10 rounded-xl p-3.5 text-white text-sm focus:border-[var(--color-primary)] outline-none">
                  <optgroup label="Umum">
                    <option value="Goal">Goal</option>
                    <option value="Assist">Assist</option>
                    <option value="Skill">Skill</option>
                  </optgroup>
                  <optgroup label="Khusus GK">
                    <option value="Save">Save</option>
                    <option value="Penalty Save">Penalty Save</option>
                    <option value="1v1 Save">1v1 Save</option>
                    <option value="Build up play">Build up play</option>
                    <option value="Error">Error</option>
                  </optgroup>
               </select>
             </div>
             <div>
               <label className="text-xs font-black uppercase tracking-widest text-white/40 mb-1.5 block">Menit (Opsional)</label>
               <input type="text" value={videoForm.minute ?? ''} onChange={e => setVideoForm({...videoForm, minute: e.target.value})} placeholder="45+2" className="w-full bg-[#0B1D3A] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-[var(--color-primary)] outline-none" />
             </div>
          </div>
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-white/40 mb-1.5 block">Deskripsi Singkat</label>
            <textarea value={videoForm.desc ?? ''} onChange={e => setVideoForm({...videoForm, desc: e.target.value})} rows={3} className="w-full bg-[#0B1D3A] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-[var(--color-primary)] outline-none resize-none" />
          </div>
          <button onClick={saveVideo} disabled={isUploading} className="w-full mt-2 py-3.5 bg-[var(--color-primary)] text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:scale-105 transition-transform disabled:opacity-50 shadow-[0_10px_20px_rgba(250,204,21,0.2)]">
            {isUploading ? 'Sedang Mengupload...' : 'Simpan Video'}
          </button>
        </div>
      </Modal>

      <Modal isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} title="Catatan Pelatih">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-white/40 mb-1.5 block">Evaluasi Pertandingan</label>
            <textarea value={noteForm?.note ?? ''} onChange={e => setNoteForm({...noteForm, note: e.target.value})} rows={8} className="w-full bg-[#0B1D3A] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-[var(--color-primary)] outline-none" />
          </div>
          <button onClick={saveNote} className="w-full mt-2 py-3.5 bg-[var(--color-primary)] text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:scale-105 transition-transform shadow-[0_10px_20px_rgba(250,204,21,0.2)]">Simpan Catatan</button>
        </div>
      </Modal>

      <Modal isOpen={isPlayerModalOpen} onClose={() => setIsPlayerModalOpen(false)} title="Tambah Pemain">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-white/40 mb-1.5 block">Nama Pemain</label>
            <input type="text" value={playerForm.name ?? ''} onChange={e => setPlayerForm({...playerForm, name: e.target.value})} className="w-full bg-[#0B1D3A] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-[var(--color-primary)] outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-white/40 mb-1.5 block">Posisi (CTH: FW, CM)</label>
              <input type="text" value={playerForm.position ?? ''} onChange={e => setPlayerForm({...playerForm, position: e.target.value.toUpperCase()})} className="w-full bg-[#0B1D3A] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-[var(--color-primary)] outline-none" />
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-white/40 mb-1.5 block">Rating (0-10)</label>
              <input type="number" step="0.1" value={playerForm.rating} onChange={e => setPlayerForm({...playerForm, rating: Number(e.target.value)})} className="w-full bg-[#0B1D3A] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-[var(--color-primary)] outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-white/40 mb-1.5 block">Goals</label>
              <input type="number" value={playerForm.goals} onChange={e => setPlayerForm({...playerForm, goals: Number(e.target.value)})} className="w-full bg-[#0B1D3A] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-[var(--color-primary)] outline-none" />
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-white/40 mb-1.5 block">Pass Acc (%)</label>
              <input type="number" value={playerForm.passing} onChange={e => setPlayerForm({...playerForm, passing: Number(e.target.value)})} className="w-full bg-[#0B1D3A] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-[var(--color-primary)] outline-none" />
            </div>
          </div>
          <button onClick={savePlayer} className="w-full mt-2 py-3.5 bg-[var(--color-primary)] text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:scale-105 transition-transform shadow-[0_10px_20px_rgba(250,204,21,0.2)]">Simpan Pemain</button>
        </div>
      </Modal>

      {/* FULLSCREEN VIDEO PLAYER MODAL */}
      <AnimatePresence>
         {activeVideo && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
               <button onClick={() => setActiveVideo(null)} className="absolute top-6 right-6 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-rose-500 hover:text-white transition-colors border border-white/20">
                  <Play className="w-5 h-5 rotate-45 transform" /> {/* Fake Close Icon X */}
               </button>
               <div className="w-full max-w-6xl aspect-video bg-black rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10 relative">
                  {(() => {
                     const embedInfo = getEmbedInfo(activeVideo.url);
                     if (!embedInfo) return null;
                     return embedInfo.type === 'raw' ? (
                        <video src={embedInfo.embedUrl} controls autoPlay muted={false} className="w-full h-full" />
                     ) : (
                        <iframe src={embedInfo.embedUrl} className="w-full h-full" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;" allowFullScreen />
                     );
                  })()}
               </div>
               <div className="mt-8 text-center">
                  <h3 className="text-2xl font-black text-white">{activeVideo.title}</h3>
                  <div className="flex items-center justify-center gap-3 mt-3">
                     <span className="text-[10px] bg-[var(--color-primary)] text-black px-3 py-1 font-black uppercase tracking-widest rounded-full">{activeVideo.category}</span>
                     {activeVideo.minute && <span className="text-xs text-white/50 font-black">{activeVideo.minute}'</span>}
                  </div>
                  {activeVideo.description && <p className="text-white/70 max-w-2xl mx-auto mt-4 text-sm">{activeVideo.description}</p>}
               </div>
            </motion.div>
         )}
      </AnimatePresence>
    </Layout>
  );
}
