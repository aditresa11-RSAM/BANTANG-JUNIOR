import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Layout from '../components/ui/Layout';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'motion/react';
import { 
  Plus, PenTool, MousePointer, Eraser, Undo, Redo, Trash2, 
  Settings, Share2, Download, Save, Layers, Circle, ArrowRight,
  Maximize2, Minimize2, Goal, Map, Zap, Shield, Target, Activity,
  ChevronDown, Type, History, Play, Check, Cloud, X, Search, Users
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

  const { data: players } = useCMSData('players', []);

  // Sync positions when formation changes
  useEffect(() => {
    setPositions(prev => {
      // Map over the new formation positions
      return formation.pos.map((p: any, i: number) => {
        // Find if we had a player at this index previously
        const prevPlayerId = prev[i]?.playerId;
        // Or if we specifically matched by role?
        return {
          ...p,
          playerId: prevPlayerId || null
        };
      });
    });
    setPaths([]);
  }, [formation]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activeTool === 'cursor') {
      setSelectedIdx(null);
      return;
    }
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
              Tactical <span className="text-[var(--color-primary)]">Board</span>
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
             <button 
                onClick={() => setPositions(formation.pos.map(p => ({ ...p, playerId: null })))}
                className="py-2.5 px-4 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all border border-white/10"
             >
                <Users className="w-3.5 h-3.5" /> Kosongkan Skuad
             </button>
             <button 
                onClick={() => setPositions(positions.map((p, i) => ({ ...p, x: formation.pos[i].x, y: formation.pos[i].y })))}
                className="py-2.5 px-4 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all border border-white/10"
             >
                <Undo className="w-3.5 h-3.5" /> Reset Posisi
             </button>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-6 w-full max-w-[1600px] mx-auto pb-20 mt-4 animate-in fade-in duration-1000">
          
          {/* MAIN FIELD - FLEX 1 */}
          <div className={cn("flex-1 flex flex-col items-center", isFullscreen ? "" : "relative")}>
            <div className={cn(
               "group/board perspective-1000 w-full",
               isFullscreen ? "fixed inset-0 z-[100] bg-[var(--color-surface)] flex flex-col items-center justify-center p-4 pb-28 md:p-10 md:pb-32" : "relative max-w-[800px] mx-auto pb-32"
            )}>
              
              {/* FIELD CONTAINER */}
              <motion.div 
                ref={boardRef}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                style={isFullscreen ? { aspectRatio: '2/3', maxWidth: '100%', maxHeight: '85vh' } : { aspectRatio: '3/4' }}
                className={cn(
                  "bg-[#15321f] relative overflow-hidden touch-none select-none ring-1 ring-white/10 w-full rounded-[2rem] md:rounded-[3rem] shadow-2xl mx-auto shadow-[0_0_50px_rgba(0,0,0,0.5)_inset,0_20px_40px_rgba(0,0,0,0.6)]",
                  isFullscreen ? "h-auto border-[6px] md:border-[12px] border-[#0a0f1c]/90 backdrop-blur-md" : "border-[8px] md:border-[12px] border-[#0a0f1c]/80 backdrop-blur-md",
                  activeTool !== 'cursor' ? 'cursor-crosshair' : 'cursor-default'
                )}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              >
                {/* Realistic Grass Texturing */}
                {/* Horizontal Mowing Pattern */}
                <div className="absolute inset-0 z-0" style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.035) 5.55%, transparent 5.55%, transparent 11.1%)', backgroundSize: '100% 100%' }} />
                {/* Subtle vertical texture for realism */}
                <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(90deg, rgba(0,0,0,0.1) 0px, transparent 1px, transparent 20px, rgba(255,255,255,0.05) 21px, transparent 22px)', backgroundSize: '40px 100%' }} />
                
                {/* Stadium Lighting & Vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,rgba(0,0,0,0.5)_100%)] pointer-events-none z-0" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30 pointer-events-none z-0" />
                
                {/* Subtle Zone Dividers */}
                <div className="absolute top-1/3 left-[4%] right-[4%] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mix-blend-overlay border-none z-0" />
                <div className="absolute top-2/3 left-[4%] right-[4%] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mix-blend-overlay border-none z-0" />
                <div className="absolute top-[16.5%] left-[2%] text-[7px] md:text-[9px] font-bold uppercase text-white/20 tracking-[0.3em] rotate-[-90deg] origin-left mix-blend-overlay -translate-y-1/2 z-0">Attack Zone</div>
                <div className="absolute top-[50%] left-[2%] text-[7px] md:text-[9px] font-bold uppercase text-white/20 tracking-[0.3em] rotate-[-90deg] origin-left mix-blend-overlay -translate-y-1/2 z-0">Midfield</div>
                <div className="absolute top-[83.5%] left-[2%] text-[7px] md:text-[9px] font-bold uppercase text-white/20 tracking-[0.3em] rotate-[-90deg] origin-left mix-blend-overlay -translate-y-1/2 z-0">Defense Zone</div>
                
                {/* Realistic Field Markings - Soft White, Crisp, Anti-Aliased */}
                {/* Main Boundary */}
                <div className="absolute inset-x-[4%] inset-y-[3%] border-[1.5px] md:border-[2px] border-white/60 shadow-[0_0_4px_rgba(255,255,255,0.3)] z-0 rounded-sm" />
                
                {/* Halfway Line */}
                <div className="absolute left-[4%] right-[4%] top-1/2 h-0 border-t-[1.5px] md:border-t-[2px] border-white/60 shadow-[0_0_4px_rgba(255,255,255,0.3)] -translate-y-1/2 z-0" />
                
                {/* Center Circle */}
                <div className="absolute top-1/2 left-1/2 w-[30%] aspect-square border-[1.5px] md:border-[2px] border-white/60 shadow-[0_0_4px_rgba(255,255,255,0.3)] rounded-full -translate-x-1/2 -translate-y-1/2 z-0" />
                <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 md:w-2.5 md:h-2.5 bg-white/70 shadow-[0_0_4px_rgba(255,255,255,0.4)] rounded-full -translate-x-1/2 -translate-y-1/2 z-0" />
                
                {/* Detailed Boxes */}
                {/* Penalty Area 1 */}
                <div className="absolute top-[3%] left-1/2 -translate-x-1/2 w-[45%] h-[15%] border-[1.5px] md:border-[2px] border-white/60 border-t-0 shadow-[0_0_4px_rgba(255,255,255,0.3)] z-0 rounded-b-sm" />
                <div className="absolute top-[18%] left-1/2 -translate-x-1/2 w-[16%] aspect-square border-[1.5px] md:border-[2px] border-white/60 rounded-full -translate-y-1/2 z-0 [clip-path:polygon(0_50%,100%_50%,100%_100%,0_100%)]" />
                <div className="absolute top-[14%] left-1/2 w-1 h-1 md:w-1.5 md:h-1.5 bg-white/70 rounded-full -translate-x-1/2 -translate-y-1/2 z-0" />
                
                {/* Penalty Area 2 */}
                <div className="absolute bottom-[3%] left-1/2 -translate-x-1/2 w-[45%] h-[15%] border-[1.5px] md:border-[2px] border-white/60 border-b-0 shadow-[0_0_4px_rgba(255,255,255,0.3)] z-0 rounded-t-sm" />
                <div className="absolute bottom-[18%] left-1/2 -translate-x-1/2 w-[16%] aspect-square border-[1.5px] md:border-[2px] border-white/60 rounded-full translate-y-1/2 z-0 [clip-path:polygon(0_0,100%_0,100%_50%,0_50%)]" />
                <div className="absolute bottom-[14%] left-1/2 w-1 h-1 md:w-1.5 md:h-1.5 bg-white/70 rounded-full -translate-x-1/2 translate-y-1/2 z-0" />
                
                {/* Goal Areas */}
                <div className="absolute top-[3%] left-1/2 -translate-x-1/2 w-[18%] h-[5%] border-[1.5px] md:border-[2px] border-white/60 border-t-0 shadow-[0_0_4px_rgba(255,255,255,0.3)] z-0 rounded-b-sm" />
                <div className="absolute bottom-[3%] left-1/2 -translate-x-1/2 w-[18%] h-[5%] border-[1.5px] md:border-[2px] border-white/60 border-b-0 shadow-[0_0_4px_rgba(255,255,255,0.3)] z-0 rounded-t-sm" />
                
                {/* Corner Arcs */}
                <div className="absolute top-[3%] left-[4%] w-4 h-4 md:w-6 md:h-6 border-r-[1.5px] md:border-r-[2px] border-b-[1.5px] md:border-b-[2px] border-white/60 rounded-br-full shadow-[0_0_4px_rgba(255,255,255,0.3)] z-0" />
                <div className="absolute top-[3%] right-[4%] w-4 h-4 md:w-6 md:h-6 border-l-[1.5px] md:border-l-[2px] border-b-[1.5px] md:border-b-[2px] border-white/60 rounded-bl-full shadow-[0_0_4px_rgba(255,255,255,0.3)] z-0" />
                <div className="absolute bottom-[3%] left-[4%] w-4 h-4 md:w-6 md:h-6 border-r-[1.5px] md:border-r-[2px] border-t-[1.5px] md:border-t-[2px] border-white/60 rounded-tr-full shadow-[0_0_4px_rgba(255,255,255,0.3)] z-0" />
                <div className="absolute bottom-[3%] right-[4%] w-4 h-4 md:w-6 md:h-6 border-l-[1.5px] md:border-l-[2px] border-t-[1.5px] md:border-t-[2px] border-white/60 rounded-tl-full shadow-[0_0_4px_rgba(255,255,255,0.3)] z-0" />

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
                <div className="absolute inset-0 z-20 pointer-events-none">
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
                          onAssign={(pid) => { assignPlayer(i, pid); setSelectedIdx(null); }}
                          playerId={pos.playerId}
                          player={assignedPlayer}
                          disabled={activeTool !== 'cursor'}
                          boardRef={boardRef}
                          showNames={showNames}
                          isSimulating={isSimulating}
                          allPlayers={players || []}
                          assignedPlayerIds={positions.map((p: any) => p.playerId).filter(Boolean)}
                        />
                      );
                    })}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* FORMATION DROPDOWNS (Below Field) */}
              {!isFullscreen && (
                <div className="w-full flex items-center justify-center gap-3 z-40 mt-6 md:mt-8">
                  <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-1.5 flex items-center gap-2 shadow-xl">
                    <div className="relative">
                      <select 
                        value={boardMode} 
                        onChange={(e) => {
                          const m = e.target.value as any;
                          setBoardMode(m); 
                          setFormation(FORMATIONS[m][0]); 
                        }}
                        className="bg-black/80 hover:bg-black border border-white/5 text-white rounded-xl pl-4 pr-10 py-2.5 text-[10px] sm:text-xs font-black uppercase tracking-widest focus:outline-none focus:border-[var(--color-primary)] appearance-none cursor-pointer transition-colors"
                      >
                        {FIELD_MODES.map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                    </div>

                    <div className="w-px h-6 bg-white/10" />

                    <div className="relative">
                      <select 
                        value={formation.id} 
                        onChange={(e) => {
                          const f = FORMATIONS[boardMode].find(x => x.id === e.target.value);
                          if (f) setFormation(f);
                        }}
                        className="bg-black/80 hover:bg-black border border-white/5 text-[var(--color-primary)] rounded-xl pl-4 pr-10 py-2.5 text-[10px] sm:text-xs font-black uppercase tracking-widest focus:outline-none focus:border-[var(--color-primary)] appearance-none cursor-pointer transition-colors"
                      >
                        {FORMATIONS[boardMode].map(f => (
                          <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-primary)]/50 pointer-events-none" />
                    </div>
                  </div>
                </div>
              )}

              {/* FLOATING GLASS TOOLBAR */}
              <div className={cn("absolute left-1/2 -translate-x-1/2 w-max max-w-[95vw] md:max-w-none bg-black/60 backdrop-blur-xl border border-white/10 p-2 sm:p-2.5 rounded-[1.5rem] shadow-[0_25px_50px_rgba(0,0,0,0.5)] z-50 flex flex-wrap sm:flex-nowrap items-center justify-center gap-1 sm:gap-2 ring-1 ring-white/5", isFullscreen ? "bottom-4 md:bottom-8 lg:bottom-12" : "bottom-2")}>
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
        </div>
      </div>
    </Layout>
  );
}

