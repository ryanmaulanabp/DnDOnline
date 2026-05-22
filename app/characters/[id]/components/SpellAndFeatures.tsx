"use client";
import { motion } from "framer-motion";
import { Tooltip } from "./HeroModules";

// --- LORE DATABASES & PARSERS ---
const TRAIT_LORE: Record<string, string> = {
  "Darkvision": "Mampu melihat dalam kegelapan 60ft seolah-olah terang.",
  "Fey Ancestry": "Advantage melawan sihir pesona (Charmed), tidak bisa ditidurkan sihir.",
  "Action Surge": "Memberikan satu Action ekstra di giliranmu.",
  "Second Wind": "Gunakan Bonus Action untuk heal 1d10 + Lvl HP.",
  "Sneak Attack": "Tambahan damage saat memiliki advantage.",
  "Rage": "Bonus damage, resistance terhadap serangan fisik.",
  "Uncanny Dodge": "Menggunakan Reaction untuk memotong damage menjadi setengah."
};

const SPELL_LORE: Record<string, { desc: string, time: string, range: string, damage: string, vsm: string }> = {
  "Eldritch Blast": { desc: "Tembakan energi magis gelap yang mematikan.", time: "1 Action", range: "120 ft", damage: "1d10 Force", vsm: "V, S" },
  "Fireball": { desc: "Ledakan api masif radius 20ft (DEX Save atau hangus).", time: "1 Action", range: "150 ft", damage: "8d6 Fire", vsm: "V, S, M" },
  "Cure Wounds": { desc: "Sentuhan ajaib penyembuh luka daging.", time: "1 Action", range: "Touch", damage: "1d8+Mod Heal", vsm: "V, S" },
  "Healing Word": { desc: "Penyembuhan jarak jauh dengan suara magis.", time: "1 Bonus", range: "60 ft", damage: "1d4+Mod Heal", vsm: "V" },
  "Shield": { desc: "Perisai gaib yang langsung menaikkan +5 AC saat diserang.", time: "1 Reaction", range: "Self", damage: "None", vsm: "V, S" },
  "Magic Missile": { desc: "Tiga proyektil ajaib yang pasti mengenai target.", time: "1 Action", range: "120 ft", damage: "3x 1d4+1 Force", vsm: "V, S" },
  "Mage Armor": { desc: "Selimut magis yang melindungi tubuh tanpa zirah.", time: "1 Action", range: "Touch", damage: "None", vsm: "V, S, M" },
  "Acid Splash": { desc: "Lemparan gelembung asam ke 1 atau 2 target.", time: "1 Action", range: "60 ft", damage: "1d6 Acid", vsm: "V, S" },
  "Fire Bolt": { desc: "Lontaran api yang membakar benda yang dikenainya.", time: "1 Action", range: "120 ft", damage: "1d10 Fire", vsm: "V, S" },
  "Mage Hand": { desc: "Tangan hantu melayang untuk memanipulasi objek.", time: "1 Action", range: "30 ft", damage: "None", vsm: "V, S" },
  "Burning Hands": { desc: "Semburan api dari tangan berbentuk kerucut.", time: "1 Action", range: "15ft Cone", damage: "3d6 Fire", vsm: "V, S" },
  "Chromatic Orb": { desc: "Bola energi dengan elemen pilihanmu.", time: "1 Action", range: "90 ft", damage: "3d8 Varies", vsm: "V, S, M" },
  "Detect Magic": { desc: "Merasakan aura sihir di sekitarmu (Durasi 10 Menit).", time: "1 Action", range: "30 ft", damage: "None", vsm: "V, S" },
  "Comprehend Languages": { desc: "Mengerti bahasa tertulis dan lisan apa pun.", time: "1 Action", range: "Self", damage: "None", vsm: "V, S, M" }
};

export const getTraitDesc = (trait: string) => {
  const t = Object.keys(TRAIT_LORE).find(k => trait.toLowerCase().includes(k.toLowerCase()));
  return t ? TRAIT_LORE[t] : "Kemampuan unik yang berasal dari DNA ras atau latihan keras dari class karaktermu.";
};

export const getSpellDesc = (spell: string) => {
  const s = Object.keys(SPELL_LORE).find(k => spell.toLowerCase().includes(k.toLowerCase()));
  return s ? SPELL_LORE[s] : { desc: "Energi sihir ditarik dari The Weave untuk merubah realita.", time: "1 Action", range: "Varies", damage: "Varies", vsm: "V, S" };
};

