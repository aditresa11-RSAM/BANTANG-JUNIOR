import React, { useState } from 'react';
import Layout from '../components/ui/Layout';
import { useCMSData } from '../lib/store';
import { Search, Plus, Filter, Activity, HeartPulse, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

const initialMedicals = [
  { id: '1', name: 'Virgil Van Dijk', position: 'Defender', injury: 'ACL Rupture', estimatedReturn: '12 Jan 2025', status: 'Rehab', progress: 45, photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&fit=crop' },
  { id: '2', name: 'Reece James', position: 'Defender', injury: 'Hamstring', estimatedReturn: '5 May 2024', status: 'Resting', progress: 15, photo: 'https://images.unsplash.com/photo-1510227272981-87123e259b17?q=80&w=200&fit=crop' },
  { id: '3', name: 'Neymar Jr', position: 'Winger', injury: 'Ankle Sprain', estimatedReturn: 'Next Week', status: 'Ready', progress: 95, photo: 'https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?q=80&w=200&fit=crop' },
];

export default function Medical() {
  const { data: medicals } = useCMSData('medicals', initialMedicals);

  return (
    <Layout>
      <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto animate-in fade-in duration-700 pb-12 font-sans">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-black tracking-tight text-white uppercase flex items-center gap-3">
              Medical <span className="text-red-500">Center</span> <HeartPulse className="w-8 h-8 text-red-500" />
            </h1>
            <p className="text-white/60 mt-1 font-medium">Pantau status cedera dan rehabilitasi pemain</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-red-500 text-white font-bold text-sm rounded-xl hover:bg-red-600 transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)]">
            <Plus className="w-4 h-4" /> Catatan Medis
          </button>
        </div>

        <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between border-red-500/10">
           <div className="relative w-full md:w-96 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input 
                type="text" 
                placeholder="Cari pasien..."
                className="w-full bg-[#0a0f1c]/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-red-500 transition-all text-white placeholder:text-white/30"
              />
           </div>
           <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-xl hover:bg-white/5 text-white/60 text-sm font-bold transition-all"><Filter className="w-4 h-4"/> Filter</button>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {medicals.map((record: any) => (
            <div key={record.id} className="bg-[#111827] border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:border-red-500/50 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(ellipse_at_top_right,rgba(239,68,68,0.05),transparent_70%)] pointer-events-none" />
              
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/10">
                    <img src={record.photo} alt={record.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div>
                     <h3 className="text-lg font-display font-black text-white uppercase tracking-tighter">{record.name}</h3>
                     <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">{record.position}</span>
                  </div>
                </div>
                <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                  <ShieldAlert className={cn("w-5 h-5", record.status === 'Ready' ? 'text-emerald-500' : 'text-red-500')} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                 <div>
                   <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Jenis Cedera</p>
                   <p className="text-sm font-medium text-white">{record.injury}</p>
                 </div>
                 <div>
                   <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Kembali Bermain</p>
                   <p className="text-sm font-black text-white">{record.estimatedReturn || record.estimatedreturn}</p>
                 </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                 <div className="flex items-center justify-between mb-2">
                   <div className="flex items-center gap-2">
                     <div className={cn(
                       "w-2 h-2 rounded-full",
                       record.status === 'Rehab' ? 'bg-amber-500 animate-pulse' : 
                       record.status === 'Resting' ? 'bg-blue-500' : 'bg-emerald-500'
                     )} />
                     <span className="text-xs font-bold uppercase tracking-wider text-white">{record.status}</span>
                   </div>
                   <span className="text-[10px] font-bold text-white/40">{record.progress}% Recovery</span>
                 </div>
                 <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                   <div 
                     className={cn("h-full rounded-full transition-all duration-1000", 
                       record.status === 'Ready' ? 'bg-emerald-500' : 
                       record.progress > 50 ? 'bg-amber-500' : 'bg-red-500'
                     )}
                     style={{ width: `${record.progress}%` }}
                   />
                 </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </Layout>
  );
}
