import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/ui/Layout';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, Calendar, Users, Trophy, TrendingUp, Target, 
  Map as MapIcon, Video, Bot, Download, ChevronRight, 
  ChevronDown, Search, Filter, ArrowUpRight, ArrowDownLeft,
  Activity, Zap, Shield, Goal, Clock, Play, AlertCircle,
  FileText, Share2, Printer, Maximize2, MoreHorizontal
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, Cell,
  PieChart, Pie
} from 'recharts';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- MOCK DATA ---

const MOCK_MATCHES = [
  { id: 'm1', date: '2026-04-15', opponent: 'Garuda FC', competition: 'Academy League U15', score_home: 3, score_away: 1, status: 'Menang' },
  { id: 'm2', date: '2026-04-10', opponent: 'Rajawali Academy', competition: 'Friendly Match', score_home: 2, score_away: 2, status: 'Seri' },
  { id: 'm3', date: '2026-04-05', opponent: 'Elang Muda', competition: 'Final U14 Cup', score_home: 1, score_away: 0, status: 'Menang' },
  { id: 'm4', date: '2026-03-28', opponent: 'Persija Academy', competition: 'Academy League U15', score_home: 0, score_away: 2, status: 'Kalah' },
];

const MOCK_STATS = {
  possession: 58,
  shots: 14,
  shots_on_target: 8,
  pass_accuracy: 82,
  corners: 6,
  fouls: 10,
  offside: 2,
  yellow_cards: 1,
  red_cards: 0,
};

