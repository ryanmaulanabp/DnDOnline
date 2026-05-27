"use client";

import { useCharacterStore } from "@/store/useCharacterStore";
import { RACES } from "@/lib/dnd-data";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Globe2, 
  Dna, 
  CheckCircle2, 
  AlertCircle, 
  FastForward, 
  Fingerprint, 
  Zap,
  ChevronDown
} from "lucide-react";

const playClickSound = () => {
  try {
    const audio = new Audio('/sounds/click.mp3');
    audio.volume = 0.1;
    audio.play().catch(() => {});
  } catch (e) {}
};

export default function RaceSelectionStep() {
  const { race, subrace, updateField } = useCharacterStore();

  const handleRaceChange = (newRace: string) => {
    if (race !== newRace) playClickSound();
    updateField("race", newRace);
    updateField("subrace", "");
  };

  const handleSubraceChange = (newSubrace: string) => {
    playClickSound();
    updateField("subrace", newSubrace);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl pb-24 relative z-10">
      
      {/* Title section with D&D typography */}
      <div className="relative">
        <h2 className="text-4xl font-black text-stone-900 tracking-tighter uppercase relative z-10 flex items-center gap-3">
          <Globe2 className="w-8 h-8 text-green-700 fill-green-700/10" /> Pilih Ras Pahlawan
        </h2>
        <p className="text-stone-500 mt-2 font-bold uppercase tracking-[0.2em] text-[10px] relative z-10 leading-relaxed">
          Ras menentukan warisan fisik, budaya bawaan, bonus atribut dasar, serta kemampuan magis unik pahlawanmu.
        </p>
      </div>
      
      {/* Race Options Grid with Shared Layout Animations */}
      <motion.div layout="position" className="flex flex-col gap-6">
        {Object.entries(RACES).map(([raceName, data]) => {
          const isSelected = race === raceName;
          const hasSubraces = data.subraces && data.subraces.length > 0;
          
          return (
            <motion.div 
              layout
              key={raceName} 
              className={`rounded-3xl border transition-all duration-500 overflow-hidden relative group backdrop-blur-sm shadow-sm
                ${isSelected ? "bg-white/95 border-green-600 shadow-xl shadow-green-900/10 ring-1 ring-green-600/30" : 
                "bg-white/60 border-[#d4c5b0] hover:border-[#a6937a] hover:bg-white/80"}`}
            >
              {/* Race Card Click Area */}
              <div 
                onClick={() => handleRaceChange(raceName)} 
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleRaceChange(raceName);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-expanded={isSelected}
                aria-selected={isSelected}
                className={`cursor-pointer flex flex-col md:flex-row md:items-center p-5 gap-5 transition-colors relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 ${isSelected ? 'bg-[#f4efe6] border-b border-[#d4c5b0]' : ''}`}
              >
                
                {/* Visual Avatar frame */}
                <div className="relative shrink-0 mx-auto md:mx-0">
                  <div className={`w-24 h-24 rounded-2xl bg-[#fdfaf6] flex items-center justify-center text-4xl shadow-md overflow-hidden shrink-0 border-2 z-10 relative transition-all duration-500 
                    ${isSelected ? 'border-green-500 scale-105' : 'border-[#d4c5b0] group-hover:border-green-600/50 group-hover:scale-105'}`}>
                    {data.icon.startsWith('/') ? (
                      <img 
                        src={data.icon} 
                        alt={raceName} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        style={data.imageFilter ? { filter: `${data.imageFilter} sepia(0.25)` } : { filter: 'sepia(0.25)' }}
                        draggable={false}
                      />
                    ) : (
                      <span className="select-none">{data.icon}</span>
                    )}
                  </div>
                </div>

                {/* Species Title */}
                <div className="flex-1 text-center md:text-left relative z-10">
                  <h3 className="text-3xl font-black text-stone-900 uppercase tracking-tighter drop-shadow-sm flex items-center justify-center md:justify-start gap-3">
                    {raceName}
                  </h3>
                  <p className="text-[9px] text-stone-400 font-extrabold uppercase tracking-widest mt-2.5 flex items-center justify-center md:justify-start gap-1.5">
                    <BookOpenIcon className="w-3.5 h-3.5 text-stone-400 shrink-0" /> Player's Handbook / Expanded Species
                  </p>
                </div>

                {/* Custom radio button check icon */}
                <div className="mx-auto md:mx-0 md:mr-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 relative z-10
                    ${isSelected ? 'bg-green-700 border-green-600 text-stone-100 shadow-md scale-110' : 'bg-white border-[#d4c5b0] text-transparent group-hover:border-stone-400'}`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Collapsible details wrapper */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.45, ease: [0.04, 0.62, 0.23, 0.98] }}
                    className="bg-[#fdfaf6] flex flex-col relative"
                  >
                    <div className="p-6 md:p-8 relative z-10 overflow-hidden">
                      {/* Lore description box */}
                      <p className="text-xs text-stone-700 leading-relaxed font-semibold italic border-l-4 border-green-600/50 pl-5 py-3 bg-green-50/50 rounded-r-xl mb-6">
                        {data.desc}
                      </p>
                      
                      {/* Speed & Atribut Boost chips list */}
                      <div className="flex flex-wrap gap-2.5 text-[9px] font-black uppercase tracking-widest mb-6">
                        <span className="bg-white text-stone-800 px-3.5 py-2.5 rounded-xl border border-[#d4c5b0] shadow-sm flex items-center gap-2">
                          <FastForward className="w-4 h-4 text-amber-600 shrink-0" /> Kecepatan: {data.speed} ft
                        </span>
                        {Object.entries(data.bonuses).map(([stat, val]) => (
                          <span key={stat} className="bg-green-50 text-green-800 px-3.5 py-2.5 rounded-xl border border-green-200 shadow-sm flex items-center gap-2 font-extrabold">
                            <Zap className="w-3.5 h-3.5 text-green-600 shrink-0" />
                            <span>{stat}</span> <span className="text-green-900 bg-green-200/50 px-2.5 py-0.5 rounded-md">+{val as number}</span>
                          </span>
                        ))}
                      </div>

                      {/* Default racial traits card */}
                      <div className="bg-white p-5 rounded-2xl border border-[#d4c5b0] shadow-sm mb-6 hover:border-[#a6937a] transition-colors group">
                        <h4 className="text-[10px] font-black text-stone-900 uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center border border-green-200 shadow-sm"><Fingerprint className="w-4 h-4 text-green-700" /></div>
                          Kekuatan & Kemampuan Ras Dasar
                        </h4>
                        <div className="space-y-4">
                          {data.traits.map((trait: any) => (
                            <div key={trait.name} className="text-xs leading-relaxed pb-3 border-b border-[#e6dccb] last:border-0 last:pb-0 font-medium text-stone-600">
                              <span className="font-black text-stone-800 uppercase tracking-tight mr-2">{trait.name}:</span>
                              <span>{trait.desc}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Subrace selections details */}
                      {hasSubraces && (
                        <div className="pt-6 border-t border-[#d4c5b0]/60 space-y-4">
                          <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3 mb-4">
                            <h4 className="text-[10px] font-black text-stone-900 uppercase tracking-[0.2em] flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center border border-amber-200 shadow-sm"><Dna className="w-4 h-4 text-amber-700" /></div>
                              Garis Keturunan Subrace
                            </h4>
                            <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all duration-500 flex items-center gap-1.5 self-start sm:self-auto
                              ${subrace ? 'bg-green-50 text-green-700 border-green-200 shadow-sm' : 'bg-red-50 text-red-600 border-red-200 animate-pulse'}`}>
                              {subrace ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3.5 h-3.5" />}
                              {subrace ? 'Subrace Terpilih' : 'Wajib Memilih Subrace'}
                            </span>
                          </div>
                          
                          {/* Subrace Cards Options Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data.subraces?.map((sub: any) => {
                              const isSubSelected = subrace === sub.name;
                              return (
                                <div 
                                  key={sub.name} 
                                  onClick={() => handleSubraceChange(sub.name)} 
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      e.preventDefault();
                                      handleSubraceChange(sub.name);
                                    }
                                  }}
                                  role="radio"
                                  aria-checked={isSubSelected}
                                  tabIndex={0}
                                  className={`cursor-pointer p-5 rounded-2xl border-2 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500
                                    ${isSubSelected ? 'bg-amber-50 border-amber-600 ring-1 ring-amber-600/30' : 'bg-white border-[#d4c5b0] hover:border-amber-400 hover:bg-[#fcfbf9]'}`}
                                >
                                  <div className="mb-4 relative z-10 flex-1">
                                    <div className="flex justify-between items-center mb-2.5">
                                      <h5 className={`text-base font-black tracking-tight uppercase ${isSubSelected ? 'text-amber-800' : 'text-stone-800'}`}>{sub.name}</h5>
                                      {isSubSelected && <div className="w-2 h-2 rounded-full bg-amber-700 shadow-sm" />}
                                    </div>
                                    <p className="text-[11px] leading-relaxed font-semibold mb-4 text-stone-500">{sub.desc}</p>
                                    
                                    {/* Subrace attribute bonuses list */}
                                    <div className="flex flex-wrap gap-2 text-[8px] font-black uppercase tracking-widest">
                                      {Object.entries(sub.bonuses).map(([s, v]) => (
                                        <span key={s} className="bg-green-50 text-green-700 px-2.5 py-1.5 rounded-lg border border-green-200 flex items-center gap-1">
                                          <Zap className="w-3.5 h-3.5 opacity-70 shrink-0 text-green-600" /> +{v as number} {s}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  {/* Subrace custom traits lists */}
                                  {sub.traits && sub.traits.length > 0 && (
                                    <div className="border-t border-[#e6dccb] pt-4 mt-auto relative z-10 space-y-2">
                                      <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest block mb-2 flex items-center gap-1 select-none">
                                        <ChevronDown className="w-3 h-3 shrink-0" /> Kemampuan Tambahan
                                      </span>
                                      {sub.traits.map((t: any) => (
                                        <p key={t.name} className="text-[10px] text-stone-600 leading-relaxed mb-2 last:mb-0 font-medium">
                                          <span className="font-extrabold text-stone-800 uppercase text-[9px] tracking-tight mr-1">{t.name}.</span> {t.desc}
                                        </p>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

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

function BookOpenIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  );
}