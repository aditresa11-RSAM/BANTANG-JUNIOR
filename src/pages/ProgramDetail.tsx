import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Play, FileText, Calendar, TrendingUp, Users, Video, ClipboardCheck, ArrowRight, Target, ShieldCheck, Trophy, Edit2 } from 'lucide-react';
import { academyPrograms } from '../data/programs';
import { useCMSData } from '../lib/store';
import { cn } from '../lib/utils';
import Layout from '../components/ui/Layout';
import { useAuth } from '../App';

export default function ProgramDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: programs } = useCMSData('programs', academyPrograms);
  const program = programs.find((p: any) => p.id === id);

  const [activeTab, setActiveTab] = useState('overview');

  if (!program) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <h2 className="text-2xl font-bold text-white mb-4">Program tidak ditemukan</h2>
          <button onClick={() => navigate('/')} className="text-[var(--color-primary)] hover:underline">Kembali ke Beranda</button>
        </div>
      </Layout>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'kurikulum', label: 'Kurikulum', icon: FileText },
    { id: 'materi', label: 'Materi Latihan', icon: Play },
    { id: 'jadwal', label: 'Jadwal', icon: Calendar },
    { id: 'statistik', label: 'Statistik', icon: TrendingUp },
    { id: 'video', label: 'Highlight', icon: Video },
    { id: 'progress', label: 'Progress', icon: Target },
    { id: 'absensi', label: 'Absensi', icon: ClipboardCheck },
  ];

  return (
    <Layout>
      <div className="flex flex-col gap-8 pb-32 animate-in fade-in zoom-in duration-1000">
        
        {/* HEADER HERO */}
        <div className="relative w-full h-[300px] md:h-[400px] rounded-3xl overflow-hidden group">
          <img src={program.image || null} alt={program.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080d19] via-[#080d19]/60 to-transparent" />
          
          <button 
            onClick={() => navigate(-1)}
            className="absolute top-6 left-6 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          <div className="absolute bottom-8 left-8 right-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className={cn(
                "inline-block px-3 py-1 text-xs font-black rounded-full uppercase tracking-widest mb-4 shadow-lg",
                program.type === 'main' ? "bg-[var(--color-primary)] text-black" : "bg-purple-500 text-white"
              )}>
                {program.ageRange}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black tracking-tight text-white mb-2 leading-none">
                {program.title}
              </h1>
              <p className="text-white/60 max-w-2xl text-sm md:text-base">
                {program.description}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              {user?.role === 'admin' && (
                <button onClick={() => navigate('/programs/manage')} className="bg-purple-600/90 backdrop-blur-md text-white border border-purple-500/50 px-6 py-4 rounded-xl flex items-center justify-center gap-3 font-bold uppercase tracking-widest hover:bg-purple-500 hover:scale-105 active:scale-95 transition-all shadow-lg">
                  <Edit2 className="w-5 h-5" /> Edit Program
                </button>
              )}
              <button onClick={() => navigate('/register')} className="bg-[var(--color-primary)] text-black px-8 py-4 rounded-xl flex items-center justify-center gap-3 font-bold uppercase tracking-widest hover:bg-[#e5b500] hover:scale-105 active:scale-95 transition-all shadow-[0_4px_20px_rgba(253,199,0,0.3)]">
                Gabung Program <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="w-full overflow-x-auto no-scrollbar scroll-smooth border-b border-white/5 pb-1">
          <div className="flex items-center gap-2 md:gap-4 min-w-max px-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "px-4 py-3 rounded-xl flex items-center gap-2 transition-all text-xs font-bold uppercase tracking-widest relative overflow-hidden",
                    isActive ? "text-white" : "text-white/40 hover:text-white/80 hover:bg-white/5"
                  )}
                >
                  {isActive && <div className="absolute inset-0 bg-white/5" />}
                  <Icon className={cn("w-4 h-4", isActive ? (program.type === 'main' ? 'text-[var(--color-primary)]' : 'text-purple-400') : "")} />
                  <span className="relative z-10">{tab.label}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="activeTabIndicator" 
                      className={cn("absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full shadow-[0_0_10px_currentColor]", program.type === 'main' ? 'bg-[var(--color-primary)] text-[var(--color-primary)]' : 'bg-purple-500 text-purple-500')} 
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB CONTENT */}
        <div className="bg-[#0c162d]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'overview' && <OverviewTab program={program} />}
              {activeTab === 'kurikulum' && <DynamicTab title="Kurikulum Academy" desc="Struktur materi dan silabus yang digunakan dalam program ini." icon={FileText} content={program.kurikulumText} />}
              {activeTab === 'materi' && <DynamicTab title="Materi Latihan" desc="Integrasi dengan sistem library latihan dan drill." icon={Play} content={program.materiText} />}
              {activeTab === 'jadwal' && <DynamicTab title="Jadwal Program" desc="Integrasi dengan kalender jadwal latihan akademi." icon={Calendar} content={program.jadwalText} />}
              {activeTab === 'statistik' && <DynamicTab title="Statistik & Data" desc="Ranking, performa rata-rata, dan statistik keseluruhan program." icon={TrendingUp} content={program.statistikText} />}
              {activeTab === 'video' && <DynamicTab title="Highlight & Video" desc="Kumpulan video materi dan highlight pertandingan program." icon={Video} content={program.videoText} />}
              {activeTab === 'progress' && <DynamicTab title="Progress Pemain" desc="Grafik performa dan radar chart perkembangan." icon={Target} content={program.progressText} />}
              {activeTab === 'absensi' && <DynamicTab title="Data Kehadiran" desc="Integrasi dengan sistem absensi pintar." icon={ClipboardCheck} content={program.absensiText} />}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </Layout>
  );
}

