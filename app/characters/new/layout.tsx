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
  ChevronRight,
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
    <main className="min-h-screen bg-[#fdfaf6] text-stone-900 flex flex-col lg:flex-row font-sans selection:bg-amber-500/30 relative overflow-x-hidden">
      {/* Background cream parchment texture */}
      <div className="absolute inset-0 opacity-[0.25] mix-blend-multiply pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] z-0" />
      
      {/* Toast Notification Container */}
      <AnimatePresence>
        {store.toast && (
          <motion.div 
            initial={{ y: -120, opacity: 0, scale: 0.9, x: "-50%" }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -60, opacity: 0, scale: 0.9 }}
            className="fixed top-6 left-1/2 z-[100] w-[90%] max-w-md cursor-pointer"
            onClick={store.hideToast}
          >
            <div className={`p-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-start gap-4 transition-all duration-300 relative overflow-hidden active:scale-98
              ${store.toast.type === 'error' ? 'bg-red-50/95 text-red-950 border-red-200 shadow-red-900/10' : 
                store.toast.type === 'success' ? 'bg-green-50/95 text-green-950 border-green-200 shadow-green-900/10' : 
                'bg-amber-50/95 text-amber-950 border-amber-200 shadow-amber-900/10'}`}
            >
              <div className="relative z-10 text-2xl mt-0.5 shrink-0">
                {store.toast.type === 'error' ? <AlertTriangle className="text-red-600 w-5 h-5" /> : 
                 store.toast.type === 'success' ? <CheckCircle2 className="text-green-600 w-5 h-5" /> : 
                 <Info className="text-amber-600 w-5 h-5" />}
              </div>
              <div className="relative z-10 flex-1">
                <h4 className={`text-xs font-black uppercase tracking-widest mb-0.5 
                  ${store.toast.type === 'error' ? 'text-red-800' : store.toast.type === 'success' ? 'text-green-800' : 'text-amber-800'}`}>
                  {store.toast.type === 'error' ? 'Gagal Terpenuhi' : store.toast.type === 'success' ? 'Berhasil' : 'Informasi'}
                </h4>
                <p className="text-xs text-stone-700 leading-relaxed font-semibold">{store.toast.message}</p>
              </div>
              <button className="text-[10px] uppercase font-black tracking-widest text-stone-400 hover:text-stone-700 transition-colors shrink-0">Tutup</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Flow Side */}
      <div className="flex-1 flex flex-col min-h-screen relative z-10">
        
        {/* Step Header Stepper Navigation */}
        <header className={`bg-[#fdfaf6]/90 backdrop-blur-md border-b border-[#d4c5b0] fixed top-0 left-0 right-0 z-50 shadow-sm transition-all duration-500 ${currentStep < 6 ? 'lg:right-80' : ''}`}>
          <div className="max-w-6xl mx-auto px-4 md:px-8 h-24 flex items-center justify-between">
            <Link href="/" className="font-black text-amber-700 text-xl tracking-tighter hover:text-amber-800 transition-colors flex items-center gap-2 relative z-10 shrink-0">
              <Shield className="w-6 h-6 text-amber-700 fill-amber-700/10" />
              DND<span className="text-stone-900">ONLINE</span>
            </Link>
            
            {/* Desktop Dynamic Stepper */}
            <nav className="hidden md:flex items-center flex-1 justify-end ml-10 relative max-w-2xl w-full">
              <div className="absolute top-1/2 left-8 right-8 h-[2px] bg-[#e6dccb] -translate-y-1/2 z-0" />
              
              <div 
                className="absolute top-1/2 left-8 h-[2px] bg-amber-600 -translate-y-1/2 z-0 transition-all duration-500 ease-out" 
                style={{ width: `calc(${progressPercentage}% - 2rem)` }}
              />

              <div className="flex items-center justify-between w-full relative z-10">
                {STEPS.map((step) => {
                  const isActive = currentStep === step.id;
                  const isPast = currentStep > step.id;
                  const Icon = step.icon;
                  
                  return (
                    <Link 
                      key={step.name} 
                      href={step.path}
                      className="flex flex-col items-center justify-center relative group"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 relative z-10
                        ${isActive ? 'border-amber-600 text-stone-100 scale-110 shadow-lg shadow-amber-900/10 bg-amber-700' : 
                          isPast ? 'border-amber-700/40 text-amber-800 bg-[#fdfaf6] hover:border-amber-700' : 
                          'border-[#d4c5b0] text-stone-400 bg-[#fdfaf6] hover:border-stone-500'}`}
                      >
                        <Icon strokeWidth={isActive ? 2.5 : 2} className="w-4 h-4" />
                        
                        {isActive && (
                          <motion.div 
                            layoutId="activeStepRing" 
                            className="absolute -inset-1.5 rounded-full border border-amber-600/30 opacity-100 pointer-events-none"
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                          />
                        )}
                      </div>
                      
                      <span className={`absolute -bottom-5 text-[8px] font-black uppercase tracking-widest transition-colors duration-300 whitespace-nowrap
                        ${isActive ? 'text-amber-700 scale-105' : isPast ? 'text-stone-600 group-hover:text-stone-800' : 'text-stone-400 group-hover:text-stone-600'}`}>
                        {step.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </nav>
            
            {/* Step Counter Indicator for mobile */}
            <div className="md:hidden bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shrink-0 shadow-sm">
              Langkah {currentStep} / {STEPS.length}
            </div>
          </div>

          {/* Mobile Horizontal Progress Bar */}
          <div className="w-full h-1 bg-[#e6dccb] relative overflow-hidden md:hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute top-0 left-0 h-full bg-amber-600"
            />
          </div>
        </header>

        {/* Space Spacer for Fixed Header */}
        <div className="h-24" />

        {/* Inner Content Render */}
        <div className={`flex-1 p-4 md:p-8 lg:p-10 pb-44 lg:pb-44 mx-auto w-full relative z-10 flex flex-col justify-start transition-all duration-500 ${currentStep === 6 ? 'max-w-[1600px] lg:px-4' : 'max-w-5xl'}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="flex-1 flex flex-col"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation Bar */}
        {currentStep < 6 && (
          <div className="bg-[#fdfaf6]/90 backdrop-blur-xl border-t border-[#d4c5b0] p-4 sm:p-5 fixed bottom-0 left-0 right-0 lg:right-80 z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
            <div className="max-w-5xl mx-auto flex justify-between items-center w-full">
              <button 
                onClick={handlePrev} 
                disabled={currentStep === 1} 
                className="px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-stone-500 hover:text-stone-900 hover:bg-[#e6dccb]/30 disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-stone-500 transition-all flex items-center gap-1.5 border border-transparent hover:border-[#d4c5b0]/40"
              >
                ← Kembali
              </button>
              
              <button 
                onClick={handleNext} 
                className="px-8 sm:px-12 py-3.5 bg-gradient-to-r from-amber-800 to-amber-700 hover:from-amber-700 hover:to-amber-600 text-stone-100 rounded-xl font-black uppercase tracking-[0.15em] text-[10px] transition-all shadow-lg shadow-amber-900/10 active:scale-97 flex items-center gap-2.5 border border-amber-900/30"
              >
                Selanjutnya <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dossier Side Panel (Sticky on screens >= lg) */}
      {currentStep < 6 && (
        <aside className="hidden lg:flex w-80 bg-[#f9f6f0] border-l border-[#d4c5b0] h-screen sticky top-0 flex-col shadow-2xl relative overflow-hidden z-25 shrink-0">
          {/* Subtle side panel parchment background texture */}
          <div className="absolute inset-0 opacity-[0.12] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pointer-events-none mix-blend-multiply" />
          
          <div className="p-6 flex-1 overflow-y-auto custom-scrollbar relative z-10 flex flex-col justify-start">
            
            {/* Header Tag */}
            <h3 className="text-[10px] font-black text-amber-800/80 uppercase tracking-[0.3em] mb-6 border-b border-[#d4c5b0] pb-4 text-center flex items-center justify-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-700 fill-amber-700/10" /> Live Dossier
            </h3>
            
            {/* Profile Avatar Card */}
            <div className="mb-8 relative flex flex-col items-center">
              <div className="relative w-36 h-36 mb-5 group">
                {/* Visual Glow Outer Ring */}
                <div className="absolute -inset-1.5 border border-amber-900/10 rounded-full group-hover:border-amber-600/30 transition-colors duration-500 z-0" />
                
                {/* Glassmorphic Rounded Profile Frame */}
                <div className="w-full h-full bg-[#fdfaf6]/90 rounded-full border-4 border-[#d4c5b0] shadow-inner relative overflow-hidden z-10 group-hover:border-amber-600 transition-colors duration-500 flex items-center justify-center">
                  {displayAvatar ? (
                    <img 
                      src={displayAvatar} 
                      alt="Avatar Pahlawan" 
                      className="w-full h-full object-cover mix-blend-multiply opacity-90 group-hover:opacity-100 transition-opacity duration-300" 
                      style={{ filter: 'sepia(0.2)' }} 
                    />
                  ) : (
                    <div className="text-stone-300 flex flex-col items-center justify-center">
                      <UserPlaceholderIcon />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Dynamic Dossier Character Name */}
              <h2 className="text-xl font-black text-center text-stone-900 uppercase tracking-tighter truncate max-w-full px-2" title={store.name || "UNNAMED HERO"}>
                {store.name || "HERO TANPA NAMA"}
              </h2>
              
              {/* Subtitle Race/Class Info */}
              <div className="flex flex-col items-center gap-1.5 mt-2.5 w-full">
                <div className="relative inline-flex items-center group">
                  <select 
                    value={store.level || 1}
                    onChange={(e) => store.updateField("level", Number(e.target.value))}
                    className="appearance-none bg-amber-100/70 hover:bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 pr-6 rounded border border-amber-200/80 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer text-center transition-all shadow-inner"
                  >
                    {Array.from({ length: 20 }, (_, i) => i + 1).map(l => (
                      <option key={l} value={l}>LEVEL {l}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-amber-700 absolute right-1.5 pointer-events-none group-hover:text-amber-900 transition-colors" />
                </div>
                
                <span className="text-[9px] text-stone-500 font-bold uppercase tracking-widest text-center">
                  {store.subrace ? `${store.subrace}` : (store.race || "RAS")} • {store.charClass || "KELAS"}
                </span>
              </div>
              
              {/* Active Subclass Tag */}
              {store.subclass && (
                <div className="flex justify-center mt-2.5">
                  <span className="text-[8px] text-amber-700 uppercase tracking-[0.15em] font-black bg-amber-50 border border-amber-200/85 px-3 py-1 rounded-full shadow-sm">
                    {store.subclass}
                  </span>
                </div>
              )}
            </div>

            {/* Combat Primary Scores Metrics Grid */}
            <div className="grid grid-cols-3 gap-2.5 mb-8">
              <div className="bg-white/50 p-2.5 rounded-2xl border border-[#d4c5b0] text-center shadow-sm relative overflow-hidden group hover:border-amber-600/30 transition-all duration-300">
                <Heart className="w-4 h-4 text-red-600 mx-auto mb-1 opacity-80 shrink-0" />
                <span className="block text-[7px] font-black text-stone-500 uppercase tracking-widest mb-0.5">Max HP</span>
                <span className="text-xl font-black text-stone-800 transition-colors group-hover:text-amber-800">{store.charClass ? calculatedMaxHP : "-"}</span>
              </div>
              
              <div className="bg-white/50 p-2.5 rounded-2xl border border-[#d4c5b0] text-center shadow-sm relative overflow-hidden group hover:border-amber-600/30 transition-all duration-300">
                <ShieldAlert className="w-4 h-4 text-amber-600 mx-auto mb-1 opacity-80 shrink-0" />
                <span className="block text-[7px] font-black text-stone-500 uppercase tracking-widest mb-0.5">Armor AC</span>
                <span className="text-xl font-black text-stone-800 transition-colors group-hover:text-amber-800">{store.charClass ? calculatedAC : "-"}</span>
              </div>
              
              <div className="bg-white/50 p-2.5 rounded-2xl border border-[#d4c5b0] text-center shadow-sm relative overflow-hidden group hover:border-amber-600/30 transition-all duration-300">
                <Target className="w-4 h-4 text-amber-800 mx-auto mb-1 opacity-80 shrink-0" />
                <span className="block text-[7px] font-black text-stone-500 uppercase tracking-widest mb-0.5">Prof. Bonus</span>
                <span className="text-xl font-black text-stone-800 transition-colors group-hover:text-amber-800">{store.charClass ? `+${profBonus}` : "-"}</span>
              </div>
            </div>

            {/* Live Spring-loaded Ability Scores Panel */}
            <div className="space-y-2.5 flex-1">
              <h4 className="text-[8px] font-black text-stone-400 uppercase tracking-[0.2em] mb-2 px-1">Atribut & Modifier</h4>
              
              {(["STR", "DEX", "CON", "INT", "WIS", "CHA"] as const).map(stat => {
                const statValue = totalStats[stat];
                const displayValue = Math.min(20, Math.max(0, statValue));
                const modValue = modifiers[stat];
                const isPositive = modValue >= 0;
                
                return (
                  <div key={stat} className="flex items-center justify-between bg-white/50 p-3 rounded-2xl border border-[#d4c5b0] hover:border-amber-600/30 transition-all duration-300 group relative overflow-hidden shadow-sm">
                     {/* Bouncy filling spring line bar */}
                     <div className="absolute left-0 bottom-0 h-[3px] bg-stone-200/80 w-full z-0" />
                     <motion.div 
                       className="absolute left-0 bottom-0 h-[3px] bg-amber-600 z-10" 
                       initial={{ width: 0 }}
                       animate={{ width: `${(displayValue / 20) * 100}%` }}
                       transition={{ type: "spring", stiffness: 120, damping: 18 }}
                     />
                     
                     <div className="flex items-center gap-3.5 relative z-10">
                       <span className="text-[10px] font-black w-7 text-stone-500 uppercase tracking-widest group-hover:text-amber-800 transition-colors">{stat}</span>
                       <span className="text-base font-black text-stone-900">{statValue}</span>
                     </div>
                     
                     <div className={`relative z-10 flex items-center justify-center min-w-[34px] h-7 bg-white border border-[#d4c5b0] rounded-xl shadow-inner
                       ${isPositive ? 'text-green-700 border-green-200 bg-green-50/30' : 'text-red-700 border-red-200 bg-red-50/30'}`}>
                       <span className="text-[11px] font-black">
                         {isPositive ? `+${modValue}` : modValue}
                       </span>
                     </div>
                  </div>
                );
              })}
            </div>
            
          </div>
        </aside>
      )}
    </main>
  );
}

function UserPlaceholderIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-40 text-amber-800">
      <path d="M18 20a6 6 0 0 0-12 0"/>
      <circle cx="12" cy="10" r="4"/>
      <circle cx="12" cy="12" r="10"/>
    </svg>
  );
}