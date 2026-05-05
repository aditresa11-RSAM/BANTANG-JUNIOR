/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, createContext, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from './lib/supabase';

// Pages - I will create these shortly
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Players from './pages/Players';
import PlayerProfile from './pages/PlayerProfile';
import TrainingSchedule from './pages/TrainingSchedule';
import PerformanceCenter from './pages/PerformanceCenter';
import MatchAnalysis from './pages/MatchAnalysis';
import Financials from './pages/Financials';
import Coaches from './pages/Coaches';
import CoachProfile from './pages/CoachProfile';
import MatchCenter from './pages/MatchCenter';
import Gallery from './pages/Gallery';
import Settings from './pages/Settings';
import Tactics from './pages/Tactics';
import Attendance from './pages/Attendance';
import Materials from './pages/Materials';
import Scouting from './pages/Scouting';
import Medical from './pages/Medical';
import ParentPortal from './pages/ParentPortal';
import Announcements from './pages/Announcements';
import AICoach from './pages/AICoach';
import GKCompare from './pages/GKCompare';
import RegistrationPublic from './pages/RegistrationPublic';
import Register from './pages/Register';
import RegistrationAdmin from './pages/RegistrationAdmin';
import ProgramDetail from './pages/ProgramDetail';
import ManagePrograms from './pages/ManagePrograms';

// Auth context
interface AuthContextType {
  user: any;
  login: (credentials: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// Settings context
interface SettingsContextType {
  appName: string;
  setAppName: (name: string) => void;
  logoUrl: string | null;
  setLogoUrl: (url: string | null) => void;
  heroBgUrl: string | null;
  setHeroBgUrl: (url: string | null) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Settings state
  const [appName, setAppName] = useState(() => {
    const saved = localStorage.getItem('ssb_app_name');
    if (saved === 'BANTANG JUNIOR') return 'SSB BANTANG JUNIOR'; // Migration
    return saved || 'SSB BANTANG JUNIOR';
  });
  const [logoUrl, setLogoUrl] = useState<string | null>(() => localStorage.getItem('ssb_logo_url') || 'https://storage.googleapis.com/aistudio-yeti-pre-prod-user-assets/q2q3jltn5bcm-IMG_20250218_065922.png');
  const [heroBgUrl, setHeroBgUrl] = useState<string | null>(() => localStorage.getItem('ssb_hero_bg_url') || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=2693');

  useEffect(() => {
      // Try to load global settings from Supabase if we don't have it or we just started up
      const fetchGlobalSettings = async () => {
         try {
            const { isSupabaseConfigured, supabase } = await import('./lib/supabase');
            if (isSupabaseConfigured()) {
                // Try fetching from table first (more reliable/latest)
                const { data: dbData, error: dbError } = await supabase.from('settings').select('*').eq('id', 'main').single();
                
                if (!dbError && dbData) {
                    if (dbData.app_name) setAppName(dbData.app_name);
                    if (dbData.logo_url !== undefined) setLogoUrl(dbData.logo_url);
                    if (dbData.hero_bg_url !== undefined) setHeroBgUrl(dbData.hero_bg_url);
                    return; // Successfully loaded from DB
                }

                // Fallback to JSON file in storage
                const { data } = supabase.storage.from('settings').getPublicUrl('global_settings.json');
                if (data.publicUrl) {
                    // Try fetch the JSON file to bypass caching issue, add timestamp
                    const response = await fetch(`${data.publicUrl}?t=${new Date().getTime()}`);
                    if (response.ok) {
                        const json = await response.json();
                        if (json.appName) setAppName(json.appName);
                        if (json.logoUrl !== undefined) setLogoUrl(json.logoUrl);
                        if (json.heroBgUrl !== undefined) setHeroBgUrl(json.heroBgUrl);
                    }
                }
            }
         } catch(e) {
            console.log('No global settings found in Supabase or fetch error');
         }
      };
      fetchGlobalSettings();
  }, []);

  useEffect(() => {
    localStorage.setItem('ssb_app_name', appName);
  }, [appName]);

  useEffect(() => {
    if (logoUrl) {
      localStorage.setItem('ssb_logo_url', logoUrl);
    } else {
      localStorage.removeItem('ssb_logo_url');
    }
  }, [logoUrl]);

  useEffect(() => {
    if (heroBgUrl) {
      localStorage.setItem('ssb_hero_bg_url', heroBgUrl);
    } else {
      localStorage.removeItem('ssb_hero_bg_url');
    }
  }, [heroBgUrl]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          // If error or no session, clear everything, unless we have a local admin
          const savedUser = localStorage.getItem('ssb_user');
          if (!savedUser || JSON.parse(savedUser).role !== 'admin') {
            await supabase.auth.signOut();
            setUser(null);
            localStorage.removeItem('ssb_user');
          } else {
            setUser(JSON.parse(savedUser));
          }
        } else {
            // Ensure ssb_user matches session unless we have a local admin
            const savedUser = localStorage.getItem('ssb_user');
            if (!savedUser || JSON.parse(savedUser).role !== 'admin') {
              const userProfile = { id: session.user.id, username: session.user.email, role: 'player' };
              setUser(userProfile);
              localStorage.setItem('ssb_user', JSON.stringify(userProfile));
            }
        }
      } catch (e) {
        console.error('Auth initialization error', e);
        await supabase.auth.signOut();
        setUser(null);
        localStorage.removeItem('ssb_user');
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        // If we already have an admin user, don't overwrite it with a player session
        const currentUser = JSON.parse(localStorage.getItem('ssb_user') || 'null');
        if (currentUser && currentUser.role === 'admin') {
          return;
        }

        const userProfile = { id: session.user.id, username: session.user.email, role: 'player' };
        setUser(userProfile);
        localStorage.setItem('ssb_user', JSON.stringify(userProfile));
      } else {
        // If we log out, remove the user
        const currentUser = JSON.parse(localStorage.getItem('ssb_user') || 'null');
        if (currentUser && currentUser.role !== 'admin') {
          setUser(null);
          localStorage.removeItem('ssb_user');
        }
      }
    });

