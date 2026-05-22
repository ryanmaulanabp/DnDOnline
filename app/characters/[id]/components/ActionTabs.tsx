"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, IconSword } from "./HeroModules";
import { SpellTabContent, FeatureTabContent } from "./SpellAndFeatures";
import { Crosshair, Swords, Footprints, HeartPulse, Zap, Flame } from "lucide-react";

// Tooltip khusus arah bawah agar tidak terpotong oleh overflow-hidden di atap container
const TooltipDown = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <div className="relative group/tdown flex items-center justify-center cursor-help">
    {children}
    <div className="absolute top-full mt-2 opacity-0 group-hover/tdown:opacity-100 transition-opacity duration-300 pointer-events-none z-[999] whitespace-normal w-max max-w-[200px] text-center bg-stone-900/95 border border-stone-600 text-stone-100 px-3 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest shadow-xl backdrop-blur-md left-1/2 -translate-x-1/2">
      {text}
    </div>
  </div>
);

const parseWeapon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("dagger") || n.includes("knife") || n.includes("dart")) return { damage: "1d4 piercing", isFinesse: true, isRanged: false };
  if (n.includes("shortsword") || n.includes("rapier") || n.includes("scimitar")) return { damage: "1d6 piercing", isFinesse: true, isRanged: false };
  if (n.includes("longsword") || n.includes("axe") || n.includes("mace") || n.includes("spear") || n.includes("staff")) return { damage: "1d8 bludgeoning", isFinesse: false, isRanged: false };
  if (n.includes("greatsword") || n.includes("maul") || n.includes("greataxe")) return { damage: "2d6 slashing", isFinesse: false, isRanged: false };
  if (n.includes("bow") || n.includes("crossbow") || n.includes("sling")) return { damage: "1d8 piercing", isFinesse: false, isRanged: true };
  if (n.includes("shield") || n.includes("armor") || n.includes("ring") || n.includes("potion") || n.includes("scroll") || n.includes("wand")) return null;
  return { damage: "1d4 bludgeoning", isFinesse: false, isRanged: false, note: "Improvised" };
};

