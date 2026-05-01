import React, { useState, useEffect } from 'react';
import { 
  Users, Target, Calendar, Activity, TrendingUp, Trophy, ChevronRight,
  Plus, Clock, ArrowUpRight, UserSquare2, Image as ImageIcon,
  ChevronLeft, Download, Star, Edit2, Trash2, Save, Loader2, Video, Youtube, PlayCircle,
  AlertTriangle, Filter, MoreHorizontal, DollarSign, HeartPulse, Swords
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import Layout from '../components/ui/Layout';
import { useSettings } from '../App';
import { cn } from '../lib/utils';
import { useCMSData } from '../lib/store';
import { uploadFile } from '../lib/supabase';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { useNavigate } from 'react-router-dom';

const initialSliders = [
  { id: '1', title: 'SSB BANTANG', subtitle: 'JUNIOR ACADEMY', description: 'Membentuk Generasi Juara Dengan Sistem Latihan Modern, Fasilitas Elite, dan Pendekatan Taktikal Terbaik.', img: "https://images.unsplash.com/photo-1543351611-58f69d7c1781?q=80&w=1200&auto=format&fit=crop", media_type: 'image' },
  { id: '2', title: 'FASILITAS', subtitle: 'LATIHAN MODERN', description: 'Dilengkapi dengan peralatan latihan standar FIFA untuk mendukung perkembangan pemain', img: "https://images.unsplash.com/photo-1518605368461-1ee7e54728f1?q=80&w=1200&auto=format&fit=crop", media_type: 'image' },
];

const getEmbedUrl = (url: string) => {
  if (!url) return '';
  
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    let videoId = '';
    if (url.includes('v=')) videoId = url.split('v=')[1]?.split('&')[0];
    else if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1]?.split('?')[0];
    else if (url.includes('embed/')) videoId = url.split('embed/')[1]?.split('?')[0];
    
    if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&rel=0&modestbranding=1&iv_load_policy=3&showinfo=0&enablejsapi=1&origin=${window.location.origin}`;
  }
  
  if (url.includes('drive.google.com')) {
    let fileId = '';
    const match = url.match(/\/d\/(.+?)(\/|$)/);
    if (match?.[1]) fileId = match[1];
    else {
      const idParam = url.split('id=')[1];
      if (idParam) fileId = idParam.split('&')[0];
    }
    if (fileId) return `https://drive.google.com/file/d/${fileId}/preview`;
  }
  
  return url;
};

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
    "glass-card p-6 flex flex-col relative overflow-hidden transition-all hover:scale-[1.02] duration-300 group cursor-default",
    isAlert ? "border-red-500/20 shadow-[0_0_25px_rgba(239,68,68,0.1)]" : "hover:border-blue-500/30"
  )}>
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -translate-y-16 translate-x-16 group-hover:scale-125 transition-transform duration-700 opacity-50" />
    <div className="flex justify-between items-start mb-6 relative z-10">
      <div className="p-3 rounded-2xl bg-white/5 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 shadow-xl border border-white/5">
        <Icon className="w-5 h-5" />
      </div>
      <div className={cn("px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md", 
        isAlert ? "bg-red-500/10 text-red-400 border-red-500/20" : 
        (trendUp ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20")
      )}>
        {trend}
      </div>
    </div>
    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-1 relative z-10">{title}</p>
    <h3 className="text-3xl font-display font-black text-white relative z-10 tracking-tight group-hover:text-blue-200 transition-colors uppercase">{value}</h3>
    <div className="mt-4 flex items-center gap-2 relative z-10">
      <div className="flex -space-x-2">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
      </div>
      <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest truncate">{subtitle}</span>
    </div>
    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500/0 to-transparent group-hover:via-blue-500/50 transition-all duration-500" />
  </div>
);

const QuickAction = ({ icon: Icon, label, onClick }: any) => (
  <button onClick={onClick} className="flex flex-col items-center justify-center gap-3 glass-card p-6 transition-all hover:bg-white/10 group h-full">
    <div className="p-4 rounded-2xl bg-white/5 text-white/60 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-xl border border-white/5">
      <Icon className="w-6 h-6" />
    </div>
    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50 group-hover:text-white transition-colors">{label}</span>
  </button>
);

