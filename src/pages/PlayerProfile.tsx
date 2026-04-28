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
    category: 'U17',
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
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-1">
      <div className="flex items-center gap-2 text-white/50 mb-1">
        <Icon className="w-4 h-4" />
        <span className="text-xs uppercase font-bold tracking-widest">{label}</span>
      </div>
      {isEdit ? (
        <input 
          type={type} 
          name={name}
          value={value}
          onChange={(e) => setFormData({...formData, [name]: e.target.value})}
          className="bg-black/40 border border-[var(--color-primary)]/50 rounded-lg px-2 py-1 text-white font-black text-xl w-full focus:outline-none"
        />
      ) : (
        <span className="text-2xl font-black text-white">{value}</span>
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
                <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white font-bold text-sm rounded-xl transition-all border border-red-500/30">
                  <Trash2 className="w-4 h-4" /> Hapus
                </button>
                <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 bg-[var(--color-primary)] text-black font-bold text-sm rounded-xl hover:bg-yellow-500 transition-all shadow-[0_0_15px_var(--color-primary-glow)]">
                  <CheckCircle2 className="w-4 h-4" /> Simpan Profil
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-6 py-2 bg-white/10 text-white font-bold text-sm rounded-xl hover:bg-white/20 transition-all border border-white/10">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           
           {/* Radar Chart area */}
           <div className="lg:col-span-2 bg-[#111827] border border-white/10 rounded-3xl p-6 relative overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="text-xl font-display font-black text-white uppercase tracking-tight">Performance Radar</h3>
              </div>
              <div className="flex-1 w-full min-h-[400px] relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 'bold' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name={formData.name} dataKey="A" stroke="var(--color-primary)" strokeWidth={3} fill="var(--color-primary)" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Manual Inputs for Skills if Edit Mode, or List if View Mode */}
           <div className="bg-[#111827] border border-white/10 rounded-3xl p-6 flex flex-col">
              <h3 className="text-xl font-display font-black text-white uppercase tracking-tight mb-6">Skill Ratings</h3>
              <div className="space-y-4 flex-1">
                {radarData.map((item) => (
                  <div key={item.subject} className="flex items-center gap-4">
                    <span className="w-24 text-xs font-bold text-white/60 uppercase tracking-widest">{item.subject}</span>
                    {isEditing ? (
                      <input 
                        type="range" 
                        min="0" max="100" 
                        value={item.A}
                        onChange={(e) => setFormData({...formData, [item.subject.toLowerCase()]: parseInt(e.target.value)})}
                        className="flex-1 accent-[var(--color-primary)]"
                      />
                    ) : (
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${item.A}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className={cn("h-full rounded-full", item.A >= 85 ? "bg-[var(--color-primary)]" : item.A >= 70 ? "bg-blue-500" : "bg-white/40")}
                        />
                      </div>
                    )}
                    <span className="w-8 text-right font-black text-white">{item.A}</span>
                  </div>
                ))}
              </div>
           </div>

        </div>

      </div>
    </Layout>
  );
}
