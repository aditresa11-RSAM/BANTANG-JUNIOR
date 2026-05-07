import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, Edit2, CheckCircle2, TrendingUp, Activity, Upload, Trash2, Loader2, FileText, Download, Eye, Image as ImageIcon } from 'lucide-react';
import Layout from '../components/ui/Layout';
import { useCMSData } from '../lib/store';
import { cn } from '../lib/utils';
import { uploadFile, uploadRawFile } from '../lib/supabase';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip
} from 'recharts';

export default function PlayerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  // using any player list to find, in real app would get single item
  const { data: players, updateItem, deleteItem, isLoading } = useCMSData('players', []);
  const { data: gkStatsList, updateItem: updateGkStats, addItems: addGkStats } = useCMSData('goalkeeper_stats', []);
  
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
  const [gkFormData, setGkFormData] = useState<any>({
    reflex: 85, diving: 80, handling: 82, positioning: 88, instinct: 86,
    distribution: 75, kicking: 70, throwing: 80, reaction_speed: 86, agility: 78,
    shot_stopping: 85, one_on_one: 80, decision_making: 82, composure: 80,
    concentration: 85, anticipation: 83, passing_accuracy: 75, jumping_reach: 80,
    strength: 78, balance: 75
  });
  const [gkStatId, setGkStatId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState({ kk: false, akta: false, kia: false });

  useEffect(() => {
    const found = players.find((p: any) => p.id === id);
    if (found && !isEditing) {
      setFormData(found);
    }
    
    // Load GK stats if exists
    if (found && (found.position === 'GK' || found.position === 'Goalkeeper') && !isEditing) {
      const gkStat = gkStatsList.find((g: any) => g.player_id === found.id);
      if (gkStat) {
        setGkFormData(gkStat);
        setGkStatId(gkStat.id);
      }
    }
  }, [players, gkStatsList, id, isEditing]);


  // Auto-calculate overall rating when skills change
  const isGoalkeeper = formData.position === 'GK' || formData.position === 'Goalkeeper';

  useEffect(() => {
    if (isEditing) {
      if (isGoalkeeper) {
        const skills = [
          gkFormData.reflex || 0,
          gkFormData.diving || 0,
          gkFormData.handling || 0,
          gkFormData.positioning || 0,
          gkFormData.instinct || 0,
          gkFormData.distribution || 0,
        ];
        const sum = skills.reduce((a, b) => Number(a) + Number(b), 0);
        const avg = Math.round(sum / 6);
        if (formData.overall !== avg) {
          setFormData(prev => ({ ...prev, overall: avg }));
        }
      } else {
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
    }
  }, [formData.dribbling, formData.passing, formData.shooting, formData.pace, formData.strength, formData.tactical, formData.vision, formData.teamwork, gkFormData, isEditing, isGoalkeeper]);

  const gkRadarGroups = [
    {
      title: 'CORE SKILL (UTAMA)',
      data: [
        { subject: 'Reflexes', label: 'Reflexes (Refleks)', A: gkFormData.reflex || 70, key: 'reflex', fullMark: 100 },
        { subject: 'Diving', label: 'Diving (Kemampuan menjatuhkan diri)', A: gkFormData.diving || 70, key: 'diving', fullMark: 100 },
        { subject: 'Handling', label: 'Handling (Menangkap bola)', A: gkFormData.handling || 70, key: 'handling', fullMark: 100 },
        { subject: 'Shot Stop', label: 'Shot Stopping (Menahan tembakan)', A: gkFormData.shot_stopping || 70, key: 'shot_stopping', fullMark: 100 },
        { subject: 'Positioning', label: 'Positioning (Posisi penjaga gawang)', A: gkFormData.positioning || 70, key: 'positioning', fullMark: 100 },
        { subject: 'One-on-One', label: 'One-on-One (Situasi 1 lawan 1)', A: gkFormData.one_on_one || 70, key: 'one_on_one', fullMark: 100 },
      ]
    },
    {
      title: 'MENTAL & INSTING',
      data: [
        { subject: 'Instinct', label: 'Instinct (Insting membaca arah bola)', A: gkFormData.instinct || 70, key: 'instinct', fullMark: 100 },
        { subject: 'Decision', label: 'Decision Making (Pengambilan keputusan)', A: gkFormData.decision_making || 70, key: 'decision_making', fullMark: 100 },
        { subject: 'Composure', label: 'Composure (Ketenangan)', A: gkFormData.composure || 70, key: 'composure', fullMark: 100 },
        { subject: 'Concentration', label: 'Concentration (Konsentrasi)', A: gkFormData.concentration || 70, key: 'concentration', fullMark: 100 },
        { subject: 'Anticipation', label: 'Anticipation (Antisipasi)', A: gkFormData.anticipation || 70, key: 'anticipation', fullMark: 100 },
      ]
    },
    {
      title: 'DISTRIBUSI BOLA',
      data: [
        { subject: 'Kicking', label: 'Kicking (Tendangan jauh)', A: gkFormData.kicking || 70, key: 'kicking', fullMark: 100 },
        { subject: 'Throwing', label: 'Throwing (Lemparan)', A: gkFormData.throwing || 70, key: 'throwing', fullMark: 100 },
        { subject: 'Distribution', label: 'Ball Distribution (Distribusi bola)', A: gkFormData.distribution || 70, key: 'distribution', fullMark: 100 },
        { subject: 'Pass Acc.', label: 'Passing Accuracy (Akurasi passing)', A: gkFormData.passing_accuracy || 70, key: 'passing_accuracy', fullMark: 100 },
      ]
    },
    {
      title: 'FISIK',
      data: [
        { subject: 'Agility', label: 'Agility (Kelincahan)', A: gkFormData.agility || 70, key: 'agility', fullMark: 100 },
        { subject: 'Reaction', label: 'Reaction Speed (Kecepatan respon)', A: gkFormData.reaction_speed || 70, key: 'reaction_speed', fullMark: 100 },
        { subject: 'Jumping', label: 'Jumping Reach (Lompatan)', A: gkFormData.jumping_reach || 70, key: 'jumping_reach', fullMark: 100 },
        { subject: 'Strength', label: 'Strength (Kekuatan)', A: gkFormData.strength || 70, key: 'strength', fullMark: 100 },
        { subject: 'Balance', label: 'Balance (Keseimbangan)', A: gkFormData.balance || 70, key: 'balance', fullMark: 100 },
      ]
    }
  ];

  const radarData = isGoalkeeper ? gkRadarGroups[0].data : [
    { subject: 'Dribbling', A: formData.dribbling || 70, fullMark: 100 },
    { subject: 'Passing', A: formData.passing || 70, fullMark: 100 },
    { subject: 'Shooting', A: formData.shooting || 70, fullMark: 100 },
    { subject: 'Pace', A: formData.pace || 70, fullMark: 100 },
    { subject: 'Strength', A: formData.strength || 70, fullMark: 100 },
    { subject: 'Tactical', A: formData.tactical || 70, fullMark: 100 },
    { subject: 'Vision', A: formData.vision || 70, fullMark: 100 },
    { subject: 'Teamwork', A: formData.teamwork || 70, fullMark: 100 },
  ];

  const allGkSkills = [
    { subject: 'Reflexes', A: gkFormData.reflex || 70, key: 'reflex' },
    { subject: 'Diving', A: gkFormData.diving || 70, key: 'diving' },
    { subject: 'Handling', A: gkFormData.handling || 70, key: 'handling' },
    { subject: 'Shot Stopping', A: gkFormData.shot_stopping || 70, key: 'shot_stopping' },
    { subject: 'Positioning', A: gkFormData.positioning || 70, key: 'positioning' },
    { subject: 'One-on-One', A: gkFormData.one_on_one || 70, key: 'one_on_one' },
    { subject: 'Instinct', A: gkFormData.instinct || 70, key: 'instinct' },
    { subject: 'Decision Making', A: gkFormData.decision_making || 70, key: 'decision_making' },
    { subject: 'Composure', A: gkFormData.composure || 70, key: 'composure' },
    { subject: 'Concentration', A: gkFormData.concentration || 70, key: 'concentration' },
    { subject: 'Anticipation', A: gkFormData.anticipation || 70, key: 'anticipation' },
    { subject: 'Kicking', A: gkFormData.kicking || 70, key: 'kicking' },
    { subject: 'Throwing', A: gkFormData.throwing || 70, key: 'throwing' },
    { subject: 'Ball Distribution', A: gkFormData.distribution || 70, key: 'distribution' },
    { subject: 'Passing Accuracy', A: gkFormData.passing_accuracy || 70, key: 'passing_accuracy' },
    { subject: 'Agility', A: gkFormData.agility || 70, key: 'agility' },
    { subject: 'Reaction Speed', A: gkFormData.reaction_speed || 70, key: 'reaction_speed' },
    { subject: 'Jumping Reach', A: gkFormData.jumping_reach || 70, key: 'jumping_reach' },
    { subject: 'Strength', A: gkFormData.strength || 70, key: 'strength' },
    { subject: 'Balance', A: gkFormData.balance || 70, key: 'balance' },
  ];

  const allSkillsToDisplay = isGoalkeeper ? allGkSkills : radarData.map(r => ({ ...r, key: r.subject.toLowerCase() }));

  const handleSave = () => {
    if (id && id !== 'placeholder') {
      updateItem(id, formData);
      if (isGoalkeeper) {
        if (gkStatId) {
          updateGkStats(gkStatId, { ...gkFormData, player_id: id });
        } else {
          addGkStats({ ...gkFormData, player_id: id });
        }
      }
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

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'kk' | 'akta' | 'kia') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file maksimal 2MB');
      return;
    }

    setUploadingDoc(p => ({ ...p, [type]: true }));
    try {
      const url = await uploadRawFile(file, 'player-documents');
      if (url) {
        setFormData((p: any) => ({ ...p, [`${type}_url`]: url }));
      }
    } catch (err) {
      console.error(err);
      alert('Gagal mengupload file');
    } finally {
      setUploadingDoc(p => ({ ...p, [type]: false }));
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
          value={value ?? ''}
          onChange={(e) => setFormData({...formData, [name]: type === 'number' ? Number(e.target.value) : e.target.value})}
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
               <img src={formData.photo || null} alt={formData.name} className="w-full h-full object-cover object-top" />
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
                    value={formData.name ?? ''} onChange={(e) => setFormData({...formData, name: e.target.value})}
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
              <div className={cn(
                "absolute top-8 left-8 w-16 h-16 rounded-2xl flex flex-col items-center justify-center shadow-lg border-2 rotate-[-5deg] group-hover:rotate-0 transition-all",
                isGoalkeeper 
                  ? "bg-gradient-to-br from-teal-400 to-emerald-600 shadow-[0_0_30px_rgba(16,185,129,0.4)] border-white/20" 
                  : "bg-gradient-to-br from-yellow-400 to-amber-600 shadow-[0_0_30px_rgba(250,204,21,0.4)] border-white/20"
              )}>
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
                <StatBox label={isGoalkeeper ? "Saves" : "Goals"} value={formData.goals} icon={TrendingUp} isEdit={isEditing} name="goals" type="number" />
                <StatBox label={isGoalkeeper ? "Clean Sheets" : "Assists"} value={formData.assists} icon={TrendingUp} isEdit={isEditing} name="assists" type="number" />
             </div>
           </div>
        </div>

           {/* Detailed Stats / Radar */}
        {isGoalkeeper ? (
          <div className="space-y-12">
            {gkRadarGroups.map((group, idx) => (
              <div key={idx} className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
                {/* Radar Chart section */}
                <div className="bg-gradient-to-br from-[#0c1322] to-[#0a0f1c] border border-white/5 shadow-2xl rounded-[2.5rem] p-8 relative overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      {group.title}
                    </h3>
                  </div>
                  <div className="w-full aspect-square relative z-10 max-w-[500px] mx-auto min-h-0 min-w-0">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={group.data}>
                        <PolarGrid stroke="rgba(255,255,255,0.05)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '900', textTransform: 'uppercase' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name={formData.name} dataKey="A" stroke="#10b981" strokeWidth={4} fill="url(#colorGk)" fillOpacity={0.6} />
                        <defs>
                          <linearGradient id="colorGk" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                          </linearGradient>
                        </defs>
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Skill Ratings section */}
                <div className="bg-gradient-to-br from-[#0c1322] to-[#0a0f1c] border border-white/5 shadow-2xl rounded-[2.5rem] p-8 h-full flex flex-col">
                  <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight mb-8">Skill Ratings</h3>
                  <div className="space-y-6">
                    {group.data.map((item) => (
                      <div key={item.key} className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                           <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">{item.label || item.subject}</span>
                           <span className="text-lg font-black text-emerald-400">{item.A}</span>
                        </div>
                        {isEditing ? (
                          <input 
                            type="range" 
                            min="0" max="100" 
                            value={item.A}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              setGkFormData({...gkFormData, [item.key]: val});
                            }}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                          />
                        ) : (
                          <div className="w-full h-1.5 bg-black rounded-full overflow-hidden border border-white/5">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${item.A}%` }}
                              transition={{ duration: 1.5, delay: idx * 0.2, ease: "easeOut" }}
                              className={cn(
                                "h-full rounded-full", 
                                item.A >= 85 ? "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" : item.A >= 70 ? "bg-gradient-to-r from-teal-500 to-cyan-500" : "bg-white/40"
                              )}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
             {/* Radar Chart area */}
             <div className="xl:col-span-2 bg-gradient-to-br from-[#0c1322] to-[#0a0f1c] border border-white/5 shadow-2xl rounded-[2.5rem] p-8 relative overflow-hidden flex flex-col h-full">
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight flex items-center gap-3">
                    <Activity className="w-6 h-6 text-blue-500" /> 
                    Performance Radar
                  </h3>
                </div>
                <div className="flex-1 w-full min-h-[450px] relative z-10 min-h-0 min-w-0">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
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
             <div className="bg-gradient-to-br from-[#0c1322] to-[#0a0f1c] border border-white/5 shadow-2xl rounded-[2.5rem] p-8 flex flex-col max-h-[600px]">
                <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight mb-8 shrink-0">Skill Ratings</h3>
                <div className="space-y-6 flex-1 overflow-y-auto pr-4 custom-scrollbar">
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
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setFormData({...formData, [item.subject.toLowerCase()]: val});
                          }}
                          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                      ) : (
                        <div className="w-full h-1.5 bg-black rounded-full overflow-hidden border border-white/5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${item.A}%` }}
                            transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
             </div>
          </div>
        )}

        {isGoalkeeper && !isEditing && (
           <div className="mt-6 bg-[#0a1428] border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.1)] rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full" />
             <div className="w-16 h-16 shrink-0 bg-emerald-500/10 rounded-2xl border border-emerald-500/30 flex items-center justify-center relative z-10">
                <span className="text-3xl">🧤</span>
             </div>
             <div className="relative z-10">
                <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                   <span>AI Smart Insight</span>
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </h3>
                <h4 className="text-xl md:text-2xl font-display font-black text-white leading-tight mb-2">
                   "Reaksi cepat di jarak dekat sangat baik, namun lemah dalam distribusi bola jauh."
                </h4>
                <div className="flex flex-wrap gap-2 mt-4">
                   <div className="px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase text-emerald-400 tracking-wider">Kekuatan: Reflexes</div>
                   <div className="px-3 py-1 rounded-md bg-rose-500/10 border border-rose-500/20 text-[10px] font-black uppercase text-rose-400 tracking-wider">Kelemahan: Distribution</div>
                </div>
             </div>
           </div>
        )}

        {/* History & Coach Notes */}
        {isGoalkeeper && (
          <div className="mt-6 bg-[#0c1322] border border-white/5 shadow-2xl rounded-[2.5rem] p-8">
             <h3 className="text-xl font-display font-black text-white uppercase tracking-tight mb-6">Progress History (Goalkeeper)</h3>
             <div className="w-full h-64 min-h-0 min-w-0">
               <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                 <LineChart data={[
                    { month: 'Jan', reflex: 70, diving: 68 },
                    { month: 'Feb', reflex: 72, diving: 70 },
                    { month: 'Mar', reflex: 75, diving: 71 },
                    { month: 'Apr', reflex: 78, diving: 74 },
                    { month: 'May', reflex: 81, diving: 77 },
                    { month: 'Jun', reflex: gkFormData.reflex || 80, diving: gkFormData.diving || 80 }
                 ]}>
                   <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                   <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} />
                   <YAxis hide domain={[50, 100]} />
                   <ChartTooltip contentStyle={{ backgroundColor: '#0B1D3A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} itemStyle={{ fontSize: '12px', fontWeight: 800 }} />
                   <Line type="monotone" dataKey="reflex" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
                   <Line type="monotone" dataKey="diving" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, fill: '#0ea5e9' }} activeDot={{ r: 6 }} />
                 </LineChart>
               </ResponsiveContainer>
             </div>
          </div>
        )}

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
                   value={formData.notes ?? "Pemain memiliki visi bermain yang sangat baik, perlu peningkatan di sektor power shooting dan defense tracking."}
                   onChange={(e) => setFormData({...formData, notes: e.target.value})}
                 />
              ) : (
                 <p className="text-white/70 leading-relaxed font-medium bg-black/40 p-6 rounded-2xl border border-white/5 italic">
                   "{formData.notes || "Pemain memiliki visi bermain yang sangat baik, perlu peningkatan di sektor power shooting dan defense tracking. Berpotensi menembus skuad inti bulan depan jika konsisten."}"
                 </p>
              )}
           </div>
        </div>

        {/* DOKUMEN RESMI SECTION */}
        <div className="mt-6 bg-[#0c162d] border border-white/10 shadow-2xl rounded-[2.5rem] p-8">
           <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight mb-8 flex items-center gap-3">
              <FileText className="w-6 h-6 text-orange-400" /> Dokumen Resmi
           </h3>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                 { id: 'kk', title: 'Kartu Keluarga', url: formData.kk_url, icon: ImageIcon, color: 'text-orange-400', required: true },
                 { id: 'akta', title: 'Akta Kelahiran', url: formData.akta_url, icon: FileText, color: 'text-blue-400', required: true },
                 { id: 'kia', title: 'Identitas Anak (KIA)', url: formData.kia_url, icon: ImageIcon, color: 'text-emerald-400', required: false }
              ].map((doc, i) => (
                 <div key={i} className="bg-[#080d19] border border-white/5 rounded-2xl p-5 flex flex-col relative overflow-hidden group">
                    <div className="flex items-start justify-between mb-4">
                       <div className="flex items-center gap-2">
                          <doc.icon className={`w-5 h-5 ${doc.color}`} />
                          <h4 className="text-sm font-bold text-white tracking-tight">{doc.title}</h4>
                       </div>
                       {doc.required ? (
                          <span className="text-[8px] font-black uppercase tracking-widest bg-red-500/20 text-red-400 px-2 py-0.5 rounded">Wajib</span>
                       ) : (
                          <span className="text-[8px] font-black uppercase tracking-widest bg-white/10 text-white/50 px-2 py-0.5 rounded">Ops</span>
                       )}
                    </div>
                    
                     <div className="flex-1 flex flex-col items-center justify-center bg-black/40 rounded-xl border border-white/5 p-4 mb-4 relative overflow-hidden">
                        {uploadingDoc[doc.id as keyof typeof uploadingDoc] ? (
                           <div className="text-center z-10 relative">
                              <Loader2 className="w-8 h-8 animate-spin text-orange-400 mx-auto mb-2" />
                              <span className="text-xs font-bold text-orange-400">Uploading...</span>
                           </div>
                        ) : doc.url ? (
                           <div className="text-center z-10 relative">
                              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                              <span className="text-xs font-bold text-emerald-400">File Tersedia</span>
                           </div>
                        ) : (
                           <div className="text-center z-10 relative">
                              <span className="text-2xl mb-2 block opacity-50">📂</span>
                              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Tidak tersedia</span>
                           </div>
                        )}
                        
                        {isEditing && (
                           <label className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer z-20">
                             <Upload className="w-6 h-6 text-white mb-2" />
                             <span className="text-[9px] font-bold text-white uppercase tracking-widest">Klik Upload</span>
                             <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => handleDocUpload(e, doc.id as any)} />
                           </label>
                        )}
                     </div>
                    
                    <div className="flex gap-2">
                       <button 
                         onClick={() => doc.url ? window.open(doc.url, '_blank') : null}
                         disabled={!doc.url}
                         className={cn(
                           "flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                           doc.url ? "bg-white/10 text-white hover:bg-white border border-white/10 hover:text-black" : "bg-white/5 text-white/30 cursor-not-allowed"
                         )}
                       >
                         <Eye className="w-3 h-3" /> Lihat
                       </button>
                       <a 
                         href={doc.url || '#'}
                         target="_blank"
                         rel="noopener noreferrer"
                         download={doc.title.replace(/\s+/g, '_')}
                         className={cn(
                           "w-12 h-[34px] rounded-xl border flex items-center justify-center shrink-0 transition-all", // Made smaller height
                           doc.url ? "border-white/10 bg-white/5 hover:bg-blue-500 hover:text-white hover:border-blue-500" : "border-transparent bg-white/5 text-white/30 cursor-not-allowed"
                         )}
                         onClick={(e) => !doc.url && e.preventDefault()}
                       >
                         <Download className="w-4 h-4" />
                       </a>
                    </div>
                 </div>
              ))}
           </div>
        </div>

      </div>
    </Layout>
  );
}
