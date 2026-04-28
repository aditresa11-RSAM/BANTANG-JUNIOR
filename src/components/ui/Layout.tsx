import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart3, Users, Calendar, Activity, CreditCard, UserSquare2, Trophy, ImageIcon, LogOut, Bell, Search, Menu, X, Home, Settings, Goal, ScanSearch, Stethoscope, Users2, Megaphone, Bot } from 'lucide-react';
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

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Pemain', path: '/players', icon: Users },
    { name: 'Pelatih', path: '/coaches', icon: UserSquare2 },
    { name: 'Jadwal', path: '/schedule', icon: Calendar },
    { name: 'Performance', path: '/performance', icon: Activity },
    { name: 'Taktik', path: '/tactics', icon: Goal },
    { name: 'Match Center', path: '/match-center', icon: Trophy },
    { name: 'Scouting', path: '/scouting', icon: ScanSearch },
    { name: 'Medical', path: '/medical', icon: Stethoscope },
    { name: 'Parent Portal', path: '/parent-portal', icon: Users2 },
    { name: 'Keuangan', path: '/financials', icon: CreditCard },
    { name: 'Galeri', path: '/gallery', icon: ImageIcon },
    { name: 'Pengumuman', path: '/announcements', icon: Megaphone },
    { name: 'Pengaturan', path: '/settings', icon: Settings },
    { name: 'AI Coach', path: '/ai-coach', icon: Bot },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex text-white overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-surface border-r border-white/5 h-screen sticky top-0">
        <div className="p-8 shrink-0 flex-none">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 shrink-0 flex items-center justify-center",
              !logoUrl && "rounded-xl bg-[var(--color-primary)] shadow-[0_0_15px_var(--color-primary-glow)]"
            )}>
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(250,204,21,0.2)]" />
              ) : (
                <Trophy className="text-black w-6 h-6" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-display font-bold text-base leading-tight text-[var(--color-primary)] truncate" title={appName}>{appName}</h1>
              <p className="text-[9px] text-white/50 uppercase tracking-[0.2em] truncate">FOOTBALL CLUB</p>
            </div>
          </div>
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
        <header className="px-6 lg:px-10 py-6 flex items-center justify-between sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center lg:hidden gap-4 min-w-0">
            <button onClick={() => setIsSidebarOpen(true)} className="shrink-0">
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2 min-w-0">
               {logoUrl && <img src={logoUrl} className="w-6 h-6 object-contain shrink-0 drop-shadow-[0_0_5px_rgba(250,204,21,0.2)]" />}
               <span className="font-display font-bold text-[var(--color-primary)] truncate text-lg pb-0.5">{appName}</span>
            </div>
          </div>

          <div className="hidden md:flex flex-col items-end justify-center bg-white/5 px-4 py-1.5 rounded-xl border border-white/10 w-fit">
            <span className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-widest leading-none mb-1">
              {new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
            </span>
            <RealTimeClock />
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-xl border border-white/10 hover:bg-white/5 transition-colors">
              <Bell className="w-5 h-5 text-white/60" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-surface" />
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
              className="fixed left-0 top-0 w-72 h-[100dvh] bg-surface-raised z-[70] lg:hidden flex flex-col pt-0"
            >
              <div className="flex items-center justify-between p-6 shrink-0 border-b border-white/5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    "w-8 h-8 shrink-0 flex items-center justify-center",
                    !logoUrl && "rounded-lg bg-[var(--color-primary)]"
                  )}>
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(250,204,21,0.2)]" />
                    ) : (
                      <Trophy className="text-black w-5 h-5" />
                    )}
                  </div>
                  <span className="font-display font-bold text-[var(--color-primary)] truncate text-base">{appName}</span>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="shrink-0 ml-2">
                  <X className="w-6 h-6" />
                </button>
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
