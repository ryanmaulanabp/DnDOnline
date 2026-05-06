"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  updateCharacterHpAction, 
  updateWeaponsAction, 
  levelUpAction, 
  updateConditionsAction 
} from "@/app/actions/character";
import { SPELL_DATABASE, RACES } from "@/lib/dnd-data";

// --- HELPERS & CATALOGS ---
const getMod = (score: number) => Math.floor((score - 10) / 2);
const formatMod = (mod: number) => (mod >= 0 ? `+${mod}` : `${mod}`);

const SKILL_MAP: Record<string, "STR" | "DEX" | "CON" | "INT" | "WIS" | "CHA"> = {
  "Acrobatics": "DEX", "Animal Handling": "WIS", "Arcana": "INT", "Athletics": "STR",
  "Deception": "CHA", "History": "INT", "Insight": "WIS", "Intimidation": "CHA",
  "Investigation": "INT", "Medicine": "WIS", "Nature": "INT", "Perception": "WIS",
  "Performance": "CHA", "Persuasion": "CHA", "Religion": "INT", "Sleight of Hand": "DEX",
  "Stealth": "DEX", "Survival": "WIS"
};

const CONDITION_LIST = [
  "Blinded", "Charmed", "Deafened", "Frightened", "Grappled", 
  "Incapacitated", "Invisible", "Paralyzed", "Petrified", 
  "Poisoned", "Prone", "Restrained", "Stunned", "Unconscious"
];

const ITEM_WEIGHTS: Record<string, number> = {
  "Greatsword": 6, "Longsword": 3, "Rapier": 2, "Dagger": 1, "Shortsword": 2,
  "Greataxe": 7, "Battleaxe": 4, "Mace": 4, "Warhammer": 2, "Quarterstaff": 4,
  "Shield": 6, "Plate Armor": 65, "Chain Mail": 55, "Leather Armor": 10,
  "Longbow": 2, "Shortbow": 2, "Crossbow, light": 5, "Crossbow, hand": 3,
  "Explorer's Pack": 59, "Scholar's Pack": 11, "Priest's Pack": 25, "Burglar's Pack": 44,
  "Spellbook": 3, "Component Pouch": 2, "Holy Symbol": 1, "Pouch": 1,
  "Set of traveler's clothes": 4, "Backpack": 5, "Bedroll": 7, "Rations (1 day)": 2
};

const WEAPON_CATALOG = [
  { name: "Dagger", damage: "1d4 piercing", isFinesse: true, isRanged: false },
  { name: "Rapier", damage: "1d8 piercing", isFinesse: true, isRanged: false },
  { name: "Shortsword", damage: "1d6 piercing", isFinesse: true, isRanged: false },
  { name: "Longsword", damage: "1d8 slashing", isFinesse: false, isRanged: false },
  { name: "Greatsword", damage: "2d6 slashing", isFinesse: false, isRanged: false },
  { name: "Mace", damage: "1d6 bludgeoning", isFinesse: false, isRanged: false },
  { name: "Warhammer", damage: "1d8 bludgeoning", isFinesse: false, isRanged: false },
  { name: "Quarterstaff", damage: "1d6 bludgeoning", isFinesse: false, isRanged: false },
  { name: "Javelin", damage: "1d6 piercing", isFinesse: false, isRanged: true },
  { name: "Shortbow", damage: "1d6 piercing", isFinesse: false, isRanged: true },
  { name: "Longbow", damage: "1d8 piercing", isFinesse: false, isRanged: true },
  { name: "Light Crossbow", damage: "1d8 piercing", isFinesse: false, isRanged: true },
  { name: "Hand Crossbow", damage: "1d6 piercing", isFinesse: false, isRanged: true },
  { name: "Simple Weapon", damage: "1d6 bludgeoning", isFinesse: false, isRanged: false }, 
];

const getWeaponData = (itemName: string) => {
  const lowerItem = itemName.toLowerCase();
  return WEAPON_CATALOG.find(w => lowerItem.includes(w.name.toLowerCase()));
};

const getHitDie = (className: string) => {
  const lowerClass = className.toLowerCase();
  if (lowerClass.includes("barbarian")) return 12;
  if (lowerClass.includes("fighter") || lowerClass.includes("paladin") || lowerClass.includes("ranger")) return 10;
  if (lowerClass.includes("wizard") || lowerClass.includes("sorcerer")) return 6;
  return 8;
};

