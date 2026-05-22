"use client";
import { Tooltip, IconShield, SKILL_MAP } from "./HeroModules";

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
                     <div key={i} onClick={() => setHitDiceUsed(i <= hitDiceUsed ? i-1 : i)} className={`w-5 h-5 rounded border cursor-pointer transition-all flex items-center justify-center text-[8px] ${i > hitDiceUsed ? 'border-green-500/50 bg-green-500/10 text-green-500' : 'border-stone-300 bg-stone-100 text-slate-800'}`}>{i > hitDiceUsed ? '✚' : '✕'}</div>
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

      {/* SKILL MASTERY - DIBUAT RAPAT SEMPURNA */}
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
                  <div onClick={() => rollDice(20, bonus, skill)} className={`w-full flex items-center justify-between px-4 py-[7px] cursor-pointer hover:bg-amber-800/10 group transition-colors border-b border-amber-900/10 last:border-0 ${isProf ? 'bg-amber-900/20' : ''}`}>
                     <div className="flex items-center gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full ${isProf ? 'bg-amber-800 shadow-[0_0_5px_rgba(59,130,246,0.6)]' : 'bg-slate-700'}`} />
                        <span className={`text-[10px] font-bold ${isProf ? 'text-stone-900' : 'text-stone-600'} group-hover:text-amber-600 uppercase tracking-wider`}>{skill}</span>
                        {hasGlobalDisadv && <span className="text-[5px] bg-red-600 text-stone-900 px-1 rounded">DIS</span>}
                     </div>
                     <div className="flex items-center gap-3">
                        <span className="text-[6px] font-black text-stone-400 uppercase w-4 text-center">{data.stat}</span>
                        <span className={`text-xs font-black ${isProf ? 'text-amber-700' : 'text-stone-500'}`}>{formatMod(bonus)}</span>
                     </div>
                  </div>
                </Tooltip>
              );
            })}
         </div>
      </div>
    </div>
  );
};