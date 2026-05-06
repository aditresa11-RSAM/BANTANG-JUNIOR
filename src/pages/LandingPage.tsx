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
  Trophy
} from 'lucide-react';

import { useAuth, useSettings } from '../App';
import { useEffect } from 'react';
import { academyPrograms } from '../data/programs';
import { useCMSData } from '../lib/store';
import { Edit2 } from 'lucide-react';

export default function LandingPage() {
  const { appName, logoUrl, heroBgUrl } = useSettings();
  const { user } = useAuth();
  const { data: programs, isLoading } = useCMSData('programs', academyPrograms);
  const navigate = useNavigate();

  // Fallback to initial data if empty
  const activePrograms = (programs && programs.length > 0) ? programs : academyPrograms;

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
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/20 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-12 h-12 object-contain drop-shadow-md" />
            ) : (
              <Trophy className="text-[var(--color-primary)] w-10 h-10" />
            )}
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg tracking-tighter text-[var(--color-primary)] truncate leading-tight">{appName}</span>
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
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Animated Background Assets */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBgUrl || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=2693"} 
            alt="Football Stadium" 
            className="w-full h-full object-cover opacity-100 object-top transition-opacity duration-700"
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-6xl md:text-[5.5rem] font-display font-bold leading-[0.9] mb-8 tracking-tighter">
                BANGUN BINTANG <br /> 
                <span className="text-[var(--color-primary)] text-glow">MASA DEPAN</span>
              </h1>
              <p className="text-sm text-white mb-10 leading-relaxed font-light max-w-2xl">
                Program pembinaan sepak bola modern berbasis data, disiplin, dan performa tingkat nasional 
                <br className="hidden md:block" />
                Kami melatih teknik, fisik, dan mental calon atlet profesional
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button 
                  onClick={() => navigate('/login')}
                  className="glow-button w-full sm:w-[260px] flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 active:scale-95 py-4 text-base"
                >
                  Masuk
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </button>
                <button 
                  onClick={() => navigate('/register-player')}
                  className="w-full sm:w-[260px] bg-[#0c162d]/50 backdrop-blur-md border border-white/10 hover:bg-white/10 text-white font-bold tracking-widest uppercase transition-all duration-300 hover:scale-105 active:scale-95 py-4 text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:border-white/20"
                >
                  Daftar Siswa Baru
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Floating Stats */}
        <div className="absolute bottom-10 right-10 hidden lg:block">
          <div className="glass-card p-6 border-l-4 border-l-[var(--color-primary)]">
            <div className="flex gap-10">
              <div>
                <p className="text-sm text-white mb-1">Pemain Aktif</p>
                <p className="text-3xl font-display font-bold text-center text-[#facc15]">20+</p>
              </div>
              <div>
                <p className="text-sm text-white mb-1">Pelatih Pro</p>
                <p className="text-3xl font-display font-bold text-center text-[#facc15]">3</p>
              </div>
              <div>
                <p className="text-sm text-white mb-1">Turnamen</p>
                <p className="text-3xl font-display font-bold text-center text-[#facc15]">15</p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 right-10 z-20">
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
