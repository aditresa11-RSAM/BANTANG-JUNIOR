import React, { useState, useRef, useEffect, useMemo } from 'react';
import Layout from '../components/ui/Layout';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, Target, Plus, Save, Activity, Crosshair, PenTool, MousePointer, 
  Eraser, Undo, Play, Users, Map, Move, Trello, ChevronRight,
  BookOpen, Calendar, CheckSquare, Settings, Share2, Download,
  Layers, Circle, ArrowRight, Trash2, Edit2, Search, Filter,
  History, Clock, BarChart2, Info, Star, Dumbbell, Brain, HeartPulse,
  Image as ImageIcon
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useCMSData } from '../lib/store';
import { useSettings } from '../App';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { uploadFile } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

// --- CONSTANTS ---

const FIELD_MODES = [
  { id: '5v5', name: '5 vs 5 / Futsal', players: 5 },
  { id: '7v7', name: '7 vs 7 (Junior)', players: 7 },
  { id: '9v9', name: '9 vs 9 (Youth)', players: 9 },
  { id: '11v11', name: '11 vs 11 (Pro)', players: 11 },
];

const FORMATIONS: Record<string, any[]> = {
  '5v5': [
    { id: '2-2', name: '2-2', pos: [{x:50, y:90}, {x:30, y:65}, {x:70, y:65}, {x:30, y:35}, {x:70, y:35}] },
    { id: '1-2-1', name: '1-2-1', pos: [{x:50, y:90}, {x:50, y:70}, {x:20, y:45}, {x:80, y:45}, {x:50, y:20}] },
    { id: '3-1', name: '3-1', pos: [{x:50, y:90}, {x:20, y:70}, {x:50, y:70}, {x:80, y:70}, {x:50, y:30}] },
  ],
  '7v7': [
    { id: '2-3-1', name: '2-3-1', pos: [{x:50, y:90}, {x:30, y:75}, {x:70, y:75}, {x:20, y:45}, {x:50, y:50}, {x:80, y:45}, {x:50, y:20}] },
    { id: '3-2-1', name: '3-2-1', pos: [{x:50, y:90}, {x:20, y:75}, {x:50, y:75}, {x:80, y:75}, {x:35, y:45}, {x:65, y:45}, {x:50, y:20}] },
    { id: '3-1-2', name: '3-1-2', pos: [{x:50, y:90}, {x:20, y:75}, {x:50, y:75}, {x:80, y:75}, {x:50, y:50}, {x:35, y:25}, {x:65, y:25}] },
  ],
  '9v9': [
    { id: '3-3-2', name: '3-3-2', pos: [{x:50, y:90}, {x:20, y:75}, {x:50, y:75}, {x:80, y:75}, {x:20, y:50}, {x:50, y:50}, {x:80, y:50}, {x:35, y:25}, {x:65, y:25}] },
    { id: '3-2-3', name: '3-2-3', pos: [{x:50, y:90}, {x:20, y:75}, {x:50, y:75}, {x:80, y:75}, {x:35, y:50}, {x:65, y:50}, {x:20, y:35}, {x:50, y:20}, {x:80, y:35}] },
    { id: '4-3-1', name: '4-3-1', pos: [{x:50, y:90}, {x:20, y:75}, {x:40, y:75}, {x:60, y:75}, {x:80, y:75}, {x:20, y:45}, {x:50, y:45}, {x:80, y:45}, {x:50, y:20}] },
  ],
  '11v11': [
    { id: '4-3-3', name: '4-3-3', pos: [{x:50, y:90}, {x:20, y:70}, {x:40, y:75}, {x:60, y:75}, {x:80, y:70}, {x:50, y:55}, {x:30, y:45}, {x:70, y:45}, {x:20, y:20}, {x:80, y:20}, {x:50, y:15}] },
    { id: '4-4-2', name: '4-4-2', pos: [{x:50, y:90}, {x:20, y:70}, {x:40, y:75}, {x:60, y:75}, {x:80, y:70}, {x:20, y:45}, {x:40, y:50}, {x:60, y:50}, {x:80, y:45}, {x:35, y:20}, {x:65, y:20}] },
    { id: '4-2-3-1', name: '4-2-3-1', pos: [{x:50, y:90}, {x:20, y:70}, {x:40, y:75}, {x:60, y:75}, {x:80, y:70}, {x:40, y:55}, {x:60, y:55}, {x:20, y:35}, {x:50, y:35}, {x:80, y:35}, {x:50, y:15}] },
  ]
};