// --- SUBCOMPONENTS ---

function ToolBtn({ icon: Icon, active, onClick, tooltip, label, className }: any) {
  return (
    <div className="relative group">
      <button 
        onClick={onClick}
        className={cn(
          "w-10 h-10 rounded-xl flex flex-col items-center justify-center gap-0.5 sm:gap-2 transition-all duration-300 shrink-0",
          active 
            ? "bg-[var(--color-primary)] text-black shadow-lg scale-110" 
            : "hover:bg-white/10 text-white/40 hover:text-white",
          className
        )}
      >
        <Icon className="w-5 h-5 shrink-0" />
      </button>
      {(tooltip || label) && (
        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur text-white text-[10px] uppercase font-black tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 ring-1 ring-white/10 shadow-xl">
          {tooltip || label}
        </span>
      )}
    </div>
  );
}

interface PlayerProps {
  idx: number; x: number; y: number; role?: string; isGK: boolean; active: boolean; 
  onSelect: () => void; onUpdate: (nx: number, ny: number) => void;
  disabled: boolean; boardRef: React.RefObject<HTMLDivElement>;
  playerId?: string | null; player?: any; onAssign: (playerId: string | null) => void;
  showNames?: boolean;
  isSimulating?: boolean;
  allPlayers?: any[];
  assignedPlayerIds?: string[];
}

