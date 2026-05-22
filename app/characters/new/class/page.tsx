"use client";

import { useState } from "react";
import { useCharacterStore } from "@/store/useCharacterStore";
import { CLASSES, SUBCLASSES, SPELL_DATABASE } from "@/lib/dnd-data";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  ChevronDown, 
  ShieldAlert, 
  Swords, 
  Heart, 
  Zap, 
  BookOpen, 
  Hexagon, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";

const playClickSound = () => {
  try {
    const audio = new Audio('/sounds/click.mp3');
    audio.volume = 0.1;
    audio.play().catch(() => {});
  } catch (e) {}
};

export default function ClassSelectionStep() {
  const { charClass, subclass, updateField } = useCharacterStore();
  
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "FEATURES" | "SPELLS">("OVERVIEW");
  const [openFeature, setOpenFeature] = useState<string | null>(null);

  const handleClassChange = (newClass: string) => {
    if (charClass !== newClass) playClickSound();
    updateField("charClass", newClass);
    updateField("subclass", ""); 
    updateField("selectedClassSkills", []);
    updateField("equipmentSelections", {});
    updateField("selectedCantrips", []);
    updateField("selectedSpells", []);
    setOpenFeature(null);
    setActiveTab("OVERVIEW");
  };

  const toggleFeature = (featureName: string) => {
    playClickSound();
    setOpenFeature(prev => prev === featureName ? null : featureName);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl pb-24 relative z-10">
      <div className="relative">
        <h2 className="text-4xl font-black text-stone-900 tracking-tighter uppercase relative z-10 flex items-center gap-3">
          <Swords className="w-8 h-8 text-amber-700" /> Choose a Class
        </h2>
        <p className="text-stone-500 mt-2 font-bold uppercase tracking-[0.2em] text-xs relative z-10">Pilih jalan hidup utamamu dan taklukkan Realm dengan kemampuan unikmu.</p>
      </div>
      
      <div className="flex flex-col gap-5">
        {Object.entries(CLASSES).map(([className, data]) => {
          const isSelected = charClass === className;
          
          return (
            <motion.div 
              layout
              key={className} 
              className={`rounded-2xl border transition-all duration-500 overflow-hidden relative group backdrop-blur-sm
                ${isSelected ? "bg-white/95 border-amber-600 shadow-xl shadow-amber-900/10 ring-1 ring-amber-600/30" : 
                "bg-white/60 border-[#d4c5b0] hover:border-[#a6937a] hover:bg-white/80"}`}
            >
              <div onClick={() => handleClassChange(className)} className={`cursor-pointer flex items-center p-5 transition-colors relative overflow-hidden ${isSelected ? 'bg-[#f4efe6] border-b border-[#d4c5b0]' : ''}`}>
                
                <div className="relative">
                  <div className={`w-20 h-20 rounded-2xl bg-cover bg-center shrink-0 border-2 shadow-md flex items-center justify-center text-4xl z-10 relative transition-all duration-500 
                    ${isSelected ? 'border-amber-500 scale-105 bg-[#fdfaf6]' : 'border-[#d4c5b0] bg-[#fdfaf6] group-hover:border-amber-600/50 group-hover:scale-105'}`} 
                    style={data.image ? { backgroundImage: `url('${data.image}')`, filter: `sepia(0.2) ${data.imageFilter || 'none'}` } : {}}
                  >
                    {!data.image && data.icon}
                  </div>
                </div>

                <div className="ml-6 flex-1 relative z-10">
                  <h3 className="text-3xl font-black text-stone-900 uppercase tracking-tighter drop-shadow-sm">{className}</h3>
                  <div className="flex flex-wrap gap-3 mt-2 text-[10px] font-black uppercase tracking-widest text-stone-500">
                    <span className="bg-[#fdfaf6] px-3 py-1.5 rounded-lg border border-[#d4c5b0] shadow-sm flex items-center gap-1.5">
                      <Heart className="w-3 h-3 text-red-700" /> d{data.hitDie} Hit Die
                    </span>
                    <span className="bg-[#fdfaf6] px-3 py-1.5 rounded-lg border border-[#d4c5b0] shadow-sm flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-amber-600" /> {data.primary}
                    </span>
                    {data.isCaster && (
                      <span className="bg-amber-100 text-amber-900 px-3 py-1.5 rounded-lg border border-amber-300 shadow-sm flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" /> Spellcaster
                      </span>
                    )}
                  </div>
                </div>

                <div className={`mr-4 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 relative z-10
                  ${isSelected ? 'bg-amber-600 border-amber-500 text-stone-900 shadow-md scale-110' : 'bg-white border-[#d4c5b0] text-transparent group-hover:border-stone-400'}`}>
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>

              <AnimatePresence>
                {isSelected && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                    className="bg-[#fdfaf6] flex flex-col"
                  >
                    
                    <div className="flex border-b border-[#d4c5b0] px-8 bg-white/80 relative overflow-x-auto custom-scrollbar">
                      <button onClick={() => { playClickSound(); setActiveTab("OVERVIEW"); }} className={`py-5 px-2 text-[11px] font-black uppercase tracking-[0.2em] border-b-2 mr-8 transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === "OVERVIEW" ? 'text-amber-700 border-amber-700' : 'text-stone-500 border-transparent hover:text-stone-700'}`}>
                        <Hexagon className="w-4 h-4" /> OVERVIEW
                      </button>
                      <button onClick={() => { playClickSound(); setActiveTab("FEATURES"); }} className={`py-5 px-2 text-[11px] font-black uppercase tracking-[0.2em] border-b-2 mr-8 transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === "FEATURES" ? 'text-amber-700 border-amber-700' : 'text-stone-500 border-transparent hover:text-stone-700'}`}>
                        <ShieldAlert className="w-4 h-4" /> CLASS FEATURES
                      </button>
                      {data.isCaster && (
                         <button onClick={() => { playClickSound(); setActiveTab("SPELLS"); }} className={`py-5 px-2 text-[11px] font-black uppercase tracking-[0.2em] border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === "SPELLS" ? 'text-amber-700 border-amber-700' : 'text-stone-500 border-transparent hover:text-stone-700'}`}>
                           <BookOpen className="w-4 h-4" /> SPELLS PREVIEW
                         </button>
                      )}
                    </div>

                    <div className="p-8 overflow-hidden relative">
                      <AnimatePresence mode="wait">
                        
                        {activeTab === "OVERVIEW" && (
                          <motion.div 
                            key="overview"
                            initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} transition={{ duration: 0.2 }}
                            className="space-y-8"
                          >
                            <p className="text-sm text-stone-700 leading-relaxed font-medium italic border-l-4 border-amber-600/50 pl-5 py-3 bg-amber-50/50 rounded-r-xl">{data.desc}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="bg-white p-6 rounded-2xl border border-[#d4c5b0] shadow-sm flex flex-col justify-center relative overflow-hidden group">
                                <div className="absolute -right-4 -bottom-4 opacity-5 text-stone-400 group-hover:scale-110 transition-transform duration-500"><ShieldAlert className="w-32 h-32" /></div>
                                <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest block mb-4 relative z-10">Armor & Weapons</span>
                                <div className="space-y-3 relative z-10">
                                  <div>
                                    <span className="text-[9px] text-amber-700 uppercase tracking-widest font-black block mb-1">Armor</span>
                                    <span className="text-sm text-stone-900 font-bold">{data.proficiencies?.armor || "None"}</span>
                                  </div>
                                  <div>
                                    <span className="text-[9px] text-amber-700 uppercase tracking-widest font-black block mb-1">Weapons</span>
                                    <span className="text-sm text-stone-900 font-bold">{data.proficiencies?.weapons || "None"}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-white p-6 rounded-2xl border border-[#d4c5b0] shadow-sm flex flex-col justify-between relative overflow-hidden group">
                                <div className="absolute -right-4 -bottom-4 opacity-5 text-stone-400 group-hover:scale-110 transition-transform duration-500"><Hexagon className="w-32 h-32" /></div>
                                <div className="relative z-10">
                                  <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest block mb-3">Saving Throws</span>
                                  <div className="flex gap-2">
                                    {data.saves?.map((save: string) => (
                                      <span key={save} className="bg-[#fdfaf6] border border-[#d4c5b0] px-3 py-1.5 rounded-lg text-xs font-black text-stone-800 shadow-sm">{save}</span>
                                    ))}
                                  </div>
                                </div>
                                <div className="mt-5 relative z-10">
                                  <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest block mb-2">Skill Selection</span>
                                  <span className="text-xs text-stone-700 font-bold bg-[#fdfaf6] px-3 py-2 rounded-lg border border-[#d4c5b0] inline-block">Choose {data.skillCount} skills from class list</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {activeTab === "FEATURES" && (
                          <motion.div 
                            key="features"
                            initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} transition={{ duration: 0.2 }}
                            className="space-y-8"
                          >
                            <div className="space-y-3 mt-2">
                               <h4 className="text-[11px] font-black text-stone-900 mb-5 uppercase tracking-[0.2em] flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center border border-amber-200"><Sparkles className="w-4 h-4 text-amber-700" /></div>
                                 Level 1 Features
                               </h4>
                               {data.features?.map((feat: any) => (
                                 <motion.div layout key={feat.name} className="bg-white rounded-xl border border-[#d4c5b0] overflow-hidden transition-all duration-300">
                                   <button onClick={() => toggleFeature(feat.name)} className="w-full flex justify-between items-center p-5 hover:bg-[#f4efe6] transition-colors group">
                                     <div className="text-left">
                                       <h5 className="text-sm font-black text-stone-900 group-hover:text-amber-700 transition-colors">{feat.name}</h5>
                                       <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest mt-1">{feat.level.includes("Level") ? feat.level : `Level ${feat.level}`}</p>
                                     </div>
                                     <ChevronDown className={`w-5 h-5 text-stone-400 transform transition-transform duration-300 ${openFeature === feat.name ? "rotate-180 text-amber-600" : ""}`} />
                                   </button>
                                   <AnimatePresence>
                                     {openFeature === feat.name && (
                                       <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-[#fdfaf6] border-t border-[#d4c5b0]">
                                         <div className="p-6 text-sm text-stone-700 leading-relaxed font-medium">{feat.desc}</div>
                                       </motion.div>
                                     )}
                                   </AnimatePresence>
                                 </motion.div>
                               ))}

                               {SUBCLASSES[className] && (
                                 <div className="pt-6 mt-8 border-t-2 border-[#d4c5b0]">
                                   <div className="flex justify-between items-end mb-6">
                                     <h4 className="text-[11px] font-black text-stone-900 uppercase tracking-[0.2em] flex items-center gap-3">
                                       <div className="w-8 h-8 rounded-lg bg-amber-200 flex items-center justify-center border border-amber-300"><Hexagon className="w-4 h-4 text-amber-800" /></div>
                                       Spesialisasi (Subclass)
                                     </h4>
                                     <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all duration-500 flex items-center gap-1.5
                                       ${subclass ? 'bg-green-100 text-green-700 border-green-200 shadow-sm' : 'bg-red-50 text-red-600 border-red-200 animate-pulse'}`}>
                                       {subclass ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                       {subclass ? 'Terpilih' : 'Wajib Dipilih'}
                                     </span>
                                   </div>
                                   
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                     {SUBCLASSES[className].map((sub: any) => {
                                       const isSubSelected = subclass === sub.name;
                                       return (
                                         <motion.div 
                                           layout
                                           key={sub.name} 
                                           onClick={() => { playClickSound(); updateField("subclass", sub.name); }} 
                                           className={`cursor-pointer rounded-2xl border-2 transition-all duration-300 overflow-hidden relative group
                                             ${isSubSelected ? 'bg-amber-100 border-amber-1000 shadow-md' : 'bg-white border-[#d4c5b0] hover:border-amber-700 hover:bg-[#fcfbf9]'}`}
                                         >
                                           <div className="p-6 relative z-10">
                                              <div className="flex justify-between items-start mb-3">
                                                <h5 className={`text-lg font-black tracking-tighter uppercase ${isSubSelected ? 'text-amber-800' : 'text-stone-800'}`}>{sub.name}</h5>
                                                {isSubSelected && <div className="w-2 h-2 rounded-full bg-amber-1000 shadow-sm" />}
                                              </div>
                                              <p className="text-xs text-stone-500 leading-relaxed font-medium">{sub.desc}</p>
                                           </div>
                                           
                                           <AnimatePresence>
                                             {isSubSelected && sub.bonuses && (
                                               <motion.div 
                                                 initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                                 className="bg-[#fdfaf6] border-t border-amber-300 px-6 py-5 relative z-10"
                                               >
                                                 <span className="text-[9px] font-black text-amber-800 uppercase tracking-widest block mb-3 flex items-center gap-2">
                                                   <Sparkles className="w-3 h-3" /> Instantly Granted:
                                                 </span>
                                                 <ul className="space-y-2">
                                                   {sub.bonuses.map((bns: string, i: number) => (
                                                      <li key={i} className="text-[11px] text-stone-700 font-bold flex items-start gap-2">
                                                        <span className="text-amber-800 mt-0.5 opacity-70">✦</span> {bns}
                                                      </li>
                                                   ))}
                                                 </ul>
                                               </motion.div>
                                             )}
                                           </AnimatePresence>
                                         </motion.div>
                                       )
                                     })}
                                   </div>
                                 </div>
                               )}
                            </div>
                          </motion.div>
                        )}

                        {activeTab === "SPELLS" && (
                          <motion.div 
                            key="spells"
                            initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} transition={{ duration: 0.2 }}
                            className="space-y-8"
                          >
                            <div className="flex items-start md:items-center gap-5 bg-amber-100 border border-amber-300 p-6 rounded-2xl shadow-sm">
                               <div className="p-3 bg-amber-200 rounded-xl border border-amber-300">
                                 <Sparkles className="w-6 h-6 text-amber-900" />
                               </div>
                               <div>
                                 <h4 className="text-sm font-black text-amber-900 mb-2 uppercase tracking-wide">Kapasitas Sihir Level 1</h4>
                                 <p className="text-xs text-stone-600 leading-relaxed font-medium">Anda akan memilih mantra secara spesifik di <strong>Tahap 5: Equipment</strong>. Berikut adalah gambaran potensi magis Anda:</p>
                               </div>
                            </div>

                            {data.spellcasting && (
                              <div className="grid grid-cols-3 gap-4">
                                 <div className="bg-white border border-[#d4c5b0] p-5 rounded-2xl text-center shadow-sm relative overflow-hidden group">
                                    <span className="block text-3xl font-black text-cyan-600 mb-2">{data.spellcasting.cantrips}</span>
                                    <span className="text-[9px] font-black text-stone-500 uppercase tracking-widest">Cantrips</span>
                                 </div>
                                 <div className="bg-white border border-[#d4c5b0] p-5 rounded-2xl text-center shadow-sm relative overflow-hidden group">
                                    <span className="block text-3xl font-black text-amber-800 mb-2">{data.spellcasting.spellsKnown}</span>
                                    <span className="text-[9px] font-black text-stone-500 uppercase tracking-widest">Spells Known</span>
                                 </div>
                                 <div className="bg-white border border-[#d4c5b0] p-5 rounded-2xl text-center shadow-sm relative overflow-hidden group">
                                    <span className="block text-3xl font-black text-yellow-600 mb-2">{data.spellcasting.slots}</span>
                                    <span className="text-[9px] font-black text-stone-500 uppercase tracking-widest">1st-Lvl Slots</span>
                                 </div>
                              </div>
                            )}

                            {SPELL_DATABASE[className] && (
                              <div className="space-y-6 mt-6">
                                {Object.entries(SPELL_DATABASE[className]).map(([level, spells]: [string, any]) => (
                                  <div key={level} className="bg-white border border-[#d4c5b0] rounded-2xl p-6 shadow-sm">
                                    <h5 className="text-[11px] font-black text-stone-900 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                                      <BookOpen className="w-4 h-4 text-stone-500" /> {level} List
                                    </h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      {spells.slice(0, 4).map((spell: any) => (
                                         <div key={spell.name} className="bg-[#fdfaf6] border border-[#d4c5b0] p-4 rounded-xl transition-colors hover:border-[#a6937a] group cursor-default">
                                           <span className="text-xs font-black text-stone-800 block mb-1.5 group-hover:text-amber-700 transition-colors">{spell.name}</span>
                                           <span className="text-[10px] font-medium text-stone-600 truncate block">{spell.desc}</span>
                                         </div>
                                      ))}
                                    </div>
                                    {spells.length > 4 && (
                                      <p className="text-[9px] font-black text-center text-stone-500 uppercase tracking-widest mt-5 pt-4 border-t border-[#d4c5b0]">
                                        + {spells.length - 4} Mantra Lainnya Tersedia
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}