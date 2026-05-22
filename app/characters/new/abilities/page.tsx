"use client";

import { useMemo, useState } from "react";
import { useCharacterStore } from "@/store/useCharacterStore";
import { POINT_BUY_COSTS, RACES } from "@/lib/dnd-data";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Dna, 
  ChevronDown, 
  Dices, 
  Calculator, 
  RefreshCw, 
  Hexagon,
  Minus,
  Plus
} from "lucide-react";

const playClickSound = () => {
  try {
    const audio = new Audio('/sounds/click.mp3');
    audio.volume = 0.1;
    audio.play().catch(() => {});
  } catch (e) {}
};

const STAT_OPTIONS = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
const FULL_STAT_NAMES: Record<string, string> = { STR: "Strength", DEX: "Dexterity", CON: "Constitution", INT: "Intelligence", WIS: "Wisdom", CHA: "Charisma" };

const STAT_COLORS: Record<string, string> = {
  STR: "text-red-700 border-red-200 bg-red-50",
  DEX: "text-green-700 border-green-200 bg-green-50",
  CON: "text-orange-700 border-orange-200 bg-orange-50",
  INT: "text-amber-900 border-amber-300 bg-amber-100",
  WIS: "text-teal-700 border-teal-200 bg-teal-50",
  CHA: "text-amber-800 border-amber-300 bg-amber-100"
};

