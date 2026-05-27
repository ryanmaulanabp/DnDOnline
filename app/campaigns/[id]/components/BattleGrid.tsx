"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { updateGridStateAction } from "@/app/actions/campaign";
import { Map, Image as ImageIcon, Box, CloudRain, Sun, Flame, Droplet } from "lucide-react";
import { EnvironmentEffects } from "./EnvironmentEffects";

export function BattleGrid({ 
  gridState, 
  combatState, 
  isDM, 
  campaignId, 
  characters, 
  userCharId, 
  selectedTargetId, 
  onSelectTarget 
}: { 
  gridState: any; 
  combatState: any; 
  isDM: boolean; 
  campaignId: string; 
  characters: any[]; 
  userCharId?: string; 
  selectedTargetId?: string | null; 
  onSelectTarget?: (id: string) => void; 
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Local state untuk sinkronisasi
  const [tokens, setTokens] = useState(gridState?.tokens || []);
  const [bgUrl, setBgUrl] = useState(gridState?.bgUrl || "");
  const [weather, setWeather] = useState(gridState?.weather || "none");
  const [isEditingBg, setIsEditingBg] = useState(false);
  const [is3DMode, setIs3DMode] = useState(true);

  // Key untuk memicu pergantian peta secara fisik dan dramatis (spring transitions)
  const [boardKey, setBoardKey] = useState(0);

  useEffect(() => {
    setTokens(gridState?.tokens || []);
    setBgUrl(gridState?.bgUrl || "");
    setWeather(gridState?.weather || "none");
  }, [gridState]);

  useEffect(() => {
    // Memicu flip-flop papan fisik saat url peta berganti
    setBoardKey(prev => prev + 1);
  }, [bgUrl]);

  const handleDragEnd = async (e: any, info: any, tokenId: string) => {
    if (!isDM && tokenId !== userCharId) return; 
    
    const index = tokens.findIndex((t: any) => t.id === tokenId);
    if (index === -1) return;

    const newTokens = [...tokens];
    newTokens[index] = {
      ...newTokens[index],
      x: Math.max(10, Math.min(740, newTokens[index].x + info.offset.x)),
      y: Math.max(10, Math.min(740, newTokens[index].y + info.offset.y))
    };

    setTokens(newTokens);
    await updateGridStateAction(campaignId, { ...gridState, tokens: newTokens });
  };

  const addPlayersToGrid = async () => {
    if (!isDM) return;
    const newTokens = characters.map((c, i) => ({
      id: c._id,
      name: c.name,
      x: 70 + (i * 70),
      y: 70,
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
    <div 
      className="relative w-full h-[540px] bg-stone-950 border-2 border-[#d4c5b0] rounded-[2rem] overflow-hidden shadow-2xl flex flex-col items-center justify-center" 
      style={{ perspective: "1600px" }}
    >
      
      {/* 3D Vignette Awan Atmosfer / Bayangan Meja */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.85)_100%)] pointer-events-none z-20" />
      <div className="absolute inset-0 bg-stone-900/10 pointer-events-none z-0" />

      {/* Control Widgets Bar */}
      <div className="absolute top-5 left-5 z-30 flex gap-2.5">
        <button 
          onClick={() => {
            try {
              const audio = new Audio('/sounds/click.mp3');
              audio.volume = 0.05;
              audio.play().catch(() => {});
            } catch (e) {}
            setIs3DMode(!is3DMode);
          }} 
          className={`text-[9px] font-black uppercase tracking-widest px-3.5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer
            ${is3DMode 
              ? 'bg-amber-700 text-stone-100 hover:bg-amber-600 border border-amber-600/30' 
              : 'bg-white text-stone-700 hover:text-stone-950 border border-[#d4c5b0]'}`}
        >
          <Box className="w-3.5 h-3.5 shrink-0" /> {is3DMode ? "3D Tabletop" : "2D Tampilan Datar"}
        </button>
        
        {isDM && (
          <>
            <button 
              onClick={addPlayersToGrid} 
              className="bg-stone-850 hover:bg-stone-800 text-stone-100 text-[9px] font-black uppercase tracking-widest px-3.5 py-2.5 rounded-xl transition-all shadow-md border border-stone-700 cursor-pointer"
            >
              Spawn Party
            </button>
            <button 
              onClick={() => setIsEditingBg(!isEditingBg)} 
              className="bg-stone-850 hover:bg-stone-800 text-stone-100 text-[9px] font-black uppercase tracking-widest px-3.5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 border border-stone-700 cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5 text-stone-400" /> Pengaturan Map
            </button>
          </>
        )}
      </div>

      {/* DM Map Editor Menu Panel */}
      <AnimatePresence>
        {isDM && isEditingBg && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-16 left-5 z-40 bg-stone-900/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-stone-700 flex flex-col gap-3 min-w-[280px]"
          >
             <div className="flex flex-col gap-1">
               <label className="text-[8px] font-black uppercase text-stone-400 tracking-wider">Tautan Background Peta (URL)</label>
               <div className="flex gap-2">
                 <input 
                   type="text" 
                   value={bgUrl} 
                   onChange={e => setBgUrl(e.target.value)} 
                   placeholder="Masukkan URL Peta..." 
                   className="text-xs px-3 py-1.5 border border-stone-750 bg-stone-800 rounded-lg outline-none w-full text-stone-200 focus:border-amber-500 font-semibold"
                 />
                 <button onClick={handleSaveBg} className="bg-amber-600 text-stone-900 text-[9px] font-black px-3 rounded-lg hover:bg-amber-500 uppercase shrink-0">Simpan</button>
               </div>
             </div>
             
             <div className="border-t border-stone-800 pt-3 flex flex-col gap-2">
               <span className="text-[8px] text-stone-400 font-black uppercase tracking-wider">Efek Atmosfer Cuaca:</span>
               <div className="flex flex-wrap gap-1">
                 {["none", "rain", "snow", "fog", "embers"].map(w => (
                   <button 
                     key={w} 
                     onClick={() => handleSetWeather(w)} 
                     className={`text-[8.5px] font-black px-2.5 py-1.5 rounded-lg uppercase transition-all
                       ${weather === w ? 'bg-amber-600 text-stone-900 shadow-sm' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'}`}
                   >
                     {w}
                   </button>
                 ))}
               </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* THE VIRTUALLY PHYSICAL TABLETOP BOARD */}
      <div className="relative w-full h-full flex items-center justify-center select-none overflow-visible">
        <motion.div 
          key={boardKey}
          initial={{ rotateX: 90, opacity: 0, scale: 0.75, y: -250 }}
          animate={{ 
            rotateX: is3DMode ? 55 : 0, 
            rotateZ: is3DMode ? -40 : 0,
            translateY: is3DMode ? -80 : 0,
            scale: is3DMode ? 1 : 0.58,
            opacity: 1, 
          }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="relative transition-shadow duration-1000 overflow-hidden shrink-0"
          style={{
            width: '800px',
            height: '800px',
            transformStyle: 'preserve-3d',
            backgroundImage: `url(${bgUrl || 'https://www.transparenttextures.com/patterns/graphy.png'})`,
            backgroundColor: '#44403c', // fallback stone-700
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            boxShadow: is3DMode ? '0 80px 120px rgba(0,0,0,0.95), inset 0 0 80px rgba(0,0,0,0.6)' : 'none',
            borderRadius: '1.5rem',
            border: '14px solid #1c1917' // Wood/Border Tebal
          }}
          ref={containerRef}
        >
          {/* Grid Overlay Line layer */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.25)_2px,transparent_2px),linear-gradient(90deg,rgba(0,0,0,0.25)_2px,transparent_2px)] opacity-40 mix-blend-overlay" style={{ backgroundSize: '50px 50px' }} />

          {/* DYNAMIC AMBIENT LIGHTING OVERLAY SHIELDS (WET WEATHER FILTERS) */}
          <AnimatePresence>
            {weather === "embers" && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-orange-600/15 to-red-950/15 pointer-events-none mix-blend-color-dodge z-30 animate-pulse"
                style={{ animationDuration: '4s' }}
              />
            )}
            {weather === "rain" && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#0f172a]/25 pointer-events-none mix-blend-multiply z-30"
              />
            )}
            {weather === "fog" && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-b from-stone-400/20 via-slate-400/15 to-stone-450/20 pointer-events-none mix-blend-overlay z-30"
              />
            )}
            {weather === "snow" && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-blue-200/10 pointer-events-none mix-blend-overlay z-30"
              />
            )}
          </AnimatePresence>

          {/* Weather Particles System */}
          <EnvironmentEffects weather={weather} />

          {/* Token Render Array */}
          {tokens.map((token: any) => {
            const isMonster = token.isMonster === true;
            const isTargeted = selectedTargetId === token.id;

            return (
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
                {/* 3D Target Reticle ring */}
                {isTargeted && is3DMode && (
                  <motion.div 
                    animate={{ rotateZ: 360, scale: [1, 1.12, 1] }} 
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-3 w-14 h-14 rounded-full border-2 border-dashed border-red-500 z-0 drop-shadow-[0_0_10px_rgba(239,68,68,0.9)] pointer-events-none" 
                    style={{ transform: 'rotateX(70deg)' }} 
                  />
                )}
                
                {/* Standee Content wrapper */}
                <div 
                  className="relative flex flex-col items-center transition-transform duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]"
                  style={{ 
                    transformOrigin: 'bottom center',
                    // Counter rotate to stand up in 3D mode
                    transform: is3DMode ? 'rotateZ(40deg) rotateX(-55deg) translateY(-22px)' : 'rotateZ(0deg) rotateX(0deg) translateY(0)',
                  }}
                >
                  {/* Standee Base */}
                  {is3DMode && (
                    <div className={`absolute -bottom-2 w-11 h-11 rounded-full border-4 opacity-90 shadow-lg z-0
                      ${isMonster ? 'bg-red-950 border-red-600 shadow-red-900/40' : 'bg-amber-950 border-amber-600 shadow-amber-900/40'}`} 
                      style={{ transform: 'rotateX(70deg)' }} 
                    />
                  )}
                  {/* Base Shadow */}
                  {is3DMode && (
                    <div className="absolute -bottom-4.5 w-13 h-13 bg-black/70 blur-md rounded-full z-[-1]" style={{ transform: 'rotateX(70deg)' }} />
                  )}
                  
                  {/* Standee Character Art container */}
                  <div className={`relative z-10 p-1 bg-stone-900 border-2 rounded-xl drop-shadow-2xl overflow-hidden
                    ${isMonster ? 'border-red-500 shadow-red-900/30' : 'border-amber-500 shadow-amber-900/30'}`}>
                    <img 
                      src={token.img} 
                      alt={token.name} 
                      className={`w-10 h-10 object-cover ${!is3DMode ? 'rounded-full' : 'rounded-lg'}`} 
                      draggable={false} 
                    />
                  </div>
                  
                  {/* Standee Name Tag & Mini HP Bar */}
                  <div className="absolute -top-7.5 bg-stone-950/95 text-stone-100 text-[8px] font-black px-2 py-1 rounded-lg border border-stone-800 whitespace-nowrap shadow-lg flex flex-col items-center select-none font-sans tracking-wide">
                    <span>{token.name}</span>
                    
                    {combatState?.participants?.find((p: any) => p.name === token.name) && (
                      <div className="w-9 h-1 bg-stone-900 mt-1 rounded-full overflow-hidden border border-stone-850">
                        <div 
                          className="h-full bg-emerald-500 transition-all duration-300" 
                          style={{ 
                            width: `${Math.max(0, Math.min(100, 
                              (combatState.participants.find((p: any) => p.name === token.name).hp / 
                               combatState.participants.find((p: any) => p.name === token.name).maxHp) * 100
                            ))}%` 
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

    </div>
  );
}