// --- COMPONENT: SPELL TAB ---
export const SpellTabContent = ({ character, currentLevel, spellSaveDC, spellAttack, usedSlots, setUsedSlots, turnActions, toggleTurnAction, rollDice }: any) => (
  <motion.div key="spl" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 w-full">
    <div className="grid grid-cols-2 gap-4 w-full">
        {/* PERBAIKAN: Tooltip Custom Arah BAWAH agar tidak terpotong Scroll-Area */}
        <div className="relative group/top-tooltip w-full h-full cursor-help z-50">
          <div className="w-full bg-slate-700/10 border border-slate-500/20 p-4 rounded-[21px] text-center">
            <span className="text-[8px] font-black text-stone-400 uppercase tracking-[0.2em] block mb-1">Spell Save DC</span>
            <span className="text-3xl font-black text-stone-900">{spellSaveDC}</span>
          </div>
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 opacity-0 group-hover/top-tooltip:opacity-100 transition-opacity duration-300 pointer-events-none z-[999] whitespace-normal w-max max-w-[200px] text-center bg-stone-900/95 border border-stone-600 text-stone-100 px-3 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest shadow-xl backdrop-blur-md">
            Nilai target (DC) yang harus dilewati musuh saat melakukan Saving Throw untuk menghindari sihirmu.
          </div>
        </div>

        {/* PERBAIKAN: Tooltip Custom Arah BAWAH agar tidak terpotong Scroll-Area */}
        <div className="relative group/top-tooltip w-full h-full cursor-help z-50">
          <div className="w-full bg-slate-700/10 border border-slate-500/20 p-4 rounded-[21px] text-center">
            <span className="text-[8px] font-black text-stone-400 uppercase tracking-[0.2em] block mb-1">Spell Attack</span>
            <span className="text-3xl font-black text-stone-900">+{spellAttack}</span>
          </div>
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 opacity-0 group-hover/top-tooltip:opacity-100 transition-opacity duration-300 pointer-events-none z-[999] whitespace-normal w-max max-w-[200px] text-center bg-stone-900/95 border border-stone-600 text-stone-100 px-3 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest shadow-xl backdrop-blur-md">
            Angka bonus yang ditambahkan ke dadu d20 saat kamu menembakkan serangan sihir.
          </div>
        </div>
    </div>
    {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(lvl => {
        const maxSlotsForLvl = lvl === "1" ? (currentLevel >= 1 ? 4 : 0) : lvl === "2" ? (currentLevel >= 3 ? 3 : 0) : lvl === "3" ? (currentLevel >= 5 ? 2 : 0) : 0;
        if (maxSlotsForLvl === 0) return null;
        return (
          <div key={lvl} className="bg-stone-100 border border-amber-900/10 p-5 rounded-[21px] mb-6 w-full overflow-hidden">
            <div className="flex justify-between items-center mb-4 border-b border-amber-900/10 pb-3">
                <span className="text-[9px] font-black text-stone-600 uppercase tracking-widest">Level {lvl} Slots</span>
                <div className="flex gap-2">
                  {Array.from({ length: maxSlotsForLvl }).map((_, i) => (
                    <button key={i} onClick={() => setUsedSlots((prev: any) => ({...prev, [lvl]: i <= prev[lvl] ? i-1 : i}))} className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all text-[10px] ${i > (usedSlots[lvl]||0) ? 'border-amber-500 bg-amber-500/20 text-amber-700 shadow-[0_0_10px_rgba(245,158,11,0.4)]' : 'border-stone-300 bg-stone-100 text-slate-800'}`}>{i > (usedSlots[lvl]||0) ? '✨' : '✕'}</button>
                  ))}
                </div>
            </div>
            
            <div className="flex flex-col gap-1.5 w-full">
                {character.spells?.map((s: string, i: number) => {
                  const lore = getSpellDesc(s);
                  const isBonusSpell = lore.time.includes("Bonus");
                  const isReactionSpell = lore.time.includes("Reaction");
                  const isLocked = (isBonusSpell && turnActions.bonus) || (isReactionSpell && turnActions.reaction) || (!isBonusSpell && !isReactionSpell && turnActions.action);
                  
                  return (
                    <Tooltip key={i} text={lore.desc}>
                        <div onClick={() => { 
                          if(!isLocked) { 
                            rollDice(20, spellAttack, `Casting ${s}`); 
                            if (isBonusSpell) toggleTurnAction('bonus'); else if (isReactionSpell) toggleTurnAction('reaction'); else toggleTurnAction('action');
                          } 
                        }} className={`bg-stone-100/40 border border-amber-900/10 px-4 py-2.5 rounded-xl flex justify-between items-center transition-all w-full text-left ${isLocked ? 'opacity-40 grayscale cursor-not-allowed' : 'cursor-pointer hover:border-slate-500 group'}`}>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full">
                              <span className="text-[11px] font-black text-stone-700 group-hover:text-stone-900 uppercase tracking-widest sm:w-[150px] truncate shrink-0">{s}</span>
                              
                              <div className="flex flex-wrap gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border whitespace-nowrap shrink-0 ${isBonusSpell ? 'bg-orange-900/20 text-orange-600 border-orange-500/20' : isReactionSpell ? 'bg-amber-900/20 text-amber-700 border-amber-900/20' : 'bg-slate-700/10 text-stone-400 border-slate-500/20'}`}>{lore.time}</span>
                                <span className="text-[8px] font-black text-stone-600 bg-stone-200 px-1.5 py-0.5 rounded border border-amber-900/20 whitespace-nowrap shrink-0">{lore.range}</span>
                                <span className="text-[8px] font-black text-amber-700 bg-amber-900/10 px-1.5 py-0.5 rounded border border-amber-700/20 whitespace-nowrap shrink-0">{lore.vsm}</span>
                                {lore.damage !== "None" && (
                                  <span className="text-[8px] font-black text-red-400 bg-red-900/20 px-1.5 py-0.5 rounded border border-red-500/20 whitespace-nowrap shrink-0">{lore.damage}</span>
                                )}
                              </div>
                          </div>
                          <span className="text-sm text-stone-500 group-hover:text-stone-600 transition-colors shrink-0 ml-2">→</span>
                        </div>
                    </Tooltip>
                  );
                })}
            </div>
          </div>
        );
    })}
  </motion.div>
);