function OverviewTab({ program }: { program: any }) {
  const targets = (program.targets || 'Koordinasi Motorik Dasar, Penguasaan Bola (Ball Mastery), Pemahaman Posisi, Kesiapan Mental Bertanding').split(',').map((t: string) => t.trim()).filter((t: string) => t);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-8">
        <div>
          <h3 className="text-xl font-display font-black mb-4 flex items-center gap-2">
            <span className={cn("w-2 h-6 rounded-full", program.type === 'main' ? 'bg-[var(--color-primary)]' : 'bg-purple-500')} />
            Tentang Program
          </h3>
          <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
            {program.descriptionDetail || program.description || 'Program ini disusun dengan pendekatan modern dan kurikulum yang terstruktur untuk memastikan setiap pemain mendapatkan materi yang sesuai dengan tingkatan usia dan kemampuannya. Evaluasi dilakukan secara berkala menggunakan data riil (data-driven tracking) untuk memantau perkembangan fisik, teknik, taktikal, dan mental.'}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Target Umur', value: program.ageRange, icon: Users },
            { label: 'Sesi / Minggu', value: program.sessionsPerWeek || '3 Sesi', icon: Calendar },
            { label: 'Total Pemain', value: program.totalPlayers || '45 Aktif', icon: ShieldCheck },
            { label: 'Pelatih', value: program.coach || 'Tim Pelatih', icon: Trophy }
          ].map((stat, i) => (
            <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-3">
                <stat.icon className="w-4 h-4 text-white/40" />
                <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{stat.label}</span>
              </div>
              <span className="text-lg font-black">{stat.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-gradient-to-br from-[#080d19] to-black/40 border border-white/5 rounded-3xl p-6 shadow-xl">
          <h4 className="text-xs uppercase font-black tracking-widest text-white/50 mb-4">Target Spesifik</h4>
          <ul className="space-y-3">
            {targets.map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-3">
                <div className={cn("mt-0.5 p-1 rounded-full", program.type === 'main' ? 'bg-[var(--color-primary)]/20' : 'bg-purple-500/20')}>
                  <Target className={cn("w-3 h-3", program.type === 'main' ? 'text-[var(--color-primary)]' : 'text-purple-400')} />
                </div>
                <span className="text-sm text-white/80">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-blue-900/20 border border-blue-500/20 rounded-3xl p-6 flex items-start gap-4">
          <ShieldCheck className="w-10 h-10 text-blue-400 shrink-0" />
          <div>
            <h5 className="font-bold text-blue-400 mb-1">Terintegrasi Sistem</h5>
            <p className="text-xs text-blue-400/70 leading-relaxed">Seluruh data latihan, absensi, dan penilaian pada program ini terhubung langsung dengan profile pemain.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DynamicTab({ title, desc, icon: Icon, content }: { title: string, desc: string, icon: any, content?: string }) {
  if (content && content.trim().length > 0) {
    return (
      <div className="py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center shrink-0">
            <Icon className="w-6 h-6 text-[var(--color-primary)]" />
          </div>
          <div>
            <h3 className="text-2xl font-display font-black text-white">{title}</h3>
            <p className="text-white/40 text-sm">{desc}</p>
          </div>
        </div>
        <div className="prose prose-invert max-w-none prose-p:text-white/70 prose-headings:text-white whitespace-pre-wrap">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-white/20" />
      </div>
      <h3 className="text-2xl font-display font-black text-white mb-2">{title}</h3>
      <p className="text-white/40 max-w-md mx-auto mb-6">{desc}</p>
      
      {/* Simulation Content area for presentation */}
      <div className="w-full max-w-2xl border border-white/5 rounded-2xl bg-[#080d19] p-6 relative overflow-hidden">
         <div className="flex animate-pulse gap-4 mb-4">
            <div className="w-12 h-12 bg-white/5 rounded-xl"></div>
            <div className="flex-1 space-y-2 py-1">
               <div className="h-4 bg-white/5 rounded w-3/4"></div>
               <div className="h-3 bg-white/5 rounded w-1/2"></div>
            </div>
         </div>
         <div className="w-full h-32 bg-white/5 rounded-xl animate-pulse"></div>
         <div className="absolute inset-0 bg-gradient-to-t from-[#0c162d] via-transparent to-transparent flex items-end justify-center pb-6">
            <span className="text-[10px] uppercase font-black tracking-[0.2em] text-white/50 bg-black/50 px-4 py-2 border border-white/10 rounded-full backdrop-blur-md">
              Sistem Sedang Diintegrasikan
            </span>
         </div>
      </div>
    </div>
  );
}
