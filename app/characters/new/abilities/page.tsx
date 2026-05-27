"use client";

import { useMemo, useState, useEffect } from "react";
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
  Plus,
  Sparkles,
  Info,
  Check,
  Undo2,
  Lock,
  Unlock,
  AlertCircle
} from "lucide-react";

const playClickSound = () => {
  try {
    const audio = new Audio('/sounds/click.mp3');
    audio.volume = 0.1;
    audio.play().catch(() => {});
  } catch (e) {}
};

const playRollSound = () => {
  try {
    const audio = new Audio('/sounds/dice-roll.mp3');
    audio.volume = 0.15;
    audio.play().catch(() => {});
  } catch (e) {}
};

const STAT_OPTIONS = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
const FULL_STAT_NAMES: Record<string, string> = { 
  STR: "Strength", 
  DEX: "Dexterity", 
  CON: "Constitution", 
  INT: "Intelligence", 
  WIS: "Wisdom", 
  CHA: "Charisma" 
};

const STAT_COLORS: Record<string, { bg: string; text: string; border: string; glow: string; accentBg: string }> = {
  STR: {
    bg: "bg-red-50/70",
    text: "text-red-800",
    border: "border-red-200 focus-within:border-red-500",
    glow: "shadow-red-500/10 hover:shadow-red-500/20",
    accentBg: "bg-red-100/50"
  },
  DEX: {
    bg: "bg-emerald-50/70",
    text: "text-emerald-800",
    border: "border-emerald-200 focus-within:border-emerald-500",
    glow: "shadow-emerald-500/10 hover:shadow-emerald-500/20",
    accentBg: "bg-emerald-100/50"
  },
  CON: {
    bg: "bg-orange-50/70",
    text: "text-orange-800",
    border: "border-orange-200 focus-within:border-orange-500",
    glow: "shadow-orange-500/10 hover:shadow-orange-500/20",
    accentBg: "bg-orange-100/50"
  },
  INT: {
    bg: "bg-blue-50/70",
    text: "text-blue-800",
    border: "border-blue-200 focus-within:border-blue-500",
    glow: "shadow-blue-500/10 hover:shadow-blue-500/20",
    accentBg: "bg-blue-100/50"
  },
  WIS: {
    bg: "bg-teal-50/70",
    text: "text-teal-800",
    border: "border-teal-200 focus-within:border-teal-500",
    glow: "shadow-teal-500/10 hover:shadow-teal-500/20",
    accentBg: "bg-teal-100/50"
  },
  CHA: {
    bg: "bg-purple-50/70",
    text: "text-purple-800",
    border: "border-purple-200 focus-within:border-purple-500",
    glow: "shadow-purple-500/10 hover:shadow-purple-500/20",
    accentBg: "bg-purple-100/50"
  }
};

const STAT_DESCRIPTIONS: Record<string, { label: string; desc: string; focus: string }> = {
  STR: {
    label: "Kekuatan Fisik",
    desc: "Daya fisik murni, kekuatan otot, dan daya tahan atletik. Memengaruhi serangan senjata jarak dekat, keahlian Atletik, dan daya tampung beban bawaan.",
    focus: "Sangat penting untuk: Fighter, Barbarian, Paladin"
  },
  DEX: {
    label: "Kelincahan & Refleks",
    desc: "Kecepatan gerak, refleks, keseimbangan, dan koordinasi motorik. Memengaruhi Armor Class (AC), inisiatif bertarung, serta serangan jarak jauh.",
    focus: "Sangat penting untuk: Rogue, Ranger, Monk"
  },
  CON: {
    label: "Ketahanan & Vitalitas",
    desc: "Kesehatan, vitalitas seluler, metabolisme tubuh, dan stamina. Memengaruhi Hit Points (HP) maksimal serta pertahanan terhadap racun atau sihir fisik.",
    focus: "Penting untuk: Semua Kelas Tokoh"
  },
  INT: {
    label: "Kecerdasan & Memori",
    desc: "Akurasi analisis mental, daya ingat memori, logika murni, dan penguasaan sejarah akademis. Memengaruhi perapalan sihir jenis Arcane.",
    focus: "Sangat penting untuk: Wizard"
  },
  WIS: {
    label: "Intuisi & Kesadaran",
    desc: "Ketajaman panca indra, intuisi batin, pemahaman psikologi sekitar, dan insting alam liar. Memengaruhi keahlian Persepsi dan sihir Ilahi.",
    focus: "Sangat penting untuk: Cleric, Druid, Ranger"
  },
  CHA: {
    label: "Kepribadian & Pengaruh",
    desc: "Karisma sosial, kepemimpinan alami, daya tarik verbal, dan keyakinan spiritual. Memengaruhi interaksi diplomatis dan sihir batin.",
    focus: "Sangat penting untuk: Bard, Sorcerer, Warlock, Paladin"
  }
};

interface RollHistory {
  dice: number[];
  droppedIdx: number;
  sum: number;
}

