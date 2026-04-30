import React, { useState } from 'react';
import Layout from '../components/ui/Layout';
import { useCMSData } from '../lib/store';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, Users, Trophy, TrendingUp, Target, 
  Map as MapIcon, Video, Bot, Download, ChevronDown, 
  Activity, Zap, Shield, Play, AlertCircle, Edit, Trash2, Plus
} from 'lucide-react';
import { cn } from '../lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Modal } from '../components/ui/Modal';

const StatCard = ({ label, value, sub, icon: Icon, color, onEdit }: any) => (
  <div className="glass-card p-6 rounded-3xl border border-white/5 bg-white/[0.02] flex items-center justify-between group relative overflow-hidden transition-all hover:scale-[1.02]">
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full pointer-events-none" />
    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
      {onEdit && (
         <button onClick={onEdit} className="p-1.5 bg-black/40 hover:bg-white/10 rounded-lg backdrop-blur-md border border-white/10 text-white/70 hover:text-white transition-colors">
            <Edit className="w-3.5 h-3.5" />
         </button>
      )}
    </div>
    <div className="relative z-10 space-y-1">
      <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{label}</p>
      <h4 className="text-3xl font-display font-black text-white tracking-tighter">{value}</h4>
      <p className={cn("text-xs font-medium uppercase tracking-widest", color)}>{sub}</p>
    </div>
    <div className={cn("p-4 rounded-2xl bg-white/5 box-content relative z-10", color)}>
      <Icon className="w-8 h-8" />
    </div>
  </div>
);

const StatRow = ({ label, left, right, leftSub, rightSub }: any) => {
  const total = (Number(left) || 0) + (Number(right) || 0);
  const leftPct = total === 0 ? 50 : (left / total) * 100;
  const rightPct = 100 - leftPct;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <div className="text-left">
          <span className="text-sm font-black text-white">{left}</span>
          {leftSub && <span className="text-[10px] text-white/40 ml-1">({leftSub})</span>}
        </div>
        <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{label}</span>
        <div className="text-right">
          {rightSub && <span className="text-[10px] text-white/40 mr-1">({rightSub})</span>}
          <span className="text-sm font-black text-white">{right}</span>
        </div>
      </div>
      <div className="h-2 flex rounded-full overflow-hidden bg-white/5">
        <div className="bg-[var(--color-primary)] transition-all duration-1000" style={{ width: `${leftPct}%` }} />
        <div className="bg-white/20 transition-all duration-1000" style={{ width: `${rightPct}%` }} />
      </div>
    </div>
  );
};

