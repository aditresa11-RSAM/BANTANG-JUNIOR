import React, { useState, useRef, useEffect, useCallback } from 'react';
import Layout from '../components/ui/Layout';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'motion/react';
import { 
  Plus, PenTool, MousePointer, Eraser, Undo, Redo, Trash2, 
  Settings, Share2, Download, Save, Layers, Circle, ArrowRight,
  Maximize2, Minimize2, Goal, Map, Zap, Shield, Target, Activity,
  ChevronDown, Type, History, Play, Check, Cloud, X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useCMSData } from '../lib/store';

// --- CONSTANTS ---

const FIELD_MODES = [
  { id: '7v7', name: '7 vs 7', players: 7 },
  { id: '9v9', name: '9 vs 9', players: 9 },
  { id: '11v11', name: '11 vs 11', players: 11 },
];

const FORMATIONS: Record<string, any[]> = {
  '7v7': [
    { id: '2-3-1', name: '2-3-1', pos: [{x:50, y:90, role:'GK'}, {x:30, y:75, role:'DEF'}, {x:70, y:75, role:'DEF'}, {x:20, y:45, role:'MID'}, {x:50, y:50, role:'MID'}, {x:80, y:45, role:'MID'}, {x:50, y:20, role:'FWD'}] },
    { id: '3-2-1', name: '3-2-1', pos: [{x:50, y:90, role:'GK'}, {x:20, y:75, role:'DEF'}, {x:50, y:75, role:'DEF'}, {x:80, y:75, role:'DEF'}, {x:35, y:45, role:'MID'}, {x:65, y:45, role:'MID'}, {x:50, y:20, role:'FWD'}] },
    { id: '3-1-2', name: '3-1-2', pos: [{x:50, y:90, role:'GK'}, {x:20, y:75, role:'DEF'}, {x:50, y:75, role:'DEF'}, {x:80, y:75, role:'DEF'}, {x:50, y:50, role:'MID'}, {x:35, y:25, role:'FWD'}, {x:65, y:25, role:'FWD'}] },
    { id: '2-2-2', name: '2-2-2', pos: [{x:50, y:90, role:'GK'}, {x:30, y:75, role:'DEF'}, {x:70, y:75, role:'DEF'}, {x:30, y:45, role:'MID'}, {x:70, y:45, role:'MID'}, {x:35, y:25, role:'FWD'}, {x:65, y:25, role:'FWD'}] },
  ],
  '9v9': [
    { id: '3-3-2', name: '3-3-2', pos: [{x:50, y:90, role:'GK'}, {x:20, y:75, role:'DEF'}, {x:50, y:75, role:'DEF'}, {x:80, y:75, role:'DEF'}, {x:20, y:50, role:'MID'}, {x:50, y:50, role:'MID'}, {x:80, y:50, role:'MID'}, {x:35, y:25, role:'FWD'}, {x:65, y:25, role:'FWD'}] },
    { id: '3-2-3', name: '3-2-3', pos: [{x:50, y:90, role:'GK'}, {x:20, y:75, role:'DEF'}, {x:50, y:75, role:'DEF'}, {x:80, y:75, role:'DEF'}, {x:35, y:50, role:'MID'}, {x:65, y:50, role:'MID'}, {x:20, y:25, role:'FWD'}, {x:50, y:25, role:'FWD'}, {x:80, y:25, role:'FWD'}] },
    { id: '4-3-1', name: '4-3-1', pos: [{x:50, y:90, role:'GK'}, {x:20, y:75, role:'DEF'}, {x:40, y:75, role:'DEF'}, {x:60, y:75, role:'DEF'}, {x:80, y:75, role:'DEF'}, {x:20, y:45, role:'MID'}, {x:50, y:45, role:'MID'}, {x:80, y:45, role:'MID'}, {x:50, y:20, role:'FWD'}] },
    { id: '2-4-2', name: '2-4-2', pos: [{x:50, y:90, role:'GK'}, {x:35, y:75, role:'DEF'}, {x:65, y:75, role:'DEF'}, {x:20, y:50, role:'MID'}, {x:40, y:50, role:'MID'}, {x:60, y:50, role:'MID'}, {x:80, y:50, role:'MID'}, {x:35, y:25, role:'FWD'}, {x:65, y:25, role:'FWD'}] },
  ],
  '11v11': [
    { id: '4-3-3', name: '4-3-3', pos: [{x:50, y:90, role:'GK'}, {x:20, y:70, role:'DEF'}, {x:40, y:75, role:'DEF'}, {x:60, y:75, role:'DEF'}, {x:80, y:70, role:'DEF'}, {x:50, y:55, role:'MID'}, {x:30, y:45, role:'MID'}, {x:70, y:45, role:'MID'}, {x:20, y:20, role:'FWD'}, {x:50, y:12, role:'FWD'}, {x:80, y:20, role:'FWD'}] },
    { id: '4-4-2', name: '4-4-2', pos: [{x:50, y:90, role:'GK'}, {x:20, y:70, role:'DEF'}, {x:40, y:75, role:'DEF'}, {x:60, y:75, role:'DEF'}, {x:80, y:70, role:'DEF'}, {x:20, y:45, role:'MID'}, {x:40, y:50, role:'MID'}, {x:60, y:50, role:'MID'}, {x:80, y:45, role:'MID'}, {x:35, y:20, role:'FWD'}, {x:65, y:20, role:'FWD'}] },
    { id: '4-2-3-1', name: '4-2-3-1', pos: [{x:50, y:90, role:'GK'}, {x:20, y:70, role:'DEF'}, {x:40, y:75, role:'DEF'}, {x:60, y:75, role:'DEF'}, {x:80, y:70, role:'DEF'}, {x:40, y:55, role:'MID'}, {x:60, y:55, role:'MID'}, {x:20, y:35, role:'MID'}, {x:50, y:35, role:'MID'}, {x:80, y:35, role:'MID'}, {x:50, y:12, role:'FWD'}] },
    { id: '3-5-2', name: '3-5-2', pos: [{x:50, y:90, role:'GK'}, {x:30, y:75, role:'DEF'}, {x:50, y:75, role:'DEF'}, {x:70, y:75, role:'DEF'}, {x:20, y:50, role:'MID'}, {x:35, y:45, role:'MID'}, {x:50, y:55, role:'MID'}, {x:65, y:45, role:'MID'}, {x:80, y:50, role:'MID'}, {x:35, y:20, role:'FWD'}, {x:65, y:20, role:'FWD'}] },
    { id: '5-3-2', name: '5-3-2', pos: [{x:50, y:90, role:'GK'}, {x:20, y:70, role:'DEF'}, {x:35, y:75, role:'DEF'}, {x:50, y:75, role:'DEF'}, {x:65, y:75, role:'DEF'}, {x:80, y:70, role:'DEF'}, {x:30, y:45, role:'MID'}, {x:50, y:45, role:'MID'}, {x:70, y:45, role:'MID'}, {x:35, y:20, role:'FWD'}, {x:65, y:20, role:'FWD'}] },
    { id: '3-4-3', name: '3-4-3', pos: [{x:50, y:90, role:'GK'}, {x:30, y:75, role:'DEF'}, {x:50, y:75, role:'DEF'}, {x:70, y:75, role:'DEF'}, {x:20, y:50, role:'MID'}, {x:40, y:50, role:'MID'}, {x:60, y:50, role:'MID'}, {x:80, y:50, role:'MID'}, {x:20, y:20, role:'FWD'}, {x:50, y:20, role:'FWD'}, {x:80, y:20, role:'FWD'}] },
    { id: '4-1-4-1', name: '4-1-4-1', pos: [{x:50, y:90, role:'GK'}, {x:20, y:70, role:'DEF'}, {x:40, y:75, role:'DEF'}, {x:60, y:75, role:'DEF'}, {x:80, y:70, role:'DEF'}, {x:50, y:60, role:'MID'}, {x:20, y:40, role:'MID'}, {x:40, y:40, role:'MID'}, {x:60, y:40, role:'MID'}, {x:80, y:40, role:'MID'}, {x:50, y:15, role:'FWD'}] },
  ]
};

