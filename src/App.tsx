/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, createContext, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// Pages - I will create these shortly
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Players from './pages/Players';
import PlayerProfile from './pages/PlayerProfile';
import TrainingSchedule from './pages/TrainingSchedule';
import PerformanceCenter from './pages/PerformanceCenter';
import Financials from './pages/Financials';
import Coaches from './pages/Coaches';
import CoachProfile from './pages/CoachProfile';
import MatchCenter from './pages/MatchCenter';
import Gallery from './pages/Gallery';
import Settings from './pages/Settings';
import Tactics from './pages/Tactics';
import Scouting from './pages/Scouting';
import Medical from './pages/Medical';
import ParentPortal from './pages/ParentPortal';
import Announcements from './pages/Announcements';
import AICoach from './pages/AICoach';

// Auth context
interface AuthContextType {
  user: any;
  login: (credentials: any) => Promise<boolean>;
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
    // Check for "remembered" session
    const savedUser = localStorage.getItem('ssb_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: any) => {
    // Mock authentication logic as requested
    // Admin Default: IMR2026 / 123456
    if (credentials.username === 'IMR2026' && credentials.password === '123456') {
      const adminUser = { id: 'admin-1', username: 'IMR2026', name: 'IMR Admin', role: 'admin' };
      setUser(adminUser);
      localStorage.setItem('ssb_user', JSON.stringify(adminUser));
      return true;
    }
    // Handle other roles or supabase real auth here if keys are set
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ssb_user');
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0a0a0c]">
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
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
              <Route path="/players" element={user ? <Players /> : <Navigate to="/login" />} />
              <Route path="/players/:id" element={user ? <PlayerProfile /> : <Navigate to="/login" />} />
              <Route path="/schedule" element={user ? <TrainingSchedule /> : <Navigate to="/login" />} />
              <Route path="/performance" element={user ? <PerformanceCenter /> : <Navigate to="/login" />} />
              <Route path="/tactics" element={user ? <Tactics /> : <Navigate to="/login" />} />
              <Route path="/match-center" element={user ? <MatchCenter /> : <Navigate to="/login" />} />
              <Route path="/scouting" element={user ? <Scouting /> : <Navigate to="/login" />} />
              <Route path="/medical" element={user ? <Medical /> : <Navigate to="/login" />} />
              <Route path="/parent-portal" element={user ? <ParentPortal /> : <Navigate to="/login" />} />
              <Route path="/financials" element={user ? <Financials /> : <Navigate to="/login" />} />
              <Route path="/coaches" element={user ? <Coaches /> : <Navigate to="/login" />} />
              <Route path="/coaches/:id" element={user ? <CoachProfile /> : <Navigate to="/login" />} />
              <Route path="/gallery" element={user ? <Gallery /> : <Navigate to="/login" />} />
              <Route path="/announcements" element={user ? <Announcements /> : <Navigate to="/login" />} />
              <Route path="/settings" element={user ? <Settings /> : <Navigate to="/login" />} />
              <Route path="/ai-coach" element={user ? <AICoach /> : <Navigate to="/login" />} />
            </Routes>
          </AnimatePresence>
        </Router>
      </AuthContext.Provider>
    </SettingsContext.Provider>
  );
}