export default function AbilitiesStep() {
  const { 
    baseStats, race, subrace, asiChoice, customBonus1, customBonus2, customBonus3, 
    updateBaseStat, updateField 
  } = useCharacterStore();

  const [isAsiOpen, setIsAsiOpen] = useState(false);

  const initialMethod = useMemo(() => {
    const hasInvalidPointBuy = Object.values(baseStats).some(v => v > 15 || v < 8) || 
      (27 - Object.values(baseStats).reduce((sum, val) => sum + (POINT_BUY_COSTS[val] ?? 0), 0) < 0);
    return hasInvalidPointBuy ? "roll" : "pointbuy";
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [generationMethod, setGenerationMethod] = useState<"pointbuy" | "roll">(initialMethod);
  const [isRolling, setIsRolling] = useState(false);

  const [rolledScores, setRolledScores] = useState<number[]>(() => {
    if (initialMethod === "roll") return STAT_OPTIONS.map(s => baseStats[s]).sort((a,b) => b-a);
    return [];
  });

  const [assignments, setAssignments] = useState<Record<string, number>>(() => {
    if (initialMethod === "roll") {
      const tempAssign: Record<string, number> = {};
      const usedIndices = new Set<number>();
      const sortedCurrent = STAT_OPTIONS.map(s => baseStats[s]).sort((a,b) => b-a);
      
      STAT_OPTIONS.forEach(stat => {
        const val = baseStats[stat];
        const idx = sortedCurrent.findIndex((s, i) => s === val && !usedIndices.has(i));
        if (idx !== -1) {
          tempAssign[stat] = idx;
          usedIndices.add(idx);
        }
      });
      return tempAssign;
    }
    return {};
  });

  const rulesRace = RACES[race] || null;
  const rulesSubrace = rulesRace?.subraces?.find((s: any) => s.name === subrace) || null;

  const totalPointsSpent = useMemo(() => Object.values(baseStats).reduce((sum, val) => sum + (POINT_BUY_COSTS[val] ?? 0), 0), [baseStats]);
  const pointsRemaining = 27 - totalPointsSpent;

  const getBonus = (stat: string) => {
    if (asiChoice === "standard") return (rulesRace?.bonuses[stat] || 0) + (rulesSubrace?.bonuses[stat] || 0);
    if (asiChoice === "custom21") return stat === customBonus1 ? 2 : stat === customBonus2 ? 1 : 0;
    if (asiChoice === "custom111") return (stat === customBonus1 || stat === customBonus2 || stat === customBonus3) ? 1 : 0;
    return 0;
  };

  const totalStats = useMemo(() => ({
    STR: baseStats.STR + getBonus("STR"), DEX: baseStats.DEX + getBonus("DEX"),
    CON: baseStats.CON + getBonus("CON"), INT: baseStats.INT + getBonus("INT"),
    WIS: baseStats.WIS + getBonus("WIS"), CHA: baseStats.CHA + getBonus("CHA"),
  }), [baseStats, asiChoice, customBonus1, customBonus2, customBonus3, rulesRace, rulesSubrace]);

  const calcMod = (val: number) => Math.floor((val - 10) / 2);

  const adjustStat = (stat: string, delta: number) => {
    playClickSound();
    const currentVal = baseStats[stat];
    const newVal = currentVal + delta;
    if (newVal < 8 || newVal > 15) return; 
    const pointDiff = (POINT_BUY_COSTS[newVal] ?? 0) - (POINT_BUY_COSTS[currentVal] ?? 0);
    if (pointsRemaining - pointDiff < 0) return; 
    updateBaseStat(stat, newVal);
  };

  const handleMethodSwitch = (method: "pointbuy" | "roll") => {
    playClickSound();
    setGenerationMethod(method);
    if (method === "pointbuy") {
      STAT_OPTIONS.forEach(s => updateBaseStat(s, 8));
      setAssignments({});
      setRolledScores([]);
    }
  };

  const handleRollDice = () => {
    playClickSound();
    setIsRolling(true);
    
    setTimeout(() => {
      const newRolls = Array.from({ length: 6 }, () => {
        const rolls = [
          Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1,
        ];
        rolls.sort((a, b) => a - b);
        return rolls[1] + rolls[2] + rolls[3];
      });
      
      newRolls.sort((a, b) => b - a);
      setRolledScores(newRolls);
      setAssignments({});
      STAT_OPTIONS.forEach(s => updateBaseStat(s, 8));
      setIsRolling(false);
    }, 600);
  };

  const assignRollToStat = (stat: string, rollIndex: number) => {
    playClickSound();
    setAssignments(prev => ({ ...prev, [stat]: rollIndex }));
    updateBaseStat(stat, rolledScores[rollIndex]);
  };

  const toggleAsi = () => {
    playClickSound();
    setIsAsiOpen(!isAsiOpen);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl pb-24 relative z-10">
      <div className="relative">
        <h2 className="text-4xl font-black text-stone-900 tracking-tighter uppercase relative z-10 flex items-center gap-3">
          <Hexagon className="w-8 h-8 text-amber-700" /> Ability Scores
        </h2>
        <p className="text-stone-500 mt-2 font-bold uppercase tracking-[0.2em] text-xs relative z-10">Tentukan potensi fisik dan mental karakter Anda.</p>
      </div>

      <div className="bg-white/95 backdrop-blur-sm rounded-[2rem] border border-[#d4c5b0] shadow-xl relative overflow-hidden group focus-within:border-amber-500/50 focus-within:ring-1 focus-within:ring-amber-500/30 transition-all duration-500">
        
        <div className="flex border-b border-[#d4c5b0] bg-[#fdfaf6]">
          <button 
            onClick={() => handleMethodSwitch("pointbuy")}
            className={`flex-1 py-5 text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${generationMethod === "pointbuy" ? 'text-amber-700 bg-white border-b-2 border-amber-600 shadow-sm' : 'text-stone-500 hover:text-stone-700 border-b-2 border-transparent'}`}
          >
            <Calculator className="w-4 h-4" /> Point Buy System
          </button>
          <button 
            onClick={() => handleMethodSwitch("roll")}
            className={`flex-1 py-5 text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${generationMethod === "roll" ? 'text-amber-800 bg-white border-b-2 border-amber-800 shadow-sm' : 'text-stone-500 hover:text-stone-700 border-b-2 border-transparent'}`}
          >
            <Dices className="w-4 h-4" /> Roll 4d6 Drop Lowest
          </button>
        </div>

        <div className="p-8 md:p-12 relative bg-[#fdfaf6]">
          
          {generationMethod === "pointbuy" && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col md:flex-row justify-between items-center mb-10 pb-8 border-b border-[#d4c5b0] relative z-10 gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-3xl font-black text-stone-900 uppercase tracking-tighter drop-shadow-sm">Point Buy</h3>
                <p className="text-[10px] text-stone-500 font-black uppercase tracking-[0.2em] mt-2">Alokasikan 27 poin untuk dasar atribut.</p>
              </div>
              <div className="flex items-center gap-5 bg-white px-8 py-5 rounded-2xl border border-[#d4c5b0] shadow-sm relative group/points overflow-hidden">
                <div className="absolute inset-0 bg-amber-50 opacity-0 group-hover/points:opacity-100 transition-opacity" />
                <span className="text-[11px] font-black text-stone-500 uppercase tracking-[0.2em] pt-1 relative z-10">Points Remaining</span>
                <span className={`text-6xl font-black leading-none tracking-tighter transition-colors duration-500 relative z-10 ${pointsRemaining === 0 ? 'text-green-600' : 'text-amber-600'}`}>
                  {pointsRemaining}
                </span>
              </div>
            </motion.div>
          )}

          {generationMethod === "roll" && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col items-center mb-10 pb-8 border-b border-[#d4c5b0] relative z-10 gap-6">
              <button 
                onClick={handleRollDice}
                disabled={isRolling}
                className="w-full max-w-md py-6 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-2xl text-amber-800 hover:text-amber-900 font-black uppercase tracking-[0.3em] transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 hover:border-amber-600 group"
              >
                {isRolling ? <RefreshCw className="w-6 h-6 animate-spin text-amber-800" /> : <Dices className="w-6 h-6 text-amber-800 transition-colors" />}
                {isRolling ? 'ROLLING THE FATES...' : 'ROLL 6 STATS (4d6 Drop 1)'}
              </button>

              <AnimatePresence>
                {rolledScores.length > 0 && (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center bg-white border border-[#d4c5b0] p-8 rounded-2xl w-full shadow-sm">
                    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-stone-500 mb-6 flex items-center gap-2">
                      <Dices className="w-4 h-4" /> Available Rolls
                    </span>
                    <div className="flex flex-wrap justify-center gap-5">
                      {rolledScores.map((score, idx) => {
                        const isAssigned = Object.values(assignments).includes(idx);
                        return (
                          <motion.div 
                            key={`roll-${idx}`}
                            initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: idx * 0.1 }}
                            className={`w-16 h-16 flex items-center justify-center rounded-xl text-3xl font-black border transition-all duration-500 ${isAssigned ? 'bg-stone-100 border-[#d4c5b0] text-stone-400 scale-90' : 'bg-amber-200 border-amber-600 text-amber-900 shadow-sm'}`}
                          >
                            {score}
                          </motion.div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-6 relative z-10">
            {STAT_OPTIONS.map((stat) => {
              const mod = calcMod(totalStats[stat as keyof typeof totalStats]);
              const colorClass = STAT_COLORS[stat];
              
              const isMaxed = baseStats[stat] === 15;
              const isMin = baseStats[stat] === 8;

              const isAssignedHere = Object.keys(assignments).includes(stat);
              const assignedVal = isAssignedHere ? baseStats[stat] : "-";

              return (
                <div key={stat} className="bg-white p-5 lg:p-6 rounded-2xl border border-[#d4c5b0] flex flex-col items-center hover:border-[#a6937a] transition-colors relative group shadow-sm">
                  <span className={`text-xl lg:text-2xl font-black mb-6 tracking-tight ${colorClass.split(' ')[0]}`}>{stat}</span>
                  
                  <div className="flex items-center justify-center w-full mb-6 bg-[#fdfaf6] p-2.5 rounded-xl border border-[#d4c5b0] shadow-inner min-h-[64px]">
                    
                    {generationMethod === "pointbuy" && (
                      <div className="flex items-center justify-between w-full px-1">
                        <motion.button whileTap={{ scale: 0.8 }} disabled={isMin} onClick={() => adjustStat(stat, -1)} className="w-8 h-8 lg:w-9 lg:h-9 bg-white hover:bg-stone-100 disabled:opacity-30 disabled:hover:bg-white rounded-lg font-black flex justify-center items-center text-stone-500 hover:text-stone-800 transition-colors border border-[#d4c5b0]">
                          <Minus className="w-4 h-4" />
                        </motion.button>
                        <span className={`text-3xl lg:text-4xl font-black text-stone-900 tracking-tighter ${isMaxed ? 'text-amber-600' : ''}`}>{baseStats[stat]}</span>
                        <motion.button whileTap={{ scale: 0.8 }} disabled={isMaxed || pointsRemaining < ((POINT_BUY_COSTS[baseStats[stat] + 1] ?? 0) - (POINT_BUY_COSTS[baseStats[stat]] ?? 0))} onClick={() => adjustStat(stat, 1)} className="w-8 h-8 lg:w-9 lg:h-9 bg-white hover:bg-stone-100 disabled:opacity-30 disabled:hover:bg-white rounded-lg font-black flex justify-center items-center text-stone-500 hover:text-stone-800 transition-colors border border-[#d4c5b0]">
                          <Plus className="w-4 h-4" />
                        </motion.button>
                      </div>
                    )}

                    {generationMethod === "roll" && (
                      <div className="w-full flex flex-col items-center">
                        {rolledScores.length === 0 ? (
                          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Roll First</span>
                        ) : (
                          <div className="w-full relative">
                            <div className={`text-3xl lg:text-4xl font-black text-center tracking-tighter mb-3 ${isAssignedHere ? 'text-amber-800' : 'text-stone-500'}`}>
                              {assignedVal}
                            </div>
                            
                            <div className="flex flex-wrap gap-1.5 justify-center mt-2">
                              {rolledScores.map((score, idx) => {
                                const isAssignedToMe = assignments[stat] === idx;
                                const isAssignedToOther = Object.values(assignments).includes(idx) && !isAssignedToMe;
                                return (
                                  <button
                                    key={`assign-${stat}-${idx}`}
                                    disabled={isAssignedToOther}
                                    onClick={() => assignRollToStat(stat, idx)}
                                    className={`w-7 h-7 lg:w-8 lg:h-8 rounded-lg text-[11px] font-black transition-all border ${isAssignedToMe ? 'bg-amber-200 border-amber-700 text-amber-800 scale-110 shadow-sm' : isAssignedToOther ? 'bg-transparent border-transparent text-transparent opacity-0 pointer-events-none absolute' : 'bg-white border-[#d4c5b0] text-stone-500 hover:border-amber-600 hover:text-amber-800'}`}
                                  >
                                    {score}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  </div>

                  <div className="w-full text-center flex flex-col">
                    <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest px-2 mb-3">
                      <span className="text-stone-500">Bonus</span>
                      <span className={getBonus(stat) > 0 ? 'text-green-600' : 'text-stone-400'}>+{getBonus(stat)}</span>
                    </div>
                    <div className={`border-t border-[#d4c5b0] pt-5 w-full flex flex-col items-center transition-colors`}>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500 mb-2">Final Score</span>
                      <span className="text-4xl font-black text-stone-900 leading-none tracking-tighter mb-3">
                        {generationMethod === "roll" && !isAssignedHere ? "-" : totalStats[stat as keyof typeof totalStats]}
                      </span>
                      <div className={`bg-[#fdfaf6] px-5 py-2 rounded-xl border border-[#d4c5b0] shadow-sm`}>
                        <span className={`text-base font-black ${mod >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {generationMethod === "roll" && !isAssignedHere ? "-" : (mod >= 0 ? `+${mod}` : mod)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <motion.div layout className={`bg-white/90 backdrop-blur-sm rounded-2xl border transition-all duration-300 overflow-hidden ${isAsiOpen ? "border-amber-300 ring-1 ring-amber-200 shadow-lg" : "border-[#d4c5b0] hover:border-[#a6937a]"}`}>
        <button onClick={toggleAsi} className={`w-full flex justify-between items-center p-6 transition-colors border-l-4 ${isAsiOpen ? "bg-amber-50/50 border-l-amber-500" : "hover:bg-[#fcfbf9] border-l-transparent"}`}>
          <div className="text-left flex items-center gap-4">
            <div className={`p-3 rounded-xl transition-colors ${isAsiOpen ? "bg-amber-100 text-amber-700" : "bg-[#fdfaf6] border border-[#d4c5b0] text-stone-500"}`}>
              <Dna className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-stone-900 uppercase tracking-tight">Ability Score Increases</h3>
              <p className="text-[10px] text-stone-500 mt-1 uppercase font-bold tracking-[0.2em]">Origin • Custom Bonuses</p>
            </div>
          </div>
          <ChevronDown className={`w-6 h-6 text-stone-400 transform transition-transform duration-500 ${isAsiOpen ? "rotate-180 text-amber-600" : ""}`} />
        </button>
        
        <AnimatePresence>
          {isAsiOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: "auto", opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }} 
              className="bg-[#fdfaf6] border-t border-[#d4c5b0] relative"
            >
              <div className="p-8 relative z-10">
                <p className="text-xs text-stone-700 font-medium leading-relaxed mb-8 border-l-4 border-amber-500 pl-5 py-3 bg-amber-50 rounded-r-xl">
                  Secara default, ras <span className="font-black text-stone-900 uppercase tracking-wider text-[11px] bg-white px-2 py-1 rounded border border-[#d4c5b0]">{race}</span> memberikan bonus stat bawaan. Namun, Anda bisa menggunakan aturan kustom (Tasha's Cauldron) untuk mendistribusikan bonus ini secara bebas (+2/+1 atau +1/+1/+1).
                </p>

                <div className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-black text-stone-500 mb-3 uppercase tracking-[0.2em]">Pilih Metode Bonus</label>
                    <div className="relative">
                      <select 
                        value={asiChoice} 
                        onChange={(e) => { playClickSound(); updateField("asiChoice", e.target.value); }} 
                        className="w-full bg-white border border-[#d4c5b0] focus:ring-1 focus:ring-amber-400 rounded-xl px-5 py-4 text-stone-900 text-sm font-black outline-none focus:border-amber-400 appearance-none cursor-pointer uppercase tracking-widest shadow-sm relative z-10"
                      >
                        <option value="standard">Standard Racial Traits ({race})</option>
                        <option value="custom21">Custom Rules (+2 and +1)</option>
                        <option value="custom111">Custom Rules (+1, +1, and +1)</option>
                      </select>
                      <ChevronDown className="w-5 h-5 text-stone-400 absolute right-5 top-1/2 -translate-y-1/2 z-20 pointer-events-none" />
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {asiChoice === "custom21" && (
                      <motion.div 
                        key="custom21"
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} 
                        className="space-y-5 pt-8 border-t border-[#d4c5b0]"
                      >
                        <p className="text-[11px] font-black text-amber-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Plus className="w-4 h-4" /> Increase one score by 2 and a different score by 1.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-[10px] font-black text-stone-500 mb-3 uppercase tracking-[0.2em]">+2 Bonus Score</label>
                            <div className="relative">
                              <select value={customBonus1} onChange={e => updateField("customBonus1", e.target.value)} className="w-full bg-white border border-[#d4c5b0] focus:ring-1 focus:ring-amber-400 rounded-xl px-5 py-4 text-stone-900 text-xs font-bold outline-none focus:border-amber-400 shadow-sm appearance-none cursor-pointer relative z-10">
                                {STAT_OPTIONS.map(s => <option key={`p2-${s}`} value={s}>{FULL_STAT_NAMES[s]} (+2)</option>)}
                              </select>
                              <ChevronDown className="w-4 h-4 text-stone-400 absolute right-4 top-1/2 -translate-y-1/2 z-20 pointer-events-none" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-stone-500 mb-3 uppercase tracking-[0.2em]">+1 Bonus Score</label>
                            <div className="relative">
                              <select value={customBonus2} onChange={e => updateField("customBonus2", e.target.value)} className="w-full bg-white border border-[#d4c5b0] focus:ring-1 focus:ring-amber-400 rounded-xl px-5 py-4 text-stone-900 text-xs font-bold outline-none focus:border-amber-400 shadow-sm appearance-none cursor-pointer relative z-10">
                                {STAT_OPTIONS.map(s => <option key={`p1-${s}`} value={s} disabled={s === customBonus1}>{FULL_STAT_NAMES[s]} (+1) {s === customBonus1 ? ' (In Use)' : ''}</option>)}
                              </select>
                              <ChevronDown className="w-4 h-4 text-stone-400 absolute right-4 top-1/2 -translate-y-1/2 z-20 pointer-events-none" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {asiChoice === "custom111" && (
                      <motion.div 
                        key="custom111"
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} 
                        className="space-y-5 pt-8 border-t border-[#d4c5b0]"
                      >
                        <p className="text-[11px] font-black text-amber-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Plus className="w-4 h-4" /> Increase three different scores by 1.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {[
                            { state: customBonus1, setter: "customBonus1", label: "First +1 Bonus" },
                            { state: customBonus2, setter: "customBonus2", label: "Second +1 Bonus" },
                            { state: customBonus3, setter: "customBonus3", label: "Third +1 Bonus" },
                          ].map((sel, idx) => (
                            <div key={idx}>
                              <label className="block text-[10px] font-black text-stone-500 mb-3 uppercase tracking-[0.2em]">{sel.label}</label>
                              <div className="relative">
                                <select 
                                  value={sel.state} 
                                  onChange={e => updateField(sel.setter as any, e.target.value)} 
                                  className="w-full bg-white border border-[#d4c5b0] focus:ring-1 focus:ring-amber-400 rounded-xl px-5 py-4 text-stone-900 text-xs font-bold outline-none focus:border-amber-400 shadow-sm appearance-none cursor-pointer relative z-10"
                                >
                                  {STAT_OPTIONS.map(s => {
                                    const inUse = (sel.setter !== "customBonus1" && s === customBonus1) || 
                                                  (sel.setter !== "customBonus2" && s === customBonus2) || 
                                                  (sel.setter !== "customBonus3" && s === customBonus3);
                                    return <option key={`p111-${idx}-${s}`} value={s} disabled={inUse}>{FULL_STAT_NAMES[s]} (+1)</option>
                                  })}
                                </select>
                                <ChevronDown className="w-4 h-4 text-stone-400 absolute right-4 top-1/2 -translate-y-1/2 z-20 pointer-events-none" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}