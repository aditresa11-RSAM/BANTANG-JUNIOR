import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { Trophy, User, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth, useSettings } from '../App';
import { supabase } from '../lib/supabase';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { appName, logoUrl } = useSettings();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Password tidak cocok');
      return;
    }
    setError('');
    setIsLoading(true);

    // Append fake domain for Supabase Auth consistency
    const fakeEmail = `${username.toLowerCase().trim()}@ssb.internal`;

    const { error: signUpError } = await supabase.auth.signUp({
      email: fakeEmail,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
    } else {
      setError('Pendaftaran berhasil! Silakan masuk dengan akun Anda.');
      setTimeout(() => navigate('/login'), 2000);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--color-navy-dark)]">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[var(--color-primary)]/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-10 text-white">
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className={`inline-flex w-32 h-32 rounded-3xl items-center justify-center mb-6 overflow-hidden ${logoUrl ? '' : 'bg-[var(--color-primary)] shadow-[0_0_40px_var(--color-primary-glow)]'}`}
          >
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-contain drop-shadow-2xl" />
            ) : (
              <Trophy className="text-black w-14 h-14" />
            )}
          </motion.div>
          <h1 className="text-3xl font-display font-bold tracking-tighter text-[var(--color-primary)] truncate max-w-[300px] mx-auto">{appName}</h1>
        </div>

        <div className="glass-card p-8 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-white/20 group-focus-within:text-[var(--color-primary)] transition-colors" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-[var(--color-primary)]/50 focus:bg-white/10 transition-all placeholder:text-white/10"
                  placeholder="Username"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Password</label>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-sm focus:outline-none focus:border-[var(--color-primary)]/50 focus:bg-white/10 transition-all placeholder:text-white/10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Ulangi Password</label>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-sm focus:outline-none focus:border-[var(--color-primary)]/50 focus:bg-white/10 transition-all placeholder:text-white/10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-xs text-center font-medium"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="glow-button w-full py-4 flex items-center justify-center gap-3 group disabled:opacity-50"
            >
              {isLoading ? 'MENDAFTAR...' : 'DAFTAR AKUN'}
              <motion.div>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.div>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-white/40 text-xs">
              Sudah punya akun? <Link to="/login" className="text-[var(--color-primary)] font-bold hover:underline">Masuk</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