// --- COMPONENT: FEATURE TAB ---
export const FeatureTabContent = ({ character }: any) => (
  <motion.div key="feat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 w-full">
    <div className="w-full overflow-hidden">
        <span className="text-[9px] font-black text-amber-800 uppercase tracking-widest block mb-3">Innate Traits & Background</span>
        <div className="space-y-2 w-full">
          {character.features?.map((f: string, i: number) => (
              <div key={i} className="bg-stone-100 p-4 rounded-2xl border border-amber-900/10 w-full overflow-hidden">
                <span className="text-[10px] font-black text-stone-900 uppercase tracking-widest mb-1 block truncate">{f}</span>
                <p className="text-[9px] text-stone-600 leading-relaxed font-medium">{getTraitDesc(f)}</p>
              </div>
          ))}
        </div>
    </div>
    {character.feats && character.feats.length > 0 && (
        <div className="w-full overflow-hidden">
          <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest block mb-3">Acquired Feats</span>
          <div className="space-y-2 w-full">
              {character.feats.map((f: any, i: number) => (
                <div key={`feat-${i}`} className="bg-amber-900/10 p-4 rounded-2xl border border-amber-700/20 w-full overflow-hidden">
                    <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1 block truncate">{f.name}</span>
                    <p className="text-[9px] text-stone-600 font-medium">{f.desc}</p>
                </div>
              ))}
          </div>
        </div>
    )}
    <div className="w-full">
        <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest block mb-3">Personality DNA</span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
          {[{ l: "Traits", v: character.roleplay?.traits }, { l: "Ideals", v: character.roleplay?.ideals }, { l: "Bonds", v: character.roleplay?.bonds }, { l: "Flaws", v: character.roleplay?.flaws }].map((rp, i) => (
            <div key={i} className="p-4 rounded-2xl border border-amber-900/10 bg-stone-200/20 w-full">
                <span className="text-[8px] font-black text-stone-500 uppercase tracking-[0.2em] mb-2 block">{rp.l}</span>
                <p className="text-[10px] font-medium text-stone-700 italic">"{rp.v || 'Not specified'}"</p>
            </div>
          ))}
        </div>
    </div>
  </motion.div>
);