export default function CharacterClient({ character }: { character: any }) {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState("ACTIONS");
  const [currentHp, setCurrentHp] = useState(character.currentHp ?? character.hpMax);
  const [hpInput, setHpInput] = useState<number | "">("");
  const [isUpdatingHp, setIsUpdatingHp] = useState(false);
  const [inspectedItem, setInspectedItem] = useState<any>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [rollResult, setRollResult] = useState<any>(null);
  const [equippedWeapons, setEquippedWeapons] = useState<any[]>(character.weapons || []);
  const [activeConditions, setActiveConditions] = useState<string[]>(character.conditions || []);
  const [isLeveling, setIsLeveling] = useState(false);

  // --- CALCULATIONS ---
  const profBonus = Math.ceil(1 + character.level / 4);
  const mods = { 
    STR: getMod(character.stats.STR), DEX: getMod(character.stats.DEX), 
    CON: getMod(character.stats.CON), INT: getMod(character.stats.INT), 
    WIS: getMod(character.stats.WIS), CHA: getMod(character.stats.CHA) 
  };

  const getSkillBonus = (skillName: string) => mods[SKILL_MAP[skillName]] + (character.proficientSkills.includes(skillName) ? profBonus : 0);
  const passivePerception = 10 + getSkillBonus("Perception");
  const passiveInvestigation = 10 + getSkillBonus("Investigation");
  const passiveInsight = 10 + getSkillBonus("Insight");

  const spellStat = character.spellCastingStat && character.spellCastingStat !== "NONE" ? character.spellCastingStat : "CHA";
  const spellSaveDC = 8 + profBonus + mods[spellStat as keyof typeof mods];
  const spellAttackMod = profBonus + mods[spellStat as keyof typeof mods];

  // Encumbrance Logic
  const totalWeight = useMemo(() => {
    return character.equipment.reduce((sum: number, item: string) => {
      const match = Object.keys(ITEM_WEIGHTS).find(k => item.toLowerCase().includes(k.toLowerCase()));
      return sum + (match ? ITEM_WEIGHTS[match] : 1);
    }, 0);
  }, [character.equipment]);

  const maxCarry = character.stats.STR * 15;
  const encPercent = Math.min(100, (totalWeight / maxCarry) * 100);

  const getSpellSlots = (lvl: number, className: string) => {
    if (className.toLowerCase().includes("warlock")) {
      if (lvl === 1) return { count: 1, level: "1st" };
      if (lvl >= 2 && lvl < 11) return { count: 2, level: lvl >= 3 ? "2nd" : "1st" };
      return { count: 3, level: "5th" };
    }
    return { count: Math.min(4, lvl + 1), level: "1st" }; 
  };
  const slots = getSpellSlots(character.level, character.class);

  // --- HANDLERS ---
  const handleHpUpdate = async (newHp: number) => {
    setIsUpdatingHp(true);
    setCurrentHp(newHp);
    await updateCharacterHpAction(character._id.toString(), newHp);
    setIsUpdatingHp(false);
  };

  const toggleCondition = async (cond: string) => {
    const newConds = activeConditions.includes(cond) 
      ? activeConditions.filter(c => c !== cond) 
      : [...activeConditions, cond];
    setActiveConditions(newConds);
    await updateConditionsAction(character._id.toString(), newConds);
  };

  const handleHeal = () => { if (!hpInput) return; handleHpUpdate(Math.min(character.hpMax, currentHp + Number(hpInput))); setHpInput(""); };
  const handleDamage = () => { if (!hpInput) return; handleHpUpdate(Math.max(0, currentHp - Number(hpInput))); setHpInput(""); };
  const handleLongRest = () => { if (confirm("Lakukan Long Rest? HP akan pulih penuh.")) handleHpUpdate(character.hpMax); };

  const rollDice = (sides: number) => { 
    setIsRolling(true); setRollResult(null); 
    setTimeout(() => { 
      setRollResult({ dice: sides, result: Math.floor(Math.random() * sides) + 1 }); 
      setIsRolling(false); 
    }, 600); 
  };
  
  const toggleEquip = async (itemName: string) => {
    const weaponData = getWeaponData(itemName); if (!weaponData) return;
    const newWeapons = equippedWeapons.some(w => w.name === itemName) 
      ? equippedWeapons.filter(w => w.name !== itemName) 
      : [...equippedWeapons, { ...weaponData, name: itemName }];
    setEquippedWeapons(newWeapons); 
    await updateWeaponsAction(character._id.toString(), newWeapons);
  };

  const handleLevelUp = async () => {
    const nextLevel = character.level + 1;
    if (nextLevel > 20) return alert("Batas level maksimal tercapai!");
    const hitDie = getHitDie(character.class);
    const hpInc = Math.max(1, Math.floor(hitDie / 2 + 1) + mods.CON);
    if (confirm(`Level Up ke Level ${nextLevel}?\nHP Maksimum akan bertambah +${hpInc}.`)) {
      setIsLeveling(true);
      const res = await levelUpAction(character._id.toString(), nextLevel, hpInc);
      if (res.success) alert("Selamat! Pahlawan Anda telah berevolusi.");
      setIsLeveling(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0f111a] text-slate-200 font-sans pb-32 selection:bg-red-500/30 relative printable-area">
      
      <header className="bg-[#181b26] border-b border-[#2d3245] sticky top-0 z-30 shadow-md no-print">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-black text-red-600 tracking-tighter hover:text-red-500 text-lg flex items-center gap-2"><span>←</span> MY CHARACTERS</Link>
          <div className="flex items-center gap-3">
            <button onClick={handleLevelUp} disabled={isLeveling} className="bg-green-600 hover:bg-green-500 text-white text-xs font-black px-4 py-1.5 rounded-md shadow-[0_0_15px_rgba(22,163,74,0.3)] transition-all active:scale-95 disabled:opacity-50 uppercase">
              {isLeveling ? "Leveling..." : "⬆ Level Up"}
            </button>
            <span className="w-px h-6 bg-[#3e455c] mx-1"></span>
            <button className="bg-[#2d3245] hover:bg-red-900/40 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-md border border-[#3e455c] transition-colors active:scale-95">🔥 SHORT REST</button>
            <button onClick={handleLongRest} className="bg-[#2d3245] hover:bg-blue-900/40 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-md border border-[#3e455c] transition-colors active:scale-95">🌙 LONG REST</button>
            <button onClick={() => window.print()} className="bg-purple-900/30 hover:bg-purple-900/60 text-purple-400 text-xs font-bold px-4 py-1.5 rounded-md border border-purple-900/50 transition-colors active:scale-95 ml-2 flex items-center gap-2">📄 PDF</button>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 md:px-6 mt-6 printable-container">
        
        <div className="bg-[#181b26] rounded-t-xl border border-[#2d3245] border-b-0 p-4 flex flex-col xl:flex-row items-center xl:items-end justify-between gap-6 relative overflow-hidden print-border">
          <div className="flex flex-col md:flex-row items-center gap-6 z-10 w-full xl:w-auto">
            <div className="w-24 h-24 bg-[#0f111a] rounded-lg border-2 border-[#3e455c] flex items-center justify-center text-4xl shadow-inner shrink-0">🐉</div>
            <div className="text-center md:text-left w-full">
              <h1 className="text-3xl font-black text-white uppercase tracking-tight print-text-black">{character.name}</h1>
              <p className="text-sm font-bold text-slate-400 mt-1">{character.race} • {character.class} <span className="text-green-400 font-black">Level {character.level}</span></p>
              <div className="flex flex-wrap gap-1 mt-2">
                {activeConditions.map(c => (
                  <span key={c} onClick={() => toggleCondition(c)} className="cursor-pointer bg-red-900/30 text-red-400 text-[9px] font-black px-2 py-0.5 rounded border border-red-900/50 uppercase animate-pulse">{c}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[#0f111a] border-2 border-red-900/50 rounded-xl p-3 flex gap-4 items-center min-w-[300px] z-10 shadow-lg no-print">
            <div className="flex flex-col gap-1.5 w-20">
              <input type="number" placeholder="0" value={hpInput} onChange={(e) => setHpInput(e.target.value ? Number(e.target.value) : "")} className="bg-[#181b26] border border-[#3e455c] text-white text-center text-sm font-bold rounded p-1 outline-none focus:border-red-500" />
              <div className="flex gap-1 h-6">
                <button onClick={handleHeal} className="flex-1 text-[9px] font-black bg-green-900/40 text-green-400 rounded border border-green-800/50 hover:bg-green-800/60 transition-colors uppercase">Heal</button>
                <button onClick={handleDamage} className="flex-1 text-[9px] font-black bg-red-900/40 text-red-400 rounded border border-red-800/50 hover:bg-red-800/60 transition-colors uppercase">Dmg</button>
              </div>
            </div>
            <div className="flex-1 text-center">
              <span className="block text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Hit Points</span>
              <div className="flex justify-center items-baseline gap-2"><span className="text-4xl font-black text-white">{currentHp}</span><span className="text-xl font-bold text-slate-500">/ {character.hpMax}</span></div>
            </div>
          </div>
        </div>

        <div className="bg-[#1c202d] border border-[#2d3245] p-6 rounded-b-xl shadow-lg flex flex-wrap justify-center xl:justify-between gap-4 relative z-20 print-border">
          {(["STR", "DEX", "CON", "INT", "WIS", "CHA"] as const).map((stat) => (
            <div key={stat} className="w-24 h-28 relative flex flex-col items-center justify-center">
              <svg className="absolute inset-0 w-full h-full text-[#0f111a] drop-shadow-md no-print" viewBox="0 0 100 120" fill="currentColor"><path d="M10,10 L90,10 L90,80 L50,110 L10,80 Z" stroke="#881337" strokeWidth="3" /></svg>
              <span className="relative z-10 text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest">{stat}</span>
              <span className="relative z-10 text-3xl font-black text-white mt-1 print-text-black">{formatMod(mods[stat])}</span>
              <div className="relative z-10 mt-2 bg-[#181b26] border border-red-900/50 rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold text-slate-300 print-border print-text-black">{character.stats[stat]}</div>
            </div>
          ))}
          <div className="w-px h-24 bg-[#2d3245] hidden xl:block mx-2 no-print"></div>
          <div className="flex gap-4">
            <div className="flex flex-col items-center justify-center bg-[#0f111a] border-2 border-[#2d3245] rounded-xl w-24 h-28 print-border"><span className="text-2xl font-black text-white print-text-black">+{profBonus}</span><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Proficiency</span></div>
            <div className="flex flex-col items-center justify-center bg-[#0f111a] border-2 border-[#2d3245] rounded-xl w-24 h-28 print-border"><span className="text-2xl font-black text-white print-text-black">{character.speed} ft.</span><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Walking</span></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 print-grid">
          
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-[#181b26] rounded-xl border border-[#2d3245] p-5 shadow-sm print-border">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-[#2d3245] pb-2 text-center">Saving Throws</h3>
              <div className="grid grid-cols-2 gap-3">
                {(["STR", "DEX", "CON", "INT", "WIS", "CHA"] as const).map((stat) => (
                  <div key={stat} className="flex justify-between items-center bg-[#0f111a] p-2 rounded-lg border border-[#2d3245] print-border"><span className="text-xs font-bold text-slate-400">{stat}</span><span className="text-sm font-black text-white print-text-black">{formatMod(mods[stat])}</span></div>
                ))}
              </div>
            </div>
            
            <div className="bg-[#181b26] p-5 rounded-xl border border-[#2d3245] shadow-sm no-print">
              <h3 className="text-xs font-black text-slate-400 uppercase text-center mb-4 border-b border-[#2d3245] pb-2">Status Effects</h3>
              <div className="flex flex-wrap gap-1.5">
                {CONDITION_LIST.map(c => (
                  <button key={c} onClick={() => toggleCondition(c)} className={`text-[9px] font-black px-2 py-1 rounded border transition-all ${activeConditions.includes(c) ? 'bg-red-600 border-red-500 text-white shadow-lg' : 'bg-[#0f111a] border-[#3e455c] text-slate-500 hover:border-slate-400'}`}>{c}</button>
                ))}
              </div>
            </div>

            <div className="bg-[#181b26] rounded-xl border border-[#2d3245] p-5 shadow-sm print-border">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-[#2d3245] pb-2 text-center">Senses</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-[#0f111a] border border-[#2d3245] p-2.5 rounded-lg print-border"><div className="w-8 h-8 rounded bg-[#181b26] border border-[#2d3245] flex items-center justify-center text-sm font-black text-white print-border print-text-black">{passivePerception}</div><span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Perception</span></div>
                <div className="flex items-center gap-3 bg-[#0f111a] border border-[#2d3245] p-2.5 rounded-lg print-border"><div className="w-8 h-8 rounded bg-[#181b26] border border-[#2d3245] flex items-center justify-center text-sm font-black text-white print-border print-text-black">{passiveInvestigation}</div><span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Investigation</span></div>
                <div className="flex items-center gap-3 bg-[#0f111a] border border-[#2d3245] p-2.5 rounded-lg print-border"><div className="w-8 h-8 rounded bg-[#181b26] border border-[#2d3245] flex items-center justify-center text-sm font-black text-white print-border print-text-black">{passiveInsight}</div><span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Insight</span></div>
              </div>
            </div>

            <div className="bg-[#181b26] rounded-xl border border-[#2d3245] p-5 shadow-sm print-border">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-[#2d3245] pb-2 text-center">Proficiencies</h3>
              <div className="space-y-4">
                <div><span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Armor & Weapons</span><span className="text-xs font-medium text-slate-300 print-text-black">Light, Medium, Simple, Martial</span></div>
                <div><span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Languages</span><span className="text-xs font-medium text-slate-300 print-text-black">Common, Elvish, Draconic</span></div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="flex gap-4">
              <div className="flex-1 bg-[#181b26] border border-[#2d3245] rounded-xl p-4 flex flex-col items-center justify-center print-border"><span className="text-3xl font-black text-white print-text-black">{formatMod(mods.DEX)}</span><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Initiative</span></div>
              <div className="flex-1 bg-[#181b26] border border-[#2d3245] rounded-xl p-4 flex flex-col items-center justify-center relative print-border">
                <span className="relative z-10 text-3xl font-black text-white print-text-black">{character.armorClass}</span><span className="relative z-10 text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Armor Class</span>
              </div>
            </div>
            <div className="bg-[#181b26] rounded-xl border border-[#2d3245] shadow-sm flex flex-col print-border">
              <div className="flex justify-between items-end p-4 border-b border-[#2d3245]"><div className="flex gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest"><span>Prof</span><span>Skill</span></div><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bonus</span></div>
              <div className="flex flex-col py-2 max-h-[500px] overflow-y-auto custom-scrollbar">
                {Object.entries(SKILL_MAP).map(([skill, stat]) => {
                  const isProf = character.proficientSkills.includes(skill);
                  return (
                    <div key={skill} className={`flex items-center justify-between px-4 py-2 hover:bg-[#2d3245]/30 transition-colors ${isProf ? 'bg-[#2d3245]/10' : ''}`}>
                      <div className="flex items-center gap-4 w-full"><span className={`w-2.5 h-2.5 rounded-full border flex-shrink-0 ${isProf ? 'bg-red-600 border-red-600 print-bg-black' : 'border-[#3e455c]'}`}></span><span className="text-[10px] font-bold text-slate-500 w-6">{stat}</span><span className={`text-sm font-medium flex-1 ${isProf ? 'text-white print-text-black' : 'text-slate-400'}`}>{skill}</span></div><span className={`text-sm font-black w-8 text-right ${isProf ? 'text-white print-text-black' : 'text-slate-400'}`}>{formatMod(getSkillBonus(skill))}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#181b26] rounded-xl border border-[#2d3245] shadow-sm overflow-hidden flex flex-col print-border print-hide-tabs">
              
              <div className="flex overflow-x-auto border-b border-[#2d3245] bg-[#0f111a] no-print">
                {["ACTIONS", "SPELLS", "INVENTORY", "FEATURES"].map((tab) => (
                  <button key={tab} onClick={() => { setActiveTab(tab); setInspectedItem(null); }} className={`px-4 py-3 text-xs font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-colors ${activeTab === tab ? 'text-red-500 border-red-500 bg-[#181b26]' : 'text-slate-500 border-transparent hover:text-slate-300'}`}>{tab}</button>
                ))}
              </div>
              
              <div className="flex flex-col xl:flex-row h-full">
                <div className={`p-5 flex-1 transition-all ${inspectedItem ? 'xl:w-1/2 border-r border-[#2d3245]' : 'w-full'}`}>
                  
                  {activeTab === "ACTIONS" && (
                    <div className="animate-fadeIn print-show">
                      <div className="grid grid-cols-12 gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-2 border-b border-[#2d3245] pb-2"><div className="col-span-5">Attack</div><div className="col-span-2 text-center">Range</div><div className="col-span-2 text-center">Hit</div><div className="col-span-3 text-center">Damage</div></div>
                      <div className="space-y-2">
                        {equippedWeapons && equippedWeapons.length > 0 ? (
                          equippedWeapons.map((w: any, idx: number) => {
                            let statMod = w.isRanged ? mods.DEX : (w.isFinesse ? Math.max(mods.STR, mods.DEX) : mods.STR);
                            return (
                              <div key={idx} onClick={() => setInspectedItem({ title: w.name, desc: `Weapon. Menggunakan dadu ${w.damage} untuk kerusakan.`, type: 'Weapon' })} className="grid grid-cols-12 gap-2 bg-[#0f111a] p-3 rounded-lg border border-[#2d3245] items-center cursor-pointer hover:border-red-900/50 transition-colors print-border">
                                <div className="col-span-5"><span className="block text-sm font-bold text-white mb-1 print-text-black">{w.name}</span><span className="text-[10px] text-slate-500 italic">{w.isRanged ? 'Ranged' : 'Melee'}</span></div><div className="col-span-2 text-center text-xs text-slate-400">{w.isRanged ? '120 ft' : '5 ft'}</div><div className="col-span-2 text-center"><span className="bg-[#181b26] border border-[#3e455c] text-white text-xs font-black px-2 py-1 rounded print-border print-text-black">{formatMod(profBonus + statMod)}</span></div><div className="col-span-3 text-center"><span className="text-xs font-bold text-slate-300 print-text-black">{w.damage}</span></div>
                              </div>
                            );
                          })
                        ) : (<div className="text-center py-4 text-xs font-bold text-slate-500 border border-dashed border-[#2d3245] rounded-lg">Belum ada senjata Equip. Masuk ke tab Inventory.</div>)}
                        <div onClick={() => setInspectedItem({ title: "Unarmed Strike", desc: "Serangan jarak dekat menggunakan tangan kosong.", type: "Action" })} className="grid grid-cols-12 gap-2 bg-[#0f111a]/50 p-3 rounded-lg border border-[#2d3245]/50 items-center cursor-pointer hover:border-red-900/50 transition-colors mt-4 print-border">
                          <div className="col-span-5"><span className="block text-sm font-bold text-slate-400 leading-none mb-1 print-text-black">Unarmed Strike</span></div><div className="col-span-2 text-center text-xs text-slate-500">5 ft</div><div className="col-span-2 text-center"><span className="bg-[#181b26] border border-[#2d3245] text-slate-400 text-xs font-black px-2 py-1 rounded print-border print-text-black">{formatMod(profBonus + mods.STR)}</span></div><div className="col-span-3 text-center"><span className="text-xs font-black text-slate-500 print-text-black">1 Bludgeoning</span></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "SPELLS" && (
                    <div className="animate-fadeIn print-show">
                      <div className="flex justify-between items-center mb-6 border-b border-[#2d3245] pb-3">
                         <div>
                           <h4 className="text-sm font-black text-cyan-500 uppercase tracking-widest">Grimoire</h4>
                           <p className="text-[10px] text-slate-500 font-bold mt-1">
                             SLOTS: <span className="text-white print-text-black">{slots.count}</span> x {slots.level} Level
                           </p>
                         </div>
                         <span className="text-xs font-bold text-slate-400">Save DC: <span className="text-white font-black print-text-black">{spellSaveDC}</span> | Atk: <span className="text-white font-black print-text-black">{formatMod(spellAttackMod)}</span></span>
                      </div>
                      {character.spells && character.spells.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2">
                           {character.spells.map((spell: string, idx: number) => (
                             <div key={idx} onClick={() => setInspectedItem({ title: spell, desc: "Sihir mistis yang dipelajari.", type: 'Spell' })} className="bg-[#0f111a] p-3 rounded-lg border border-[#2d3245] flex items-center gap-3 cursor-pointer hover:border-cyan-500 transition-colors print-border"><span className="text-cyan-500 text-lg no-print">✨</span><span className="text-sm font-bold text-slate-200 print-text-black">{spell}</span></div>
                           ))}
                        </div>
                      ) : (<div className="text-center py-8 text-slate-500 italic text-sm">Tidak ada sihir.</div>)}
                    </div>
                  )}

                  {activeTab === "INVENTORY" && (
                    <div className="animate-fadeIn space-y-4 print-show">
                      {/* Encumbrance System */}
                      <div className="bg-[#0a0c13] p-4 rounded-xl border border-[#2d3245] space-y-3">
                         <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
                            <span className="text-slate-500">Encumbrance</span>
                            <span className={totalWeight > maxCarry ? "text-red-500 animate-pulse" : "text-yellow-500"}>{totalWeight} / {maxCarry} lbs</span>
                         </div>
                         <div className="h-2 w-full bg-[#181b26] rounded-full overflow-hidden border border-[#2d3245]">
                            <div className={`h-full transition-all duration-700 ${totalWeight > maxCarry ? 'bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]' : 'bg-yellow-500'}`} style={{ width: `${encPercent}%` }}></div>
                         </div>
                      </div>

                      <div className="bg-[#0a0c13] p-4 rounded-xl border border-[#2d3245] flex justify-between items-center print-border">
                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Currency</span>
                        <div className="flex items-center gap-2 bg-[#181b26] px-4 py-2 rounded-lg border border-[#3e455c] print-border">
                          <span className="w-2 h-2 rounded-full bg-yellow-500 no-print"></span><span className="text-lg font-black text-yellow-500 print-text-black">{character.currency?.gp ?? 0} GP</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {character.equipment && character.equipment.length > 0 ? (
                          character.equipment.map((item: string, idx: number) => {
                            const weaponData = getWeaponData(item);
                            const isEquipped = equippedWeapons.some(w => w.name === item);
                            const weightKey = Object.keys(ITEM_WEIGHTS).find(k => item.toLowerCase().includes(k.toLowerCase()));
                            const weight = weightKey ? ITEM_WEIGHTS[weightKey] : 1;

                            return (
                              <div key={idx} className="bg-[#0f111a] p-3 rounded-lg border border-[#2d3245] flex items-center justify-between group hover:border-[#3e455c] transition-colors print-border">
                                <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => setInspectedItem({ title: item, desc: "Barang standar dalam tas punggung seorang petualang.", type: weaponData ? "Weapon" : "Item" })}>
                                  <span className="text-slate-600 no-print">{weaponData ? '⚔️' : '🎒'}</span> <span className="text-sm font-medium text-slate-300 group-hover:text-white print-text-black">{item}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                   <span className="text-[10px] font-bold text-slate-600 no-print">{weight} lbs</span>
                                   {weaponData ? (
                                     <button onClick={(e) => { e.stopPropagation(); toggleEquip(item); }} className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded transition-all active:scale-95 no-print ${isEquipped ? 'bg-red-900/40 text-red-400 border border-red-900/50 hover:bg-red-900/60' : 'bg-[#181b26] text-slate-400 border border-[#3e455c] hover:text-white hover:border-slate-400'}`}>
                                       {isEquipped ? 'UNEQUIP' : 'EQUIP'}
                                     </button>
                                   ) : (
                                     <span className="text-[10px] text-slate-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity uppercase no-print">Item</span>
                                   )}
                                </div>
                              </div>
                            );
                          })
                        ) : (<div className="text-center py-8 text-slate-500 italic text-sm">Tas punggung kosong.</div>)}
                      </div>
                    </div>
                  )}

                  {activeTab === "FEATURES" && (
                    <div className="animate-fadeIn space-y-3 print-show">
                      <div className="bg-blue-900/10 border border-blue-900/30 p-3 rounded-lg mb-4 print-border">
                         <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest print-text-black">Level {character.level} Rewards Unlocked</span>
                      </div>
                      {character.features && character.features.length > 0 ? (
                        character.features.map((feature: string, idx: number) => (
                          <div key={idx} onClick={() => setInspectedItem({ title: feature, desc: "Trait bawaan ras atau class untuk membantu petualangan Anda.", type: 'Feature' })} className="bg-[#0f111a] p-4 rounded-lg border border-[#2d3245] cursor-pointer hover:border-blue-500 transition-colors print-border">
                            <span className="block text-sm font-bold text-blue-400 mb-1 print-text-black">{feature}</span>
                            <span className="text-xs text-slate-500 leading-relaxed truncate block no-print">Klik untuk membaca detail trait...</span>
                          </div>
                        ))
                      ) : (<div className="text-center py-8 text-slate-500 italic text-sm">Tidak ada fitur spesifik.</div>)}
                    </div>
                  )}

                </div>

                {/* INSPECTOR AREA */}
                {inspectedItem && (
                  <div className="p-6 bg-[#0a0c13] xl:w-1/2 relative animate-fadeIn border-t xl:border-t-0 border-[#2d3245] no-print">
                    <button onClick={() => setInspectedItem(null)} className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#181b26] border border-[#2d3245] text-slate-500 flex items-center justify-center text-xs font-bold hover:text-white transition-colors">✕</button>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${inspectedItem.type === 'Spell' ? 'text-cyan-400 border-cyan-900/50 bg-cyan-900/20' : inspectedItem.type === 'Feature' ? 'text-blue-400 border-blue-900/50 bg-blue-900/20' : inspectedItem.type === 'Weapon' ? 'text-red-400 border-red-900/50 bg-red-900/20' : 'text-slate-400 border-slate-700 bg-slate-800'}`}>{inspectedItem.type}</span>
                    <h4 className="text-xl font-black text-white mt-3 mb-4 leading-tight">{inspectedItem.title}</h4>
                    <div className="text-sm text-slate-300 leading-relaxed space-y-3 font-medium">
                      {inspectedItem.desc.split('\n').map((paragraph: string, i: number) => (<p key={i}>{paragraph}</p>))}
                    </div>
                    
                    {inspectedItem.type === 'Weapon' && (
                       <button onClick={() => toggleEquip(inspectedItem.title)} className={`mt-6 w-full py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-colors border ${equippedWeapons.some(w => w.name === inspectedItem.title) ? 'bg-red-900/20 border-red-900/50 text-red-400 hover:bg-red-900/40' : 'bg-red-600 border-red-500 text-white hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.3)]'}`}>
                         {equippedWeapons.some(w => w.name === inspectedItem.title) ? "Lepaskan Senjata (Unequip)" : "Gunakan Senjata (Equip)"}
                       </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- FLOATING DICE TRAY --- */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 no-print">
        <div className="bg-[#181b26]/90 backdrop-blur-md border border-[#2d3245] shadow-[0_10px_40px_rgba(0,0,0,0.8)] p-2 rounded-2xl flex items-center gap-2 animate-fadeIn hover:border-red-900/50 transition-colors">
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 border-r border-[#2d3245]">Tray</span>
           {[4, 6, 8, 10, 12, 20].map((dice) => (
              <button key={dice} onClick={() => rollDice(dice)} className={`w-12 h-12 flex items-center justify-center rounded-xl font-black text-lg transition-all active:scale-90 shadow-inner ${dice === 20 ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/50 border-red-500' : 'bg-[#0f111a] border border-[#3e455c] text-slate-300 hover:text-white hover:border-slate-400'}`}>d{dice}</button>
           ))}
        </div>
      </div>

      {/* --- DICE ROLL MODAL --- */}
      {(isRolling || rollResult) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity cursor-pointer no-print" onClick={() => !isRolling && setRollResult(null)}>
          <div className="bg-[#181b26] border-2 border-red-600 shadow-[0_0_80px_rgba(220,38,38,0.3)] p-12 rounded-3xl flex flex-col items-center min-w-[300px] animate-bounceIn" onClick={e => e.stopPropagation()}>
             {isRolling ? (
               <div className="flex flex-col items-center animate-pulse"><div className="w-24 h-24 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-6"></div><span className="text-xl font-black text-slate-400 uppercase tracking-widest">Mengocok Dadu...</span></div>
             ) : (
               <div className="flex flex-col items-center animate-fadeIn">
                 <span className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Rolled D{rollResult?.dice}</span>
                 <div className="relative flex items-center justify-center">
                    <span className="text-9xl font-black text-white drop-shadow-[0_5px_15px_rgba(220,38,38,0.5)]">{rollResult?.result}</span>
                    {rollResult?.dice === 20 && rollResult?.result === 20 && <span className="absolute -bottom-8 text-green-400 font-black uppercase tracking-widest text-xl animate-bounce">Critical Success!</span>}
                    {rollResult?.dice === 20 && rollResult?.result === 1 && <span className="absolute -bottom-8 text-red-500 font-black uppercase tracking-widest text-xl animate-pulse">Critical Fail!</span>}
                 </div>
                 <button onClick={() => setRollResult(null)} className="mt-12 bg-[#2d3245] hover:bg-[#3e455c] text-white text-xs font-bold px-6 py-2 rounded-lg uppercase tracking-widest transition-colors">Tutup (Atau klik di luar)</button>
               </div>
             )}
          </div>
        </div>
      )}

      {/* --- STYLES --- */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        .animate-bounceIn { animation: bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes bounceIn { 0% { opacity: 0; transform: scale(0.8); } 100% { opacity: 1; transform: scale(1); } }
        
        @media print {
          @page { margin: 1.5cm; size: A4 portrait; }
          body, .printable-area { background: #ffffff !important; color: #000000 !important; }
          .no-print { display: none !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-shadow: none !important; }
          .print-text-black { color: #0f172a !important; }
          .print-border { border: 1px solid #cbd5e1 !important; background-color: #f8fafc !important; }
          .print-bg-black { background-color: #0f172a !important; }
          .print-hide-tabs > div:first-child { display: none !important; }
          .print-show { display: block !important; margin-bottom: 2rem !important; }
        }
      `}} />
    </main>
  );
}