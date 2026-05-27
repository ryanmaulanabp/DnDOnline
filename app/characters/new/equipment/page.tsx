"use client";

import { useState, useMemo } from "react";
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
  Wallet,
  Sparkle,
  BookOpen,
  Info,
  Scale,
  Feather,
  Dumbbell
} from "lucide-react";

const playClickSound = () => {
  try {
    const audio = new Audio('/sounds/click.mp3');
    audio.volume = 0.1;
    audio.play().catch(() => {});
  } catch (e) {}
};

const playCoinSound = () => {
  try {
    const audio = new Audio('/sounds/gold.mp3');
    audio.volume = 0.15;
    audio.play().catch(() => {});
  } catch (e) {}
};

const SKILL_DETAILS: Record<string, { label: string; desc: string }> = {
  "Acrobatics": { label: "Akrobatik", desc: "Menguji kelenturan fisik untuk salto, berlari di permukaan miring, menjaga keseimbangan di tempat licin, dan mendarat mulus." },
  "Animal Handling": { label: "Pariwisata Hewan", desc: "Menenangkan kuda panik, melacak insting hewan buas, menebak niat makhluk liar, dan menunggangi tunggangan." },
  "Arcana": { label: "Teori Sihir", desc: "Mengenali simbol tulisan Arcane kuno, fenomena patahan dimensi, relik magis legendaris, serta makhluk astral." },
  "Athletics": { label: "Atletik", desc: "Menguji kekuatan otot saat memanjat tebing terjal, mendobrak jeruji besi, berenang di arus deras, atau melompati jurang." },
  "Deception": { label: "Penipuan", desc: "Seni berbohong dengan muka datar, memalsukan identitas bangsawan, menyamarkan niat jahat, serta manipulasi informasi." },
  "History": { label: "Sejarah Peradaban", desc: "Mengingat dinasti raja masa lalu, kronologi perang kuno, reruntuhan sejarah tertimbun, dan hukum adat purba." },
  "Insight": { label: "Wawasan Batin", desc: "Membaca gerak-gerik mikro mata lawan bicara, mendeteksi getaran suara palsu, dan menyimpulkan kejujuran orang lain." },
  "Intimidation": { label: "Intimidasi", desc: "Mengancam musuh dengan tekanan mental, aura fisik menakutkan, gertakan tajam agar lawan menyerah tanpa senjata." },
  "Investigation": { label: "Penyelidikan", desc: "Menganalisis pola jebakan tersembunyi, melacak jejak sidik jari di TKP, menyimpulkan fakta dari petunjuk acak." },
  "Medicine": { label: "Pengobatan Medis", desc: "Mendiagnosis penyakit gaib, menstabilkan luka kawan sekarat, menjahit luka sayatan pedang, dan meracik obat herbal." },
  "Nature": { label: "Pengetahuan Alam", desc: "Mengenali tanaman herbal beracun, melacak cuaca badai ekstrem, mengenali bahaya ekologi geologis rimba liar." },
  "Perception": { label: "Persepsi Indrawi", desc: "Kepekaan mata dan telinga dalam mendeteksi penyusup malam, jebakan kawat tipis, atau bisikan misterius di balik dinding." },
  "Performance": { label: "Seni Panggung", desc: "Memukau keramaian dengan drama panggung, melantunkan balada bard legendaris, atau memainkan instrumen musik." },
  "Persuasion": { label: "Persuasi Ramah", desc: "Negosiasi diplomatis secara beradab, meyakinkan pejabat melalui tutur kata anggun, dan memenangkan rasa percaya." },
  "Religion": { label: "Pengetahuan Religi", desc: "Mengingat ajaran dogma kuil suci, hierarki pendeta surgawi, mitologi dewa-dewi fana, serta tata cara ritual ritual." },
  "Sleight of Hand": { label: "Kecepatan Tangan", desc: "Kemampuan mencopet dompet koin, menyembunyikan belati di lengan baju, menyabotase kunci, atau memanipulasi kartu judi." },
  "Stealth": { label: "Mengendap-endap", desc: "Berjalan tanpa mengeluarkan desah napas sedikit pun, melebur dalam gelap bayang-bayang, menghindari jangkauan mata patroli." },
  "Survival": { label: "Kelangsungan Hidup", desc: "Melacak arah rasi bintang di padang gurun, mendirikan kemah kokoh tahan badai, berburu makanan liar, melacak jejak musuh." }
};