const getEmbedInfo = (url: string) => {
  if (!url) return null;
  // YouTube parser
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})/);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`,
      thumbnail: `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg` // Or hqdefault.jpg
    };
  }
  // Google Drive parser
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

const VideoCard = ({ video, onEdit, onDelete }: any) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const embedInfo = getEmbedInfo(video.url);

  if (!embedInfo) return null;

  return (
    <div className="glass-card rounded-[1.5rem] border border-white/5 relative group transition-all duration-300 hover:scale-[1.02] shadow-xl overflow-hidden flex flex-col bg-white/[0.02]">
      {/* Admin Controls */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex gap-2">
        <button onClick={() => onEdit(video)} className="p-2 bg-black/60 hover:bg-white/10 backdrop-blur-md rounded-lg text-white font-bold transition flex items-center border border-white/10">
            <Edit className="w-4 h-4" />
        </button>
        <button onClick={() => onDelete(video.id)} className="p-2 bg-black/60 hover:bg-red-500/20 backdrop-blur-md text-red-500 rounded-lg font-bold transition flex items-center border border-white/10">
            <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="aspect-video w-full bg-black relative">
        {!isPlaying ? (
          <>
            <img 
              src={embedInfo.thumbnail} 
              alt={video.title || "Video thumbnail"} 
              className="w-full h-full object-cover opacity-70 group-hover:opacity-50 transition-opacity"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=2693'; // Fallback
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <button onClick={() => setIsPlaying(true)} className="w-20 h-20 rounded-full bg-[var(--color-primary)] flex items-center justify-center shadow-[0_0_40px_rgba(250,204,21,0.5)] group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8 text-black fill-black ml-1.5" />
              </button>
            </div>
            {embedInfo.type === 'drive' && (
               <div className="absolute top-3 left-3 bg-blue-600/80 backdrop-blur text-[10px] uppercase font-bold px-2 py-1 rounded">Google Drive</div>
            )}
          </>
        ) : (
          <iframe 
            className="w-full h-full absolute inset-0"
            src={embedInfo.embedUrl} 
            title={video.title || "Match Highlight"}
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          />
        )}
      </div>
      <div className="p-5">
        <h4 className="text-base font-bold text-white mb-1.5 truncate">{video.title || "Highlight Pertandingan"}</h4>
        {video.desc && <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">{video.desc}</p>}
      </div>
    </div>
  );
};

export default function MatchAnalysis() {
  const { data: dbMatches } = useCMSData('match_results', []);
  const { data: dbMatchStats, updateItem: updateStats, addItems: addStats } = useCMSData('match_stats', []);
  const { data: dbPlayerStats, updateItem: updatePStat, addItems: addPStat, deleteItem: delPStat } = useCMSData('player_match_stats', []);
  const { data: dbCoachNotes, updateItem: updateNote, addItems: addNote } = useCMSData('coach_notes', []);
  const { data: dbHighlights, updateItem: updateVideo, addItems: addVideo, deleteItem: delVideo } = useCMSData('match_highlights', []);

  const [activeTab, setActiveTab] = useState('overview');
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);

  const displayMatches = dbMatches || [];
  const currentMatchId = activeMatchId || (displayMatches[0]?.id || null);
  const selectedMatch = displayMatches.find((m: any) => m.id === currentMatchId) || null;

  const currentStats = dbMatchStats?.find((s: any) => s.match_id === currentMatchId);
  const currentPlayers = dbPlayerStats?.filter((p: any) => p.match_id === currentMatchId) || [];
  const currentCoachNote = dbCoachNotes?.find((n: any) => n.match_id === currentMatchId);
  const currentHighlights = dbHighlights?.filter((v: any) => v.match_id === currentMatchId) || [];

  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [statsForm, setStatsForm] = useState({ possession: 50, shots: 0, shots_on_target: 0, pass_accuracy: 0, score: '0 - 0' });

  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [playerForm, setPlayerForm] = useState({ name: '', rating: 7.5 });

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteForm, setNoteForm] = useState({ note: '' });

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoForm, setVideoForm] = useState({ id: null, title: '', url: '', desc: '' });
  const [videoError, setVideoError] = useState('');

  // --- CRUD HANDLERS ---
  const handleEditStats = () => {
    if (!currentMatchId) return;
    setStatsForm({
      possession: currentStats?.possession || 50,
      shots: currentStats?.shots || 0,
      shots_on_target: currentStats?.shots_on_target || 0,
      pass_accuracy: currentStats?.pass_accuracy || 0,
      score: currentStats?.score || selectedMatch?.score || "0 - 0"
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
      score: statsForm.score
    };
    if (currentStats?.id) {
      updateStats(currentStats.id, payload);
    } else {
      addStats(payload);
    }
    setIsStatsModalOpen(false);
  };

  const handleAddPlayer = () => {
    if (!currentMatchId) return;
    setPlayerForm({ name: '', rating: 7.5 });
    setIsPlayerModalOpen(true);
  };

  const savePlayer = () => {
    if (!currentMatchId || !playerForm.name.trim()) return;
    addPStat({ match_id: currentMatchId, name: playerForm.name, rating: Number(playerForm.rating), goals: 0, passing: 80, photo: '' });
    setIsPlayerModalOpen(false);
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

  const handleAddVideo = () => {
     if (!currentMatchId) return;
     setVideoForm({ id: null, title: '', url: '', desc: '' });
     setVideoError('');
     setIsVideoModalOpen(true);
  };

  const handleEditVideo = (video: any) => {
     if (!currentMatchId) return;
     setVideoForm({ id: video.id, title: video.title || '', url: video.url || '', desc: video.desc || '' });
     setVideoError('');
     setIsVideoModalOpen(true);
  };

  const saveVideo = () => {
     if (!currentMatchId) return;
     const embedInfo = getEmbedInfo(videoForm.url);
     if (!embedInfo) {
       setVideoError('Link video tidak valid atau tidak bisa diputar. Gunakan link YouTube atau Google Drive.');
       return;
     }

     if (videoForm.id) {
        updateVideo(videoForm.id, { title: videoForm.title, url: videoForm.url, desc: videoForm.desc });
     } else {
        addVideo({ match_id: currentMatchId, title: videoForm.title, url: videoForm.url, desc: videoForm.desc });
     }
     setIsVideoModalOpen(false);
  };

  // --- EXPORT PDF ---
  const handleExportPDF = () => {
    if (!selectedMatch) return;
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(250, 204, 21);
    doc.text('BANTANG JUNIOR ACADEMY', 105, 20, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(`MATCH ANALYSIS REPORT: vs ${selectedMatch.rival}`, 105, 30, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Competition: ${selectedMatch.tournament}`, 20, 45);
    doc.text(`Date: ${selectedMatch.date}`, 20, 52);
    doc.text(`Score: ${selectedMatch.score}`, 20, 59);

    if (currentStats) {
       autoTable(doc, {
         startY: 70,
         head: [['Metric', 'Value']],
         body: [
           ['Possession', `${currentStats.possession}%`],
           ['Shots (OT)', `${currentStats.shots} (${currentStats.shots_on_target})`],
           ['Pass Accuracy', `${currentStats.pass_accuracy}%`]
         ],
         theme: 'striped',
         headStyles: { fillColor: [43, 62, 104] }
       });
    }
    
    if (currentPlayers.length > 0) {
       autoTable(doc, {
           startY: (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 10 : 70,
           head: [['Player', 'Rating']],
           body: currentPlayers.map((p: any) => [p.name, p.rating]),
           theme: 'grid',
           headStyles: { fillColor: [250, 204, 21], textColor: [0, 0, 0] }
       });
    }

    doc.save(`Match_Analysis_${selectedMatch.rival}.pdf`);
  };

  return (
    <Layout>
      <div className="w-full max-w-[1600px] mx-auto pb-20 animate-in fade-in duration-700">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-1">
            <h1 className="text-4xl font-display font-black text-[#facc15] tracking-tighter uppercase flex items-center gap-4 text-glow">
              ANALISA PERTANDINGAN
            </h1>
            <p className="text-sm text-[#116bea] font-black uppercase tracking-[0.4em]">
              SSB Bantang Junior
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {displayMatches.length > 0 && (
               <div className="relative group w-full lg:w-auto min-w-[280px]">
                 <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                   <Trophy className="w-4 h-4 text-[var(--color-primary)]" />
                 </div>
                 <select 
                   value={currentMatchId || ''}
                   onChange={(e) => setActiveMatchId(e.target.value)}
                   className="w-full pl-12 pr-10 py-3.5 bg-white/5 border border-white/10 rounded-xl text-sm font-bold appearance-none hover:bg-white/10 transition-all cursor-pointer focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
                 >
                   {displayMatches.map((m: any) => (
                     <option key={m.id} value={m.id} className="bg-[#0B1D3A]">
                       {m.rival} ({m.date})
                     </option>
                   ))}
                 </select>
                 <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                   <ChevronDown className="w-4 h-4 text-white/20" />
                 </div>
               </div>
            )}

            {currentMatchId && (
               <button 
                 onClick={handleExportPDF}
                 className="w-full sm:w-auto py-3.5 px-6 bg-[var(--color-primary)] text-black rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(250,204,21,0.3)] hover:scale-105 active:scale-95 transition-all"
               >
                 <Download className="w-4 h-4" /> Export
               </button>
            )}
          </div>
        </div>

        {displayMatches.length === 0 || !selectedMatch ? (
           <div className="flex flex-col items-center justify-center py-32 text-center glass-card">
              <Trophy className="w-20 h-20 text-white/10 mb-6" />
              <h3 className="text-xl font-display font-black text-white/50 uppercase tracking-widest mb-2">Belum ada data pertandingan</h3>
              <p className="text-sm text-white/30 maximum-w-md">Silakan buat pertandingan di menu Match Center terlebih dahulu.</p>
           </div>
        ) : (
           <>
              {/* TABS NAVIGATION */}
              <div className="flex items-center gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl mb-8 overflow-x-auto no-scrollbar">
                {[
                  { id: 'overview', name: 'Overview', icon: TrendingUp },
                  { id: 'players', name: 'Player Analysis', icon: Users },
                  { id: 'tactics', name: 'Tactical Shape', icon: Target },
                  { id: 'video', name: 'Highlights', icon: Video },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap",
                      activeTab === tab.id 
                        ? "bg-white text-black shadow-xl scale-[1.02]" 
                        : "text-white/40 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.name}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <motion.div 
                    key="overview"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-8"
                  >
                    {currentStats ? (
                       <>
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                            <StatCard label="Match Final Info" value={currentStats.score || selectedMatch.score || '-'} sub={selectedMatch.result} icon={Trophy} color="text-amber-400" onEdit={handleEditStats} />
                            <StatCard label="Possession" value={`${currentStats.possession || 0}%`} sub="Ball Dominance" icon={Activity} color="text-blue-400" onEdit={handleEditStats} />
                            <StatCard label="Pass Accuracy" value={`${currentStats.pass_accuracy || 0}%`} sub="Building Play" icon={Zap} color="text-emerald-400" onEdit={handleEditStats} />
                            <StatCard label="Total Shots" value={currentStats.shots || 0} sub={`${currentStats.shots_on_target || 0} On Target`} icon={Target} color="text-rose-400" onEdit={handleEditStats} />
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                             <div className="glass-card p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] relative group">
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <button onClick={handleEditStats} className="p-2 bg-black/40 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors">
                                      <Edit className="w-4 h-4" />
                                   </button>
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                                  <BarChart3 className="w-4 h-4 text-[var(--color-primary)]" /> Detailed Statistics
                                </h3>
                                <div className="space-y-6">
                                  <StatRow label="Possession" left={currentStats.possession} right={100 - (currentStats.possession || 50)} />
                                  <StatRow label="Shots (on Target)" left={currentStats.shots} right={15} leftSub={currentStats.shots_on_target} rightSub={5} />
                                  <StatRow label="Passing Accuracy" left={currentStats.pass_accuracy} right={100 - (currentStats.pass_accuracy || 0)} />
                                </div>
                             </div>

                             <div className="glass-card p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] relative group">
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                   <button onClick={handleEditNote} className="p-2 bg-black/40 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors">
                                      <Edit className="w-4 h-4" />
                                   </button>
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 mb-6">
                                  <AlertCircle className="w-4 h-4 text-amber-500" /> Coach Notes (Insight)
                                </h3>
                                {currentCoachNote ? (
                                   <p className="text-white/70 text-sm leading-relaxed border-l-2 border-amber-500 pl-4 py-2 italic bg-amber-500/5">
                                      "{currentCoachNote.note}"
                                   </p>
                                ) : (
                                   <p className="text-white/20 italic text-sm">Belum ada catatan dari pelatih.</p>
                                )}
                             </div>
                          </div>
                       </>
                    ) : (
                       <div className="text-center py-20 glass-card">
                          <Activity className="w-16 h-16 text-white/10 mx-auto mb-4" />
                          <p className="text-white/40 mb-4">Belum ada statistik untuk pertandingan ini.</p>
                          <button onClick={handleEditStats} className="px-6 py-2 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-lg text-sm font-bold border border-[var(--color-primary)]/20 hover:bg-[var(--color-primary)]/20 transition flex items-center gap-2 mx-auto">
                             <Plus className="w-4 h-4" /> Tambah Statistik
                          </button>
                       </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'players' && (
                  <motion.div 
                    key="players"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="glass-card p-8 relative">
                       <div className="absolute top-6 right-6">
                          <button onClick={handleAddPlayer} className="px-4 py-2 bg-blue-500/10 text-white hover:bg-blue-500/30 rounded-xl text-xs font-bold transition flex items-center gap-2 border border-blue-500/20">
                             <Plus className="w-4 h-4" /> Tambah Pemain
                          </button>
                       </div>
                       <h3 className="text-sm font-black uppercase tracking-widest mb-6">Analisa Performa Pemain</h3>
                       
                       {currentPlayers.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                             {currentPlayers.map((player: any) => (
                                <div key={player.id} className="p-4 border border-white/5 bg-white/5 rounded-2xl flex items-center justify-between group">
                                   <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center font-bold text-lg text-white">
                                         {player.name.charAt(0)}
                                      </div>
                                      <div>
                                         <h4 className="font-bold text-sm text-white">{player.name}</h4>
                                         <p className="text-[10px] text-[var(--color-primary)] font-black">RATING: {player.rating}</p>
                                      </div>
                                   </div>
                                   <button onClick={() => delPStat(player.id)} className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-500 rounded-lg transition-all">
                                      <Trash2 className="w-4 h-4" />
                                   </button>
                                </div>
                             ))}
                          </div>
                       ) : (
                          <div className="text-center py-10 opacity-50">Belum ada data pemain untuk match ini.</div>
                       )}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'tactics' && (
                  <motion.div 
                    key="tactics"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-10"
                  >
                    {/* Tactical content placeholder mostly unchanged for styling, but simplified */}
                    <div className="glass-card p-8 rounded-[3rem] border border-white/5">
                      <h3 className="text-sm font-black uppercase tracking-widest mb-10 flex items-center gap-3">
                         <Shield className="w-5 h-5 text-blue-500" /> Defensive Shape
                      </h3>
                      <div className="aspect-square bg-black/40 rounded-3xl border border-white/10 relative overflow-hidden flex items-center justify-center">
                         <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[size:40px_40px]" />
                         <p className="text-white/20 text-sm font-black uppercase tracking-widest relative z-10">System Generated Tactical Map</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'video' && (
                  <motion.div 
                    key="video"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="glass-card p-6 md:p-8 rounded-[2.5rem] border border-white/5 relative">
                       <div className="flex justify-between items-center mb-8">
                          <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                             <Video className="w-5 h-5 text-[var(--color-primary)]" /> Highlight Pertandingan
                          </h3>
                          <button onClick={handleAddVideo} className="px-5 py-2 bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 rounded-xl text-xs font-bold transition flex items-center gap-2 border border-[var(--color-primary)]/20">
                             <Plus className="w-4 h-4" /> Tambah Video
                          </button>
                       </div>
                       
                       {currentHighlights.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                             {currentHighlights.map((video: any) => (
                                <VideoCard 
                                   key={video.id} 
                                   video={video} 
                                   onEdit={handleEditVideo} 
                                   onDelete={delVideo} 
                                />
                             ))}
                          </div>
                       ) : (
                          <div className="aspect-video w-full rounded-2xl border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center text-center p-6 transition-all hover:border-[var(--color-primary)]/50 group-hover:bg-white/10">
                             <Video className="w-16 h-16 text-white/20 mb-4" />
                             <h4 className="text-xl font-bold text-white mb-2">Video Highlight Belum Tersedia</h4>
                             <p className="text-white/40 text-sm mb-6 max-w-md">Tambahkan link embed video (YouTube, Drive) untuk menampilkan highlight pertandingan.</p>
                             <button onClick={handleAddVideo} className="px-6 py-3 bg-[var(--color-primary)] text-black font-bold uppercase rounded-xl flex items-center gap-2 hover:scale-105 transition-transform">
                                <Plus className="w-5 h-5" /> Tambah Video
                             </button>
                          </div>
                       )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
           </>
        )}
      </div>

      <Modal isOpen={isStatsModalOpen} onClose={() => setIsStatsModalOpen(false)} title="Edit Statistik Pertandingan">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-white/40 mb-1 block">Skor Pertandingan</label>
            <input type="text" value={statsForm.score} onChange={e => setStatsForm({...statsForm, score: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white" />
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">Possession (%)</label>
            <input type="number" value={statsForm.possession} onChange={e => setStatsForm({...statsForm, possession: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/40 mb-1 block">Total Shots</label>
              <input type="number" value={statsForm.shots} onChange={e => setStatsForm({...statsForm, shots: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white" />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Shots on Target</label>
              <input type="number" value={statsForm.shots_on_target} onChange={e => setStatsForm({...statsForm, shots_on_target: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white" />
            </div>
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">Pass Accuracy (%)</label>
            <input type="number" value={statsForm.pass_accuracy} onChange={e => setStatsForm({...statsForm, pass_accuracy: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white" />
          </div>
          <button onClick={saveStats} className="w-full mt-4 py-3 bg-[var(--color-primary)] text-black font-bold uppercase rounded-xl hover:scale-105 transition-transform">Simpan Statistik</button>
        </div>
      </Modal>

      <Modal isOpen={isPlayerModalOpen} onClose={() => setIsPlayerModalOpen(false)} title="Tambah Pemain">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-white/40 mb-1 block">Nama Pemain</label>
            <input type="text" value={playerForm.name} onChange={e => setPlayerForm({...playerForm, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white" />
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">Rating (0-10)</label>
            <input type="number" step="0.1" value={playerForm.rating} onChange={e => setPlayerForm({...playerForm, rating: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white" />
          </div>
          <button onClick={savePlayer} className="w-full mt-4 py-3 bg-[var(--color-primary)] text-black font-bold uppercase rounded-xl hover:scale-105 transition-transform">Simpan Pemain</button>
        </div>
      </Modal>

      <Modal isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} title="Catatan Pelatih">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-white/40 mb-1 block">Insight & Evaluasi</label>
            <textarea value={noteForm.note} onChange={e => setNoteForm({...noteForm, note: e.target.value})} rows={5} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white" />
          </div>
          <button onClick={saveNote} className="w-full mt-4 py-3 bg-[var(--color-primary)] text-black font-bold uppercase rounded-xl hover:scale-105 transition-transform">Simpan Catatan</button>
        </div>
      </Modal>

      <Modal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} title="Detail Video Highlight">
        <div className="space-y-4">
          {videoError && (
             <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs p-3 rounded-xl flex items-center justify-between">
                <span>{videoError}</span>
             </div>
          )}
          <div>
            <label className="text-xs text-white/40 mb-1 block">Judul Video</label>
            <input type="text" value={videoForm.title} onChange={e => setVideoForm({...videoForm, title: e.target.value})} placeholder="Contoh: Highlight vs Garuda FC" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white" />
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">Link Video (YouTube / Google Drive)</label>
            <input type="text" value={videoForm.url} onChange={e => setVideoForm({...videoForm, url: e.target.value})} placeholder="https://www.youtube.com/watch?v=..." className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white" />
            <p className="text-[10px] text-white/40 mt-1">Gunakan link langsung YouTube atau share link Google Drive.</p>
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">Deskripsi Singkat (Opsional)</label>
            <textarea value={videoForm.desc} onChange={e => setVideoForm({...videoForm, desc: e.target.value})} placeholder="Babak pertama yang sengit..." rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white resize-none" />
          </div>
          <button onClick={saveVideo} className="w-full mt-4 py-3 bg-[var(--color-primary)] text-black font-bold uppercase rounded-xl hover:scale-105 transition-transform">Simpan Video</button>
        </div>
      </Modal>

    </Layout>
  );
}
