import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, Edit2, CheckCircle2, TrendingUp, Activity, Upload, Trash2, Loader2 } from 'lucide-react';
import Layout from '../components/ui/Layout';
import { useCMSData } from '../lib/store';
import { cn } from '../lib/utils';
import { uploadFile } from '../lib/supabase';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer 
} from 'recharts';

export default function PlayerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  // using any player list to find, in real app would get single item
  const { data: players, updateItem, deleteItem, isLoading } = useCMSData('players', []);
  
  const player = players.find((p: any) => p.id === id) || {
    id: id || 'placeholder',
    name: 'Unknown Player',
    overall: 85,
    category: 'U15',
    position: 'Striker',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600',
    dribbling: 85,
    passing: 80,
    shooting: 88,
    pace: 90,
    strength: 75,
    tactical: 80,
    vision: 78,
    teamwork: 82,
    goals: 14,
    assists: 5,
    attendance: 95,
    age: 16,
    height: 178,
    weight: 68,
    dominantFoot: 'Right',
    status: 'Active'
  };

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(player);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const found = players.find((p: any) => p.id === id);
    if (found && !isEditing) {
      setFormData(found);
    }
  }, [players, id, isEditing]);

  // Auto-calculate overall rating when skills change
  useEffect(() => {
    if (isEditing) {
      const skills = [
        formData.dribbling || 0,
        formData.passing || 0,
        formData.shooting || 0,
        formData.pace || 0,
        formData.strength || 0,
        formData.tactical || 0,
        formData.vision || 0,
        formData.teamwork || 0,
      ];
      const sum = skills.reduce((a, b) => Number(a) + Number(b), 0);
      const avg = Math.round(sum / 8);
      if (formData.overall !== avg) {
        setFormData(prev => ({ ...prev, overall: avg }));
      }
    }
  }, [formData.dribbling, formData.passing, formData.shooting, formData.pace, formData.strength, formData.tactical, formData.vision, formData.teamwork, isEditing]);

  const radarData = [
    { subject: 'Dribbling', A: formData.dribbling || 70, fullMark: 100 },
    { subject: 'Passing', A: formData.passing || 70, fullMark: 100 },
    { subject: 'Shooting', A: formData.shooting || 70, fullMark: 100 },
    { subject: 'Pace', A: formData.pace || 70, fullMark: 100 },
    { subject: 'Strength', A: formData.strength || 70, fullMark: 100 },
    { subject: 'Tactical', A: formData.tactical || 70, fullMark: 100 },
    { subject: 'Vision', A: formData.vision || 70, fullMark: 100 },
    { subject: 'Teamwork', A: formData.teamwork || 70, fullMark: 100 },
  ];

  const handleSave = () => {
    if (id && id !== 'placeholder') {
      updateItem(id, formData);
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (id && id !== 'placeholder' && confirm('Yakin ingin menghapus pemain ini?')) {
      deleteItem(id);
      navigate('/players');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const publicUrl = await uploadFile(file, 'players');
        if (publicUrl) {
          setFormData({ ...formData, photo: publicUrl });
        }
      } catch (error) {
        console.error("Upload failed:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const StatBox = ({ label, value, icon: Icon, isEdit, name, type="text" }: any) => (
    <div className="bg-gradient-to-br from-[#0c1322] to-[#0a0f1c] border border-white/5 rounded-2xl p-5 flex flex-col gap-2 hover:border-blue-500/30 transition-all group shadow-[0_0_20px_rgba(37,99,235,0.05)]">
      <div className="flex items-center gap-3 text-white/50 mb-1">
        <Icon className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
        <span className="text-[10px] uppercase font-black tracking-[0.2em]">{label}</span>
      </div>
      {isEdit ? (
        <input 
          type={type} 
          name={name}
          value={value}
          onChange={(e) => setFormData({...formData, [name]: e.target.value})}
          className="bg-black/60 border border-white/10 focus:border-blue-500 rounded-xl px-4 py-2 text-white font-black text-2xl w-full focus:outline-none transition-all"
        />
      ) : (
        <span className="text-3xl font-display font-black text-white">{value}</span>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)]" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto animate-in fade-in duration-700 pb-12 font-sans">
        
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/players')} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider">
            <ChevronLeft className="w-5 h-5" /> Kembali
          </button>
          
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button onClick={handleDelete} className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all border border-red-500/30">
                  <Trash2 className="w-4 h-4" /> Hapus
                </button>
                <button onClick={handleSave} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] px-6 py-3 rounded-2xl flex items-center gap-2 transition-all font-black text-xs uppercase tracking-[0.1em]">
                  <CheckCircle2 className="w-4 h-4" /> Simpan Profil
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-6 py-3 bg-white/5 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all border border-white/10">
                <Edit2 className="w-4 h-4" /> Edit Profil
              </button>
            )}
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden bg-[#111827] border border-white/10 shadow-2xl flex flex-col md:flex-row group">
           <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.1),transparent_50%)] pointer-events-none" />
           
           {/* Big Photo & Basics */}
           <div className="md:w-[400px] shrink-0 relative p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/10 bg-gradient-to-b from-white/5 to-transparent">
             <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-white/10 relative shadow-[0_0_50px_rgba(37,99,235,0.2)] mb-6 group-hover:scale-105 transition-transform duration-500">
               <img src={formData.photo} alt={formData.name} className="w-full h-full object-cover object-top" />
               <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#111827] to-transparent" />
               {isEditing && (
                 <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer text-white">
                   {isUploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <>
                     <Upload className="w-8 h-8 mb-2" />
                     <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-primary)]">Ubah Foto</span>
                     <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                   </>}
                 </label>
               )}
             </div>
             
             <div className="text-center w-full">
               {isEditing ? (
                 <input 
                    value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="bg-black/50 border border-[var(--color-primary)]/50 rounded-lg px-3 py-2 text-white font-display font-black text-3xl uppercase tracking-tighter w-full text-center focus:outline-none mb-2"
                 />
               ) : (
                 <h1 className="text-3xl md:text-4xl font-display font-black text-white uppercase tracking-tighter mb-2">{formData.name}</h1>
               )}
               
               <div className="flex items-center justify-center gap-2">
                 <span className="px-3 py-1 bg-[var(--color-primary)] text-black font-black text-xs uppercase tracking-widest rounded-lg">{formData.position}</span>
                 <span className="px-3 py-1 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-lg">{formData.category}</span>
               </div>
             </div>
             
             {/* Overall Rating Badge huge */}
             <div className="absolute top-8 left-8 w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(250,204,21,0.4)] border-2 border-white/20 rotate-[-5deg] group-hover:rotate-0 transition-all">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#111827] leading-none mb-1">OVR</span>
                <span className="text-2xl font-black text-[#111827] leading-none">{formData.overall}</span>
             </div>
           </div>

           {/* Core Stats & Biodata */}
           <div className="flex-1 p-8 flex flex-col justify-center">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
               <StatBox label="Umur" value={formData.age} icon={Activity} isEdit={isEditing} name="age" type="number" />
               <StatBox label="Tinggi (cm)" value={formData.height} icon={Activity} isEdit={isEditing} name="height" type="number" />
               <StatBox label="Berat (kg)" value={formData.weight} icon={Activity} isEdit={isEditing} name="weight" type="number" />
               <StatBox label="Kaki" value={formData.dominantFoot} icon={Activity} isEdit={isEditing} name="dominantFoot" />
             </div>

             <div className="grid grid-cols-2 gap-4 relative">
                <div className="absolute -inset-4 bg-[var(--color-primary)]/5 rounded-2xl blur-xl -z-10" />
                <StatBox label="Goals" value={formData.goals} icon={TrendingUp} isEdit={isEditing} name="goals" type="number" />
                <StatBox label="Assists" value={formData.assists} icon={TrendingUp} isEdit={isEditing} name="assists" type="number" />
             </div>
           </div>
        </div>

           {/* Detailed Stats / Radar */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
           
           {/* Radar Chart area */}
           <div className="xl:col-span-2 bg-gradient-to-br from-[#0c1322] to-[#0a0f1c] border border-white/5 shadow-2xl rounded-[2.5rem] p-8 relative overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-8 relative z-10">
                <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight flex items-center gap-3">
                  <Activity className="w-6 h-6 text-blue-500" /> Performance Radar
                </h3>
              </div>
              <div className="flex-1 w-full min-h-[450px] relative z-10">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.05)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '900', textTransform: 'uppercase' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name={formData.name} dataKey="A" stroke="#3b82f6" strokeWidth={4} fill="url(#colorUv)" fillOpacity={0.6} />
                    <defs>
                      <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      </linearGradient>
                    </defs>
                  </RadarChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Manual Inputs for Skills if Edit Mode, or List if View Mode */}
           <div className="bg-gradient-to-br from-[#0c1322] to-[#0a0f1c] border border-white/5 shadow-2xl rounded-[2.5rem] p-8 flex flex-col">
              <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight mb-8">Skill Ratings</h3>
              <div className="space-y-6 flex-1">
                {radarData.map((item) => (
                  <div key={item.subject} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">{item.subject}</span>
                       <span className={cn("text-lg font-black", item.A >= 85 ? "text-blue-400" : item.A >= 70 ? "text-green-400" : "text-white")}>{item.A}</span>
                    </div>
                    {isEditing ? (
                      <input 
                        type="range" 
                        min="0" max="100" 
                        value={item.A}
                        onChange={(e) => setFormData({...formData, [item.subject.toLowerCase()]: parseInt(e.target.value)})}
                        className="w-full accent-blue-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                      />
                    ) : (
                      <div className="w-full h-1.5 bg-black rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${item.A}%` }}
                          transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                          className={cn("h-full rounded-full", item.A >= 85 ? "bg-gradient-to-r from-blue-500 to-indigo-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" : item.A >= 70 ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-white/40")}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
           </div>
        </div>

        {/* History & Coach Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
           {/* physical condition */}
           <div className="bg-gradient-to-br from-[#0c1322] to-[#0a0f1c] border border-white/5 shadow-2xl rounded-[2.5rem] p-8">
              <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight mb-6">Kondisi Fisik</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                 <div className="bg-black/40 rounded-2xl p-4 border border-white/5 text-center">
                    <p className="text-[10px] font-black uppercase text-white/50 tracking-[0.2em] mb-2">Stamina</p>
                    <p className="text-2xl font-display font-black text-green-400">92%</p>
                 </div>
                 <div className="bg-black/40 rounded-2xl p-4 border border-white/5 text-center">
                    <p className="text-[10px] font-black uppercase text-white/50 tracking-[0.2em] mb-2">Kehadiran Latihan</p>
                    <p className="text-2xl font-display font-black text-blue-400">{formData.attendance}%</p>
                 </div>
                 <div className="bg-black/40 rounded-2xl p-4 border border-white/5 text-center">
                    <p className="text-[10px] font-black uppercase text-white/50 tracking-[0.2em] mb-2">Status Cedera</p>
                    <p className="text-lg mt-2 font-display font-black text-emerald-400 leading-none">FIT TO PLAY</p>
                 </div>
              </div>
           </div>

           {/* Coach Notes */}
           <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/20 border border-blue-500/20 shadow-[0_0_30px_rgba(37,99,235,0.1)] rounded-[2.5rem] p-8">
              <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight mb-6 flex items-center gap-3">
                 <Edit2 className="w-6 h-6 text-blue-400" /> Catatan Pelatih
              </h3>
              {isEditing ? (
                 <textarea 
                   className="w-full h-32 bg-black/60 border border-blue-500/50 rounded-2xl p-4 text-white font-medium resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" 
                   value={formData.notes || "Pemain memiliki visi bermain yang sangat baik, perlu peningkatan di sektor power shooting dan defense tracking."}
                   onChange={(e) => setFormData({...formData, notes: e.target.value})}
                 />
              ) : (
                 <p className="text-white/70 leading-relaxed font-medium bg-black/40 p-6 rounded-2xl border border-white/5 italic">
                   "{formData.notes || "Pemain memiliki visi bermain yang sangat baik, perlu peningkatan di sektor power shooting dan defense tracking. Berpotensi menembus skuad inti bulan depan jika konsisten."}"
                 </p>
              )}
           </div>
        </div>

      </div>
    </Layout>
  );
}