const ITEM_WEIGHTS: Record<string, number> = {
  "A greataxe": 12, "Any martial melee weapon": 6, "Two handaxes": 6, "Any simple weapon": 3, "An explorer's pack": 59,
  "4 javelins": 8, "Leather armor": 10, "A dagger": 1, "A rapier": 2, "A longsword": 3, "A diplomat's pack": 36,
  "An entertainer's pack": 38, "A lute": 2, "Any other musical instrument": 3, "A mace": 4, "A warhammer (if proficient)": 6,
  "Scale mail": 45, "Chain mail": 55, "Scale mail (if proficient)": 45, "Chain mail (if proficient)": 55,
  "A light crossbow and 20 bolts": 6, "Two handaxes (ranged)": 6, "A shield": 6, "A holy symbol": 1, "A wooden shield": 6,
  "A scimitar": 3, "Any simple melee weapon": 3, "A druidic focus": 1, "Leather armor, longbow, and 20 arrows": 13,
  "A martial weapon and a shield": 12, "Two martial weapons": 8, "A light crossbow and 20 bolts (ranged)": 6,
  "A dungeoneer's pack or explorer's pack": 60, "A dungeoneer's pack": 61, "10 darts": 2, "A shortsword": 2,
  "Five javelins": 10, "A longbow and a quiver of 20 arrows": 3, "A shortbow and quiver of 20 arrows": 3,
  "A burglar's pack": 47, "Thieves' tools": 1, "A component pouch": 2, "An arcane focus": 3, "A scholar's pack": 43,
  "A spellbook": 3
};