const STRATEGIES = ['Normal', 'High Press', 'Counter Attack', 'Possession', 'Defensive Block'];

const TRAINING_CATEGORIES = [
  { id: 'technique', name: 'Teknik Dasar', icon: Star, color: 'bg-blue-500' },
  { id: 'physical', name: 'Fisik', icon: Dumbbell, color: 'bg-red-500' },
  { id: 'tactic', name: 'Taktik', icon: Brain, color: 'bg-purple-500' },
  { id: 'mental', name: 'Mental', icon: HeartPulse, color: 'bg-emerald-500' },
  { id: 'goalkeeper', name: 'Goalkeeper', icon: Shield, color: 'bg-amber-500' },
];

// --- COMPONENTS ---

export default function Tactics() {
  const [activeTab, setActiveTab] = useState<'board' | 'attendance' | 'materials'>('board');
  const { data: players } = useCMSData('players', []);
  const { data: materials, addItems: addMaterial, updateItem: updateMaterial, deleteItem: deleteMaterial } = useCMSData('training_materials', []);
  const { data: attendance, addItems: addAttendance } = useCMSData('attendance', []);

  return (
    <Layout>
      <div className="w-full max-w-[1800px] mx-auto pb-12 animate-in fade-in duration-700">
        
        {/* TOP NAVIGATION TABS */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-white/5 pb-6">
          <div className="flex flex-col gap-1">
             <h1 className="text-2xl font-display font-black text-white tracking-tight uppercase flex items-center gap-3">
               Tactical <span className="text-[var(--color-primary)]">Pro Board</span>
               <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">ELITE</span>
             </h1>
             <p className="text-xs text-white/40 font-medium uppercase tracking-widest">Pusat Strategi & Manajemen Latihan</p>
          </div>

          <div className="flex bg-black/40 p-1 rounded-2xl border border-white/10 self-stretch md:self-auto">
            <TabButton 
              active={activeTab === 'board'} 
              onClick={() => setActiveTab('board')} 
              icon={Map} 
              label="Tactical Board" 
            />
            <TabButton 
              active={activeTab === 'attendance'} 
              onClick={() => setActiveTab('attendance')} 
              icon={Users} 
              label="Absensi Pemain" 
            />
            <TabButton 
              active={activeTab === 'materials'} 
              onClick={() => setActiveTab('materials')} 
              icon={BookOpen} 
              label="Materi Latihan" 
            />
          </div>
        </div>

        {/* TAB CONTENT */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full"
          >
            {activeTab === 'board' && <TacticalBoardView players={players} />}
            {activeTab === 'attendance' && <AttendanceView players={players} attendance={attendance} addAttendance={addAttendance} />}
            {activeTab === 'materials' && <TrainingMaterialsView materials={materials} addMaterial={addMaterial} updateMaterial={updateMaterial} deleteMaterial={deleteMaterial} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </Layout>
  );
}

// --- SUB-VIEWS ---

function TacticalBoardView({ players }: { players: any[] }) {
  const [mode, setMode] = useState('11v11');
  const [formation, setFormation] = useState(FORMATIONS[mode][0]);
  const [strategy, setStrategy] = useState('Normal');
  const [activeTool, setActiveTool] = useState('cursor');
  const [toolColor, setToolColor] = useState('#ffffff');
  
  const boardRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState(formation.pos);
  const [paths, setPaths] = useState<any[]>([]);
  const [currentPath, setCurrentPath] = useState<any>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  // Sync positions when formation changes
  useEffect(() => {
    setPositions(formation.pos);
  }, [formation]);

  // Strategy effect
  useEffect(() => {
    let modY = 0;
    if (strategy === 'High Press') modY = -15;
    if (strategy === 'Defensive Block') modY = 15;
    
    setPositions(formation.pos.map((p: any, i: number) => {
      if (i === 0) return p;
      let ny = p.y + modY;
      if (strategy === 'Counter Attack' && p.y < 40) ny -= 10;
      if (strategy === 'Possession' && p.y < 40) ny += 10;
      return { ...p, y: Math.max(5, Math.min(95, ny)) };
    }));
  }, [strategy, formation]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (activeTool === 'cursor') return;
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCurrentPath({ points: [{x, y}], tool: activeTool, color: toolColor });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!currentPath) return;
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCurrentPath({ ...currentPath, points: [...currentPath.points, {x, y}] });
  };

  const handlePointerUp = () => {
    if (currentPath) {
      setPaths([...paths, currentPath]);
      setCurrentPath(null);
    }
  };

  const handleDragEnd = (index: number, info: any) => {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = (info.offset.x / rect.width) * 100;
    const dy = (info.offset.y / rect.height) * 100;
    setPositions(prev => {
      const next = [...prev];
      next[index] = {
        x: Math.max(2, Math.min(98, next[index].x + dx)),
        y: Math.max(2, Math.min(98, next[index].y + dy))
      };
      return next;
    });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-full">
      
      {/* TOOLBAR LEFT */}
      <div className="xl:col-span-2 space-y-4">
         <div className="glass-card p-5 rounded-2xl">
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Board Mode</h3>
            <div className="grid grid-cols-2 gap-2">
               {FIELD_MODES.map(m => (
                 <button 
                   key={m.id} 
                   onClick={() => { setMode(m.id); setFormation(FORMATIONS[m.id][0]); }}
                   className={cn("py-2 px-1 text-[9px] font-black uppercase rounded-lg border transition-all", mode === m.id ? "bg-[var(--color-primary)] text-black border-[var(--color-primary)]" : "bg-white/5 border-white/5 text-white/40 hover:text-white")}
                 >
                   {m.name}
                 </button>
               ))}
            </div>
         </div>

         <div className="glass-card p-5 rounded-2xl">
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Formation</h3>
            <div className="grid grid-cols-2 gap-2">
               {FORMATIONS[mode].map(f => (
                 <button 
                   key={f.id} 
                   onClick={() => setFormation(f)}
                   className={cn("py-2 px-1 text-[9px] font-black uppercase rounded-lg border transition-all", formation.id === f.id ? "bg-white text-black border-white" : "bg-white/5 border-white/5 text-white/40 hover:text-white")}
                 >
                   {f.name}
                 </button>
               ))}
            </div>
         </div>

         <div className="glass-card p-5 rounded-2xl">
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Drawing Tools</h3>
            <div className="grid grid-cols-2 gap-2 mb-4">
               <ToolIconBtn icon={MousePointer} active={activeTool === 'cursor'} onClick={() => setActiveTool('cursor')} label="Cursor" />
               <ToolIconBtn icon={PenTool} active={activeTool === 'pen'} onClick={() => setActiveTool('pen')} label="Pen" />
               <ToolIconBtn icon={ArrowRight} active={activeTool === 'arrow'} onClick={() => setActiveTool('arrow')} label="Arrow" />
               <ToolIconBtn icon={Circle} active={activeTool === 'circle'} onClick={() => setActiveTool('circle')} label="Zone" />
            </div>
            <div className="flex gap-2 mb-4">
               {['#ffffff', '#fbbf24', '#ef4444', '#3b82f6'].map(c => (
                 <button key={c} onClick={() => setToolColor(c)} className={cn("w-6 h-6 rounded-full border-2", toolColor === c ? "border-white scale-125" : "border-transparent")} style={{ backgroundColor: c }} />
               ))}
            </div>
            <div className="flex gap-2">
               <button onClick={() => setPaths(paths.slice(0, -1))} className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 flex justify-center border border-white/5"><Undo className="w-4 h-4" /></button>
               <button onClick={() => setPaths([])} className="flex-1 py-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-white/60 flex justify-center border border-white/5"><Eraser className="w-4 h-4" /></button>
            </div>
         </div>

         <div className="glass-card p-5 rounded-2xl">
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Tactics Note</h3>
            <textarea className="w-full h-32 bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-white/70 focus:outline-none focus:border-white/20 resize-none" placeholder="Tulis instruksi taktis di sini..." />
         </div>
      </div>

      {/* PITCH AREA */}
      <div className="xl:col-span-7 flex flex-col gap-4">
         <div className="flex items-center justify-between px-4 py-2 bg-black/40 rounded-full border border-white/5">
            <div className="flex gap-2">
               {STRATEGIES.map(s => (
                 <button key={s} onClick={() => setStrategy(s)} className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase transition-all", strategy === s ? "bg-white text-black" : "text-white/40 hover:text-white/60")}>{s}</button>
               ))}
            </div>
            <div className="flex gap-2">
               <button className="p-2 text-white/40 hover:text-white transition-colors"><Share2 className="w-4 h-4" /></button>
               <button className="p-2 text-white/40 hover:text-white transition-colors"><Download className="w-4 h-4" /></button>
            </div>
         </div>

         <div 
           ref={boardRef}
           className={cn(
             "w-full aspect-[4/3] md:aspect-[3/2] bg-[#2a5a3a] border-4 border-white/20 rounded-[2rem] relative overflow-hidden shadow-2xl touch-none",
             activeTool !== 'cursor' ? 'cursor-crosshair' : 'cursor-default'
           )}
           onPointerDown={handlePointerDown}
           onPointerMove={handlePointerMove}
           onPointerUp={handlePointerUp}
           onPointerLeave={handlePointerUp}
         >
            {/* Field Graphics */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 10%, #fff 10%, #fff 20%)' }} />
            <div className="absolute inset-0 border-2 border-white/40 m-[2%]" />
            <div className="absolute top-[2%] bottom-[2%] left-1/2 w-0 border-r-2 border-white/40" />
            <div className="absolute top-1/2 left-1/2 w-[20%] aspect-square border-2 border-white/40 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/40 rounded-full -translate-x-1/2 -translate-y-1/2" />
            
            {/* Goals areas */}
            <div className="absolute top-1/2 left-[2%] w-[10%] aspect-square border-2 border-white/40 rounded-full -translate-y-1/2 -translate-x-1/2" />
            <div className="absolute top-1/2 right-[2%] w-[10%] aspect-square border-2 border-white/40 rounded-full -translate-y-1/2 translate-x-1/2" />

            {/* Drawing Layer */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orientation="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill={toolColor} />
                </marker>
              </defs>
              {paths.map((p, i) => <BoardPath key={i} path={p} />)}
              {currentPath && <BoardPath path={currentPath} />}
            </svg>

            {/* Players Layer */}
            <div className="absolute inset-0 p-[2%] z-20 pointer-events-none">
              {positions.map((pos, i) => (
                <motion.div
                  key={i}
                  animate={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  className="absolute"
                  style={{ x: '-50%', y: '-50%' }}
                >
                  <motion.div
                    drag={activeTool === 'cursor'}
                    dragConstraints={boardRef}
                    dragElastic={0}
                    dragMomentum={false}
                    onDragEnd={(_, info) => handleDragEnd(i, info)}
                    whileHover={{ scale: 1.1 }}
                    whileDrag={{ scale: 1.2, zIndex: 100 }}
                    onClick={() => setSelectedIdx(i)}
                    className={cn(
                      "w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white shadow-xl flex items-center justify-center font-display font-black text-sm cursor-grab active:cursor-grabbing pointer-events-auto relative",
                      i === 0 ? 'bg-amber-500 text-black' : 'bg-red-600 text-white',
                      selectedIdx === i ? "ring-4 ring-white/40" : ""
                    )}
                  >
                     {i === 0 ? '1' : i + 1}
                     <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/80 rounded text-[8px] font-bold text-white whitespace-nowrap border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                        {i === 0 ? 'GK' : `Player ${i+1}`}
                     </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
         </div>
      </div>

      {/* SQUAD INFO RIGHT */}
      <div className="xl:col-span-3 space-y-4">
         <div className="glass-card flex flex-col h-full rounded-2xl overflow-hidden min-h-[500px]">
            <div className="bg-white/5 p-4 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2"><Users className="w-4 h-4 text-[var(--color-primary)]" /> Squad List</h3>
              <span className="text-[10px] font-bold text-white/40">{positions.length} Active</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
               {positions.map((_, i) => (
                 <div key={i} onClick={() => setSelectedIdx(i)} className={cn("flex items-center gap-3 p-3 rounded-xl border border-transparent hover:bg-white/5 cursor-pointer transition-all", selectedIdx === i ? "bg-white/10 border-white/10" : "")}>
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs", i === 0 ? "bg-amber-500 text-black" : "bg-red-600 text-white")}>
                      {i === 0 ? '1' : i + 1}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white uppercase mb-0.5">{i === 0 ? 'Goalkeeper' : `Pemain Lapangan #${i+1}`}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-white/40 uppercase font-black">Fitness: 98%</span>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <span className="text-[9px] text-white/40 uppercase font-black">Role: Default</span>
                      </div>
                    </div>
                 </div>
               ))}
            </div>
            
            {selectedIdx !== null && (
              <div className="p-4 bg-[var(--color-primary)]/5 border-t border-[var(--color-primary)]/10">
                 <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xs font-black text-white uppercase mb-1">Status Pemain #{selectedIdx + 1}</h4>
                      <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Ready for Match</p>
                    </div>
                    <button onClick={() => setSelectedIdx(null)} className="text-white/20 hover:text-white"><Plus className="w-4 h-4 rotate-45" /></button>
                 </div>
                 <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="p-2 bg-black/20 rounded-lg border border-white/5">
                       <span className="text-[8px] text-white/40 block uppercase">Stamina</span>
                       <span className="text-xs font-black text-white">95 / 100</span>
                    </div>
                    <div className="p-2 bg-black/20 rounded-lg border border-white/5">
                       <span className="text-[8px] text-white/40 block uppercase">Confidence</span>
                       <span className="text-xs font-black text-white">High</span>
                    </div>
                 </div>
                 <button className="w-full py-2.5 bg-[var(--color-primary)] text-black font-black text-[10px] uppercase rounded-xl hover:bg-yellow-500 transition-all shadow-lg">Ganti Pemain</button>
              </div>
            )}
         </div>
      </div>

    </div>
  );
}

function AttendanceView({ players, attendance, addAttendance }: { players: any[], attendance: any[], addAttendance: any }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterCat, setFilterCat] = useState('All');
  const [search, setSearch] = useState('');
  
  const categories = ['All', 'U10', 'U12', 'U15', 'U17'];

  const filteredPlayers = players.filter(p => {
    const matchCat = filterCat === 'All' || p.category === filterCat;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const getStatus = (playerId: string) => {
    return attendance.find(a => a.player_id === playerId && a.date === date)?.status || 'none';
  };

  const handleStatusChange = (playerId: string, status: string) => {
    const record = attendance.find(a => a.player_id === playerId && a.date === date);
    if (record) {
       // Logic to handle existing record if useCMSData supported updates by query, 
       // but here we just append or use a unique ID approach
       // For simplicity in this demo:
       addAttendance({ player_id: playerId, date, status, id: record.id });
    } else {
       addAttendance({ player_id: playerId, date, status });
    }
  };

  return (
    <div className="space-y-6">
       <div className="glass-card p-6 rounded-2xl flex flex-col xl:flex-row gap-6 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 items-center w-full xl:w-auto">
             <div className="relative w-full md:w-64">
               <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
               <input 
                 type="date" 
                 value={date} 
                 onChange={(e) => setDate(e.target.value)} 
                 className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[var(--color-primary)] [color-scheme:dark]" 
               />
             </div>
             <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 w-full md:w-auto overflow-x-auto hide-scrollbar">
                {categories.map(c => (
                  <button key={c} onClick={() => setFilterCat(c)} className={cn("px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all whitespace-nowrap", filterCat === c ? "bg-white/10 text-white" : "text-white/40")}>{c}</button>
                ))}
             </div>
          </div>
          <div className="relative w-full xl:w-80">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
             <input 
                type="text" 
                placeholder="Cari pemain untuk diabsen..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]" 
             />
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPlayers.map(p => (
            <div key={p.id} className="glass-card p-4 rounded-2xl border border-white/5 flex gap-4 items-center">
               <img src={p.photo} alt="" className="w-14 h-14 rounded-xl object-cover ring-2 ring-white/5" />
               <div className="flex-1">
                  <h4 className="text-sm font-bold text-white uppercase tracking-tight truncate w-32">{p.name}</h4>
                  <p className="text-[10px] text-white/40 uppercase font-bold">{p.category} • {p.position}</p>
               </div>
               <div className="flex gap-1">
                  <StatusBtn icon="✅" active={getStatus(p.id) === 'present'} onClick={() => handleStatusChange(p.id, 'present')} tip="Hadir" />
                  <StatusBtn icon="⏰" active={getStatus(p.id) === 'late'} onClick={() => handleStatusChange(p.id, 'late')} tip="Telat" />
                  <StatusBtn icon="🤒" active={getStatus(p.id) === 'sick'} onClick={() => handleStatusChange(p.id, 'sick')} tip="Sakit" />
                  <StatusBtn icon="❌" active={getStatus(p.id) === 'absent'} onClick={() => handleStatusChange(p.id, 'absent')} tip="Alpa" />
               </div>
            </div>
          ))}
       </div>
    </div>
  );
}

function TrainingMaterialsView({ materials, addMaterial, updateMaterial, deleteMaterial }: { materials: any[], addMaterial: any, updateMaterial: any, deleteMaterial: any }) {
  const [filterTab, setFilterTab] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    title: '', category: 'technique', description: '', duration: '60 mnt', age_group: 'U12', level: 'Beginner', media_url: ''
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const publicUrl = await uploadFile(file, 'materials');
        if (publicUrl) {
          setFormData({ ...formData, media_url: publicUrl });
        }
      } catch (error) {
        console.error("Upload failed:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const filteredMaterials = materials.filter(m => filterTab === 'All' || m.category === filterTab);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateMaterial(editing.id, formData);
    } else {
      addMaterial({ ...formData });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5 overflow-x-auto hide-scrollbar max-w-full">
            <button onClick={() => setFilterTab('All')} className={cn("px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all whitespace-nowrap", filterTab === 'All' ? "bg-white/10 text-white" : "text-white/40")}>Semua</button>
            {TRAINING_CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setFilterTab(cat.id)} className={cn("px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all whitespace-nowrap", filterTab === cat.id ? "bg-white/10 text-white" : "text-white/40")}>{cat.name}</button>
            ))}
          </div>
          <button onClick={() => { setEditing(null); setFormData({title:'', category:'technique', description:'', duration:'60 mnt', age_group:'U12', level:'Beginner', media_url:''}); setIsModalOpen(true); }} className="px-6 py-2.5 bg-[var(--color-primary)] text-black font-black text-xs uppercase rounded-xl hover:bg-yellow-500 transition-all shadow-lg flex items-center gap-2">
            <Plus className="w-4 h-4" /> Tambah Materi
          </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {filteredMaterials.map(m => (
            <div key={m.id} className="glass-card group rounded-2xl overflow-hidden border border-white/5 flex flex-col h-full hover:border-[var(--color-primary)]/30 transition-all transform hover:-translate-y-1">
               <div className="h-40 bg-black/40 relative overflow-hidden">
                  <img src={m.media_url || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=600"} className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-all duration-700" alt="" />
                  <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 rounded text-[9px] font-black uppercase text-white tracking-widest border border-white/10">{m.category}</div>
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditing(m); setFormData(m); setIsModalOpen(true); }} className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400"><Edit2 className="w-3 h-3" /></button>
                      <button onClick={() => deleteMaterial(m.id)} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-400"><Trash2 className="w-3 h-3" /></button>
                  </div>
               </div>
               <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-sm font-bold text-white uppercase tracking-tight mb-2 group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">{m.title}</h3>
                  <p className="text-xs text-white/50 mb-4 line-clamp-3 leading-relaxed">{m.description}</p>
                  <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                     <span className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-1"><Clock className="w-3 h-3" /> {m.duration}</span>
                     <span className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-widest">{m.age_group}</span>
                  </div>
               </div>
            </div>
          ))}
       </div>

       <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? "EDIT MATERI LATIHAN" : "TAMBAH MATERI LATIHAN"}>
          <form onSubmit={handleSubmit} className="space-y-4">
             <div>
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 block">Judul Materi</label>
                <input required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]" placeholder="Contoh: Passing Pendek Drill" />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 block">Kategori</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]">
                    {TRAINING_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 block">Kelompok Umur</label>
                  <select value={formData.age_group} onChange={(e) => setFormData({...formData, age_group: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]">
                    <option value="U10">U10</option>
                    <option value="U12">U12</option>
                    <option value="U15">U15</option>
                    <option value="U17">U17</option>
                    <option value="All">Semua Umur</option>
                  </select>
                </div>
             </div>
             <div>
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 block">Deskripsi Latihan</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full h-32 bg-black border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[var(--color-primary)] resize-none" placeholder="Jelaskan langkah-langkah drill..." />
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 block">Durasi</label>
                  <input value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]" placeholder="Contoh: 45 mnt" />
               </div>
               <div>
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 block">Level</label>
                  <input value={formData.level} onChange={(e) => setFormData({...formData, level: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]" placeholder="Beginner / Adv" />
               </div>
             </div>
             <div>
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 block">Thumbnail (Image/Video)</label>
                <div className="flex gap-4 items-center">
                   <div className="w-16 h-16 rounded-xl bg-black border border-white/10 overflow-hidden relative group">
                      {isUploading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                          <Loader2 className="w-4 h-4 text-[var(--color-primary)] animate-spin" />
                        </div>
                      )}
                      {formData.media_url ? (
                        <img src={formData.media_url} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/10"><ImageIcon className="w-6 h-6" /></div>
                      )}
                   </div>
                   <div className="flex-1 space-y-2">
                      <input value={formData.media_url} onChange={(e) => setFormData({...formData, media_url: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[var(--color-primary)]" placeholder="https:// atau upload..." />
                      <label className="block w-full py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-center cursor-pointer hover:bg-white/10 transition-colors uppercase tracking-widest">
                         Upload Media
                         <input type="file" accept="image/*,video/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                   </div>
                </div>
             </div>
             <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-sm font-bold text-white border border-white/10 rounded-xl hover:bg-white/5 uppercase">Batal</button>
                <button type="submit" className="flex-1 py-3 text-sm font-black text-black bg-[var(--color-primary)] rounded-xl hover:bg-yellow-500 uppercase tracking-widest">Simpan</button>
             </div>
          </form>
       </Modal>
    </div>
  );
}

// --- HELPER COMPONENTS ---

function TabButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
        active ? "bg-white/10 text-white shadow-lg" : "text-white/30 hover:text-white/60"
      )}
    >
      <Icon className={cn("w-4 h-4", active ? "text-[var(--color-primary)]" : "text-white/20")} />
      {label}
    </button>
  );
}

function ToolIconBtn({ active, onClick, icon: Icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all h-20",
        active ? "bg-[var(--color-primary)] text-black border-[var(--color-primary)] shadow-lg scale-105" : "bg-white/5 border-white/5 text-white/40 hover:text-white hover:bg-white/10"
      )}
    >
      <Icon className="w-5 h-5" />
      <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}

function StatusBtn({ icon, active, onClick, tip }: any) {
  return (
    <div className="relative group/tip">
      <button 
        onClick={onClick}
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center transition-all border",
          active ? "bg-white/10 border-white/20 scale-110" : "bg-black/20 border-white/5 opacity-40 hover:opacity-100"
        )}
      >
        {icon}
      </button>
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-[8px] rounded opacity-0 group-hover/tip:opacity-100 pointer-events-none whitespace-nowrap z-50">
        {tip}
      </div>
    </div>
  );
}

function BoardPath({ path }: { path: any, key?: any }) {
  if (!path || path.points.length < 2) return null;
  const d = path.points.map((p: any, i: number) => 
    (i === 0 ? 'M' : 'L') + ` ${p.x}% ${p.y}%`
  ).join(' ');

  if (path.tool === 'arrow') {
    return (
      <path 
        d={d} 
        fill="none" 
        stroke={path.color} 
        strokeWidth="3" 
        strokeDasharray="8,4" 
        markerEnd="url(#arrowhead)"
      />
    );
  }

  if (path.tool === 'circle') {
    return (
      <path 
        d={d} 
        fill={path.color} 
        fillOpacity="0.2"
        stroke={path.color} 
        strokeWidth="2" 
        strokeDasharray="4,4"
      />
    );
  }

  return (
    <path 
      d={d} 
      fill="none" 
      stroke={path.color} 
      strokeWidth="4" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
  );
}
