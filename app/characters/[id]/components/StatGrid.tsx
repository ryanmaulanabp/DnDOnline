"use client";
import { motion } from "framer-motion";

export const StatGrid = ({ hero, mods, rollDice }: any) => {
  const formatMod = (mod: number) => (mod >= 0 ? `+${mod}` : `${mod}`);
  const stats = ["STR", "DEX", "CON", "INT", "WIS", "CHA"] as const;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 my-12 relative z-10">
      {stats.map((s) => (
        <motion.div 
          key={s} whileHover={{ y: -10, borderColor: "#3b82f6" }}
          className="bg-white border-2 border-amber-900/20 p-8 rounded-[3rem] flex flex-col items-center shadow-2xl group cursor-default"
        >
          <span className="text-[11px] font-black text-stone-500 uppercase tracking-[0.3em] mb-4 group-hover:text-amber-800 transition-colors">{s}</span>
          
          <div onClick={() => rollDice(20, mods[s], `${s} Check`)} 
            className="w-24 h-24 rounded-full bg-stone-100 border-2 border-amber-900/20 flex items-center justify-center mb-6 cursor-pointer hover:border-amber-800 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all active:scale-90">
             <span className="text-4xl font-black text-stone-900 tracking-tighter">{formatMod(mods[s])}</span>
          </div>

          <div className="bg-slate-950 px-5 py-2 rounded-2xl border border-amber-900/10 shadow-inner">
             <span className="text-sm font-black text-stone-600 group-hover:text-stone-900 transition-colors">{hero.stats[s]}</span>
          </div>

          <button onClick={() => rollDice(20, mods[s], `${s} Saving Throw`)}
            className="mt-6 text-[9px] font-black text-stone-400 hover:text-amber-700 uppercase tracking-widest border border-transparent hover:border-amber-900/50 px-3 py-1 rounded-lg transition-all">
            Saving Throw
          </button>
        </motion.div>
      ))}
    </div>
  );
};