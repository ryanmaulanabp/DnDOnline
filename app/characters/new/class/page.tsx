"use client";

import { useState } from "react";
import { useCharacterStore } from "@/store/useCharacterStore";
import { CLASSES, SUBCLASSES, SPELL_DATABASE } from "@/lib/dnd-data";
import { motion, AnimatePresence } from "framer-motion";

// Helper Audio Cue (Micro-Interaction)
const playClickSound = () => {
  try {
    // Pastikan ada file click.mp3 di folder public/sounds/ jika ingin fitur ini menyala
    const audio = new Audio('/sounds/click.mp3');
    audio.volume = 0.1;
    audio.play().catch(() => {});
  } catch (e) {}
};

export default function ClassSelectionStep() {
  const { charClass, subclass, updateField } = useCharacterStore();
  
  // State untuk Tab (Overview / Features / Spells) dan Accordion yang terbuka
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
    <div className="space-y-8 animate-fadeIn max-w-4xl pb-24">
      <div>
        <h2 className="text-3xl font-black text-white">Choose a Class</h2>
        <p className="text-slate-400 mt-1">Pilih jalan hidup utamamu dan taklukkan Realm dengan kemampuan unikmu.</p>
      </div>
      
      <div className="flex flex-col gap-4">
        {Object.entries(CLASSES).map(([className, data]) => {
          const isSelected = charClass === className;
          
          return (
            <motion.div 
              layout
              key={className} 
              className={`rounded-xl border transition-colors duration-300 overflow-hidden ${isSelected ? "bg-[#181b26] border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.15)]" : "bg-[#181b26] border-[#2d3245] hover:border-[#3e455c]"}`}
            >
              {/* --- HEADER CLASS --- */}
              <div onClick={() => handleClassChange(className)} className={`cursor-pointer flex items-center p-4 transition-colors relative overflow-hidden ${isSelected ? 'bg-[#2d3245]/30 border-b border-[#2d3245]' : ''}`}>
                
                {/* Avatar with Particle Effect on Selected */}
                <div className="relative">
                  <div className={`w-16 h-16 rounded-xl bg-cover bg-center shrink-0 border shadow-inner flex items-center justify-center text-3xl z-10 relative transition-all duration-500 ${isSelected ? 'border-blue-400 scale-105 bg-[#0f111a]' : 'border-[#3e455c] bg-[#0f111a]'}`} style={data.image ? { backgroundImage: `url('${data.image}')` } : {}}>
                    {!data.image && data.icon}
                  </div>
                  
                  {/* Glowing Particles Background */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.5 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="absolute -inset-4 bg-blue-500/20 blur-xl rounded-full z-0 pointer-events-none"
                      />
                    )}
                  </AnimatePresence>
                </div>

                <div className="ml-5 flex-1 relative z-10">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">{className}</h3>
                  <div className="flex gap-3 mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    <span className="bg-[#0f111a] px-2 py-1 rounded border border-[#2d3245] shadow-sm">Hit Die: d{data.hitDie}</span>
                    <span className="bg-[#0f111a] px-2 py-1 rounded border border-[#2d3245] shadow-sm">Primary: {data.primary}</span>
                    {data.isCaster && <span className="bg-blue-900/20 text-blue-400 px-2 py-1 rounded border border-blue-900/50 shadow-sm">✨ Spellcaster</span>}
                  </div>
                </div>
              </div>

              {/* --- KONTEN CLASS (EXPANDED DENGAN ANIMASI) --- */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                    className="bg-[#0f111a] flex flex-col"
                  >
                    
                    {/* TAB NAVIGASI */}
                    <div className="flex border-b border-[#2d3245] px-6 bg-[#181b26] relative overflow-x-auto custom-scrollbar">
                      <button onClick={() => { playClickSound(); setActiveTab("OVERVIEW"); }} className={`py-4 px-2 text-xs font-black uppercase tracking-widest border-b-2 mr-6 transition-colors whitespace-nowrap ${activeTab === "OVERVIEW" ? 'text-blue-500 border-blue-500' : 'text-slate-500 border-transparent hover:text-slate-300'}`}>OVERVIEW</button>
                      <button onClick={() => { playClickSound(); setActiveTab("FEATURES"); }} className={`py-4 px-2 text-xs font-black uppercase tracking-widest border-b-2 mr-6 transition-colors whitespace-nowrap ${activeTab === "FEATURES" ? 'text-blue-500 border-blue-500' : 'text-slate-500 border-transparent hover:text-slate-300'}`}>CLASS FEATURES</button>
                      {data.isCaster && (
                         <button onClick={() => { playClickSound(); setActiveTab("SPELLS"); }} className={`py-4 px-2 text-xs font-black uppercase tracking-widest border-b-2 transition-colors whitespace-nowrap ${activeTab === "SPELLS" ? 'text-blue-500 border-blue-500' : 'text-slate-500 border-transparent hover:text-slate-300'}`}>SPELLS PREVIEW</button>
                      )}
                    </div>

                    <div className="p-6 overflow-hidden">
                      <AnimatePresence mode="wait">
                        
                        {/* TAB 1: OVERVIEW */}
                        {activeTab === "OVERVIEW" && (
                          <motion.div 
                            key="overview"
                            initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} transition={{ duration: 0.2 }}
                            className="space-y-6"
                          >
                            <p className="text-sm text-slate-300 leading-relaxed font-medium italic border-l-2 border-slate-600 pl-3">{data.desc}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-[#181b26] p-4 rounded-xl border border-[#2d3245] flex flex-col justify-center">
                                <span className="text-[10px] font-black text-slate-500 uppercase block mb-2">Armor & Weapons</span>
                                <span className="text-xs text-white font-medium mb-1">Armor: {data.proficiencies?.armor || "None"}</span>
                                <span className="text-xs text-white font-medium">Weapons: {data.proficiencies?.weapons || "None"}</span>
                              </div>
                              <div className="bg-[#181b26] p-4 rounded-xl border border-[#2d3245] flex flex-col justify-between">
                                <div>
                                  <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Saving Throws</span>
                                  <span className="text-xs text-white font-bold">{data.saves?.join(", ") || "-"}</span>
                                </div>
                                <div className="mt-3">
                                  <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Skill Selection</span>
                                  <span className="text-xs text-white font-bold">Choose {data.skillCount} skills</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* TAB 2: FEATURES */}
                        {activeTab === "FEATURES" && (
                          <motion.div 
                            key="features"
                            initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} transition={{ duration: 0.2 }}
                            className="space-y-6"
                          >
                            {/* Accordion Level 1 Features */}
                            <div className="space-y-2 mt-2">
                               <h4 className="text-sm font-black text-white mb-4 flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Level 1 Features</h4>
                               {data.features?.map((feat: any) => (
                                 <motion.div layout key={feat.name} className="bg-[#181b26] rounded border border-[#2d3245] overflow-hidden">
                                   <button onClick={() => toggleFeature(feat.name)} className="w-full flex justify-between items-center p-4 hover:bg-[#2d3245]/50 transition-colors">
                                     <div className="text-left"><h5 className="text-sm font-bold text-white">{feat.name}</h5><p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{feat.level}</p></div>
                                     <span className={`text-slate-500 transform transition-transform duration-300 ${openFeature === feat.name ? "rotate-180" : ""}`}>▼</span>
                                   </button>
                                   <AnimatePresence>
                                     {openFeature === feat.name && (
                                       <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-[#0f111a] border-t border-[#2d3245]">
                                         <div className="p-4 text-sm text-slate-300 leading-relaxed">{feat.desc}</div>
                                       </motion.div>
                                     )}
                                   </AnimatePresence>
                                 </motion.div>
                               ))}

                               {/* SUBCLASS SELECTION (Dengan Dinamika Visual Kuat) */}
                               {SUBCLASSES[className] && (
                                 <div className="pt-4 mt-6 border-t border-[#2d3245]">
                                   <div className="flex justify-between items-center mb-4">
                                     <h4 className="text-sm font-black text-white flex items-center gap-2">
                                       <span className="w-1.5 h-1.5 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.8)]"></span> Spesialisasi (Subclass)
                                     </h4>
                                     <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded transition-colors ${subclass ? 'bg-green-900/40 text-green-400 border border-green-900/50' : 'bg-red-900/40 text-red-400 border border-red-900/50'}`}>{subclass ? '✓ Terpilih' : 'Wajib Dipilih'}</span>
                                   </div>
                                   
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     {SUBCLASSES[className].map((sub: any) => {
                                       const isSubSelected = subclass === sub.name;
                                       return (
                                         <motion.div 
                                           layout
                                           key={sub.name} 
                                           onClick={() => { playClickSound(); updateField("subclass", sub.name); }} 
                                           className={`cursor-pointer rounded-xl border-2 transition-all duration-300 overflow-hidden ${isSubSelected ? 'bg-purple-900/20 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.15)]' : 'bg-[#181b26] border-[#3e455c] hover:border-purple-500/50'}`}
                                         >
                                           <div className="p-5">
                                              <h5 className={`text-sm font-black tracking-tight mb-2 ${isSubSelected ? 'text-purple-400' : 'text-slate-200'}`}>{sub.name}</h5>
                                              <p className="text-[11px] text-slate-400 leading-relaxed">{sub.desc}</p>
                                           </div>
                                           
                                           {/* BONUS PROFICIENCIES & SPELLS (Muncul Cair saat Dipilih) */}
                                           <AnimatePresence>
                                             {isSubSelected && sub.bonuses && (
                                               <motion.div 
                                                 initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                                 className="bg-[#0f111a] border-t border-purple-900/40 px-5 py-4"
                                               >
                                                 <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest block mb-2">Instantly Granted:</span>
                                                 <ul className="space-y-1.5">
                                                   {sub.bonuses.map((bns: string, i: number) => (
                                                      <li key={i} className="text-[10px] text-slate-300 font-bold flex items-start gap-2">
                                                        <span className="text-purple-500 mt-0.5">✦</span> {bns}
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

                        {/* TAB 3: SPELLS PREVIEW */}
                        {activeTab === "SPELLS" && (
                          <motion.div 
                            key="spells"
                            initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} transition={{ duration: 0.2 }}
                            className="space-y-6"
                          >
                            <div className="flex items-start md:items-center gap-4 bg-blue-900/10 border border-blue-900/30 p-4 rounded-xl">
                               <span className="text-2xl mt-1 md:mt-0">✨</span>
                               <div>
                                 <h4 className="text-sm font-black text-blue-400 mb-1">Kapasitas Sihir Level 1</h4>
                                 <p className="text-[11px] text-slate-400 leading-relaxed">Anda akan memilih mantra secara spesifik di <strong>Tahap 5: Equipment</strong>. Berikut adalah gambarannya:</p>
                               </div>
                            </div>

                            {data.spellcasting && (
                              <div className="grid grid-cols-3 gap-2">
                                 <div className="bg-[#181b26] border border-[#2d3245] p-3 rounded-lg text-center shadow-inner">
                                    <span className="block text-xl font-black text-cyan-500 mb-1">{data.spellcasting.cantrips}</span>
                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Cantrips</span>
                                 </div>
                                 <div className="bg-[#181b26] border border-[#2d3245] p-3 rounded-lg text-center shadow-inner">
                                    <span className="block text-xl font-black text-purple-500 mb-1">{data.spellcasting.spellsKnown}</span>
                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Spells Known</span>
                                 </div>
                                 <div className="bg-[#181b26] border border-[#2d3245] p-3 rounded-lg text-center shadow-inner">
                                    <span className="block text-xl font-black text-yellow-500 mb-1">{data.spellcasting.slots}</span>
                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">1st-Lvl Slots</span>
                                 </div>
                              </div>
                            )}

                            {SPELL_DATABASE[className] && (
                              <div className="space-y-4 mt-4">
                                {Object.entries(SPELL_DATABASE[className]).map(([level, spells]: [string, any]) => (
                                  <div key={level} className="bg-[#181b26] border border-[#2d3245] rounded-xl p-4">
                                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{level} List</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      {spells.slice(0, 4).map((spell: any) => (
                                         <div key={spell.name} className="bg-[#0f111a] border border-[#3e455c] p-3 rounded-lg transition-colors hover:border-slate-500 cursor-default">
                                           <span className="text-xs font-bold text-slate-200 block mb-1">{spell.name}</span>
                                           <span className="text-[10px] text-slate-500 truncate block">{spell.desc}</span>
                                         </div>
                                      ))}
                                    </div>
                                    {spells.length > 4 && (
                                      <p className="text-[9px] text-center text-slate-500 uppercase tracking-widest mt-3 pt-2 border-t border-[#2d3245]">
                                        + {spells.length - 4} Mantra Lainnya
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