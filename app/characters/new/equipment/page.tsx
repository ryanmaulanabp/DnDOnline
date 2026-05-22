"use client";

import { useState } from "react";
import { useCharacterStore } from "@/store/useCharacterStore";
import { CLASSES, BACKGROUNDS, SPELL_DATABASE, RACES } from "@/lib/dnd-data";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Target, 
  ChevronDown, 
  Sparkles, 
  Sword, 
  Coins, 
  Shield, 
  Wallet 
} from "lucide-react";

const playClickSound = () => {
  try {
    const audio = new Audio('/sounds/click.mp3');
    audio.volume = 0.1;
    audio.play().catch(() => {});
  } catch (e) {}
};

export default function EquipmentStep() {
  const { 
    charClass, background, selectedClassSkills, equipmentSelections, 
    useStartingWealth, gold, spells = [], updateField, showToast,
    level = 1, baseStats, race, subrace
  } = useCharacterStore();

  const [openSection, setOpenSection] = useState<string>("Choose Equipment");

  const rulesClass = CLASSES[charClass] || null;
  const rulesBg = BACKGROUNDS[background] || null;
  const classSpells = SPELL_DATABASE[charClass] || null;
  const rulesRace = RACES[race] || null;
  const rulesSubrace = rulesRace?.subraces?.find((s: any) => s.name === subrace) || null;

  const getMod = (stat: string) => Math.floor(((baseStats?.[stat] || 10) + (rulesRace?.bonuses?.[stat] || 0) + (rulesSubrace?.bonuses?.[stat] || 0) - 10) / 2);
  const wisMod = getMod("WIS");
  const chaMod = getMod("CHA");

  let cantripsAllowed = 0;
  let spellsAllowed = 0;

  switch (charClass) {
    case "Bard":
      cantripsAllowed = level < 4 ? 2 : level < 10 ? 3 : 4;
      spellsAllowed = Math.min(22, level + 3);
      break;
    case "Cleric":
      cantripsAllowed = level < 4 ? 3 : level < 10 ? 4 : 5;
      spellsAllowed = Math.max(1, level + wisMod);
      break;
    case "Druid":
      cantripsAllowed = level < 4 ? 2 : level < 10 ? 3 : 4;
      spellsAllowed = Math.max(1, level + wisMod);
      break;
    case "Paladin":
      cantripsAllowed = 0;
      spellsAllowed = level < 2 ? 0 : Math.max(1, Math.floor(level / 2) + chaMod);
      break;
    case "Ranger":
      cantripsAllowed = 0;
      spellsAllowed = level < 2 ? 0 : Math.ceil(level / 2) + 1;
      break;
    case "Sorcerer":
      cantripsAllowed = level < 4 ? 4 : level < 10 ? 5 : 6;
      spellsAllowed = Math.min(15, level + 1);
      break;
    case "Warlock":
      cantripsAllowed = level < 4 ? 2 : level < 10 ? 3 : 4;
      spellsAllowed = Math.min(15, level + 1);
      break;
    case "Wizard":
      cantripsAllowed = level < 4 ? 3 : level < 10 ? 4 : 5;
      spellsAllowed = 6 + ((level - 1) * 2);
      break;
  }

  const getMaxSpellLevel = (cClass: string, cLevel: number) => {
    if (["Bard", "Cleric", "Druid", "Sorcerer", "Wizard", "Warlock"].includes(cClass)) {
      return Math.min(9, Math.ceil(cLevel / 2));
    }
    if (["Paladin", "Ranger"].includes(cClass)) {
      return cLevel < 2 ? 0 : Math.floor((cLevel - 1) / 4) + 1;
    }
    return 0;
  };

  const maxSpellLevel = getMaxSpellLevel(charClass, level);
  const availableLevels = Array.from({length: maxSpellLevel}, (_, i) => `Level${i + 1}`);

  const selectedCantripsCount = spells.filter((s: string) => classSpells?.Cantrips?.some((cs: any) => cs.name === s)).length;
  const selectedSpellsCount = spells.filter((s: string) => 
    availableLevels.some(lvl => classSpells?.[lvl]?.some((ls: any) => ls.name === s))
  ).length;

  const toggleSection = (section: string) => {
    playClickSound();
    setOpenSection(prev => prev === section ? "" : section);
  };

  const toggleClassSkill = (skill: string) => {
    playClickSound();
    if (selectedClassSkills.includes(skill)) {
      updateField("selectedClassSkills", selectedClassSkills.filter((s: string) => s !== skill));
    } else if (rulesClass && selectedClassSkills.length < rulesClass.skillCount) {
      updateField("selectedClassSkills", [...selectedClassSkills, skill]);
    }
  };

  const toggleSpell = (spellName: string, levelType: string) => {
    playClickSound();
    const isSelected = spells.includes(spellName);

    if (isSelected) {
      updateField("spells", spells.filter((s: string) => s !== spellName));
    } else {
      if (levelType === "Cantrips" && selectedCantripsCount >= cantripsAllowed) {
        showToast(`Batas tercapai! Arcane Weave hanya mengizinkan Anda menyimpan ${cantripsAllowed} Cantrip.`, "error");
        return;
      }
      if (levelType !== "Cantrips" && selectedSpellsCount >= spellsAllowed) {
        showToast(`Batas memori magis penuh! Grimoire Anda hanya bisa menampung ${spellsAllowed} Mantra.`, "error");
        return;
      }
      updateField("spells", [...spells, spellName]);
    }
  };

  const handleWealthChoice = (choice: "equipment" | "gold") => {
    playClickSound();
    if (choice === "gold") {
      updateField("useStartingWealth", true);
      updateField("gold", 150);
      updateField("equipmentSelections", {});
    } else {
      updateField("useStartingWealth", false);
      updateField("gold", 15);
    }
  };

  const handleAutoFill = () => {
    playClickSound();
    
    // Auto-fill Skills
    if (rulesClass && selectedClassSkills.length < rulesClass.skillCount) {
      const availableSkills = rulesClass.skillOptions.filter((s: string) => !rulesBg?.skills?.includes(s));
      const needed = rulesClass.skillCount - selectedClassSkills.length;
      const unselected = availableSkills.filter((s: string) => !selectedClassSkills.includes(s));
      const newSkills = [...selectedClassSkills, ...unselected.slice(0, needed)];
      updateField("selectedClassSkills", newSkills);
    }

    // Auto-fill Spells
    if (rulesClass?.isCaster && classSpells && (cantripsAllowed > 0 || spellsAllowed > 0)) {
      let newSpells = [...spells];
      
      const cantrips = classSpells.Cantrips || [];
      const currentCantrips = newSpells.filter(s => cantrips.some((c: any) => c.name === s));
      if (currentCantrips.length < cantripsAllowed) {
        const unselectedCantrips = cantrips.filter((c: any) => !newSpells.includes(c.name));
        const neededCantrips = cantripsAllowed - currentCantrips.length;
        newSpells = [...newSpells, ...unselectedCantrips.slice(0, neededCantrips).map((c: any) => c.name)];
      }

      let currentSpellsCount = newSpells.filter(s => 
        availableLevels.some(lvl => classSpells?.[lvl]?.some((ls: any) => ls.name === s))
      ).length;

      if (currentSpellsCount < spellsAllowed) {
        let unselectedSpells: string[] = [];
        availableLevels.forEach(lvl => {
          const lvlSpells = classSpells[lvl] || [];
          unselectedSpells.push(...lvlSpells.filter((l: any) => !newSpells.includes(l.name)).map((l: any) => l.name));
        });
        const needed = spellsAllowed - currentSpellsCount;
        newSpells = [...newSpells, ...unselectedSpells.slice(0, needed)];
      }

      updateField("spells", newSpells);
    }

    // Auto-fill Equipment
    if (!useStartingWealth && rulesClass?.equipmentChoices) {
      const newEquip = { ...equipmentSelections };
      rulesClass.equipmentChoices.forEach((choiceGroup: any) => {
        if (!newEquip[choiceGroup.id] && choiceGroup.options && choiceGroup.options.length > 0) {
          newEquip[choiceGroup.id] = choiceGroup.options[0];
        }
      });
      updateField("equipmentSelections", newEquip);
    }
    
    showToast("Semua pilihan telah dilengkapi secara otomatis!", "success");
  };


  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl pb-24 relative z-10">
      <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black text-stone-900 tracking-tighter uppercase relative z-10 flex items-center gap-3">
            <Shield className="w-8 h-8 text-amber-800" /> Proficiencies & Gear
          </h2>
          <p className="text-stone-500 mt-2 font-bold uppercase tracking-[0.2em] text-xs relative z-10">Pilih keahlian akhir Anda dan kelola inventaris pahlawan.</p>
        </div>
        <button 
          onClick={handleAutoFill}
          className="px-6 py-3 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-xl font-black uppercase tracking-widest text-xs transition-colors border border-amber-600 shadow-sm flex items-center gap-2 whitespace-nowrap"
        >
          <Sparkles className="w-4 h-4" /> Lengkapi Otomatis
        </button>
      </div>

      {/* --- SKILLS SECTION --- */}
      <div className="bg-white/95 backdrop-blur-sm p-8 rounded-[2rem] border border-[#d4c5b0] shadow-xl relative overflow-hidden group hover:border-amber-700 hover:ring-1 hover:ring-amber-300 transition-all duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-[#d4c5b0] pb-6 relative z-10">
          <h3 className="text-2xl font-black text-stone-900 uppercase tracking-tight flex items-center gap-4">
            <div className="p-3 bg-amber-200 rounded-xl text-amber-800 border border-amber-300">
              <Target className="w-6 h-6" />
            </div>
            Skill Proficiencies
          </h3>
          <span className={`text-[10px] font-black px-5 py-2.5 rounded-full uppercase tracking-widest shadow-sm mt-4 md:mt-0 transition-colors ${selectedClassSkills.length === (rulesClass?.skillCount || 0) ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-amber-200 text-amber-800 border border-amber-600'}`}>
            Terpilih {selectedClassSkills.length} / {rulesClass?.skillCount || 0}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
          {rulesClass?.skillOptions.map((skill: string) => {
            const isBgSkill = rulesBg?.skills.includes(skill);
            const isSelected = selectedClassSkills.includes(skill);
            const isDisabled = isBgSkill || (!isSelected && selectedClassSkills.length >= (rulesClass?.skillCount || 0));
            
            return (
              <motion.button 
                whileTap={!isDisabled ? { scale: 0.95 } : {}}
                key={skill} 
                onClick={() => !isDisabled && toggleClassSkill(skill)} 
                className={`p-5 rounded-xl border transition-all duration-300 w-full text-left flex items-center justify-between
                ${isBgSkill ? 'bg-[#f4efe6] border-[#d4c5b0] opacity-60 cursor-not-allowed text-stone-500' 
                : isSelected ? 'bg-amber-100 border-amber-1000 text-amber-800 shadow-sm ring-1 ring-amber-600' 
                : isDisabled ? 'bg-[#fdfaf6] border-[#d4c5b0] text-stone-400 cursor-not-allowed' 
                : 'bg-white border-[#d4c5b0] text-stone-700 hover:border-amber-600 hover:text-amber-800 cursor-pointer hover:bg-amber-100/50'}`}
              >
                <span className="font-bold truncate uppercase text-xs tracking-widest">{skill}</span>
                {isBgSkill && <span className="text-[9px] bg-[#e6dccb] px-2 py-1 rounded text-stone-600 font-black uppercase">From BG</span>}
                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-amber-700 shadow-sm"></div>}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* --- SPELL GRIMOIRE --- */}
      <AnimatePresence>
        {rulesClass?.isCaster && classSpells && (cantripsAllowed > 0 || spellsAllowed > 0) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white/95 backdrop-blur-sm p-8 rounded-[2rem] border border-[#d4c5b0] shadow-xl relative overflow-hidden hover:border-cyan-400 hover:ring-1 hover:ring-cyan-200 transition-all duration-500"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-[#d4c5b0] pb-6 relative z-10">
              <h3 className="text-2xl font-black text-cyan-800 uppercase tracking-tight flex items-center gap-4">
                <div className="p-3 bg-cyan-100 rounded-xl border border-cyan-200">
                  <Sparkles className="w-6 h-6 text-cyan-700" />
                </div>
                Spell Grimoire
              </h3>
              <div className="flex gap-3 mt-4 md:mt-0">
                <span className={`text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-widest ${selectedCantripsCount === cantripsAllowed ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-cyan-100 text-cyan-700 border border-cyan-300'}`}>
                  Cantrips: {selectedCantripsCount}/{cantripsAllowed}
                </span>
                {maxSpellLevel > 0 && (
                  <span className={`text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-widest ${selectedSpellsCount === spellsAllowed ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-cyan-100 text-cyan-700 border border-cyan-300'}`}>
                    Spells (Lv 1-{maxSpellLevel}): {selectedSpellsCount}/{spellsAllowed}
                  </span>
                )}
              </div>
            </div>
            
            {Object.entries(classSpells).map(([levelKey, spellList]: [string, any]) => {
              if (levelKey !== "Cantrips" && !availableLevels.includes(levelKey)) return null;
              if (!spellList || spellList.length === 0) return null;

              const isCantrip = levelKey === "Cantrips";
              const isMaxedOut = isCantrip ? selectedCantripsCount >= cantripsAllowed : selectedSpellsCount >= spellsAllowed;

              return (
                <div key={levelKey} className="mb-10 last:mb-0 relative z-10">
                  <div className="flex justify-between items-center mb-5">
                    <span className="text-[11px] font-black text-cyan-700 uppercase tracking-[0.4em] block">{levelKey === "Cantrips" ? "Cantrips" : `Level ${levelKey.replace("Level", "")}`}</span>
                    {isMaxedOut && <span className="text-[9px] font-bold text-red-700 uppercase tracking-widest bg-red-100 px-3 py-1 rounded border border-red-200">Batas Maksimal Tercapai</span>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {spellList.map((spell: any) => {
                      const isSelected = spells.includes(spell.name);
                      const isDisabled = !isSelected && isMaxedOut;

                      return (
                        <motion.div 
                          whileTap={!isDisabled ? { scale: 0.98 } : {}}
                          key={spell.name} 
                          onClick={() => !isDisabled && toggleSpell(spell.name, levelKey)} 
                          className={`p-6 rounded-2xl border transition-all duration-300 group flex flex-col justify-between
                          ${isSelected ? 'bg-cyan-50 border-cyan-400 shadow-sm ring-1 ring-cyan-200 cursor-pointer' 
                          : isDisabled ? 'bg-[#fdfaf6] border-[#d4c5b0] opacity-60 cursor-not-allowed' 
                          : 'bg-white border-[#d4c5b0] hover:border-cyan-300 hover:bg-cyan-50/30 cursor-pointer'}`}
                        >
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-3">
                              <span className={`text-sm font-black uppercase tracking-tight ${isSelected ? 'text-cyan-800' : 'text-stone-700 group-hover:text-cyan-700'}`}>{spell.name}</span>
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${isSelected ? 'bg-cyan-100 border-cyan-300 text-cyan-800' : 'bg-[#fdfaf6] border-[#d4c5b0] text-stone-500'}`}>{spell.components}</span>
                            </div>
                            
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${isSelected ? 'border-cyan-500' : 'border-[#d4c5b0]'}`}>
                              {isSelected && <div className="w-2.5 h-2.5 bg-cyan-600 rounded-full"></div>}
                            </div>
                          </div>
                          <p className="text-xs text-stone-600 leading-relaxed font-medium italic border-l-2 border-cyan-300 pl-4 mt-2">{spell.desc}</p>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- INVENTORY MANAGEMENT ACCORDION --- */}
      <div className="space-y-5">
        
        <motion.div layout className={`bg-white/95 backdrop-blur-sm rounded-2xl border transition-all duration-300 overflow-hidden ${openSection === "Choose Equipment" ? "border-amber-400 ring-1 ring-amber-200 shadow-lg" : "border-[#d4c5b0] hover:border-[#a6937a]"}`}>
          <button onClick={() => toggleSection("Choose Equipment")} className={`w-full flex justify-between items-center p-6 transition-colors border-l-4 ${openSection === "Choose Equipment" ? "bg-amber-50/50 border-l-amber-600" : "hover:bg-[#fcfbf9] border-l-transparent"}`}>
            <div className="text-left flex items-center gap-4">
              <div className={`p-3 rounded-xl transition-colors ${openSection === "Choose Equipment" ? "bg-amber-100 text-amber-700" : "bg-[#fdfaf6] border border-[#d4c5b0] text-stone-500"}`}>
                <Sword className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-stone-900 uppercase tracking-tight">Equipment Selection</h3>
                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-[0.2em] mt-1">Starting Gear vs Starting Wealth</p>
              </div>
            </div>
            <ChevronDown className={`w-6 h-6 text-stone-400 transform transition-transform duration-300 ${openSection === "Choose Equipment" ? "rotate-180 text-amber-600" : ""}`} />
          </button>
          
          <AnimatePresence>
            {openSection === "Choose Equipment" && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-[#fdfaf6] border-t border-[#d4c5b0] relative">
                
                <div className="p-8 relative z-10">
                  <p className="text-xs font-bold text-stone-700 mb-8 uppercase tracking-widest leading-relaxed border-l-4 border-amber-600 pl-5 bg-amber-50/50 py-3 rounded-r-xl">
                    Sebagai seorang <span className="text-amber-800 px-2 py-0.5 bg-amber-100 border border-amber-200 rounded">{charClass}</span>, Anda berhak menerima perlengkapan tempur standar, ATAU menolaknya demi Modal Keping Emas (Starting Wealth).
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <motion.div whileTap={{ scale: 0.98 }} onClick={() => handleWealthChoice("equipment")} className={`cursor-pointer p-8 rounded-2xl border transition-all flex flex-col items-center text-center group ${!useStartingWealth ? 'bg-amber-50 border-amber-500 shadow-md ring-1 ring-amber-300' : 'bg-white border-[#d4c5b0] hover:border-amber-300'}`}>
                      <div className="mb-6 p-4 rounded-full bg-white border border-[#d4c5b0] group-hover:scale-110 transition-transform duration-500 shadow-sm">
                        <Sword className={`w-10 h-10 ${!useStartingWealth ? 'text-amber-600' : 'text-stone-400'}`} />
                      </div>
                      <h4 className="text-lg font-black text-stone-900 uppercase tracking-tight">Starting Equipment</h4>
                      <p className="text-[10px] text-stone-500 mt-2 font-bold uppercase tracking-widest">Dapatkan perlengkapan bawaan dari class.</p>
                    </motion.div>
                    <motion.div whileTap={{ scale: 0.98 }} onClick={() => handleWealthChoice("gold")} className={`cursor-pointer p-8 rounded-2xl border transition-all flex flex-col items-center text-center group ${useStartingWealth ? 'bg-yellow-50 border-yellow-500 shadow-md ring-1 ring-yellow-300' : 'bg-white border-[#d4c5b0] hover:border-yellow-400'}`}>
                      <div className="mb-6 p-4 rounded-full bg-white border border-[#d4c5b0] group-hover:scale-110 transition-transform duration-500 shadow-sm">
                        <Coins className={`w-10 h-10 ${useStartingWealth ? 'text-yellow-600' : 'text-stone-400'}`} />
                      </div>
                      <h4 className="text-lg font-black text-stone-900 uppercase tracking-tight">Starting Wealth</h4>
                      <p className="text-[10px] text-stone-500 mt-2 font-bold uppercase tracking-widest">Ambil keping emas (GP), beli sendiri nanti.</p>
                    </motion.div>
                  </div>

                  <AnimatePresence mode="wait">
                    {!useStartingWealth && (
                      <motion.div key="equip" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 pt-8 border-t border-[#d4c5b0]">
                        {rulesClass?.baseEquipment && rulesClass.baseEquipment.length > 0 && (
                          <div className="bg-white p-6 rounded-2xl border border-[#d4c5b0] shadow-sm">
                            <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-[0.3em] mb-4">Diberikan Otomatis</h4>
                            <div className="flex flex-wrap gap-3">
                              {rulesClass.baseEquipment.map((eq: string) => (
                                <span key={eq} className="bg-[#fdfaf6] text-stone-700 text-[11px] font-bold px-4 py-2.5 rounded-xl border border-[#d4c5b0] uppercase tracking-wide shadow-sm">{eq}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {rulesClass?.equipmentChoices?.map((choiceGroup: any, idx: number) => (
                          <div key={idx} className="bg-white p-6 rounded-2xl border border-[#d4c5b0] shadow-sm">
                            <p className="text-[10px] font-black text-red-700 mb-4 uppercase tracking-[0.3em] flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span> Opsi Tempur {idx + 1}</p>
                            <div className="flex flex-col gap-3">
                              {choiceGroup.options.map((opt: string) => {
                                const isSelected = equipmentSelections[choiceGroup.id] === opt;
                                return (
                                  <motion.div 
                                    whileTap={{ scale: 0.98 }}
                                    key={opt} 
                                    onClick={() => { playClickSound(); updateField("equipmentSelections", { ...equipmentSelections, [choiceGroup.id]: opt }); }}
                                    className={`flex items-center justify-between p-5 rounded-xl border cursor-pointer transition-all duration-300 
                                    ${isSelected ? 'bg-red-50 border-red-500 shadow-sm ring-1 ring-red-200' : 'bg-[#fdfaf6] border-[#d4c5b0] hover:border-red-300'}`}
                                  >
                                    <span className={`text-xs font-bold uppercase tracking-wide ${isSelected ? 'text-red-700' : 'text-stone-700'}`}>{opt}</span>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-red-500' : 'border-[#d4c5b0]'}`}>
                                      {isSelected && <div className="w-2.5 h-2.5 bg-red-600 rounded-full"></div>}
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}

                    {useStartingWealth && (
                      <motion.div key="wealth" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="pt-8 border-t border-[#d4c5b0] text-center flex flex-col items-center">
                        <div className="mb-6 p-6 rounded-full bg-yellow-100 border border-yellow-300 shadow-sm">
                          <Coins className="w-16 h-16 text-yellow-600" />
                        </div>
                        <h4 className="text-2xl font-black text-yellow-700 uppercase tracking-tight">Anda Memilih Kebebasan</h4>
                        <p className="text-[11px] font-bold text-stone-500 mt-3 mb-8 max-w-md mx-auto uppercase tracking-widest leading-relaxed">Anda menolak perlengkapan bawaan kelas. Sebagai gantinya, atur modal awal Anda (GP).</p>
                        <div className="inline-flex items-center gap-4 bg-white border-2 border-yellow-300 px-8 py-5 rounded-2xl shadow-sm focus-within:border-yellow-500 transition-colors">
                          <span className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em]">Modal Awal:</span>
                          <input type="number" value={gold} onChange={e => updateField("gold", Number(e.target.value))} className="w-28 bg-[#fdfaf6] border border-[#d4c5b0] rounded-xl text-stone-900 text-center text-3xl font-black py-2 outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-300 transition-colors shadow-inner" />
                          <span className="text-2xl font-black text-yellow-700">GP</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 2. CURRENCY ACCORDION */}
        <motion.div layout className={`bg-white/95 backdrop-blur-sm rounded-2xl border transition-all duration-300 overflow-hidden ${openSection === "Currency" ? "border-yellow-400 ring-1 ring-yellow-200 shadow-lg" : "border-[#d4c5b0] hover:border-[#a6937a]"}`}>
          <button onClick={() => toggleSection("Currency")} className={`w-full flex justify-between items-center p-6 transition-colors border-l-4 ${openSection === "Currency" ? "bg-yellow-50/50 border-l-yellow-500" : "hover:bg-[#fcfbf9] border-l-transparent"}`}>
            <div className="text-left flex items-center gap-4">
              <div className={`p-3 rounded-xl transition-colors ${openSection === "Currency" ? "bg-yellow-100 text-yellow-700" : "bg-[#fdfaf6] border border-[#d4c5b0] text-stone-500"}`}>
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-stone-900 uppercase tracking-tight">Currency (Keuangan)</h3>
                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-[0.2em] mt-1">Sisa Uang Tunai</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-xs font-black text-yellow-700 bg-yellow-100 px-4 py-2 rounded-lg border border-yellow-200 shadow-sm">{gold} GP</span>
              <ChevronDown className={`text-stone-400 transform transition-transform duration-500 w-6 h-6 ${openSection === "Currency" ? "rotate-180 text-yellow-600" : ""}`} />
            </div>
          </button>
          
          <AnimatePresence>
            {openSection === "Currency" && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="p-10 bg-[#fdfaf6] border-t border-[#d4c5b0] flex flex-col items-center justify-center relative">
                <div className="flex items-center gap-6 bg-white px-10 py-8 rounded-3xl border border-[#d4c5b0] shadow-md relative z-10">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 flex items-center justify-center shadow-inner">
                    <div className="w-10 h-10 rounded-full bg-yellow-400 border-2 border-yellow-200 shadow-sm"></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-stone-500 uppercase tracking-[0.3em] mb-1">Gold Pieces</span>
                    <div className="flex items-center gap-3">
                      <input type="number" value={gold} onChange={e => updateField("gold", Number(e.target.value))} className="w-32 bg-transparent border-b-2 border-[#d4c5b0] text-stone-900 text-5xl font-black outline-none focus:border-yellow-500 transition-colors pb-2" />
                      <span className="text-3xl font-black text-yellow-600">GP</span>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] font-bold text-stone-500 mt-8 max-w-sm text-center uppercase tracking-widest leading-relaxed relative z-10">Uang tunai ini bisa diatur manual berdasarkan aturan Dungeon Master Anda.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </div>
    </div>
  );
}