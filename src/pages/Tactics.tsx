import React, { useState, useRef, useEffect, MouseEvent } from 'react';
import Layout from '../components/ui/Layout';
import { motion, useDragControls } from 'motion/react';
import { 
  Shield, Target, Plus, Save, Activity, Crosshair, PenTool, MousePointer, 
  Eraser, Undo, Play, Users, Map, Move, Trello 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useCMSData } from '../lib/store';

// Extended formations
const FORMATIONS_LIST = [
  { id: '433', name: '4-3-3', type: '11v11', pos: [{x:50, y:90}, {x:20, y:70}, {x:40, y:75}, {x:60, y:75}, {x:80, y:70}, {x:50, y:55}, {x:30, y:45}, {x:70, y:45}, {x:20, y:20}, {x:80, y:20}, {x:50, y:15}] },
  { id: '442', name: '4-4-2', type: '11v11', pos: [{x:50, y:90}, {x:20, y:70}, {x:40, y:75}, {x:60, y:75}, {x:80, y:70}, {x:20, y:45}, {x:40, y:50}, {x:60, y:50}, {x:80, y:45}, {x:35, y:20}, {x:65, y:20}] },
  { id: '4231', name: '4-2-3-1', type: '11v11', pos: [{x:50, y:90}, {x:20, y:70}, {x:40, y:75}, {x:60, y:75}, {x:80, y:70}, {x:40, y:55}, {x:60, y:55}, {x:20, y:35}, {x:50, y:35}, {x:80, y:35}, {x:50, y:15}] },
  { id: '352', name: '3-5-2', type: '11v11', pos: [{x:50, y:90}, {x:30, y:75}, {x:50, y:75}, {x:70, y:75}, {x:15, y:50}, {x:35, y:55}, {x:50, y:45}, {x:65, y:55}, {x:85, y:50}, {x:35, y:20}, {x:65, y:20}] },
  { id: '4141', name: '4-1-4-1', type: '11v11', pos: [{x:50, y:90}, {x:20, y:70}, {x:40, y:75}, {x:60, y:75}, {x:80, y:70}, {x:50, y:60}, {x:20, y:40}, {x:40, y:45}, {x:60, y:45}, {x:80, y:40}, {x:50, y:15}] },
  { id: '343', name: '3-4-3', type: '11v11', pos: [{x:50, y:90}, {x:30, y:75}, {x:50, y:75}, {x:70, y:75}, {x:20, y:50}, {x:40, y:50}, {x:60, y:50}, {x:80, y:50}, {x:25, y:20}, {x:75, y:20}, {x:50, y:15}] },
  { id: '532', name: '5-3-2', type: '11v11', pos: [{x:50, y:90}, {x:15, y:70}, {x:30, y:75}, {x:50, y:75}, {x:70, y:75}, {x:85, y:70}, {x:30, y:45}, {x:50, y:50}, {x:70, y:45}, {x:35, y:20}, {x:65, y:20}] },
  { id: '22', name: '2-2 (Futsal)', type: '5v5', pos: [{x:50, y:90}, {x:30, y:65}, {x:70, y:65}, {x:30, y:35}, {x:70, y:35}] },
  { id: '121', name: '1-2-1 (Futsal)', type: '5v5', pos: [{x:50, y:90}, {x:50, y:70}, {x:20, y:45}, {x:80, y:45}, {x:50, y:20}] },
];

const STRATEGIES = ['Normal', 'High Press', 'Counter Attack', 'Possession', 'Defensive Block'];

