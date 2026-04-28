import React from 'react';
import Layout from '../components/ui/Layout';
import { Calendar, Activity, CreditCard, FileText, ChevronRight, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

const attendanceData = [
  { name: 'W1', value: 100 }, { name: 'W2', value: 85 }, { name: 'W3', value: 100 },
  { name: 'W4', value: 100 }, { name: 'W5', value: 90 },
];

export default function ParentPortal() {
  return (
    <Layout>
      <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto animate-in fade-in duration-700 pb-12 font-sans">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-display font-black tracking-tight text-white uppercase">Parent <span className="text-[var(--color-primary)]">Portal</span></h1>
            <p className="text-white/60 mt-1 font-medium">Informasi akademik & olahraga Muhammad Bima (U-14 Pro)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
             {/* Next Schedule */}
             <div className="bg-[#111827] border border-white/10 rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -translate-y-24 translate-x-24" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-400" /> Jadwal Terdekat</h3>
                
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex flex-col items-center justify-center border border-blue-500/30">
                        <span className="text-[10px] uppercase font-bold tracking-widest leading-none mb-1">Mei</span>
                        <span className="text-lg font-black leading-none">14</span>
                     </div>
                     <div>
                        <h4 className="text-white font-bold text-base">Latihan Taktikal</h4>
                        <p className="text-white/50 text-xs font-medium">15:00 - 17:00 • Lapangan Utama</p>
                     </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/30" />
                </div>
             </div>

             {/* Coach Notes */}
             <div className="bg-[#111827] border border-white/10 rounded-3xl p-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-yellow-400" /> Catatan Pelatih</h3>
                <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl relative">
                   <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 overflow-hidden">
                     <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100" alt="Coach" className="w-full h-full object-cover" />
                   </div>
                   <p className="text-sm text-yellow-200/90 leading-relaxed font-medium pr-10">
                     "Bima menunjukkan peningkatan signifikan pada visi bermain. Mohon perhatikan pola tidur jelang turnamen akhir bulan."
                   </p>
                   <p className="text-[10px] text-yellow-500/60 uppercase tracking-widest font-bold mt-3">- Coach Andre (Head Coach U-14)</p>
                </div>
             </div>
          </div>

          {/* Side Panels */}
          <div className="space-y-6">
             {/* Attendance Mini */}
             <div className="bg-[#111827] border border-white/10 rounded-3xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-400" /> Kehadiran</h3>
                  <span className="text-xl font-black text-emerald-400">95%</span>
                </div>
                <div className="w-full h-[100px]">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <AreaChart data={attendanceData}>
                      <defs>
                        <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorAtt)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
             </div>

             {/* Billing */}
             <div className="bg-[#111827] border border-white/10 rounded-3xl p-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2"><CreditCard className="w-4 h-4 text-[var(--color-primary)]" /> Tagihan Belum Dibayar</h3>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-center pb-3 border-b border-white/10">
                    <span className="text-xs font-bold text-white/50 uppercase tracking-widest">SPP Bulan Mei</span>
                    <span className="text-sm font-black text-white">Rp 500.000</span>
                  </div>
                  <button className="w-full py-2.5 bg-[var(--color-primary)] text-black font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-yellow-500 transition-colors shadow-[0_0_15px_rgba(250,204,21,0.2)]">
                    Bayar Sekarang
                  </button>
                </div>
                <div className="mt-4 flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-widest font-bold">
                   <CheckCircle2 className="w-3 h-3 text-emerald-500" /> SPP April Lunas
                </div>
             </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
