"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import { useCharacterStore } from "@/store/useCharacterStore";
import { CLASSES, RACES } from "@/lib/dnd-data";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  Users, 
  Fingerprint, 
  Dna, 
  Backpack, 
  CheckCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Heart,
  ShieldAlert,
  Swords,
  ChevronDown,
  Target
} from "lucide-react";

const STEPS = [
  { id: 1, name: "Class", path: "/characters/new/class", icon: Swords },
  { id: 2, name: "Race", path: "/characters/new/race", icon: Users },
  { id: 3, name: "Identity", path: "/characters/new/identity", icon: Fingerprint },
  { id: 4, name: "Abilities", path: "/characters/new/abilities", icon: Dna },
  { id: 5, name: "Equipment", path: "/characters/new/equipment", icon: Backpack },
  { id: 6, name: "Finalize", path: "/characters/new/finalize", icon: CheckCircle },
];

export default function CharacterBuilderLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const store = useCharacterStore();

  const currentStepObj = STEPS.find(s => pathname.includes(s.path)) || STEPS[0];
  const currentStep = currentStepObj.id;

  const rulesClass = CLASSES[store.charClass] || null;
  const rulesRace = RACES[store.race] || null;
  const rulesSubrace = rulesRace?.subraces?.find((s: any) => s.name === store.subrace) || null;

  const displayAvatar = store.avatarUrl || rulesClass?.image || null;

  const totalStats = useMemo(() => ({
    STR: store.baseStats.STR + (rulesRace?.bonuses.STR || 0) + (rulesSubrace?.bonuses.STR || 0),
    DEX: store.baseStats.DEX + (rulesRace?.bonuses.DEX || 0) + (rulesSubrace?.bonuses.DEX || 0),
    CON: store.baseStats.CON + (rulesRace?.bonuses.CON || 0) + (rulesSubrace?.bonuses.CON || 0),
    INT: store.baseStats.INT + (rulesRace?.bonuses.INT || 0) + (rulesSubrace?.bonuses.INT || 0),
    WIS: store.baseStats.WIS + (rulesRace?.bonuses.WIS || 0) + (rulesSubrace?.bonuses.WIS || 0),
    CHA: store.baseStats.CHA + (rulesRace?.bonuses.CHA || 0) + (rulesSubrace?.bonuses.CHA || 0),
  }), [store.baseStats, rulesRace, rulesSubrace]);

  const modifiers = useMemo(() => {
    const calcMod = (val: number) => Math.floor((val - 10) / 2);
    return {
      STR: calcMod(totalStats.STR), DEX: calcMod(totalStats.DEX),
      CON: calcMod(totalStats.CON), INT: calcMod(totalStats.INT),
      WIS: calcMod(totalStats.WIS), CHA: calcMod(totalStats.CHA),
    };
  }, [totalStats]);

  const level = store.level || 1;
  const profBonus = Math.ceil(level / 4) + 1;
  const avgHitDie = Math.floor((rulesClass?.hitDie || 10) / 2) + 1;
  const calculatedMaxHP = store.charClass 
    ? (rulesClass?.hitDie || 10) + modifiers.CON + ((level - 1) * Math.max(1, avgHitDie + modifiers.CON))
    : 0;
  const calculatedAC = rulesRace?.traits?.some((t: any) => t.name === "Natural Armor") ? 17 : (10 + modifiers.DEX);

  const handleNext = () => {
    if (currentStep === 1 && (!store.charClass || !store.subclass)) return store.showToast("Pilih Class dan Subclass terlebih dahulu!", "error");
    if (currentStep === 2 && (!store.race || (rulesRace?.subraces?.length && !store.subrace))) return store.showToast("Pilih Race & Subrace terlebih dahulu!", "error");
    if (currentStep === 3 && (!store.name || !store.background)) return store.showToast("Lengkapi Nama Legendaris dan Background pahlawanmu!", "error");
    
    if (currentStep < 6) {
      router.push(STEPS[currentStep].path);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      router.push(STEPS[currentStep - 2].path);
    }
  };

  const progressPercentage = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <main className="min-h-screen bg-transparent text-stone-900 flex flex-col md:flex-row font-sans selection:bg-amber-500/30 relative">
      
      <AnimatePresence>
        {store.toast && (
          <motion.div 
            initial={{ y: -100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -50, opacity: 0, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md cursor-pointer"
            onClick={store.hideToast}
          >
            <div className={`p-4 rounded-xl border border-stone-300 backdrop-blur-xl shadow-2xl flex items-start gap-4 transition-colors relative overflow-hidden
              ${store.toast.type === 'error' ? 'bg-red-50 text-red-900 border-red-200' : 
                store.toast.type === 'success' ? 'bg-green-50 text-green-900 border-green-200' : 
                'bg-amber-50 text-amber-900 border-amber-200'}`}
            >
              <div className="relative z-10 text-2xl mt-0.5">
                {store.toast.type === 'error' ? <AlertTriangle className="text-red-600" /> : 
                 store.toast.type === 'success' ? <CheckCircle2 className="text-green-600" /> : 
                 <Info className="text-amber-600" />}
              </div>
              <div className="relative z-10 flex-1">
                <h4 className={`text-sm font-black uppercase tracking-widest mb-1 
                  ${store.toast.type === 'error' ? 'text-red-700' : store.toast.type === 'success' ? 'text-green-700' : 'text-amber-700'}`}>
                  {store.toast.type === 'error' ? 'System Alert' : store.toast.type === 'success' ? 'Success' : 'Information'}
                </h4>
                <p className="text-xs text-stone-700 leading-relaxed font-medium">{store.toast.message}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-h-screen relative z-10">
        <header className={`bg-[#fdfaf6]/95 backdrop-blur-md border-b border-[#d4c5b0] fixed top-0 left-0 right-0 z-50 shadow-sm transition-all ${currentStep < 6 ? 'lg:right-80' : ''}`}>
          <div className="max-w-6xl mx-auto px-4 md:px-8 h-28 flex items-center justify-between">
            <Link href="/" className="font-black text-amber-700 text-2xl tracking-tighter hover:text-amber-800 transition-colors flex items-center gap-2">
              <Shield className="w-6 h-6 text-amber-700" />
              DND<span className="text-stone-900">ONLINE</span>
            </Link>
            
            <nav className="hidden md:flex items-center flex-1 justify-end ml-12 relative">
              <div className="absolute top-1/2 left-8 right-8 h-[2px] bg-[#e6dccb] -translate-y-1/2 z-0" />
              
              <div 
                className="absolute top-1/2 left-8 h-[2px] bg-amber-600 -translate-y-1/2 z-0 transition-all duration-500" 
                style={{ width: `calc(${progressPercentage}% - 2rem)` }}
              />

              <div className="flex items-center justify-between w-full relative z-10">
                {STEPS.map((step, idx) => {
                  const isActive = currentStep === step.id;
                  const isPast = currentStep > step.id;
                  const Icon = step.icon;
                  
                  return (
                    <div key={step.name} className="flex flex-col items-center justify-center relative group">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 bg-[#fdfaf6]
                        ${isActive ? 'border-amber-600 text-amber-700 scale-110 shadow-md' : 
                          isPast ? 'border-amber-700/40 text-amber-800' : 
                          'border-[#d4c5b0] text-stone-400'}`}
                      >
                        <Icon strokeWidth={isActive ? 2.5 : 2} className={`w-4 h-4`} />
                      </div>
                      <span className={`absolute -bottom-5 text-[9px] font-black uppercase tracking-widest transition-colors duration-300 
                        ${isActive ? 'text-amber-700' : isPast ? 'text-stone-600' : 'text-stone-400'}`}>
                        {step.name}
                      </span>
                    </div>
                  )
                })}
              </div>
            </nav>
          </div>

          <div className="w-full h-1 bg-[#e6dccb] relative overflow-hidden md:hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute top-0 left-0 h-full bg-amber-600"
            />
          </div>
        </header>

        <div className="h-28" />

        <div className={`flex-1 p-4 md:p-8 lg:p-12 pb-48 lg:pb-48 mx-auto w-full relative z-10 ${currentStep === 6 ? 'max-w-[1600px] lg:px-4' : 'max-w-5xl'}`}>
          {children}
        </div>

        {currentStep < 6 && (
          <div className="bg-[#fdfaf6]/90 backdrop-blur-xl border-t border-[#d4c5b0] p-5 fixed bottom-0 left-0 right-0 lg:right-80 z-20">
            <div className="max-w-5xl mx-auto flex justify-between items-center">
              <button onClick={handlePrev} disabled={currentStep === 1} className="px-6 py-3 rounded-xl font-bold text-stone-500 hover:text-stone-900 hover:bg-[#e6dccb]/50 disabled:opacity-30 disabled:hover:bg-transparent transition-all flex items-center gap-2">
                ← <span className="hidden sm:inline">Back</span>
              </button>
              <button onClick={handleNext} className="px-8 sm:px-12 py-3 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-stone-900 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-900/20 active:scale-95 flex items-center gap-3 border border-amber-800/30">
                Next <span className="hidden sm:inline">Step</span> →
              </button>
            </div>
          </div>
        )}
      </div>

      {currentStep < 6 && (
        <aside className="hidden lg:flex w-80 bg-[#f9f6f0] border-l border-[#d4c5b0] h-screen sticky top-0 flex-col shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pointer-events-none mix-blend-multiply"></div>
          
          <div className="p-6 flex-1 overflow-y-auto custom-scrollbar relative z-10">
            <h3 className="text-[10px] font-black text-amber-800/70 uppercase tracking-[0.3em] mb-8 border-b border-[#d4c5b0] pb-4 text-center flex items-center justify-center gap-2">
              <Shield className="w-3 h-3" /> Live Dossier
            </h3>
            
            <div className="mb-10 relative">
              <div className="relative w-40 h-40 mx-auto mb-6 group">
                <div className="absolute -inset-2 border border-amber-900/10 rounded-full"></div>
                
                <div className="w-full h-full bg-[#fdfaf6] rounded-full border-4 border-[#d4c5b0] shadow-inner relative overflow-hidden z-10 group-hover:border-amber-600 transition-colors duration-500 flex items-center justify-center">
                  {displayAvatar ? (
                    <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover mix-blend-multiply opacity-90 group-hover:opacity-100 transition-opacity" style={{filter: 'sepia(0.3)'}} />
                  ) : (
                    <div className="text-stone-300 flex flex-col items-center">
                      <UserPlaceholderIcon />
                    </div>
                  )}
                </div>
              </div>
              
              <h2 className="text-2xl font-black text-center text-stone-900 uppercase tracking-tighter truncate px-2">{store.name || "UNNAMED HERO"}</h2>
              
              <div className="flex justify-center items-center gap-2 mt-3">
                <div className="relative inline-flex items-center group">
                  <select 
                    value={store.level || 1}
                    onChange={(e) => store.updateField("level", Number(e.target.value))}
                    className="appearance-none bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-widest px-2 py-1 pr-5 rounded border border-amber-200 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer text-center hover:bg-amber-200 transition-colors"
                  >
                    {Array.from({length: 20}, (_, i) => i + 1).map(l => (
                      <option key={l} value={l}>LVL {l}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-amber-700 absolute right-1 pointer-events-none group-hover:text-amber-900 transition-colors" />
                </div>
                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">{store.subrace ? `${store.subrace}` : (store.race || "RACE")} • {store.charClass || "CLASS"}</span>
              </div>
              
              {store.subclass && (
                <div className="flex justify-center mt-2">
                  <span className="text-[9px] text-amber-700 uppercase tracking-widest font-black bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                    {store.subclass}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 mb-10">
              <div className="bg-white/50 p-3 rounded-xl border border-[#d4c5b0] text-center shadow-sm relative overflow-hidden group">
                <Heart className="w-4 h-4 text-red-600 mx-auto mb-1 opacity-80" />
                <span className="block text-[8px] font-black text-stone-500 uppercase tracking-widest mb-1">Max HP</span>
                <span className="text-2xl font-black text-stone-800">{store.charClass ? calculatedMaxHP : "-"}</span>
              </div>
              <div className="bg-white/50 p-3 rounded-xl border border-[#d4c5b0] text-center shadow-sm relative overflow-hidden group">
                <ShieldAlert className="w-4 h-4 text-amber-600 mx-auto mb-1 opacity-80" />
                <span className="block text-[8px] font-black text-stone-500 uppercase tracking-widest mb-1">Armor</span>
                <span className="text-2xl font-black text-stone-800">{store.charClass ? calculatedAC : "-"}</span>
              </div>
              <div className="bg-white/50 p-3 rounded-xl border border-[#d4c5b0] text-center shadow-sm relative overflow-hidden group">
                <Target className="w-4 h-4 text-amber-800 mx-auto mb-1 opacity-80" />
                <span className="block text-[8px] font-black text-stone-500 uppercase tracking-widest mb-1">Prof. Bonus</span>
                <span className="text-2xl font-black text-stone-800">{store.charClass ? `+${profBonus}` : "-"}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] mb-2 px-1">Ability Scores</h4>
              {(["STR", "DEX", "CON", "INT", "WIS", "CHA"] as const).map(stat => (
                <div key={stat} className="flex items-center justify-between bg-white/50 p-3 rounded-xl border border-[#d4c5b0] hover:border-[#a6937a] transition-colors group relative overflow-hidden">
                   <div className="absolute left-0 bottom-0 h-0.5 bg-stone-200 w-full" />
                   <div 
                     className="absolute left-0 bottom-0 h-0.5 bg-amber-500 transition-all duration-1000" 
                     style={{ width: `${(totalStats[stat] / 20) * 100}%` }}
                   />
                   
                  <div className="flex items-center gap-4 relative z-10">
                    <span className="text-[10px] font-black w-8 text-stone-500 uppercase tracking-widest group-hover:text-stone-700 transition-colors">{stat}</span>
                    <span className="text-lg font-black text-stone-900">{totalStats[stat]}</span>
                  </div>
                  <div className={`relative z-10 flex items-center justify-center min-w-[36px] h-7 bg-white border border-[#d4c5b0] rounded-lg shadow-sm
                    ${modifiers[stat] >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    <span className="text-xs font-black">
                      {modifiers[stat] >= 0 ? `+${modifiers[stat]}` : modifiers[stat]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      )}
    </main>
  );
}

function UserPlaceholderIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 20a6 6 0 0 0-12 0"/>
      <circle cx="12" cy="10" r="4"/>
      <circle cx="12" cy="12" r="10"/>
    </svg>
  );
}