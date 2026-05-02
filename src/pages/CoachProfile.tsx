import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowLeft, Award, Shield, Calendar, Trophy, Users, CheckCircle2, ChevronRight
} from 'lucide-react';
import Layout from '../components/ui/Layout';
import { useCMSData } from '../lib/store';

// We fetch coaches just to find the current one, standard store method.
export default function CoachProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  // using an empty array for initial data since they should exist by now or we just gracefully handle it
  const { data: coaches } = useCMSData('coaches', []);
  const coach = coaches.find((c: any) => c.id === id);

  if (!coach) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <p className="text-white/50 text-xl font-display font-bold">Coach not found.</p>
          <button onClick={() => navigate('/coaches')} className="text-blue-400 hover:text-white transition-colors uppercase tracking-widest text-xs font-bold border-b border-blue-400/50 hover:border-white">Back to Coaches</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto pb-20 animate-in fade-in duration-500">
        <Link to="/coaches" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8 text-[10px] font-black tracking-widest uppercase">
          <ArrowLeft className="w-4 h-4" /> BACK TO STAFF PANEL
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Big Photo card */}
          <div className="lg:col-span-4">
            <div className="rounded-3xl overflow-hidden relative shadow-2xl border border-white/5 bg-gradient-to-br from-[#081225] to-[#0a0f1c]">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.1),transparent_70%)] pointer-events-none" />
              {/* Image full width container */}
              <div className="relative h-[600px] w-full flex items-center justify-center bg-[#081225] overflow-hidden">
                 <img src={coach.photo} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50 blur-3xl scale-125" />
                 <img src={coach.photo} alt={coach.name} className="relative z-10 max-w-full max-h-full object-contain drop-shadow-[0_20px_60px_rgba(0,0,0,0.95)]" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1c] via-[#0a0f1c]/10 to-transparent pointer-events-none" />
              
              <div className="absolute bottom-6 left-6 right-6 z-10">
                 <h1 className="text-3xl font-display font-black text-white uppercase tracking-tighter mb-1 drop-shadow-md">{coach.name}</h1>
                 <p className="text-sm font-bold text-yellow-500/90 uppercase tracking-widest flex items-center gap-2 mb-1">
                    <Shield className="w-4 h-4" /> {coach.specialty}
                 </p>
                 <p className="text-xs font-black text-blue-400/80 uppercase tracking-[0.2em]">
                    {coach.license}
                 </p>
              </div>
            </div>
            
            {/* Quick Actions / Notes */}
            <div className="mt-8 bg-gradient-to-br from-[#0c162d] to-[#0a0f1c] border border-blue-500/10 rounded-3xl p-6 relative overflow-hidden group">
               <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500/20 rounded-3xl transition-colors duration-500 pointer-events-none" />
               <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4 flex items-center gap-2">
                 Admin Notes
               </h3>
               <textarea 
                  className="w-full bg-[#050a14] border border-white/5 rounded-xl p-4 text-sm text-white/80 focus:outline-none focus:border-blue-500/50 min-h-[120px] resize-none transition-colors"
                  placeholder="Insert confidential notes about this coach performance or contract..."
                  defaultValue="Coach shows outstanding performance in tactical development for the U15 squad. Contract due for renewal in 6 months."
               />
               <button className="w-full mt-4 py-3 bg-blue-600/10 hover:bg-blue-600 border border-blue-500/20 text-blue-400 hover:text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all">
                  Save Note
               </button>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Top Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
               <div className="bg-gradient-to-br from-[#0c162d] to-[#0a0f1c] border border-white/5 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center shadow-lg group hover:border-blue-500/30 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex flex-col items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                    <Award className="w-6 h-6 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                  </div>
                  <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold mb-2">License</span>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">{coach.license}</span>
               </div>
               <div className="bg-gradient-to-br from-[#0c162d] to-[#0a0f1c] border border-white/5 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center shadow-lg group hover:border-blue-500/30 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex flex-col items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                    <Calendar className="w-6 h-6 text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]" />
                  </div>
                  <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold mb-2">Experience</span>
                  <span className="text-xl font-bold text-white uppercase tracking-wider">{coach.experience} <span className="text-xs text-white/50">YRS</span></span>
               </div>
               <div className="bg-gradient-to-br from-[#0c162d] to-[#0a0f1c] border border-white/5 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center shadow-lg group hover:border-blue-500/30 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex flex-col items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6 text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
                  </div>
                  <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold mb-2">Squads</span>
                  <span className="text-xl font-bold text-white uppercase tracking-wider">{coach.activeTeams?.length || 0}</span>
               </div>
               <div className="bg-gradient-to-br from-[#0c162d] to-[#0a0f1c] border border-white/5 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center shadow-lg group hover:border-blue-500/30 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex flex-col items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                     <Trophy className="w-6 h-6 text-purple-400 drop-shadow-[0_0_10px_rgba(192,132,252,0.5)]" />
                  </div>
                  <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold mb-2">Trophies</span>
                  <span className="text-xl font-bold text-white uppercase tracking-wider">4</span>
               </div>
            </div>

            {/* Career & Certification */}
            <div className="bg-gradient-to-br from-[#0c162d] to-[#0a0f1c] border border-title rounded-3xl p-8 shadow-xl border-white/5 hover:border-blue-500/20 transition-all duration-500">
              <h2 className="text-sm font-black uppercase tracking-widest text-white mb-6 flex items-center gap-3 border-b border-white/5 pb-4">
                 <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex flex-col items-center justify-center border border-blue-500/20">
                   <Award className="w-4 h-4 text-blue-400" /> 
                 </div>
                 Professional Certification
              </h2>
              <div className="space-y-4">
                 {[
                   { t: 'UEFA Pro License / AFC Pro Level equivalent', y: '2022' },
                   { t: 'National Team U16 Assistant Coach', y: '2019 - 2021' },
                   { t: 'Elite Youth Tactics Workshop Certified', y: '2018' },
                 ].map((cert, i) => (
                   <div key={i} className="flex items-center justify-between p-5 bg-[#0a0f1c] rounded-2xl border border-white/5">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-blue-500/5 flex items-center justify-center text-blue-400 border border-blue-500/10 shadow-[0_0_10px_rgba(37,99,235,0.1)]">
                            <CheckCircle2 className="w-5 h-5" />
                         </div>
                         <span className="text-sm font-bold text-white/90">{cert.t}</span>
                      </div>
                      <span className="text-[10px] font-black text-white/40 tracking-widest bg-white/5 px-3 py-1.5 rounded-lg">{cert.y}</span>
                   </div>
                 ))}
              </div>
            </div>

            {/* Team Stats */}
            <div className="bg-gradient-to-br from-[#0c162d] to-[#0a0f1c] rounded-3xl p-8 shadow-xl border border-white/5 hover:border-blue-500/20 transition-all duration-500">
              <h2 className="text-sm font-black uppercase tracking-widest text-white mb-6 flex items-center gap-3 border-b border-white/5 pb-4">
                 <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex flex-col items-center justify-center border border-yellow-500/20">
                   <Trophy className="w-4 h-4 text-yellow-500" />
                 </div>
                 Team Performance Indicator
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {(coach.activeTeams || ['U15-Pro']).map((team: string) => (
                   <div key={team} className="p-6 bg-[#0a0f1c] rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                      <div className="flex flex-col gap-1 mb-6 border-b border-white/5 pb-4">
                         <span className="text-[10px] font-black text-white/30 tracking-widest uppercase">Squad Performance</span>
                         <h4 className="text-xl font-display font-black text-white uppercase tracking-wider">{team}</h4>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center group">
                           <span className="text-[10px] text-white/50 uppercase font-black tracking-widest group-hover:text-blue-400 transition-colors">Win Rate</span>
                           <div className="flex items-center gap-3">
                              <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                 <div className="h-full bg-green-500 w-[78%] shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                              </div>
                              <span className="text-sm text-white font-bold w-10 text-right">78%</span>
                           </div>
                        </div>
                        <div className="flex justify-between items-center group">
                           <span className="text-[10px] text-white/50 uppercase font-black tracking-widest group-hover:text-blue-400 transition-colors">Goals/Match</span>
                           <div className="flex items-center gap-3">
                              <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                 <div className="h-full bg-blue-500 w-[60%] shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                              </div>
                              <span className="text-sm text-white font-bold w-10 text-right">2.4</span>
                           </div>
                        </div>
                        <div className="flex justify-between items-center group">
                           <span className="text-[10px] text-white/50 uppercase font-black tracking-widest group-hover:text-blue-400 transition-colors">Clean Sheets</span>
                           <div className="flex items-center gap-3">
                              <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                 <div className="h-full bg-purple-500 w-[45%] shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                              </div>
                              <span className="text-sm text-white font-bold w-10 text-right">12</span>
                           </div>
                        </div>
                      </div>
                   </div>
                 ))}
              </div>
            </div>

            {/* Upcoming Training Schedules */}
            <div className="bg-gradient-to-br from-[#0c162d] to-[#0a0f1c] rounded-3xl p-8 shadow-xl border border-white/5 hover:border-blue-500/20 transition-all duration-500">
              <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                <h2 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-green-500/10 flex flex-col items-center justify-center border border-green-500/20">
                     <Calendar className="w-4 h-4 text-green-400" />
                   </div>
                   Upcoming Sessions
                </h2>
                <Link to="/training" className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] text-white/70 uppercase tracking-widest font-bold transition-all border border-white/10">
                  Global Schedule 
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {[1,2,3].map((_, i) => (
                   <div key={i} className="flex flex-col p-5 bg-[#0a0f1c] rounded-2xl border border-white/5 hover:border-blue-500/30 hover:-translate-y-1 transition-all cursor-pointer group shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                         <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex flex-col items-center justify-center text-blue-400 border border-blue-500/20 shadow-[0_0_10px_rgba(37,99,235,0.1)]">
                            <span className="text-[8px] font-black uppercase">MAY</span>
                            <span className="text-sm font-bold leading-none">{10 + i}</span>
                         </div>
                         <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                            <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                         </div>
                      </div>
                      <div>
                         <span className="text-[9px] text-white/40 uppercase font-black tracking-widest mb-1 block">15:30 - 17:30</span>
                         <h4 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">Tactical Drills & Shape</h4>
                         <p className="text-[10px] text-blue-400 font-bold mt-2 bg-blue-500/10 px-2 py-1 rounded inline-block">{coach.activeTeams?.[0] || 'Academy'}</p>
                      </div>
                   </div>
                 ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}
