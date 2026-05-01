import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Activity, Plus, Clock, 
  Image as ImageIcon, ChevronLeft, ChevronRight, Trash2, Edit2, Save, Loader2, Video, Youtube, PlayCircle, AlertTriangle, Trophy, Star, ArrowUpRight, CheckCircle2
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid 
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

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0c162d]/90 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-2xl">
        <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-white font-bold text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
            {p.name}: <span className="font-black">{p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { appName } = useSettings();
  const navigate = useNavigate();
  const { data: sliders, addItems, updateItem, deleteItem } = useCMSData('dashboard_sliders', initialSliders);
  const { data: playersList } = useCMSData('players', [] as any[]);
  
  const [isSliderModalOpen, setIsSliderModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingSlider, setEditingSlider] = useState<any>(null);
  const [sliderForm, setSliderForm] = useState({ 
    title: '', subtitle: '', description: '', img: '', media_type: 'image', 
    video_url: '', autoplay: true, loop: true
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
          if (swiperInstance) swiperInstance.slideNext();
        }
      } catch (e) {}
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [swiperInstance]);

  // Derived Data for Dashboard
  const stats = useMemo(() => {
    const totalPlayers = playersList.length;
    
    // Average Attendance
    const avgAttendance = playersList.length > 0
      ? (playersList.reduce((acc: number, p: any) => acc + (p.attendance || 0), 0) / playersList.length).toFixed(1)
      : 0;
      
    // Average Overall Score
    const avgOverall = playersList.length > 0
      ? (playersList.reduce((acc: number, p: any) => acc + (p.overall || 0), 0) / playersList.length).toFixed(1)
      : 0;

    // Fast robust sorting by overall (with fallback to 0)
    const sortedPlayers = [...playersList].sort((a: any, b: any) => (b.overall || 0) - (a.overall || 0));
    const topPlayers = sortedPlayers.slice(0, 3);
    const bestPlayer = topPlayers[0] || null;

    // Category Distribution (Pie Chart)
    const categoryCount: Record<string, number> = {};
    playersList.forEach((p: any) => {
      const cat = p.category || 'Lainnya';
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });
    
    const pieColors = ['#3B82F6', '#10B981', '#EAB308', '#8B5CF6', '#F43F5E', '#14B8A6'];
    const categoryData = Object.keys(categoryCount).map((key, i) => ({
      name: key,
      value: categoryCount[key],
      color: pieColors[i % pieColors.length]
    })).sort((a,b) => b.value - a.value);

    // Performance Trend (Simulated via Category Averages for Mini Chart)
    const performanceData = Object.keys(categoryCount).map(key => {
      const catPlayers = playersList.filter((p: any) => p.category === key);
      const catAvg = catPlayers.reduce((acc: number, p: any) => acc + (p.overall || 0), 0) / catPlayers.length;
      return {
        name: key,
        value: Math.round(catAvg),
        color: pieColors[0]
      }
    });

    return { totalPlayers, avgAttendance, avgOverall, topPlayers, bestPlayer, categoryData, performanceData };
  }, [playersList]);

  const activeSlider = sliders[activeIndex] || sliders[0];

  const handleOpenSliderAdd = () => { 
    setEditingSlider(null); 
    setSliderForm({ title: '', subtitle: '', description: '', img: '', media_type: 'image', video_url: '', autoplay: true, loop: true }); 
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
        if (publicUrl) setSliderForm({ ...sliderForm, img: publicUrl });
      } catch (error) {
        console.error("Upload failed:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Shared Number Counter Animation Component conceptually (using state or direct render)
  // For simplicity, directly rendering as static formatted values since framer-motion useSpring requires more setup,
  // but CSS fading covers the "smoothness".

  return (
    <Layout>
      <div className="flex flex-col gap-8 pb-16 w-full max-w-7xl mx-auto px-4 md:px-8 mt-4 animate-in fade-in zoom-in duration-1000">
        
        {/* HEADER */}
        <div className="border-b border-white/5 pb-6">
          <div className="flex items-center gap-2 mb-2">
             <span className="w-4 h-1 bg-yellow-500 rounded-full" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Overview</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-display font-black text-[#fdc700] drop-shadow-[0_0_15px_rgba(253,199,0,0.3)] tracking-tight leading-none italic uppercase">
            SSB BANTANG JUNIOR
          </h1>
        </div>

        {/* TOP SUMMARY (4 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6">
           {/* Card 1: Total Pemain */}
           <div className="bg-[#0c162d]/80 backdrop-blur-xl border border-white/5 hover:border-blue-500/20 p-5 xl:p-6 rounded-[2rem] shadow-xl flex flex-col justify-between relative overflow-hidden group transition-all duration-300 min-h-[140px]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full filter blur-3xl -translate-y-10 translate-x-10 group-hover:bg-blue-500/20 transition-all pointer-events-none" />
              <div className="flex items-center gap-3 relative z-10 mb-4">
                 <div className="p-2 sm:p-2.5 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                 </div>
                 <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-white/40 truncate">Total Pemain</span>
              </div>
              <div className="relative z-10">
                 <h2 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight group-hover:text-blue-400 transition-colors">{stats.totalPlayers}</h2>
                 <p className="text-[10px] sm:text-xs text-emerald-400 font-bold mt-1 flex items-center gap-1 truncate"><ArrowUpRight className="w-3 h-3 shrink-0"/> Active Roster</p>
              </div>
           </div>

           {/* Card 2: Kehadiran */}
           <div className="bg-[#0c162d]/80 backdrop-blur-xl border border-white/5 hover:border-emerald-500/20 p-5 xl:p-6 rounded-[2rem] shadow-xl flex flex-col justify-between relative overflow-hidden group transition-all duration-300 min-h-[140px]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full filter blur-3xl -translate-y-10 translate-x-10 group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
              <div className="flex items-center gap-3 relative z-10 mb-4">
                 <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                 </div>
                 <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-white/40 truncate">Kehadiran</span>
              </div>
              <div className="relative z-10">
                 <h2 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight group-hover:text-emerald-400 transition-colors">{stats.avgAttendance}%</h2>
                 <p className="text-[10px] sm:text-xs text-white/30 font-bold mt-1 truncate">Sesi Latihan Bulan Ini</p>
              </div>
           </div>

           {/* Card 3: Top Ranking Pemain */}
           <div className="bg-[#0c162d]/80 backdrop-blur-xl border border-white/5 hover:border-yellow-500/20 p-5 xl:p-6 rounded-[2rem] shadow-xl flex flex-col justify-between relative overflow-hidden group transition-all duration-300 min-h-[140px]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full filter blur-3xl -translate-y-10 translate-x-10 group-hover:bg-yellow-500/20 transition-all pointer-events-none" />
              <div className="flex justify-between items-start relative z-10 mb-4 gap-2">
                 <div className="flex items-center gap-3 min-w-0">
                   <div className="p-2 sm:p-2.5 rounded-xl bg-yellow-500/10 text-yellow-500 shrink-0">
                      <Star className="w-4 h-4 sm:w-5 sm:h-5" />
                   </div>
                   <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-white/40 truncate">Bintang Tim</span>
                 </div>
                 {stats.bestPlayer && (
                   <span className="text-[9px] sm:text-[10px] font-black text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-md shrink-0">RANK #1</span>
                 )}
              </div>
              <div className="relative z-10">
                 {stats.bestPlayer ? (
                   <>
                     <h2 className="text-lg sm:text-xl font-display font-black text-white tracking-tight truncate group-hover:text-yellow-400 transition-colors uppercase">{stats.bestPlayer.name}</h2>
                     <p className="text-[10px] sm:text-xs text-white/50 font-bold mt-0.5 truncate">{stats.bestPlayer.category} • OVR {stats.bestPlayer.overall}</p>
                   </>
                 ) : (
                   <p className="text-xs sm:text-sm text-white/30 font-medium">Belum ada data</p>
                 )}
              </div>
           </div>

           {/* Card 4: Top Performa Tim */}
           <div className="bg-[#0c162d]/80 backdrop-blur-xl border border-white/5 hover:border-indigo-500/20 p-5 xl:p-6 rounded-[2rem] shadow-xl flex flex-col justify-between relative overflow-hidden group transition-all duration-300 min-h-[140px]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full filter blur-3xl -translate-y-10 translate-x-10 group-hover:bg-indigo-500/20 transition-all pointer-events-none" />
              <div className="flex items-center gap-3 relative z-10 mb-4">
                 <div className="p-2 sm:p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
                 </div>
                 <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-white/40 truncate">Rating Tim (Avg)</span>
              </div>
              <div className="relative z-10 flex items-end gap-2 sm:gap-3">
                 <h2 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight group-hover:text-indigo-400 transition-colors">{stats.avgOverall}</h2>
                 <span className="text-[10px] sm:text-sm text-white/30 font-bold mb-1 shrink-0">/ 100</span>
              </div>
           </div>
        </div>

        {/* MIDDLE SECTION (Slider & Top Players) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           
           {/* SLIDER (Dipertahankan tapi Clean) */}
           <div className="lg:col-span-8 bg-[#0c162d]/60 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-[400px] md:h-[480px] relative">
              <div className="flex-1 w-full h-full relative">
                {sliders.length > 0 ? (
                  <Swiper
                    modules={[Autoplay, Navigation, Pagination, EffectFade]}
                    effect="fade" spaceBetween={0} slidesPerView={1} loop={true} speed={1000}
                    onSwiper={setSwiperInstance}
                    onSlideChange={(swiper) => {
                      setActiveIndex(swiper.realIndex);
                      const activeS = sliders[swiper.realIndex];
                      if (activeS?.media_type === 'video') swiper.autoplay.stop();
                      else swiper.autoplay.start();
                    }}
                    autoplay={{ delay: 5000, disableOnInteraction: false }}
                    className="w-full h-full group"
                  >
                    {sliders.map((slider: any) => (
                      <SwiperSlide key={slider.id} className="relative w-full h-full">
                        <div className="absolute inset-0 z-0 bg-[#080d19]">
                           {slider.media_type === 'video' ? (
                             <>
                               <iframe src={getEmbedUrl(slider.video_url)} className="absolute inset-0 w-full h-full scale-[1.05] pointer-events-none" allow="autoplay; muted" />
                               {/* Minimal dark overlay to ensure text is readable */}
                               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                             </>
                           ) : (
                             <>
                               <img src={slider.img} alt="" className="absolute inset-0 w-full h-full object-cover scale-[1.02]" />
                               <div className="absolute inset-0 bg-gradient-to-t from-[#0c162d] via-black/20 to-transparent" />
                             </>
                           )}
                        </div>

                        {/* Minimal Text Overlay at bottom */}
                        <div className="absolute bottom-0 left-0 right-0 p-8 pt-24 z-10 flex justify-between items-end">
                           <div className="max-w-xl">
                              <h3 className="text-2xl md:text-3xl font-display font-black text-white uppercase tracking-tight text-shadow-sm mb-1">{slider.title}</h3>
                              <p className="text-sm font-medium text-white/70 line-clamp-1">{slider.subtitle} • {slider.description}</p>
                           </div>
                           
                           {/* Admin Controls */}
                           <div className="flex gap-2">
                             <button onClick={(e) => { e.stopPropagation(); handleOpenSliderEdit(slider); }} className="w-10 h-10 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 text-white/50 hover:text-white flex items-center justify-center transition-all"><Edit2 className="w-4 h-4" /></button>
                             <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ isOpen: true, id: slider.id }); }} className="w-10 h-10 rounded-xl bg-red-500/20 backdrop-blur-md border border-white/10 text-red-400 hover:text-red-500 hover:bg-red-500/30 flex items-center justify-center transition-all"><Trash2 className="w-4 h-4" /></button>
                           </div>
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white/20 bg-[#080d19]">
                    <ImageIcon className="w-12 h-12 mb-4" />
                    <p className="text-sm font-bold uppercase tracking-widest">No Banner</p>
                  </div>
                )}
              </div>
           </div>

           {/* TOP RANKING PEMAIN (Horizontal List tapi di layout vertikal di side) */}
           <div className="lg:col-span-4 bg-[#0c162d]/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-6 shadow-xl flex flex-col gap-5">
              <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.8)]" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-white">Top Players</h3>
                 </div>
                 <button onClick={() => navigate('/players')} className="text-[10px] uppercase font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">Details <ChevronRight className="w-3 h-3" /></button>
              </div>

              <div className="flex flex-col gap-4 flex-1">
                 {stats.topPlayers.length > 0 ? stats.topPlayers.map((player: any, idx: number) => (
                   <div key={player.id} className="relative group cursor-pointer" onClick={() => navigate(`/players/${player.id}`)}>
                      {idx === 0 && <div className="absolute inset-0 bg-yellow-500/10 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />}
                      <div className={cn(
                        "relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300",
                        idx === 0 ? "bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/30" : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]"
                      )}>
                         <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-white/10 relative">
                            <img src={player.photo || 'https://via.placeholder.com/150'} alt={player.name} className="w-full h-full object-cover" />
                         </div>
                         <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                               <h4 className={cn("text-base font-bold truncate tracking-tight", idx === 0 ? "text-yellow-400" : "text-white")}>{player.name}</h4>
                            </div>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-0.5">{player.category} • {player.position}</p>
                         </div>
                         <div className="shrink-0 text-right">
                            <span className={cn("text-xl font-display font-black", idx === 0 ? "text-yellow-500" : "text-white/80")}>{player.overall || 0}</span>
                            <span className="block text-[8px] text-white/30 uppercase font-black tracking-widest mt-0.5">Rating</span>
                         </div>
                      </div>
                   </div>
                 )) : (
                   <div className="text-center py-10">
                     <p className="text-xs text-white/30 font-medium">Beri rating pemain di menu Pemain untuk melihat ranking.</p>
                   </div>
                 )}
              </div>
           </div>
        </div>

        {/* BOTTOM SECTION (Charts) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           
           {/* DIAGRAM DISTRIBUSI UMUR */}
           <div className="bg-[#0c162d]/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-7 shadow-xl hover:border-blue-500/20 transition-all flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Distribusi Kelas Umur</h3>
              </div>
              <div className="flex-1 flex flex-col md:flex-row items-center gap-8">
                 <div className="w-[200px] h-[200px] relative shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                         <Pie data={stats.categoryData} innerRadius={65} outerRadius={90} paddingAngle={2} dataKey="value" stroke="none">
                           {stats.categoryData.map((e, i) => <Cell key={i} fill={e.color} />)}
                         </Pie>
                         <RechartsTooltip content={<CustomTooltip />} />
                       </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                       <span className="text-3xl font-display font-black text-white">{stats.totalPlayers}</span>
                       <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Total</span>
                    </div>
                 </div>
                 <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-3 w-full">
                    {stats.categoryData.map((cat, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                         <div className="flex items-center gap-2">
                           <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                           <span className="text-xs font-bold text-white/80">{cat.name}</span>
                         </div>
                         <span className="text-sm font-display font-black text-white">{cat.value}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* PERFORMANCE OVERVIEW MINI CHART */}
           <div className="bg-[#0c162d]/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-7 shadow-xl hover:border-blue-500/20 transition-all flex flex-col">
              <div className="flex items-center gap-3 mb-8">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Rata-Rata Rating Performa</h3>
              </div>
              <div className="flex-1 w-full min-h-[220px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                       <defs>
                          <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                             <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                       <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} tick={{ fontWeight: 700 }} />
                       <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} tick={{ fontWeight: 700 }} domain={[('dataMin' as any) - 10, 100]} />
                       <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                       <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} fill="url(#colorPerf)" animationDuration={1500} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

        </div>
      </div>

      {/* Editor Modal for Slider remains functional */}
      <Modal isOpen={isSliderModalOpen} onClose={() => setIsSliderModalOpen(false)} title={editingSlider ? "Edit Banner Content" : "Create New Banner"}>
        <form onSubmit={handleSliderSubmit} className="space-y-5">
           {/* Form Content - Same structure just keeping it functional */}
           <div className="grid grid-cols-2 gap-3 p-1 bg-white/5 rounded-xl border border-white/10 shrink-0">
             <button type="button" onClick={() => setSliderForm({...sliderForm, media_type: 'image'})} className={cn("py-2.5 rounded-lg flex gap-2 justify-center items-center text-[10px] font-black uppercase tracking-widest transition-all", sliderForm.media_type === 'image' ? "bg-white text-black" : "text-white/40")}>
               <ImageIcon className="w-3.5 h-3.5" /> Image
             </button>
             <button type="button" onClick={() => setSliderForm({...sliderForm, media_type: 'video'})} className={cn("py-2.5 rounded-lg flex gap-2 justify-center items-center text-[10px] font-black uppercase tracking-widest transition-all", sliderForm.media_type === 'video' ? "bg-emerald-500 text-white" : "text-white/40")}>
               <Video className="w-3.5 h-3.5" /> Video
             </button>
           </div>
           
           <div className="space-y-4">
             {sliderForm.media_type === 'image' ? (
                <div className="relative w-full h-40 bg-black/40 rounded-xl border border-dashed border-white/20 flex items-center justify-center group overflow-hidden">
                   {sliderForm.img ? <img src={sliderForm.img} className="w-full h-full object-cover" /> : <div className="text-white/30 text-xs font-bold uppercase tracking-widest">Upload</div>}
                   {isUploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-blue-500"><Loader2 className="animate-spin w-8 h-8" /></div>}
                   <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity z-10 text-xs font-bold text-white uppercase tracking-widest"><Plus className="w-4 h-4 mr-2"/> Browse<input type="file" onChange={handleImageUpload} className="hidden"/></label>
                </div>
             ) : (
                <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block">Youtube / G-Drive URL</label>
                   <input type="url" required value={sliderForm.video_url} onChange={(e) => setSliderForm({...sliderForm, video_url: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-emerald-500" placeholder="https://..." />
                </div>
             )}
             
             <div>
               <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-1">Title</label>
               <input type="text" required value={sliderForm.title} onChange={(e) => setSliderForm({...sliderForm, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500" />
             </div>
             <div>
               <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-1">Subtitle</label>
               <input type="text" required value={sliderForm.subtitle} onChange={(e) => setSliderForm({...sliderForm, subtitle: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500" />
             </div>
             <div>
               <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-1">Description</label>
               <textarea required value={sliderForm.description} onChange={(e) => setSliderForm({...sliderForm, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500 h-20 resize-none" />
             </div>
           </div>

           <div className="pt-2 flex gap-3">
             <button type="button" onClick={() => setIsSliderModalOpen(false)} className="flex-1 py-3 px-4 rounded-xl border border-white/10 font-bold text-xs uppercase tracking-widest text-white/60 hover:bg-white/5 transition-colors">Cancel</button>
             <button type="submit" className="flex-1 py-3 px-4 rounded-xl bg-blue-600 font-bold text-xs uppercase tracking-widest text-white hover:bg-blue-500 flex items-center justify-center gap-2 transition-colors"><Save className="w-4 h-4"/> Save</button>
           </div>
        </form>
      </Modal>

      <ConfirmModal 
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '' })}
        onConfirm={() => deleteItem(deleteConfirm.id)}
        message={`Delete banner?`}
      />
    </Layout>
  );
}
