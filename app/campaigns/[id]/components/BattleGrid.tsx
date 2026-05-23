"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { updateGridStateAction } from "@/app/actions/campaign";
import { Map, Image as ImageIcon, Box, CloudRain } from "lucide-react";
import { EnvironmentEffects } from "./EnvironmentEffects";

export function BattleGrid({ gridState, combatState, isDM, campaignId, characters, userCharId, selectedTargetId, onSelectTarget }: { gridState: any, combatState: any, isDM: boolean, campaignId: string, characters: any[], userCharId?: string, selectedTargetId?: string | null, onSelectTarget?: (id: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Local state for smooth dragging before sync
  const [tokens, setTokens] = useState(gridState?.tokens || []);
  const [bgUrl, setBgUrl] = useState(gridState?.bgUrl || "");
  const [weather, setWeather] = useState(gridState?.weather || "none");
  const [isEditingBg, setIsEditingBg] = useState(false);
  const [is3DMode, setIs3DMode] = useState(true);

  useEffect(() => {
    // Only update local state if not currently dragging (to avoid jank)
    // For simplicity, we just sync always when new data comes. 
    // In production, we'd use a more robust sync mechanism.
    setTokens(gridState?.tokens || []);
    setBgUrl(gridState?.bgUrl || "");
    setWeather(gridState?.weather || "none");
  }, [gridState]);

  const handleDragEnd = async (e: any, info: any, tokenId: string) => {
    if (!isDM && tokenId !== userCharId) return; // Only DM can move all, players can move their own
    
    // Find index
    const index = tokens.findIndex((t: any) => t.id === tokenId);
    if (index === -1) return;

    const newTokens = [...tokens];
    newTokens[index] = {
      ...newTokens[index],
      x: newTokens[index].x + info.offset.x,
      y: newTokens[index].y + info.offset.y
    };

    setTokens(newTokens);
    
    // Send to server
    await updateGridStateAction(campaignId, { ...gridState, tokens: newTokens });
  };

  const addPlayersToGrid = async () => {
    if (!isDM) return;
    const newTokens = characters.map((c, i) => ({
      id: c._id,
      name: c.name,
      x: 50 + (i * 60),
      y: 50,
      img: c.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=" + c.name,
      isMonster: false
    }));

    setTokens(newTokens);
    await updateGridStateAction(campaignId, { ...gridState, tokens: newTokens });
  };

  const handleSaveBg = async () => {
    setIsEditingBg(false);
    await updateGridStateAction(campaignId, { ...gridState, bgUrl });
  };

  const handleSetWeather = async (newWeather: string) => {
    setWeather(newWeather);
    await updateGridStateAction(campaignId, { ...gridState, weather: newWeather });
  };

  return (
    <div className="relative w-full h-[500px] bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-inner flex flex-col items-center justify-center" style={{ perspective: "1500px" }}>
      
      {/* 3D Vignette Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none z-20" />

      <div className="absolute top-4 left-4 z-30 flex gap-2">
        <button onClick={() => setIs3DMode(!is3DMode)} className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-colors shadow-sm flex items-center gap-1 ${is3DMode ? 'bg-amber-600 text-stone-900 hover:bg-amber-500' : 'bg-white/90 backdrop-blur border border-stone-300 text-stone-600 hover:text-stone-900'}`}>
          <Box className="w-3 h-3" /> {is3DMode ? "3D Tabletop" : "2D Flat"}
        </button>
        {isDM && (
          <>
            <button onClick={addPlayersToGrid} className="bg-stone-800 hover:bg-stone-700 text-stone-100 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-colors shadow-sm border border-stone-700">
              Spawn Party
            </button>
            <button onClick={() => setIsEditingBg(!isEditingBg)} className="bg-stone-800 hover:bg-stone-700 text-stone-100 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-colors shadow-sm flex items-center gap-1 border border-stone-700">
              <ImageIcon className="w-3 h-3" /> Map & Weather
            </button>
          </>
        )}
      </div>

      {isDM && isEditingBg && (
        <div className="absolute top-14 left-4 z-40 bg-stone-900 p-2 rounded-lg shadow-xl border border-stone-700 flex gap-2">
           <input 
             type="text" 
             value={bgUrl} 
             onChange={e => setBgUrl(e.target.value)} 
             placeholder="Paste Image URL..." 
             className="text-xs px-2 py-1 border border-stone-700 bg-stone-800 rounded outline-none w-48 text-stone-200 focus:border-amber-500"
           />
           <button onClick={handleSaveBg} className="bg-amber-600 text-stone-900 text-[9px] font-black px-2 rounded hover:bg-amber-500 uppercase">Save Map</button>
           
           <div className="border-l border-stone-700 pl-2 ml-2 flex gap-1 items-center">
             <span className="text-[8px] text-stone-400 font-black uppercase">Weather:</span>
             {["none", "rain", "snow", "fog", "embers"].map(w => (
               <button key={w} onClick={() => handleSetWeather(w)} className={`text-[8px] font-black px-2 py-1 rounded uppercase ${weather === w ? 'bg-amber-600 text-stone-900' : 'bg-stone-700 text-stone-300 hover:bg-stone-600'}`}>{w}</button>
             ))}
           </div>
        </div>
      )}

      {/* The Actual Tabletop Grid */}
      <div 
        className="relative transition-transform duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]"
        style={{
          width: '800px',
          height: '800px',
          transformStyle: 'preserve-3d',
          transform: is3DMode ? 'rotateX(55deg) rotateZ(-40deg) translateY(-100px)' : 'rotateX(0deg) rotateZ(0deg) translateY(0px) scale(0.6)',
          backgroundImage: `url(${bgUrl || 'https://www.transparenttextures.com/patterns/graphy.png'})`,
          backgroundColor: '#d6d3d1', // stone-300 fallback
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: is3DMode ? '0 50px 100px rgba(0,0,0,0.9), inset 0 0 50px rgba(0,0,0,0.5)' : 'none',
          borderRadius: '12px',
          border: '10px solid #292524' // Wood/Dark stone border
        }}
        ref={containerRef}
      >
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.3)_2px,transparent_2px),linear-gradient(90deg,rgba(0,0,0,0.3)_2px,transparent_2px)] opacity-50 mix-blend-overlay" style={{ backgroundSize: '50px 50px' }} />

        {/* Weather Effects */}
        <EnvironmentEffects weather={weather} />

        {/* Token Render */}
        {tokens.map((token: any) => (
          <motion.div
            key={token.id}
            drag={isDM || token.id === userCharId}
            dragMomentum={false}
            onDragEnd={(e, info) => handleDragEnd(e, info, token.id)}
            onClick={() => {
              if (!isDM && token.id !== userCharId && onSelectTarget) {
                onSelectTarget(token.id);
              }
            }}
            initial={{ x: token.x, y: token.y }}
            animate={{ x: token.x, y: token.y }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute z-10 w-12 h-12 flex items-center justify-center cursor-grab active:cursor-grabbing"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Target Reticle */}
               {selectedTargetId === token.id && is3DMode && (
                 <motion.div 
                   animate={{ rotateZ: 360, scale: [1, 1.1, 1] }} 
                   transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                   className="absolute -bottom-3 w-14 h-14 rounded-full border-2 border-dashed border-red-500 z-0 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] pointer-events-none" 
                   style={{ transform: 'rotateX(70deg)' }} 
                 />
               )}
               {/* Standee Content */}
             <div 
               className="relative flex flex-col items-center transition-transform duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]"
               style={{ 
                 transformOrigin: 'bottom center',
                 // Counter rotate to stand up in 3D mode
                 transform: is3DMode ? 'rotateZ(40deg) rotateX(-55deg) translateY(-20px)' : 'rotateZ(0deg) rotateX(0deg) translateY(0)',
               }}
             >
               {/* Standee Base */}
               {is3DMode && (
                 <div className={`absolute -bottom-1.5 w-10 h-10 rounded-full border-4 opacity-80 ${token.isMonster ? 'bg-red-950 border-red-500' : 'bg-blue-950 border-blue-500'}`} style={{ transform: 'rotateX(70deg)' }} />
               )}
               {/* Base Shadow */}
               {is3DMode && (
                 <div className="absolute -bottom-4 w-12 h-12 bg-black/60 blur-md rounded-full" style={{ transform: 'rotateX(70deg)' }} />
               )}
               
               {/* Standee Character Art */}
               <div className={`relative z-10 p-1 bg-stone-900 border-2 rounded-xl drop-shadow-2xl overflow-hidden ${token.isMonster ? 'border-red-500' : 'border-blue-400'}`}>
                 <img src={token.img} alt={token.name} className={`w-10 h-10 object-cover ${!is3DMode ? 'rounded-full' : 'rounded-lg'}`} draggable={false} />
               </div>
               
               {/* Name Tag */}
               <div className="absolute -top-6 bg-stone-900/90 text-stone-100 text-[8px] font-black px-1.5 py-0.5 rounded border border-stone-700 whitespace-nowrap shadow-lg flex flex-col items-center">
                 <span>{token.name}</span>
                 {/* HP Bar based on combatState */}
                 {combatState?.participants?.find((p: any) => p.name === token.name) && (
                   <div className="w-full h-1 bg-red-950 mt-0.5 rounded-full overflow-hidden">
                     <div 
                       className="h-full bg-emerald-500 transition-all duration-300" 
                       style={{ width: `${Math.max(0, Math.min(100, (combatState.participants.find((p: any) => p.name === token.name).hp / combatState.participants.find((p: any) => p.name === token.name).maxHp) * 100))}%` }}
                     />
                   </div>
                 )}
               </div>
             </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