const STRATEGY_PLANS = [
  { id: 'High Press', name: 'High Press', icon: Zap, color: 'from-amber-400 to-orange-500' },
  { id: 'Counter Attack', name: 'Counter Attack', icon: Activity, color: 'from-blue-400 to-indigo-500' },
  { id: 'Possession', name: 'Possession', icon: Target, color: 'from-emerald-400 to-teal-500' },
  { id: 'Defensive Block', name: 'Defensive Block', icon: Shield, color: 'from-red-400 to-rose-500' }
];

const COLORS = [
  { id: 'white', value: '#ffffff' },
  { id: 'yellow', value: '#fbbf24' },
  { id: 'red', value: '#ef4444' },
  { id: 'blue', value: '#3b82f6' },
  { id: 'green', value: '#10b981' },
];

export default function Tactics() {
  const [boardMode, setBoardMode] = useState('11v11');
  const [formation, setFormation] = useState(FORMATIONS[boardMode][0]);
  const [strategy, setStrategy] = useState('High Press');
  const [activeTool, setActiveTool] = useState<'cursor' | 'pen' | 'arrow' | 'circle' | 'eraser'>('cursor');
  const [toolColor, setToolColor] = useState('#ffffff');
  const [toolSize, setToolSize] = useState(4);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  
  const boardRef = useRef<HTMLDivElement>(null);
  const activePathRef = useRef<SVGPathElement>(null);
  const drawingRef = useRef<{ points: {x:number, y:number}[], tool: string, color: string, size: number } | null>(null);

  const [positions, setPositions] = useState(formation.pos);
  const [paths, setPaths] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPlayerSelect, setShowPlayerSelect] = useState<number | null>(null);

  const [showNames, setShowNames] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

  const { data: savedTactics, addItems: syncTactics } = useCMSData('tactics', []);
  const { data: players } = useCMSData('players', []);

  // Sync positions when formation changes
  useEffect(() => {
    // Reset positions but keep previously assigned players if they fit?
    // For simplicity, we just keep the positions and map over them.
    setPositions(formation.pos.map((p: any) => ({...p, playerId: null})));
    setPaths([]);
  }, [formation]);

  // Handle Auto-save
  const autoSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await syncTactics({
        name: `Tactic ${new Date().toLocaleTimeString()}`,
        mode: boardMode,
        formation_id: formation.id,
        strategy,
        positions,
        paths,
        is_template: false
      });
      setLastSaved(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Auto-save failed:", err);
    } finally {
      setIsSaving(false);
    }
  }, [boardMode, formation, strategy, positions, paths, syncTactics]);

  // Debounce autosave
  useEffect(() => {
    const timer = setTimeout(() => {
      if (paths.length > 0 || positions !== formation.pos) {
        autoSave();
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [positions, paths, autoSave]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activeTool === 'cursor') return;
    e.currentTarget.setPointerCapture(e.pointerId);
    e.stopPropagation();
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    drawingRef.current = { points: [{x, y}], tool: activeTool, color: toolColor, size: toolSize };
    
    if (activePathRef.current) {
        const pathEl = activePathRef.current;
        const d = `M ${x} ${y}`;
        pathEl.setAttribute('d', d);
        pathEl.setAttribute('stroke', activeTool === 'eraser' ? '#123e20' : toolColor);
        pathEl.setAttribute('stroke-width', String((activeTool === 'eraser' ? (toolSize * 3) : toolSize) / 4));
        
        if (activeTool === 'arrow') {
           pathEl.setAttribute('stroke-dasharray', '8,4');
           pathEl.setAttribute('marker-end', 'url(#arrowhead)');
           pathEl.removeAttribute('fill');
        } else if (activeTool === 'circle') {
           pathEl.setAttribute('stroke-dasharray', '4,4');
           pathEl.setAttribute('fill', toolColor);
           pathEl.setAttribute('fill-opacity', '0.1');
           pathEl.removeAttribute('marker-end');
        } else {
           pathEl.removeAttribute('stroke-dasharray');
           pathEl.removeAttribute('marker-end');
           pathEl.removeAttribute('fill');
           if (activeTool === 'eraser') {
             pathEl.setAttribute('class', 'mix-blend-normal');
           } else {
             pathEl.removeAttribute('class');
           }
        }
        pathEl.style.display = 'block';
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drawingRef.current) return;
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    drawingRef.current.points.push({x, y});
    
    if (activePathRef.current) {
        const d = activePathRef.current.getAttribute('d') || '';
        activePathRef.current.setAttribute('d', d + ` L ${x} ${y}`);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (drawingRef.current) {
      setPaths(prev => [...prev, drawingRef.current!]);
      drawingRef.current = null;
      setRedoStack([]);
    }
    if (activePathRef.current) {
      activePathRef.current.style.display = 'none';
      activePathRef.current.setAttribute('d', '');
    }
  };

  const handleUndo = () => {
    if (paths.length === 0) return;
    const last = paths[paths.length - 1];
    setRedoStack([...redoStack, last]);
    setPaths(paths.slice(0, -1));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const last = redoStack[redoStack.length - 1];
    setPaths([...paths, last]);
    setRedoStack(redoStack.slice(0, -1));
  };

  const updatePosition = (index: number, x: number, y: number) => {
    setPositions(prev => {
      const next = [...prev];
      next[index] = { ...next[index], x, y };
      return next;
    });
  };

  const assignPlayer = (index: number, playerId: string | null) => {
    setPositions(prev => {
      const next = [...prev];
      // if assigning a player, ensure they are not elsewhere
      if (playerId) {
        for (let i = 0; i < next.length; i++) {
          if (next[i].playerId === playerId) {
            next[i].playerId = null;
          }
        }
      }
      next[index].playerId = playerId;
      return next;
    });
  };

  return (
    <Layout>
      <div className="w-full max-w-[1600px] mx-auto pb-20 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-1000">
        
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 mt-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-display font-black text-white tracking-tighter uppercase flex items-center gap-4">
              Tactical <span className="text-[var(--color-primary)]">Command Center</span>
            </h1>
            <div className="flex items-center gap-4">
              <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.4em] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
                Live Strategy Engine v3.0
              </p>
              {lastSaved && (
                <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest flex items-center gap-1">
                  <Cloud className="w-3 h-3" /> Tersimpan {lastSaved}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
             <button 
                onClick={() => setIsSimulating(!isSimulating)}
                className={cn(
                  "flex-1 lg:flex-none py-3.5 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                  isSimulating 
                    ? "bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]" 
                    : "bg-white/5 border border-white/10 text-white/60 hover:text-white"
                )}
             >
                <Activity className="w-4 h-4" /> {isSimulating ? 'Stop SImulation' : 'Simulate Match'}
             </button>
             <button 
                onClick={autoSave}
                disabled={isSaving}
                className="flex-1 lg:flex-none py-3.5 px-8 bg-[var(--color-primary)] text-black rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(250,204,21,0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
             >
                {isSaving ? <Plus className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? 'Saving...' : 'Save Strategy'}
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          
          {/* PITCH AREA - LEFT */}
          <div className={cn("xl:col-span-8 flex flex-col items-center", isFullscreen ? "" : "relative")}>
            <div className={cn(
               "group/board perspective-1000",
               isFullscreen ? "fixed inset-0 z-[100] bg-[var(--color-surface)] flex flex-col items-center justify-center p-4 pb-28 md:p-10 md:pb-32" : "relative w-full max-w-[650px] aspect-[2/3]"
            )}>
              
              {/* FIELD CONTAINER */}
              <motion.div 
                ref={boardRef}
                initial={{ rotateX: 20 }}
                animate={{ rotateX: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                style={isFullscreen ? { aspectRatio: '2/3', maxWidth: '100%', maxHeight: '85vh' } : {}}
                className={cn(
                  "bg-[#123e20] relative overflow-hidden touch-none select-none ring-1 ring-white/10 w-full",
                  isFullscreen ? "h-auto border-[6px] md:border-[12px] border-white/5 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl" : "h-full border-[12px] border-white/5 rounded-[3.5rem] shadow-[0_100px_150px_rgba(0,0,0,0.7)]",
                  activeTool !== 'cursor' ? 'cursor-crosshair' : 'cursor-default'
                )}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              >
                {/* Grass Texturing */}
                <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, #fff 40px, #fff 80px)' }} />
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                
                {/* Zone Lines */}
                <div className="absolute top-1/3 left-[4%] right-[4%] h-[1px] bg-white/10 mix-blend-overlay border-none border-t border-dashed" />
                <div className="absolute top-2/3 left-[4%] right-[4%] h-[1px] bg-white/10 mix-blend-overlay border-none border-t border-dashed" />
                <div className="absolute top-[16.5%] left-[2%] text-[8px] font-black uppercase text-white/10 tracking-[0.4em] rotate-[-90deg] origin-left mix-blend-overlay">Attack</div>
                <div className="absolute top-[50%] left-[2%] text-[8px] font-black uppercase text-white/10 tracking-[0.4em] rotate-[-90deg] origin-left mix-blend-overlay -translate-y-1/2">Midfield</div>
                <div className="absolute top-[83.5%] left-[2%] text-[8px] font-black uppercase text-white/10 tracking-[0.4em] rotate-[-90deg] origin-left mix-blend-overlay">Defense</div>
                
                {/* Field Markings */}
                <div className="absolute inset-x-[4%] inset-y-[3%] border-[3px] border-white/15" />
                <div className="absolute left-[4%] right-[4%] top-1/2 h-0 border-t-[3px] border-white/15 -translate-y-1/2" />
                <div className="absolute top-1/2 left-1/2 w-[35%] aspect-square border-[3px] border-white/15 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-white/20 rounded-full -translate-x-1/2 -translate-y-1/2" />
                
                {/* Detailed Boxes */}
                <div className="absolute top-[3%] left-1/2 -translate-x-1/2 w-[50%] h-[16%] border-[3px] border-white/15" />
                <div className="absolute bottom-[3%] left-1/2 -translate-x-1/2 w-[50%] h-[16%] border-[3px] border-white/15" />
                <div className="absolute top-[3%] left-1/2 -translate-x-1/2 w-[22%] h-[6%] border-[3px] border-white/15" />
                <div className="absolute bottom-[3%] left-1/2 -translate-x-1/2 w-[22%] h-[6%] border-[3px] border-white/15" />

                {/* Drawing Layer - SVG */}
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none z-10 filter-drop-shadow">
                  <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orientation="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill={toolColor} />
                    </marker>
                  </defs>
                  {paths.map((p, i) => <BoardPath key={i} path={p} />)}
                  <path 
                    ref={activePathRef} 
                    fill="none" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    style={{display: 'none', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'}} 
                  />
                </svg>

                {/* Player Drag Layer */}
                <div className="absolute inset-0 p-[4%] z-20 pointer-events-none">
                  <AnimatePresence mode="popLayout">
                    {positions.map((pos, i) => {
                      const assignedPlayer = pos.playerId ? players?.find((p: any) => p.id === pos.playerId) : null;
                      return (
                        <PlayerIcon 
                          key={`${boardMode}-${i}`}
                          idx={i}
                          x={pos.x}
                          y={pos.y}
                          role={pos.role}
                          isGK={i === 0 || pos.role === 'GK'}
                          active={selectedIdx === i}
                          onSelect={() => setSelectedIdx(i)}
                          onUpdate={(nx, ny) => updatePosition(i, nx, ny)}
                          onAssign={(pid) => assignPlayer(i, pid)}
                          playerId={pos.playerId}
                          player={assignedPlayer}
                          disabled={activeTool !== 'cursor'}
                          boardRef={boardRef}
                          showNames={showNames}
                          isSimulating={isSimulating}
                        />
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* Corner Flags */}
                <div className="absolute top-[3%] left-[4%] w-4 h-4 border-l-2 border-t-2 border-white/20" />
                <div className="absolute top-[3%] right-[4%] w-4 h-4 border-r-2 border-t-2 border-white/20" />
                <div className="absolute bottom-[3%] left-[4%] w-4 h-4 border-l-2 border-b-2 border-white/20" />
                <div className="absolute bottom-[3%] right-[4%] w-4 h-4 border-r-2 border-b-2 border-white/20" />
              </motion.div>

              {/* FLOATING GLASS TOOLBAR */}
              <div className={cn("absolute left-1/2 -translate-x-1/2 w-max max-w-[95vw] md:max-w-none bg-surface/40 backdrop-blur-3xl border border-white/10 p-2 sm:p-2.5 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-[0_25px_50px_rgba(0,0,0,0.5)] z-50 flex flex-wrap sm:flex-nowrap items-center justify-center gap-1 sm:gap-2 ring-1 ring-white/5", isFullscreen ? "bottom-4 md:bottom-8 lg:bottom-12" : "-bottom-20 sm:-bottom-8")}>
                 <ToolBtn icon={MousePointer} active={activeTool === 'cursor'} onClick={() => setActiveTool('cursor')} label="MOVE" />
                 <div className="w-px h-8 bg-white/10 mx-1" />
                 <ToolBtn icon={PenTool} active={activeTool === 'pen'} onClick={() => setActiveTool('pen')} label="DRAW" />
                 <ToolBtn icon={ArrowRight} active={activeTool === 'arrow'} onClick={() => setActiveTool('arrow')} label="PASS" />
                 <ToolBtn icon={Circle} active={activeTool === 'circle'} onClick={() => setActiveTool('circle')} label="ZONE" />
                 <ToolBtn icon={Eraser} active={activeTool === 'eraser'} onClick={() => setActiveTool('eraser')} label="ERASE" />
                 <div className="w-px h-8 bg-white/10 mx-1 hidden sm:block" />
                 <ToolBtn icon={Type} active={showNames} onClick={() => setShowNames(!showNames)} label="NAMES" className={showNames ? "text-[var(--color-primary)]" : ""} />
                 <div className="w-px h-8 bg-white/10 mx-1 hidden sm:block" />
                 <div className="hidden sm:flex flex-col items-center gap-1 ml-2">
                    <div className="flex gap-1">
                      {COLORS.map(c => (
                        <button 
                          key={c.id} 
                          onClick={() => setToolColor(c.value)} 
                          className={cn(
                            "w-4 h-4 rounded-full border transition-all", 
                            toolColor === c.value ? "border-white scale-125 shadow-lg" : "border-transparent opacity-40 hover:opacity-100"
                          )} 
                          style={{ backgroundColor: c.value }} 
                        />
                      ))}
                    </div>
                    <div className="flex gap-1 mt-1">
                      {[2, 4, 8].map(s => (
                        <button key={s} onClick={() => setToolSize(s)} className={cn("w-4 h-px border-t transition-all", toolSize === s ? "border-white opacity-100" : "border-white/20")} style={{ borderTopWidth: s + 'px' }} />
                      ))}
                    </div>
                 </div>
                 <div className="w-px h-8 bg-white/10 mx-2 hidden sm:block" />
                 <ToolBtn icon={Undo} onClick={handleUndo} className="opacity-40 hover:opacity-100" />
                 <ToolBtn icon={Trash2} onClick={() => setPaths([])} className="text-red-400 opacity-40 hover:opacity-100" />
                 <div className="w-px h-8 bg-white/10 mx-1" />
                 <ToolBtn 
                    icon={isFullscreen ? Minimize2 : Maximize2} 
                    onClick={() => setIsFullscreen(!isFullscreen)} 
                    label="FULL" 
                    className="text-[var(--color-primary)] bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)] hover:text-black"
                 />
              </div>
            </div>
          </div>

          {/* SIDEBAR CONTROLS - RIGHT */}
          <div className="xl:col-span-4 space-y-6">
            
            {/* SETUP PANEL */}
            <div className="glass-card p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-white/5 bg-surface/30 space-y-6 md:space-y-8">
               <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/5 rounded-2xl"><Settings className="w-5 h-5 text-[var(--color-primary)]" /></div>
                  <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">FORMASI PEMAIN</h3>
               </div>

               <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-white/30 mb-4 block uppercase tracking-[0.3em]">Mode Lapangan</label>
                    <div className="grid grid-cols-3 gap-3">
                       {FIELD_MODES.map(m => (
                         <button 
                           key={m.id} 
                           onClick={() => { setBoardMode(m.id); setFormation(FORMATIONS[m.id][0]); }}
                           className={cn(
                             "py-4 px-1 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-1", 
                             boardMode === m.id 
                                ? "bg-[var(--color-primary)] border-transparent text-black shadow-lg shadow-[var(--color-primary)]/20" 
                                : "bg-black/40 border-white/5 text-white/30 hover:bg-white/10"
                           )}
                         >
                           <span className="text-[10px] font-black uppercase tracking-widest">{m.name}</span>
                         </button>
                       ))}
                    </div>
                 </div>

                 <div>
                    <div className="flex items-center justify-between mb-4">
                       <label className="text-[10px] font-black text-white/30 block uppercase tracking-[0.3em]">PILIH FORMASI</label>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-2 gap-3">
                       {FORMATIONS[boardMode].map(f => (
                         <button 
                           key={f.id} 
                           onClick={() => setFormation(f)}
                           className={cn(
                             "py-4 px-1 rounded-xl border transition-all duration-300 relative group overflow-hidden", 
                             formation.id === f.id 
                                ? "bg-white text-black border-transparent shadow-xl" 
                                : "bg-black/40 border-white/5 text-white/40 hover:bg-white/10"
                           )}
                         >
                           <span className="text-xs font-black tracking-tighter uppercase">{f.name}</span>
                           {formation.id === f.id && <div className="absolute top-1 right-2 w-1 h-1 bg-green-500 rounded-full animate-pulse" />}
                         </button>
                       ))}
                    </div>
                 </div>
               </div>
            </div>

            {/* PLAYER POOL */}
            <div className="glass-card p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-white/5 bg-surface/30 space-y-6 flex flex-col h-[500px]">
               <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/5 rounded-2xl"><Shield className="w-5 h-5 text-[var(--color-primary)]" /></div>
                  <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Skuad Pemain</h3>
               </div>
               <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                 {players?.length === 0 ? (
                   <p className="text-white/40 text-xs text-center py-10">Belum ada pemain di database. Tambahkan di menu Players.</p>
                 ) : players?.map((p: any) => {
                   const isAssigned = positions.some((pos: any) => pos.playerId === p.id);
                   return (
                     <div key={p.id} draggable onDragStart={(e) => {
                         e.dataTransfer.setData('playerId', p.id);
                       }}
                       className={cn("p-3 rounded-2xl flex items-center justify-between gap-3 border transition-colors", isAssigned ? "bg-white/5 border-white/10 opacity-50" : "bg-black/40 border-white/5 hover:border-[var(--color-primary)]/50 cursor-grab active:cursor-grabbing")}
                     >
                       <div className="flex items-center gap-3">
                         {p.photo || p.photourl ? (
                           <img src={p.photo || p.photourl} className="w-8 h-8 rounded-full border border-white/10 object-cover" />
                         ) : (
                           <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/40">
                             {p.jersey || '-'}
                           </div>
                         )}
                         <div className="text-left">
                           <div className="text-xs font-bold text-white">{p.name}</div>
                           <div className="text-[9px] text-white/40 uppercase tracking-widest">{p.position || 'Unknown'} - #{p.jersey || '?'}</div>
                         </div>
                       </div>
                       <div className="flex items-center gap-2">
                         {selectedIdx !== null && !isAssigned && (
                            <button 
                               onClick={() => { assignPlayer(selectedIdx, p.id); setSelectedIdx(null); }}
                               className="px-3 py-1.5 bg-[var(--color-primary)] text-black text-[9px] uppercase tracking-widest font-black rounded-lg hover:scale-105 active:scale-95 transition-all"
                            >
                               Assign
                            </button>
                         )}
                         {isAssigned && <Check className="w-4 h-4 text-green-500" />}
                       </div>
                     </div>
                   );
                 })}
               </div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}

// --- SUBCOMPONENTS ---

function ToolBtn({ icon: Icon, active, onClick, label, className }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "p-2 sm:p-4 rounded-[1rem] sm:rounded-[1.75rem] flex flex-col items-center justify-center gap-0.5 sm:gap-2 transition-all duration-300 min-w-[38px] sm:min-w-[70px] shrink-0",
        active 
          ? "bg-white text-black shadow-2xl scale-110" 
          : "hover:bg-white/10 text-white/40 hover:text-white",
        className
      )}
    >
      <Icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
      {label && <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em]">{label}</span>}
    </button>
  );
}

interface PlayerProps {
  idx: number; x: number; y: number; role?: string; isGK: boolean; active: boolean; 
  onSelect: () => void; onUpdate: (nx: number, ny: number) => void;
  disabled: boolean; boardRef: React.RefObject<HTMLDivElement>;
  playerId?: string | null; player?: any; onAssign: (playerId: string | null) => void;
  showNames?: boolean;
  isSimulating?: boolean;
}

const PlayerIcon: React.FC<PlayerProps> = ({ idx, x, y, role, isGK, active, onSelect, onUpdate, disabled, boardRef, playerId, player, onAssign, showNames = true, isSimulating }) => {
  const [localPos, setLocalPos] = useState({ x, y });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isDragging) {
      setLocalPos({ x, y });
    }
  }, [x, y, isDragging]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    e.stopPropagation();
    onSelect();
    setIsDragging(true);

    const board = boardRef.current;
    if (!board) return;

    const handlePointerMove = (me: PointerEvent) => {
      me.preventDefault(); // prevent scrolling on mobile touch
      const rect = board.getBoundingClientRect();
      const nx = ((me.clientX - rect.left) / rect.width) * 100;
      const ny = ((me.clientY - rect.top) / rect.height) * 100;
      setLocalPos({
        x: Math.max(2, Math.min(98, nx)),
        y: Math.max(2, Math.min(98, ny)),
      });
    };

    const handlePointerUp = (ue: PointerEvent) => {
      setIsDragging(false);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      
      const rect = board.getBoundingClientRect();
      const nx = ((ue.clientX - rect.left) / rect.width) * 100;
      const ny = ((ue.clientY - rect.top) / rect.height) * 100;
      onUpdate(
        Math.max(2, Math.min(98, nx)),
        Math.max(2, Math.min(98, ny))
      );
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <div
      style={{ 
        left: `${localPos.x}%`, 
        top: `${localPos.y}%`, 
        transform: 'translate(-50%, -50%)',
        touchAction: 'none'
      }}
      className={cn(
        "absolute transition-none flex flex-col items-center gap-1",
        !disabled ? "pointer-events-auto" : "pointer-events-none",
        isDragging && "z-50"
      )}
      onDragOver={(e) => {
        if (!disabled) e.preventDefault(); // allow drop
      }}
      onDrop={(e) => {
        if (disabled) return;
        e.preventDefault();
        const droppedPlayerId = e.dataTransfer.getData('playerId');
        if (droppedPlayerId) {
          onAssign(droppedPlayerId);
        }
      }}
    >
      <motion.div
        onPointerDown={handlePointerDown}
        whileHover={!disabled ? { scale: 1.1 } : {}}
        animate={{ 
          scale: isDragging ? 1.3 : 1,
          filter: isDragging ? "drop-shadow(0 20px 30px rgba(0,0,0,0.4))" : "drop-shadow(0 10px 20px rgba(0,0,0,0.3))",
          x: isSimulating ? [0, isGK ? 2 : Math.random() * 8 + 4, isGK ? -2 : -(Math.random() * 8 + 4), 0] : 0,
          y: isSimulating ? [0, isGK ? 1 : Math.random() * 5 + 2, isGK ? -1 : -(Math.random() * 5 + 2), 0] : 0,
        }}
        transition={{
          x: isSimulating ? { repeat: Infinity, duration: 4 + Math.random() * 2, ease: "easeInOut" } : undefined,
          y: isSimulating ? { repeat: Infinity, duration: 3 + Math.random() * 2, ease: "easeInOut" } : undefined,
        }}
        className={cn(
          "relative w-12 h-12 md:w-14 md:h-14 rounded-full border-[3px] flex flex-col items-center justify-center font-display font-black text-sm transition-colors",
          !disabled ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default",
          playerId 
            ? (role === 'GK' ? "bg-amber-400 text-black border-amber-500/50" : "bg-[var(--color-primary)] text-black border-white/20 shadow-[0_0_15px_rgba(250,204,21,0.5)]") 
            : "bg-black/50 text-white border-white/20 border-dashed backdrop-blur-sm",
          active ? "ring-[5px] ring-white/30" : "hover:ring-4 hover:ring-white/10"
        )}
      >
        {player && (player.photo || player.photourl) ? (
           <img src={player.photo || player.photourl} className="absolute inset-0 w-full h-full object-cover rounded-full opacity-50" />
        ) : null}
        
        <span className="relative z-10 text-[10px] sm:text-xs">
          {player ? (player.jersey || '#') : (role || (isGK ? 'GK' : idx + 1))}
        </span>
        
        {playerId && (
          <button 
            onClick={(e) => { e.stopPropagation(); onAssign(null); }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        )}
        
        <div className="absolute inset-0 rounded-full border border-white/20 mix-blend-overlay pointer-events-none" />
      </motion.div>
      
      {showNames && (
        <div className="bg-black/80 px-2 py-0.5 rounded-md border border-white/10 backdrop-blur-md z-10 mt-1 shadow-lg max-w-[80px] text-center truncate pointer-events-none">
           <span className="text-[9px] font-black text-white">{player ? player.name : (role || 'Role')}</span>
        </div>
      )}
      
      {/* Real-time Indicator */}
      <AnimatePresence>
        {active && !disabled && (
           <motion.div 
             initial={{ opacity: 0, scale: 0 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 0 }}
             className="absolute top-[-30px] left-1/2 -translate-x-1/2 bg-black text-white text-[8px] font-black px-2 py-0.5 rounded-full whitespace-nowrap z-20 shadow-lg"
           >
             {Math.round(localPos.x)}%, {Math.round(localPos.y)}%
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const BoardPath: React.FC<{ path: any }> = ({ path }) => {
  if (!path || !path.points || path.points.length < 2) return null;
  
  const d = path.points.map((p: any, i: number) => 
    (i === 0 ? 'M' : 'L') + ` ${p.x} ${p.y}`
  ).join(' ');

  const commonProps = {
    d,
    fill: "none",
    stroke: path.color,
    strokeWidth: (path.size || 4) / 4, // Scale down stroke widths logically since viewBox is 0-100
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    style: { filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }
  };

  if (path.tool === 'arrow') {
    return (
      <path 
        {...commonProps}
        strokeDasharray="8,4" 
        markerEnd="url(#arrowhead)"
      />
    );
  }

  if (path.tool === 'circle') {
    return (
      <path 
        {...commonProps}
        fill={path.color} 
        fillOpacity="0.1"
        strokeDasharray="4,4"
      />
    );
  }

  if (path.tool === 'eraser') {
    return (
      <path 
        {...commonProps}
        stroke="#123e20"
        strokeWidth={((path.size || 4) * 3) / 4}
        className="mix-blend-normal"
      />
    );
  }

  return (
    <motion.path 
      {...commonProps}
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.3 }}
    />
  );
}
