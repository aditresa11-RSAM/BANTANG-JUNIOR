import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Target, 
  Users, 
  Calendar, 
  ArrowRight,
  Play, 
  Star, 
  MapPin, 
  Phone, 
  Mail,
  Instagram,
  Facebook,
  Trophy,
  Award
} from 'lucide-react';

import { useAuth, useSettings } from '../App';
import { useEffect, useState, useRef } from 'react';
import { academyPrograms } from '../data/programs';
import { useCMSData } from '../lib/store';
import { Edit2 } from 'lucide-react';
import ReactPlayer from 'react-player';
import type { HeroManagement } from './ManageHero';

function SafeVideo({ src, autoPlay, className }: { src: string, autoPlay?: boolean, className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  useEffect(() => {
    if (autoPlay && videoRef.current && !hasError) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Auto-play might be blocked by browser
        });
      }
    }
  }, [src, autoPlay, hasError]);

  if (hasError || !src) {
    return (
      <img 
        src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=2693"
        alt="Fallback background"
        className={`${className} object-cover`}
      />
    );
  }

  return <video ref={videoRef} src={src} className={className} muted loop playsInline onError={() => setHasError(true)} />;
}

export default function LandingPage() {
  const { appName, logoUrl, heroBgUrl } = useSettings();
  const { user } = useAuth();
  const { data: programs, isLoading } = useCMSData('programs', academyPrograms);
  const { data: heroSlidersData } = useCMSData<HeroManagement>('hero_management', []);
  const { data: coaches, isLoading: isLoadingCoaches } = useCMSData('coaches', []);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const navigate = useNavigate();

  // Process sliders: Filter only active and sort by order_index
  const activeSliders = (heroSlidersData || [])
    .filter(s => s.is_active === true)
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

  // Fallback to initial data if empty
  const activePrograms = (programs && programs.length > 0) ? programs : academyPrograms;

  useEffect(() => {
    if (activeSliders.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex(prev => (prev + 1) % activeSliders.length);
    }, 6000); // 6 second slides
    return () => clearInterval(interval);
  }, [activeSliders.length]);

  useEffect(() => {
    if (user) return;
    const hasVisited = localStorage.getItem('ssb_has_visited');
    if (!hasVisited) {
      localStorage.setItem('ssb_has_visited', 'true');
      navigate('/login');
    }
  }, [navigate, user]);
  
  return (
    <div className="bg-[var(--color-navy-dark)]">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-[#0a0f1c]/40 backdrop-blur-md lg:bg-black/20 lg:backdrop-blur-lg h-[60px] lg:h-[70px]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-8 h-8 md:w-10 md:h-12 object-contain drop-shadow-md" />
            ) : (
              <Trophy className="text-[var(--color-primary)] w-7 h-7 md:w-10 md:h-10" />
            )}
            <div className="flex flex-col">
              <span className="font-display font-bold text-base md:text-lg tracking-tighter text-white drop-shadow-md truncate leading-tight uppercase">{appName}</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8 flex-1 justify-end mr-12 text-[#0a0f1c]">
            {['Program', 'Pelatih', 'Fasilitas', 'Kontak'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`} 
                className="text-sm font-bold text-white/70 hover:text-[var(--color-primary)] transition-colors uppercase tracking-widest"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {/* Auth buttons removed per request */}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[100dvh] flex items-end lg:items-center pt-32 pb-32 md:pb-36 lg:pb-0 lg:pt-20 overflow-hidden">
        {/* Animated Background Assets - Sliders or Fallback */}
        <div className="absolute inset-0 z-0 bg-[#0a0f1c]">
          {activeSliders.length > 0 ? (
            activeSliders.map((slider, index) => (
              <div 
                key={slider.id} 
                className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlideIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              >
                {/* Media Renderer */}
                {slider.hero_type === 'image' && (
                  <img 
                    src={slider.image_url} 
                    alt={slider.title} 
                    className="w-full h-full object-cover object-center lg:object-top scale-105 animate-[slowZoom_20s_ease-in-out_infinite]"
                    onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=2693" }}
                  />
                )}
                {slider.hero_type === 'youtube' && slider.youtube_url && (
                  <div className="absolute top-1/2 left-1/2 w-[300vw] h-[300vh] lg:w-[150vw] lg:h-[150vh] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    {(() => {
                      const Player = ReactPlayer as any;
                      return (
                        <Player
                          url={slider.youtube_url} width="100%" height="100%"
                          playing={true} muted={true} loop={true} playsinline={true}
                          config={{ 
                            youtube: { 
                              disablekb: 1, 
                              rel: 0, 
                              iv_load_policy: 3
                            } 
                          }}
                        />
                      );
                    })()}
                  </div>
                )}
                {slider.hero_type === 'video' && slider.video_url && (
                  <SafeVideo 
                    src={slider.video_url} 
                    className="w-full h-full object-cover object-center lg:object-cover" 
                    autoPlay={true} 
                  />
                )}
                {slider.hero_type === 'gdrive' && slider.gdrive_url && (
                  <div className="absolute top-1/2 left-1/2 w-[300vw] h-[300vh] lg:w-[120vw] lg:h-[120vh] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <iframe 
                      src={slider.gdrive_url} 
                      className="w-full h-full border-0 pointer-events-none" 
                      allow="autoplay" 
                      title="Google Drive Video"
                    />
                  </div>
                )}

                {/* Desktop Overlay */}
                <div 
                  className="hidden lg:block absolute inset-0" 
                  style={{
                    background: `linear-gradient(to top, ${slider.overlay_color}${Math.floor((slider.overlay_opacity || 60) * 2.55).toString(16).padStart(2, '0')}, transparent), 
                                 radial-gradient(circle at center, transparent 0%, ${slider.overlay_color}${Math.floor((slider.overlay_opacity || 60) * 1.5).toString(16).padStart(2, '0')} 100%)`
                  }}
                />
                
                {/* Mobile Cinematic Overlay */}
                <div 
                  className="lg:hidden absolute inset-0"
                  style={{
                    background: 'linear-gradient(to top, rgba(10,15,28,0.95) 0%, rgba(10,15,28,0.6) 45%, rgba(234,179,8,0.05) 100%)'
                  }}
                />
              </div>
            ))
          ) : (
            <>
              <img 
                src={heroBgUrl || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=2693"} 
                alt="Football Stadium" 
                className="w-full h-full object-cover opacity-100 object-center lg:object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1c] via-[#0a0f1c]/70 lg:bg-gradient-to-r lg:from-[#0a0f1c]/90 lg:via-[#0a0f1c]/60 to-transparent" />
            </>
          )}
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-20 w-full mb-0 lg:mb-0">
          <div className="max-w-3xl">
            {activeSliders.length > 0 ? (
              <div className="w-full flex flex-col items-center lg:items-start text-center lg:text-left mx-auto lg:mx-0">
                <div key={currentSlideIndex} className="animate-in fade-in slide-in-from-bottom-8 duration-700 w-full flex flex-col items-center lg:block">
                  <h1 style={{ fontSize: '50px' }} className="text-4xl sm:text-5xl md:text-6xl lg:text-[5.5rem] font-display font-black leading-none mb-3 sm:mb-4 lg:mb-8 tracking-tight drop-shadow-xl text-white uppercase max-w-full text-center lg:text-left" dangerouslySetInnerHTML={{ __html: activeSliders[currentSlideIndex]?.title?.replace(/\n/g, '<br />') || '' }} />
                  <p className="text-[11px] sm:text-lg lg:text-[19px] text-[#ffffff] italic font-normal mb-6 sm:mb-10 leading-relaxed mx-auto lg:ml-0 max-w-[90%] lg:max-w-2xl drop-shadow-md whitespace-nowrap md:whitespace-normal overflow-hidden text-ellipsis text-center lg:text-left">
                    {activeSliders[currentSlideIndex]?.subtitle}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 w-[280px] sm:w-[320px] lg:w-auto lg:mx-0">
                    <button 
                      onClick={() => navigate('/login')}
                      className="w-full sm:w-[260px] flex justify-center items-center gap-3 py-3.5 lg:py-4 px-6 rounded-full lg:rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-600 lg:bg-[var(--color-primary)] text-black font-bold shadow-[0_0_20px_rgba(250,204,21,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-sm lg:text-base uppercase tracking-wider glow-button"
                    >
                      Masuk
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                      >
                        <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5" />
                      </motion.div>
                    </button>
                    <button 
                      onClick={() => navigate('/register-player')}
                      className="w-full sm:w-[260px] flex justify-center items-center py-3.5 lg:py-4 px-6 rounded-full lg:rounded-2xl bg-[#0c162d]/50 lg:bg-white/5 backdrop-blur-md border border-white/10 text-white font-bold hover:bg-white/10 hover:border-white/20 active:scale-[0.98] transition-all duration-300 text-sm lg:text-base uppercase tracking-wider lg:hover:scale-105 shadow-lg"
                    >
                      Daftar Siswa Baru
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full flex flex-col items-center lg:items-start text-center lg:text-left mx-auto lg:mx-0"
              >
                <div className="w-full flex flex-col items-center lg:block">
                  <h1 style={{ fontSize: '50px' }} className="text-4xl sm:text-5xl md:text-6xl lg:text-[5.5rem] font-display font-black leading-none mb-3 sm:mb-4 lg:mb-8 tracking-tight drop-shadow-xl text-white uppercase max-w-full text-center lg:text-left">
                    BANGUN BINTANG <br /> 
                    <span className="text-[var(--color-primary)] text-glow">MASA DEPAN</span>
                  </h1>
                  <p className="text-[11px] sm:text-lg lg:text-[19px] text-[#ffffff] italic font-normal mb-6 sm:mb-10 leading-relaxed mx-auto lg:ml-0 max-w-[90%] lg:max-w-2xl drop-shadow-md whitespace-nowrap md:whitespace-normal overflow-hidden text-ellipsis text-center lg:text-left">
                    Program pembinaan sepak bola modern berbasis data, disiplin, dan performa tingkat nasional 
                    <br className="hidden md:block" />
                    Kami melatih teknik, fisik, dan mental calon atlet profesional
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 w-[280px] sm:w-[320px] lg:w-auto lg:mx-0">
                    <button 
                      onClick={() => navigate('/login')}
                      className="w-full sm:w-[260px] flex justify-center items-center gap-3 py-3.5 lg:py-4 px-6 rounded-full lg:rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-600 lg:bg-[var(--color-primary)] text-black font-bold shadow-[0_0_20px_rgba(250,204,21,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-sm lg:text-base uppercase tracking-wider glow-button"
                    >
                      Masuk
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                      >
                        <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5" />
                      </motion.div>
                    </button>
                    <button 
                      onClick={() => navigate('/register-player')}
                      className="w-full sm:w-[260px] flex justify-center items-center py-3.5 lg:py-4 px-6 rounded-full lg:rounded-2xl bg-[#0c162d]/50 lg:bg-white/5 backdrop-blur-md border border-white/10 text-white font-bold hover:bg-white/10 hover:border-white/20 active:scale-[0.98] transition-all duration-300 text-sm lg:text-base uppercase tracking-wider lg:hover:scale-105 shadow-lg"
                    >
                      Daftar Siswa Baru
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Floating Stats */}
        <div className="hidden lg:block absolute bottom-10 right-10 z-20">
          <div className="bg-white/5 backdrop-blur-lg p-6 border-l-4 border-l-[var(--color-primary)] rounded-r-2xl border border-white/10 shadow-2xl">
            <div className="flex gap-10">
              <div>
                <p className="text-sm text-white mb-1">Pemain Aktif</p>
                <p className="text-3xl font-display font-bold text-center text-[#facc15]">30+</p>
              </div>
              <div>
                <p className="text-sm text-white mb-1">Pelatih Pro</p>
                <p className="text-3xl font-display font-bold text-center text-[#facc15]">3</p>
              </div>
              <div>
                <p className="text-sm text-white mb-1">Turnamen</p>
                <p className="text-3xl font-display font-bold text-center text-[#facc15]">10+</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Stats Ribbon */}
        <div className="lg:hidden absolute bottom-0 left-0 right-0 bg-[#0a0f1c]/80 backdrop-blur-md border-t border-white/10 flex flex-col z-20">
          <div className="py-3 px-6 flex justify-between items-center">
            <div className="text-center">
              <p className="text-[10px] text-white/50 uppercase tracking-wider">Pemain Aktif</p>
              <p className="text-lg font-display font-bold text-yellow-400">30+</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-[10px] text-white/50 uppercase tracking-wider">Pelatih Pro</p>
              <p className="text-lg font-display font-bold text-yellow-400">3</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-[10px] text-white/50 uppercase tracking-wider">Turnamen</p>
              <p className="text-lg font-display font-bold text-yellow-400">10+</p>
            </div>
          </div>
          <div className="pb-2 text-center border-t border-white/5 pt-1">
            <p className="text-[7px] font-bold text-white/30 uppercase tracking-[0.3em]">Support by Adadistro</p>
          </div>
        </div>

        <div className="hidden lg:block absolute bottom-4 right-10 z-20">
          <p className="text-[10px] font-bold text-white uppercase tracking-[0.3em]">Support by Adadistro</p>
        </div>
      </section>
      <section id="program" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-bold mb-4" style={{ fontSize: 'clamp(40px, 6vw, 71px)' }}>PROGRAM UNGGULAN</h2>
            <div className="w-24 h-1 bg-[var(--color-primary)] mx-auto rounded-full shadow-[0_0_10px_var(--color-primary)]" />
            <p className="mt-6 text-white/50 max-w-2xl mx-auto text-sm leading-relaxed">Berani bermimpi besar. Semua program didesain berdasarkan kurikulum standar akademi profesional, siap membawa performa pemain ke level elit.</p>
          </div>

          <div className="mb-16">
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <span className="w-2 h-8 bg-[var(--color-primary)] rounded-full"></span>
              Jalur Pembinaan Utama
            </h3>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="h-64 bg-white/5 rounded-3xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {activePrograms.filter((p: any) => p.type === 'main').map((program: any, idx: number) => (
                  <motion.div
                    key={program.id}
                    whileHover={{ y: -10 }}
                    className="bg-[#0c162d]/80 backdrop-blur-xl border border-white/5 group overflow-hidden rounded-3xl"
                  >
                  <div className="h-48 overflow-hidden relative">
                    <img src={program.image || null} alt={program.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c162d] via-black/20 to-transparent" />
                    <span className="absolute top-4 left-4 text-[10px] font-black bg-[var(--color-primary)] text-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                      {program.ageRange || program.agerange}
                    </span>
                  </div>
                  <div className="p-6 relative">
                    <h3 className="text-xl font-display font-bold mb-2 text-white group-hover:text-[var(--color-primary)] transition-colors">{program.title}</h3>
                    <p className="text-sm text-white/50 mb-6 leading-relaxed line-clamp-2">{program.description}</p>
                    <div className="flex items-center justify-between">
                      <button 
                        onClick={() => navigate(`/programs/${program.id}`)}
                        className="text-xs font-bold flex items-center gap-2 text-white/70 hover:text-[var(--color-primary)] transition-all group-hover:tracking-wider uppercase"
                      >
                        Pelajari Lebih Lanjut <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                      {user?.role === 'admin' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate('/programs/manage'); }}
                          className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 hover:bg-purple-500 hover:text-white transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            )}
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <span className="w-2 h-8 bg-purple-500 rounded-full"></span>
              Program Spesialis & Advanced
            </h3>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="h-64 bg-white/5 rounded-3xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {activePrograms.filter((p: any) => p.type === 'special').map((program: any, idx: number) => (
                  <motion.div
                    key={program.id}
                    whileHover={{ y: -10 }}
                    className="bg-[#0c162d]/80 backdrop-blur-xl border border-white/5 group overflow-hidden rounded-3xl"
                  >
                  <div className="h-40 overflow-hidden relative">
                    <img src={program.image || null} alt={program.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c162d] via-black/20 to-transparent" />
                    <span className="absolute top-4 left-4 text-[10px] font-black bg-purple-500 text-white px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                      Spesialis
                    </span>
                  </div>
                  <div className="p-6 relative">
                    <h3 className="text-lg font-display font-bold mb-2 text-white group-hover:text-purple-400 transition-colors">{program.title}</h3>
                    <p className="text-sm text-white/50 mb-6 leading-relaxed line-clamp-2">{program.description}</p>
                    <div className="flex items-center justify-between">
                      <button 
                        onClick={() => navigate(`/programs/${program.id}`)}
                        className="text-[10px] font-bold flex items-center gap-2 text-white/50 hover:text-purple-400 transition-all uppercase tracking-widest"
                      >
                        Detail Program <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </button>
                      {user?.role === 'admin' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate('/programs/manage'); }}
                          className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 hover:bg-purple-500 hover:text-white transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            )}
          </div>

        </div>
      </section>

      {/* Pelatih Section */}
      <section id="pelatih" className="py-32 px-6 bg-gradient-to-b from-transparent to-[#080d19]/50 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-bold mb-4" style={{ fontSize: 'clamp(40px, 6vw, 71px)' }}>STAFF PELATIH</h2>
            <div className="w-24 h-1 bg-[var(--color-primary)] mx-auto rounded-full shadow-[0_0_10px_var(--color-primary)]" />
            <p className="mt-6 text-white/50 max-w-2xl mx-auto text-sm leading-relaxed">Dilatih oleh para profesional dengan lisensi resmi dan pengalaman di tingkat elit, yang membimbing karir sepakbola muda ke arah yang tepat.</p>
          </div>

          {isLoadingCoaches ? (
            <div 
              className="flex overflow-x-auto snap-x snap-mandatory md:grid gap-6 md:gap-8 pb-8 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full"
              style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
            >
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="w-[85vw] md:w-auto shrink-0 snap-center h-[450px] bg-white/5 rounded-[2.5rem] animate-pulse" />
              ))}
            </div>
          ) : coaches && coaches.length > 0 ? (
            <div 
              className="flex overflow-x-auto snap-x snap-mandatory md:grid gap-6 md:gap-8 pb-8 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full"
              style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
            >
              {coaches.map((coach: any) => (
                <motion.div
                  key={coach.id}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="w-[85vw] md:w-auto shrink-0 snap-center bg-gradient-to-br from-[#0c162d]/90 to-[#0a0f1c]/95 backdrop-blur-xl border border-white/10 hover:border-cyan-500/30 group overflow-hidden rounded-[2.5rem] relative flex flex-col shadow-xl hover:shadow-[0_8px_30px_rgba(34,211,238,0.15)] transition-all duration-300"
                >
                  <div className="h-80 overflow-hidden relative bg-[#080d19]/80 flex items-center justify-center">
                    {coach.photo ? (
                       <img src={coach.photo} alt={coach.name} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 ease-out" />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center bg-[#080d19]">
                         <Users className="w-20 h-20 text-white/10" />
                       </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1c] via-[#0a0f1c]/10 to-transparent opacity-100" />
                  </div>
                  <div className="p-8 relative text-center flex-1 flex flex-col items-center justify-end -mt-8 z-10">
                    <h3 className="text-2xl font-display font-black text-white uppercase tracking-wider mb-1.5 drop-shadow-md">{coach.name}</h3>
                    <p className="text-sm font-black tracking-widest text-cyan-400 uppercase mb-4 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">{coach.specialty}</p>

                    <div className="flex items-center justify-center gap-2 mb-6">
                       <span className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-[10px] font-black text-blue-400 uppercase tracking-widest shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                         {coach.license || 'Lisensi'}
                       </span>
                    </div>

                    <div className="flex flex-wrap justify-center gap-2 mt-auto">
                      {((coach.activeTeams || coach.activeteams || []) as string[]).map((team: string, idx: number) => (
                        <span key={idx} className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-[9px] font-black text-white/50 uppercase tracking-widest hover:border-white/20 transition-colors">
                          {team}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
              <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/40">Data pelatih sedang diperbarui.</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <ShieldCheck className="text-blue-400" />
            </div>
            <h4 className="text-xl font-bold">Keamanan & Disiplin</h4>
            <p className="text-sm text-white/50">Prioritas kami adalah membentuk karakter pemain yang disiplin dan menjunjung sportivitas tinggi.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
              <Target className="text-green-400" />
            </div>
            <h4 className="text-xl font-bold">Latihan Terukur</h4>
            <p className="text-sm text-white/50">Setiap sesi latihan direkam dan dianalisis menggunakan data performa untuk progres yang nyata.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
              <Users className="text-purple-400" />
            </div>
            <h4 className="text-xl font-bold">Komunitas Juara</h4>
            <p className="text-sm text-white/50">Bergabunglah dengan jaringan bakat muda terbaik dan rasakan atmosfer kompetitif yang sehat.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-4 mb-6">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-14 h-14 object-contain drop-shadow-md" />
                ) : (
                  <Trophy className="text-[var(--color-primary)] w-12 h-12" />
                )}
                <span className="font-display font-bold text-2xl tracking-tighter truncate">{appName}</span>
              </div>
              <p className="text-sm text-white/40 max-w-sm mb-8 leading-relaxed">
                Menciptakan ekosistem sepak bola terbaik untuk melahirkan talenta kelas dunia dengan fasilitas modern dan metode terkini.
              </p>
              <div className="flex gap-4">
                {[Instagram, Facebook, Mail].map((Icon, i) => (
                  <button key={i} className="p-3 rounded-full border border-white/10 hover:bg-white/5 transition-all">
                    <Icon className="w-5 h-5 text-white/60" />
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h5 className="font-bold mb-6 text-sm text-[var(--color-primary)]">Quick Links</h5>
              <ul className="space-y-4 text-sm text-white/40">
                <li><a href="#" className="hover:text-white transition-colors">Tentang Kami</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Jadwal Trial</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Galeri Prestasi</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Kemitraan Klub</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold mb-6 text-sm text-[var(--color-primary)]">Contact Us</h5>
              <ul className="space-y-4 text-sm text-white/40">
                <li className="flex items-center gap-3"><MapPin className="w-4 h-4 text-[var(--color-primary)]" /> Jakarta Football Center, INA</li>
                <li className="flex items-center gap-3"><Phone className="w-4 h-4 text-[var(--color-primary)]" /> +62 21 555 1234</li>
                <li className="flex items-center gap-3"><Mail className="w-4 h-4 text-[var(--color-primary)]" /> info@elitessb.com</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:row items-center justify-between gap-4">
            <p className="text-[10px] text-white/20 uppercase tracking-widest">© 2026 {appName}. All Rights Reserved.</p>
            <div className="flex gap-8 text-[10px] text-white/20 uppercase tracking-widest">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