export default function EquipmentStep() {
  const { 
    charClass, background, selectedClassSkills, equipmentSelections, 
    useStartingWealth, gold, spells = [], updateField, showToast,
    level = 1, baseStats, race, subrace
  } = useCharacterStore();

  const [openSection, setOpenSection] = useState<string>("Choose Equipment");
  const [activeSkillInfo, setActiveSkillInfo] = useState<string | null>(null);

  const rulesClass = CLASSES[charClass] || null;
  const rulesBg = BACKGROUNDS[background] || null;
  const classSpells = SPELL_DATABASE[charClass] || null;
  const rulesRace = RACES[race] || null;
  const rulesSubrace = rulesRace?.subraces?.find((s: any) => s.name === subrace) || null;

  const getMod = (stat: string) => Math.floor(((baseStats?.[stat] || 10) + (rulesRace?.bonuses?.[stat] || 0) + (rulesSubrace?.bonuses?.[stat] || 0) - 10) / 2);
  const wisMod = getMod("WIS");
  const chaMod = getMod("CHA");
  const strScore = (baseStats?.STR || 10) + (rulesRace?.bonuses?.STR || 0) + (rulesSubrace?.bonuses?.STR || 0);

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

  // TAB LEVEL SIHIR AKTIF
  const [activeSpellTab, setActiveSpellTab] = useState<string>("Cantrips");

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
    if (choice === "gold") {
      playCoinSound();
      updateField("useStartingWealth", true);
      updateField("gold", 150);
      updateField("equipmentSelections", {});
    } else {
      playClickSound();
      updateField("useStartingWealth", false);
      updateField("gold", 15);
    }
  };

  // PENGHITUNG BEBAN LOGISTIK (Encumbrance Capacity)
  const totalCarryingWeight = useMemo(() => {
    if (useStartingWealth) return 10; // hanya kantong koin & belati dasar
    
    let weight = 0;
    
    // Hitung berat dari base equipment class
    if (rulesClass?.baseEquipment) {
      rulesClass.baseEquipment.forEach((eq: string) => {
        weight += ITEM_WEIGHTS[eq] || 5; 
      });
    }
    
    // Hitung berat dari pilhan equipment logistik
    if (equipmentSelections) {
      Object.values(equipmentSelections).forEach((optVal: any) => {
        weight += ITEM_WEIGHTS[optVal] || 4;
      });
    }

    // Tambah berat dari background
    if (rulesBg?.equipment) {
      weight += rulesBg.equipment.length * 1.5; 
    }

    return Math.round(weight * 10) / 10;
  }, [useStartingWealth, rulesClass, equipmentSelections, rulesBg]);

  // Maksimum angkat beban standar D&D 5e: STR * 15
  const maxCarryingCapacity = useMemo(() => strScore * 15, [strScore]);
  const carryPercentage = useMemo(() => Math.min(100, (totalCarryingWeight / maxCarryingCapacity) * 100), [totalCarryingWeight, maxCarryingCapacity]);

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
    
    showToast("Semua pilihan logistik & magis telah terisi otomatis!", "success");
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl pb-24 relative z-10">
      
      {/* Title & Lengkapi Otomatis */}
      <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-amber-800 rounded-full" />
          <h2 className="text-4xl font-black text-stone-900 tracking-tighter uppercase relative z-10 flex items-center gap-3">
            <Shield className="w-8 h-8 text-amber-800 fill-amber-800/10 shrink-0" /> Keahlian & Logistik
          </h2>
          <p className="text-stone-500 mt-2 font-bold uppercase tracking-[0.2em] text-[10px] relative z-10 leading-relaxed">
            Daftarkan keahlian skill fungsional pahlawan Anda, atur jatah mantra mistis, serta pilih ransel logistik pertarungan Anda.
          </p>
        </div>
        <button 
          onClick={handleAutoFill}
          className="px-6 py-3.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all border border-amber-300 shadow-sm flex items-center gap-2.5 active:scale-97 shrink-0 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-700" /> Isi Logistik Otomatis
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SEKSI: KEAHLIAN SKILL (SKILL PROFICIENCIES) */}
      {/* ========================================================================= */}
      <div className="bg-white/95 backdrop-blur-sm p-6 md:p-8 rounded-[2rem] border border-[#d4c5b0] shadow-xl relative overflow-hidden group hover:border-[#a6937a] transition-all duration-500">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-5 border-b border-[#d4c5b0]/60 relative z-10">
          <h3 className="text-xl font-black text-stone-900 uppercase tracking-tight flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100/70 text-amber-800 border border-amber-300/40 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5" />
            </div>
            Kemahiran Keterampilan (Skill Proficiencies)
          </h3>
          
          <span className={`text-[9px] font-black px-4.5 py-2.5 rounded-xl uppercase tracking-widest shadow-sm mt-4 md:mt-0 transition-all border
            ${selectedClassSkills.length === (rulesClass?.skillCount || 0) 
              ? 'bg-green-50 text-green-700 border-green-200' 
              : 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'}`}>
            Keahlian Terpilih: {selectedClassSkills.length} / {rulesClass?.skillCount || 0}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5 relative z-10">
          {rulesClass?.skillOptions.map((skill: string) => {
            const isBgSkill = rulesBg?.skills.includes(skill);
            const isSelected = selectedClassSkills.includes(skill);
            const isDisabled = isBgSkill || (!isSelected && selectedClassSkills.length >= (rulesClass?.skillCount || 0));
            const skillMeta = SKILL_DETAILS[skill] || { label: skill, desc: "Keahlian dasar penunjang mekanik pahlawan." };
            const isInfoOpen = activeSkillInfo === skill;

            return (
              <div
                key={skill}
                className="relative flex flex-col transition-all duration-300 rounded-2xl"
              >
                <motion.button 
                  whileTap={!isDisabled ? { scale: 0.97 } : {}}
                  onClick={() => !isDisabled && toggleClassSkill(skill)} 
                  className={`p-4 rounded-xl border-2 transition-all duration-300 w-full text-left flex items-center justify-between min-h-[58px] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500
                    ${isBgSkill 
                      ? 'bg-stone-50 border-stone-200/60 opacity-65 cursor-not-allowed text-stone-500' 
                      : isSelected 
                        ? 'bg-amber-50 border-amber-600 text-amber-900 shadow-sm ring-1 ring-amber-600/20 cursor-pointer' 
                        : isDisabled 
                          ? 'bg-[#fdfaf6]/40 border-stone-200 text-stone-400 cursor-not-allowed select-none' 
                          : 'bg-white border-[#d4c5b0] text-stone-700 hover:border-amber-400 hover:bg-[#fcfbf9] cursor-pointer'}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-black text-[11px] tracking-wider uppercase">{skillMeta.label}</span>
                    <span className="text-[8px] font-bold text-stone-400 uppercase font-mono">({skill})</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isBgSkill ? (
                      <span className="text-[7.5px] bg-[#e6dccb] px-2 py-1 rounded-md text-stone-600 font-black uppercase tracking-wider">Latar Belakang</span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playClickSound();
                          setActiveSkillInfo(isInfoOpen ? null : skill);
                        }}
                        className="p-1 rounded hover:bg-stone-100 text-stone-400 hover:text-stone-700"
                        aria-label="Detail Skill"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isSelected && !isBgSkill && (
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-700 shadow-sm" />
                    )}
                  </div>
                </motion.button>

                {/* Deskripsi Skill Info Dropdown */}
                <AnimatePresence>
                  {isInfoOpen && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: "auto" }} 
                      exit={{ opacity: 0, height: 0 }} 
                      className="bg-white border border-[#d4c5b0] rounded-xl p-3.5 mt-1.5 text-[10px] leading-relaxed text-stone-600 font-semibold shadow-inner relative z-10"
                    >
                      <p>{skillMeta.desc}</p>
                      <button 
                        onClick={() => setActiveSkillInfo(null)}
                        className="mt-2 text-[8px] font-black uppercase text-amber-700 hover:underline block"
                      >
                        Tutup Info
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SEKSI: GRIMOIRE PERAPAL SIHIR (SPELL GRIMOIRE) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {rulesClass?.isCaster && classSpells && (cantripsAllowed > 0 || spellsAllowed > 0) && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/95 backdrop-blur-sm p-6 md:p-8 rounded-[2rem] border border-[#d4c5b0] shadow-xl relative overflow-hidden group hover:border-cyan-400 hover:shadow-cyan-900/5 transition-all duration-500"
          >
            {/* Header Sihir */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-5 border-b border-[#d4c5b0]/60 relative z-10">
              <h3 className="text-xl font-black text-cyan-800 uppercase tracking-tight flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-800 border border-cyan-200/40 flex items-center justify-center shrink-0">
                  <Sparkle className="w-5 h-5 text-cyan-700 animate-spin-slow" />
                </div>
                Spellbook Grimoire ({charClass})
              </h3>
              
              <div className="flex gap-2.5 mt-4 md:mt-0 font-sans">
                <span className={`text-[8.5px] font-black px-3 py-2 rounded-xl uppercase tracking-widest border
                  ${selectedCantripsCount === cantripsAllowed ? 'bg-green-50 text-green-700 border-green-200' : 'bg-cyan-50 text-cyan-700 border-cyan-200'}`}>
                  Cantrip: {selectedCantripsCount} / {cantripsAllowed} Slot
                </span>
                {maxSpellLevel > 0 && (
                  <span className={`text-[8.5px] font-black px-3 py-2 rounded-xl uppercase tracking-widest border
                    ${selectedSpellsCount === spellsAllowed ? 'bg-green-50 text-green-700 border-green-200' : 'bg-cyan-50 text-cyan-700 border-cyan-200'}`}>
                    Grimoire Lv1-{maxSpellLevel}: {selectedSpellsCount} / {spellsAllowed} Slot
                  </span>
                )}
              </div>
            </div>

            {/* Spellbook Tabs */}
            <div className="flex border-b border-[#d4c5b0]/60 mb-6 bg-[#fdfaf6] p-1 rounded-xl gap-1 relative z-10">
              {/* Tab Cantrips */}
              {classSpells.Cantrips && (
                <button
                  onClick={() => { playClickSound(); setActiveSpellTab("Cantrips"); }}
                  className={`flex-1 md:flex-none px-5 py-2.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all focus:outline-none
                    ${activeSpellTab === "Cantrips" ? 'bg-cyan-800 text-white shadow-sm' : 'text-stone-500 hover:text-cyan-800'}`}
                >
                  Cantrips
                </button>
              )}
              {/* Tab Levels */}
              {availableLevels.map((lvl) => {
                const num = lvl.replace("Level", "");
                return (
                  <button
                    key={lvl}
                    onClick={() => { playClickSound(); setActiveSpellTab(lvl); }}
                    className={`flex-1 md:flex-none px-5 py-2.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all focus:outline-none
                      ${activeSpellTab === lvl ? 'bg-cyan-800 text-white shadow-sm' : 'text-stone-500 hover:text-cyan-800'}`}
                  >
                    Tingkat {num}
                  </button>
                );
              })}
            </div>

            {/* Grid Daftar Sihir Sesuai Tab Terpilih */}
            <div className="relative z-10 min-h-[120px]">
              {(() => {
                const spellList = classSpells[activeSpellTab] || [];
                const isCantrip = activeSpellTab === "Cantrips";
                const isMaxedOut = isCantrip ? selectedCantripsCount >= cantripsAllowed : selectedSpellsCount >= spellsAllowed;

                if (spellList.length === 0) {
                  return (
                    <div className="text-center py-10 text-stone-400 font-bold italic text-xs">
                      Tidak ada mantra tingkat ini yang tersedia untuk kelas Anda saat ini.
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {spellList.map((spell: any) => {
                      const isSelected = spells.includes(spell.name);
                      const isDisabled = !isSelected && isMaxedOut;

                      return (
                        <motion.div 
                          whileTap={!isDisabled ? { scale: 0.98 } : {}}
                          key={spell.name} 
                          onClick={() => !isDisabled && toggleSpell(spell.name, activeSpellTab)} 
                          className={`p-5 rounded-2xl border-2 transition-all duration-300 group flex flex-col justify-between focus-within:ring-2 focus-within:ring-cyan-500/20
                            ${isSelected 
                              ? 'bg-cyan-50/70 border-cyan-600 shadow-sm ring-1 ring-cyan-600/20 cursor-pointer' 
                              : isDisabled 
                                ? 'bg-stone-50/40 border-stone-200 opacity-60 cursor-not-allowed select-none' 
                                : 'bg-white border-[#d4c5b0] hover:border-cyan-300 hover:bg-cyan-50/20 cursor-pointer'}`}
                        >
                          <div>
                            {/* Baris Atas Sihir */}
                            <div className="flex justify-between items-start gap-4 mb-3">
                              <div className="text-left">
                                <h4 className={`text-base font-black uppercase tracking-tight ${isSelected ? 'text-cyan-900' : 'text-stone-800'}`}>
                                  {spell.name}
                                </h4>
                                
                                <span className={`inline-block text-[8px] font-black px-2 py-0.5 rounded border uppercase tracking-widest mt-1
                                  ${isSelected ? 'bg-cyan-100 border-cyan-300 text-cyan-800' : 'bg-stone-50 border-stone-200 text-stone-500'}`}>
                                  Komponen: {spell.components}
                                </span>
                              </div>
                              
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0
                                ${isSelected ? 'bg-cyan-700 border-cyan-600 text-white' : 'bg-white border-[#d4c5b0]'}`}>
                                {isSelected && <CheckIcon className="w-3.5 h-3.5" />}
                              </div>
                            </div>
                            
                            {/* Deskripsi Sihir */}
                            <p className="text-xs text-stone-600 leading-relaxed font-semibold italic border-l-2 border-cyan-300 pl-4 py-1 mt-2.5 bg-cyan-100/10 rounded-r-lg">
                              {spell.desc}
                            </p>
                          </div>

                        </motion.div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* PANEL ACCORDION: PEMILIHAN GAYA LOGISTIK & STARTING WEALTH */}
      {/* ========================================================================= */}
      <div className="space-y-6">
        
        {/* Accordion Card Pemilihan Senjata & Ransel */}
        <motion.div 
          layout="position" 
          className={`bg-white/95 backdrop-blur-sm rounded-3xl border transition-all duration-300 overflow-hidden shadow-sm
            ${openSection === "Choose Equipment" ? "border-amber-400 shadow-md shadow-amber-900/5 ring-1 ring-amber-200" : "border-[#d4c5b0] hover:border-[#a6937a]"}`}
        >
          <button 
            onClick={() => toggleSection("Choose Equipment")} 
            aria-expanded={openSection === "Choose Equipment"}
            className={`w-full flex justify-between items-center p-6 transition-all duration-300 border-l-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500
              ${openSection === "Choose Equipment" ? "bg-amber-50/30 border-l-amber-500" : "hover:bg-[#fcfbf9] border-l-transparent"}`}
          >
            <div className="text-left flex items-center gap-4">
              <div className={`p-2.5 rounded-xl transition-colors border
                ${openSection === "Choose Equipment" ? "bg-amber-100 border-amber-200 text-amber-700" : "bg-[#fdfaf6] border-[#d4c5b0] text-stone-500"}`}>
                <Sword className="w-5 h-5 shrink-0" />
              </div>
              <div>
                <h3 className="text-lg font-black text-stone-900 uppercase tracking-tight">Seleksi Logistik Persenjataan</h3>
                <p className="text-[9px] text-stone-400 font-extrabold uppercase tracking-[0.2em] mt-1.5 leading-none">Starting Packs • Gold Coins Trade</p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-stone-400 transform transition-transform duration-500 ${openSection === "Choose Equipment" ? "rotate-180 text-amber-600" : ""}`} />
          </button>
          
          <AnimatePresence>
            {openSection === "Choose Equipment" && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: "auto", opacity: 1 }} 
                exit={{ height: 0, opacity: 0 }} 
                transition={{ duration: 0.45, ease: [0.04, 0.62, 0.23, 0.98] }}
                className="bg-[#fdfaf6] border-t border-[#d4c5b0]/60 relative"
              >
                <div className="p-6 md:p-8 relative z-10 space-y-8">
                  
                  {/* Penjelasan Pendek */}
                  <div className="text-xs text-stone-600 leading-relaxed font-semibold border-l-4 border-amber-600 pl-5 bg-amber-50 rounded-r-xl py-3.5">
                    Hero kelas <span className="font-black text-amber-800 bg-white border border-[#d4c5b0]/80 rounded px-2 py-0.5 shadow-sm text-[10px] uppercase tracking-wider">{charClass}</span> berhak menerima paket persenjataan tempur standar, ATAU menolak semua demi modal Keping Emas bebas (Starting Wealth) untuk belanja mandiri.
                  </div>
                  
                  {/* Pilihan 2 Metode Logistik */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* Opsi Starting Equipment Card */}
                    <div 
                      onClick={() => handleWealthChoice("equipment")} 
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleWealthChoice("equipment");
                        }
                      }}
                      role="radio"
                      aria-checked={!useStartingWealth}
                      tabIndex={0}
                      className={`cursor-pointer p-6 rounded-2xl border-2 transition-all flex flex-col items-center text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500
                        ${!useStartingWealth 
                          ? 'bg-amber-50/50 border-amber-600 shadow-md ring-1 ring-amber-600/30' 
                          : 'bg-white border-[#d4c5b0] hover:border-amber-400 hover:bg-[#fcfbf9]'}`}
                    >
                      <div className="mb-4.5 p-3 rounded-full bg-white border border-[#d4c5b0] shadow-sm">
                        <Sword className={`w-8 h-8 ${!useStartingWealth ? 'text-amber-700' : 'text-stone-400'}`} />
                      </div>
                      <h4 className="text-sm font-black text-stone-800 uppercase tracking-wider">Perlengkapan Standar Kelas</h4>
                      <p className="text-[10px] text-stone-500 mt-2 font-semibold leading-relaxed">Terima satu set perlengkapan dan logistik taktis siap pakai.</p>
                    </div>

                    {/* Opsi Starting Wealth Card */}
                    <div 
                      onClick={() => handleWealthChoice("gold")} 
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleWealthChoice("gold");
                        }
                      }}
                      role="radio"
                      aria-checked={useStartingWealth}
                      tabIndex={0}
                      className={`cursor-pointer p-6 rounded-2xl border-2 transition-all flex flex-col items-center text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500
                        ${useStartingWealth 
                          ? 'bg-yellow-50 border-yellow-500 shadow-md ring-1 ring-yellow-300' 
                          : 'bg-white border-[#d4c5b0] hover:border-yellow-400 hover:bg-[#fcfbf9]'}`}
                    >
                      <div className="mb-4.5 p-3 rounded-full bg-white border border-[#d4c5b0] shadow-sm">
                        <Coins className={`w-8 h-8 ${useStartingWealth ? 'text-yellow-600 animate-bounce-slow' : 'text-stone-400'}`} />
                      </div>
                      <h4 className="text-sm font-black text-stone-800 uppercase tracking-wider">Bawa Keping Emas Mandiri</h4>
                      <p className="text-[10px] text-stone-500 mt-2 font-semibold leading-relaxed">Mulai perjalanan dengan keping emas logam (GP) secara fleksibel.</p>
                    </div>

                  </div>

                  <AnimatePresence mode="wait">
                    
                    {/* STARTING EQUIPMENT SUB-SELECTION */}
                    {!useStartingWealth && (
                      <motion.div 
                        key="equipment-choices-panel" 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -10 }} 
                        className="space-y-5 pt-6 border-t border-[#d4c5b0]/60"
                      >
                        {/* Auto Given Items */}
                        {rulesClass?.baseEquipment && rulesClass.baseEquipment.length > 0 && (
                          <div className="bg-white p-5 rounded-2xl border border-[#d4c5b0] shadow-sm">
                            <h4 className="text-[9px] font-black text-stone-400 uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-stone-400" /> Diberikan Langsung ke Ransel
                            </h4>
                            
                            <div className="flex flex-wrap gap-2.5">
                              {rulesClass.baseEquipment.map((eq: string) => (
                                <div key={eq} className="bg-[#fdfaf6] text-stone-700 text-[10.5px] font-extrabold px-4 py-2.5 rounded-xl border border-[#d4c5b0] uppercase tracking-wide flex items-center gap-2 shadow-sm">
                                  <Feather className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                  <span>{eq}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Interactive Choice Selectors */}
                        {rulesClass?.equipmentChoices?.map((choiceGroup: any, idx: number) => (
                          <div key={idx} className="bg-white p-5 rounded-2xl border border-[#d4c5b0] shadow-sm">
                            <p className="text-[9px] font-black text-red-800 mb-4 uppercase tracking-[0.25em] flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-red-700 rounded-full animate-ping" />
                              Pilih Opsi Senjata/Zirah {idx + 1}
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {choiceGroup.options.map((opt: string) => {
                                const isSelected = equipmentSelections[choiceGroup.id] === opt;
                                return (
                                  <motion.div 
                                    whileTap={{ scale: 0.98 }}
                                    key={opt} 
                                    onClick={() => { playClickSound(); updateField("equipmentSelections", { ...equipmentSelections, [choiceGroup.id]: opt }); }}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        updateField("equipmentSelections", { ...equipmentSelections, [choiceGroup.id]: opt });
                                      }
                                    }}
                                    role="radio"
                                    aria-checked={isSelected}
                                    tabIndex={0}
                                    className={`flex items-center justify-between p-4.5 rounded-xl border-2 cursor-pointer transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500
                                      ${isSelected 
                                        ? 'bg-red-50 border-red-500 shadow-sm ring-1 ring-red-500/10' 
                                        : 'bg-[#fdfaf6] border-[#d4c5b0] hover:border-red-300 hover:bg-red-50/10'}`}
                                  >
                                    <span className={`text-xs font-black uppercase tracking-wide ${isSelected ? 'text-red-800' : 'text-stone-700'}`}>{opt}</span>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0
                                      ${isSelected ? 'bg-red-700 border-red-600 text-white' : 'bg-white border-[#d4c5b0]'}`}>
                                      {isSelected && <CheckIcon className="w-3.5 h-3.5" />}
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}

                    {/* STARTING WEALTH SUB-SELECTION */}
                    {useStartingWealth && (
                      <motion.div 
                        key="wealth-panel" 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -10 }} 
                        className="pt-6 border-t border-[#d4c5b0]/60 text-center flex flex-col items-center space-y-4"
                      >
                        <div className="w-16 h-16 rounded-full bg-yellow-100 border border-yellow-200 flex items-center justify-center shadow-sm">
                          <Coins className="w-9 h-9 text-yellow-600" />
                        </div>
                        
                        <h4 className="text-xl font-black text-yellow-800 uppercase tracking-tight">Mulai dengan Tabungan Koin</h4>
                        <p className="text-[10px] font-bold text-stone-500 max-w-sm mx-auto uppercase tracking-widest leading-relaxed">
                          Anda memilih menolak perlengkapan bawaan kelas dan membawa modal Keping Emas secara bebas.
                        </p>
                        
                        <div className="inline-flex items-center gap-4 bg-white border border-[#d4c5b0] px-6 py-4 rounded-2xl shadow-sm focus-within:border-yellow-500 transition-colors">
                          <span className="text-[9px] font-black text-stone-500 uppercase tracking-[0.2em]">Pundi Emas Awal:</span>
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              value={gold} 
                              onChange={e => {
                                updateField("gold", Math.max(0, Number(e.target.value)));
                              }} 
                              className="w-24 bg-[#fdfaf6] border border-[#d4c5b0] focus:ring-1 focus:ring-yellow-400 rounded-xl text-stone-900 text-center text-2xl font-black py-1 outline-none focus:border-yellow-400 shadow-inner font-mono" 
                            />
                            <span className="text-xl font-black text-yellow-700">GP</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                  </AnimatePresence>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ========================================================================= */}
        {/* BEBAN KEKUATAN & ENCUMBRANCE CAPACITY METER */}
        {/* ========================================================================= */}
        <div className="bg-white/95 backdrop-blur-sm p-6 rounded-3xl border border-[#d4c5b0] shadow-sm relative overflow-hidden group hover:border-[#a6937a] transition-all duration-400 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-amber-800" />
          
          <div className="flex items-center gap-4.5 z-10 w-full md:w-auto">
            <div className="w-10 h-10 rounded-xl bg-stone-50 border border-[#d4c5b0] flex items-center justify-center text-stone-500 shrink-0 shadow-sm">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                Kapasitas Beban Bawaan (Encumbrance)
              </h4>
              <p className="text-[9px] text-stone-400 font-extrabold uppercase tracking-widest mt-1">
                Kekuatan STR: {strScore} • Maksimal: {maxCarryingCapacity} Lbs
              </p>
            </div>
          </div>

          {/* Meter progress bar */}
          <div className="w-full md:flex-1 max-w-md bg-stone-100 border border-stone-200 rounded-xl p-3 shadow-inner flex flex-col justify-between z-10 relative">
            <div className="flex justify-between items-center text-[9px] font-black text-stone-500 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1"><Dumbbell className="w-3.5 h-3.5" /> Berat Logistik</span>
              <span className={totalCarryingWeight > maxCarryingCapacity ? 'text-red-600' : 'text-amber-800'}>
                {totalCarryingWeight} / {maxCarryingCapacity} Lbs
              </span>
            </div>
            
            <div className="w-full h-3 bg-stone-200 border border-stone-300 rounded-full overflow-hidden relative">
              <motion.div 
                className={`h-full rounded-full transition-all duration-500
                  ${carryPercentage > 85 ? 'bg-gradient-to-r from-red-500 to-red-700 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'bg-gradient-to-r from-amber-400 to-amber-700 shadow-[0_0_8px_rgba(245,158,11,0.2)]'}`}
                initial={{ width: 0 }}
                animate={{ width: `${carryPercentage}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

function CheckIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}