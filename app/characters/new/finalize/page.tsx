"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCharacterStore } from "@/store/useCharacterStore";
import { createCharacterAction, CharacterPayload } from "@/app/actions/character";
import { createSoloCampaignAction } from "@/app/actions/campaign";
import { CLASSES, RACES, BACKGROUNDS } from "@/lib/dnd-data";
import { motion, AnimatePresence } from "framer-motion";
import { toJpeg } from "html-to-image";
import { jsPDF } from "jspdf";
import { 
  User, 
  Heart, 
  Shield, 
  Zap, 
  Footprints, 
  Sparkles, 
  Download, 
  Link, 
  CheckCircle2, 
  RefreshCw,
  Sword,
  ArrowLeft,
  BookOpen,
  Award,
  Coins,
  Scroll,
  Briefcase
} from "lucide-react";

const playSubmitSound = () => {
  try {
    const audio = new Audio('/sounds/submit.mp3'); 
    audio.volume = 0.4;
    audio.play().catch(() => {});
  } catch (e) {}
};

const playFanfareSound = () => {
  try {
    const audio = new Audio('/sounds/fanfare.mp3'); 
    audio.volume = 0.3;
    audio.play().catch(() => {});
  } catch (e) {}
};

const STAT_OPTIONS = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
const FULL_STAT_NAMES: Record<string, string> = { 
  STR: "Strength", DEX: "Dexterity", CON: "Constitution", 
  INT: "Intelligence", WIS: "Wisdom", CHA: "Charisma" 
};
const STAT_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  STR: { text: "text-red-800", bg: "bg-red-50", border: "border-red-200" },
  DEX: { text: "text-emerald-800", bg: "bg-emerald-50", border: "border-emerald-200" },
  CON: { text: "text-orange-800", bg: "bg-orange-50", border: "border-orange-200" },
  INT: { text: "text-blue-800", bg: "bg-blue-50", border: "border-blue-200" },
  WIS: { text: "text-teal-800", bg: "bg-teal-50", border: "border-teal-200" },
  CHA: { text: "text-purple-800", bg: "bg-purple-50", border: "border-purple-200" }
};

// Kustom DOM-based Confetti untuk 100% Keandalan & Bebas Dependensi Eksternal
const triggerCelebrationConfetti = () => {
  const duration = 4.5 * 1000;
  const animationEnd = Date.now() + duration;

  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 40 * (timeLeft / duration);
    
    for (let i = 0; i < Math.floor(particleCount / 4); i++) {
      const confetti = document.createElement('div');
      confetti.className = 'fixed pointer-events-none z-[9999] rounded-sm transition-opacity duration-1000';
      
      const width = randomInRange(7, 14);
      const height = randomInRange(7, 14);
      confetti.style.width = `${width}px`;
      confetti.style.height = `${height}px`;
      
      const colors = ['#f59e0b', '#d97706', '#b45309', '#fef3c7', '#fcd34d', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'];
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      
      confetti.style.left = `${randomInRange(0, 100)}vw`;
      confetti.style.top = `-20px`;
      confetti.style.transform = `rotate(${randomInRange(0, 360)}deg)`;
      
      document.body.appendChild(confetti);
      
      const speedY = randomInRange(3, 7);
      const speedX = randomInRange(-2, 2);
      let currentTop = -20;
      let currentLeft = parseFloat(confetti.style.left);
      
      const fall = () => {
        currentTop += speedY;
        currentLeft += speedX;
        confetti.style.top = `${currentTop}px`;
        confetti.style.left = `${currentLeft}vw`;
        
        if (currentTop < window.innerHeight) {
          requestAnimationFrame(fall);
        } else {
          confetti.remove();
        }
      };
      
      requestAnimationFrame(fall);
    }
  }, 160);
};

