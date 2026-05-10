import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/ui/Layout';
import { Shield, ArrowLeft, Activity, Target, Zap, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCMSData } from '../lib/store';
import { cn } from '../lib/utils';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from 'recharts';

export default function PlayerCompare() {
  const { data: players } = useCMSData('players', []);
  const { data: gkStatsList } = useCMSData('goalkeeper_stats', []);

  // Filter ONLY Goalkeepers
  const goalkeepers = useMemo(() => {
    return players.filter((p: any) => p.position === 'GK' || p.position === 'Goalkeeper');
  }, [players]);

  const [player1Id, setPlayer1Id] = useState<string>('');
  const [player2Id, setPlayer2Id] = useState<string>('');

  const p1 = goalkeepers.find(p => p.id === player1Id);
  const p2 = goalkeepers.find(p => p.id === player2Id);

  const p1Gk = gkStatsList.find(g => g.player_id === player1Id);
  const p2Gk = gkStatsList.find(g => g.player_id === player2Id);

  const radarData = useMemo(() => {
    return [
      { subject: 'Reflex', A: p1Gk?.reflex || 0, B: p2Gk?.reflex || 0, fullMark: 100 },
      { subject: 'Diving', A: p1Gk?.diving || 0, B: p2Gk?.diving || 0, fullMark: 100 },
      { subject: 'Handling', A: p1Gk?.handling || 0, B: p2Gk?.handling || 0, fullMark: 100 },
      { subject: 'Positioning', A: p1Gk?.positioning || 0, B: p2Gk?.positioning || 0, fullMark: 100 },
      { subject: '1on1', A: p1Gk?.one_on_one || 0, B: p2Gk?.one_on_one || 0, fullMark: 100 },
      { subject: 'Distribution', A: p1Gk?.distribution || 0, B: p2Gk?.distribution || 0, fullMark: 100 },
    ];
  }, [p1Gk, p2Gk]);

  // Helper for comparison bars
  const renderComparisonBar = (label: string, val1: number, val2: number) => {
    const total = val1 + val2 || 1;
    const w1 = (val1 / total) * 100;
    const w2 = (val2 / total) * 100;
    return (
      <div className="mb-4">
        <div className="flex justify-between items-center text-[10px] font-black uppercase text-white tracking-widest mb-2">
          <span className="text-emerald-400">{val1}</span>
          <span className="text-white/50">{label}</span>
          <span className="text-rose-400">{val2}</span>
        </div>
        <div className="flex w-full h-2 rounded-full overflow-hidden border border-white/10">
          <div className="bg-emerald-500 h-full" style={{ width: `${w1}%` }} />
          <div className="bg-rose-500 h-full" style={{ width: `${w2}%` }} />
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="space-y-10 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex items-center gap-6">
          <Link to="/players" className="w-12 h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center transition-colors">
             <ArrowLeft className="text-white w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-display font-black text-white uppercase tracking-tight flex items-center gap-3">
              GK Compare <Shield className="w-6 h-6 text-[var(--color-primary)]" />
            </h1>
            <p className="text-white/40 text-sm">Analisis Perbandingan Goalkeeper</p>
          </div>
        </div>

        {/* Selection Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Player 1 Details */}
           <div className="glass-card p-6 md:p-8 rounded-[2.5rem] border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full" />
             
             <div className="relative z-10 mb-8">
               <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2 block">Pilih Goalkeeper 1</label>
               <select 
                 className="w-full bg-[#0a1428]/80 border border-emerald-500/30 text-white rounded-xl p-4 text-sm font-bold focus:outline-none focus:border-emerald-500 appearance-none"
                 value={player1Id}
                 onChange={(e) => setPlayer1Id(e.target.value)}
               >
                 <option value="">-- Pilih GK --</option>
                 {goalkeepers.map((gk: any) => (
                   <option key={gk.id} value={gk.id}>{gk.name}</option>
                 ))}
               </select>
             </div>

             {p1 && (
               <AnimatePresence>
                 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center relative z-10">
                   <div className="w-32 h-32 rounded-3xl overflow-hidden border-2 border-emerald-500/50 p-1 mb-4">
                     <img src={p1.photo || 'https://via.placeholder.com/150'} alt={p1.name} className="w-full h-full object-cover rounded-2xl" />
                   </div>
                   <h2 className="text-2xl font-display font-black text-white">{p1.name}</h2>
                   <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-md text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-2">
                     Rating: {p1.overall_rating || 0}
                   </div>
                 </motion.div>
               </AnimatePresence>
             )}
           </div>

           {/* Player 2 Details */}
           <div className="glass-card p-6 md:p-8 rounded-[2.5rem] border border-rose-500/20 bg-gradient-to-br from-rose-500/5 to-transparent relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 blur-[100px] rounded-full" />
             
             <div className="relative z-10 mb-8">
               <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2 block">Pilih Goalkeeper 2</label>
               <select 
                 className="w-full bg-[#0a1428]/80 border border-rose-500/30 text-white rounded-xl p-4 text-sm font-bold focus:outline-none focus:border-rose-500 appearance-none"
                 value={player2Id}
                 onChange={(e) => setPlayer2Id(e.target.value)}
               >
                 <option value="">-- Pilih GK --</option>
                 {goalkeepers.map((gk: any) => (
                   <option key={gk.id} value={gk.id}>{gk.name}</option>
                 ))}
               </select>
             </div>

             {p2 && (
               <AnimatePresence>
                 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center relative z-10">
                   <div className="w-32 h-32 rounded-3xl overflow-hidden border-2 border-rose-500/50 p-1 mb-4">
                     <img src={p2.photo || 'https://via.placeholder.com/150'} alt={p2.name} className="w-full h-full object-cover rounded-2xl" />
                   </div>
                   <h2 className="text-2xl font-display font-black text-white">{p2.name}</h2>
                   <div className="px-3 py-1 bg-rose-500/20 border border-rose-500/30 rounded-md text-[10px] text-rose-400 font-bold uppercase tracking-widest mt-2">
                     Rating: {p2.overall_rating || 0}
                   </div>
                 </motion.div>
               </AnimatePresence>
             )}
           </div>
        </div>

        {/* Comparison Data */}
        {(p1 && p2) ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8">
            {/* Radar Overlay */}
            <div className="glass-card p-6 md:p-8 rounded-[2.5rem] border border-[var(--color-primary)]/20 relative overflow-hidden flex flex-col items-center">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Radar Perbandingan (GK Only)</h3>
              <div className="w-full max-w-md aspect-square relative z-10 mx-auto min-h-0 min-w-0">
                 <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                       <defs>
                          <linearGradient id="gkGradientA" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="0%" stopColor="#10b981" stopOpacity={0.6}/>
                             <stop offset="100%" stopColor="#10b981" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="gkGradientB" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.6}/>
                             <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.1}/>
                          </linearGradient>
                       </defs>
                       <PolarGrid stroke="rgba(255,255,255,0.1)" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 800 }} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                       <Tooltip 
                         contentStyle={{ backgroundColor: '#0B1D3A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                         itemStyle={{ fontSize: '12px', fontWeight: 800 }}
                       />
                       <Radar name={p1.name} dataKey="A" stroke="#10b981" strokeWidth={3} fill="url(#gkGradientA)" fillOpacity={1} />
                       <Radar name={p2.name} dataKey="B" stroke="#f43f5e" strokeWidth={3} fill="url(#gkGradientB)" fillOpacity={1} />
                       <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.5)' }}/>
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
            </div>

            {/* In-Depth Stats */}
            <div className="glass-card p-6 md:p-8 rounded-[2.5rem] border border-[var(--color-primary)]/20 relative overflow-hidden flex flex-col max-h-[600px]">
               <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 text-center shrink-0">Head-to-Head Attributes</h3>
               
               <div className="space-y-6 overflow-y-auto pr-4 custom-scrollbar flex-1">
                 {renderComparisonBar('Reflex', p1Gk?.reflex || 0, p2Gk?.reflex || 0)}
                 {renderComparisonBar('Diving', p1Gk?.diving || 0, p2Gk?.diving || 0)}
                 {renderComparisonBar('Handling', p1Gk?.handling || 0, p2Gk?.handling || 0)}
                 {renderComparisonBar('Shot Stopping', p1Gk?.shot_stopping || 0, p2Gk?.shot_stopping || 0)}
                 {renderComparisonBar('Positioning', p1Gk?.positioning || 0, p2Gk?.positioning || 0)}
                 {renderComparisonBar('One on One', p1Gk?.one_on_one || 0, p2Gk?.one_on_one || 0)}
                 {renderComparisonBar('Instinct', p1Gk?.instinct || 0, p2Gk?.instinct || 0)}
                 {renderComparisonBar('Decision Making', p1Gk?.decision_making || 0, p2Gk?.decision_making || 0)}
                 {renderComparisonBar('Composure', p1Gk?.composure || 0, p2Gk?.composure || 0)}
                 {renderComparisonBar('Concentration', p1Gk?.concentration || 0, p2Gk?.concentration || 0)}
                 {renderComparisonBar('Anticipation', p1Gk?.anticipation || 0, p2Gk?.anticipation || 0)}
                 {renderComparisonBar('Kicking', p1Gk?.kicking || 0, p2Gk?.kicking || 0)}
                 {renderComparisonBar('Throwing', p1Gk?.throwing || 0, p2Gk?.throwing || 0)}
                 {renderComparisonBar('Distribution', p1Gk?.distribution || 0, p2Gk?.distribution || 0)}
                 {renderComparisonBar('Passing Acc', p1Gk?.passing_accuracy || 0, p2Gk?.passing_accuracy || 0)}
                 {renderComparisonBar('Agility', p1Gk?.agility || 0, p2Gk?.agility || 0)}
                 {renderComparisonBar('Reaction Speed', p1Gk?.reaction_speed || 0, p2Gk?.reaction_speed || 0)}
                 {renderComparisonBar('Jumping Reach', p1Gk?.jumping_reach || 0, p2Gk?.jumping_reach || 0)}
                 {renderComparisonBar('Strength', p1Gk?.strength || 0, p2Gk?.strength || 0)}
                 {renderComparisonBar('Balance', p1Gk?.balance || 0, p2Gk?.balance || 0)}
               </div>
            </div>

          </motion.div>
        ) : (
          <div className="py-20 text-center flex flex-col items-center">
             <Shield className="w-16 h-16 text-white/5 mb-4" />
             <h3 className="text-xl font-display font-black text-white/40">PILIH DUA GOALKEEPER</h3>
             <p className="text-xs text-white/30 tracking-widest uppercase mt-2">Untuk memulai head-to-head analisis</p>
          </div>
        )}

      </div>
    </Layout>
  );
}
