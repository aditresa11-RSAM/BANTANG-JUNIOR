import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  Trophy, 
  Zap, 
  Target, 
  TrendingUp, 
  Star, 
  Award,
  Search,
  Filter,
  BarChart2,
  Medal,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  Save,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import Layout from '../components/ui/Layout';
import { cn } from '../lib/utils';
import { useCMSData } from '../lib/store';
import { uploadFile } from '../lib/supabase';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';

const statCategories = [
  { id: 'overall', label: 'Overall Rating' },
  { id: 'dribbling', label: 'Dribbling' },
  { id: 'passing', label: 'Passing' },
  { id: 'shooting', label: 'Shooting' },
  { id: 'stamina', label: 'Stamina' },
  { id: 'attendance', label: 'Kehadiran (%)' },
];

export default function PerformanceCenter() {
  const { data: players } = useCMSData('players', []);
  const [activeCategory, setActiveCategory] = useState('overall');
  
  const sortedLeadboard = [...players].sort((a: any, b: any) => (Number(b[activeCategory]) || 0) - (Number(a[activeCategory]) || 0));

  return (
    <Layout>
      <div className="space-y-10 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[var(--color-primary)]/10 rounded-2xl flex items-center justify-center border border-[var(--color-primary)]/20 shadow-[0_0_20px_var(--color-primary-glow)]">
              <Zap className="text-[var(--color-primary)] w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-glow uppercase tracking-tight">PERFORMANCE CENTER</h1>
              <p className="text-white/40 text-sm">Pemantauan Rating Otomatis Berdasarkan Data Pemain.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <Link to="/players" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] !py-2 px-6 rounded-xl flex items-center gap-2 transition-all font-semibold uppercase tracking-wider text-xs">
                Update Stat Pemain
             </Link>
          </div>
        </div>

        {/* Categories / Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
           {statCategories.map((cat) => (
              <button 
                key={cat.id} 
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
                  activeCategory === cat.id ? "bg-[var(--color-primary)] text-black" : "bg-white/5 text-white/50 hover:text-white"
                )}
              >
                 {cat.label}
              </button>
           ))}
        </div>

        {/* Global Leaderboards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {sortedLeadboard.length > 0 && (
            <div className="lg:col-span-4 glass-card p-1 relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-[var(--color-primary)]/10 to-transparent opacity-50 z-0" />
              <div className="p-8 relative z-10 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(234,179,8,0.4)]">
                  <Medal className="text-black w-6 h-6" />
                </div>
                <div className="relative mb-6">
                  <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-[var(--color-primary)] p-1">
                    <img src={sortedLeadboard[0].photo} alt={sortedLeadboard[0].name} className="w-full h-full object-cover rounded-2xl" />
                  </div>
                  <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex items-center justify-center font-display font-black text-white">
                    1st
                  </div>
                </div>
                <h2 className="text-2xl font-display font-bold mb-1 text-white uppercase">{sortedLeadboard[0].name}</h2>
                <p className="text-[10px] uppercase font-black text-[var(--color-primary)] tracking-[0.2em] mb-4">{sortedLeadboard[0].position || 'Pemain'}</p>
                
                <div className="grid grid-cols-2 gap-4 w-full mt-auto">
                   <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                     <p className="text-[9px] text-white/40 uppercase font-black mb-1">{statCategories.find(c => c.id === activeCategory)?.label}</p>
                     <p className="text-2xl font-display font-black text-white">{sortedLeadboard[0][activeCategory] || 0}</p>
                   </div>
                   <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                     <p className="text-[9px] text-white/40 uppercase font-black mb-1">Overall</p>
                     <p className="text-2xl font-display font-black text-green-500">{sortedLeadboard[0].overall || 0}</p>
                   </div>
                </div>
              </div>
              <div className="p-6 bg-white/[0.02] border-t border-white/5 mt-auto flex gap-2">
                 <Link to="/players" className="flex-1 py-3 text-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs font-bold uppercase tracking-widest text-blue-400 hover:bg-blue-500/20 transition-all">
                    Detail Player
                 </Link>
              </div>
            </div>
          )}

          {/* Leaderboard Table */}
          <div className="lg:col-span-8 glass-card">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-white/40 tracking-[0.3em]">RANKING KESELURUHAN</h3>
              <div className="flex gap-2">
                 <button className="px-4 py-1.5 rounded-lg bg-[var(--color-primary)] text-black text-[10px] font-black uppercase tracking-widest">Global</button>
              </div>
            </div>
            
            <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto hide-scrollbar">
              {sortedLeadboard.slice(1).map((player: any, idx: number) => (
                <div key={player.id} className="flex items-center gap-6 p-6 hover:bg-white/[0.01] transition-colors relative">
                  <span className="w-8 font-display font-bold text-white/20 text-xl">{idx + 2}</span>
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0">
                    <img src={player.photo} alt={player.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm tracking-tight text-white uppercase">{player.name}</h4>
                    <p className="text-[10px] uppercase font-bold text-white/30">{player.position || 'Pemain'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-display font-black text-white">{player[activeCategory] || 0}</p>
                    <div className="flex items-center justify-end gap-1 text-[9px] font-bold text-green-500 uppercase tracking-widest leading-none mt-1">
                       <TrendingUp className="w-2.5 h-2.5" /> +1
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}

