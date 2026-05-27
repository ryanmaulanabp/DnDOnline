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
      
      {/* Title section with D&D typography */}
      <div className="relative">
        <h2 className="text-4xl font-black text-stone-900 tracking-tighter uppercase relative z-10 flex items-center gap-3">
          <Swords className="w-8 h-8 text-amber-700 fill-amber-700/10" /> Pilih Kelas Pahlawan
        </h2>
        <p className="text-stone-500 mt-2 font-bold uppercase tracking-[0.2em] text-[10px] relative z-10 leading-relaxed">
          Pilih jalan hidup utamamu dan taklukkan Realm dengan kemampuan unik serta spesialisasi yang melegenda.
        </p>
      </div>
      
      {/* Class List Grid with Shared Layout Animations */}
      <motion.div layout="position" className="flex flex-col gap-6">
        {Object.entries(CLASSES).map(([className, data]) => {
          const isSelected = charClass === className;
          
          return (
            <motion.div 
              layout
              key={className} 
              className={`rounded-3xl border transition-all duration-500 overflow-hidden relative group backdrop-blur-sm shadow-sm
                ${isSelected ? "bg-white/95 border-amber-600 shadow-xl shadow-amber-900/10 ring-1 ring-amber-600/30" : 
                "bg-white/60 border-[#d4c5b0] hover:border-[#a6937a] hover:bg-white/80"}`}
            >
              {/* Class Card Header Click Trigger */}
              <div 
                onClick={() => handleClassChange(className)} 
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleClassChange(className);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-expanded={isSelected}
                aria-selected={isSelected}
                className={`cursor-pointer flex flex-col md:flex-row md:items-center p-5 gap-5 transition-colors relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${isSelected ? 'bg-[#f4efe6] border-b border-[#d4c5b0]' : ''}`}
              >
                
                {/* Image Avatar Wrapper */}
                <div className="relative shrink-0 mx-auto md:mx-0">
                  <div 
                    className={`w-24 h-24 rounded-2xl bg-cover bg-center shrink-0 border-2 shadow-md flex items-center justify-center text-4xl z-10 relative transition-all duration-500 
                      ${isSelected ? 'border-amber-500 scale-105 bg-[#fdfaf6]' : 'border-[#d4c5b0] bg-[#fdfaf6] group-hover:border-amber-600/50 group-hover:scale-105'}`} 
                    style={data.image ? { backgroundImage: `url('${data.image}')`, filter: `sepia(0.2) ${data.imageFilter || 'none'}` } : {}}
                  >
                    {!data.image && data.icon}
                  </div>
                </div>

                {/* Primary Card Title & Info Tags */}
                <div className="flex-1 text-center md:text-left relative z-10">
                  <h3 className="text-3xl font-black text-stone-900 uppercase tracking-tighter drop-shadow-sm flex items-center justify-center md:justify-start gap-3">
                    {className}
                  </h3>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mt-2.5 text-[9px] font-black uppercase tracking-widest text-stone-500">
                    <span className="bg-[#fdfaf6] px-3 py-1.5 rounded-xl border border-[#d4c5b0] shadow-inner flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-red-700 fill-red-700/10 shrink-0" /> d{data.hitDie} Hit Die
                    </span>
                    <span className="bg-[#fdfaf6] px-3 py-1.5 rounded-xl border border-[#d4c5b0] shadow-inner flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-600/10 shrink-0" /> {data.primary}
                    </span>
                    {data.isCaster && (
                      <span className="bg-amber-50 text-amber-900 px-3 py-1.5 rounded-xl border border-amber-300 shadow-inner flex items-center gap-1.5 font-extrabold">
                        <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0 animate-pulse" /> Spellcaster
                      </span>
                    )}
                  </div>
                </div>

                {/* Dynamic Choice Radio Check Indicator */}
                <div className="mx-auto md:mx-0 md:mr-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 relative z-10
                    ${isSelected ? 'bg-amber-700 border-amber-600 text-stone-100 shadow-md scale-110' : 'bg-white border-[#d4c5b0] text-transparent group-hover:border-stone-400'}`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Collapsible Expanding Section for Selected Class */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.45, ease: [0.04, 0.62, 0.23, 0.98] }}
                    className="bg-[#fdfaf6] flex flex-col"
                  >
                    
                    {/* Tab Navigation Menu */}
                    <div role="tablist" className="flex border-b border-[#d4c5b0] px-8 bg-white/80 relative overflow-x-auto custom-scrollbar">
                      {[
                        { id: "OVERVIEW", label: "OVERVIEW", icon: Hexagon },
                        { id: "FEATURES", label: "CLASS FEATURES", icon: ShieldAlert },
                        ...(data.isCaster ? [{ id: "SPELLS", label: "SPELLS PREVIEW", icon: BookOpen }] : [])
                      ].map((tab) => {
                        const isTabActive = activeTab === tab.id;
                        return (
                          <button 
                            key={tab.id}
                            role="tab"
                            aria-selected={isTabActive}
                            aria-controls={`panel-${tab.id.toLowerCase()}`}
                            onClick={() => { playClickSound(); setActiveTab(tab.id as any); }} 
                            className={`py-5 px-1.5 text-[10px] font-black uppercase tracking-[0.2em] mr-8 transition-colors whitespace-nowrap flex items-center gap-2 relative focus:outline-none
                              ${isTabActive ? 'text-amber-800 font-extrabold' : 'text-stone-500 hover:text-stone-700'}`}
                          >
                            <tab.icon className="w-4 h-4" /> {tab.label}
                            {isTabActive && (
                              <motion.div 
                                layoutId="activeClassTabUnderline" 
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-700" 
                                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Tab Content Panels */}
                    <div className="p-6 md:p-8 overflow-hidden relative">
                      <AnimatePresence mode="wait">
                        
                        {activeTab === "OVERVIEW" && (
                          <motion.div 
                            key="overview"
                            id="panel-overview"
                            role="tabpanel"
                            initial={{ x: -12, opacity: 0 }} 
                            animate={{ x: 0, opacity: 1 }} 
                            exit={{ x: 12, opacity: 0 }} 
                            transition={{ duration: 0.25 }}
                            className="space-y-6"
                          >
                            {/* Class Lore Quote */}
                            <p className="text-xs text-stone-700 leading-relaxed font-semibold italic border-l-4 border-amber-600/50 pl-5 py-3 bg-amber-50/50 rounded-r-xl">
                              {data.desc}
                            </p>
                            
                            {/* Class Attributes Overview Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              <div className="bg-white p-5 rounded-2xl border border-[#d4c5b0] shadow-sm flex flex-col justify-center relative overflow-hidden group hover:border-[#a6937a] transition-colors">
                                <div className="absolute -right-4 -bottom-4 opacity-5 text-stone-400 group-hover:scale-110 transition-transform duration-500 pointer-events-none"><ShieldAlert className="w-28 h-28" /></div>
                                <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest block mb-3.5 relative z-10">Kemahiran Senjata & Armor</span>
                                <div className="space-y-3 relative z-10">
                                  <div>
                                    <span className="text-[8px] text-amber-800 uppercase tracking-widest font-black block mb-0.5">Armor</span>
                                    <span className="text-xs text-stone-900 font-bold leading-normal">{data.proficiencies?.armor || "None"}</span>
                                  </div>
                                  <div>
                                    <span className="text-[8px] text-amber-800 uppercase tracking-widest font-black block mb-0.5">Weapons</span>
                                    <span className="text-xs text-stone-900 font-bold leading-normal">{data.proficiencies?.weapons || "None"}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="bg-white p-5 rounded-2xl border border-[#d4c5b0] shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-[#a6937a] transition-colors">
                                <div className="absolute -right-4 -bottom-4 opacity-5 text-stone-400 group-hover:scale-110 transition-transform duration-500 pointer-events-none"><Hexagon className="w-28 h-28" /></div>
                                <div className="relative z-10">
                                  <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest block mb-2.5">Saving Throws</span>
                                  <div className="flex gap-2.5">
                                    {data.saves?.map((save: string) => (
                                      <span key={save} className="bg-[#fdfaf6] border border-[#d4c5b0] px-3 py-1.5 rounded-lg text-xs font-black text-stone-800 shadow-sm">{save}</span>
                                    ))}
                                  </div>
                                </div>
                                <div className="mt-5 relative z-10">
                                  <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest block mb-1.5">Kapasitas Keahlian</span>
                                  <span className="text-[10px] text-stone-700 font-extrabold bg-[#fdfaf6] px-3.5 py-2 rounded-xl border border-[#d4c5b0] inline-block shadow-sm">
                                    Pilih {data.skillCount} skill dari daftar kelas
                                  </span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
 
                        {activeTab === "FEATURES" && (
                          <motion.div 
                            key="features"
                            id="panel-features"
                            role="tabpanel"
                            initial={{ x: -12, opacity: 0 }} 
                            animate={{ x: 0, opacity: 1 }} 
                            exit={{ x: 12, opacity: 0 }} 
                            transition={{ duration: 0.25 }}
                            className="space-y-6"
                          >
                            {/* Class Level 1 Features */}
                            <div className="space-y-3.5">
                               <h4 className="text-[10px] font-black text-stone-900 mb-4 uppercase tracking-[0.2em] flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-xl bg-amber-100/70 flex items-center justify-center border border-amber-200 shadow-sm"><Sparkles className="w-4 h-4 text-amber-700" /></div>
                                 Fitur Kelas Level 1
                               </h4>
                               {data.features?.map((feat: any) => {
                                 const isFeatOpen = openFeature === feat.name;
                                 return (
                                   <div key={feat.name} className="bg-white rounded-2xl border border-[#d4c5b0] overflow-hidden transition-colors hover:border-[#a6937a]">
                                     <button 
                                       onClick={() => toggleFeature(feat.name)} 
                                       aria-expanded={isFeatOpen}
                                       className="w-full flex justify-between items-center p-5 hover:bg-[#f4efe6]/50 transition-colors group focus:outline-none"
                                     >
                                       <div className="text-left">
                                         <h5 className="text-xs font-black text-stone-900 group-hover:text-amber-700 transition-colors">{feat.name}</h5>
                                         <p className="text-[9px] text-stone-500 font-bold uppercase tracking-widest mt-1">Level {feat.level}</p>
                                       </div>
                                       <ChevronDown className={`w-4 h-4 text-stone-400 transform transition-transform duration-300 shrink-0 ${isFeatOpen ? "rotate-180 text-amber-600" : ""}`} />
                                     </button>
                                     <AnimatePresence initial={false}>
                                       {isFeatOpen && (
                                         <motion.div 
                                           initial={{ height: 0, opacity: 0 }} 
                                           animate={{ height: "auto", opacity: 1 }} 
                                           exit={{ height: 0, opacity: 0 }} 
                                           className="bg-[#fdfaf6] border-t border-[#d4c5b0]"
                                         >
                                           <div className="p-5 text-xs text-stone-700 leading-relaxed font-semibold">{feat.desc}</div>
                                         </motion.div>
                                       )}
                                     </AnimatePresence>
                                   </div>
                                 );
                               })}
 
                               {/* Subclass Selection Panel */}
                               {SUBCLASSES[className] && (
                                 <div className="pt-6 mt-8 border-t border-[#d4c5b0] space-y-4">
                                   <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3.5 mb-4">
                                     <h4 className="text-[10px] font-black text-stone-900 uppercase tracking-[0.2em] flex items-center gap-3">
                                       <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center border border-amber-200 shadow-sm"><Hexagon className="w-4 h-4 text-amber-800" /></div>
                                       Spesialisasi Subclass
                                     </h4>
                                     <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all duration-500 flex items-center gap-1.5 self-start sm:self-auto
                                       ${subclass ? 'bg-green-50 text-green-700 border-green-200 shadow-sm' : 'bg-red-50 text-red-600 border-red-200 animate-pulse'}`}>
                                       {subclass ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3.5 h-3.5" />}
                                       {subclass ? 'Spesialisasi Terpilih' : 'Wajib Memilih Subclass'}
                                     </span>
                                   </div>
                                   
                                   {/* Subclass Options Cards Grid */}
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     {SUBCLASSES[className].map((sub: any) => {
                                       const isSubSelected = subclass === sub.name;
                                       return (
                                         <div 
                                           key={sub.name} 
                                           onClick={() => { playClickSound(); updateField("subclass", sub.name); }} 
                                           onKeyDown={(e) => {
                                             if (e.key === "Enter" || e.key === " ") {
                                               e.preventDefault();
                                               updateField("subclass", sub.name);
                                             }
                                           }}
                                           role="radio"
                                           aria-checked={isSubSelected}
                                           tabIndex={0}
                                           className={`cursor-pointer rounded-2xl border-2 transition-all duration-300 overflow-hidden relative group shadow-sm flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500
                                             ${isSubSelected ? 'bg-amber-50 border-amber-600 ring-1 ring-amber-600/30' : 'bg-white border-[#d4c5b0] hover:border-amber-700 hover:bg-[#fcfbf9]'}`}
                                         >
                                           <div className="p-5 flex-1 relative z-10 flex flex-col justify-start">
                                              <div className="flex justify-between items-center mb-2.5">
                                                <h5 className={`text-base font-black tracking-tight uppercase ${isSubSelected ? 'text-amber-800' : 'text-stone-800'}`}>{sub.name}</h5>
                                                {isSubSelected && <div className="w-2 h-2 rounded-full bg-amber-700 shadow-sm" />}
                                              </div>
                                              <p className="text-xs text-stone-600 leading-relaxed font-semibold">{sub.desc}</p>
                                           </div>
                                           
                                           <AnimatePresence>
                                             {isSubSelected && sub.bonuses && (
                                               <motion.div 
                                                 initial={{ height: 0, opacity: 0 }} 
                                                 animate={{ height: "auto", opacity: 1 }} 
                                                 exit={{ height: 0, opacity: 0 }}
                                                 className="bg-[#fdfaf6] border-t border-amber-200 px-5 py-4 relative z-10"
                                               >
                                                 <span className="text-[8px] font-black text-amber-800 uppercase tracking-widest block mb-2 flex items-center gap-1.5">
                                                   <Sparkles className="w-3 h-3 text-amber-600 shrink-0" /> Keahlian yang Diperoleh:
                                                 </span>
                                                 <ul className="space-y-1.5">
                                                   {sub.bonuses.map((bns: string, i: number) => (
                                                      <li key={i} className="text-[10px] text-stone-700 font-bold flex items-start gap-1.5 leading-normal">
                                                        <span className="text-amber-800 mt-0.5 opacity-80 select-none">✦</span> {bns}
                                                      </li>
                                                   ))}
                                                 </ul>
                                               </motion.div>
                                             )}
                                           </AnimatePresence>
                                         </div>
                                       );
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
                            id="panel-spells"
                            role="tabpanel"
                            initial={{ x: -12, opacity: 0 }} 
                            animate={{ x: 0, opacity: 1 }} 
                            exit={{ x: 12, opacity: 0 }} 
                            transition={{ duration: 0.25 }}
                            className="space-y-6"
                          >
                            {/* Dynamic info card about spells capacity */}
                            <div className="flex items-start md:items-center gap-4 bg-amber-50 border border-amber-200 p-5 rounded-2xl shadow-sm">
                               <div className="p-2.5 bg-amber-100 rounded-xl border border-amber-200 shrink-0">
                                 <Sparkles className="w-5 h-5 text-amber-800 fill-amber-800/10" />
                               </div>
                               <div>
                                 <h4 className="text-xs font-black text-amber-900 mb-1 uppercase tracking-wide">Kapasitas Sihir Level 1</h4>
                                 <p className="text-[11px] text-stone-600 leading-normal font-semibold">Anda akan memilih mantra secara spesifik di <strong>Tahap 5: Equipment</strong>. Berikut adalah gambaran potensi magis awal Anda:</p>
                               </div>
                            </div>
 
                            {/* Spellcasting Slots Count Grid */}
                            {data.spellcasting && (
                              <div className="grid grid-cols-3 gap-3.5">
                                 <div className="bg-white border border-[#d4c5b0] p-4.5 rounded-2xl text-center shadow-sm relative overflow-hidden group hover:border-[#a6937a] transition-colors">
                                    <span className="block text-2xl font-black text-cyan-600 mb-0.5">{data.spellcasting.cantrips}</span>
                                    <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest">Cantrips</span>
                                 </div>
                                 <div className="bg-white border border-[#d4c5b0] p-4.5 rounded-2xl text-center shadow-sm relative overflow-hidden group hover:border-[#a6937a] transition-colors">
                                    <span className="block text-2xl font-black text-amber-800 mb-0.5">{data.spellcasting.spellsKnown}</span>
                                    <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest">Spells Known</span>
                                 </div>
                                 <div className="bg-white border border-[#d4c5b0] p-4.5 rounded-2xl text-center shadow-sm relative overflow-hidden group hover:border-[#a6937a] transition-colors">
                                    <span className="block text-2xl font-black text-yellow-600 mb-0.5">{data.spellcasting.slots}</span>
                                    <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest">Slots Lvl 1</span>
                                 </div>
                              </div>
                            )}
 
                            {/* Spells list preview cards */}
                            {SPELL_DATABASE[className] && (
                              <div className="space-y-5 mt-4">
                                {Object.entries(SPELL_DATABASE[className]).map(([spellLvl, spellsList]: [string, any]) => (
                                  <div key={spellLvl} className="bg-white border border-[#d4c5b0] rounded-2xl p-5 shadow-sm">
                                    <h5 className="text-[10px] font-black text-stone-900 uppercase tracking-[0.2em] mb-4 flex items-center gap-1.5">
                                      <BookOpen className="w-3.5 h-3.5 text-stone-500" /> Daftar {spellLvl}
                                    </h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      {spellsList.slice(0, 4).map((spell: any) => (
                                         <div key={spell.name} className="bg-[#fdfaf6] border border-[#d4c5b0] p-4 rounded-xl transition-colors hover:border-[#a6937a] group cursor-default">
                                           <span className="text-xs font-black text-stone-800 block mb-1 group-hover:text-amber-800 transition-colors">{spell.name}</span>
                                           <span className="text-[10px] font-semibold text-stone-500 line-clamp-2 leading-relaxed" title={spell.desc}>{spell.desc}</span>
                                         </div>
                                      ))}
                                    </div>
                                    {spellsList.length > 4 && (
                                      <p className="text-[8px] font-black text-center text-stone-400 uppercase tracking-widest mt-4 pt-3.5 border-t border-[#d4c5b0]/60 select-none">
                                        + {spellsList.length - 4} Mantra Lainnya Tersedia untuk Dipilih
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
      </motion.div>
    </div>
  );
}