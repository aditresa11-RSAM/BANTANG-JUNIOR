import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart3, Users, Calendar, Activity, CreditCard, UserSquare2, Trophy, Image as ImageIcon, LogOut, Bell, Search, Menu, X, Home, Settings, Goal, ScanSearch, Stethoscope, Users2, Megaphone, CheckSquare, BookOpen, UserPlus, FileText } from 'lucide-react';
import { useAuth, useSettings } from '../../App';
import { cn } from '../../lib/utils';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const { appName, logoUrl } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Program Unggulan', path: '/programs/manage', icon: FileText },
    { name: 'Pendaftaran Pemain', path: '/registrations', icon: UserPlus },
    { name: 'Pemain', path: '/players', icon: Users },
    { name: 'Pelatih', path: '/coaches', icon: UserSquare2 },
    { name: 'Jadwal', path: '/schedule', icon: Calendar },
    { name: 'Performance', path: '/performance', icon: Activity },
    { name: 'Taktik', path: '/tactics', icon: Goal },
    { name: 'Match Center', path: '/match-center', icon: Trophy },
    { name: 'Analisa Pertandingan', path: '/match-analysis', icon: BarChart3 },
    { name: 'Absensi Pemain', path: '/attendance', icon: CheckSquare },
    { name: 'Materi Latihan', path: '/materials', icon: BookOpen },
    { name: 'Pengumuman', path: '/announcements', icon: Megaphone },
    { name: 'Keuangan', path: '/financials', icon: CreditCard, adminOnly: true },
    { name: 'Galeri', path: '/gallery', icon: ImageIcon },
    { name: 'Pengaturan', path: '/settings', icon: Settings, adminOnly: true },
  ].filter(item => !(item.adminOnly && user?.role !== 'admin'));

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex text-white overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className={cn(
        "hidden lg:flex flex-col bg-[var(--color-navy-dark)] border-r border-white/5 h-screen sticky top-0 transition-[width,opacity,padding] duration-300 overflow-hidden",
        isDesktopSidebarOpen ? "w-72 opacity-100" : "w-0 opacity-0 border-r-0"
      )}>
        <div className="pt-10 pb-6 px-8 shrink-0 flex flex-col items-center">
          <Link 
            to="/dashboard"
            className="group/logo flex flex-col items-center gap-4 transition-transform hover:scale-105 duration-300"
          >
            <div className={cn(
              "w-20 h-20 shrink-0 flex items-center justify-center transition-all",
              !logoUrl ? "rounded-2xl bg-[var(--color-primary)] shadow-[0_0_20px_rgba(250,204,21,0.4)]" : "drop-shadow-[0_0_15px_rgba(255,200,0,0.3)]"
            )}>
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <Trophy className="text-black w-10 h-10" />
              )}
            </div>
            <div className="text-center">
              <h1 className="font-display font-black text-sm tracking-[0.15em] uppercase leading-tight drop-shadow-sm">
                <span className="text-white">SSB</span> <span className="text-[#fdc700]">BANTANG</span> <span className="text-blue-400">JUNIOR</span>
              </h1>
              <div className="h-px w-12 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent mx-auto mt-3 opacity-50" />
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2 py-4 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                  isActive 
                    ? "bg-[var(--color-primary)] text-black shadow-[0_0_20px_var(--color-primary-glow)]" 
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-black" : "group-hover:text-[var(--color-primary)]")} />
                <span className="font-medium text-sm">{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="ml-auto w-1.5 h-1.5 bg-black rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5 shrink-0">
          <div className="glass-card p-4 flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
              <span className="font-bold text-xs">{user?.name?.charAt(0)}</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-medium text-sm truncate">{user?.name}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">{user?.role}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Header Mobile / Search Bar */}
        <header className="px-6 lg:px-10 py-6 flex items-center justify-between sticky top-0 z-40 bg-[var(--color-navy-dark)]/80 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center lg:hidden gap-4 min-w-0">
            <button onClick={() => setIsSidebarOpen(true)} className="shrink-0 p-2 hover:bg-white/5 rounded-xl transition-colors">
              <Menu className="w-6 h-6 text-white/60" />
            </button>
            <Link to="/dashboard" className="flex items-center gap-2.5 min-w-0 p-1 group">
               {logoUrl ? (
                 <img src={logoUrl} className="w-10 h-10 object-contain shrink-0 drop-shadow-[0_0_10px_rgba(255,200,0,0.2)] group-hover:scale-110 transition-transform" />
               ) : (
                 <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                   <Trophy className="text-black w-6 h-6" />
                 </div>
               )}
               <div className="flex flex-col">
                 <span className="font-display font-black text-white text-xs tracking-widest leading-none">BANTANG</span>
                 <span className="font-display font-bold text-[var(--color-primary)] text-[10px] tracking-[0.2em] leading-tight">JUNIOR</span>
               </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={() => setIsDesktopSidebarOpen(prev => !prev)} 
              className="hidden lg:flex p-2 hover:bg-white/5 rounded-xl transition-colors"
              title="Toggle Sidebar"
            >
              <Menu className="w-6 h-6 text-white/60 hover:text-white" />
            </button>
            <div className="flex flex-col items-end justify-center bg-white/5 px-4 py-1.5 rounded-xl border border-white/10 w-fit">
              <span className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-widest leading-none mb-1">
                {new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
              </span>
              <RealTimeClock />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2.5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
              <Bell className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-[var(--color-navy-dark)] shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
            </button>
            <div className="lg:hidden w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
              <span className="font-bold text-xs">{user?.name?.charAt(0)}</span>
            </div>
          </div>
        </header>

        <section className="p-6 lg:p-10 pb-28 lg:pb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </section>

        {/* Bottom Nav Mobile */}
        <nav className="fixed bottom-0 left-0 right-0 lg:hidden glass-card !rounded-none !border-t border-white/10 p-2 flex items-center justify-around z-50">
          {menuItems.slice(0, 5).map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 transition-colors",
                  isActive ? "text-[var(--color-primary)]" : "text-white/40"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px]">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </main>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 w-72 h-[100dvh] bg-[var(--color-navy-dark)] z-[70] lg:hidden flex flex-col pt-0 shadow-2xl"
            >
              <div className="flex flex-col items-center p-8 shrink-0 border-b border-white/5 relative">
                <button onClick={() => setIsSidebarOpen(false)} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-6 h-6 text-white/40" />
                </button>
                
                <Link 
                  to="/dashboard"
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex flex-col items-center gap-3 mt-4"
                >
                  <div className={cn(
                    "w-16 h-16 shrink-0 flex items-center justify-center",
                    !logoUrl ? "rounded-xl bg-[var(--color-primary)]" : "drop-shadow-[0_0_10px_rgba(255,200,0,0.3)]"
                  )}>
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <Trophy className="text-black w-8 h-8" />
                    )}
                  </div>
                  <h1 className="font-display font-black text-xs tracking-[0.2em] text-white uppercase text-center">
                    SSB <span className="text-[var(--color-primary)]">BANTANG JUNIOR</span>
                  </h1>
                </Link>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl",
                        isActive ? "bg-[var(--color-primary)] text-black" : "text-white/60"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="p-6 shrink-0 border-t border-white/5">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-500 py-3 rounded-xl border border-red-500/20"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

const RealTimeClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}:${time.getSeconds().toString().padStart(2, '0')}`;

  return (
    <span className="text-xl font-display font-black text-white leading-none tracking-tight">{timeStr}</span>
  );
};
