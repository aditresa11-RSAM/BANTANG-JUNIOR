import React, { useState, useEffect } from 'react';
import { 
  Users, Target, Calendar, Activity, TrendingUp, Trophy, ChevronRight,
  Plus, Clock, ArrowUpRight, UserSquare2, Image as ImageIcon,
  ChevronLeft, Download, Star, Edit2, Trash2, Save, Loader2,
  AlertTriangle, Filter, MoreHorizontal, DollarSign, HeartPulse, Swords
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import Layout from '../components/ui/Layout';
import { useSettings } from '../App';
import { cn } from '../lib/utils';
import { useCMSData } from '../lib/store';
import { uploadFile } from '../lib/supabase';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { useNavigate } from 'react-router-dom';

const initialSliders = [
  { id: '1', title: 'SSB BANTANG', subtitle: 'JUNIOR ACADEMY', description: 'Membentuk Generasi Juara Dengan Sistem Latihan Modern, Fasilitas Elite, dan Pendekatan Taktikal Terbaik.', img: "https://images.unsplash.com/photo-1543351611-58f69d7c1781?q=80&w=1200&auto=format&fit=crop" },
  { id: '2', title: 'FASILITAS', subtitle: 'LATIHAN MODERN', description: 'Dilengkapi dengan peralatan latihan standar FIFA untuk mendukung perkembangan pemain', img: "https://images.unsplash.com/photo-1518605368461-1ee7e54728f1?q=80&w=1200&auto=format&fit=crop" },
];

const attendanceData = [
  { name: 'Sen', value: 85 }, { name: 'Sel', value: 92 }, { name: 'Rab', value: 88 },
  { name: 'Kam', value: 95 }, { name: 'Jum', value: 90 }, { name: 'Sab', value: 98 }, { name: 'Min', value: 100 }
];

const performanceData = [
  { name: 'U-12', speed: 80, stamina: 85, tact: 70 },
  { name: 'U-14', speed: 85, stamina: 90, tact: 80 },
  { name: 'U-16', speed: 90, stamina: 95, tact: 85 },
];

const revenueData = [
  { name: 'Jan', income: 45 }, { name: 'Feb', income: 52 }, { name: 'Mar', income: 48 },
  { name: 'Apr', income: 61 }, { name: 'Mei', income: 55 }, { name: 'Jun', income: 67 }
];

const skillsRadarData = [
  { subject: 'Dribbling', A: 120, B: 110, fullMark: 150 },
  { subject: 'Passing', A: 98, B: 130, fullMark: 150 },
  { subject: 'Shooting', A: 86, B: 130, fullMark: 150 },
  { subject: 'Pace', A: 99, B: 100, fullMark: 150 },
  { subject: 'Strength', A: 85, B: 90, fullMark: 150 },
  { subject: 'Vision', A: 65, B: 85, fullMark: 150 },
  { subject: 'Tactical', A: 105, B: 115, fullMark: 150 },
  { subject: 'Teamwork', A: 130, B: 95, fullMark: 150 },
];

const ageCategoryStats = [
  { name: 'U-12', value: 145, color: '#3B82F6' },
  { name: 'U-14', value: 180, color: '#10B981' },
  { name: 'U-16', value: 127, color: 'var(--color-primary)' },
];

const topPlayers = [
  { id: 1, name: 'Bima Sakti', age: 14, score: 98, attendance: 100, team: 'U-14 Pro' },
  { id: 2, name: 'Arhan Pratama', age: 16, score: 95, attendance: 95, team: 'U-16 Elite' },
  { id: 3, name: 'Evan Dimas', age: 12, score: 92, attendance: 98, team: 'U-12 Starter' },
  { id: 4, name: 'Witan Sulaiman', age: 15, score: 89, attendance: 90, team: 'U-16 Elite' },
  { id: 5, name: 'Egy Maulana', age: 14, score: 88, attendance: 85, team: 'U-14 Pro' },
];

const StatCard = ({ title, value, icon: Icon, subtitle, trend, trendUp, isAlert }: any) => (
  <div className={cn(
    "bg-[#111827] border rounded-2xl p-5 flex flex-col relative overflow-hidden transition-all hover:border-[var(--color-primary)]/50 group",
    isAlert ? "border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.05)]" : "border-white/10"
  )}>
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500" />
    <div className="flex justify-between items-start mb-4 relative z-10">
      <p className="text-white/60 text-sm font-medium">{title}</p>
      <div className={cn("p-2 rounded-lg bg-white/5", isAlert ? "text-red-400" : "text-[var(--color-primary)]")}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <h3 className="text-3xl font-display font-black text-white mb-2 relative z-10">{value}</h3>
    <div className="flex items-center gap-2 text-xs relative z-10 mt-auto">
      <span className={cn("flex items-center gap-1 font-bold", isAlert ? "text-red-400" : (trendUp ? "text-emerald-400" : "text-amber-400"))}>
        {isAlert ? <AlertTriangle className="w-3 h-3" /> : (trendUp ? <TrendingUp className="w-3 h-3" /> : <Activity className="w-3 h-3" />)}
        {trend}
      </span>
      <span className="text-white/40 font-medium truncate">{subtitle}</span>
    </div>
  </div>
);

const QuickAction = ({ icon: Icon, label, onClick }: any) => (
  <button onClick={onClick} className="flex items-center gap-3 bg-[#111827] hover:bg-white/10 border border-white/10 p-4 rounded-2xl transition-all w-full text-left group">
    <div className="p-2.5 rounded-xl bg-white/5 text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-black transition-colors"><Icon className="w-5 h-5" /></div>
    <span className="text-sm font-bold tracking-wide text-white/90 group-hover:text-white">{label}</span>
  </button>
);

export default function Dashboard() {
  const { appName } = useSettings();
  const navigate = useNavigate();
  const { data: sliders, addItems, updateItem, deleteItem } = useCMSData('dashboard_sliders', initialSliders);
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSliderModalOpen, setIsSliderModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingSlider, setEditingSlider] = useState<any>(null);
  const [sliderForm, setSliderForm] = useState({ title: '', subtitle: '', description: '', img: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: '' });

  useEffect(() => {
    if (sliders.length === 0) return;
    const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % sliders.length), 8000);
    return () => clearInterval(timer);
  }, [sliders]);

  const nextSlide = () => setCurrentSlide((p) => (p + 1) % sliders.length);
  const prevSlide = () => setCurrentSlide((p) => (p - 1 + sliders.length) % sliders.length);

  const handleOpenSliderAdd = () => { setEditingSlider(null); setSliderForm({ title: '', subtitle: '', description: '', img: '' }); setIsSliderModalOpen(true); };
  const handleOpenSliderEdit = (slider: any) => { setEditingSlider(slider); setSliderForm(slider); setIsSliderModalOpen(true); };
  
  const handleSliderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSlider) updateItem(editingSlider.id, sliderForm);
    else addItems({ ...sliderForm, img: sliderForm.img || "https://images.unsplash.com/photo-1543351611-58f69d7c1781?q=80&w=1200&auto=format&fit=crop" });
    setIsSliderModalOpen(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const publicUrl = await uploadFile(file, 'dashboard');
        if (publicUrl) {
          setSliderForm({ ...sliderForm, img: publicUrl });
        }
      } catch (error) {
        console.error("Upload failed:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const d = new Date();
  const dateString = d.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <Layout>
      <div className="flex flex-col gap-6 pb-12 w-full max-w-[1600px] mx-auto animate-in fade-in duration-700 font-sans">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
          <div>
            <h1 className="text-2xl font-display font-black text-white tracking-tight uppercase">Dashboard <span className="text-[var(--color-primary)]">BANTANG JUNIOR</span></h1>
            <p className="text-sm text-white/50 mt-1 flex items-center gap-2 font-medium">
              Selamat Datang di Aplikasi Sekolah Sepak Bola Bantang Junior
            </p>
          </div>
          <div className="w-full md:w-auto flex items-center gap-3">
             <button className="flex items-center gap-2 px-4 py-2 bg-[#131b2f] text-white font-bold text-sm rounded-lg hover:bg-white/5 transition-colors border border-white/10 shadow-sm">
               <Calendar className="w-4 h-4 text-white/50" /> Pilih Tanggal
             </button>
          </div>
        </div>

        {/* HERO SLIDER (Moved to top) */}
        <div className="relative w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden border border-white/10 group shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <AnimatePresence mode="wait">
            {sliders.length > 0 && sliders[currentSlide] && (
              <motion.div key={sliders[currentSlide].id} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 8 }} className="absolute inset-0">
                <img src={sliders[currentSlide].img} alt="Carousel" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-[#0B1220]/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-8 z-10 text-white">
                  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }}>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl md:text-4xl font-display font-black tracking-tighter text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] uppercase">
                        {sliders[currentSlide].title} <span className="text-[var(--color-primary)]">{sliders[currentSlide].subtitle}</span>
                      </h1>
                    </div>
                    <p className="text-sm md:text-base text-white/80 max-w-2xl font-medium tracking-wide drop-shadow-md">{sliders[currentSlide]?.description || sliders[currentSlide]?.desc}</p>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons (Bottom Right) */}
          <div className="absolute bottom-6 right-6 z-30 flex items-center gap-2">
            {sliders.length > 0 && sliders[currentSlide] && (
              <>
                <button onClick={() => handleOpenSliderEdit(sliders[currentSlide])} className="p-2 rounded-lg bg-black/60 hover:bg-[var(--color-primary)] hover:text-black text-white transition-all backdrop-blur"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => setDeleteConfirm({ isOpen: true, id: sliders[currentSlide].id })} className="p-2 rounded-lg bg-black/60 hover:bg-red-500 text-white transition-all backdrop-blur"><Trash2 className="w-4 h-4" /></button>
              </>
            )}
            <button onClick={handleOpenSliderAdd} className="p-2 rounded-lg bg-[var(--color-primary)] text-black hover:bg-yellow-500 transition-all shadow-[0_0_15px_var(--color-primary-glow)]">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {sliders.length > 1 && (
            <>
              <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all z-20"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all z-20"><ChevronRight className="w-5 h-5" /></button>
              <div className="absolute top-4 right-4 flex items-center gap-2 z-30 bg-black/40 backdrop-blur px-3 py-1.5 rounded-full border border-white/10 text-[10px] font-bold text-white tracking-widest uppercase">
                 {currentSlide + 1} / {sliders.length}
              </div>
            </>
          )}
          
          {sliders.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40">
              <ImageIcon className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-sm font-medium">Belum ada banner</p>
              <button onClick={handleOpenSliderAdd} className="mt-4 px-4 py-2 bg-[var(--color-primary)] text-black text-xs font-bold rounded-lg hover:bg-yellow-500">Upload Banner Pertama</button>
            </div>
          )}
        </div>

        {/* SUMMARY CARDS (8 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Pemain" value="452" icon={Users} trend="+12" trendUp={true} subtitle="Bulan ini" />
          <StatCard title="Total Pelatih" value="12" icon={UserSquare2} trend="Optimal" trendUp={true} subtitle="Rasio 1:37" />
          <StatCard title="Kehadiran" value="94%" icon={Activity} trend="-1.2%" trendUp={false} subtitle="Rata-rata minggu ini" />
          <StatCard title="Income" value="Rp 45.2M" icon={DollarSign} trend="+15%" trendUp={true} subtitle="SPP & Pendaftaran" />
          
          <StatCard title="Jadwal Minggu Ini" value="18" icon={Calendar} trend="Padat" trendUp={true} subtitle="4 Laga Uji Coba" />
          <StatCard title="Pemain Terbaik" value="Bima. S" icon={Trophy} trend="98 PTS" trendUp={true} subtitle="U-14 Pro" />
          <StatCard title="Cedera Aktif" value="3" icon={HeartPulse} trend="+1" trendUp={false} subtitle="Dalam masa pemulihan" isAlert={true} />
          <StatCard title="Match Mendatang" value="SSB Garuda" icon={Swords} trend="2 Hari" trendUp={true} subtitle="Final Liga TopSkor" />
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction icon={Plus} label="Tambah Pemain" onClick={() => navigate('/players')} />
          <QuickAction icon={Target} label="Input Nilai" onClick={() => navigate('/performance')} />
          <QuickAction icon={Calendar} label="Buat Jadwal" onClick={() => navigate('/schedule')} />
          <QuickAction icon={Download} label="Export PDF" onClick={() => {}} />
        </div>

        {/* CHARTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          
          {/* Skill Growth (Area Chart) */}
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 xl:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-white uppercase tracking-wider">Skill Growth</h3>
              <select className="bg-white/5 border border-white/10 text-white text-xs px-3 py-1.5 rounded-lg focus:outline-none">
                <option>6 Bulan Terakhir</option>
              </select>
            </div>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance Radar */}
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 flex flex-col">
             <div className="flex justify-between items-center mb-2">
              <h3 className="text-base font-bold text-white uppercase tracking-wider">Performance Radar</h3>
            </div>
            <div className="w-full flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillsRadarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                  <Radar name="U-14 Pro" dataKey="A" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.5} />
                  <Radar name="U-16 Elite" dataKey="B" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Attendance Bar */}
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 xl:col-span-2">
             <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-white uppercase tracking-wider">Attendance Rate</h3>
            </div>
            <div className="w-full h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                  <Bar dataKey="value" name="Attendance (%)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6">
             <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-white uppercase tracking-wider">Revenue</h3>
            </div>
            <div className="w-full h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                  <Bar dataKey="income" name="Income (Juta)" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Age Category Stats (Pie) */}
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6">
             <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-white uppercase tracking-wider">Age Category</h3>
            </div>
            <div className="w-full h-[250px] flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={ageCategoryStats} innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                    {ageCategoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <span className="text-3xl font-black text-white">452</span>
                <span className="text-xs text-white/50 uppercase tracking-widest">Pemain</span>
              </div>
            </div>
          </div>

          {/* Top Players Table */}
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 overflow-hidden xl:col-span-2 border-t-4 border-t-[var(--color-primary)]">
              <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold text-white uppercase tracking-wider">Top 5 Pemain</h3>
              <button className="text-xs font-semibold text-[var(--color-primary)] hover:underline">Lihat Semua</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 pb-2 text-[10px] uppercase tracking-widest text-white/40">
                    <th className="pb-3 font-semibold w-full">Nama Pemain</th>
                    <th className="pb-3 text-center font-semibold px-4">Skor</th>
                    <th className="pb-3 text-right font-semibold">Hadir</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {topPlayers.map((player) => (
                    <tr key={player.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                      <td className="py-4">
                        <p className="font-semibold text-white truncate">{player.name}</p>
                        <p className="text-xs text-[var(--color-primary)] font-bold truncate">{player.team}</p>
                      </td>
                      <td className="py-4 text-center text-white/90 font-black px-4">{player.score}</td>
                      <td className="py-4 text-right">
                        <span className={cn("px-3 py-1 rounded-md text-[10px] font-bold", player.attendance > 90 ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400")}>
                          {player.attendance}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      <Modal isOpen={isSliderModalOpen} onClose={() => setIsSliderModalOpen(false)} title={editingSlider ? "Edit Banner" : "Tambah Banner"}>
        <form onSubmit={handleSliderSubmit} className="space-y-4">
          <div className="flex justify-center mb-4">
           <div className="relative group w-full h-40">
              <div className="w-full h-full rounded-xl overflow-hidden border border-white/10 group-hover:border-[var(--color-primary)] transition-colors relative">
                {isUploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                    <Loader2 className="w-6 h-6 text-[var(--color-primary)] animate-spin" />
                  </div>
                )}
                {sliderForm.img ? (
                  <img src={sliderForm.img} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#111827] flex flex-col items-center justify-center text-white/30">
                    <ImageIcon className="w-6 h-6 mb-2" />
                    <span className="text-[10px] uppercase tracking-widest font-bold">Upload Gambar</span>
                  </div>
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-xl">
                <div className="flex items-center gap-2 bg-[var(--color-primary)] text-black px-4 py-2 rounded-lg font-bold text-xs shadow-lg">
                  <Plus className="w-4 h-4" /> Pilih File
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Judul Kiri</label>
            <input type="text" required value={sliderForm.title} onChange={(e) => setSliderForm({...sliderForm, title: e.target.value})} className="w-full bg-[#111827] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]" placeholder="Cth: BANTANG JUNIOR" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Judul Kanan (Highlight Kuning)</label>
            <input type="text" required value={sliderForm.subtitle} onChange={(e) => setSliderForm({...sliderForm, subtitle: e.target.value})} className="w-full bg-[#111827] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]" placeholder="Cth: FOOTBALL ACADEMY" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Deskripsi Singkat</label>
            <textarea required value={sliderForm.description} onChange={(e) => setSliderForm({...sliderForm, description: e.target.value})} className="w-full bg-[#111827] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--color-primary)] h-20 resize-none" placeholder="Isi deskripsi banner..." />
          </div>
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={() => setIsSliderModalOpen(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-colors">Batal</button>
            <button type="submit" className="flex-1 py-3 rounded-xl bg-[var(--color-primary)] text-black font-bold text-sm flex items-center justify-center gap-2 hover:bg-yellow-500 transition-all">
              <Save className="w-4 h-4" /> {editingSlider ? "Simpan Perubahan" : "Terbitkan"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal 
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '' })}
        onConfirm={() => deleteItem(deleteConfirm.id)}
        message={`Yakin ingin menghapus banner ini?`}
      />
    </Layout>
  );
}
