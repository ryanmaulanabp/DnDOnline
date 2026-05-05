"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import { useCharacterStore } from "@/store/useCharacterStore";
import { CLASSES, RACES } from "@/lib/dnd-data";

const STEPS = [
  { id: 1, name: "Class", path: "/characters/new/class" },
  { id: 2, name: "Race", path: "/characters/new/race" },
  { id: 3, name: "Identity", path: "/characters/new/identity" },
  { id: 4, name: "Abilities", path: "/characters/new/abilities" },
  { id: 5, name: "Equipment", path: "/characters/new/equipment" },
  { id: 6, name: "Finalize", path: "/characters/new/finalize" },
];

export default function CharacterBuilderLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const store = useCharacterStore();

  const currentStepObj = STEPS.find(s => pathname.includes(s.path)) || STEPS[0];
  const currentStep = currentStepObj.id;

  // -- KALKULASI SIDEBAR (Diambil dari store global) --
  const rulesClass = CLASSES[store.charClass] || null;
  const rulesRace = RACES[store.race] || null;
  const rulesSubrace = rulesRace?.subraces?.find((s: any) => s.name === store.subrace) || null;

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

  const calculatedMaxHP = (rulesClass?.hitDie || 10) + modifiers.CON;
  const calculatedAC = rulesRace?.traits?.some((t: any) => t.name === "Natural Armor") ? 17 : (10 + modifiers.DEX);

  // -- SENTRALISASI LOGIKA NAVIGASI & VALIDASI --
  const handleNext = () => {
    if (currentStep === 1 && (!store.charClass || !store.subclass)) return alert("Pilih Class dan Subclass!");
    if (currentStep === 2 && (!store.race || (rulesRace?.subraces?.length && !store.subrace))) return alert("Pilih Race & Subrace!");
    if (currentStep === 3 && (!store.name || !store.background)) return alert("Lengkapi Nama dan Background!");
    
    if (currentStep < 6) {
      router.push(STEPS[currentStep].path); // Array STEPS menggunakan index 0, jadi currentStep = index selanjutnya
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      router.push(STEPS[currentStep - 2].path);
    }
  };

  return (
    <main className="min-h-screen bg-[#06060c] text-slate-50 flex flex-col md:flex-row font-sans selection:bg-blue-500/30">
      <div className="flex-1 flex flex-col min-h-screen">
        
        {/* HEADER STEPPER */}
        <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="font-black text-red-500 text-xl tracking-tighter hover:text-red-400">D&D<span className="text-white">ONLINE</span></Link>
            <nav className="hidden md:flex items-center gap-1">
              {STEPS.map((step, idx) => {
                const isActive = currentStep === step.id;
                const isPast = currentStep > step.id;
                return (
                  <div key={step.name} className="flex items-center">
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold cursor-default transition-all ${isActive ? 'text-blue-400 bg-blue-900/10' : isPast ? 'text-slate-300' : 'text-slate-600'}`}>
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${isActive ? 'bg-blue-500 text-white' : isPast ? 'bg-slate-700 text-white' : 'border border-slate-700'}`}>{isPast ? '✓' : step.id}</span>
                      {step.name}
                    </div>
                    {idx < STEPS.length - 1 && <span className="text-slate-800 text-lg mx-1">›</span>}
                  </div>
                )
              })}
            </nav>
          </div>
        </header>

        {/* AREA KONTEN UTAMA (Tempat halaman dinamis di-render) */}
        <div className="flex-1 p-4 md:p-8 lg:p-12 pb-48 lg:pb-48 max-w-5xl mx-auto w-full">
          {children}
        </div>

        {/* BOTTOM NAV BAR */}
        {currentStep < 6 && (
          <div className="bg-slate-950 border-t border-slate-800 p-4 fixed bottom-0 left-0 right-0 lg:right-80 z-20">
            <div className="max-w-5xl mx-auto flex justify-between items-center">
              <button onClick={handlePrev} disabled={currentStep === 1} className="px-6 py-3 rounded-xl font-bold text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-all">← Sebelumnya</button>
              <button onClick={handleNext} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/30">Selanjutnya →</button>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT SIDEBAR PREVIEW */}
      <aside className="hidden lg:block w-80 bg-slate-950 border-l border-slate-800 h-screen sticky top-0 overflow-y-auto p-6">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-800 pb-2">Character Builder</h3>
        <div className="mb-8">
          {rulesClass ? (<div className="w-32 h-32 bg-cover bg-center rounded-2xl mx-auto mb-4 border-2 border-slate-700" style={{ backgroundImage: `url('${rulesClass.image}')` }}></div>) : (<div className="w-24 h-24 bg-slate-900 rounded-2xl mx-auto mb-4 border border-slate-800 border-dashed flex items-center justify-center text-slate-700 text-3xl">?</div>)}
          <h2 className="text-xl font-black text-center text-white truncate px-2">{store.name || "Unnamed"}</h2>
          <p className="text-center text-xs text-blue-400 font-mono mt-1">Level 1 {store.subrace ? `${store.race} (${store.subrace})` : (store.race || "Race")} {store.charClass || "Class"}</p>
          {store.subclass && <p className="text-center text-[10px] text-slate-400 mt-1 uppercase tracking-widest">{store.subclass}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-900 p-3 rounded-xl border border-red-900/30 text-center"><span className="block text-[10px] font-bold text-red-500 uppercase">Hit Points</span><span className="text-2xl font-black text-white">{store.charClass ? calculatedMaxHP : "-"}</span></div>
          <div className="bg-slate-900 p-3 rounded-xl border border-blue-900/30 text-center"><span className="block text-[10px] font-bold text-blue-500 uppercase">Armor Class</span><span className="text-2xl font-black text-white">{store.charClass ? calculatedAC : "-"}</span></div>
        </div>
        <div className="space-y-2">
          {(["STR", "DEX", "CON", "INT", "WIS", "CHA"] as const).map(stat => (
            <div key={stat} className="flex items-center justify-between bg-slate-900 p-2 rounded-lg border border-slate-800">
              <div className="flex items-center gap-3"><span className="text-xs font-bold w-8 text-slate-500">{stat}</span><span className="text-sm font-black text-white">{totalStats[stat]}</span></div>
              <span className={`text-xs font-bold bg-slate-950 px-2 py-1 rounded ${modifiers[stat] >= 0 ? 'text-green-400' : 'text-red-400'}`}>{modifiers[stat] >= 0 ? `+${modifiers[stat]}` : modifiers[stat]}</span>
            </div>
          ))}
        </div>
      </aside>
    </main>
  );
}