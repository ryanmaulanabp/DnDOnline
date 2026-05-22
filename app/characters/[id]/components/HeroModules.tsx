"use client";
import { motion } from "framer-motion";

export const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <div className="relative group/tooltip flex items-center justify-center w-full h-full cursor-help">
    {children}
    <div className="absolute bottom-full mb-2 opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-300 pointer-events-none z-[999] whitespace-normal max-w-[200px] text-center bg-stone-900/95 border border-stone-600 text-stone-100 px-3 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest shadow-xl backdrop-blur-md">
      {text}
    </div>
  </div>
);

export const IconShield = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
export const IconSword = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M6 3l-1.5 1.5 4.5 4.5-1.5 1.5L3 6 1.5 7.5 7.5 13.5l12-12L6 3zm6 9l1.5-1.5L21 21l-3 3-7.5-7.5L12 12z"/></svg>;
export const IconMagic = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M2.5 18.5l3-3 1.5 1.5-3 3-1.5-1.5zM6 15l1.5-1.5 1.5 1.5L6 18l-1.5-1.5zM20.5 3.5l-9 9-3-3 9-9 3 3z"/></svg>;

export const SKILL_MAP: Record<string, { stat: string; desc: string }> = {
  "Acrobatics": { stat: "DEX", desc: "Keseimbangan dan kegesitan" }, "Animal Handling": { stat: "WIS", desc: "Menenangkan hewan liar" }, "Arcana": { stat: "INT", desc: "Pengetahuan sihir dan benda mistis" }, "Athletics": { stat: "STR", desc: "Kekuatan fisik dan atletik" }, "Deception": { stat: "CHA", desc: "Tipu daya dan menyembunyikan kebenaran" }, "History": { stat: "INT", desc: "Mengingat sejarah masa lalu" }, "Insight": { stat: "WIS", desc: "Membaca niat dan mendeteksi kebohongan" }, "Intimidation": { stat: "CHA", desc: "Ancaman dan intimidasi" }, "Investigation": { stat: "INT", desc: "Mencari petunjuk dan deduksi logis" }, "Medicine": { stat: "WIS", desc: "Menstabilkan luka dan medis" }, "Nature": { stat: "INT", desc: "Pengetahuan alam liar" }, "Perception": { stat: "WIS", desc: "Kewaspadaan panca indera" }, "Performance": { stat: "CHA", desc: "Seni pertunjukan" }, "Persuasion": { stat: "CHA", desc: "Bujuk rayu diplomasi" }, "Religion": { stat: "INT", desc: "Pengetahuan dewa dan agama" }, "Sleight of Hand": { stat: "DEX", desc: "Trik tangan dan copet" }, "Stealth": { stat: "DEX", desc: "Sembunyi dan menyelinap" }, "Survival": { stat: "WIS", desc: "Bertahan hidup dan melacak" }
};

export const CONDITIONS_LORE: Record<string, { icon: string; desc: string }> = {
  "Blinded": { icon: "EYE", desc: "Gagal cek visual otomatis. Disadvantage serangan. Musuh memiliki advantage." }, "Charmed": { icon: "CHM", desc: "Tidak bisa menyerang pemikat. Pemikat memiliki advantage membujukmu." }, "Deafened": { icon: "DEF", desc: "Gagal cek pendengaran otomatis." }, "Frightened": { icon: "FRT", desc: "Disadvantage saat sumber ketakutan terlihat. Tidak berani mendekat." }, "Grappled": { icon: "GRP", desc: "Speed berkurang menjadi 0." }, "Invisible": { icon: "INV", desc: "Sangat sulit dilihat. Kamu memiliki advantage menyerang, musuh disadvantage." }, "Paralyzed": { icon: "PAR", desc: "Lumpuh. Auto-Fail STR/DEX saves. Hit jarak dekat otomatis Critical!" }, "Poisoned": { icon: "PSN", desc: "Merasa sangat sakit. Disadvantage pada serangan dan check." }, "Prone": { icon: "PRN", desc: "Tiarap. Musuh melee memiliki advantage. Hanya bisa merangkak." }, "Restrained": { icon: "RST", desc: "Terikat kuat. Speed 0. Disadvantage serangan dan DEX save." }, "Stunned": { icon: "STN", desc: "Linglung. Gagal otomatis STR/DEX saves." }, "Unconscious": { icon: "UNC", desc: "Pingsan. Auto-Fail STR/DEX saves. Serangan musuh otomatis critical." }
};

