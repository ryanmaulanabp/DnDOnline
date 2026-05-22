"use client";

import { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCharacterStore } from "@/store/useCharacterStore";
import { createCharacterAction, CharacterPayload } from "@/app/actions/character";
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
  ArrowLeft
} from "lucide-react";

const playSubmitSound = () => {
  try {
    const audio = new Audio('/sounds/submit.mp3'); 
    audio.volume = 0.4;
    audio.play().catch(() => {});
  } catch (e) {}
};

const STAT_OPTIONS = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
const STAT_COLORS: Record<string, string> = {
  STR: "text-red-700", DEX: "text-green-700", CON: "text-orange-700",
  INT: "text-amber-900", WIS: "text-teal-700", CHA: "text-amber-800"
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
};
const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function FinalizeStep() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedId, setGeneratedId] = useState<string>("hero-id-1234");
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
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

  const handleSubmit = async () => {
    if (status !== "authenticated" || !session?.user?.email) {
      store.showToast("Kamu harus Login / Register terlebih dahulu untuk menyimpan pahlawanmu ke Realm!", "error");
      router.push("/login");
      return;
    }

    playSubmitSound();
    setIsSubmitting(true);
    
    const allProficientSkills = [...(rulesBg?.skills || []), ...store.selectedClassSkills];
    
    const finalEquipment = [];
    if (!store.useStartingWealth) {
      finalEquipment.push(...(rulesBg?.equipment || []));
      if (rulesClass?.baseEquipment) finalEquipment.push(...rulesClass.baseEquipment);
      Object.values(store.equipmentSelections).forEach(item => finalEquipment.push(item as string));
    } else {
      finalEquipment.push("Set of traveler's clothes", "A pouch");
    }

    const finalClassName = `${store.charClass}${store.subclass ? ` (${store.subclass})` : ''}`;
    const finalRaceName = store.subrace ? `${store.race} (${store.subrace})` : store.race;
    const flattenedTraits = [
      ...(rulesRace?.traits ? rulesRace.traits.map((t: any) => t.name) : []),
      ...(rulesSubrace?.traits ? rulesSubrace.traits.map((t: any) => t.name) : [])
    ];

    const payload: CharacterPayload = {
      userEmail: session.user.email,
      name: store.name || "Unnamed Hero", race: finalRaceName, class: finalClassName, alignment: store.alignment || "True Neutral", background: store.background || "Folk Hero",
      avatarUrl: displayAvatar || "", 
      level: 1, hpMax: hpPreview, currentHp: hpPreview, armorClass: acPreview,
      speed: speed, initiative: initiative,
      stats: finalStats, proficientSkills: allProficientSkills,
      equipment: finalEquipment, spells: [...(store.spells || [])],
      features: flattenedTraits, spellCastingStat: "NONE", weapons: [],
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
        store.showToast("Karakter berhasil direkam ke dalam sejarah Realm!", "success");
      }
    } catch (err) { 
      store.showToast("Gagal menciptakan karakter. Ada gangguan pada jaringan Weave.", "error");
      setIsSubmitting(false); 
    }
  };

  const handleCopyLink = () => {
    const shareableUrl = `${window.location.origin}/characters/${generatedId}`;
    navigator.clipboard.writeText(shareableUrl);
    setIsCopied(true);
    store.showToast("Link berhasil disalin ke Clipboard!", "success");
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
      
      store.showToast("Dossier berhasil diekspor menjadi PDF!", "success");
    } catch (error) {
      console.error("Gagal mengekspor PDF:", error);
      store.showToast("Gagal mengekspor PDF. Pastikan gambar avatar Anda bisa diakses secara publik.", "error");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleFinish = () => {
    store.reset();
    router.push("/");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] relative z-10 w-full animate-fadeIn pb-32 px-4 lg:px-10">
      
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div 
            key="header-review"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-8"
          >
            <h2 className="text-4xl md:text-5xl font-black text-stone-900 mb-2 uppercase tracking-tighter drop-shadow-sm">Gerbang Realm Menanti</h2>
            <p className="text-stone-500 max-w-2xl mx-auto leading-relaxed text-[10px] uppercase tracking-[0.2em] font-bold">Semua persiapan sudah selesai. Review lembar karakter final Anda di bawah ini.</p>
          </motion.div>
        ) : (
          <motion.div 
            key="header-success"
            initial={{ y: 50, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            className="text-center mb-8 flex flex-col items-center"
          >
            <Sparkles className="w-16 h-16 text-emerald-600 mb-4 animate-bounce" />
            <h2 className="text-5xl md:text-6xl font-black text-emerald-700 mb-3 uppercase tracking-tighter drop-shadow-sm">Pahlawan Terlahir</h2>
            <p className="text-stone-500 max-w-2xl mx-auto leading-relaxed text-xs uppercase tracking-widest font-bold">Realm menyambut kehadiranmu. Simpan arsip karakter ini.</p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* DOSSIER / FULL LANDSCAPE SHEET */}
      <motion.div 
        ref={dossierRef}
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full bg-[#fdfaf6] border border-[#d4c5b0] rounded-xl shadow-2xl overflow-hidden mb-12 relative flex flex-col"
        style={{ minHeight: '800px' }}
      >
        {/* TOP BANNER: Identity */}
        <div className="bg-stone-950 w-full p-8 md:p-10 border-b-[6px] border-amber-700 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden shadow-md">
          <div className="absolute top-1/2 -translate-y-1/2 right-4 opacity-[0.03] pointer-events-none text-[10rem] md:text-[14rem] font-black leading-none text-stone-900 overflow-hidden whitespace-nowrap tracking-tighter">
            {store.charClass}
          </div>
          
          <div className="relative z-10 w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-amber-600 bg-stone-800 shadow-[0_0_20px_rgba(217,119,6,0.5)] flex-shrink-0 flex items-center justify-center overflow-hidden">
             {proxiedAvatar ? (
               <img src={proxiedAvatar} alt="Avatar" crossOrigin="anonymous" className="w-full h-full object-cover" />
             ) : (
               <User className="w-16 h-16 text-stone-500" />
             )}
          </div>
          
          <div className="relative z-10 flex-1 w-full text-center md:text-left flex flex-col justify-center">
            <h3 className="text-4xl md:text-6xl font-black text-stone-900 uppercase tracking-tighter mb-2 drop-shadow-lg">
              {store.name || "UNNAMED HERO"}
            </h3>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <span className="bg-amber-700 text-amber-50 px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-widest shadow-md">
                LVL {store.level || 1}
              </span>
              <span className="text-stone-300 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                {store.subrace ? `${store.race} (${store.subrace})` : (store.race || "Human")} <span className="w-1.5 h-1.5 rounded-full bg-amber-600 inline-block"></span> {store.charClass || "Class"}
              </span>
              <span className="text-stone-400 font-medium uppercase tracking-widest text-xs flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-600 inline-block"></span> {store.background || "Unknown"} <span className="w-1.5 h-1.5 rounded-full bg-stone-600 inline-block"></span> {store.alignment || "Neutral"}
              </span>
            </div>
          </div>
          
          <div className="relative z-10 hidden lg:block text-right">
            <div className="text-amber-500/50 text-[10px] font-black uppercase tracking-[0.3em] mb-1">DNDONLINE</div>
            <div className="text-stone-300 text-xs font-bold uppercase tracking-widest">Official Record</div>
          </div>
        </div>

        {/* MAIN BODY: 3-Column D&D Style Grid */}
        <div className="flex flex-col lg:flex-row flex-1 w-full relative z-10">
          
          {/* LEFT: Ability Scores */}
          <div className="w-full lg:w-[15%] min-w-[120px] bg-stone-100/50 border-r border-[#d4c5b0] p-6 flex flex-col gap-4 items-center shrink-0">
            {STAT_OPTIONS.map(stat => {
              const finalVal = finalStats[stat as keyof typeof finalStats];
              const mod = calcMod(finalVal);
              return (
                <div key={stat} className="w-24 h-32 bg-white border-2 border-[#d4c5b0] rounded-xl flex flex-col items-center justify-center relative shadow-sm group hover:border-amber-500 transition-colors">
                  <span className="text-[9px] font-black text-stone-900 uppercase tracking-widest mb-1 absolute top-3">{stat}</span>
                  <span className="text-4xl font-black text-stone-900 tracking-tighter mt-4">{mod >= 0 ? `+${mod}` : mod}</span>
                  <div className="w-10 h-6 bg-stone-100 border border-[#d4c5b0] rounded-full absolute -bottom-3 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-stone-600">{finalVal}</span>
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* CENTER: Combat Vitals & Details */}
          <div className="flex-1 p-6 lg:p-10 flex flex-col gap-8">
            {/* Vitals Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 justify-center">
              {[
                { label: "Armor Class", val: acPreview, icon: <Shield className="w-8 h-8 text-amber-900/10" />, outline: "border-amber-300 bg-gradient-to-b from-amber-100/50 to-white", text: "text-amber-900" },
                { label: "Initiative", val: initiative >= 0 ? `+${initiative}` : initiative, icon: <Zap className="w-8 h-8 text-green-900/10" />, outline: "border-green-200 bg-gradient-to-b from-green-50/50 to-white", text: "text-green-900" },
                { label: "Speed", val: `${speed}ft`, icon: <Footprints className="w-8 h-8 text-stone-900/10" />, outline: "border-[#d4c5b0] bg-gradient-to-b from-[#fdfaf6] to-white", text: "text-stone-900" },
                { label: "Max HP", val: hpPreview, icon: <Heart className="w-8 h-8 text-red-900/10" />, outline: "border-red-200 bg-gradient-to-b from-red-50 to-white shadow-inner", text: "text-red-900" }
              ].map((vital, i) => (
                <div key={i} className={`border-2 rounded-3xl flex flex-col p-6 lg:p-8 relative overflow-hidden items-center justify-center ${vital.outline}`}>
                  <div className="absolute top-4 left-4">{vital.icon}</div>
                  <span className={`text-5xl lg:text-6xl font-black tracking-tighter leading-none z-10 drop-shadow-sm ${vital.text}`}>{vital.val}</span>
                  <span className="text-[10px] lg:text-xs font-black text-stone-600 uppercase tracking-widest mt-3 z-10">{vital.label}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col lg:flex-row gap-8 flex-1">
              {/* Proficiencies & Skills */}
              <div className="flex-1 bg-white border border-[#d4c5b0] rounded-2xl p-6 shadow-sm flex flex-col">
                <h4 className="text-[10px] font-black text-stone-800 uppercase tracking-[0.2em] mb-4 border-b border-[#d4c5b0] pb-2 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Proficiencies & Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {store.selectedClassSkills.map((skill: string) => (
                    <span key={skill} className="text-[10px] font-bold bg-stone-100 text-stone-800 border border-stone-300 px-3 py-1 rounded-sm uppercase tracking-wider">{skill}</span>
                  ))}
                  {rulesClass?.proficiencies?.savingThrows?.map((st: string) => (
                    <span key={st} className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-sm uppercase tracking-wider">{st} Save</span>
                  ))}
                </div>
                
                <h4 className="text-[10px] font-black text-stone-800 uppercase tracking-[0.2em] mt-6 mb-4 border-b border-[#d4c5b0] pb-2 flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-800" /> Features & Traits</h4>
                <div className="flex flex-wrap gap-2">
                  {rulesRace?.traits?.map((t: any) => (
                    <span key={t.name} className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-sm uppercase tracking-wider">{t.name}</span>
                  ))}
                </div>
              </div>

              {/* Personality */}
              <div className="flex-1 bg-white border border-[#d4c5b0] rounded-2xl p-6 shadow-sm flex flex-col">
                <h4 className="text-[10px] font-black text-stone-800 uppercase tracking-[0.2em] mb-4 border-b border-[#d4c5b0] pb-2"><User className="w-4 h-4 text-stone-500 inline mr-2" />Personality</h4>
                <div className="flex flex-col gap-4 text-sm text-stone-600 italic">
                  <div><strong className="text-[9px] not-italic font-black text-stone-900 uppercase tracking-widest block mb-1">Personality Traits</strong>"{store.traits || "..."}"</div>
                  <div><strong className="text-[9px] not-italic font-black text-stone-900 uppercase tracking-widest block mb-1">Ideals</strong>"{store.ideals || "..."}"</div>
                  <div><strong className="text-[9px] not-italic font-black text-stone-900 uppercase tracking-widest block mb-1">Bonds</strong>"{store.bonds || "..."}"</div>
                  <div><strong className="text-[9px] not-italic font-black text-stone-900 uppercase tracking-widest block mb-1">Flaws</strong>"{store.flaws || "..."}"</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* RIGHT: Equipment & Spells */}
          <div className="w-full lg:w-[25%] min-w-[250px] bg-stone-100/50 border-l border-[#d4c5b0] p-6 flex flex-col gap-6 shrink-0">
            
            <div className="bg-white border-2 border-stone-300mber-700/20 rounded-xl p-5 shadow-sm text-center">
              <span className="text-[9px] font-black text-amber-900/50 uppercase tracking-widest block mb-1">Total Wealth</span>
              <span className="text-4xl font-black text-amber-700 flex items-center justify-center gap-2">{store.gold} <span className="text-sm">GP</span></span>
            </div>

            <div className="flex-1 bg-white border border-[#d4c5b0] rounded-xl p-5 shadow-sm flex flex-col">
              <h4 className="text-[10px] font-black text-stone-800 uppercase tracking-[0.2em] mb-4 border-b border-[#d4c5b0] pb-2">Spells Known</h4>
              <div className="text-5xl font-black text-cyan-700 mb-2 text-center">{store.spells?.length || 0}</div>
              <p className="text-[9px] text-stone-500 font-bold uppercase tracking-widest text-center leading-relaxed">Sihir telah ditambahkan ke Grimoire. Silakan lihat di dokumen terpisah atau di VTT Anda.</p>
            </div>
            
          </div>
        </div>
      </motion.div>

      {/* --- ACTION BUTTONS --- */}
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div 
            key="submit-btn"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0, filter: "blur(5px)" }}
            className="w-full max-w-3xl flex flex-col gap-6 items-center"
          >
            <button 
              onClick={handleSubmit} 
              disabled={isSubmitting} 
              className="w-full relative group overflow-hidden rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95 shadow-xl border border-[#d4c5b0]"
            >
              <div className="absolute inset-0 bg-stone-900 transition-all duration-500 group-hover:bg-stone-800"></div>
              <div className="relative z-10 py-6 flex items-center justify-center gap-4">
                 {isSubmitting ? (
                   <>
                     <RefreshCw className="w-6 h-6 text-amber-500 animate-spin" />
                     <span className="text-xl font-black text-stone-900 tracking-[0.3em] uppercase">Mencetak Legenda...</span>
                   </>
                 ) : (
                   <>
                     <Sword className="w-6 h-6 text-amber-500" />
                     <span className="text-xl font-black text-stone-900 tracking-[0.3em] uppercase">Sahkan Karakter</span>
                     <Sparkles className="w-6 h-6 text-amber-500" />
                   </>
                 )}
              </div>
            </button>
            
            <button 
              onClick={() => router.push('/characters/new/equipment')}
              disabled={isSubmitting}
              className="text-[10px] font-bold text-stone-500 hover:text-stone-700 uppercase tracking-[0.2em] transition-colors py-2 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Batal & Kembali Edit Equipment
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="success-actions"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <button 
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="bg-white border-2 border-amber-800 hover:bg-amber-100 text-amber-900 rounded-xl py-6 font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-4 group shadow-md"
            >
              {isDownloading ? (
                <RefreshCw className="w-6 h-6 animate-spin text-amber-800" />
              ) : (
                <Download className="w-6 h-6 text-amber-800 group-hover:-translate-y-1 transition-transform" />
              )}
              <span className="text-[10px]">{isDownloading ? 'MEMPROSES PDF...' : 'DOWNLOAD DOSSIER (PDF)'}</span>
            </button>

            <button 
              onClick={handleCopyLink}
              className={`border-2 rounded-xl py-6 font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-4 group shadow-md
              ${isCopied ? 'bg-green-50 border-green-600 text-green-800' : 'bg-white border-amber-800 hover:bg-amber-100 text-amber-900'}`}
            >
              {isCopied ? (
                <CheckCircle2 className="w-6 h-6 text-green-600 group-hover:scale-110 transition-transform" />
              ) : (
                <Link className="w-6 h-6 text-amber-800 group-hover:scale-110 transition-transform" />
              )}
              <span className="text-[10px]">{isCopied ? 'LINK DISALIN!' : 'COPY SHAREABLE LINK'}</span>
            </button>

            <button 
              onClick={handleFinish}
              className="md:col-span-2 mt-4 bg-transparent border-none text-stone-500 hover:text-stone-700 font-bold uppercase tracking-widest text-[10px] transition-colors py-4 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Tavern (Home) & Mulai Petualangan
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}