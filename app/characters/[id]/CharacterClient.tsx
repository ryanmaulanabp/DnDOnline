"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CLASSES } from "@/lib/dnd-data";
import { updateCharacterHpAction } from "@/app/actions/character";
import { Flame, Moon, Settings2, TrendingUp, Download } from "lucide-react";
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

import { VitalsHeader } from "./components/VitalsHeader";
import { AttributeMatrix, SkillPanel, Tooltip, SKILL_MAP } from "./components/HeroModules";
import { ActionTabs } from "./components/ActionTabs";
import { CombatLogPanel } from "./components/CombatLogPanel";
import { DiceModal } from "./components/DiceModal";

const getMod = (score: number) => Math.floor((score - 10) / 2);
const formatMod = (mod: number) => (mod >= 0 ? `+${mod}` : `${mod}`);

export default function CharacterClient({ character }: { character: any }) {
  const searchParams = useSearchParams();
  const router = useRouter(); 
  const isReadOnly = searchParams.get("mode") === "dm";
  const sheetRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const [currentHp, setCurrentHp] = useState(character.currentHp ?? character.hpMax);
  const [tempHp, setTempHp] = useState(0);
  const [hpInput, setHpInput] = useState<number | "">("");
  
  const [isRolling, setIsRolling] = useState(false);
  const [rollResult, setRollResult] = useState<any>(null);
  const [rollMode, setRollMode] = useState<"normal" | "advantage" | "disadvantage">("normal");
  
  const [usedSlots, setUsedSlots] = useState<Record<string, number>>({ "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0, "8": 0, "9": 0 });
  const [hitDiceUsed, setHitDiceUsed] = useState(0);
  const [deathSaves, setDeathSaves] = useState({ success: 0, fail: 0 });
  const [exhaustion, setExhaustion] = useState(0);
  const [isResting, setIsResting] = useState<"short" | "long" | null>(null);
  
  const [combatLog, setCombatLog] = useState<any[]>([{ msg: "System Booting...", time: "SYS" }]);
  const [activeConditions, setActiveConditions] = useState<string[]>(character.conditions || []);

  const [currentLevel, setCurrentLevel] = useState(character.level || 1);
  const [exp, setExp] = useState(character.exp || 0); 
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [isLevelUpModalOpen, setIsLevelUpModalOpen] = useState(false);
  const [expInputAmount, setExpInputAmount] = useState("");

  const [currency, setCurrency] = useState<Record<string, number>>({
    cp: character.currency?.cp || 0, sp: character.currency?.sp || 0, 
    ep: character.currency?.ep || 0, gp: character.currency?.gp || 0, pp: character.currency?.pp || 0
  });
  const [invItems, setInvItems] = useState<string[]>(character.equipment || []);
  const [eqItems, setEqItems] = useState<string[]>([]); 

  const [turnActions, setTurnActions] = useState({ action: false, bonus: false, reaction: false });
  const [inspiration, setInspiration] = useState(false);

  const mods = useMemo(() => ({
    STR: getMod(character.stats.STR), DEX: getMod(character.stats.DEX),
    CON: getMod(character.stats.CON), INT: getMod(character.stats.INT),
    WIS: getMod(character.stats.WIS), CHA: getMod(character.stats.CHA),
  }), [character.stats]);

  const profBonus = Math.ceil(1 + currentLevel / 4);
  const getSkillBonus = (skill: string) => mods[SKILL_MAP[skill].stat as keyof typeof mods] + (character.proficientSkills.includes(skill) ? profBonus : 0);

  const activeSpeed = useMemo(() => {
    if (activeConditions.some(c => ["Grappled", "Restrained", "Stunned", "Paralyzed", "Unconscious"].includes(c)) || exhaustion >= 5) return 0;
    if (exhaustion >= 2) return Math.floor(character.speed / 2);
    return character.speed;
  }, [activeConditions, exhaustion, character.speed]);

  const addToLog = (msg: string) => {
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'});
    setCombatLog(prev => [{ msg, time }, ...prev].slice(0, 15));
  };

  const submitExp = () => {
    const amount = Number(expInputAmount);
    if(amount > 0) {
      setExp((prev: number) => prev + amount);
      addToLog(`Gained ${amount} EXP.`);
    }
    setExpInputAmount("");
    setIsExpModalOpen(false);
  };

  const confirmLevelUp = () => {
    setCurrentLevel((prev: number) => prev + 1);
    setIsLevelUpModalOpen(false);
    addToLog(`Ding! Reached Level ${currentLevel + 1}!`);
  };

  const updateCurrency = (type: string, amount: number) => {
    if(isReadOnly) return;
    const nextVal = Math.max(0, (currency[type] || 0) + amount);
    setCurrency(prev => ({...prev, [type]: nextVal}));
  };

  const toggleTurnAction = (type: 'action' | 'bonus' | 'reaction') => setTurnActions(prev => ({...prev, [type]: !prev[type]}));
  const resetTurnActions = () => { setTurnActions({ action: false, bonus: false, reaction: false }); addToLog("Turn Reset."); };

  const rollDice = (sides: number, bonus: number = 0, label: string = "Roll") => {
    setIsRolling(true); setRollResult(null);
    setTimeout(() => {
      let raw1 = Math.floor(Math.random() * sides) + 1;
      let raw2 = Math.floor(Math.random() * sides) + 1;
      
      let forcedMode = rollMode;
      const isAttack = label.includes("Atk") || label.includes("Strike") || label.includes("Casting");
      const isSave = label.includes("Save");
      const isCheck = label.includes("Check") || label === "Initiative" || Object.keys(SKILL_MAP).includes(label);

      const isDexOrStrSave = isSave && (label.includes("DEX") || label.includes("STR"));
      if (isDexOrStrSave && (activeConditions.includes("Paralyzed") || activeConditions.includes("Stunned") || activeConditions.includes("Unconscious"))) {
        setRollResult({ dice: sides, result: 1, raw: 1, raw1: 1, raw2: 1, bonus, label, mode: "Auto-Fail (Condition)" });
        setIsRolling(false);
        addToLog(`Auto-failed ${label} due to Condition.`);
        return;
      }
      
      if ((exhaustion >= 1 && isCheck) || (exhaustion >= 3 && (isAttack || isSave))) forcedMode = "disadvantage";
      if (activeConditions.includes("Poisoned") && (isAttack || isCheck)) forcedMode = "disadvantage";
      if (activeConditions.includes("Frightened") && (isAttack || isCheck)) forcedMode = "disadvantage";
      if (activeConditions.includes("Blinded") && isAttack) forcedMode = "disadvantage";
      if (activeConditions.includes("Prone") && isAttack) forcedMode = "disadvantage";
      if (activeConditions.includes("Restrained") && (isAttack || (isSave && label.includes("DEX")))) forcedMode = "disadvantage";
      if (activeConditions.includes("Deafened") && label === "Perception") forcedMode = "disadvantage";
      
      if (activeConditions.includes("Invisible") && isAttack) forcedMode = "advantage";

      let finalRaw = raw1;
      if (forcedMode === "advantage") finalRaw = Math.max(raw1, raw2);
      if (forcedMode === "disadvantage") finalRaw = Math.min(raw1, raw2);
      
      const total = finalRaw + bonus;
      setRollResult({ dice: sides, result: total, raw: finalRaw, raw1, raw2, bonus, label, mode: forcedMode });
      setIsRolling(false);
      
      let logMsg = `Rolled ${label}: ${total}`;
      if (forcedMode !== "normal") logMsg += ` (with ${forcedMode.toUpperCase()})`;
      addToLog(logMsg);
    }, 600);
  };

  const handleHp = async (type: 'heal' | 'dmg' | 'temp') => {
    if (!hpInput || isReadOnly) return;
    const amount = Number(hpInput);
    let finalHp = currentHp;
    let finalTempHp = tempHp;

    if (type === 'temp') {
      finalTempHp = Math.max(tempHp, amount);
      setTempHp(finalTempHp);
    } else if (type === 'heal') {
      finalHp = Math.min(character.hpMax, currentHp + amount);
      setCurrentHp(finalHp);
    } else {
      let rem = amount; let nTemp = tempHp; let nHp = currentHp;
      if (nTemp > 0) { if (rem >= nTemp) { rem -= nTemp; nTemp = 0; } else { nTemp -= rem; rem = 0; } }
      if (rem > 0) nHp = Math.max(0, nHp - rem);
      finalTempHp = nTemp; finalHp = nHp;
      setTempHp(finalTempHp); setCurrentHp(finalHp);
    }
    setHpInput("");
    addToLog(`${type} ${amount} HP.`);

    // Sinkronisasi perubahan secara asinkron ke database
    try {
      // Sesuaikan parameter di bawah dengan fungsi Server Action Anda yang sebenarnya
      await updateCharacterHpAction(character._id, finalHp);
    } catch (err) {
      console.error("Gagal menyimpan HP ke Weave (Database)");
    }
  };

  const handleRest = (type: "short" | "long") => {
    setIsResting(type);
    setTimeout(() => {
      if (type === "long") {
        setCurrentHp(character.hpMax); setTempHp(0);
        setUsedSlots({ "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0, "8": 0, "9": 0 }); 
        setHitDiceUsed(0); setDeathSaves({ success: 0, fail: 0 }); setExhaustion(0);
      }
      addToLog(`${type} Rest completed.`);
      setIsResting(null);
      resetTurnActions();
    }, 2000);
  };

  const updateDeathSave = (type: 'success' | 'fail') => {
    setDeathSaves(prev => ({ ...prev, [type]: (prev[type] + 1) % 4 }));
    addToLog(`Death Save ${type} logged.`);
  };

  const exportPDF = async () => {
    if (!sheetRef.current) return;
    setIsExporting(true);
    addToLog("Mempersiapkan perkamen PDF...");
    try {
      const dataUrl = await toPng(sheetRef.current, { quality: 0.95, backgroundColor: '#fdfaf6' });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (sheetRef.current.offsetHeight * pdfWidth) / sheetRef.current.offsetWidth;
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${character.name}_DnD_Sheet.pdf`);
      addToLog("Ekspor PDF Berhasil!");
    } catch (err) {
      console.error(err);
      addToLog("Gagal mengekspor PDF.");
    }
    setIsExporting(false);
  };

  return (
    <main className="min-h-screen bg-[#fdfaf6] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] text-stone-700 font-sans pb-32 relative selection:bg-amber-800/30 overflow-x-hidden">
      
      {activeConditions.includes("Unconscious") && <div className="fixed inset-0 bg-stone-100/90 z-[40] pointer-events-none transition-all duration-1000" />}
      {activeConditions.includes("Blinded") && <div className="fixed inset-0 shadow-[inset_0_0_200px_rgba(0,0,0,0.95)] z-[40] pointer-events-none transition-all duration-1000" />}
      {activeConditions.includes("Poisoned") && <div className="fixed inset-0 bg-green-900/10 mix-blend-color z-[40] pointer-events-none transition-all duration-1000" />}
      {activeConditions.includes("Frightened") && <div className="fixed inset-0 bg-amber-900/10 animate-pulse z-[40] pointer-events-none transition-all duration-1000" />}

      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-amber-800/5 blur-[120px] rounded-full" />
      </div>

      <AnimatePresence>
        {isExpModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] bg-stone-100/80 backdrop-blur-sm flex items-center justify-center">
             <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white border-2 border-yellow-500/50 p-8 rounded-[2rem] shadow-[0_0_50px_rgba(168,85,247,0.3)] w-full max-w-sm text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-700 to-yellow-400" />
                <h3 className="text-xl font-black text-stone-900 uppercase tracking-widest mb-2">Grant Experience</h3>
                <p className="text-[10px] text-stone-600 font-medium mb-6">Pengetahuan dari The Weave.</p>
                <input type="number" value={expInputAmount} onChange={e=>setExpInputAmount(e.target.value)} className="w-full bg-stone-100 border-2 border-amber-900/10 rounded-xl py-4 text-center font-black text-2xl text-yellow-600 outline-none focus:border-yellow-500 mb-6" placeholder="0 XP" autoFocus />
                <div className="flex gap-3">
                   <button onClick={()=>setIsExpModalOpen(false)} className="flex-1 py-3 bg-stone-200 text-stone-600 font-black rounded-xl text-[10px] uppercase tracking-widest hover:text-stone-900 transition-all">Cancel</button>
                   <button onClick={submitExp} className="flex-1 py-3 bg-yellow-700 text-stone-900 font-black rounded-xl text-[10px] uppercase tracking-widest shadow-[0_0_15px_rgba(168,85,247,0.5)] hover:bg-yellow-500 transition-all">Add XP</button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLevelUpModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] bg-stone-100/90 backdrop-blur-md flex items-center justify-center">
             <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} className="bg-white border-2 border-stone-300merald-700/50 p-12 rounded-[3rem] shadow-[0_0_100px_rgba(34,197,94,0.3)] w-full max-w-md text-center relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-700/10 blur-[80px] rounded-full pointer-events-none" />
                <TrendingUp className="w-16 h-16 mb-6 mx-auto block animate-bounce text-emerald-600 drop-shadow-[0_0_20px_rgba(34,197,94,0.5)]" />
                <h3 className="text-3xl font-black text-stone-900 uppercase tracking-tighter mb-4">Level Up Achieved!</h3>
                <p className="text-[10px] text-stone-600 font-medium mb-8 uppercase tracking-widest leading-relaxed">Karakter Anda telah menembus batas baru. Silakan klik tombol di bawah untuk meningkatkan level karakter Anda.</p>
                <div className="flex gap-4">
                   <button onClick={()=>setIsLevelUpModalOpen(false)} className="flex-1 py-4 bg-stone-200 text-stone-600 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:text-stone-900 transition-all">Nanti Saja</button>
                   <button onClick={confirmLevelUp} className="flex-1 py-4 bg-emerald-800 text-stone-900 font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-[0_0_20px_rgba(34,197,94,0.5)] hover:bg-emerald-700 transition-all flex items-center justify-center">Naik Level →</button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isResting && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-stone-100/90 backdrop-blur-md flex flex-col items-center justify-center">
            <motion.div animate={{ opacity: [0.5, 1, 0.5], scale: [0.95, 1.05, 0.95] }} transition={{ repeat: Infinity, duration: 2 }} className="mb-8 drop-shadow-lg">
               {isResting === "long" ? <Moon className="w-32 h-32 text-amber-800" /> : <Flame className="w-32 h-32 text-orange-500" />}
            </motion.div>
            <h2 className="text-2xl font-black text-amber-800 uppercase tracking-[0.5em]">{isResting === "long" ? "Restoring Vitality" : "Catching Breath"}</h2>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="bg-[#fdfaf6]/90 border-b-amber-900/20 backdrop-blur-xl border-b border-amber-900/10 sticky top-0 z-50 h-16 flex items-center justify-between px-6 md:px-10 no-print shadow-xl">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-black text-amber-800 tracking-tighter text-xl uppercase hover:text-amber-700 transition-colors">DND<span className="text-stone-900">ONLINE</span></Link>
          <div className="h-6 w-px bg-white/10 hidden md:block" />
          <Tooltip text="Inspiration Point dari Dungeon Master">
             <div className="hidden lg:flex items-center gap-2 cursor-help">
                <span className="text-[8px] font-black text-stone-500 uppercase tracking-widest">Inspiration</span>
                <button onClick={() => setInspiration(!inspiration)} className={`w-8 h-4 rounded-full border transition-all relative ${inspiration ? 'bg-yellow-500 border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.6)]' : 'bg-stone-200 border-amber-900/20'}`}>
                   <motion.div animate={{ x: inspiration ? 16 : 2 }} className="absolute top-[1.5px] w-3 h-3 bg-white rounded-full" />
                </button>
             </div>
          </Tooltip>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={exportPDF} disabled={isExporting} className="bg-stone-800 hover:bg-stone-700 text-stone-100 text-[9px] font-black px-3 md:px-4 py-2 rounded-lg shadow-lg transition-all uppercase tracking-widest flex items-center gap-1 md:gap-2 mr-2 disabled:opacity-50">
            <Download className="w-3.5 h-3.5" /> <span className="hidden sm:inline">{isExporting ? "Menyalin..." : "Ekspor PDF"}</span>
          </button>
          {/* TOMBOL EDIT HERO DI HEADER ATAS */}
          {!isReadOnly && (
            <button onClick={() => router.push(`/characters/edit/${character._id}`)} className="bg-yellow-700 hover:bg-yellow-500 text-stone-900 text-[9px] font-black px-3 md:px-4 py-2 rounded-lg shadow-lg transition-all uppercase tracking-widest flex items-center gap-1 md:gap-2 mr-2">
              <Settings2 className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Edit Hero</span>
            </button>
          )}
          <button onClick={() => handleRest("short")} className="bg-white hover:bg-orange-900/30 text-orange-500 text-[9px] font-black px-3 md:px-4 py-2 rounded-lg border border-orange-500/20 transition-all uppercase tracking-widest flex items-center gap-1.5"><Flame className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Short Rest</span></button>
          <button onClick={() => handleRest("long")} className="bg-amber-800 hover:bg-amber-800 text-stone-900 text-[9px] font-black px-3 md:px-4 py-2 rounded-lg shadow-lg transition-all uppercase tracking-widest flex items-center gap-1.5"><Moon className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Long Rest</span></button>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 mt-8 relative z-10" ref={sheetRef}>
        <VitalsHeader hero={character} currentHp={currentHp} tempHp={tempHp} hpInput={hpInput} setHpInput={setHpInput} handleHp={handleHp} isReadOnly={isReadOnly} displayAvatar={character.avatarUrl || CLASSES[character.class.split(' ')[0]]?.image} exp={exp} onOpenExpModal={() => setIsExpModalOpen(true)} exhaustion={exhaustion} onLevelUp={() => setIsLevelUpModalOpen(true)} currentLevel={currentLevel} imageFilter={!character.avatarUrl ? CLASSES[character.class.split(' ')[0]]?.imageFilter : 'none'} />

        <AttributeMatrix character={character} mods={mods} rollDice={rollDice} formatMod={formatMod} activeConditions={activeConditions} exhaustion={exhaustion} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           <SkillPanel character={character} mods={mods} profBonus={profBonus} rollDice={rollDice} formatMod={formatMod} getSkillBonus={getSkillBonus} deathSaves={deathSaves} updateDeathSave={updateDeathSave} hitDiceUsed={hitDiceUsed} setHitDiceUsed={setHitDiceUsed} exhaustion={exhaustion} setExhaustion={setExhaustion} activeSpeed={activeSpeed} activeConditions={activeConditions} currentLevel={currentLevel} />
           
           <ActionTabs character={character} mods={mods} profBonus={profBonus} rollDice={rollDice} usedSlots={usedSlots} setUsedSlots={setUsedSlots} eqItems={eqItems} setEqItems={setEqItems} invItems={invItems} setInvItems={setInvItems} currency={currency} updateCurrency={updateCurrency} turnActions={turnActions} toggleTurnAction={toggleTurnAction} resetTurnActions={resetTurnActions} activeConditions={activeConditions} exhaustion={exhaustion} currentLevel={currentLevel} />
           
           <CombatLogPanel combatLog={combatLog} activeConditions={activeConditions} toggleCondition={(c:string) => {
              const next = activeConditions.includes(c) ? activeConditions.filter(x => x !== c) : [...activeConditions, c];
              setActiveConditions(next); addToLog(activeConditions.includes(c) ? `Cured: ${c}` : `Afflicted: ${c}`);
           }} />
        </div>
      </div>

      {/* TRAY DADU PLATONIC SOLIDS */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-[100] no-print group">
        <div className="flex bg-white/90 backdrop-blur-xl border border-amber-900/20 rounded-full p-1 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0">
           {[{id: 'normal', l: 'Normal'}, {id: 'advantage', l: 'ADV'}, {id: 'disadvantage', l: 'DIS'}].map(m => (
             <button key={m.id} onClick={() => setRollMode(m.id as any)} className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${rollMode === m.id ? 'bg-amber-800 text-stone-900' : 'text-stone-500 hover:text-stone-900'}`}>{m.l}</button>
           ))}
        </div>
        
        <div className="flex gap-3 bg-white/90 backdrop-blur-xl p-2.5 rounded-[24px] border border-amber-900/20 shadow-[0_15px_40px_rgba(0,0,0,0.8)] items-center">
          <Tooltip text="Tray Dadu: Pilih Normal, ADV (Dua Dadu Tertinggi), atau DIS (Dua Dadu Terendah) di atasnya">
             <div className="flex items-center justify-center h-8 px-3 border-r border-amber-900/20 cursor-help">
               <span className="text-[10px] font-black text-amber-800 uppercase tracking-[0.4em] translate-y-px">TRAY</span>
             </div>
          </Tooltip>
          
          {[4, 6, 8, 10, 12, 20].map(d => (
            <motion.button key={d} whileTap={{ scale: 0.8 }} onClick={() => rollDice(d, 0, `Quick d${d}`)} 
              className="relative block w-11 h-11 md:w-12 md:h-12 shrink-0 transition-all group"
            >
               <svg viewBox="0 0 32 32" preserveAspectRatio="xMidYMid meet" className={`absolute inset-0 w-full h-full scale-[1.15] transition-all duration-300 ${d === 20 ? 'drop-shadow-[0_0_12px_rgba(37,99,235,0.8)]' : 'drop-shadow-md'}`}>
                 <path 
                   d={
                     d === 4 ? "M16 2 L30 28 L2 28 Z" : 
                     d === 6 ? "M4 4 h24 v24 h-24 Z" : 
                     d === 8 ? "M16 2 L30 16 L16 30 L2 16 Z" : 
                     d === 10 ? "M16 2 L30 14 L16 30 L2 14 Z" : 
                     d === 12 ? "M16 2 L30 12 L24 28 L8 28 L2 12 Z" : 
                     "M16 2 L28 9 L28 23 L16 30 L4 23 L4 9 Z" 
                   }
                   fill={d === 20 ? "#2563eb" : "#44403c"}
                   stroke={d === 20 ? "#60a5fa" : "#78716c"}
                   strokeWidth="1.5"
                   strokeLinejoin="round"
                   className={d === 20 ? "" : "group-hover:fill-stone-200 transition-colors duration-300"}
                 />
               </svg>
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <span className={`relative font-black text-[16px] tracking-tighter ${d === 20 ? 'text-stone-900' : 'text-stone-100 group-hover:text-stone-900 transition-colors'} ${d === 4 ? 'translate-y-[4px]' : d === 10 ? '-translate-y-[2px]' : d === 12 ? 'translate-y-[1px]' : ''}`}>d{d}</span>
               </div>
            </motion.button>
          ))}
        </div>
      </div>

      <DiceModal isRolling={isRolling} result={rollResult} onClose={() => setRollResult(null)} />

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}} />
    </main>
  );
}