export const AttributeMatrix = ({ character, mods, rollDice, formatMod, activeConditions, exhaustion }: any) => {
  const hasDisadv = activeConditions.includes("Poisoned") || activeConditions.includes("Frightened") || exhaustion >= 1;
  
  // Database SVG & Warna Murni, PASTI BISA DI-RENDER
  const STAT_SHAPES: any = {
    STR: "M16 2 L30 9 L30 23 L16 30 L2 23 L2 9 Z", // Hexagon
    DEX: "M16 2 L30 28 L2 28 Z", // Triangle
    CON: "M4 4 h24 v24 h-24 Z", // Square
    INT: "M16 2 L30 16 L16 30 L2 16 Z", // Diamond
    WIS: "M16 2 L30 12 L24 28 L8 28 L2 12 Z", // Pentagon
    CHA: "M16 2 L30 10 L16 30 L2 10 Z", // Kite/Gem
  };
  const STAT_COLORS: any = {
    STR: "#dc2626", // Red 600
    DEX: "#ea580c", // Orange 600
    CON: "#16a34a", // Green 600
    INT: "#2563eb", // Blue 600
    WIS: "#0d9488", // Teal 600
    CHA: "#ca8a04", // Yellow 600
  };
  // Koreksi posisi angka ke tengah mengikuti pusat gravitasi bangun datar
  const STAT_OFFSETS: any = { STR: "", DEX: "mt-2.5", CON: "", INT: "", WIS: "mt-0.5", CHA: "-mt-1" };

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-3 my-6">
      {(["STR", "DEX", "CON", "INT", "WIS", "CHA"] as const).map((s) => (
        <Tooltip key={s} text={`Atribut inti. Menentukan seberapa kuat, lincah, atau pintar karaktermu. Klik untuk melempar cek ${s}.`}>
          <motion.div whileHover={{ y: -5, scale: 1.02, boxShadow: `0 10px 25px -5px ${STAT_COLORS[s]}40`, borderColor: STAT_COLORS[s] }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="w-full bg-white border border-amber-900/20 p-3 rounded-2xl flex flex-col items-center shadow-lg group relative overflow-hidden transition-colors">
            <div className="absolute -inset-10 opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-2xl pointer-events-none rounded-full" style={{ backgroundColor: STAT_COLORS[s] }} />
            <span className="text-[9px] font-black text-stone-500 uppercase tracking-widest mb-2 relative z-10">{s}</span>
            
            {/* WADAH DADU - Menggunakan SVG Background */}
            <div onClick={() => rollDice(20, mods[s], `${s} Check`)} className="relative w-14 h-14 flex items-center justify-center mb-2 cursor-pointer group/stat transition-all active:scale-90">
              <svg viewBox="0 0 32 32" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full drop-shadow-md transition-all duration-300 group-hover/stat:drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]">
                 <path 
                   d={STAT_SHAPES[s]}
                   fill="#f5f5f4"
                   stroke={STAT_COLORS[s]}
                   strokeWidth="1.5"
                   strokeLinejoin="round"
                   className="group-hover/stat:fill-[#e7e5e4] transition-colors duration-300"
                 />
              </svg>
              
              {hasDisadv && <div className="absolute -top-1 -right-1 bg-red-600 text-[6px] font-black px-1 rounded text-stone-900 z-20 shadow-md">DIS</div>}
              
              {/* Teks Angka yang Dipusatkan Sempurna */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <span className={`relative z-10 text-xl font-black text-stone-900 tracking-tighter ${STAT_OFFSETS[s]}`}>
                   {formatMod(mods[s])}
                 </span>
              </div>
            </div>

            <div className="text-center w-full">
               <span className="text-[10px] font-bold text-stone-500 block">{character.stats[s]} Base</span>
               <button onClick={() => rollDice(20, mods[s], `${s} Save`)} className="text-[7px] font-black text-stone-500 hover:text-stone-900 uppercase tracking-widest mt-1 w-full text-center transition-colors">Save</button>
            </div>
          </motion.div>
        </Tooltip>
      ))}
    </div>
  );
};