const PlayerIcon: React.FC<PlayerProps> = ({ idx, x, y, role, isGK, active, onSelect, onUpdate, disabled, boardRef, playerId, player, onAssign, showNames = true, isSimulating, allPlayers = [], assignedPlayerIds = [] }) => {
  const [localPos, setLocalPos] = useState({ x, y });
  const [isDragging, setIsDragging] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const lastTap = useRef<number>(0);

  useEffect(() => {
    if (!active) {
      setShowDropdown(false);
      setSearchQuery("");
    }
  }, [active]);

  useEffect(() => {
    if (!isDragging) {
      setLocalPos({ x, y });
    }
  }, [x, y, isDragging]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    e.stopPropagation();

    const now = Date.now();
    const isDoubleTap = (now - lastTap.current) < 300;
    lastTap.current = now;

    if (isDoubleTap) {
      setShowDropdown(true);
      setIsDragging(false);
      return;
    }

    onSelect();
    setIsDragging(true);
    setShowDropdown(false);

    const board = boardRef.current;
    if (!board) return;

    const handlePointerMove = (me: PointerEvent) => {
      // Allow slight movement before considering it a drag? 
      // Nah, just prevent default to stop scrolling
      me.preventDefault(); 
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

  const getRoleColor = (r?: string) => {
    switch (r) {
      case 'GK': return 'bg-emerald-500 text-black';
      case 'DEF': return 'bg-blue-500 text-white';
      case 'MID': return 'bg-purple-500 text-white';
      case 'FWD': return 'bg-rose-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getRoleMatchScore = (playerPos: string | undefined, targetRole: string | undefined) => {
    const pPos = (playerPos || '').toLowerCase();
    const r = (targetRole || '').toLowerCase();
    if (r === 'gk' && (pPos.includes('kiper') || pPos === 'gk' || pPos.includes('goalkeeper'))) return 1;
    if (r === 'def' && (pPos.includes('belakang') || pPos.includes('bek') || pPos.includes('def') || pPos.includes('cb') || pPos.includes('fb') || pPos.includes('wb') || pPos.includes('sw'))) return 1;
    if (r === 'mid' && (pPos.includes('tengah') || pPos.includes('gelandang') || pPos.includes('mid') || pPos.includes('dm') || pPos.includes('cm') || pPos.includes('am') || pPos.includes('wing'))) return 1;
    if (r === 'fwd' && (pPos.includes('depan') || pPos.includes('penyerang') || pPos.includes('fwd') || pPos.includes('striker') || pPos.includes('sayap') || pPos.includes('cf') || pPos.includes('st') || pPos.includes('ss'))) return 1;
    return 0;
  };

  const filteredAndSortedPlayers = useMemo(() => {
    let list = [...allPlayers];
    if (searchQuery) {
      const qs = searchQuery.toLowerCase();
      list = list.filter(p => 
        (p.name || '').toLowerCase().includes(qs) || 
        (p.position || '').toLowerCase().includes(qs)
      );
    }
    
    // Sort logic
    list.sort((a, b) => {
      // 1. Matching role
      const scoreA = getRoleMatchScore(a.position, role);
      const scoreB = getRoleMatchScore(b.position, role);
      if (scoreA !== scoreB) return scoreB - scoreA;
      
      // 2. Previously assigned (Used ones go lower)
      const isAssignedA = assignedPlayerIds.includes(a.id);
      const isAssignedB = assignedPlayerIds.includes(b.id);
      if (isAssignedA && !isAssignedB) return 1;
      if (!isAssignedA && isAssignedB) return -1;

      // 3. Alphabetical
      return (a.name || '').localeCompare(b.name || '');
    });
    
    return list;
  }, [allPlayers, searchQuery, role, assignedPlayerIds]);

  return (
    <div
      style={{ 
        left: `${localPos.x}%`, 
        top: `${localPos.y}%`, 
        transform: 'translate(-50%, -50%)',
        touchAction: 'none'
      }}
      className={cn(
        "absolute flex flex-col items-center group will-change-transform transform-gpu",
        isDragging ? "transition-none z-[100]" : "transition-all duration-300 ease-out z-10",
        showDropdown && "z-[60]",
        !disabled ? "pointer-events-auto" : "pointer-events-none"
      )}
      onDragOver={(e) => {
        if (!disabled) e.preventDefault();
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
        whileHover={!disabled ? { scale: 1.05 } : {}}
        animate={{ 
          scale: isDragging ? 1.2 : 1,
          filter: isDragging ? "drop-shadow(0 15px 25px rgba(0,0,0,0.5))" : "drop-shadow(0 4px 6px rgba(0,0,0,0.3))",
          x: isSimulating ? [0, isGK ? 2 : Math.random() * 8 + 4, isGK ? -2 : -(Math.random() * 8 + 4), 0] : 0,
          y: isSimulating ? [0, isGK ? 1 : Math.random() * 5 + 2, isGK ? -1 : -(Math.random() * 5 + 2), 0] : 0,
        }}
        transition={{
          x: isSimulating ? { repeat: Infinity, duration: 4 + Math.random() * 2, ease: "easeInOut" } : undefined,
          y: isSimulating ? { repeat: Infinity, duration: 3 + Math.random() * 2, ease: "easeInOut" } : undefined,
        }}
        className={cn(
          "relative w-9 h-9 md:w-12 md:h-12 rounded-full border-[2px] md:border-[3px] flex flex-col items-center justify-center font-display font-bold text-xs bg-[#0a0f1c] transition-all",
          !disabled ? (isDragging ? "cursor-grabbing" : "cursor-pointer") : "cursor-default",
          playerId ? "border-white/70" : "border-white/20 border-dashed backdrop-blur-sm text-white/50",
          active && "ring-[2px] md:ring-[3px] ring-[#00a8ff] ring-offset-2 ring-offset-transparent shadow-[0_0_20px_rgba(0,168,255,0.6)]"
        )}
      >
        {player && (player.photo || player.photourl) ? (
           <img src={player.photo || player.photourl} className="absolute inset-0 w-full h-full object-cover object-center rounded-full" draggable={false} />
        ) : (
           <span className="relative z-10 text-[9px] md:text-[10px] opacity-70">
             {!playerId && (role || (isGK ? 'GK' : idx + 1))}
           </span>
        )}
        
        {playerId && (
          <div className="absolute -bottom-1.5 md:-bottom-2 left-1/2 -translate-x-1/2 min-w-[16px] h-[12px] md:min-w-[18px] md:h-[14px] bg-black/90 backdrop-blur-sm text-white text-[7px] md:text-[8px] font-bold rounded-full flex items-center justify-center border border-white/20 px-1 z-20 shadow-md">
            {player?.jersey || '?'}
          </div>
        )}

        {playerId && (
          <button 
            onClick={(e) => { e.stopPropagation(); onAssign(null); }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-600/90 text-white rounded-full flex items-center justify-center pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity z-30"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        )}
      </motion.div>
      
      {showNames && (
        <div className="absolute top-[calc(100%+8px)] md:top-[calc(100%+12px)] bg-black/80 px-1.5 py-0.5 md:px-2 md:py-1 rounded-lg border border-white/10 backdrop-blur-md shadow-xl pointer-events-none z-20 flex flex-col items-center min-w-[50px] max-w-[70px] md:min-w-[60px] md:max-w-[85px] group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all">
           <span className="text-[7px] md:text-[8px] font-semibold text-white/90 leading-[1.1] text-center line-clamp-2 drop-shadow-sm w-full break-words">
             {player ? player.name : (role || 'Role')}
           </span>
           {player && (
             <span className={cn("text-[6px] md:text-[7px] font-bold mt-1 px-1.5 py-[1px] md:py-[2px] rounded-sm uppercase tracking-widest leading-none", getRoleColor(role))}>
               {role || 'Pos'}
             </span>
           )}
        </div>
      )}
      
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showDropdown && !disabled && !isDragging && (
            <div className="fixed inset-0 z-[100000] flex flex-col items-center justify-end md:justify-center pointer-events-none pb-0 md:pb-6 h-[100dvh]">
              {/* Backdrop wrapper to block dragging and catch clicks */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-auto"
                onPointerDown={(e) => { e.stopPropagation(); setShowDropdown(false); }}
              />

              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative w-full md:w-[450px] pointer-events-auto bg-[#0a0f1c]/95 backdrop-blur-3xl border-t md:border border-white/10 md:border-[#00a8ff]/20 shadow-[0_-20px_60px_rgba(0,0,0,0.8)] rounded-t-[2.5rem] md:rounded-[2rem] overflow-hidden flex flex-col max-h-[85dvh] md:max-h-[80dvh] xl:fixed xl:right-8 xl:top-auto xl:bottom-8 z-10"
                onPointerDown={(e) => e.stopPropagation()}
              >
              {/* Mobile Drag Indicator */}
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-4 mb-2 md:hidden" />

              <div className="p-4 md:p-6 border-b border-white/10 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                   <h3 className="text-sm md:text-base font-black text-white uppercase tracking-widest flex items-center gap-2">
                     <Users className="w-5 h-5 text-[var(--color-primary)] drop-shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
                     Pilih {role}
                   </h3>
                   <button onClick={() => setShowDropdown(false)} className="text-white/50 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                     <X className="w-5 h-5" />
                   </button>
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input 
                    type="text" 
                    placeholder="Cari pemain..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
                  />
                </div>
              </div>

              <div className="overflow-y-auto custom-scrollbar p-3 space-y-2 flex-1 pb-8 md:pb-3">
                {filteredAndSortedPlayers.length === 0 ? (
                  <div className="text-center py-10 text-white/40 text-xs uppercase tracking-widest font-bold">Pemain tidak ditemukan</div>
                ) : (
                  filteredAndSortedPlayers.map((p) => {
                    const isAssigned = assignedPlayerIds.includes(p.id);
                    const isCurrent = p.id === playerId;
                    const score = getRoleMatchScore(p.position, role);
                    const isMatch = score > 0;
                    
                    const rating = (Math.random() * (9.5 - 7.0) + 7.0).toFixed(1);
                    
                    return (
                      <button
                        key={p.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAssign(isCurrent ? null : p.id);
                          setShowDropdown(false);
                        }}
                        className={cn(
                          "w-full text-left p-3 md:p-4 flex items-center gap-4 rounded-2xl transition-all border border-transparent group/item overflow-hidden relative",
                          isAssigned && !isCurrent ? "opacity-50 bg-black/40 grayscale-[0.5]" : "hover:bg-white/5 hover:border-white/10 bg-black/20",
                          isCurrent ? "bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30 ring-1 ring-[var(--color-primary)]/50" : "",
                        )}
                      >
                        {isCurrent && (
                          <div className="absolute inset-y-0 left-0 w-1.5 bg-[var(--color-primary)] rounded-r-full shadow-[0_0_10px_var(--color-primary)]" />
                        )}

                        {p.photo || p.photourl ? (
                          <img src={p.photo || p.photourl} className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover shrink-0 border-2 border-white/10 shadow-lg group-hover/item:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/5 flex items-center justify-center text-sm font-black shrink-0 border-2 border-white/10 shadow-lg">
                            {p.jersey || '-'}
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="flex items-center gap-2">
                             <div className="text-sm font-bold text-white truncate block flex-1">{p.name}</div>
                             {isAssigned && !isCurrent && (
                               <span className="text-[8px] md:text-[9px] px-2 py-1 rounded bg-red-500/20 text-red-400 border border-red-500/30 font-black uppercase tracking-widest shrink-0 whitespace-nowrap">
                                 Digunakan
                               </span>
                             )}
                          </div>
                          <div className="flex items-center gap-x-2 gap-y-1 mt-1.5 flex-wrap">
                            <span className={cn("text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest leading-none flex items-center", isMatch ? getRoleColor(role) : "bg-white/10 text-white/50")}>
                              {p.position || 'Unknown'}
                            </span>
                            <span className="text-[10px] font-bold text-white/50">#{p.jersey || '?'}</span>
                            <span className="text-[10px] font-black text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-sm ml-auto flex items-center gap-1">★ {rating}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <AnimatePresence>
        {active && !disabled && isDragging && (
           <motion.div 
             initial={{ opacity: 0, y: 5 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: 5 }}
             className="absolute bottom-[calc(100%+4px)] md:bottom-[calc(100%+8px)] bg-[var(--color-primary)] text-black text-[7px] md:text-[8px] font-black px-1.5 py-0.5 rounded-md whitespace-nowrap z-20 shadow-lg pointer-events-none"
           >
             {Math.round(localPos.x)}%, {Math.round(localPos.y)}%
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

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
