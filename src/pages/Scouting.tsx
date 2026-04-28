import React, { useState } from 'react';
import Layout from '../components/ui/Layout';
import { useCMSData } from '../lib/store';
import { Search, Plus, Filter, Target, Crosshair, Star, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '../lib/utils';

const initialTargets = [
  { id: '1', name: 'Ronaldo Kwateh', position: 'Winger', currentTeam: 'Muangthong Utd', price: 'Rp 2.5 Milyar', status: 'In Talks', rating: 88, match: 92, photo: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?q=80&w=200&fit=crop' },
  { id: '2', name: 'Jens Raven', position: 'Striker', currentTeam: 'FC Dordrecht', price: 'Rp 4.1 Milyar', status: 'Monitoring', rating: 90, match: 95, photo: 'https://images.unsplash.com/photo-1628103323049-c43916298516?q=80&w=200&fit=crop' },
  { id: '3', name: 'Arkhan Kaka', position: 'Striker', currentTeam: 'Persis Solo', price: 'Rp 1.8 Milyar', status: 'Bid Submitted', rating: 85, match: 88, photo: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?q=80&w=200&fit=crop' },
];

export default function Scouting() {
  const { data: targets } = useCMSData('scouting', initialTargets);

  return (
    <Layout>
      <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto animate-in fade-in duration-700 pb-12 font-sans">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-black tracking-tight text-white uppercase">Scouting <span className="text-[var(--color-primary)]">Radar</span></h1>
            <p className="text-white/60 mt-1 font-medium">Pantau talenta masa depan dan pemain incaran tim</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-[var(--color-primary)] text-black font-bold text-sm rounded-xl hover:bg-yellow-500 transition-all shadow-[0_0_15px_var(--color-primary-glow)]">
            <Plus className="w-4 h-4" /> Add Target
          </button>
        </div>

        <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between border-white/10">
           <div className="relative w-full md:w-96 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input 
                type="text" 
                placeholder="Cari pemain incaran..."
                className="w-full bg-[#0a0f1c]/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-all text-white placeholder:text-white/30"
              />
           </div>
           <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-xl hover:bg-white/5 text-white/60 text-sm font-bold transition-all"><Filter className="w-4 h-4"/> Filter</button>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {targets.map(target => (
            <div key={target.id} className="bg-[#111827] border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:border-[var(--color-primary)]/50 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(ellipse_at_top_right,rgba(250,204,21,0.1),transparent_70%)] pointer-events-none" />
              
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/10">
                    <img src={target.photo} alt={target.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div>
                     <h3 className="text-xl font-display font-black text-white uppercase tracking-tighter">{target.name}</h3>
                     <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--color-primary)]">{target.position}</span>
                  </div>
                </div>
                {/* Rating Badge */}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg border border-white/20">
                   <span className="font-display font-black text-black text-sm">{target.rating}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                 <div>
                   <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Current Team</p>
                   <p className="text-sm font-medium text-white">{target.currentTeam}</p>
                 </div>
                 <div>
                   <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Est. Price</p>
                   <p className="text-sm font-black text-emerald-400">{target.price}</p>
                 </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                 <div className="flex items-center gap-2">
                   <div className={cn(
                     "w-2 h-2 rounded-full",
                     target.status === 'Monitoring' ? 'bg-blue-500 animate-pulse' : 
                     target.status === 'In Talks' ? 'bg-amber-500' : 'bg-[var(--color-primary)]'
                   )} />
                   <span className="text-xs font-bold uppercase tracking-wider text-white/70">{target.status}</span>
                 </div>
                 <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-white/40 bg-white/5 px-2 py-1 rounded-lg">
                   Match: <span className="text-white">{target.match}%</span>
                 </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </Layout>
  );
}