    return () => {
        subscription.unsubscribe();
    };
  }, []);

  const login = async (credentials: any) => {
    // Admin Default: IMR2026 / 123456
    if (credentials.username === 'IMR2026' && credentials.password === '123456') {
      const adminUser = { id: 'admin-1', username: 'IMR2026', name: 'IMR Admin', role: 'admin' };
      setUser(adminUser);
      localStorage.setItem('ssb_user', JSON.stringify(adminUser));
      return { success: true };
    }
    
    // Real Supabase auth
    try {
        let identifier = credentials.username || '';
        // If it's a simple username (no @), append our internal domain
        if (identifier && !identifier.includes('@')) {
            identifier = `${identifier.toLowerCase().trim()}@ssb.internal`;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email: identifier,
            password: credentials.password,
        });
        
        if (error) throw error;
        
        if (data.user) {
            // Clean up the username for display (remove internal suffix if it exists)
            const cleanUsername = data.user.email?.split('@')[0] || data.user.email;
            const userProfile = { id: data.user.id, username: cleanUsername, role: 'player' };
            setUser(userProfile);
            localStorage.setItem('ssb_user', JSON.stringify(userProfile));
            return { success: true };
        }
        return { success: false, error: 'Login gagal' };
    } catch(e: any) {
        console.error('Login error', e);
        return { success: false, error: e.message || 'Login gagal' };
    }
  };


  const logout = () => {
    setUser(null);
    localStorage.removeItem('ssb_user');
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[var(--color-navy-dark)]">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full shadow-[0_0_15px_var(--color-primary-glow)]"
        />
      </div>
    );
  }

  return (
    <SettingsContext.Provider value={{ appName, setAppName, logoUrl, setLogoUrl, heroBgUrl, setHeroBgUrl }}>
      <AuthContext.Provider value={{ user, login, logout, isLoading }}>
        <Router>
          <div className="stadium-bg" />
          <div className="football-mesh" />
          
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
              <Route path="/register" element={<Register />} />
              <Route path="/register-player" element={<RegistrationPublic />} />
              <Route path="/programs/:id" element={<ProgramDetail />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
              <Route path="/registrations" element={user ? <RegistrationAdmin /> : <Navigate to="/" />} />
              <Route path="/players" element={user ? <Players /> : <Navigate to="/" />} />
              <Route path="/players/:id" element={user ? <PlayerProfile /> : <Navigate to="/" />} />
              <Route path="/schedule" element={user ? <TrainingSchedule /> : <Navigate to="/" />} />
              <Route path="/performance" element={user ? <PerformanceCenter /> : <Navigate to="/" />} />
              <Route path="/tactics" element={user ? <Tactics /> : <Navigate to="/" />} />
              <Route path="/compare-gk" element={user ? <GKCompare /> : <Navigate to="/" />} />
              <Route path="/match-analysis" element={user ? <MatchAnalysis /> : <Navigate to="/" />} />
              <Route path="/attendance" element={user ? <Attendance /> : <Navigate to="/" />} />
              <Route path="/materials" element={user ? <Materials /> : <Navigate to="/" />} />
              <Route path="/match-center" element={user ? <MatchCenter /> : <Navigate to="/" />} />
              <Route path="/scouting" element={user ? <Scouting /> : <Navigate to="/" />} />
              <Route path="/medical" element={user ? <Medical /> : <Navigate to="/" />} />
              <Route path="/parent-portal" element={user ? <ParentPortal /> : <Navigate to="/" />} />
              <Route path="/financials" element={user ? <Financials /> : <Navigate to="/" />} />
              <Route path="/coaches" element={user ? <Coaches /> : <Navigate to="/" />} />
              <Route path="/coaches/:id" element={user ? <CoachProfile /> : <Navigate to="/" />} />
              <Route path="/gallery" element={user ? <Gallery /> : <Navigate to="/" />} />
              <Route path="/announcements" element={user ? <Announcements /> : <Navigate to="/" />} />
              <Route path="/programs/manage" element={user ? <ManagePrograms /> : <Navigate to="/" />} />
              <Route path="/settings" element={user ? <Settings /> : <Navigate to="/" />} />
              <Route path="/ai-coach" element={user ? <AICoach /> : <Navigate to="/" />} />
            </Routes>
          </AnimatePresence>
        </Router>
      </AuthContext.Provider>
    </SettingsContext.Provider>
  );
}