const MOCK_PLAYERS = [
  { id: 'p1', name: 'Alvaro', minutes: 90, goals: 1, assists: 1, passing: 88, tackles: 2, interceptions: 1, sprints: 18, rating: 8.5, photo: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&q=80&w=200' },
  { id: 'p2', name: 'Haaland Jr', minutes: 75, goals: 2, assists: 0, passing: 72, tackles: 0, interceptions: 0, sprints: 22, rating: 9.1, photo: 'https://images.unsplash.com/photo-1517466787929-bc94061c5c50?auto=format&fit=crop&q=80&w=200' },
  { id: 'p3', name: 'Arhan', minutes: 90, goals: 0, assists: 1, passing: 85, tackles: 4, interceptions: 3, sprints: 15, rating: 7.8, photo: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&q=80&w=200' },
  { id: 'p4', name: 'Baggott', minutes: 90, goals: 0, assists: 0, passing: 91, tackles: 3, interceptions: 5, sprints: 8, rating: 8.2, photo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=200' },
];

const PERFORMANCE_TREND = [
  { time: '0\'', value: 30 },
  { time: '15\'', value: 45 },
  { time: '30\'', value: 65 },
  { time: '45\'', value: 50 },
  { time: '60\'', value: 75 },
  { time: '75\'', value: 60 },
  { time: '90\'', value: 85 },
];

const RADAR_DATA = [
  { subject: 'Attack', A: 85, fullMark: 100 },
  { subject: 'Defense', A: 70, fullMark: 100 },
  { subject: 'Passing', A: 82, fullMark: 100 },
  { subject: 'Stamina', A: 88, fullMark: 100 },
  { subject: 'Tactical', A: 75, fullMark: 100 },
];

export default function MatchAnalysis() {
  const [selectedMatch, setSelectedMatch] = useState(MOCK_MATCHES[0]);
  const [activeTab, setActiveTab] = useState('overview'); // overview, players, tactics, video, ai
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);

  // --- EXPORT PDF ---
  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Add Brand
    doc.setFontSize(22);
    doc.setTextColor(250, 204, 21); // var(--color-primary)
    doc.text('BANTANG JUNIOR ACADEMY', 105, 20, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(`MATCH ANALYSIS REPORT: vs ${selectedMatch.opponent}`, 105, 30, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Competition: ${selectedMatch.competition}`, 20, 45);
    doc.text(`Date: ${selectedMatch.date}`, 20, 52);
    doc.text(`Score: ${selectedMatch.score_home} - ${selectedMatch.score_away}`, 20, 59);

    // Stats Table
    autoTable(doc, {
      startY: 70,
      head: [['Metric', 'Value']],
      body: [
        ['Possession', `${MOCK_STATS.possession}%`],
        ['Shots (OT)', `${MOCK_STATS.shots} (${MOCK_STATS.shots_on_target})`],
        ['Pass Accuracy', `${MOCK_STATS.pass_accuracy}%`],
        ['Corners', MOCK_STATS.corners],
        ['Fouls', MOCK_STATS.fouls],
      ],
      theme: 'striped',
      headStyles: { fillColor: [43, 62, 104] }
    });

    // Player Table
    autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [['Player', 'G', 'A', 'Pass%', 'Rating']],
        body: MOCK_PLAYERS.map(p => [p.name, p.goals, p.assists, `${p.passing}%`, p.rating]),
        theme: 'grid',
        headStyles: { fillColor: [250, 204, 21], textColor: [0, 0, 0] }
    });

    doc.save(`Match_Analysis_${selectedMatch.opponent}.pdf`);
  };

  return (
    <Layout>
      <div className="w-full max-w-[1600px] mx-auto pb-20 animate-in fade-in duration-700">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
          <div className="space-y-1">
            <h1 className="text-4xl font-display font-black text-white tracking-tighter uppercase flex items-center gap-4">
              Match <span className="text-[var(--color-primary)]">Analysis Pro</span>
            </h1>
            <div className="flex items-center gap-4">
              <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.4em] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                Performance Intelligence Engine
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Match Selector */}
            <div className="relative group flex-1 lg:flex-none min-w-[280px]">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Trophy className="w-4 h-4 text-[var(--color-primary)]" />
              </div>
              <select 
                value={selectedMatch.id}
                onChange={(e) => setSelectedMatch(MOCK_MATCHES.find(m => m.id === e.target.value) || MOCK_MATCHES[0])}
                className="w-full pl-12 pr-10 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold appearance-none hover:bg-white/10 transition-all cursor-pointer focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
              >
                {MOCK_MATCHES.map(m => (
                  <option key={m.id} value={m.id} className="bg-[var(--color-navy-dark)]">
                    {m.opponent} ({m.date}) - {m.score_home}:{m.score_away}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <ChevronDown className="w-4 h-4 text-white/20" />
              </div>
            </div>

            <button 
              onClick={handleExportPDF}
              className="py-3.5 px-6 bg-[var(--color-primary)] text-black rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(250,204,21,0.3)] hover:scale-105 active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" /> Export Report
            </button>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex items-center gap-1 p-1 bg-white/5 border border-white/10 rounded-2xl mb-8 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', name: 'Overview', icon: TrendingUp },
            { id: 'players', name: 'Player Analysis', icon: Users },
            { id: 'tactics', name: 'Tactical Shape', icon: Target },
            { id: 'video', name: 'Highlights', icon: Video },
            { id: 'ai', name: 'AI Insights', icon: Bot },
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
              {/* SUMMARY CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Match Outcome" value={selectedMatch.status} sub="Full Time Results" icon={Trophy} color="text-amber-400" />
                <StatCard label="Possession" value={`${MOCK_STATS.possession}%`} sub="Ball Dominance" icon={Activity} color="text-blue-400" />
                <StatCard label="Pass Accuracy" value={`${MOCK_STATS.pass_accuracy}%`} sub="Building Play" icon={Zap} color="text-emerald-400" />
                <StatCard label="Defense Strength" value="High" sub="Structure & Press" icon={Shield} color="text-rose-400" />
              </div>

              {/* MAIN CHARTS SECTION */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Match Stats Table */}
                <div className="lg:col-span-1 glass-card p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.02]">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                    <BarChart3 className="w-4 h-4 text-[var(--color-primary)]" /> Detailed Statistics
                  </h3>
                  <div className="space-y-6">
                    <StatRow label="Possession" left={MOCK_STATS.possession} right={100 - MOCK_STATS.possession} />
                    <StatRow label="Shots (on Target)" left={MOCK_STATS.shots} right={10} leftSub={MOCK_STATS.shots_on_target} rightSub={3} />
                    <StatRow label="Passing Accuracy" left={MOCK_STATS.pass_accuracy} right={74} />
                    <StatRow label="Corner Kicks" left={MOCK_STATS.corners} right={4} />
                    <StatRow label="Fouls" left={MOCK_STATS.fouls} right={14} />
                    <StatRow label="Yellow/Red" left={`${MOCK_STATS.yellow_cards}/${MOCK_STATS.red_cards}`} right="3/0" />
                  </div>
                </div>

                {/* Performance Chart */}
                <div className="lg:col-span-2 glass-card p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.02]">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3">
                      <TrendingUp className="w-4 h-4 text-blue-500" /> Performance Momentum
                    </h3>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-blue-500" />
                           <span className="text-[10px] font-bold text-white/40 uppercase">Bantang Junior</span>
                        </div>
                    </div>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={PERFORMANCE_TREND}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#ffffff40', fontSize: 10}} />
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'var(--color-navy-dark)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                          itemStyle={{ color: '#fff', fontSize: '12px' }}
                        />
                        <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-8 p-4 bg-white/5 rounded-2xl flex items-start gap-4">
                    <Bot className="w-5 h-5 text-[var(--color-primary)] mt-1" />
                    <div>
                      <p className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-widest mb-1">AI Tactical Feedback</p>
                      <p className="text-xs text-white/60 leading-relaxed">
                        Tim menunjukkan intensitas tinggi pada menit 15-30 dan 60-75. Penekanan (Pressing) di sepertiga akhir lapangan membuahkan hasil gol pertama. Waspada penurunan stamina setelah menit 75.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* RECENT MATCHES LIST */}
              <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.02]">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                  <Clock className="w-4 h-4 text-white/40" /> Historical Analysis Data
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {MOCK_MATCHES.map(match => (
                    <button 
                      key={match.id}
                      onClick={() => setSelectedMatch(match)}
                      className={cn(
                        "p-6 rounded-3xl border transition-all flex flex-col gap-4 group text-left",
                        selectedMatch.id === match.id 
                          ? "bg-[var(--color-primary)] border-transparent text-black" 
                          : "bg-white/5 border-white/5 hover:bg-white/10"
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md", selectedMatch.id === match.id ? "bg-black/10" : "bg-white/10")}>{match.competition}</span>
                        <ChevronRight className="w-4 h-4 opacity-40 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <div>
                        <h4 className="text-lg font-black leading-tight uppercase tracking-tighter">vs {match.opponent}</h4>
                        <p className={cn("text-[10px] font-bold mt-1", selectedMatch.id === match.id ? "text-black/60" : "text-white/40")}>{new Date(match.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                      <div className="mt-auto pt-4 border-t border-black/10">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-display font-black">{match.score_home} - {match.score_away}</span>
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-[0.2em]",
                            match.status === 'Menang' ? (selectedMatch.id === match.id ? 'text-black' : 'text-green-500') : 
                            match.status === 'Kalah' ? (selectedMatch.id === match.id ? 'text-black' : 'text-red-500') : 
                            (selectedMatch.id === match.id ? 'text-black' : 'text-blue-500')
                          )}>{match.status}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'players' && (
            <motion.div 
              key="players"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="grid grid-cols-1 xl:grid-cols-12 gap-10"
            >
              {/* PLAYER LIST */}
              <div className="xl:col-span-5 space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-black uppercase tracking-widest">Pemain Tampil <span className="text-white/40 ml-2">({MOCK_PLAYERS.length})</span></h3>
                  <button className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10">
                    <Filter className="w-4 h-4 text-white/60" />
                  </button>
                </div>
                {MOCK_PLAYERS.map(player => (
                  <button 
                    key={player.id}
                    onClick={() => setSelectedPlayer(player)}
                    className={cn(
                      "w-full p-5 rounded-3xl border transition-all flex items-center gap-4 group text-left",
                      selectedPlayer?.id === player.id 
                        ? "bg-white border-transparent text-black shadow-xl" 
                        : "bg-white/5 border-white/5 hover:bg-white/10"
                    )}
                  >
                    <div className="relative">
                      <img src={player.photo} alt={player.name} className="w-12 h-12 rounded-full object-cover" />
                      <div className={cn(
                        "absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] border-2",
                        selectedPlayer?.id === player.id ? "bg-white text-black border-white" : "bg-[var(--color-primary)] text-black border-[var(--color-navy-dark)]"
                      )}>
                        {player.rating}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold flex items-center gap-2 truncate">
                        {player.name}
                        {player.goals > 0 && <Goal className="w-3 h-3 text-amber-500" />}
                      </h4>
                      <p className={cn("text-[10px] font-medium uppercase tracking-widest", selectedPlayer?.id === player.id ? "text-black/60" : "text-white/40")}>
                        {player.minutes} menit • {player.goals} Gol • {player.assists} Ast
                      </p>
                    </div>
                    <ChevronRight className={cn("w-5 h-5", selectedPlayer?.id === player.id ? "text-black/40" : "text-white/20")} />
                  </button>
                ))}
              </div>

              {/* PLAYER DETAIL VIEW */}
              <div className="xl:col-span-7">
                <AnimatePresence mode="wait">
                  {selectedPlayer ? (
                    <motion.div 
                      key={selectedPlayer.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="glass-card p-10 rounded-[3rem] border border-white/5 bg-white/[0.02] h-fit"
                    >
                      <div className="flex flex-col md:flex-row items-center gap-10 mb-12">
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-amber-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                          <img src={selectedPlayer.photo} alt={selectedPlayer.name} className="w-40 h-40 rounded-[2.5rem] object-cover relative z-10 border-2 border-white/10" />
                          <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-[1.5rem] bg-[var(--color-primary)] shadow-2xl flex flex-col items-center justify-center z-20">
                            <span className="text-[10px] font-black text-black/40 leading-none">RATING</span>
                            <span className="text-2xl font-display font-black text-black">{selectedPlayer.rating}</span>
                          </div>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                          <h2 className="text-4xl font-display font-black mb-2 uppercase tracking-tighter">{selectedPlayer.name}</h2>
                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
                            <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-[#facc15]">Center Forward</span>
                            <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-white/40">U15 ELITE</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <MiniStat label="Goals" value={selectedPlayer.goals} />
                            <MiniStat label="Assists" value={selectedPlayer.assists} />
                            <MiniStat label="Pass %" value={`${selectedPlayer.passing}%`} />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Abilities Radar */}
                        <div className="space-y-6">
                          <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 border-b border-white/5 pb-4">Performance Profile</h3>
                          <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={RADAR_DATA}>
                                <PolarGrid stroke="#ffffff10" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#ffffff40', fontSize: 10 }} />
                                <PolarRadiusAxis hide />
                                <Radar
                                  name="Stats"
                                  dataKey="A"
                                  stroke="#facc15"
                                  fill="#facc15"
                                  fillOpacity={0.3}
                                />
                              </RadarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Player Heatmap */}
                        <div className="space-y-6">
                           <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 border-b border-white/5 pb-4">Zone Control (Heatmap)</h3>
                           <div className="aspect-[4/5] bg-[#123e20]/40 rounded-3xl border border-white/5 relative overflow-hidden flex items-center justify-center p-8">
                             {/* Mini Field */}
                             <div className="absolute inset-4 border border-white/10 rounded-xl" />
                             <div className="absolute left-1/2 -translate-x-1/2 bottom-4 w-20 h-8 border-t border-x border-white/10" />
                             <div className="absolute left-1/2 -translate-x-1/2 top-4 w-20 h-8 border-b border-x border-white/10" />
                             <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10" />
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 border border-white/10 rounded-full" />
                             
                             {/* Heatmap Blobs */}
                             <motion.div 
                                animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.8, 0.6] }}
                                transition={{ repeat: Infinity, duration: 3 }}
                                className="absolute top-[20%] left-[60%] w-24 h-24 bg-red-500/40 rounded-full blur-3xl" 
                             />
                             <motion.div 
                                animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
                                transition={{ repeat: Infinity, duration: 4, delay: 0.5 }}
                                className="absolute top-[35%] left-[40%] w-32 h-32 bg-amber-500/40 rounded-full blur-3xl" 
                             />
                             <motion.div 
                                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.4, 0.3] }}
                                transition={{ repeat: Infinity, duration: 5, delay: 1 }}
                                className="absolute bottom-[20%] right-[30%] w-20 h-20 bg-blue-500/20 rounded-full blur-3xl" 
                             />
                             
                             <div className="relative z-10 text-center">
                                <MapIcon className="w-8 h-8 text-white/20 mx-auto mb-2" />
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Posisi Rata-rata</span>
                             </div>
                           </div>
                        </div>
                      </div>

                      <div className="mt-12 pt-8 border-t border-white/5">
                        <div className="flex items-center gap-4 text-white/40">
                           <AlertCircle className="w-5 h-5 text-amber-500" />
                           <p className="text-xs leading-relaxed">
                             <span className="font-bold text-white uppercase italic">Coach Remark:</span> "{selectedPlayer.name} menunjukkan visi bermain yang luar biasa di babak kedua. Assist pada menit ke-62 sangat krusial. Perlu peningkatan pada disiplin posisi saat bertahan."
                           </p>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-20 grayscale">
                      <Users className="w-24 h-24 mb-6" />
                      <h3 className="text-2xl font-display font-black uppercase tracking-tighter">Pilih Pemain Untuk Detail</h3>
                      <p className="text-xs uppercase tracking-[0.3em] mt-2">Professional Performance Scouting</p>
                    </div>
                  )}
                </AnimatePresence>
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
              <div className="glass-card p-8 rounded-[3rem] border border-white/5 bg-white/[0.02]">
                <h3 className="text-sm font-black uppercase tracking-widest mb-10 flex items-center gap-3">
                   <Shield className="w-5 h-5 text-blue-500" /> Defensive Shape
                </h3>
                <div className="aspect-square bg-black/40 rounded-3xl border border-white/10 relative overflow-hidden flex items-center justify-center">
                   {/* Defensive visualization */}
                   <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[size:40px_40px]" />
                   <div className="w-[80%] h-[60%] border-2 border-dashed border-white/10 rounded-2xl relative">
                      {[
                        { x: '20%', y: '20%', label: 'LB' },
                        { x: '40%', y: '30%', label: 'CB' },
                        { x: '60%', y: '30%', label: 'CB' },
                        { x: '80%', y: '20%', label: 'RB' },
                        { x: '50%', y: '60%', label: 'CDM' },
                        { x: '35%', y: '80%', label: 'CM' },
                        { x: '65%', y: '80%', label: 'CM' },
                      ].map((p, i) => (
                        <div key={i} className="absolute w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-[8px] font-black" style={{ left: p.x, top: p.y }}>{p.label}</div>
                      ))}
                      {/* Lines of connection */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <line x1="20%" y1="20%" x2="40%" y2="30%" stroke="white" strokeWidth="1" strokeDasharray="4" strokeOpacity="0.2" />
                        <line x1="40%" y1="30%" x2="60%" y2="30%" stroke="white" strokeWidth="1" strokeDasharray="4" strokeOpacity="0.2" />
                        <line x1="60%" y1="30%" x2="80%" y2="20%" stroke="white" strokeWidth="1" strokeDasharray="4" strokeOpacity="0.2" />
                        <line x1="40%" y1="30%" x2="50%" y2="60%" stroke="white" strokeWidth="1" strokeDasharray="4" strokeOpacity="0.2" />
                        <line x1="60%" y1="30%" x2="50%" y2="60%" stroke="white" strokeWidth="1" strokeDasharray="4" strokeOpacity="0.2" />
                      </svg>
                   </div>
                </div>
                <div className="mt-8 space-y-4">
                  <TacticalPoint label="Backline Compactness" val="8.2" color="from-blue-500" />
                  <TacticalPoint label="Midfield Support" val="7.5" color="from-blue-500" />
                  <p className="text-[10px] text-white/40 leading-relaxed italic">
                    Blok pertahanan sangat rapi di babak pertama, memaksa lawan melakukan tembakan jarak jauh yang tidak akurat.
                  </p>
                </div>
              </div>

              <div className="glass-card p-8 rounded-[3rem] border border-white/5 bg-white/[0.02]">
                <h3 className="text-sm font-black uppercase tracking-widest mb-10 flex items-center gap-3">
                   <Target className="w-5 h-5 text-amber-500" /> Attacking Network
                </h3>
                <div className="aspect-square bg-black/40 rounded-3xl border border-white/10 relative overflow-hidden flex items-center justify-center">
                   {/* Attacking network visualization */}
                   <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[size:40px_40px]" />
                   <div className="w-[80%] h-full relative">
                      {[
                        { x: '20%', y: '70%', label: 'LW' },
                        { x: '80%', y: '70%', label: 'RW' },
                        { x: '50%', y: '85%', label: 'ST' },
                        { x: '35%', y: '40%', label: 'LCM' },
                        { x: '65%', y: '40%', label: 'RCM' },
                        { x: '50%', y: '20%', label: 'CAM' },
                      ].map((p, i) => (
                        <div key={i} className="absolute w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-[10px] font-black text-black" style={{ left: p.x, top: p.y }}>{p.label}</div>
                      ))}
                      {/* Dominant passing lines */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <line x1="35%" y1="40%" x2="20%" y2="70%" stroke="#facc15" strokeWidth="4" strokeOpacity="0.6" />
                        <line x1="65%" y1="40%" x2="80%" y2="70%" stroke="#facc15" strokeWidth="2" strokeOpacity="0.3" />
                        <line x1="35%" y1="40%" x2="50%" y2="20%" stroke="#facc15" strokeWidth="3" strokeOpacity="0.4" />
                        <line x1="50%" y1="20%" x2="50%" y2="85%" stroke="#facc15" strokeWidth="5" strokeOpacity="0.8" />
                      </svg>
                   </div>
                </div>
                <div className="mt-8 space-y-4">
                  <TacticalPoint label="Build-up Efficiency" val="9.1" color="from-amber-500" />
                  <TacticalPoint label="Final Third Penetration" val="8.4" color="from-amber-500" />
                   <p className="text-[10px] text-white/40 leading-relaxed italic">
                    68% serangan dibangun dari sisi kiri melalui kombinasi Arhan dan Alvaro. Umpan terobosan CAM sangat dominan.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'video' && (
            <motion.div 
              key="video"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 xl:grid-cols-12 gap-10"
            >
              <div className="xl:col-span-8 space-y-6">
                <div className="aspect-video bg-black rounded-[2.5rem] border border-white/5 relative overflow-hidden flex items-center justify-center group">
                  <img src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=2693" className="w-full h-full object-cover opacity-50" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-20 h-20 rounded-full bg-[var(--color-primary)] flex items-center justify-center shadow-[0_0_50px_var(--color-primary-glow)] hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-black fill-black" />
                    </button>
                  </div>
                  {/* Marker overlay */}
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 to-transparent p-6 flex items-center gap-4">
                    <div className="flex-1 h-1 bg-white/20 rounded-full relative">
                       <div className="absolute inset-y-0 left-0 w-[42%] bg-blue-500 rounded-full" />
                       {/* Highlights markers */}
                       <div className="absolute top-1/2 left-[12%] -translate-y-1/2 w-2 h-2 bg-amber-500 rounded-full border-2 border-black" title="Goal 12'" />
                       <div className="absolute top-1/2 left-[35%] -translate-y-1/2 w-2 h-2 bg-rose-500 rounded-full border-2 border-black" title="Yellow Card 35'" />
                       <div className="absolute top-1/2 left-[42%] -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-black" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest min-w-[60px]">12:45 / 90:00</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                   <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Analisa Video markers</h3>
                   <button className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-widest border border-[var(--color-primary)]/20 px-4 py-2 rounded-xl hover:bg-[var(--color-primary)]/10">Add Marker +</button>
                </div>
              </div>

              <div className="xl:col-span-4 glass-card p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.02]">
                <h3 className="text-xs font-black uppercase tracking-widest mb-8 border-b border-white/5 pb-4">Key Match Events</h3>
                <div className="space-y-4 h-[400px] overflow-y-auto no-scrollbar pr-2">
                  <HighlightItem time="12'" type="GOAL" desc="Haaland Jr - Build-up dari sayap kiri" icon={Goal} color="text-amber-500" />
                  <HighlightItem time="24'" type="SAVE" desc="Kiper melakukan penyelamatan krusial" icon={Shield} color="text-blue-500" />
                  <HighlightItem time="35'" type="YELLOW" desc="Baggott - Pelanggaran taktis" icon={AlertCircle} color="text-rose-500" />
                  <HighlightItem time="45'" type="HT" desc="Babak Pertama Selesai" icon={Clock} color="text-white/40" />
                  <HighlightItem time="62'" type="GOAL" desc="Alvaro - Assist oleh Arhan" icon={Goal} color="text-amber-500" />
                  <HighlightItem time="78'" type="SUB" desc="Haaland Jr (OUT) -> Messi (IN)" icon={Activity} color="text-emerald-500" />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'ai' && (
            <motion.div 
              key="ai"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-10"
            >
              <div className="glass-card p-12 rounded-[3.5rem] border border-white/10 bg-gradient-to-br from-blue-600/10 via-[var(--color-navy-dark)]/50 to-amber-500/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10">
                  <Bot className="w-48 h-48" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-[var(--color-primary)] flex items-center justify-center shadow-[0_0_30px_var(--color-primary-glow)]">
                      <Bot className="w-8 h-8 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-display font-black uppercase tracking-tighter">AI Strategic Advisor</h2>
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">Integrated Intelligence Engine v4.2</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h4 className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Strongest Points
                      </h4>
                      <ul className="space-y-4">
                        <AIInsightItem text="Efisiensi passing di zona tengah mencapai 88%, tertinggi musim ini." />
                        <AIInsightItem text="Transisi bertahan ke menyerang sangat cepat (rata-rata 4.2 detik ke final third)." />
                        <AIInsightItem text="Ball recovery di area lawan sangat aktif (12 kali dalam 90 menit)." />
                      </ul>
                    </div>
                    <div className="space-y-6">
                      <h4 className="text-xs font-black uppercase tracking-widest text-[#f87171] flex items-center gap-2">
                         <AlertCircle className="w-4 h-4" /> Vulnerabilities Found
                      </h4>
                      <ul className="space-y-4">
                        <AIInsightItem variant="warning" text="Stamina tim menurun drastis setelah menit ke-75 (Rating fisik turun 22%)." />
                        <AIInsightItem variant="warning" text="Sisi kanan pertahanan sering tereksploitasi saat RB overlap terlalu jauh." />
                        <AIInsightItem variant="warning" text="Konversi peluang hanya 12% dari total sentuhan di kotak penalti." />
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InsightCard title="Tactical Suggestion" text="Gunakan formasi 4-4-2 diamond untuk memaksa permainan lewat tengah melawan tim yang compact di sayap." icon={Target} color="bg-amber-500" />
                <InsightCard title="Training Focus" text="Latihan finishing dan pengambilan keputusan cepat di zona berbahaya harus ditingkatkan minggu depan." icon={Activity} color="bg-blue-500" />
                <InsightCard title="Next Opponent" text="Lawan berikutnya (Rajawali) bermain dengan garis pertahanan tinggi. Manfaatkan kecepatan Alvaro." icon={Zap} color="bg-emerald-500" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </Layout>
  );
}

// --- SUBCOMPONENTS ---

function StatCard({ label, value, sub, icon: Icon, color }: any) {
  return (
    <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.02] flex flex-col gap-4 group hover:bg-white/[0.04] transition-all">
      <div className={cn("w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center transition-transform group-hover:scale-110", color)}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h4 className="text-2xl font-display font-black text-white">{value}</h4>
        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{label}</p>
      </div>
      <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest border-t border-white/5 pt-3 mt-2">{sub}</p>
    </div>
  );
}

function StatRow({ label, left, right, leftSub, rightSub }: any) {
  const total = Number(left) + Number(right);
  const leftPer = (Number(left) / total) * 100;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <div className="text-left">
          <p className="text-lg font-display font-black text-white">{left} <span className="text-[10px] text-white/40">{leftSub ? `(${leftSub})` : ''}</span></p>
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{label}</p>
        <div className="text-right">
          <p className="text-lg font-display font-black text-white/40">{right} <span className="text-[8px] text-white/20">{rightSub ? `(${rightSub})` : ''}</span></p>
        </div>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
        <div className="h-full bg-[var(--color-primary)] transition-all" style={{ width: `${leftPer}%` }} />
        <div className="h-full bg-white/10 transition-all" style={{ flex: 1 }} />
      </div>
    </div>
  );
}

function MiniStat({ label, value }: any) {
  return (
    <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-xl font-display font-black text-white">{value}</p>
    </div>
  );
}

function TacticalPoint({ label, val, color }: any) {
  return (
    <div className="space-y-1.5">
       <div className="flex justify-between items-center px-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{label}</span>
          <span className={cn("text-xs font-black", val > 8 ? "text-amber-400" : "text-blue-400")}>{val}</span>
       </div>
       <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <div className={cn("h-full bg-gradient-to-r", color)} style={{ width: `${Number(val) * 10}%` }} />
       </div>
    </div>
  );
}

function HighlightItem({ time, type, desc, icon: Icon, color }: any) {
  return (
    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4 hover:bg-white/10 transition-all cursor-pointer group">
       <div className="text-sm font-display font-black text-white/40 w-8">{time}</div>
       <div className={cn("w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0", color)}>
          <Icon className="w-5 h-5" />
       </div>
       <div className="flex-1 overflow-hidden">
          <p className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-widest">{type}</p>
          <p className="text-xs text-white/60 truncate">{desc}</p>
       </div>
       <Play className="w-4 h-4 text-white/20 group-hover:text-[var(--color-primary)] transition-colors" />
    </div>
  );
}

function AIInsightItem({ text, variant = 'success' }: any) {
  return (
    <li className="flex items-start gap-3">
      <div className={cn("mt-1.5 w-1.5 h-1.5 rounded-full shrink-0", variant === 'success' ? 'bg-emerald-500' : 'bg-red-500')} />
      <span className="text-xs text-white/60 leading-relaxed font-medium">{text}</span>
    </li>
  );
}

function InsightCard({ title, text, icon: Icon, color }: any) {
  return (
    <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.02] space-y-4">
       <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-black", color)}>
          <Icon className="w-5 h-5" />
       </div>
       <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">{title}</h4>
       <p className="text-xs text-white/40 leading-relaxed italic">"{text}"</p>
    </div>
  );
}
