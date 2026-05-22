"use client";

import { useState } from "react";
import { Ghost, Dice5, Skull, Scroll, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sendCampaignMessageAction } from "@/app/actions/campaign";

const NPC_NAMES = ["Thordak", "Elara", "Gorim", "Sylas", "Keth", "Nimue", "Balasar", "Rurik"];
const TAVERN_NAMES = ["The Prancing Pony", "The Yawning Portal", "The Sleeping Giant", "The Bloody Flagon"];
const LOOT_DROPS = ["Pedang Sihir +1", "100 Gold Coins", "Potion of Healing", "Ring of Protection", "Amulet of Health"];

export function DMScreen({ campaignId, characters }: { campaignId: string, characters: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<{title: string, text: string} | null>(null);

  const generateNPC = () => {
    const name = NPC_NAMES[Math.floor(Math.random() * NPC_NAMES.length)];
    setGeneratedResult({ title: "NPC Generated", text: `Seorang pengembara misterius muncul: ${name}.`});
  };

  const generateTavern = () => {
    const name = TAVERN_NAMES[Math.floor(Math.random() * TAVERN_NAMES.length)];
    setGeneratedResult({ title: "Tavern Generated", text: `Para pahlawan tiba di: ${name}.`});
  };

  const dropLoot = async () => {
    const loot = LOOT_DROPS[Math.floor(Math.random() * LOOT_DROPS.length)];
    await sendCampaignMessageAction(campaignId, "Dungeon Master", `Menemukan harta karun: [LOOT: ${loot}]`, false);
  };

  const sendToChat = async () => {
    if (!generatedResult) return;
    await sendCampaignMessageAction(campaignId, "Dungeon Master", `[${generatedResult.title}] ${generatedResult.text}`, false);
    setGeneratedResult(null);
  };

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="fixed bottom-6 left-6 z-50 bg-stone-900 text-stone-100 p-3 rounded-full shadow-lg border border-stone-700 hover:scale-110 transition-transform">
        <Ghost className="w-6 h-6" />
      </button>
    );
  }

  return (
    <>
      <div className="fixed bottom-6 left-6 z-50 bg-stone-900 text-stone-300 w-80 rounded-2xl shadow-2xl border border-stone-700 overflow-hidden flex flex-col">
      <div className="bg-stone-950 p-3 flex items-center justify-between border-b border-stone-800">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-stone-100">
          <Ghost className="w-4 h-4 text-amber-500" /> DM Screen
        </span>
        <button onClick={() => setIsOpen(false)} className="text-stone-500 hover:text-stone-100 font-bold">✕</button>
      </div>
      
      <div className="p-4 space-y-4">
        <div>
          <h4 className="text-[9px] font-black uppercase tracking-widest text-stone-500 mb-2">Passive Perception</h4>
          <div className="flex flex-col gap-1">
            {characters?.map(c => (
              <div key={c._id} className="flex justify-between text-xs font-medium">
                <span className="text-stone-300">{c.name}</span>
                <span className="text-amber-500 font-bold">{c.stats?.WIS ? Math.floor((c.stats.WIS - 10)/2) + 10 : 10}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-[9px] font-black uppercase tracking-widest text-stone-500 mb-2">Generators</h4>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={generateNPC} className="bg-stone-800 border border-stone-700 p-2 rounded flex flex-col items-center gap-1 hover:bg-stone-700 hover:text-stone-100 transition-colors">
              <UserIcon /> <span className="text-[8px] uppercase font-black">NPC</span>
            </button>
            <button onClick={generateTavern} className="bg-stone-800 border border-stone-700 p-2 rounded flex flex-col items-center gap-1 hover:bg-stone-700 hover:text-stone-100 transition-colors">
              <Scroll className="w-4 h-4" /> <span className="text-[8px] uppercase font-black">Tavern</span>
            </button>
          </div>
        </div>

        <div>
          <button onClick={dropLoot} className="w-full bg-amber-700/20 text-amber-500 border border-amber-900/50 p-3 rounded-lg flex items-center justify-center gap-2 hover:bg-amber-700/40 hover:text-amber-400 transition-colors">
            <Skull className="w-4 h-4" /> <span className="text-[9px] font-black uppercase tracking-widest">Drop Random Loot</span>
          </button>
        </div>
      </div>
      
      {/* Generated Modal */}
      <AnimatePresence>
        {generatedResult && (
          <div className="fixed inset-0 z-[100] bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#fdfaf6] border-2 border-[#d4c5b0] p-8 rounded-3xl shadow-[0_0_40px_rgba(217,119,6,0.2)] w-full max-w-sm relative overflow-hidden">
               <div className="absolute inset-0 opacity-[0.4] mix-blend-multiply pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />
               <button onClick={() => setGeneratedResult(null)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 font-bold z-10">✕</button>
               
               <div className="relative z-10 text-center">
                 <Scroll className="w-12 h-12 text-amber-700 mx-auto mb-4" />
                 <h3 className="text-xl font-black text-stone-900 uppercase tracking-widest mb-2 border-b border-[#d4c5b0] pb-2 inline-block">{generatedResult.title}</h3>
                 <p className="text-stone-700 font-medium italic text-lg leading-relaxed mb-8">"{generatedResult.text}"</p>
                 
                 <button onClick={sendToChat} className="w-full bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-stone-900 font-black px-6 py-4 rounded-xl uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2">
                   <Send className="w-4 h-4" /> Kirim ke Tavern Chat
                 </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

const UserIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
