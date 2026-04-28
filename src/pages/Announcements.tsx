import React from 'react';
import Layout from '../components/ui/Layout';
import { Megaphone, Bell, Plus, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';

const announcements = [
  { id: 1, title: 'Uji Coba vs SSB Garuda', date: '12 Mei 2024', type: 'Match', content: 'Diinformasikan kepada seluruh pemain U-14 dan U-16 Elite untuk persiapan laga uji coba...', isNew: true },
  { id: 2, title: 'Libur Idul Fitri', date: '01 Mei 2024', type: 'General', content: 'Akademi akan libur mulai tanggal 5 Mei hingga 12 Mei. Latihan aktif kembali tanggal 13 Mei.', isNew: false },
  { id: 3, title: 'Pembayaran SPP', date: '28 Apr 2024', type: 'Finance', content: 'Mengingatkan kembali jatuh tempo pembayaran SPP bulan Mei adalah tanggal 10.', isNew: false },
];

export default function Announcements() {
  return (
    <Layout>
      <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto animate-in fade-in duration-700 pb-12 font-sans">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-display font-black tracking-tight text-white uppercase flex items-center gap-3">
              Announcements <Megaphone className="w-8 h-8 text-[var(--color-primary)]" />
            </h1>
            <p className="text-white/60 mt-1 font-medium">Brodcast pesan, berita, dan update penting akademi</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-white text-black font-bold text-sm rounded-xl hover:bg-white/90 transition-all shadow-md">
            <Plus className="w-4 h-4" /> Buat Pengumuman
          </button>
        </div>

        <div className="bg-[#111827] border border-white/10 rounded-3xl p-6 md:p-8">
           <div className="space-y-4">
              {announcements.map((ann) => (
                <div key={ann.id} className="group relative bg-[#0a0f1c] border border-white/5 rounded-2xl p-5 hover:border-white/20 transition-colors cursor-pointer">
                  
                  {ann.isNew && (
                    <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full border-2 border-[#111827] animate-pulse" />
                  )}

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                     <div className="flex items-center gap-3">
                       <div className={cn(
                         "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                         ann.type === 'Match' ? 'bg-blue-500/20 text-blue-400' : 
                         ann.type === 'Finance' ? 'bg-amber-500/20 text-amber-400' : 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]'
                       )}>
                         {ann.type === 'Match' ? <Bell className="w-5 h-5" /> : 
                          ann.type === 'Finance' ? <Bell className="w-5 h-5" /> : <Megaphone className="w-5 h-5" />}
                       </div>
                       <div>
                         <h3 className="text-lg font-bold text-white group-hover:text-[var(--color-primary)] transition-colors">{ann.title}</h3>
                         <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 bg-white/5 px-2 py-0.5 rounded">{ann.type}</span>
                       </div>
                     </div>
                     <span className="text-xs font-bold text-white/40 flex items-center gap-1.5 ml-14 md:ml-0"><Calendar className="w-3.5 h-3.5" /> {ann.date}</span>
                  </div>
                  
                  <p className="text-sm text-white/50 leading-relaxed font-medium pl-14">{ann.content}</p>
                </div>
              ))}
           </div>
        </div>

      </div>
    </Layout>
  );
}
