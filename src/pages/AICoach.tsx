import React, { useState, useEffect } from 'react';
import Layout from '../components/ui/Layout';
import { Bot, Sparkles, Zap, Shield, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function AICoach() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const simulateGeneration = () => {
    setIsGenerating(true);
    setResult(null);
    setTimeout(() => {
      setIsGenerating(false);
      setResult({
        tactic: '4-3-3 High Press',
        reason: 'Lawan SSB Garuda sering kesulitan dari sayap. Gunakan winger cepat.',
        players: ['Bima Sakti (Form +15%)', 'Arhan P. (Stamina Optimal)'],
        winProbability: '85%'
      });
    }, 2500);
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto animate-in fade-in duration-700 pb-12 font-sans">
        
        <div>
          <h1 className="text-3xl font-display font-black tracking-tight text-white uppercase flex items-center gap-3">
            AI Coach <span className="px-2 py-0.5 rounded text-xs bg-[var(--color-primary)] text-black ml-2 font-bold shadow-[0_0_10px_var(--color-primary-glow)] flex items-center gap-1"><Sparkles className="w-3 h-3" /> PRO</span>
          </h1>
          <p className="text-white/60 mt-2 font-medium">Asisten pelatih virtual untuk analisis performa dan taktik.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           
           {/* Prompt Area */}
           <div className="bg-[#111827] border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
              
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center mb-6 border border-[var(--color-primary)]/20 shadow-[0_0_30px_rgba(250,204,21,0.1)]">
                <Bot className="w-8 h-8" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">Simulasi Match Berikutnya</h3>
              <p className="text-sm text-white/50 mb-6 leading-relaxed">
                Dapatkan rekomendasi formasi, starting XI, dan stategi secara otomatis dari AI berdasarkan kondisi fisik dan performa pemain minggu ini.
              </p>
              
              <button 
                onClick={simulateGeneration}
                disabled={isGenerating}
                className="w-full py-3 rounded-xl bg-[var(--color-primary)] hover:bg-yellow-500 text-black font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_var(--color-primary-glow)]"
              >
                {isGenerating ? (
                  <>Menganalisis Data... <Sparkles className="w-4 h-4 animate-spin" /></>
                ) : (
                  <>Generate Prediksi <Zap className="w-4 h-4" /></>
                )}
              </button>
           </div>

           {/* Result Area */}
           <div className="bg-[#111827] border border-white/10 rounded-3xl p-6 md:p-8 relative min-h-[300px]">
              {!result && !isGenerating && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30">
                   <Shield className="w-16 h-16 text-white mb-4" />
                   <p className="text-sm font-bold uppercase tracking-widest text-white">Menunggu Request</p>
                 </div>
              )}

              {isGenerating && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="flex gap-2 mb-4">
                     <span className="w-3 h-3 rounded-full bg-[var(--color-primary)] animate-bounce" style={{ animationDelay: '0ms' }} />
                     <span className="w-3 h-3 rounded-full bg-[var(--color-primary)] animate-bounce" style={{ animationDelay: '150ms' }} />
                     <span className="w-3 h-3 rounded-full bg-[var(--color-primary)] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-primary)] animate-pulse">Running Simulation Model G-3...</p>
                </div>
              )}

              {result && !isGenerating && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full flex flex-col">
                   <h3 className="text-sm font-bold text-[var(--color-primary)] uppercase tracking-wider mb-6 flex items-center gap-2">
                     <CheckCircleIcon /> Insight Ditemukan
                   </h3>
                   
                   <div className="space-y-4 flex-1">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-1">Rekomendasi Taktik</span>
                        <p className="text-lg font-black text-white">{result.tactic}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-1">Alasan Utama</span>
                        <p className="text-sm text-emerald-400 font-medium">{result.reason}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-1">Key Players</span>
                        <ul className="text-sm text-white font-medium list-disc list-inside">
                          {result.players.map((p: string, i: number) => <li key={i}>{p}</li>)}
                        </ul>
                      </div>
                   </div>

                   <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-1">Win Probability</span>
                        <span className="flex items-center gap-2 text-2xl font-black text-emerald-400">
                          {result.winProbability} <TrendingUp className="w-5 h-5" />
                        </span>
                      </div>
                   </div>
                </motion.div>
              )}
           </div>

        </div>
      </div>
    </Layout>
  );
}

function CheckCircleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}