export const SkillPanel = ({ character, mods, profBonus, rollDice, formatMod, getSkillBonus, deathSaves, updateDeathSave, hitDiceUsed, setHitDiceUsed, exhaustion, setExhaustion, activeSpeed, activeConditions, currentLevel }: any) => {
  const isSpeedImpaired = activeSpeed < character.speed;
  const hasGlobalDisadv = activeConditions.includes("Poisoned") || activeConditions.includes("Frightened") || exhaustion >= 1;
  
  // Deteksi Alasan Speed Berkurang
  let speedAlert = "";
  if (activeConditions.includes("Grappled")) speedAlert = "(Grappled)";
  else if (activeConditions.includes("Restrained")) speedAlert = "(Restrained)";
  else if (exhaustion >= 5) speedAlert = "(Exhausted)";
  else if (activeConditions.includes("Paralyzed") || activeConditions.includes("Stunned") || activeConditions.includes("Unconscious")) speedAlert = "(Incapacitated)";
  else if (exhaustion >= 2) speedAlert = "(Halved)";

  return (
    <div className="lg:col-span-3 space-y-4 flex flex-col">
      {/* Vitals */}
      <div className="grid grid-cols-2 gap-3">
         <Tooltip text="Armor Class (AC): Angka yang harus dilewati musuh saat melempar D20 untuk bisa melukaimu.">
           <div className="w-full bg-white border border-amber-900/20 p-3 rounded-2xl text-center group">
              <span className="text-[8px] font-black text-amber-800 uppercase tracking-widest block mb-1 flex justify-center items-center gap-1"><IconShield /> Armor</span>
              <span className="text-2xl font-black text-stone-900">{character.armorClass}</span>
           </div>
         </Tooltip>
         <Tooltip text="Initiative: Lempar D20 + DEX saat pertempuran dimulai untuk menentukan urutan gerak.">
           <div onClick={() => rollDice(20, mods.DEX, "Initiative")} className="w-full bg-white border border-amber-900/20 p-3 rounded-2xl text-center cursor-pointer hover:border-amber-800 transition-all group">
              <span className="text-[8px] font-black text-stone-500 uppercase tracking-widest block mb-1 group-hover:text-amber-700">⚡ Init</span>
              <span className="text-2xl font-black text-stone-900">{formatMod(mods.DEX)}</span>
           </div>
         </Tooltip>
      </div>

      {/* Speed, Death Saves, Exhaustion */}
      <div className="bg-white border border-amber-900/20 p-4 rounded-[21px] shadow-lg">
         <div className="flex justify-between items-center mb-3 border-b border-amber-900/10 pb-3">
            <Tooltip text="Jarak gerak maksimum (feet). Kondisi seperti Grappled atau kelelahan level 5 akan membuat ini 0.">
              <div className="text-left w-full cursor-help">
                 <span className="text-[8px] font-black text-stone-500 uppercase tracking-widest block mb-1">Speed</span>
                 <div className="flex items-baseline gap-1">
                    <span className={`text-lg font-black ${isSpeedImpaired ? 'text-red-500 animate-pulse' : 'text-stone-900'}`}>{activeSpeed}<span className="text-[10px] text-stone-400 ml-1">ft</span></span>
                    {speedAlert && <span className="text-[8px] font-black text-red-500 uppercase">{speedAlert}</span>}
                 </div>
              </div>
            </Tooltip>
            <Tooltip text="Dadu penyembuh untuk dipakai saat Short Rest. Pemulihan harian: Setengah total dadumu.">
              <div className="text-right w-full cursor-help">
                 <span className="text-[8px] font-black text-stone-500 uppercase tracking-widest block mb-1">Hit Dice (1d{character.class.toLowerCase().includes('barbarian') ? '12' : '10'})</span>
                 <div className="flex gap-1 justify-end mt-1">
                   {Array.from({ length: currentLevel }).map((_, i) => (
                     <div key={i} onClick={() => setHitDiceUsed(i <= hitDiceUsed ? i-1 : i)} className={`w-5 h-5 rounded border cursor-pointer transition-all flex items-center justify-center text-[8px] ${i > hitDiceUsed ? 'border-emerald-700/50 bg-emerald-700/10 text-emerald-700' : 'border-stone-300 bg-stone-100 text-slate-800'}`}>{i > hitDiceUsed ? '✚' : '✕'}</div>
                   ))}
                 </div>
              </div>
            </Tooltip>
         </div>
         
         <div className="mb-4 pb-4 border-b border-amber-900/10">
           <h3 className="text-[9px] font-black text-red-500 uppercase tracking-[0.2em] mb-3">Death Saves</h3>
           <div className="space-y-2">
              <Tooltip text="Mendapat angka 10-20 pada d20. Tiga sukses = karakter stabil (tidak mati).">
                <div className="flex justify-between items-center bg-stone-100 p-2 rounded-lg border border-amber-900/10 cursor-help">
                  <span className="text-[8px] font-black text-stone-500 uppercase tracking-widest">Successes</span>
                  <div className="flex gap-2">{[1, 2, 3].map(i => <div key={i} onClick={() => updateDeathSave('success')} className={`w-4 h-4 rounded-full border-2 cursor-pointer transition-all ${i <= deathSaves.success ? 'bg-amber-800 border-amber-700' : 'border-stone-300'}`} />)}</div>
                </div>
              </Tooltip>
              <Tooltip text="Mendapat angka 1-9 pada d20. Tiga gagal = karakter MATI SELAMANYA.">
                <div className="flex justify-between items-center bg-stone-100 p-2 rounded-lg border border-amber-900/10 cursor-help">
                  <span className="text-[8px] font-black text-stone-500 uppercase tracking-widest">Failures</span>
                  <div className="flex gap-2">{[1, 2, 3].map(i => <div key={i} onClick={() => updateDeathSave('fail')} className={`w-4 h-4 rounded-full border-2 cursor-pointer transition-all ${i <= deathSaves.fail ? 'bg-red-600 border-red-500' : 'border-stone-300'}`} />)}</div>
                </div>
              </Tooltip>
           </div>
         </div>
         <div>
           <h3 className="text-[9px] font-black text-orange-500 uppercase tracking-[0.2em] mb-2 flex justify-between">Exhaustion Level <span className="text-stone-900 font-bold">{exhaustion}/6</span></h3>
           <div className="flex gap-1">
             {[1, 2, 3, 4, 5, 6].map(i => (
               <Tooltip key={i} text={i===1?"Lvl 1: Disadv Ability Checks":i===2?"Lvl 2: Speed Dibagi Dua":i===3?"Lvl 3: Disadv Attack/Saves":i===4?"Lvl 4: Max HP Dibagi Dua":i===5?"Lvl 5: Speed Menjadi 0":"Lvl 6: KEMATIAN!"}>
                 <div onClick={() => setExhaustion(i <= exhaustion ? i-1 : i)} className={`flex-1 h-3 rounded-sm border cursor-pointer transition-all ${i <= exhaustion ? (i >= 5 ? 'bg-red-600 border-red-400 animate-pulse' : 'bg-orange-500 border-orange-400') : 'bg-stone-100 border-stone-300'}`} />
               </Tooltip>
             ))}
           </div>
         </div>
      </div>

      {/* SKILL MASTERY */}
      <div className="bg-white border border-amber-900/20 rounded-[21px] shadow-lg flex flex-col flex-1 overflow-hidden max-h-[500px]">
         <div className="p-3 bg-stone-100 border-b border-amber-900/20 flex justify-between items-center sticky top-0 z-10">
            <h3 className="text-[9px] font-black text-stone-600 uppercase tracking-[0.3em]">Skills Mastery</h3>
            <span className="text-[8px] text-amber-800">+{profBonus} Base</span>
         </div>
         <div className="overflow-y-auto custom-scrollbar flex flex-col">
            {Object.entries(SKILL_MAP).map(([skill, data]) => {
              const isProf = character.proficientSkills.includes(skill);
              const bonus = getSkillBonus(skill);
              return (
                <Tooltip key={skill} text={data.desc}>
                  <motion.div whileHover={{ x: 6, backgroundColor: 'rgba(59,130,246,0.05)' }} whileTap={{ scale: 0.98 }} onClick={() => rollDice(20, bonus, skill)} className={`w-full flex items-center justify-between px-4 py-[7px] cursor-pointer group transition-all border-b border-amber-900/10 last:border-0 relative overflow-hidden ${isProf ? 'bg-stone-800/10 border-l-2 border-l-amber-800' : 'border-l-2 border-l-transparent'}`}>
                     {isProf && <div className="absolute inset-0 bg-gradient-to-r from-amber-800/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />}
                     <div className="flex items-center gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full ${isProf ? 'bg-amber-800 shadow-[0_0_5px_rgba(59,130,246,0.6)]' : 'bg-slate-700'}`} />
                        <span className={`text-[10px] font-bold ${isProf ? 'text-stone-900' : 'text-stone-600'} group-hover:text-amber-600 uppercase tracking-wider`}>{skill}</span>
                        {hasGlobalDisadv && <span className="text-[5px] bg-red-600 text-stone-900 px-1 rounded">DIS</span>}
                     </div>
                     <div className="flex items-center gap-3">
                        <span className="text-[6px] font-black text-stone-400 uppercase w-4 text-center">{data.stat}</span>
                        <span className={`text-xs font-black ${isProf ? 'text-amber-700' : 'text-stone-500'}`}>{formatMod(bonus)}</span>
                     </div>
                  </motion.div>
                </Tooltip>
              );
            })}
         </div>
      </div>
    </div>
  );
};

export const CombatLogPanel = ({ combatLog, activeConditions, toggleCondition }: any) => (
  <div className="lg:col-span-3 flex flex-col gap-6 h-full max-h-[800px]">
    
    <div className="bg-white border border-amber-900/20 rounded-[21px] p-5 shadow-xl shrink-0 w-full">
       <div className="flex justify-between items-center mb-4 pb-3 border-b border-amber-900/10">
          <h3 className="text-[9px] font-black text-stone-600 uppercase tracking-[0.4em]">Active Conditions</h3>
          <span className="text-[9px] font-bold text-stone-500">{activeConditions.length} Active</span>
       </div>
       
       <div className="grid grid-cols-2 gap-2 mb-2 w-full">
          {Object.keys(CONDITIONS_LORE).map(c => {
             const isActive = activeConditions.includes(c);
             return (
               <div key={c} className="w-full flex">
                 <Tooltip text={CONDITIONS_LORE[c].desc}>
                   <button onClick={() => toggleCondition(c)} className={`w-full flex-1 px-2 py-2 rounded-lg text-[8px] lg:text-[9px] font-black uppercase tracking-widest transition-all border flex items-center justify-between gap-1 ${isActive ? 'bg-red-600/20 text-red-500 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-stone-100 text-stone-400 border-amber-900/10 hover:border-slate-400'}`}>
                     <span className="truncate text-left">{c}</span>
                     {isActive && <span className="shrink-0">{CONDITIONS_LORE[c].icon}</span>}
                   </button>
                 </Tooltip>
               </div>
             );
          })}
       </div>
       
       {activeConditions.length > 0 && (
         <div className="mt-4 space-y-2 border-t border-amber-900/10 pt-4">
            {activeConditions.map((c: string) => (
              <div key={`desc-${c}`} className="flex items-start gap-3 bg-red-950/20 p-3 rounded-xl border border-red-900/30">
                 <span className="text-lg">{CONDITIONS_LORE[c].icon}</span>
                 <div>
                    <span className="text-[9px] font-black text-red-400 uppercase tracking-widest block mb-0.5">{c}</span>
                    <p className="text-[10px] text-stone-600 leading-tight font-medium">{CONDITIONS_LORE[c].desc}</p>
                 </div>
              </div>
            ))}
         </div>
       )}
    </div>
    
    <div className="bg-white border border-amber-900/20 rounded-[21px] p-5 shadow-xl flex flex-col flex-1 min-h-0">
       <div className="flex items-center gap-2 mb-4 pb-3 border-b border-amber-900/10">
           <span className="text-sm text-amber-800">◉</span><h3 className="text-[9px] font-black text-stone-600 uppercase tracking-[0.3em]">Combat Telemetry</h3>
       </div>
       <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
          {combatLog.map((log:any, i:number) => (
            <div key={i} className={`flex flex-col gap-0.5 ${i === 0 ? 'opacity-100' : 'opacity-40'}`}>
               <span className="text-[7px] font-black text-amber-800">{log.time}</span>
               <span className={`text-[9px] font-medium leading-snug ${i === 0 ? 'text-stone-900' : 'text-stone-600'}`}>{log.msg}</span>
            </div>
          ))}
       </div>
    </div>

  </div>
);