export default function FinalizeStep() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedId, setGeneratedId] = useState<string>("");
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isStartingGame, setIsStartingGame] = useState(false);
  
  const { data: session, status } = useSession();
  const store = useCharacterStore();
  const dossierRef = useRef<HTMLDivElement>(null);

  const rulesClass = CLASSES[store.charClass] || null;
  const rulesRace = RACES[store.race] || null;
  const rulesSubrace = rulesRace?.subraces?.find((s: any) => s.name === store.subrace) || null;
  const rulesBg = BACKGROUNDS[store.background] || null;

  const displayAvatar = store.avatarUrl || rulesClass?.image || null;
  
  const proxiedAvatar = displayAvatar?.startsWith('http') 
    ? `https://corsproxy.io/?${encodeURIComponent(displayAvatar)}` 
    : displayAvatar;

  const finalStats = useMemo(() => {
    const getBonus = (stat: string) => {
      if (store.asiChoice === "standard") return (rulesRace?.bonuses[stat] || 0) + (rulesSubrace?.bonuses[stat] || 0);
      if (store.asiChoice === "custom21") return stat === store.customBonus1 ? 2 : stat === store.customBonus2 ? 1 : 0;
      if (store.asiChoice === "custom111") return (store.customBonus1 === stat || store.customBonus2 === stat || store.customBonus3 === stat) ? 1 : 0;
      return 0;
    };
    return {
      STR: store.baseStats.STR + getBonus("STR"), DEX: store.baseStats.DEX + getBonus("DEX"),
      CON: store.baseStats.CON + getBonus("CON"), INT: store.baseStats.INT + getBonus("INT"),
      WIS: store.baseStats.WIS + getBonus("WIS"), CHA: store.baseStats.CHA + getBonus("CHA"),
    };
  }, [store.baseStats, store.asiChoice, store.customBonus1, store.customBonus2, store.customBonus3, rulesRace, rulesSubrace]);

  const calcMod = (val: number) => Math.floor((val - 10) / 2);
  const hpPreview = (rulesClass?.hitDie || 10) + calcMod(finalStats.CON);
  const acPreview = rulesRace?.traits?.some((t: any) => t.name === "Natural Armor") ? 17 : (10 + calcMod(finalStats.DEX));
  const initiative = calcMod(finalStats.DEX);
  const speed = rulesRace?.speed || 30;

  const allProficientSkills = useMemo(() => {
    const bgSkills = rulesBg?.skills || [];
    const classSkills = store.selectedClassSkills || [];
    return Array.from(new Set([...bgSkills, ...classSkills]));
  }, [rulesBg, store.selectedClassSkills]);

  const finalEquipmentList = useMemo(() => {
    const finalEquip = [];
    if (!store.useStartingWealth) {
      if (rulesBg?.equipment) finalEquip.push(...rulesBg.equipment);
      if (rulesClass?.baseEquipment) finalEquip.push(...rulesClass.baseEquipment);
      Object.values(store.equipmentSelections).forEach(item => finalEquip.push(item as string));
    } else {
      finalEquip.push("Traveler's clothes", "A coin pouch containing initial trade funds");
    }
    return finalEquip;
  }, [store.useStartingWealth, rulesBg, rulesClass, store.equipmentSelections]);

  const handleSubmit = async () => {
    if (status !== "authenticated" || !session?.user?.email) {
      store.showToast("Kamu harus Login / Register terlebih dahulu untuk merekam pahlawanmu!", "error");
      router.push("/login");
      return;
    }

    playSubmitSound();
    setIsSubmitting(true);
    
    const finalClassName = `${store.charClass}${store.subclass ? ` (${store.subclass})` : ''}`;
    const finalRaceName = store.subrace ? `${store.race} (${store.subrace})` : store.race;
    
    const flattenedTraits = [
      ...(rulesRace?.traits ? rulesRace.traits.map((t: any) => t.name) : []),
      ...(rulesSubrace?.traits ? rulesSubrace.traits.map((t: any) => t.name) : [])
    ];

    const payload: CharacterPayload = {
      userEmail: session.user.email,
      name: store.name || "Unnamed Hero", 
      race: finalRaceName, 
      class: finalClassName, 
      alignment: store.alignment || "True Neutral", 
      background: store.background || "Folk Hero",
      avatarUrl: displayAvatar || "", 
      level: 1, 
      hpMax: hpPreview, 
      currentHp: hpPreview, 
      armorClass: acPreview,
      speed: speed, 
      initiative: initiative,
      stats: finalStats, 
      proficientSkills: allProficientSkills,
      equipment: finalEquipmentList, 
      spells: [...(store.spells || [])],
      features: flattenedTraits, 
      spellCastingStat: rulesClass?.spellcasting || "NONE", 
      weapons: [],
      roleplay: { traits: store.traits, ideals: store.ideals, bonds: store.bonds, flaws: store.flaws },
      currency: { cp: 0, sp: 0, ep: 0, gp: store.gold, pp: 0 },
      conditions: []
    };

    try {
      const result = await createCharacterAction(payload);
      if (result?.success) {
        setGeneratedId(result.id || `dnd-${Math.random().toString(36).substring(2, 11)}`);
        setIsSuccess(true);
        setIsSubmitting(false);
        playFanfareSound();
        triggerCelebrationConfetti();
        store.showToast("Karakter berhasil dicatat ke dalam sejarah Realm!", "success");
      }
    } catch (err) { 
      store.showToast("Gagal merajut anyaman Weave. Gagal menciptakan karakter.", "error");
      setIsSubmitting(false); 
    }
  };

  const handleCopyLink = () => {
    const shareableUrl = `${window.location.origin}/characters/${generatedId}`;
    navigator.clipboard.writeText(shareableUrl);
    setIsCopied(true);
    store.showToast("Link karakter berhasil disalin ke Clipboard!", "success");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    if (!dossierRef.current) return;
    setIsDownloading(true);
    
    try {
      const element = dossierRef.current;
      const canvasWidth = element.offsetWidth;
      const canvasHeight = element.offsetHeight;

      const dataUrl = await toJpeg(element, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: "#fdfaf6",
        style: {
          transform: "scale(1)", 
          transformOrigin: "top left"
        }
      });
      
      const pdf = new jsPDF({
        orientation: canvasWidth > canvasHeight ? "landscape" : "portrait",
        unit: "px",
        format: [canvasWidth, canvasHeight]
      });
      
      pdf.addImage(dataUrl, "JPEG", 0, 0, canvasWidth, canvasHeight);
      pdf.save(`${store.name || 'Hero'}_Dossier_DNDONLINE.pdf`);
      
      store.showToast("Dossier berhasil diekspor menjadi lembar cetak PDF!", "success");
    } catch (error) {
      console.error("Gagal mengekspor PDF:", error);
      store.showToast("Gagal mengekspor dokumen PDF. Pastikan tautan avatar terdistribusi aman.", "error");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleFinish = () => {
    store.reset();
    router.push("/characters");
  };

  const handlePlayNow = async () => {
    if (!session?.user?.email) return;
    setIsStartingGame(true);
    store.showToast("Mempersiapkan dunia solo AI untuk pahlawan Anda...", "success");
    try {
      const res = await createSoloCampaignAction(session.user.email, generatedId);
      if (res.success) {
        store.reset();
        router.push(`/campaigns/${res.campaignId}`);
      } else {
        store.showToast(res.error || "Gagal membuka gerbang realm permainan.", "error");
      }
    } catch (e) {
      store.showToast("Terjadi kegagalan jaringan transmisi Weave.", "error");
    } finally {
      setIsStartingGame(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] relative z-10 w-full animate-fadeIn pb-32 px-4 lg:px-10 max-w-6xl mx-auto">
      
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div 
            key="header-review"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-full border border-amber-200 text-amber-700 text-[10px] font-black uppercase tracking-[0.2em] mb-3">
              <Scroll className="w-3.5 h-3.5" /> Evaluasi Terakhir
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-stone-900 mb-2 uppercase tracking-tighter drop-shadow-sm">Sahkan Lembar Karakter</h2>
            <p className="text-stone-500 max-w-2xl mx-auto leading-relaxed text-[10px] uppercase tracking-[0.2em] font-bold">Pastikan semua alokasi taktis, logistik persenjataan, dan identitas batin Anda sudah sesuai.</p>
          </motion.div>
        ) : (
          <motion.div 
            key="header-success"
            initial={{ y: 55, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            className="text-center mb-8 flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-full bg-green-100 border border-green-300 flex items-center justify-center text-green-700 mb-4 shadow-sm animate-bounce">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-green-800 mb-2 uppercase tracking-tighter drop-shadow-sm">Legenda Telah Bangkit</h2>
            <p className="text-stone-500 max-w-2xl mx-auto leading-relaxed text-[10px] uppercase tracking-[0.2em] font-bold">Hero Anda telah terpatri abadi di database Realm DNDONLINE.</p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* ========================================================================= */}
      {/* DETAILED DOUBLE-PAGE PARCHMENT CHARACTER SHEET VIEW */}
      {/* ========================================================================= */}
      <motion.div 
        ref={dossierRef}
        className="w-full bg-[#fdfaf6] border border-[#d4c5b0] rounded-[2rem] shadow-2xl overflow-hidden mb-10 relative flex flex-col focus-within:border-amber-500 transition-colors duration-300"
        style={{ minHeight: '850px' }}
      >
        {/* Shadow Overlay Folds effect */}
        <div className="absolute inset-0 opacity-[0.25] mix-blend-multiply pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] z-0" />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-900/5 via-transparent to-stone-900/5 pointer-events-none z-10" />

        {/* TOP CALLIGRAPHIC HEADER BLOCK */}
        <div className="bg-stone-950 w-full p-8 md:p-10 border-b-[6px] border-amber-700 flex flex-col md:flex-row items-center gap-8 md:gap-10 relative overflow-hidden shadow-md">
          
          <div className="absolute top-1/2 -translate-y-1/2 right-4 opacity-[0.025] pointer-events-none text-[12rem] md:text-[16rem] font-black leading-none text-white select-none">
            {store.charClass}
          </div>
          
          {/* Avatar Shield Frame */}
          <div className="relative z-10 w-36 h-36 md:w-40 md:h-40 rounded-full border-4 border-amber-600 bg-stone-850 shadow-[0_0_25px_rgba(217,119,6,0.3)] shrink-0 flex items-center justify-center overflow-hidden">
             {proxiedAvatar ? (
               <img src={proxiedAvatar} alt="Avatar" crossOrigin="anonymous" className="w-full h-full object-cover select-none pointer-events-none" />
             ) : (
               <User className="w-16 h-16 text-stone-500" />
             )}
          </div>
          
          {/* Title & Lore Metadata */}
          <div className="relative z-10 flex-1 text-center md:text-left flex flex-col justify-center">
            <h3 className="text-4xl md:text-6xl font-black text-amber-500 uppercase tracking-tighter drop-shadow-md font-sans">
              {store.name || "UNNAMED HERO"}
            </h3>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
              <span className="bg-amber-700 text-stone-900 px-4.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-md flex items-center gap-1.5">
                <Award className="w-4 h-4 text-stone-900 shrink-0" /> LVL {store.level || 1}
              </span>
              <span className="text-stone-300 font-bold uppercase tracking-widest text-[11px] flex items-center gap-2">
                {store.subrace ? `${store.race} (${store.subrace})` : (store.race || "Human")} 
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 inline-block"></span> 
                {store.charClass} {store.subclass ? `(${store.subclass})` : ''}
              </span>
              <span className="text-stone-400 font-medium uppercase tracking-widest text-[10px] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-700 inline-block"></span> {store.background || "Folk Hero"} 
                <span className="w-1.5 h-1.5 rounded-full bg-stone-700 inline-block"></span> {store.alignment || "True Neutral"}
              </span>
            </div>
          </div>
          
          {/* Wax Seal / Logo */}
          <div className="relative z-10 hidden lg:block text-right self-end pb-2 shrink-0 select-none">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-red-900 border-2 border-red-500 flex items-center justify-center shadow-lg transform rotate-12 mx-auto mb-3">
              <span className="text-[10px] font-black text-amber-100 uppercase tracking-tighter font-serif drop-shadow">D&D</span>
            </div>
            <div className="text-stone-400 text-[8px] font-black uppercase tracking-[0.2em]">Official Record</div>
          </div>
        </div>

        {/* PARCHMENT SHEET BODY */}
        <div className="flex flex-col lg:flex-row flex-1 w-full relative z-10 bg-[#fdfaf6]">
          
          {/* ========================================== */}
          {/* LEFT PANEL: ABILITY SCORE HEXAGONS */}
          {/* ========================================== */}
          <div className="w-full lg:w-[18%] bg-stone-50 border-r border-[#d4c5b0]/60 p-6 flex flex-col sm:flex-row lg:flex-col gap-5 items-center justify-center shrink-0">
            {STAT_OPTIONS.map(stat => {
              const finalVal = finalStats[stat as keyof typeof finalStats];
              const mod = calcMod(finalVal);
              const colors = STAT_COLORS[stat];
              
              return (
                <div 
                  key={stat} 
                  className={`w-24 h-32 bg-white border border-[#d4c5b0] rounded-2xl flex flex-col items-center justify-center relative shadow-sm group hover:border-amber-500 transition-colors ${colors.border}`}
                >
                  {/* Hexagon icon bg */}
                  <div className="absolute top-2.5 text-stone-400 font-extrabold uppercase text-[9px] tracking-widest leading-none">
                    {stat}
                  </div>
                  
                  {/* Big Modifier */}
                  <span className={`text-4xl font-black font-mono tracking-tighter leading-none mt-4.5 ${colors.text}`}>
                    {mod >= 0 ? `+${mod}` : mod}
                  </span>
                  
                  {/* Small Base Score Badge */}
                  <div className="w-11 h-6.5 bg-[#fdfaf6] border border-[#d4c5b0] rounded-xl absolute -bottom-3.5 flex items-center justify-center shadow-sm">
                    <span className="text-[11px] font-black text-stone-700 font-mono">{finalVal}</span>
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* ========================================== */}
          {/* CENTER PANEL: COMBAT VITALS & DETAILED BLOCKS */}
          {/* ========================================== */}
          <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 lg:border-r border-[#d4c5b0]/60">
            
            {/* Vitals Circle Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 justify-center">
              {[
                { label: "Armor Class", val: acPreview, icon: <Shield className="w-6 h-6 text-amber-900/20" />, color: "text-amber-850 bg-amber-50/50 border-amber-200" },
                { label: "Inisiatif", val: initiative >= 0 ? `+${initiative}` : initiative, icon: <Zap className="w-6 h-6 text-green-900/20" />, color: "text-green-800 bg-green-50/50 border-green-200" },
                { label: "Kecepatan", val: `${speed} Kaki`, icon: <Footprints className="w-6 h-6 text-stone-900/20" />, color: "text-stone-850 bg-stone-50 border-[#d4c5b0]" },
                { label: "HP Maksimal", val: hpPreview, icon: <Heart className="w-6 h-6 text-red-900/20" />, color: "text-red-800 bg-red-50 border-red-200" }
              ].map((vital, i) => (
                <div 
                  key={i} 
                  className={`border rounded-2.5xl flex flex-col p-5 items-center justify-center relative overflow-hidden shadow-sm ${vital.color}`}
                >
                  <div className="absolute top-3 left-3">{vital.icon}</div>
                  <span className="text-3.5xl md:text-4.5xl font-black tracking-tighter leading-none z-10 font-mono">{vital.val}</span>
                  <span className="text-[8.5px] font-black text-stone-500 uppercase tracking-widest mt-2.5 z-10">{vital.label}</span>
                </div>
              ))}
            </div>

            {/* Inner Details 2-Column */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
              
              {/* Left Details: Skills & Traits */}
              <div className="bg-white border border-[#d4c5b0] rounded-2.5xl p-5.5 shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="text-[10px] font-black text-stone-900 uppercase tracking-[0.2em] mb-4 border-b border-[#d4c5b0]/60 pb-2.5 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-700" /> Keahlian Keterampilan
                  </h4>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {allProficientSkills.map((skill: string) => (
                      <span key={skill} className="text-[9.5px] font-bold bg-[#fdfaf6] text-stone-700 border border-[#d4c5b0] px-2.5 py-1.5 rounded-lg uppercase tracking-wide">
                        {skill}
                      </span>
                    ))}
                    {allProficientSkills.length === 0 && (
                      <span className="text-[10px] text-stone-400 font-bold italic">Tidak ada keahlian kemahiran terpilih.</span>
                    )}
                  </div>

                  <h4 className="text-[10px] font-black text-stone-900 uppercase tracking-[0.2em] mb-4 border-b border-[#d4c5b0]/60 pb-2.5 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-700" /> Bakat & Fitur Rasial
                  </h4>
                  
                  <div className="flex flex-wrap gap-2">
                    {rulesRace?.traits?.map((t: any) => (
                      <span key={t.name} className="text-[9.5px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1.5 rounded-lg uppercase tracking-wide">
                        {t.name}
                      </span>
                    ))}
                    {rulesSubrace?.traits?.map((t: any) => (
                      <span key={`sub-${t.name}`} className="text-[9.5px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1.5 rounded-lg uppercase tracking-wide">
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[#d4c5b0]/60 pt-4 mt-6 flex justify-between items-center text-[9px] font-black text-stone-400 uppercase tracking-widest">
                  <span>Saving Throws</span>
                  <span className="text-stone-700 font-bold">
                    {rulesClass?.saves?.join(", ") || "None"}
                  </span>
                </div>
              </div>

              {/* Right Details: Persona Batin */}
              <div className="bg-white border border-[#d4c5b0] rounded-2.5xl p-5.5 shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="text-[10px] font-black text-stone-900 uppercase tracking-[0.2em] mb-4 border-b border-[#d4c5b0]/60 pb-2.5 flex items-center gap-2">
                    <User className="w-4 h-4 text-stone-500" /> Karakter & Persona Batin
                  </h4>
                  
                  <div className="space-y-4 text-xs text-stone-600 leading-relaxed font-semibold italic">
                    <div>
                      <strong className="text-[8px] not-italic font-black text-stone-400 uppercase tracking-[0.15em] block mb-0.5">Sifat & Kebiasaan (Traits)</strong>
                      <span>"{store.traits || "Mempunyai batin petualang tak gentar."}"</span>
                    </div>
                    <div>
                      <strong className="text-[8px] not-italic font-black text-stone-400 uppercase tracking-[0.15em] block mb-0.5">Keyakinan & Idealisme (Ideals)</strong>
                      <span>"{store.ideals || "Menjaga kemerdekaan batin."}"</span>
                    </div>
                    <div>
                      <strong className="text-[8px] not-italic font-black text-stone-400 uppercase tracking-[0.15em] block mb-0.5">Ikatan Batin (Bonds)</strong>
                      <span>"{store.bonds || "Melindungi sesama yang terancam."}"</span>
                    </div>
                    <div>
                      <strong className="text-[8px] not-italic font-black text-stone-400 uppercase tracking-[0.15em] block mb-0.5">Kelemahan Jiwa (Flaws)</strong>
                      <span>"{store.flaws || "Mudah terpancing rasa penasaran reruntuhan purba."}"</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#d4c5b0]/60 pt-4 mt-6 flex justify-between items-center text-[9px] font-black text-stone-400 uppercase tracking-widest">
                  <span>Lifestyle (Gaya Hidup)</span>
                  <span className="text-stone-750 font-bold">{store.lifestyle || "Modest"}</span>
                </div>
              </div>

            </div>

          </div>

          {/* ========================================== */}
          {/* RIGHT PANEL: LOGISTIK BAG & GRIMOIRE STATS */}
          {/* ========================================== */}
          <div className="w-full lg:w-[25%] bg-stone-50 border-l border-[#d4c5b0]/60 p-6 flex flex-col gap-6 shrink-0 justify-between">
            
            <div className="space-y-6">
              {/* Wealth display */}
              <div className="bg-white border border-[#d4c5b0] rounded-2xl p-5 shadow-sm text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-5">
                  <Coins className="w-12 h-12" />
                </div>
                <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest block mb-1">Pundi Keuangan Awal</span>
                <span className="text-4xl font-black text-yellow-700 flex items-center justify-center gap-1.5 font-mono">
                  {store.gold} <span className="text-sm font-sans font-black text-yellow-800">GP</span>
                </span>
              </div>

              {/* Logistik Inventory */}
              <div className="bg-white border border-[#d4c5b0] rounded-2xl p-5 shadow-sm flex flex-col justify-between min-h-[220px]">
                <div>
                  <h4 className="text-[9.5px] font-black text-stone-900 uppercase tracking-[0.2em] mb-4 border-b border-[#d4c5b0]/60 pb-2.5 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-stone-500" /> Inventaris Logistik
                  </h4>
                  
                  <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1 select-none custom-scrollbar">
                    {finalEquipmentList.map((item, idx) => (
                      <span key={idx} className="text-[10px] font-bold text-stone-600 leading-normal border-b border-stone-100 pb-1.5 last:border-0 last:pb-0">
                        • {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Magis Grimoire */}
              <div className="bg-white border border-[#d4c5b0] rounded-2xl p-5 shadow-sm text-center">
                <h4 className="text-[9.5px] font-black text-cyan-800 uppercase tracking-[0.2em] mb-3 border-b border-[#d4c5b0]/60 pb-2 flex items-center justify-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-cyan-700" /> Grimoire Terdaftar
                </h4>
                <div className="text-5xl font-black text-cyan-700 leading-none py-2 font-mono">
                  {store.spells?.length || 0}
                </div>
                <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest mt-1 block">Mantra Terpatri</span>
              </div>
            </div>

            <div className="text-center text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] pt-4 select-none leading-relaxed border-t border-[#d4c5b0]/40">
              Realm DNDONLINE Record
            </div>

          </div>

        </div>

      </motion.div>

      {/* ========================================================================= */}
      {/* SEKSI: DOCK ACTION BUTTONS */}
      {/* ========================================================================= */}
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div 
            key="submit-dock"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0, filter: "blur(5px)" }}
            className="w-full max-w-3xl flex flex-col gap-5 items-center z-10"
          >
            {/* Sahkan Karakter button */}
            <button 
              onClick={handleSubmit} 
              disabled={isSubmitting} 
              className="w-full relative group overflow-hidden rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-xl border-2 border-stone-900 shrink-0 cursor-pointer"
            >
              <div className="absolute inset-0 bg-stone-900 transition-all duration-500 group-hover:bg-stone-850"></div>
              
              <div className="relative z-10 py-5.5 flex items-center justify-center gap-3.5 text-stone-100">
                 {isSubmitting ? (
                   <>
                     <RefreshCw className="w-5.5 h-5.5 text-amber-500 animate-spin" />
                     <span className="text-base font-black tracking-[0.25em] uppercase font-sans">Mengunci Takdir Pahlawan...</span>
                   </>
                 ) : (
                   <>
                     <Sword className="w-5 h-5 text-amber-500 transition-transform group-hover:rotate-12" />
                     <span className="text-base font-black tracking-[0.25em] uppercase font-sans">SAHKAN KARAKTER HERO</span>
                     <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                   </>
                 )}
              </div>
            </button>
            
            {/* Back to Edit */}
            <button 
              onClick={() => router.push('/characters/new/equipment')}
              disabled={isSubmitting}
              className="text-[9.5px] font-black text-stone-500 hover:text-stone-800 uppercase tracking-[0.2em] transition-colors py-2 flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:underline"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali Koreksi Logistik
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="success-dock"
            initial={{ y: 35, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-4.5 z-10"
          >
            {/* Download PDF button */}
            <button 
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="bg-white border-2 border-amber-800 hover:bg-amber-50 text-amber-900 rounded-xl py-5 font-black uppercase tracking-wider transition-all active:scale-97 flex items-center justify-center gap-3.5 group shadow-md cursor-pointer"
            >
              {isDownloading ? (
                <RefreshCw className="w-5 h-5 animate-spin text-amber-800" />
              ) : (
                <Download className="w-5 h-5 text-amber-800 group-hover:-translate-y-1 transition-transform" />
              )}
              <span className="text-[10px]">{isDownloading ? 'MENGEKSPOR DOSSIER...' : 'DOWNLOAD ARSIP DOSSIER (PDF)'}</span>
            </button>

            {/* Share Link button */}
            <button 
              onClick={handleCopyLink}
              className={`border-2 rounded-xl py-5 font-black uppercase tracking-wider transition-all active:scale-97 flex items-center justify-center gap-3.5 group shadow-md cursor-pointer
              ${isCopied ? 'bg-green-50 border-green-600 text-green-800 hover:bg-green-100' : 'bg-white border-amber-800 hover:bg-amber-50 text-amber-900'}`}
            >
              {isCopied ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" />
              ) : (
                <Link className="w-5 h-5 text-amber-800 group-hover:scale-110 transition-transform" />
              )}
              <span className="text-[10px]">{isCopied ? 'TAUTAN BERHASIL DISALIN!' : 'SALIN TAUTAN BAGIKAN (SHARE)'}</span>
            </button>

            {/* Play Now big button */}
            <button 
              onClick={handlePlayNow}
              disabled={isStartingGame}
              className="md:col-span-2 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 hover:from-amber-600 hover:via-amber-500 hover:to-amber-400 text-stone-900 rounded-2xl py-6 font-black uppercase tracking-[0.25em] transition-all active:scale-[0.98] flex items-center justify-center gap-4.5 group shadow-2xl border-2 border-amber-800/80 cursor-pointer text-base hover:shadow-amber-900/20"
            >
              {isStartingGame ? (
                <RefreshCw className="w-5.5 h-5.5 animate-spin text-stone-900" />
              ) : (
                <Sword className="w-5.5 h-5.5 text-stone-900 group-hover:rotate-12 transition-transform" />
              )}
              <span>{isStartingGame ? 'MEMBUKA PORTAL REALM...' : '⚔️ MULAI PETUALANGAN SEKARANG!'}</span>
            </button>

            {/* Hall of Heroes */}
            <button 
              onClick={handleFinish}
              className="md:col-span-2 mt-4 bg-transparent border-none text-stone-500 hover:text-stone-850 font-black uppercase tracking-widest text-[9.5px] transition-colors py-3 flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:underline"
            >
              <ArrowLeft className="w-4 h-4" /> Buka Hall of Heroes (Daftar Karakter)
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}