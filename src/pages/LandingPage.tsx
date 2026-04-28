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

export default function LandingPage() {
  const { appName, logoUrl, heroBgUrl } = useSettings();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="bg-[var(--color-surface)]">
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
              <span className="text-[10px] font-bold text-white/50 tracking-[0.2em] uppercase leading-tight">Football Club</span>
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
                Program pembinaan sepak bola modern berbasis data, disiplin, dan performa tingkat nasional. 
                <br className="hidden md:block" />
                Kami melatih teknik, fisik, dan mental calon atlet profesional.
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
                <p className="text-3xl font-display font-bold text-center text-[#facc15]">450+</p>
              </div>
              <div>
                <p className="text-sm text-white mb-1">Pelatih Pro</p>
                <p className="text-3xl font-display font-bold text-center text-[#facc15]">12</p>
              </div>
              <div>
                <p className="text-sm text-white mb-1">Turnamen</p>
                <p className="text-3xl font-display font-bold text-center text-[#facc15]">25</p>
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
            <h2 className="text-4xl md:text-5xl font-bold mb-4">PROGRAM UNGGULAN</h2>
            <div className="w-24 h-1 bg-[var(--color-primary)] mx-auto rounded-full shadow-[0_0_10px_var(--color-primary)]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { age: 'U8-U10', name: 'SSB BANTANG JUNIOR', description: 'Fokus pada kesenangan & teknik dasar bola.', img: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&q=80&w=1000' },
              { age: 'U12-U14', name: 'Bantang Development', description: 'Pemantapan visi bermain & taktik tim.', img: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&q=80&w=1000' },
              { age: 'U15-U17', name: 'Bantang Performance', description: 'Persiapan fisik & mental level kompetisi.', img: 'https://images.unsplash.com/photo-1517466787929-bc94061c5c50?auto=format&fit=crop&q=80&w=1000' },
              { age: 'Pro', name: 'Scouting Path', description: 'Jalur karir menuju klub profesional.', img: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1000' }
            ].map((program, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10 }}
                className="glass-card group overflow-hidden"
              >
                <div className="h-48 overflow-hidden relative">
                  <img src={program.img} alt={program.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface)] to-transparent" />
                  <span className="absolute bottom-4 left-4 text-[10px] font-bold bg-[var(--color-primary)] text-black px-2 py-1 rounded">
                    {program.age}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{program.name}</h3>
                  <p className="text-sm text-white/50 mb-6 leading-relaxed">{program.description || (program as any).desc}</p>
                  <button className="text-xs font-bold flex items-center gap-2 text-[var(--color-primary)] hover:gap-3 transition-all">
                    PELAJARI LEBIH LANJUT <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
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
