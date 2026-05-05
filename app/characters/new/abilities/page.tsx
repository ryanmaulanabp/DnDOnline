"use client";

import { useMemo } from "react";
import { useCharacterStore } from "@/store/useCharacterStore";
import { POINT_BUY_COSTS, RACES } from "@/lib/dnd-data";

const STAT_OPTIONS = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
const FULL_STAT_NAMES: Record<string, string> = { STR: "Strength", DEX: "Dexterity", CON: "Constitution", INT: "Intelligence", WIS: "Wisdom", CHA: "Charisma" };

export default function AbilitiesStep() {
  const { 
    baseStats, race, subrace, asiChoice, customBonus1, customBonus2, customBonus3, 
    updateBaseStat, updateField 
  } = useCharacterStore();

  const rulesRace = RACES[race] || null;
  const rulesSubrace = rulesRace?.subraces?.find((s: any) => s.name === subrace) || null;

  const totalPointsSpent = useMemo(() => Object.values(baseStats).reduce((sum, val) => sum + POINT_BUY_COSTS[val], 0), [baseStats]);
  const pointsRemaining = 27 - totalPointsSpent;

  // KALKULASI BONUS
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
    const currentVal = baseStats[stat];
    const newVal = currentVal + delta;
    if (newVal < 8 || newVal > 15) return; 
    const pointDiff = POINT_BUY_COSTS[newVal] - POINT_BUY_COSTS[currentVal];
    if (pointsRemaining - pointDiff < 0) return; 
    updateBaseStat(stat, newVal);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl">
      <div>
        <h2 className="text-3xl font-black text-white">Ability Scores</h2>
        <p className="text-slate-400">Tentukan potensi fisik dan mental karakter Anda.</p>
      </div>

      {/* --- D&D BEYOND STYLE: ABILITY SCORE INCREASE BOX --- */}
      <div className="bg-[#181b26] border border-[#2d3245] rounded-xl overflow-hidden shadow-lg">
        <div className="bg-[#2d3245]/40 p-4 border-b border-[#2d3245] flex justify-between items-center">
          <div>
            <h3 className="font-bold text-white text-lg">Ability Score Increases</h3>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">Origin • 3 Choices</p>
          </div>
          <span className="text-slate-500">▲</span>
        </div>
        
        <div className="p-6 bg-[#0f111a]">
          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            When determining your character's ability scores, increase one score by 2 and a different one by 1, or increase three scores by 1. None of these increases can raise a score above 20. (Atau gunakan bonus standar ras Anda).
          </p>

          <div className="space-y-4">
            <select 
              value={asiChoice} 
              onChange={(e) => updateField("asiChoice", e.target.value)} 
              className="w-full bg-[#181b26] border border-[#3e455c] rounded px-4 py-3 text-white text-sm font-medium outline-none focus:border-blue-500 appearance-none cursor-pointer"
            >
              <option value="standard">Standard Racial Traits (Default)</option>
              <option value="custom21">Increase two scores (+2 / +1)</option>
              <option value="custom111">Increase three scores (+1 / +1 / +1)</option>
            </select>

            {asiChoice === "custom21" && (
              <div className="space-y-3 pt-2 animate-fadeIn border-t border-[#2d3245]">
                <p className="text-sm text-slate-300 mb-3">Increase one score by 2 and a different score by 1.</p>
                <select value={customBonus1} onChange={e => updateField("customBonus1", e.target.value)} className="w-full bg-[#181b26] border border-[#3e455c] rounded px-4 py-2.5 text-white text-sm outline-none focus:border-green-500">
                  {STAT_OPTIONS.map(s => <option key={s} value={s}>+{2} {FULL_STAT_NAMES[s]} Score</option>)}
                </select>
                <select value={customBonus2} onChange={e => updateField("customBonus2", e.target.value)} className="w-full bg-[#181b26] border border-[#3e455c] rounded px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500">
                  {STAT_OPTIONS.map(s => <option key={s} value={s} disabled={s === customBonus1}>+{1} {FULL_STAT_NAMES[s]} Score {s === customBonus1 ? '(Pilih stat berbeda)' : ''}</option>)}
                </select>
              </div>
            )}

            {asiChoice === "custom111" && (
              <div className="space-y-3 pt-2 animate-fadeIn border-t border-[#2d3245]">
                <p className="text-sm text-slate-300 mb-3">Increase three different scores by 1.</p>
                <select value={customBonus1} onChange={e => updateField("customBonus1", e.target.value)} className="w-full bg-[#181b26] border border-[#3e455c] rounded px-4 py-2.5 text-white text-sm outline-none">
                  {STAT_OPTIONS.map(s => <option key={s} value={s}>+{1} {FULL_STAT_NAMES[s]} Score</option>)}
                </select>
                <select value={customBonus2} onChange={e => updateField("customBonus2", e.target.value)} className="w-full bg-[#181b26] border border-[#3e455c] rounded px-4 py-2.5 text-white text-sm outline-none">
                  {STAT_OPTIONS.map(s => <option key={s} value={s} disabled={s === customBonus1}>+{1} {FULL_STAT_NAMES[s]} Score</option>)}
                </select>
                <select value={customBonus3} onChange={e => updateField("customBonus3", e.target.value)} className="w-full bg-[#181b26] border border-[#3e455c] rounded px-4 py-2.5 text-white text-sm outline-none">
                  {STAT_OPTIONS.map(s => <option key={s} value={s} disabled={s === customBonus1 || s === customBonus2}>+{1} {FULL_STAT_NAMES[s]} Score</option>)}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* --- POINT BUY CALCULATOR --- */}
      <div className="bg-[#181b26] p-6 md:p-10 rounded-3xl border border-[#2d3245] shadow-xl">
        <div className="flex justify-between items-center mb-8 border-b border-[#2d3245] pb-6">
          <span className="text-lg font-bold text-slate-300">Points Remaining</span>
          <span className={`text-4xl font-black px-6 py-2 rounded-xl ${pointsRemaining === 0 ? 'bg-green-600 text-white shadow-[0_0_20px_rgba(22,163,74,0.4)]' : 'bg-[#0f111a] text-blue-400 border border-[#3e455c]'}`}>{pointsRemaining}</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
          {STAT_OPTIONS.map((stat) => {
            const mod = calcMod(totalStats[stat as keyof typeof totalStats]);
            return (
              <div key={stat} className="bg-[#0f111a] p-4 rounded-2xl border border-[#2d3245] flex flex-col items-center">
                <span className="text-lg font-black text-slate-500 mb-4">{stat}</span>
                <div className="flex items-center gap-3 mb-6 bg-[#181b26] p-2 rounded-xl border border-[#3e455c]">
                  <button onClick={() => adjustStat(stat, -1)} className="w-8 h-8 bg-[#2d3245] hover:bg-[#3e455c] rounded-lg font-bold flex justify-center items-center active:scale-95 transition-all text-white">-</button>
                  <span className="text-2xl font-bold w-8 text-center text-white">{baseStats[stat]}</span>
                  <button onClick={() => adjustStat(stat, 1)} className="w-8 h-8 bg-[#2d3245] hover:bg-[#3e455c] rounded-lg font-bold flex justify-center items-center active:scale-95 transition-all text-white">+</button>
                </div>
                <div className="w-full text-center flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bonus: +{getBonus(stat)}</span>
                  <div className="bg-[#181b26] border border-[#3e455c] rounded-lg p-2 mt-1">
                    <span className="text-2xl font-black text-white block">{totalStats[stat as keyof typeof totalStats]}</span>
                    <span className={`text-sm font-bold ${mod >= 0 ? 'text-green-400' : 'text-red-400'}`}>{mod >= 0 ? `+${mod}` : mod}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}