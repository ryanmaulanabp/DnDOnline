"use client";
import { Tooltip, CONDITIONS_LORE } from "./HeroModules";

export const CombatLogPanel = ({ combatLog, activeConditions, toggleCondition }: any) => (
  <div className="lg:col-span-3 flex flex-col gap-6 h-full max-h-[800px]">
    
    <div className="bg-white border border-amber-900/20 rounded-[21px] p-5 shadow-xl shrink-0">
       <div className="flex justify-between items-center mb-4 pb-3 border-b border-amber-900/10">
          <h3 className="text-[9px] font-black text-stone-600 uppercase tracking-[0.4em]">Active Conditions</h3>
          <span className="text-[9px] font-bold text-stone-500">{activeConditions.length} Active</span>
       </div>
       
       {/* 1 BARIS 1 EFEK: Sangat rapat (gap-1, py-1.5) agar tidak makan tinggi layar */}
       <div className="flex flex-col gap-1 mb-2">
          {Object.keys(CONDITIONS_LORE).map(c => {
             const isActive = activeConditions.includes(c);
             return (
               <Tooltip key={c} text={CONDITIONS_LORE[c].desc}>
                 <button onClick={() => toggleCondition(c)} className={`w-full px-4 py-[6px] rounded-md text-[9px] font-black uppercase tracking-widest transition-all border flex items-center justify-between ${isActive ? 'bg-red-600/20 text-red-500 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'bg-stone-100 text-stone-500 border-amber-900/10 hover:border-slate-500 hover:text-stone-700'}`}>
                   <span>{c}</span>
                   {isActive && <span className="text-sm shrink-0">{CONDITIONS_LORE[c].icon}</span>}
                 </button>
               </Tooltip>
             );
          })}
       </div>
       
       {activeConditions.length > 0 && (
         <div className="mt-3 space-y-2 border-t border-amber-900/10 pt-3">
            {activeConditions.map((c: string) => (
              <div key={`desc-${c}`} className="flex items-start gap-3 bg-red-950/20 p-2.5 rounded-lg border border-red-900/30">
                 <span className="text-base leading-none">{CONDITIONS_LORE[c].icon}</span>
                 <div>
                    <span className="text-[9px] font-black text-red-400 uppercase tracking-widest block mb-0.5">{c}</span>
                    <p className="text-[9px] text-stone-600 leading-tight font-medium">{CONDITIONS_LORE[c].desc}</p>
                 </div>
              </div>
            ))}
         </div>
       )}
    </div>
    
    <div className="bg-white border border-amber-900/20 rounded-[21px] p-5 shadow-xl flex flex-col flex-1 min-h-0">
       <div className="flex items-center gap-2 mb-4 pb-3 border-b border-amber-900/10">
          <span className="text-sm text-amber-800">◉</span><h3 className="text-[9px] font-black text-stone-600 uppercase tracking-[0.3em]">Combat Telemetry</h3>
       </div>
       <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
          {combatLog.map((log:any, i:number) => (
            <div key={i} className={`flex flex-col gap-0.5 ${i === 0 ? 'opacity-100' : 'opacity-40'}`}>
               <span className="text-[7px] font-black text-amber-800">{log.time}</span>
               <span className={`text-[9px] font-medium leading-snug ${i === 0 ? 'text-stone-900' : 'text-stone-600'}`}>{log.msg}</span>
            </div>
          ))}
       </div>
    </div>

  </div>
);