export const ActionTabs = ({ character, mods, profBonus, rollDice, usedSlots, setUsedSlots, eqItems, setEqItems, invItems, setInvItems, currency, updateCurrency, turnActions, toggleTurnAction, resetTurnActions, activeConditions, exhaustion, currentLevel }: any) => {
  const [activeTab, setActiveTab] = useState("ACTIONS");
  const [subTab, setSubTab] = useState("ATTACKS");
  const [newItemInput, setNewItemInput] = useState("");

  const spellStat = (character.spellCastingStat && character.spellCastingStat !== "NONE") ? character.spellCastingStat : "CHA";
  const spellSaveDC = 8 + profBonus + (mods[spellStat as keyof typeof mods] || 0);
  const spellAttack = profBonus + (mods[spellStat as keyof typeof mods] || 0);

  const toggleEquip = (itemName: string) => {
    if(eqItems.includes(itemName)) setEqItems(eqItems.filter((i:string) => i !== itemName));
    else setEqItems([...eqItems, itemName]);
  };

  const addItem = () => {
    if(newItemInput.trim()) { setInvItems([...invItems, newItemInput.trim()]); setNewItemInput(""); }
  };

  const combinedWeapons = [
    ...(character.weapons || []),
    ...eqItems.map((item: string) => {
      const stats = parseWeapon(item);
      if (stats) return { name: item, ...stats };
      return null;
    }).filter(Boolean)
  ];

  const attackHasDisadv = activeConditions.includes("Poisoned") || activeConditions.includes("Frightened") || activeConditions.includes("Blinded") || activeConditions.includes("Prone") || activeConditions.includes("Restrained") || exhaustion >= 3;
  const isActionUsed = turnActions.action;

  return (
    <div className="lg:col-span-6 flex flex-col">
      <div className="bg-white border border-amber-900/20 rounded-[34px] shadow-2xl flex flex-col flex-1 relative overflow-hidden min-h-[500px]">
        
        {/* TURN TRACKER BAR */}
        <div className="flex flex-row justify-between items-center bg-stone-100 p-3 border-b border-amber-900/20">
           <span className="text-[8px] font-black text-stone-500 uppercase tracking-widest hidden sm:block shrink-0">Turn Actions</span>
           <div className="flex flex-row items-center gap-2 sm:gap-3 shrink-0">
              <TooltipDown text="Aksi Utama: 1x per giliran (Menyerang, Cast Spell). Centang untuk mengunci tombol serangan.">
                <button onClick={() => toggleTurnAction('action')} className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all ${turnActions.action ? 'text-red-500 bg-red-500/10 border border-red-500/30' : 'text-stone-600 bg-stone-200 border border-amber-900/10 hover:text-stone-900 hover:bg-white/5'}`}>
                  <div className={`w-3 h-3 border rounded-sm flex items-center justify-center ${turnActions.action ? 'border-red-500 bg-red-500' : 'border-slate-600'}`}>{turnActions.action && <span className="text-stone-900 text-[7px]">✓</span>}</div> Action
                </button>
              </TooltipDown>
              <TooltipDown text="Aksi Ekstra: 1x per giliran JIKA ada fitur/spell khusus (Healing Word, Off-hand atk).">
                <button onClick={() => toggleTurnAction('bonus')} className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all ${turnActions.bonus ? 'text-orange-500 bg-orange-500/10 border border-orange-500/30' : 'text-stone-600 bg-stone-200 border border-amber-900/10 hover:text-stone-900 hover:bg-white/5'}`}>
                  <div className={`w-3 h-3 border rounded-sm flex items-center justify-center ${turnActions.bonus ? 'border-orange-500 bg-orange-500' : 'border-slate-600'}`}>{turnActions.bonus && <span className="text-stone-900 text-[7px]">✓</span>}</div> Bonus
                </button>
              </TooltipDown>
              <TooltipDown text="Respon Cepat: 1x per putaran ronde (Opportunity Attack, Shield spell).">
                <button onClick={() => toggleTurnAction('reaction')} className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all ${turnActions.reaction ? 'text-amber-800 bg-amber-800/10 border border-amber-800/30' : 'text-stone-600 bg-stone-200 border border-amber-900/10 hover:text-stone-900 hover:bg-white/5'}`}>
                  <div className={`w-3 h-3 border rounded-sm flex items-center justify-center ${turnActions.reaction ? 'border-amber-800 bg-amber-800' : 'border-slate-600'}`}>{turnActions.reaction && <span className="text-stone-900 text-[7px]">✓</span>}</div> Reaction
                </button>
              </TooltipDown>
              <TooltipDown text="Reset semua aksi saat giliranmu dimulai kembali.">
                <button onClick={resetTurnActions} className="text-[8px] font-black text-stone-900 uppercase bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all ml-0 sm:ml-1">Reset</button>
              </TooltipDown>
           </div>
        </div>

        <div className="flex bg-stone-100 p-2 gap-1 border-b border-amber-900/20">
          {["ACTIONS", "SPELLS", "INVENTORY", "FEATURES"].map(t => (
            <button key={t} onClick={() => {setActiveTab(t); setSubTab(t === "ACTIONS" ? "ATTACKS" : "");}} className={`flex-1 py-3 text-[9px] font-black tracking-[0.2em] rounded-xl transition-all relative whitespace-nowrap ${activeTab === t ? 'text-stone-900' : 'text-stone-500 hover:text-stone-700 hover:bg-white/5'}`}>
               {activeTab === t && <motion.div layoutId="maintab" className="absolute inset-0 bg-amber-800 shadow-md rounded-xl -z-10" />}
               {t}
            </button>
          ))}
        </div>

        <div className="p-6 flex-1 overflow-y-auto max-h-[600px] custom-scrollbar w-full overflow-x-hidden">
          <AnimatePresence mode="wait">
            
            {activeTab === "ACTIONS" && (
              <motion.div key="act" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 w-full">
                 <div className="flex gap-4 border-b border-amber-900/10 pb-3 mb-4">
                    {["ATTACKS", "BONUS", "REACTIONS"].map(st => (
                      <span key={st} onClick={() => setSubTab(st)} className={`text-[8px] font-black uppercase tracking-widest cursor-pointer pb-2 border-b-2 transition-all ${subTab === st ? 'text-amber-700 border-amber-800' : 'text-stone-400 border-transparent hover:text-stone-600'}`}>{st}</span>
                    ))}
                 </div>
                 
                 {subTab === "ATTACKS" && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                      {combinedWeapons.map((w: any, idx: number) => {
                         const statUse = (w.isRanged || w.isFinesse) ? Math.max(mods.STR, mods.DEX) : mods.STR;
                         const hitBonus = profBonus + statUse;
                         const safeDamage = parseInt(w.damage) || 0; 
                         return (
                           <div key={idx} className={`bg-stone-50 border border-amber-900/10 p-4 rounded-[21px] transition-all group flex flex-col relative w-full overflow-hidden ${isActionUsed ? 'opacity-40 grayscale pointer-events-none' : 'hover:border-amber-800/30'}`}>
                              {w.note === "Improvised" && <span className="absolute top-2 right-2 text-[6px] font-black bg-orange-900/50 text-orange-400 px-1.5 py-0.5 rounded uppercase tracking-widest">Improvised</span>}
                              
                              <div className="flex items-center gap-3 mb-4 w-full">
                                 <div className="w-10 h-10 bg-stone-100 rounded-lg border border-amber-900/20 flex items-center justify-center text-lg text-stone-500 group-hover:text-amber-700 transition-colors shrink-0">{w.isRanged ? <Crosshair className="w-5 h-5" /> : <IconSword />}</div>
                                 <div className="min-w-0 pr-2 flex-1 text-left">
                                    <h4 className="text-[13px] font-black text-stone-900 uppercase tracking-tight leading-tight block truncate">{w.name}</h4>
                                    <span className="text-[8px] text-stone-500 font-bold uppercase tracking-widest">{w.isRanged ? 'Ranged' : 'Melee'} • {w.damage}</span>
                                 </div>
                              </div>
                              <div className="flex gap-2">
                                 <motion.button whileTap={isActionUsed ? {} : { scale: 0.95 }} disabled={isActionUsed} onClick={() => { rollDice(20, hitBonus, `${w.name} Atk`); toggleTurnAction('action'); }} className="flex-1 py-2 bg-amber-900/10 text-amber-700 border border-amber-900/20 rounded-lg text-[9px] font-black uppercase transition-all hover:bg-amber-800 hover:text-stone-100 flex justify-between items-center px-3">
                                    <span className="opacity-70">ATK</span>
                                    <div className="flex items-center gap-1">
                                      {attackHasDisadv && <span className="text-[5px] bg-red-600 text-stone-900 px-1 py-0.5 rounded leading-none">DIS</span>}
                                      <span className="text-xs">+{hitBonus}</span>
                                    </div>
                                 </motion.button>
                                 <motion.button whileTap={isActionUsed ? {} : { scale: 0.95 }} disabled={isActionUsed} onClick={() => rollDice(safeDamage, statUse, `${w.name} Dmg`)} className="flex-1 py-2 bg-red-900/10 text-red-700 border border-red-900/20 rounded-lg text-[9px] font-black uppercase transition-all hover:bg-red-800 hover:text-stone-100 flex justify-between items-center px-3">
                                    <span className="opacity-70">DMG</span>
                                    <span className="text-xs">{w.damage.split(' ')[0]}</span>
                                 </motion.button>
                              </div>
                           </div>
                         );
                      })}
                      
                      <div className={`bg-stone-50 border border-amber-900/10 p-4 rounded-[21px] transition-all group flex flex-col relative w-full overflow-hidden ${isActionUsed ? 'opacity-40 grayscale pointer-events-none' : 'hover:border-slate-500/30'}`}>
                         <div className="flex items-center gap-3 mb-4 w-full">
                            <div className="w-10 h-10 bg-stone-100 rounded-lg border border-amber-900/20 flex items-center justify-center text-lg text-stone-500 group-hover:text-stone-600 transition-colors shrink-0"><Swords className="w-5 h-5" /></div>
                            <div className="min-w-0 pr-2 flex-1 text-left">
                               <h4 className="text-[13px] font-black text-stone-900 uppercase tracking-tight leading-tight block truncate">Unarmed Strike</h4>
                               <span className="text-[8px] text-stone-500 font-bold uppercase tracking-widest">Melee • {Math.max(1, 1 + (mods?.STR || 0))} Bld Dmg</span>
                            </div>
                         </div>
                         <div className="flex gap-2">
                            <motion.button whileTap={isActionUsed ? {} : { scale: 0.95 }} disabled={isActionUsed} onClick={() => { rollDice(20, profBonus + (mods?.STR || 0), "Unarmed Strike"); toggleTurnAction('action'); }} className="flex-1 py-2 bg-amber-900/10 text-amber-700 border border-amber-900/20 rounded-lg text-[9px] font-black uppercase transition-all hover:bg-amber-800 hover:text-stone-100 flex justify-between items-center px-3">
                               <span className="opacity-70">ATK</span>
                               <div className="flex items-center gap-1 shrink-0">
                                 {attackHasDisadv && <span className="text-[6px] bg-red-600 text-stone-900 px-1 py-0.5 rounded leading-none">DIS</span>}
                                 <span className="text-xs">+{profBonus + (mods?.STR || 0)}</span>
                               </div>
                            </motion.button>
                            <motion.button whileTap={isActionUsed ? {} : { scale: 0.95 }} disabled={isActionUsed} onClick={() => rollDice(1, (mods?.STR || 0), `Unarmed Dmg`)} className="flex-1 py-2 bg-red-900/10 text-red-700 border border-red-900/20 rounded-lg text-[9px] font-black uppercase transition-all hover:bg-red-800 hover:text-stone-100 flex justify-between items-center px-3">
                               <span className="opacity-70">DMG</span>
                               <span className="text-xs shrink-0">{Math.max(1, 1 + (mods?.STR || 0))}</span>
                            </motion.button>
                         </div>
                      </div>
                   </div>
                 )}

                 {subTab === "BONUS" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                      <div className={`bg-stone-50 border border-amber-900/10 p-4 rounded-[21px] transition-all group flex flex-col relative w-full overflow-hidden ${turnActions.bonus ? 'opacity-40 grayscale pointer-events-none' : 'hover:border-orange-500/30'}`}>
                          <div className="flex items-center gap-3 mb-4 w-full">
                             <div className="w-10 h-10 bg-stone-100 rounded-lg border border-amber-900/20 flex items-center justify-center text-lg text-stone-500 group-hover:text-orange-400 transition-colors shrink-0"><Swords className="w-5 h-5" /></div>
                             <div className="min-w-0 pr-2 flex-1 text-left">
                                <h4 className="text-[13px] font-black text-stone-900 uppercase tracking-tight leading-tight block truncate">Two-Weapon Fighting</h4>
                                <span className="text-[8px] text-stone-500 font-bold uppercase tracking-widest">Off-hand Melee Attack</span>
                             </div>
                          </div>
                          <div className="flex gap-2">
                             <button disabled={turnActions.bonus} onClick={() => { rollDice(20, profBonus + Math.max(mods.STR || 0, mods.DEX || 0), `Off-hand Atk`); toggleTurnAction('bonus'); }} className="flex-1 py-2 bg-amber-900/10 text-amber-700 border border-amber-900/20 rounded-lg text-[9px] font-black uppercase transition-all hover:bg-amber-800 hover:text-stone-100 flex justify-between items-center px-3">
                                <span className="opacity-70">ATK</span>
                                <div className="flex items-center gap-1">
                                  {attackHasDisadv && <span className="text-[6px] bg-red-600 text-stone-900 px-1 py-0.5 rounded leading-none">DIS</span>}
                                  <span className="text-xs">+{profBonus + Math.max(mods.STR || 0, mods.DEX || 0)}</span>
                                </div>
                             </button>
                             <button disabled={turnActions.bonus} onClick={() => rollDice(4, 0, `Off-hand Dmg`)} className="flex-1 py-2 bg-red-900/10 text-red-700 border border-red-900/20 rounded-lg text-[9px] font-black uppercase transition-all hover:bg-red-800 hover:text-stone-100 flex justify-between items-center px-3">
                                <span className="opacity-70">DMG</span>
                                <span className="text-xs">1d4</span>
                             </button>
                          </div>
                      </div>

                      {character.features?.map((f: string, i: number) => {
                         const fl = f.toLowerCase();
                         if (fl.includes("second wind")) {
                            return (
                               <div key={`ba-${i}`} className={`bg-stone-50 border border-amber-900/10 p-4 rounded-[21px] transition-all group flex flex-col relative w-full overflow-hidden ${turnActions.bonus ? 'opacity-40 grayscale pointer-events-none' : 'hover:border-emerald-700/30'}`}>
                                  <div className="flex items-center gap-3 mb-4 w-full">
                                     <div className="w-10 h-10 bg-stone-100 rounded-lg border border-amber-900/20 flex items-center justify-center text-lg text-stone-500 group-hover:text-emerald-600 transition-colors shrink-0"><HeartPulse className="w-5 h-5" /></div>
                                     <div className="min-w-0 pr-2 flex-1 text-left">
                                        <h4 className="text-[13px] font-black text-stone-900 uppercase tracking-tight leading-tight block truncate">Second Wind</h4>
                                        <span className="text-[8px] text-stone-500 font-bold uppercase tracking-widest">Fighter Heal</span>
                                     </div>
                                  </div>
                                  <button disabled={turnActions.bonus} onClick={() => { rollDice(10, currentLevel || 1, `Second Wind Heal`); toggleTurnAction('bonus'); }} className="w-full py-2 bg-emerald-800/10 text-emerald-600 border border-emerald-700/20 rounded-lg text-[9px] font-black uppercase transition-all hover:bg-emerald-800 hover:text-stone-900 flex justify-between px-4 items-center">
                                     <span className="opacity-70">HEAL</span>
                                     <span className="text-xs">1d10 + {currentLevel || 1}</span>
                                  </button>
                               </div>
                            );
                         }
                         if (fl.includes("rage")) {
                            return (
                               <div key={`ba-${i}`} className={`bg-stone-50 border border-amber-900/10 p-4 rounded-[21px] transition-all group flex flex-col relative w-full overflow-hidden ${turnActions.bonus ? 'opacity-40 grayscale pointer-events-none' : 'hover:border-red-500/30'}`}>
                                  <div className="flex items-center gap-3 mb-4 w-full">
                                     <div className="w-10 h-10 bg-stone-100 rounded-lg border border-amber-900/20 flex items-center justify-center text-lg text-stone-500 group-hover:text-red-400 transition-colors shrink-0"><Flame className="w-5 h-5" /></div>
                                     <div className="min-w-0 pr-2 flex-1 text-left">
                                        <h4 className="text-[13px] font-black text-stone-900 uppercase tracking-tight leading-tight block truncate">Rage</h4>
                                        <span className="text-[8px] text-stone-500 font-bold uppercase tracking-widest">Barbarian Buff</span>
                                     </div>
                                  </div>
                                  <button disabled={turnActions.bonus} onClick={() => { toggleTurnAction('bonus'); }} className="w-full py-2 bg-red-600/10 text-red-400 border border-red-500/20 rounded-lg text-[9px] font-black uppercase transition-all hover:bg-red-600 hover:text-stone-900 text-center tracking-widest">
                                     Enter Rage
                                  </button>
                               </div>
                            );
                         }
                         if (fl.includes("cunning action")) {
                            return (
                               <div key={`ba-${i}`} className={`bg-stone-50 border border-amber-900/10 p-4 rounded-[21px] transition-all group flex flex-col relative w-full overflow-hidden col-span-1 md:col-span-2 ${turnActions.bonus ? 'opacity-40 grayscale pointer-events-none' : 'hover:border-amber-800/30'}`}>
                                  <div className="flex items-center gap-3 mb-4 w-full">
                                     <div className="w-10 h-10 bg-stone-100 rounded-lg border border-amber-900/20 flex items-center justify-center text-lg text-stone-500 group-hover:text-amber-700 transition-colors shrink-0"><Footprints className="w-5 h-5" /></div>
                                     <div className="min-w-0 pr-2 flex-1 text-left">
                                        <h4 className="text-[13px] font-black text-stone-900 uppercase tracking-tight leading-tight block truncate">Cunning Action</h4>
                                        <span className="text-[8px] text-stone-500 font-bold uppercase tracking-widest">Rogue Agility</span>
                                     </div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2">
                                     <button disabled={turnActions.bonus} onClick={() => { toggleTurnAction('bonus'); }} className="py-2 bg-amber-900/10 text-amber-700 border border-amber-900/20 rounded-lg text-[8px] font-black uppercase transition-all hover:bg-amber-800 hover:text-stone-900">Dash</button>
                                     <button disabled={turnActions.bonus} onClick={() => { toggleTurnAction('bonus'); }} className="py-2 bg-yellow-700/10 text-yellow-600 border border-yellow-500/20 rounded-lg text-[8px] font-black uppercase transition-all hover:bg-yellow-700 hover:text-stone-900">Disengage</button>
                                     <button disabled={turnActions.bonus} onClick={() => { rollDice(20, profBonus + mods.DEX, "Stealth (Hide)"); toggleTurnAction('bonus'); }} className="py-2 bg-slate-600/10 text-stone-600 border border-slate-500/20 rounded-lg text-[8px] font-black uppercase transition-all hover:bg-slate-600 hover:text-stone-900">Hide</button>
                                  </div>
                               </div>
                            );
                         }
                         if (fl.includes("martial arts") || fl.includes("flurry of blows")) {
                            return (
                               <div key={`ba-${i}`} className={`bg-stone-50 border border-amber-900/10 p-4 rounded-[21px] transition-all group flex flex-col relative w-full overflow-hidden ${turnActions.bonus ? 'opacity-40 grayscale pointer-events-none' : 'hover:border-slate-500/30'}`}>
                                  <div className="flex items-center gap-3 mb-4 w-full">
                                     <div className="w-10 h-10 bg-stone-100 rounded-lg border border-amber-900/20 flex items-center justify-center text-lg text-stone-500 group-hover:text-stone-600 transition-colors shrink-0"><Swords className="w-5 h-5" /></div>
                                     <div className="min-w-0 pr-2 flex-1 text-left">
                                        <h4 className="text-[13px] font-black text-stone-900 uppercase tracking-tight leading-tight block truncate">Unarmed Strike</h4>
                                        <span className="text-[8px] text-stone-500 font-bold uppercase tracking-widest">Martial Arts Bonus</span>
                                     </div>
                                  </div>
                                  <div className="flex gap-2">
                                     <button disabled={turnActions.bonus} onClick={() => { rollDice(20, profBonus + Math.max(mods.STR, mods.DEX), `Unarmed Atk`); toggleTurnAction('bonus'); }} className="flex-1 py-2 bg-amber-900/10 text-amber-700 border border-amber-900/20 rounded-lg text-[9px] font-black uppercase transition-all hover:bg-amber-800 hover:text-stone-100 flex justify-between items-center px-3">
                                        <span className="opacity-70">ATK</span>
                                        <div className="flex items-center gap-1">
                                          {attackHasDisadv && <span className="text-[6px] bg-red-600 text-stone-900 px-1 py-0.5 rounded leading-none">DIS</span>}
                                          <span className="text-xs">+{profBonus + Math.max(mods.STR, mods.DEX)}</span>
                                        </div>
                                     </button>
                                     <button disabled={turnActions.bonus} onClick={() => rollDice(4, Math.max(mods.STR, mods.DEX), `Unarmed Dmg`)} className="flex-1 py-2 bg-red-900/10 text-red-700 border border-red-900/20 rounded-lg text-[9px] font-black uppercase transition-all hover:bg-red-800 hover:text-stone-100 flex justify-between items-center px-3">
                                        <span className="opacity-70">DMG</span>
                                        <span className="text-xs">1d4</span>
                                     </button>
                                  </div>
                               </div>
                            );
                         }
                         return null;
                      })}
                   </div>
                 )}

                 {subTab === "REACTIONS" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                      <div className={`bg-stone-50 border border-amber-900/10 p-4 rounded-[21px] transition-all group flex flex-col relative w-full overflow-hidden ${turnActions.reaction ? 'opacity-40 grayscale pointer-events-none' : 'hover:border-amber-800/30'}`}>
                          <div className="flex items-center gap-3 mb-4 w-full">
                             <div className="w-10 h-10 bg-stone-100 rounded-lg border border-amber-900/20 flex items-center justify-center text-lg text-stone-500 group-hover:text-amber-700 transition-colors shrink-0"><Zap className="w-5 h-5" /></div>
                             <div className="min-w-0 pr-2 flex-1 text-left">
                                <h4 className="text-[13px] font-black text-stone-900 uppercase tracking-tight leading-tight block truncate">Opportunity Attack</h4>
                                <span className="text-[8px] text-stone-500 font-bold uppercase tracking-widest">Melee Reaction</span>
                             </div>
                          </div>
                          <p className="text-[9px] text-stone-600 mb-4 px-1 leading-relaxed">Gunakan saat musuh mencoba keluar dari jarak serangmu tanpa melakukan tindakan Disengage.</p>
                          <div className="flex gap-2">
                             <button disabled={turnActions.reaction} onClick={() => { rollDice(20, profBonus + (mods?.STR || 0), `Opp. Attack`); toggleTurnAction('reaction'); }} className="flex-1 py-2 bg-amber-900/10 text-amber-700 border border-amber-900/20 rounded-lg text-[9px] font-black uppercase transition-all hover:bg-amber-800 hover:text-stone-100 flex justify-between items-center px-3">
                                <span className="opacity-70">ATK</span>
                                <div className="flex items-center gap-1">
                                  {attackHasDisadv && <span className="text-[6px] bg-red-600 text-stone-900 px-1 py-0.5 rounded leading-none">DIS</span>}
                                  <span className="text-xs">+{profBonus + (mods?.STR || 0)}</span>
                                </div>
                             </button>
                             <button disabled={turnActions.reaction} onClick={() => rollDice(4, (mods?.STR || 0), `Opp. Dmg`)} className="flex-1 py-2 bg-red-900/10 text-red-700 border border-red-900/20 rounded-lg text-[9px] font-black uppercase transition-all hover:bg-red-800 hover:text-stone-100 flex justify-between items-center px-3">
                                <span className="opacity-70">DMG</span>
                                <span className="text-xs text-right truncate">Weapon</span>
                             </button>
                          </div>
                      </div>
                   </div>
                 )}
              </motion.div>
            )}
            
            {/* SPELLS TAB */}
            {activeTab === "SPELLS" && (
               <SpellTabContent 
                  character={character} currentLevel={currentLevel} spellSaveDC={spellSaveDC} spellAttack={spellAttack} 
                  usedSlots={usedSlots} setUsedSlots={setUsedSlots} turnActions={turnActions} toggleTurnAction={toggleTurnAction} rollDice={rollDice} 
               />
            )}
            
            {/* INVENTORY TAB */}
            {activeTab === "INVENTORY" && (
               <motion.div key="inv" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 w-full">
                  <div className="bg-stone-100 border border-amber-900/10 p-4 rounded-3xl w-full">
                     <span className="text-[8px] font-black text-stone-500 uppercase tracking-widest block mb-3">Treasury Manager</span>
                     <div className="grid grid-cols-5 gap-2 w-full">
                        {[{l:'PP',c:'text-slate-200',bg:'bg-slate-200',k:'pp'},{l:'GP',c:'text-yellow-500',bg:'bg-yellow-500',k:'gp'},{l:'EP',c:'text-amber-600',bg:'bg-amber-600',k:'ep'},{l:'SP',c:'text-stone-600',bg:'bg-slate-400',k:'sp'},{l:'CP',c:'text-orange-500',bg:'bg-orange-500',k:'cp'}].map(coin => (
                          <div key={coin.l} className="bg-stone-100 border border-amber-900/10 p-2 rounded-xl text-center relative overflow-hidden flex flex-col items-center">
                             <div className={`absolute top-0 w-full h-0.5 ${coin.bg} opacity-50`} />
                             <span className={`text-sm font-black ${coin.c} mt-1`}>{currency[coin.k] || 0}</span>
                             <span className="text-[7px] font-black text-stone-400 uppercase mt-0.5 mb-2">{coin.l}</span>
                             <div className="flex gap-1 w-full px-1">
                               <button onClick={() => updateCurrency(coin.k, -1)} className="flex-1 bg-stone-200 hover:bg-red-900/50 text-[8px] rounded text-stone-500">-</button>
                               <button onClick={() => updateCurrency(coin.k, 1)} className="flex-1 bg-stone-200 hover:bg-green-900/50 text-[8px] rounded text-stone-500">+</button>
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>
                  <div className="w-full">
                    <div className="flex gap-2 mb-3 w-full">
                      <input value={newItemInput} onChange={e=>setNewItemInput(e.target.value)} placeholder="Nama Barang..." className="flex-1 bg-stone-100 border border-amber-900/20 rounded-lg px-3 py-1.5 text-[10px] text-stone-900 outline-none focus:border-amber-800" />
                      <button onClick={addItem} className="bg-amber-800 text-stone-900 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase shadow-lg active:scale-95 shrink-0">Add</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full overflow-hidden">
                       {invItems.map((item: string, i: number) => {
                         const isEq = eqItems.includes(item);
                         const isWeap = parseWeapon(item); 
                         return (
                           <div key={i} className={`bg-stone-100 p-2.5 rounded-xl border flex justify-between items-center transition-all w-full overflow-hidden ${isEq ? 'border-amber-800/50 shadow-sm' : 'border-amber-900/10'}`}>
                              <div className="flex items-center gap-3 text-left w-full flex-1 min-w-0 pr-2">
                                <span className={`text-[10px] font-black uppercase tracking-widest truncate ${isEq ? 'text-amber-700' : 'text-stone-700'}`}>{item}</span>
                                {isWeap && <span className="text-[6px] bg-red-900/30 text-red-400 px-1.5 py-0.5 rounded border border-red-500/30 uppercase tracking-widest shrink-0">Weapon</span>}
                              </div>
                              <button onClick={() => toggleEquip(item)} className={`text-[8px] font-black uppercase px-2 py-1 rounded transition-colors shrink-0 ${isEq ? 'bg-amber-100 text-amber-800 border border-amber-800/50' : 'bg-stone-100 text-stone-500 border border-amber-900/10 hover:text-stone-900'}`}>{isEq ? 'Equipped' : 'Equip'}</button>
                           </div>
                         );
                       })}
                    </div>
                  </div>
               </motion.div>
            )}

            {/* FEATURES TAB */}
            {activeTab === "FEATURES" && (
               <FeatureTabContent character={character} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};