export default function Dashboard() {
  const { appName } = useSettings();
  const navigate = useNavigate();
  const { data: sliders, addItems, updateItem, deleteItem } = useCMSData('dashboard_sliders', initialSliders);
  
  const [isSliderModalOpen, setIsSliderModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingSlider, setEditingSlider] = useState<any>(null);
  const [sliderForm, setSliderForm] = useState({ 
    title: '', 
    subtitle: '', 
    description: '', 
    img: '', 
    media_type: 'image', 
    video_url: '',
    autoplay: true,
    loop: true
  });
  const [swiperInstance, setSwiperInstance] = useState<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: '' });

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.includes("youtube.com")) return;
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data.event === "onStateChange" && data.info === 0) { // 0 = Ended
          if (swiperInstance) {
            swiperInstance.slideNext();
          }
        }
      } catch (e) {}
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [swiperInstance]);

  const activeSlider = sliders[activeIndex] || sliders[0];

  const handleOpenSliderAdd = () => { 
    setEditingSlider(null); 
    setSliderForm({ 
      title: '', 
      subtitle: '', 
      description: '', 
      img: '', 
      media_type: 'image', 
      video_url: '',
      autoplay: true,
      loop: true
    }); 
    setIsSliderModalOpen(true); 
  };
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

  return (
    <Layout>
      <div className="flex flex-col gap-6 pb-12 w-full max-w-[1600px] mx-auto animate-in fade-in zoom-in duration-1000">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 px-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-8 h-[2px] bg-blue-500 rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 animate-pulse">Official Dashboard</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-display font-black text-white tracking-tighter uppercase leading-none">
              Bantang <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Junior</span>
            </h1>
            <p className="text-xs text-white/30 mt-2 font-bold uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-3 h-3" /> Updated: {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
            </p>
          </div>
          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 px-6 py-3 bg-white/5 text-white/60 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all border border-white/10 backdrop-blur-md">
               <Calendar className="w-3 h-3" /> Season 2024
             </button>
             <button onClick={handleOpenSliderAdd} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all font-black text-[10px] uppercase tracking-widest shadow-[0_0_30px_rgba(37,99,235,0.4)]">
               <Plus className="w-4 h-4" /> New Slide
             </button>
          </div>
        </div>

        {/* HERO SLIDER SECTION */}
        <div className="space-y-4">
          <div className="relative w-full h-[500px] md:h-[600px] lg:h-[650px] rounded-[2.5rem] overflow-hidden border border-white/10 glass-premium group shadow-[0_30px_70px_-20px_rgba(0,0,0,0.8)]">
            {sliders.length > 0 ? (
              <Swiper
                modules={[Autoplay, Navigation, Pagination, EffectFade]}
                effect="fade"
                spaceBetween={0}
                slidesPerView={1}
                loop={true}
                speed={1200}
                onSwiper={setSwiperInstance}
                onSlideChange={(swiper) => {
                  setActiveIndex(swiper.realIndex);
                  const activeSlide = sliders[swiper.realIndex];
                  if (activeSlide?.media_type === 'video') {
                    swiper.autoplay.stop();
                  } else {
                    swiper.autoplay.start();
                  }
                }}
                autoplay={{
                  delay: 6000,
                  disableOnInteraction: false,
                }}
                navigation={{
                  nextEl: '.swiper-btn-next',
                  prevEl: '.swiper-btn-prev',
                }}
                pagination={{ 
                  clickable: true,
                  renderBullet: (index, className) => {
                    return `<span class="${className} custom-bullet"></span>`;
                  }
                }}
                className="w-full h-full hero-swiper"
              >
                {sliders.map((slider: any) => (
                  <SwiperSlide key={slider.id} className="relative w-full h-full">
                    {({ isActive }) => (
                      <div className="w-full h-full relative overflow-hidden bg-transparent">
                        {/* Media Content */}
                        <div className={cn(
                          "absolute inset-0 transition-transform duration-[8000ms] ease-out-quad", 
                          isActive && slider.media_type === 'image' ? "scale-110 translate-y-[-1%]" : "scale-100 translate-y-0"
                        )}>
                          {slider.media_type === 'video' ? (
                            <div className="absolute inset-0 w-full h-full overflow-hidden bg-transparent">
                               {isActive && (
                                <div className="absolute inset-0 w-full h-full">
                                  <iframe
                                    src={getEmbedUrl(slider.video_url)}
                                    className="absolute inset-0 w-full h-full border-none pointer-events-none scale-100"
                                    allow="autoplay; encrypted-media; picture-in-picture; gyroscope;"
                                    title={slider.title}
                                    loading="eager"
                                  />
                                </div>
                              )}
                              {/* Background fallback */}
                              <img src={slider.img || "https://images.unsplash.com/photo-1543351611-58f69d7c1781?q=80&w=1200&auto=format&fit=crop"} alt="" className={cn("absolute inset-0 w-full h-full object-cover transition-opacity duration-1000", isActive ? "opacity-0" : "opacity-100")} />
                            </div>
                          ) : (
                            <img src={slider.img} alt="" className="absolute inset-0 w-full h-full object-cover" />
                          )}
                        </div>

                        {/* Minimal Info Bar (Moved below image in next div, or can stay as minimal overlay if requested) */}
                        {/* The prompt says "Ubah judul Dan tulisan di pindahkan di bawah kolom slider di sudut kiri bawah" */}
                        {/* I already have a div outside Swiper for this (line 343). Removing it from inside Swiper if any. */}

                        {/* Admin Controls (Floating) */}
                        <div className="absolute top-6 right-6 flex bg-black/30 backdrop-blur-md rounded-xl border border-white/10 p-1 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <button onClick={(e) => { e.stopPropagation(); handleOpenSliderEdit(slider); }} className="p-2.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-all"><Edit2 className="w-4 h-4" /></button>
                          <div className="w-px h-4 bg-white/10 self-center" />
                          <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ isOpen: true, id: slider.id }); }} className="p-2.5 rounded-lg hover:bg-red-500/20 text-red-500/40 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    )}
                  </SwiperSlide>
                ))}
                
                {/* Custom Navigation */}
                <div className="absolute bottom-6 right-6 z-20 flex gap-3 pointer-events-none group-hover:pointer-events-auto">
                  <button className="swiper-btn-prev w-12 h-12 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/40 hover:text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/50 transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-xl"><ChevronLeft className="w-6 h-6" /></button>
                  <button className="swiper-btn-next w-12 h-12 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/40 hover:text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/50 transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-xl"><ChevronRight className="w-6 h-6" /></button>
                </div>
              </Swiper>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/10">
                <ImageIcon className="w-20 h-20 mb-4" />
                <p className="text-xl font-display font-black uppercase tracking-widest">No Active Campaigns</p>
              </div>
            )}
          </div>

          {/* BELOW SLIDER INFO BAR (Captions) */}
          <AnimatePresence mode="wait">
            {activeSlider && (
              <motion.div 
                key={activeSlider.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                className="flex items-center gap-4 px-2"
              >
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 backdrop-blur-md shadow-lg">
                  {activeSlider.media_type === 'video' ? (
                    <div className="flex items-center gap-2 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-[0.2em] rounded-full">
                      <PlayCircle className="w-3 h-3" /> SPOTLIGHT
                    </div>
                  ) : (
                    <div className="px-2.5 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-[0.2em] rounded-full italic">
                      FEATURED
                    </div>
                  )}
                  
                  <div className="h-4 w-[1px] bg-white/10" />
                  
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-sm md:text-base font-black text-white uppercase tracking-tight whitespace-nowrap">
                      {activeSlider.title}
                    </span>
                    <span className="text-blue-500/40 font-black">•</span>
                    <span className="text-xs md:text-sm font-medium text-white/40 tracking-wide truncate max-w-[250px] md:max-w-xl">
                      {activeSlider.subtitle}
                    </span>
                  </div>
                </div>

                <div className="hidden lg:flex flex-col gap-1 flex-1">
                   {/* Slide Progress */}
                   <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        key={activeIndex}
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: activeSlider.media_type === 'video' ? 0 : 6, ease: "linear" }}
                        className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]"
                      />
                   </div>
                   <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Campaign Progress</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Players" value="1,245" icon={Users} trend="+8.2%" trendUp={true} subtitle="Registered active members" />
          <StatCard title="Performance Index" value="88.4" icon={Activity} trend="+2.4" trendUp={true} subtitle="Squad average ratings" />
          <StatCard title="Attendance Rate" value="96.8%" icon={Clock} trend="+0.5%" trendUp={true} subtitle="Weekly training sessions" />
          <StatCard title="Club Revenue" value="Rp 84.5M" icon={DollarSign} trend="+12%" trendUp={true} subtitle="Subscription income YTD" />
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-4">
          <QuickAction icon={Plus} label="New Player" onClick={() => navigate('/players')} />
          <QuickAction icon={Target} label="Performance" onClick={() => navigate('/performance')} />
          <QuickAction icon={Calendar} label="Training" onClick={() => navigate('/schedule')} />
          <QuickAction icon={ImageIcon} label="Gallery" onClick={() => navigate('/gallery')} />
          <QuickAction icon={Trophy} label="Competitions" onClick={() => {}} />
          <QuickAction icon={Users} label="Squad List" onClick={() => navigate('/players')} />
          <QuickAction icon={Activity} label="Health Hub" onClick={() => {}} />
          <QuickAction icon={DollarSign} label="Financials" onClick={() => {}} />
          <QuickAction icon={Download} label="Reports" onClick={() => {}} />
        </div>

        {/* CHARTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          
          {/* Skill Growth (Area Chart) */}
          <div className="glass-card p-6 xl:col-span-2 hover:border-blue-500/20 transition-colors group">
            <div className="flex justify-between items-center mb-8">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 block mb-1">Elite Analytics</span>
                <h3 className="text-xl font-display font-bold text-white uppercase tracking-tight">Growth Projection</h3>
              </div>
              <select className="bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl focus:outline-none focus:border-blue-500/50 transition-colors backdrop-blur-md">
                <option>Last 6 Months</option>
                <option>Last Year</option>
              </select>
            </div>
            <div className="w-full h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} tick={{ fontWeight: 700 }} />
                  <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} tick={{ fontWeight: 700 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-navy-dark)', borderColor: 'rgba(59, 130, 246, 0.2)', borderRadius: '16px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }} 
                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 700 }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" animationDuration={2000} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance Radar */}
          <div className="glass-card p-6 flex flex-col hover:border-blue-500/20 transition-colors">
            <div className="mb-6">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 block mb-1">Squad Comparison</span>
              <h3 className="text-xl font-display font-bold text-white uppercase tracking-tight">Performance Radar</h3>
            </div>
            <div className="w-full flex-1 min-h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={skillsRadarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: 800, textTransform: 'uppercase' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                  <Radar name="U-14 Pro" dataKey="A" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.4} animationDuration={2500} />
                  <Radar name="U-16 Elite" dataKey="B" stroke="#818CF8" fill="#818CF8" fillOpacity={0.2} animationDuration={2500} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--color-navy-dark)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Players Table */}
          <div className="glass-card xl:col-span-2 overflow-hidden hover:border-blue-500/20 transition-colors flex flex-col">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 block mb-1">Rankings</span>
                <h3 className="text-xl font-display font-bold text-white uppercase tracking-tight">Top Performance Elite</h3>
              </div>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all border border-white/10">
                View All <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] text-[10px] uppercase tracking-[0.2em] text-white/30">
                    <th className="py-4 px-8 font-black">Member Profile</th>
                    <th className="py-4 px-4 text-center font-black">Status</th>
                    <th className="py-4 px-4 text-center font-black">Score</th>
                    <th className="py-4 px-8 text-right font-black">Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {topPlayers.map((player) => (
                    <tr key={player.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="py-5 px-8">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-lg">
                            {player.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors uppercase tracking-tight">{player.name}</p>
                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{player.team}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-4 text-center">
                         <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                            <div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">Active</span>
                         </div>
                      </td>
                      <td className="py-5 px-4 text-center">
                        <span className="text-lg font-display font-black text-white/90 tracking-tighter">{player.score}</span>
                      </td>
                      <td className="py-5 px-8 text-right">
                        <div className="relative w-24 h-1.5 bg-white/5 rounded-full inline-block overflow-hidden align-middle mr-3">
                           <div className={cn("absolute inset-0 rounded-full", player.attendance > 95 ? "bg-emerald-500" : "bg-blue-500")} style={{ width: `${player.attendance}%` }} />
                        </div>
                        <span className={cn("text-xs font-black tracking-tight", player.attendance > 90 ? "text-emerald-400" : "text-blue-400")}>
                          {player.attendance}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Category Dist (Pie) */}
          <div className="glass-card p-6 flex flex-col hover:border-blue-500/20 transition-colors">
            <div className="mb-6">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 block mb-1">Demographics</span>
              <h3 className="text-xl font-display font-bold text-white uppercase tracking-tight">Academy Spread</h3>
            </div>
            <div className="w-full h-[300px] flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={ageCategoryStats} innerRadius={80} outerRadius={110} paddingAngle={8} dataKey="value" stroke="none" animationDuration={2000}>
                    {ageCategoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--color-navy-dark)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <span className="text-4xl font-display font-black text-white tracking-tighter">452</span>
                <span className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em] mt-1">Athletes</span>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
               {ageCategoryStats.map((cat, i) => (
                 <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{cat.name}</span>
                 </div>
               ))}
            </div>
          </div>

        </div>
      </div>

      <Modal isOpen={isSliderModalOpen} onClose={() => setIsSliderModalOpen(false)} title={editingSlider ? "Edit Banner Content" : "Create New Banner"}>
        <form onSubmit={handleSliderSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-3 p-1 bg-white/5 rounded-xl border border-white/10 shrink-0">
             <button 
               type="button"
               onClick={() => setSliderForm({...sliderForm, media_type: 'image'})}
               className={cn("py-2.5 rounded-lg flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all", 
                 sliderForm.media_type === 'image' ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white"
               )}
             >
               <ImageIcon className="w-3.5 h-3.5" /> Image
             </button>
             <button 
               type="button"
               onClick={() => setSliderForm({...sliderForm, media_type: 'video'})}
               className={cn("py-2.5 rounded-lg flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all", 
                 sliderForm.media_type === 'video' ? "bg-emerald-500 text-white shadow-lg" : "text-white/40 hover:text-white"
               )}
             >
               <Video className="w-3.5 h-3.5" /> Video
             </button>
          </div>

          <div className="flex flex-col gap-4">
            {sliderForm.media_type === 'image' ? (
              <div className="relative group w-full h-40">
                <div className="w-full h-full rounded-2xl overflow-hidden border border-dashed border-white/20 group-hover:border-blue-500/50 transition-colors relative bg-black/40">
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                  )}
                  {sliderForm.img ? (
                    <img src={sliderForm.img} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white/20">
                      <ImageIcon className="w-8 h-8 mb-2" />
                      <span className="text-[10px] uppercase tracking-widest font-black">Upload Slide Image</span>
                    </div>
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl">
                  <div className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl">
                    <Plus className="w-4 h-4" /> Pick File
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                        <Youtube className="w-5 h-5" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Video Stream URL</p>
                        <p className="text-xs text-white/80 font-bold uppercase tracking-tight">YouTube / Google Drive</p>
                     </div>
                  </div>
                  <input 
                    type="url" 
                    required 
                    value={sliderForm.video_url} 
                    onChange={(e) => setSliderForm({...sliderForm, video_url: e.target.value})} 
                    className="w-full bg-[var(--color-navy-dark)] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors" 
                    placeholder="https://youtube.com/watch?v=..." 
                  />
                  <p className="text-[9px] text-white/20 mt-3 font-medium flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3" /> Pastikan link dapat diakses secara publik (Shared/Public)
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                   <label className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-1 block underline underline-offset-4 decoration-white/10">Video Thumbnail (Fallback Mobile)</label>
                   <div className="flex gap-4">
                      <div className="w-24 h-16 rounded-xl border border-white/10 overflow-hidden bg-black/40 shrink-0">
                         {sliderForm.img ? <img src={sliderForm.img} className="w-full h-full object-cover" /> : null}
                      </div>
                      <label className="flex-1 border border-dashed border-white/10 rounded-xl flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors">
                        <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Upload Cover</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                   <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Autoplay</span>
                      <input 
                        type="checkbox" 
                        checked={sliderForm.autoplay} 
                        onChange={(e) => setSliderForm({...sliderForm, autoplay: e.target.checked})}
                        className="w-4 h-4 accent-emerald-500"
                      />
                   </div>
                   <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Loop Video</span>
                      <input 
                        type="checkbox" 
                        checked={sliderForm.loop} 
                        onChange={(e) => setSliderForm({...sliderForm, loop: e.target.checked})}
                        className="w-4 h-4 accent-emerald-500"
                      />
                   </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 block">Main Title</label>
              <input type="text" required value={sliderForm.title} onChange={(e) => setSliderForm({...sliderForm, title: e.target.value})} className="w-full bg-[var(--color-navy-dark)] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="e.g. SSB BANTANG" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 block">Highlight Subtitle</label>
              <input type="text" required value={sliderForm.subtitle} onChange={(e) => setSliderForm({...sliderForm, subtitle: e.target.value})} className="w-full bg-[var(--color-navy-dark)] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="e.g. JUNIOR ACADEMY" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 block">Description</label>
              <textarea required value={sliderForm.description} onChange={(e) => setSliderForm({...sliderForm, description: e.target.value})} className="w-full bg-[var(--color-navy-dark)] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500 h-24 resize-none transition-colors" placeholder="Write banner description here..." />
            </div>
          </div>

          <div className="pt-4 flex gap-3 sticky bottom-0 bg-[#050b1a] py-3 -mx-6 px-6 border-t border-white/5">
            <button type="button" onClick={() => setIsSliderModalOpen(false)} className="flex-1 py-4 rounded-xl border border-white/10 text-white/60 font-black text-[10px] uppercase tracking-widest hover:bg-white/5 transition-colors">Discard</button>
            <button type="submit" className="flex-[2] py-4 rounded-xl bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-500 transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)]">
              <Save className="w-4 h-4" /> {editingSlider ? "Update Slide" : "Publish Content"}
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
