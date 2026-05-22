"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { updateGridStateAction } from "@/app/actions/campaign";
import { Map, Image as ImageIcon } from "lucide-react";

export function BattleGrid({ gridState, isDM, campaignId, characters }: { gridState: any, isDM: boolean, campaignId: string, characters: any[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Local state for smooth dragging before sync
  const [tokens, setTokens] = useState(gridState?.tokens || []);
  const [bgUrl, setBgUrl] = useState(gridState?.bgUrl || "");
  const [isEditingBg, setIsEditingBg] = useState(false);

  useEffect(() => {
    // Only update local state if not currently dragging (to avoid jank)
    // For simplicity, we just sync always when new data comes. 
    // In production, we'd use a more robust sync mechanism.
    setTokens(gridState?.tokens || []);
    setBgUrl(gridState?.bgUrl || "");
  }, [gridState]);

  const handleDragEnd = async (e: any, info: any, tokenId: string) => {
    if (!isDM) return; // Only DM can move tokens for now, or players can move their own
    
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

  return (
    <div className="relative w-full h-[400px] bg-stone-200 border border-stone-300 rounded-3xl overflow-hidden shadow-sm flex flex-col">
      <div className="absolute top-4 left-4 z-20 flex gap-2">
        <span className="bg-white/90 backdrop-blur border border-stone-300 text-stone-600 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm">
          <Map className="w-3 h-3 text-amber-600" /> Battle Grid
        </span>
        {isDM && (
          <>
            <button onClick={addPlayersToGrid} className="bg-amber-600 hover:bg-amber-500 text-stone-900 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-colors shadow-sm">
              Spawn Party
            </button>
            <button onClick={() => setIsEditingBg(!isEditingBg)} className="bg-stone-800 hover:bg-stone-700 text-stone-100 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-colors shadow-sm flex items-center gap-1">
              <ImageIcon className="w-3 h-3" /> Map
            </button>
          </>
        )}
      </div>

      {isDM && isEditingBg && (
        <div className="absolute top-14 left-4 z-30 bg-white p-2 rounded-lg shadow-xl border border-stone-200 flex gap-2">
           <input 
             type="text" 
             value={bgUrl} 
             onChange={e => setBgUrl(e.target.value)} 
             placeholder="Paste Image URL..." 
             className="text-xs px-2 py-1 border border-stone-300 rounded outline-none w-48 text-stone-800"
           />
           <button onClick={handleSaveBg} className="bg-amber-600 text-stone-900 text-[9px] font-black px-2 rounded hover:bg-amber-500 uppercase">Save</button>
        </div>
      )}

      <div 
        className="relative flex-1 bg-stone-200 bg-repeat bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]" 
        style={bgUrl ? { backgroundImage: `url(${bgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        ref={containerRef}
      >
        {/* Token Render */}
        {tokens.map((token: any) => (
          <motion.div
            key={token.id}
            drag={isDM}
            dragMomentum={false}
            onDragEnd={(e, info) => handleDragEnd(e, info, token.id)}
            initial={{ x: token.x, y: token.y }}
            animate={{ x: token.x, y: token.y }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute w-12 h-12 rounded-full border-4 shadow-lg cursor-grab active:cursor-grabbing flex items-center justify-center overflow-hidden z-10"
            style={{ 
              borderColor: token.isMonster ? '#ef4444' : '#3b82f6',
              backgroundColor: '#fff'
            }}
          >
            <img src={token.img} alt={token.name} className="w-full h-full object-cover" draggable={false} />
            <div className="absolute -bottom-6 bg-stone-100/70 text-stone-900 text-[7px] font-bold px-1 rounded truncate w-16 text-center pointer-events-none">
              {token.name}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