export default function AbilitiesStep() {
  const { 
    baseStats, race, subrace, asiChoice, customBonus1, customBonus2, customBonus3, 
    updateBaseStat, updateField, showToast 
  } = useCharacterStore();

  const [isAsiOpen, setIsAsiOpen] = useState(false);
  const [activeInfoStat, setActiveInfoStat] = useState<string | null>(null);

  // Deteksi metode awal berdasarkan baseStats tersimpan
  const initialMethod = useMemo(() => {
    const hasInvalidPointBuy = Object.values(baseStats).some(v => v > 15 || v < 8) || 
      (27 - Object.values(baseStats).reduce((sum, val) => sum + (POINT_BUY_COSTS[val] ?? 0), 0) < 0);
    return hasInvalidPointBuy ? "roll" : "pointbuy";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [generationMethod, setGenerationMethod] = useState<"pointbuy" | "roll">(initialMethod);
  
  // State untuk pelemparan dadu (Dice Roll Ceremony)
  const [isRolling, setIsRolling] = useState(false);
  const [currentRollingStep, setCurrentRollingStep] = useState<number>(-1);
  const [tempRollingDice, setTempRollingDice] = useState<number[][]>([]);
  const [rollCeremonyDetails, setRollCeremonyDetails] = useState<RollHistory[]>([]);
  const [rolledScores, setRolledScores] = useState<number[]>(() => {
    if (initialMethod === "roll") return STAT_OPTIONS.map(s => baseStats[s]).sort((a,b) => b-a);
    return [];
  });

  // Track alokasi hasil gulungan dadu ke stat (0-5 index dari rolledScores)
  const [assignments, setAssignments] = useState<Record<string, number>>(() => {
    if (initialMethod === "roll") {
      const tempAssign: Record<string, number> = {};
      const usedIndices = new Set<number>();
      
      // Ambil rolled scores awal
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

  const [activeAssigningStat, setActiveAssigningStat] = useState<string | null>(null);

  const rulesRace = RACES[race] || null;
  const rulesSubrace = rulesRace?.subraces?.find((s: any) => s.name === subrace) || null;

  const totalPointsSpent = useMemo(() => Object.values(baseStats).reduce((sum, val) => sum + (POINT_BUY_COSTS[val] ?? 0), 0), [baseStats]);
  const pointsRemaining = 27 - totalPointsSpent;

  // Dapatkan bonus rasial/kustom
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

  // Alokasi Point Buy
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
      setRollCeremonyDetails([]);
    } else {
      // Reset rolls ketika pindah
      STAT_OPTIONS.forEach(s => updateBaseStat(s, 8));
      setAssignments({});
      setRolledScores([]);
    }
  };

  // Upacara Pelemparan Dadu 4d6 Drop Lowest
  const handleRollDice = () => {
    playRollSound();
    setIsRolling(true);
    setCurrentRollingStep(0);
    setRollCeremonyDetails([]);
    setAssignments({});
    STAT_OPTIONS.forEach(s => updateBaseStat(s, 8));

    // Siapkan array kosong untuk menampung animasi dadu acak
    const rollingStates = Array.from({ length: 6 }, () => [1, 1, 1, 1]);
    setTempRollingDice(rollingStates);

    // Animasi menggelindingkan dadu acak
    const animInterval = setInterval(() => {
      setTempRollingDice(prev => 
        prev.map(row => row.map(() => Math.floor(Math.random() * 6) + 1))
      );
    }, 60);

    // Matikan animasi menggelinding setelah 800ms dan mulai kalkulasi hasil riil
    setTimeout(() => {
      clearInterval(animInterval);
      
      const rolls: RollHistory[] = Array.from({ length: 6 }, () => {
        const diceRolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
        const sorted = [...diceRolls].map((v, i) => ({ v, i }));
        sorted.sort((a, b) => a.v - b.v);
        // Index dengan nilai terendah didrop
        const droppedIdx = sorted[0].i;
        const sum = diceRolls.reduce((s, val, idx) => idx === droppedIdx ? s : s + val, 0);
        return { dice: diceRolls, droppedIdx, sum };
      });

      setRollCeremonyDetails(rolls);
      setTempRollingDice(rolls.map(r => r.dice));

      // Tampilkan hasil secara bertahap (staggered delay) untuk drama dramatis
      rolls.forEach((roll, index) => {
        setTimeout(() => {
          setCurrentRollingStep(index + 1);
          playClickSound();
          if (index === 5) {
            const finalSums = rolls.map(r => r.sum).sort((a, b) => b - a);
            setRolledScores(finalSums);
            setIsRolling(false);
            showToast("Semua 6 gulungan berhasil diperoleh! Alokasikan skor ke Atribut pilihan Anda.", "success");
          }
        }, (index + 1) * 300);
      });

    }, 850);
  };

  // Tetapkan gulungan tertentu ke suatu atribut
  const assignRollToStat = (stat: string, rollIndex: number) => {
    playClickSound();
    
    // Jika skor tersebut sudah teralokasi di stat lain, lepaskan dulu stat lain tersebut
    const prevStatForThisScore = Object.keys(assignments).find(k => assignments[k] === rollIndex);
    
    let newAssignments = { ...assignments };
    
    if (prevStatForThisScore) {
      delete newAssignments[prevStatForThisScore];
      updateBaseStat(prevStatForThisScore, 8);
    }

    // Alokasikan ke stat saat ini
    newAssignments[stat] = rollIndex;
    setAssignments(newAssignments);
    updateBaseStat(stat, rolledScores[rollIndex]);
    setActiveAssigningStat(null);
  };

  // Hapus alokasi gulungan dari stat
  const unassignRoll = (stat: string) => {
    playClickSound();
    const newAssignments = { ...assignments };
    delete newAssignments[stat];
    setAssignments(newAssignments);
    updateBaseStat(stat, 8);
  };

  const toggleAsi = () => {
    playClickSound();
    setIsAsiOpen(!isAsiOpen);
  };

  // Toggle pilihan custom bonus untuk rule +1/+1/+1
  const handleCustom111Toggle = (stat: string) => {
    playClickSound();
    if (customBonus1 === stat) {
      updateField("customBonus1", customBonus2 === stat ? "STR" : customBonus2);
      return;
    }
    if (customBonus2 === stat) {
      updateField("customBonus2", customBonus3 === stat ? "DEX" : customBonus3);
      return;
    }
    if (customBonus3 === stat) {
      updateField("customBonus3", "CON");
      return;
    }
    
    // Rotasi melingkar untuk slot bonus jika penuh
    updateField("customBonus3", customBonus2);
    updateField("customBonus2", customBonus1);
    updateField("customBonus1", stat);
  };

  // Toggle pilihan custom bonus untuk rule +2/+1
  const handleCustom21Select = (stat: string, bonusAmount: 2 | 1) => {
    playClickSound();
    if (bonusAmount === 2) {
      updateField("customBonus1", stat);
      if (customBonus2 === stat) {
        const nextAvailable = STAT_OPTIONS.find(s => s !== stat) || "STR";
        updateField("customBonus2", nextAvailable);
      }
    } else {
      if (customBonus1 === stat) {
        showToast("Stat bonus +1 harus berbeda dari bonus +2!", "error");
        return;
      }
      updateField("customBonus2", stat);
    }
  };

  const allDiceAllocated = useMemo(() => {
    if (generationMethod !== "roll") return false;
    return rolledScores.length > 0 && Object.keys(assignments).length === 6;
  }, [generationMethod, rolledScores, assignments]);

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl pb-24 relative z-10">
      
      {/* Title & Deskripsi dengan Aksen Keemasan */}
      <div className="relative">
        <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-amber-600 rounded-full" />
        <h2 className="text-4xl font-black text-stone-900 tracking-tighter uppercase relative z-10 flex items-center gap-3">
          <Hexagon className="w-8 h-8 text-amber-700 fill-amber-700/10 shrink-0" /> Atribut & Kemampuan
        </h2>
        <p className="text-stone-500 mt-2 font-bold uppercase tracking-[0.2em] text-[10px] relative z-10 leading-relaxed">
          Tentukan skor kemampuan dasar hero Anda menggunakan Point Buy klasik atau uji nasib Anda lewat gulungan dadu legendaris.
        </p>
      </div>

      {/* Metode selector tabs */}
      <div className="bg-white/95 backdrop-blur-sm rounded-[2rem] border border-[#d4c5b0] shadow-xl relative overflow-hidden group focus-within:border-amber-500/50 transition-all duration-500">
        
        <div className="flex border-b border-[#d4c5b0] bg-[#fdfaf6] p-1.5 gap-1">
          <button 
            onClick={() => handleMethodSwitch("pointbuy")}
            aria-selected={generationMethod === "pointbuy"}
            role="tab"
            className={`flex-1 py-4.5 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all duration-300 flex items-center justify-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500
              ${generationMethod === "pointbuy" ? 'text-amber-800 bg-white border border-[#d4c5b0]/60 shadow-md shadow-amber-900/5' : 'text-stone-500 hover:text-stone-700 hover:bg-[#fcfbf9]'}`}
          >
            <Calculator className="w-4.5 h-4.5" /> Point Buy System
          </button>
          <button 
            onClick={() => handleMethodSwitch("roll")}
            aria-selected={generationMethod === "roll"}
            role="tab"
            className={`flex-1 py-4.5 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all duration-300 flex items-center justify-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500
              ${generationMethod === "roll" ? 'text-amber-800 bg-white border border-[#d4c5b0]/60 shadow-md shadow-amber-900/5' : 'text-stone-500 hover:text-stone-700 hover:bg-[#fcfbf9]'}`}
          >
            <Dices className="w-4.5 h-4.5" /> Roll 4d6 Drop Lowest
          </button>
        </div>

        <div className="p-6 md:p-10 relative bg-[#fdfaf6]">
          
          {/* ========================================================================= */}
          {/* PANEL SYSTEM: POINT BUY */}
          {/* ========================================================================= */}
          {generationMethod === "pointbuy" && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="flex flex-col md:flex-row justify-between items-center mb-10 pb-8 border-b border-[#d4c5b0]/60 relative z-10 gap-6"
            >
              <div className="text-center md:text-left flex-1">
                <h3 className="text-2xl font-black text-stone-900 uppercase tracking-tighter flex items-center justify-center md:justify-start gap-2">
                  <Calculator className="w-5 h-5 text-amber-700" /> Alokasi Point Buy
                </h3>
                <p className="text-[10px] text-stone-400 font-extrabold uppercase tracking-[0.15em] mt-2 leading-relaxed">
                  Semua atribut bermula dari nilai dasar 8. Anda memiliki 27 poin untuk didistribusikan. Maksimal stat dasar adalah 15.
                </p>
              </div>

              {/* Points Remaining Glowing Circle */}
              <div className="flex items-center gap-5 bg-white px-7 py-4.5 rounded-2xl border border-[#d4c5b0] shadow-sm relative group/points overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-amber-50/50 opacity-0 group-hover/points:opacity-100 transition-opacity" />
                <span className="text-[9px] font-black text-stone-500 uppercase tracking-[0.2em] pt-0.5 relative z-10">Poin Tersisa</span>
                
                <div className="relative flex items-center justify-center z-10 shrink-0">
                  <span className={`text-5xl font-black leading-none tracking-tighter font-mono transition-colors duration-500
                    ${pointsRemaining === 0 ? 'text-green-600 shadow-green-500/10' : pointsRemaining < 0 ? 'text-red-600' : 'text-amber-600'}`}>
                    {pointsRemaining}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* PANEL SYSTEM: DICE ROLL 4D6 */}
          {/* ========================================================================= */}
          {generationMethod === "roll" && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="flex flex-col items-center mb-10 pb-8 border-b border-[#d4c5b0]/60 relative z-10 gap-6 w-full"
            >
              <div className="w-full text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-5">
                <div>
                  <h3 className="text-2xl font-black text-stone-900 uppercase tracking-tighter flex items-center justify-center md:justify-start gap-2">
                    <Dices className="w-5 h-5 text-amber-700" /> Gulungan Fates
                  </h3>
                  <p className="text-[10px] text-stone-400 font-extrabold uppercase tracking-[0.15em] mt-2 leading-relaxed">
                    Lempar 4 dadu bersisi 6 (d6) untuk 6 atribut, coret angka terendah, lalu jumlahkan sisa 3 dadu teratas.
                  </p>
                </div>

                {rolledScores.length > 0 && !isRolling && (
                  <button 
                    onClick={handleRollDice}
                    className="py-3 px-6 bg-white hover:bg-stone-50 border border-[#d4c5b0] hover:border-stone-400 rounded-xl text-stone-700 hover:text-stone-900 font-black uppercase text-[9px] tracking-widest transition-all shadow-sm active:scale-97 flex items-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Ulangi Gulungan
                  </button>
                )}
              </div>

              {rolledScores.length === 0 && !isRolling ? (
                /* Tombol utama pelemparan awal */
                <button 
                  onClick={handleRollDice}
                  className="w-full max-w-lg py-7 bg-amber-100 hover:bg-amber-200 border-2 border-amber-300 rounded-2.5xl text-amber-800 hover:text-amber-900 font-black uppercase tracking-[0.3em] text-xs transition-all shadow-md hover:shadow-amber-900/10 active:scale-98 flex items-center justify-center gap-4 hover:border-amber-600 group"
                >
                  <Dices className="w-6 h-6 text-amber-700 group-hover:rotate-12 transition-transform duration-300" />
                  LEMPAR DADU TAKDIR (4d6 Drop Lowest)
                </button>
              ) : (
                /* Container Upacara Dadu atau Tray Hasil */
                <div className="w-full space-y-8">
                  {/* Upacara Dadu saat rolling atau hasil visual */}
                  {(isRolling || rollCeremonyDetails.length > 0) && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 bg-white/70 p-5 rounded-2.5xl border border-[#d4c5b0] shadow-inner">
                      {Array.from({ length: 6 }).map((_, index) => {
                        const roll = rollCeremonyDetails[index];
                        const isRollingThisRow = tempRollingDice[index] !== undefined;
                        const rowState = isRollingThisRow ? tempRollingDice[index] : [1, 1, 1, 1];
                        const isStepShown = currentRollingStep > index;

                        return (
                          <div 
                            key={`ceremony-${index}`} 
                            className={`flex flex-col items-center p-3.5 rounded-2xl border transition-all duration-500
                              ${isStepShown ? 'bg-amber-50/50 border-amber-300 shadow-sm' : 'bg-stone-50 border-stone-200 opacity-60'}`}
                          >
                            <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-3.5">
                              Skor #{index + 1}
                            </span>
                            
                            {/* Baris 4 Dadu */}
                            <div className="flex gap-1.5 justify-center mb-4">
                              {rowState.map((val, dIdx) => {
                                const isDropped = isStepShown && roll?.droppedIdx === dIdx;
                                return (
                                  <motion.div
                                    key={`die-${index}-${dIdx}`}
                                    animate={isRolling ? { 
                                      rotate: [0, 90, 180, 270, 360],
                                      scale: [1, 1.15, 1],
                                      y: [0, -4, 0]
                                    } : {}}
                                    transition={{ duration: 0.4, repeat: isRolling ? Infinity : 0 }}
                                    className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center text-xs font-black select-none transition-all duration-300
                                      ${isDropped 
                                        ? 'bg-stone-100 border-dashed border-red-400 text-stone-400 line-through scale-90 opacity-60' 
                                        : isStepShown 
                                          ? 'bg-white border-amber-600 text-amber-900 shadow-sm' 
                                          : 'bg-white border-stone-300 text-stone-500'}`}
                                  >
                                    {val}
                                  </motion.div>
                                );
                              })}
                            </div>

                            {/* Total Sum */}
                            <div className="text-center pt-2.5 border-t border-[#d4c5b0]/40 w-full flex justify-between items-center px-1">
                              <span className="text-[8px] font-extrabold uppercase tracking-wider text-stone-400">Total:</span>
                              <span className="text-lg font-black text-stone-800 leading-none">
                                {isStepShown ? roll?.sum : isRolling ? "?" : "-"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Tray Gulungan Siap Dialokasikan */}
                  {rolledScores.length > 0 && !isRolling && (
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }} 
                      animate={{ scale: 1, opacity: 1 }} 
                      className="flex flex-col items-center bg-white border border-[#d4c5b0] p-6 rounded-2.5xl w-full shadow-sm relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-200 via-amber-600 to-amber-200" />
                      
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500 mb-5 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-600" /> Baki Gulungan Dadu Terbuka
                      </span>
                      
                      <div className="flex flex-wrap justify-center gap-4.5 w-full">
                        {rolledScores.map((score, idx) => {
                          // Cek apakah skor di index ini sudah dialokasikan ke suatu stat
                          const targetStat = Object.keys(assignments).find(k => assignments[k] === idx);
                          const isAssigned = targetStat !== undefined;

                          return (
                            <motion.button 
                              key={`roll-${idx}`}
                              whileHover={!isAssigned ? { scale: 1.05 } : {}}
                              whileTap={!isAssigned ? { scale: 0.95 } : {}}
                              onClick={() => {
                                if (isAssigned) {
                                  unassignRoll(targetStat);
                                }
                              }}
                              className={`px-5 py-4 rounded-xl border flex flex-col items-center justify-center transition-all duration-300 min-w-[70px]
                                ${isAssigned 
                                  ? 'bg-stone-50 border-stone-200 text-stone-400 cursor-pointer hover:border-red-400 hover:text-red-500 hover:bg-red-50 group' 
                                  : 'bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-900 shadow-sm cursor-default'}`}
                            >
                              <span className="text-2xl font-black tracking-tighter">{score}</span>
                              <span className="text-[8px] font-black uppercase tracking-widest mt-1 block">
                                {isAssigned ? (
                                  <>
                                    <span className="group-hover:hidden">{targetStat}</span>
                                    <span className="hidden group-hover:inline text-red-500">Batal</span>
                                  </>
                                ) : 'Bebas'}
                              </span>
                            </motion.button>
                          )
                        })}
                      </div>
                      
                      {allDiceAllocated && (
                        <div className="mt-5 text-[10px] font-black uppercase text-green-700 tracking-widest bg-green-50 px-4 py-2 rounded-lg border border-green-200 flex items-center gap-2 animate-bounce">
                          <Check className="w-4.5 h-4.5" /> Semua gulungan berhasil dialokasikan!
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* GRID UTAMA: 6 ATRIBUT KARTU TACTILE */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {STAT_OPTIONS.map((stat) => {
              const baseValue = baseStats[stat];
              const bonusValue = getBonus(stat);
              const finalValue = totalStats[stat as keyof typeof totalStats];
              const mod = calcMod(finalValue);
              const colorInfo = STAT_COLORS[stat];
              const descInfo = STAT_DESCRIPTIONS[stat];
              
              const isMaxed = baseValue === 15;
              const isMin = baseValue === 8;

              const isAssignedHere = Object.keys(assignments).includes(stat);
              const assignedIndex = assignments[stat];

              // Cek biaya kustom point buy
              const getIncreaseCost = () => {
                if (isMaxed) return 0;
                return (POINT_BUY_COSTS[baseValue + 1] ?? 0) - (POINT_BUY_COSTS[baseValue] ?? 0);
              };

              const getDecreaseCost = () => {
                if (isMin) return 0;
                return (POINT_BUY_COSTS[baseValue] ?? 0) - (POINT_BUY_COSTS[baseValue - 1] ?? 0);
              };

              const showInfoOverlay = activeInfoStat === stat;
              const showAssignPanel = activeAssigningStat === stat;

              return (
                <div 
                  key={stat} 
                  className={`bg-white rounded-2.5xl border p-5 flex flex-col justify-between relative overflow-hidden transition-all duration-400 shadow-sm hover:shadow-md focus-within:ring-2 focus-within:ring-amber-500/20
                    ${colorInfo.border} ${colorInfo.glow} ${showInfoOverlay || showAssignPanel ? 'ring-1 ring-[#d4c5b0]' : ''}`}
                >
                  
                  {/* Bagian Atas: Label & Tombol Info */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className={`text-2xl font-black tracking-tight flex items-baseline gap-1.5 ${colorInfo.text}`}>
                        {stat}
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block font-sans">
                          {descInfo.label}
                        </span>
                      </h4>
                    </div>

                    <button 
                      onClick={() => { playClickSound(); setActiveInfoStat(showInfoOverlay ? null : stat); }}
                      aria-label={`Informasi untuk ${stat}`}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Panel Informasi Overlay */}
                  <AnimatePresence>
                    {showInfoOverlay && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        exit={{ opacity: 0, scale: 0.95 }} 
                        className="absolute inset-0 bg-[#fdfaf6] p-5 z-20 flex flex-col justify-between border-b border-[#d4c5b0]"
                      >
                        <div className="space-y-2.5">
                          <h5 className="text-[10px] font-black uppercase text-amber-800 tracking-widest">Detail Atribut: {stat}</h5>
                          <p className="text-[11px] leading-relaxed text-stone-600 font-semibold">{descInfo.desc}</p>
                          <p className="text-[9px] leading-relaxed text-amber-700 font-black uppercase tracking-wider">{descInfo.focus}</p>
                        </div>
                        <button 
                          onClick={() => setActiveInfoStat(null)}
                          className="mt-4 w-full py-2 bg-stone-100 hover:bg-stone-200 rounded-xl text-stone-700 font-bold uppercase text-[9px] tracking-widest transition-colors"
                        >
                          Tutup Info
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Area Penyesuaian Nilai Dasar */}
                  <div className="bg-[#fdfaf6] p-3 rounded-2xl border border-[#d4c5b0]/60 shadow-inner min-h-[72px] mb-4.5 flex items-center justify-center relative">
                    
                    {/* POINT BUY INTERFACE */}
                    {generationMethod === "pointbuy" && (
                      <div className="flex items-center justify-between w-full px-2">
                        {/* Minus Button */}
                        <div className="flex flex-col items-center">
                          <motion.button 
                            whileTap={{ scale: 0.85 }} 
                            disabled={isMin} 
                            onClick={() => adjustStat(stat, -1)} 
                            aria-label={`Kurangi ${stat}`}
                            className="w-9 h-9 bg-white hover:bg-stone-50 disabled:opacity-25 rounded-xl font-black flex justify-center items-center text-stone-500 hover:text-stone-800 transition-all border border-[#d4c5b0] active:scale-95 shadow-sm"
                          >
                            <Minus className="w-4.5 h-4.5" />
                          </motion.button>
                          {!isMin && (
                            <span className="text-[8px] font-black text-green-700 uppercase tracking-widest mt-1 block">+{getDecreaseCost()} Poin</span>
                          )}
                        </div>

                        {/* Current Base Score */}
                        <div className="text-center">
                          <span className={`text-4xl font-black text-stone-900 tracking-tighter leading-none block font-mono ${isMaxed ? 'text-amber-700' : ''}`}>
                            {baseValue}
                          </span>
                          <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest mt-0.5 block">Dasar</span>
                        </div>

                        {/* Plus Button */}
                        <div className="flex flex-col items-center">
                          <motion.button 
                            whileTap={{ scale: 0.85 }} 
                            disabled={isMaxed || pointsRemaining < getIncreaseCost()} 
                            onClick={() => adjustStat(stat, 1)} 
                            aria-label={`Tambah ${stat}`}
                            className="w-9 h-9 bg-white hover:bg-stone-50 disabled:opacity-25 rounded-xl font-black flex justify-center items-center text-stone-500 hover:text-stone-800 transition-all border border-[#d4c5b0] active:scale-95 shadow-sm"
                          >
                            <Plus className="w-4.5 h-4.5" />
                          </motion.button>
                          {!isMaxed && (
                            <span className={`text-[8px] font-black uppercase tracking-widest mt-1 block ${pointsRemaining < getIncreaseCost() ? 'text-red-500' : 'text-amber-600'}`}>
                              -{getIncreaseCost()} Poin
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ROLL 4D6 ASSIGNMENT INTERFACE */}
                    {generationMethod === "roll" && (
                      <div className="w-full">
                        {rolledScores.length === 0 ? (
                          <div className="text-center py-2 flex flex-col items-center gap-1.5 select-none text-stone-400">
                            <Lock className="w-4 h-4 opacity-60" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Lempar Dadu Dahulu</span>
                          </div>
                        ) : (
                          <div className="w-full flex items-center justify-between px-2">
                            {isAssignedHere ? (
                              /* Tampilan ketika sudah dialokasikan */
                              <div className="flex items-center justify-between w-full">
                                <div className="text-left">
                                  <span className="text-2xl font-black font-mono text-amber-900 bg-amber-100 border border-amber-300/60 px-3 py-1 rounded-xl shadow-sm">
                                    {baseValue}
                                  </span>
                                  <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest mt-1.5 block">Hasil Terpilih</span>
                                </div>
                                <button 
                                  onClick={() => unassignRoll(stat)}
                                  className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors text-[9px] font-black uppercase tracking-wider flex items-center gap-1"
                                >
                                  <Undo2 className="w-3.5 h-3.5" /> Lepas
                                </button>
                              </div>
                            ) : (
                              /* Tampilan slot kosong siap pilih */
                              <div className="w-full">
                                <button 
                                  onClick={() => { playClickSound(); setActiveAssigningStat(showAssignPanel ? null : stat); }}
                                  className="w-full py-2.5 rounded-xl border border-dashed border-amber-500/40 hover:border-amber-500 text-amber-800 hover:text-amber-900 bg-white hover:bg-amber-50/50 transition-all text-[9.5px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                                >
                                  <Unlock className="w-3.5 h-3.5 text-amber-600 animate-pulse" /> Alokasikan Skor
                                </button>
                              </div>
                            )}

                            {/* Dropdown overlay pilihan skor tersedia */}
                            <AnimatePresence>
                              {showAssignPanel && (
                                <motion.div 
                                  initial={{ opacity: 0, y: 10 }} 
                                  animate={{ opacity: 1, y: 0 }} 
                                  exit={{ opacity: 0, y: 10 }} 
                                  className="absolute inset-x-0 bottom-0 bg-white border-t border-[#d4c5b0] p-3 rounded-b-2xl z-30 shadow-2xl"
                                >
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-[9px] font-black text-stone-500 uppercase tracking-wider">Gulungan Bebas:</span>
                                    <button onClick={() => setActiveAssigningStat(null)} className="text-[8px] font-black uppercase text-stone-400 hover:text-stone-600">Batal</button>
                                  </div>
                                  <div className="flex flex-wrap gap-1.5 justify-center">
                                    {rolledScores.map((score, rIdx) => {
                                      const isAlreadyUsed = Object.values(assignments).includes(rIdx);
                                      if (isAlreadyUsed) return null;
                                      return (
                                        <button
                                          key={`assign-${stat}-${rIdx}`}
                                          onClick={() => assignRollToStat(stat, rIdx)}
                                          className="w-9 h-9 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-sm font-black transition-all flex items-center justify-center font-mono active:scale-90"
                                        >
                                          {score}
                                        </button>
                                      );
                                    })}
                                    {rolledScores.every((_, rIdx) => Object.values(assignments).includes(rIdx)) && (
                                      <span className="text-[9px] text-stone-400 font-bold italic py-1 block">Semua skor sudah terpakai!</span>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                          </div>
                        )}
                      </div>
                    )}

                  </div>

                  {/* Bagian Bawah: Bonus & Final Score */}
                  <div className="border-t border-[#d4c5b0]/60 pt-4 space-y-4">
                    
                    {/* Baris Informasi Atribut Tambahan */}
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest px-1">
                      <span className="text-stone-400">Bonus Origin</span>
                      <span className={bonusValue > 0 ? 'text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded border border-green-200' : 'text-stone-400'}>
                        +{bonusValue}
                      </span>
                    </div>

                    {/* Final Modifier Display Card */}
                    <div className="flex items-center justify-between bg-stone-50 p-3.5 rounded-2xl border border-[#d4c5b0]/40">
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-stone-400 block mb-0.5">Total Akhir</span>
                        <span className="text-3xl font-black text-stone-900 leading-none font-mono">
                          {generationMethod === "roll" && !isAssignedHere ? "-" : finalValue}
                        </span>
                      </div>
                      
                      <div className={`px-4.5 py-2.5 rounded-xl border flex flex-col items-center justify-center min-w-[64px] shadow-inner bg-white
                        ${mod >= 0 ? 'border-green-200' : 'border-red-200'}`}>
                        <span className="text-[8px] font-black uppercase tracking-widest text-stone-400 block mb-0.5 select-none">Modifikator</span>
                        <span className={`text-xl font-black font-mono leading-none ${mod >= 0 ? 'text-green-700' : 'text-red-600'}`}>
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

      {/* ========================================================================= */}
      {/* SEKSI: ABILITY SCORE INCREASES (ASI) / CUSTOM CUSTOMIZATIONS */}
      {/* ========================================================================= */}
      <motion.div 
        layout="position" 
        className={`bg-white/90 backdrop-blur-sm rounded-3xl border transition-all duration-300 overflow-hidden shadow-sm
          ${isAsiOpen ? "border-amber-400 shadow-md shadow-amber-900/5 ring-1 ring-amber-400/20" : "border-[#d4c5b0] hover:border-[#a6937a]"}`}
      >
        <button 
          onClick={toggleAsi} 
          aria-expanded={isAsiOpen}
          className={`w-full flex justify-between items-center p-6 transition-all duration-300 border-l-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500
            ${isAsiOpen ? "bg-amber-50/30 border-l-amber-500" : "hover:bg-[#fcfbf9] border-l-transparent"}`}
        >
          <div className="text-left flex items-center gap-4">
            <div className={`p-2.5 rounded-xl transition-colors border
              ${isAsiOpen ? "bg-amber-100 border-amber-200 text-amber-700" : "bg-[#fdfaf6] border-[#d4c5b0] text-stone-500"}`}>
              <Dna className="w-5 h-5 shrink-0" />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900 uppercase tracking-tight">Kustomisasi Atribut Bonus (ASI)</h3>
              <p className="text-[9px] text-stone-400 mt-1.5 uppercase font-extrabold tracking-[0.2em] leading-none">Standard Origin • Aturan Kustom Tasha</p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-stone-400 transform transition-transform duration-500 ${isAsiOpen ? "rotate-180 text-amber-600" : ""}`} />
        </button>
        
        <AnimatePresence>
          {isAsiOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: "auto", opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }} 
              transition={{ duration: 0.45, ease: [0.04, 0.62, 0.23, 0.98] }}
              className="bg-[#fdfaf6] border-t border-[#d4c5b0]/60 relative"
            >
              <div className="p-6 md:p-8 relative z-10 space-y-8">
                
                {/* Penjelasan Ringkas Aturan Tasha */}
                <div className="text-xs text-stone-600 leading-relaxed font-semibold border-l-4 border-amber-500 pl-5 py-3.5 bg-amber-50 rounded-r-xl">
                  Berdasarkan aturan dasar, Ras <span className="font-black text-stone-900 uppercase tracking-wider text-[10px] bg-white px-2 py-0.5 rounded border border-[#d4c5b0]/80 shadow-sm">{race}</span> memberikan bonus stat bawaan. Namun, dengan modul kustom (<span className="italic text-stone-800">Tasha's Cauldron of Everything</span>), Anda dibebaskan memindahkan bonus tersebut agar pas dengan alur tokoh petualang Anda (+2/+1 atau +1/+1/+1).
                </div>

                {/* Pilih Metode Selector Tactile Cards */}
                <div className="space-y-3">
                  <label className="block text-[9px] font-black text-stone-400 uppercase tracking-[0.2em]">Pilih Format Aturan Bonus</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { id: "standard", title: "Standard Origin", desc: `Gunakan bonus stat bawaan ras asli (${race})` },
                      { id: "custom21", title: "Modul Tasha (+2 / +1)", desc: "Dapatkan bonus +2 ke satu atribut dan +1 ke atribut lain yang berbeda" },
                      { id: "custom111", title: "Modul Tasha (+1 x3)", desc: "Dapatkan bonus +1 ke tiga atribut yang saling berbeda" }
                    ].map((opt) => {
                      const isSelected = asiChoice === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => { playClickSound(); updateField("asiChoice", opt.id); }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              updateField("asiChoice", opt.id);
                            }
                          }}
                          role="radio"
                          aria-checked={isSelected}
                          tabIndex={0}
                          className={`cursor-pointer p-4.5 rounded-2xl border-2 transition-all duration-300 flex flex-col justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500
                            ${isSelected 
                              ? 'bg-amber-50/50 border-amber-600 ring-1 ring-amber-600/30' 
                              : 'bg-white border-[#d4c5b0] hover:border-amber-400 hover:bg-[#fcfbf9]'}`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-xs font-black uppercase tracking-wider text-stone-800">{opt.title}</h4>
                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all
                              ${isSelected ? 'bg-amber-600 border-amber-700 text-white' : 'bg-white border-[#d4c5b0]'}`}>
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </div>
                          <p className="text-[10px] text-stone-500 font-semibold leading-relaxed">{opt.desc}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* AREA DETAIL PEMILIHAN DUA BONUS CUSTOM */}
                <AnimatePresence mode="wait">
                  
                  {/* STANDARD RATIAL DISPLAY */}
                  {asiChoice === "standard" && (
                    <motion.div 
                      key="standard-panel"
                      initial={{ opacity: 0, y: -10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: -10 }} 
                      className="pt-6 border-t border-[#d4c5b0]/60 space-y-4"
                    >
                      <h4 className="text-[10px] font-black text-amber-800 uppercase tracking-widest flex items-center gap-2">
                        <Check className="w-4 h-4" /> Bonus Aktif Bawaan Rasial
                      </h4>
                      <div className="flex flex-wrap gap-2.5">
                        {/* Tampilkan bonus standar dari database ras */}
                        {rulesRace && Object.entries(rulesRace.bonuses).map(([stat, val]) => (
                          <div key={`std-${stat}`} className="bg-white border border-[#d4c5b0] rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-sm font-black text-stone-800 text-[10px] uppercase tracking-wider">
                            <span>{stat}</span>
                            <span className="text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">+{val as number}</span>
                          </div>
                        ))}
                        {rulesSubrace && Object.entries(rulesSubrace.bonuses).map(([stat, val]) => (
                          <div key={`std-sub-${stat}`} className="bg-white border border-[#d4c5b0] rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-sm font-black text-stone-800 text-[10px] uppercase tracking-wider">
                            <span>{stat} (Subrace)</span>
                            <span className="text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">+{val as number}</span>
                          </div>
                        ))}
                        {(!rulesRace || (Object.keys(rulesRace.bonuses).length === 0 && (!rulesSubrace || Object.keys(rulesSubrace.bonuses).length === 0))) && (
                          <span className="text-[10px] text-stone-400 font-bold italic">Ras ini tidak memiliki bonus atribut dasar bawaan.</span>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* CUSTOM MODE (+2 / +1) */}
                  {asiChoice === "custom21" && (
                    <motion.div 
                      key="custom21-panel"
                      initial={{ opacity: 0, y: -10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: -10 }} 
                      className="pt-6 border-t border-[#d4c5b0]/60 space-y-6"
                    >
                      {/* Pilihan +2 */}
                      <div className="space-y-3">
                        <span className="text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] block">
                          Pilih Atribut untuk Bonus +2
                        </span>
                        
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                          {STAT_OPTIONS.map((s) => {
                            const isSelected = customBonus1 === s;
                            return (
                              <button
                                key={`custom2-${s}`}
                                onClick={() => handleCustom21Select(s, 2)}
                                className={`py-3 rounded-xl border-2 transition-all font-black text-[10px] uppercase tracking-wider flex flex-col items-center gap-1
                                  ${isSelected 
                                    ? 'bg-amber-100 border-amber-600 text-amber-900 shadow-sm' 
                                    : 'bg-white border-[#d4c5b0] text-stone-600 hover:border-amber-400 hover:bg-[#fcfbf9]'}`}
                              >
                                <span>{s}</span>
                                <span className={isSelected ? 'text-amber-800' : 'text-stone-400'}>+2</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Pilihan +1 */}
                      <div className="space-y-3">
                        <span className="text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] block">
                          Pilih Atribut untuk Bonus +1
                        </span>
                        
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                          {STAT_OPTIONS.map((s) => {
                            const isSelected = customBonus2 === s;
                            const isDisabled = customBonus1 === s;
                            return (
                              <button
                                key={`custom1-${s}`}
                                disabled={isDisabled}
                                onClick={() => handleCustom21Select(s, 1)}
                                className={`py-3 rounded-xl border-2 transition-all font-black text-[10px] uppercase tracking-wider flex flex-col items-center gap-1
                                  ${isDisabled 
                                    ? 'bg-stone-50 border-stone-200 text-stone-300 opacity-40 cursor-not-allowed select-none' 
                                    : isSelected 
                                      ? 'bg-amber-100 border-amber-600 text-amber-900 shadow-sm' 
                                      : 'bg-white border-[#d4c5b0] text-stone-600 hover:border-amber-400 hover:bg-[#fcfbf9]'}`}
                              >
                                <span>{s}</span>
                                <span className={isSelected ? 'text-amber-800' : 'text-stone-400'}>+1</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* CUSTOM MODE (+1 / +1 / +1) */}
                  {asiChoice === "custom111" && (
                    <motion.div 
                      key="custom111-panel"
                      initial={{ opacity: 0, y: -10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: -10 }} 
                      className="pt-6 border-t border-[#d4c5b0]/60 space-y-4"
                    >
                      <span className="text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] block">
                        Pilih Tiga Atribut Berbeda untuk Masing-Masing Bonus +1
                      </span>

                      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                        {STAT_OPTIONS.map((s) => {
                          const isBonus1 = customBonus1 === s;
                          const isBonus2 = customBonus2 === s;
                          const isBonus3 = customBonus3 === s;
                          const isSelected = isBonus1 || isBonus2 || isBonus3;
                          
                          return (
                            <button
                              key={`custom111-${s}`}
                              onClick={() => handleCustom111Toggle(s)}
                              className={`py-4 rounded-xl border-2 transition-all font-black text-[10px] uppercase tracking-wider flex flex-col items-center gap-1
                                ${isSelected 
                                  ? 'bg-amber-100 border-amber-600 text-amber-900 shadow-sm' 
                                  : 'bg-white border-[#d4c5b0] text-stone-600 hover:border-amber-400 hover:bg-[#fcfbf9]'}`}
                            >
                              <span>{s}</span>
                              <span className={isSelected ? 'text-amber-800' : 'text-stone-400'}>
                                {isSelected ? '+1' : 'Off'}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex gap-2 items-center text-[9px] font-extrabold text-stone-400 uppercase tracking-widest pt-2">
                        <AlertCircle className="w-4.5 h-4.5 text-stone-400 shrink-0" />
                        <span>Sistem otomatis me-rotasi pilihan tertua jika Anda memilih atribut keempat.</span>
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

    </div>
  );
}