export default function Tactics() {
  const [activeFormType, setActiveFormType] = useState('11v11');
  const availableFormations = FORMATIONS_LIST.filter(f => f.type === activeFormType);
  const [activeFormTemplate, setActiveFormTemplate] = useState(availableFormations[0]);
  const [activeStrat, setActiveStrat] = useState(STRATEGIES[0]);
  
  // Tactical Board State
  const boardRef = useRef<HTMLDivElement>(null);
  const [playerPositions, setPlayerPositions] = useState(availableFormations[0].pos);
  const [activeTool, setActiveTool] = useState('cursor');
  const [paths, setPaths] = useState<any[]>([]);
  const [currentPath, setCurrentPath] = useState<any>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);

  // Lineup State
  const { data: allPlayers } = useCMSData('players', [
     { id: 'p1', name: 'Bima Sakti', position: 'ST', overall: 98, stamina: 95 },
     { id: 'p2', name: 'Arhan Pratama', position: 'LB', overall: 95, stamina: 99 },
     { id: 'p3', name: 'Evan Dimas', position: 'CM', overall: 92, stamina: 85 }
  ]);

  // Handle Strategy Change effect on positions
  useEffect(() => {
    let modifierY = 0;
    if (activeStrat === 'High Press') modifierY = -15; // move up
    if (activeStrat === 'Defensive Block') modifierY = 15; // move down
    if (activeStrat === 'Normal' || activeStrat === 'Possession' || activeStrat === 'Counter Attack') modifierY = 0;

    const newPos = activeFormTemplate.pos.map((p, idx) => {
      if (idx === 0) return p; // GK stays mostly
      let ny = p.y + modifierY;
      // counter attack pushes forwards up
      if (activeStrat === 'Counter Attack' && p.y < 30) ny -= 10;
      // possession brings them closer to center
      if (activeStrat === 'Possession' && p.y < 30) ny += 10; 
      // Clamp bounds
      ny = Math.max(5, Math.min(95, ny));
      return { ...p, y: ny };
    });
    setPlayerPositions(newPos);
  }, [activeStrat, activeFormTemplate]);

  // Loading a specific formation
  const handleLoadFormation = (f: any) => {
    setActiveFormTemplate(f);
    setActiveStrat('Normal'); // reset strategy on formation change
    setPaths([]); // clear drawings
  };

  // Drawing Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (activeTool === 'cursor' || activeTool === 'eraser') return;
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCurrentPath({ points: [{x, y}], tool: activeTool });
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

  const clearDrawings = () => setPaths([]);
  const undoDrawing = () => setPaths(paths.slice(0, -1));

  // Player Drag
  const handleDragEnd = (index: number, info: any) => {
    if (!boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    // Convert px movement to percentage
    const dx = (info.offset.x / rect.width) * 100;
    const dy = (info.offset.y / rect.height) * 100;
    
    setPlayerPositions(prev => {
      const newPos = [...prev];
      newPos[index] = {
        x: Math.max(2, Math.min(98, newPos[index].x + dx)),
        y: Math.max(2, Math.min(98, newPos[index].y + dy))
      };
      return newPos;
    });
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6 pb-12 w-full max-w-[1800px] mx-auto animate-in fade-in duration-700 font-sans">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-display font-black text-white tracking-tight uppercase flex items-center gap-3">
              Tactical <span className="text-[var(--color-primary)]">Command Center</span>
              <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">PRO</span>
            </h1>
            <p className="text-sm text-white/50 mt-1 font-medium">
              Interact, Draw, Plan & Executing Match Strategies
            </p>
          </div>
          <div className="flex gap-2">
             <button className="flex items-center gap-2 px-4 py-2 bg-white/5 text-white font-bold text-sm rounded-xl hover:bg-white/10 transition-all border border-white/10">
               <Map className="w-4 h-4" /> Load Preset
             </button>
             <button className="flex items-center gap-2 px-6 py-2.5 bg-[var(--color-primary)] text-black font-bold text-sm rounded-xl hover:bg-yellow-500 transition-all shadow-[0_0_15px_var(--color-primary-glow)]">
               <Save className="w-4 h-4" /> Save Tactical Plan
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LIFT SIDEBAR - Tools & Board Options */}
          <div className="lg:col-span-3 xl:col-span-2 flex flex-col gap-4">
            
            <div className="bg-[#111827] border border-white/10 rounded-2xl p-5">
              <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">Board Tools</h3>
              <div className="grid grid-cols-2 gap-2">
                 <ToolBtn icon={MousePointer} label="Cursor" active={activeTool === 'cursor'} onClick={() => setActiveTool('cursor')} />
                 <ToolBtn icon={PenTool} label="Pen" active={activeTool === 'pen'} onClick={() => setActiveTool('pen')} />
                 <ToolBtn icon={Move} label="Move Line" active={activeTool === 'arrow'} onClick={() => setActiveTool('arrow')} />
              </div>
              <div className="flex gap-2 mt-2">
                 <button onClick={undoDrawing} className="flex-1 py-2 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg text-white/60 transition-colors border border-white/5"><Undo className="w-4 h-4" /></button>
                 <button onClick={clearDrawings} className="flex-1 py-2 flex items-center justify-center bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-white/60 transition-colors border border-white/5"><Eraser className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="bg-[#111827] border border-white/10 rounded-2xl p-5">
              <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">Formation Type</h3>
              <div className="flex bg-black/40 rounded-lg p-1 border border-white/5 mb-4">
                 <button onClick={() => setActiveFormType('11v11')} className={cn("flex-1 py-1.5 text-xs font-bold rounded-md transition-all", activeFormType === '11v11' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70')}>11v11</button>
                 <button onClick={() => setActiveFormType('5v5')} className={cn("flex-1 py-1.5 text-xs font-bold rounded-md transition-all", activeFormType === '5v5' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70')}>5v5 / Mini</button>
              </div>
              
              <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Presets</h3>
              <div className="grid grid-cols-2 gap-2">
                {availableFormations.map(f => (
                  <button 
                    key={f.id}
                    onClick={() => handleLoadFormation(f)}
                    className={cn(
                      "py-2 px-2 rounded-lg border text-xs font-bold transition-all text-center",
                      activeFormTemplate.id === f.id 
                        ? "bg-[var(--color-primary)] text-black border-[var(--color-primary)]" 
                        : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* MAIN TACTICAL PITCH */}
          <div className="lg:col-span-6 xl:col-span-7 bg-[#111827] border border-white/10 rounded-3xl p-6 relative flex items-center justify-center min-h-[600px] xl:min-h-[800px] shadow-2xl">
            {/* Action Overlay Top */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {STRATEGIES.map((strat) => (
                <button
                  key={strat}
                  onClick={() => setActiveStrat(strat)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border",
                    activeStrat === strat ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]" : "bg-black/50 text-white/50 border-white/10 hover:border-white/30 hover:text-white backdrop-blur-sm"
                  )}
                >
                  {strat}
                </button>
              ))}
            </div>

            {/* AI Advisor Bubble */}
            <div className="absolute top-8 right-8 z-20 bg-amber-500/10 border border-amber-500/20 backdrop-blur-md p-3 rounded-2xl max-w-[200px] hidden xl:block shadow-lg">
               <p className="text-[10px] font-black uppercase text-amber-500 flex items-center gap-1 mb-1"><Target className="w-3 h-3" /> AI Insight</p>
               <p className="text-xs text-amber-100/70 font-medium">Lawan cenderung bermain lebar. <span className="text-amber-400">4-3-3</span> dengan fullback overlap direkomendasikan.</p>
            </div>

            {/* Field Background Container */}
            <div 
              ref={boardRef}
              className={cn(
                "w-full max-w-[600px] h-full max-h-[85vh] aspect-[2/3] rounded-xl border-2 border-white/30 bg-[#1e3b2b] shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden touch-none",
                activeTool !== 'cursor' ? 'cursor-crosshair' : 'cursor-default'
              )}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              style={{ touchAction: 'none' }}
            >
               {/* Grass Pattern */}
               <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 10%, #fff 10%, #fff 20%)' }} />
               <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)] pointer-events-none" />

               {/* Pitch Markings */}
               {/* Center Line & Circle */}
               <div className="absolute top-1/2 left-0 right-0 h-0 border-t-2 border-white/40 -translate-y-1/2" />
               <div className="absolute top-1/2 left-1/2 w-[30%] aspect-square border-2 border-white/40 rounded-full -translate-x-1/2 -translate-y-1/2" />
               <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-white/40 rounded-full -translate-x-1/2 -translate-y-1/2" />
               
               {/* Box Areas Top */}
               <div className="absolute top-0 left-1/2 w-[55%] aspect-[2/1] border-2 border-t-0 border-white/40 -translate-x-1/2" />
               <div className="absolute top-0 left-1/2 w-[25%] aspect-[2/1] border-2 border-t-0 border-white/40 -translate-x-1/2" />
               <div className="absolute top-[12%] left-1/2 w-2 h-2 bg-white/40 rounded-full -translate-x-1/2" />
               <div className="absolute top-[20%] left-1/2 w-[20%] h-[15%] border-b-2 border-white/40 border-r-2 border-l-2 rounded-b-full -translate-x-1/2" style={{ clipPath: 'polygon(0 50%, 100% 50%, 100% 100%, 0 100%)' }} />

               {/* Box Areas Bottom */}
               <div className="absolute bottom-0 left-1/2 w-[55%] aspect-[2/1] border-2 border-b-0 border-white/40 -translate-x-1/2" />
               <div className="absolute bottom-0 left-1/2 w-[25%] aspect-[2/1] border-2 border-b-0 border-white/40 -translate-x-1/2" />
               <div className="absolute bottom-[12%] left-1/2 w-2 h-2 bg-white/40 rounded-full -translate-x-1/2" />
               <div className="absolute bottom-[20%] left-1/2 w-[20%] h-[15%] border-t-2 border-white/40 border-r-2 border-l-2 rounded-t-full -translate-x-1/2" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)' }} />

               {/* Drawing Canvas Overlay */}
               <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                 {paths.map((path, i) => (
                   <DrawPath key={i} path={path} />
                 ))}
                 {currentPath && <DrawPath path={currentPath} />}
               </svg>

               {/* Players Layer */}
               <div className="absolute inset-0 z-20 pointer-events-none">
                 {playerPositions.map((pos, idx) => (
                   <motion.div
                     key={`p-${idx}`}
                     className="absolute"
                     initial={false}
                     animate={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                     transition={{ type: "spring", stiffness: 300, damping: 25 }}
                     style={{ x: '-50%', y: '-50%' }}
                   >
                     {/* Draggable handle */}
                     <motion.div 
                       drag={activeTool === 'cursor'}
                       dragConstraints={boardRef}
                       dragElastic={0}
                       dragMomentum={false}
                       onDragEnd={(_, info) => handleDragEnd(idx, info)}
                       onClick={() => setSelectedPlayer(idx)}
                       whileHover={{ scale: 1.1 }}
                       whileDrag={{ scale: 1.2, zIndex: 100 }}
                       className={cn(
                         "w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white shadow-[0_5px_15px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center font-bold text-xs md:text-sm cursor-grab active:cursor-grabbing text-black font-display pointer-events-auto relative group",
                         idx === 0 ? 'bg-amber-500' : 'bg-red-500 text-white',
                         selectedPlayer === idx ? 'ring-4 ring-white/50' : ''
                       )}
                     >
                       {/* Drop shadow realistic */}
                       <div className="absolute -bottom-2 w-3/4 h-2 bg-black/40 blur-sm rounded-[100%] z-[-1]" />
                       
                       <span className="leading-none drop-shadow-md">{idx===0 ? '1' : idx+1}</span>
                       
                       <div className={cn(
                         "absolute -bottom-6 bg-black/80 text-white text-[9px] px-2 py-0.5 rounded backdrop-blur whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-white/20",
                         selectedPlayer === idx ? 'opacity-100' : ''
                       )}>
                          {idx === 0 ? 'GK' : `Player ${idx+1}`}
                       </div>
                     </motion.div>
                   </motion.div>
                 ))}
               </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR - Line Up & Squad */}
          <div className="lg:col-span-3 xl:col-span-3 flex flex-col gap-4">
             <div className="bg-[#111827] border border-white/10 rounded-2xl p-5 flex flex-col h-full min-h-[600px]">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2"><Users className="w-4 h-4 text-[var(--color-primary)]" /> Match Squad</h3>
                  <span className="text-[10px] font-black bg-white/10 px-2 py-1 rounded text-white">{playerPositions.length} / {activeFormType === '11v11' ? '11' : '5'}</span>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                   <div>
                     <h4 className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-3">Starting Lineup</h4>
                     <div className="space-y-2">
                       {playerPositions.map((_, i) => (
                         <div key={i} onClick={() => setSelectedPlayer(i)} className={cn(
                           "flex gap-3 items-center p-2 rounded-xl border border-transparent hover:bg-white/5 cursor-pointer transition-colors",
                           selectedPlayer === i ? "bg-white/10 border-white/20" : ""
                         )}>
                           <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0", i===0 ? 'bg-amber-500 text-black' : 'bg-red-500 text-white')}>
                             {i===0 ? '1' : i+1}
                           </div>
                           <div className="flex-1">
                             <p className="text-sm font-bold text-white leading-none">Pemain #{i+1}</p>
                             <p className="text-[10px] text-white/50">{i===0 ? 'Goalkeeper' : 'Outfield'}</p>
                           </div>
                           {/* Simulate real data for first few */}
                           {i < allPlayers.length && (
                             <div className="text-right">
                               <p className="text-xs font-black text-[var(--color-primary)]">{allPlayers[i].overall}</p>
                             </div>
                           )}
                         </div>
                       ))}
                     </div>
                   </div>

                   <div className="mt-6 pt-4 border-t border-white/10">
                      <h4 className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-3 flex justify-between items-center">
                        Substitutes
                        <button className="text-[var(--color-primary)] hover:text-yellow-400">+ Add</button>
                      </h4>
                      <div className="text-center p-6 border-2 border-dashed border-white/5 rounded-xl text-white/30 text-xs font-bold">
                        Drag pemain kesini untuk cadangan
                      </div>
                   </div>
                </div>

                {selectedPlayer !== null && (
                  <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-[var(--color-primary)]/10 to-transparent border border-[var(--color-primary)]/20 animate-in slide-in-from-bottom-5">
                     <p className="text-[10px] font-black uppercase text-[var(--color-primary)] tracking-widest mb-1">Selected Player Details</p>
                     <p className="text-white font-bold text-sm">Nomor Punggung #{selectedPlayer+1}</p>
                     <div className="flex gap-4 mt-3">
                       <div>
                         <span className="text-[10px] text-white/40 uppercase block">Stamina</span>
                         <span className="text-emerald-400 font-black">95%</span>
                       </div>
                       <div>
                         <span className="text-[10px] text-white/40 uppercase block">Role</span>
                         <span className="text-white font-black">{selectedPlayer === 0 ? 'Goalkeeper' : 'Outfield'}</span>
                       </div>
                     </div>
                     <button className="w-full mt-4 py-2 border border-white/10 hover:bg-white/5 rounded-lg text-xs font-bold text-white transition-colors">Ganti Pemain</button>
                  </div>
                )}
             </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}

// Tool Component
const ToolBtn = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={cn(
      "py-2 flex flex-col items-center justify-center gap-1 rounded-lg transition-all border",
      active ? "bg-[var(--color-primary)] text-black border-[var(--color-primary)] shadow-[0_0_10px_var(--color-primary-glow)]" : "bg-white/5 text-white/60 border-white/5 hover:bg-white/10 hover:text-white"
    )}
  >
    <Icon className="w-4 h-4" />
    <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
  </button>
);

// SVG Drawing Path Component
const DrawPath: React.FC<{ path: any }> = ({ path }) => {
  if (!path || path.points.length < 2) return null;
  const d = path.points.map((p: any, i: number) => 
    (i === 0 ? 'M' : 'L') + ` ${p.x}% ${p.y}%`
  ).join(' ');

  if (path.tool === 'arrow') {
    // draw a line with arrow head (approximated with marker or just line)
    // for simplicity here, just a dashed line
    return (
      <path 
        d={d} 
        fill="none" 
        stroke="var(--color-primary)" 
        strokeWidth="3" 
        strokeDasharray="5,5" 
        markerEnd="url(#arrowhead)"
      />
    );
  }

  return (
    <path 
      d={d} 
      fill="none" 
      stroke={path.tool === 'pen' ? 'white' : 'var(--color-primary)'} 
      strokeWidth={path.tool === 'pen' ? "4" : "6"} 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      opacity={path.tool === 'highlight' ? 0.4 : 1}
      filter={path.tool === 'highlight' ? 'blur(2px)' : 'none'}
    />
  );
}

