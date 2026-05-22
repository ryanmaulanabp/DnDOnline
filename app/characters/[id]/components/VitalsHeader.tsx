"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip } from "./HeroModules";
import { updateCharacterAvatarAction } from "@/app/actions/character";
import { User, Camera } from "lucide-react";

const EXP_TABLE = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 130000, 165000, 195000, 225000, 265000, 305000, 355000];

export const VitalsHeader = ({ hero, currentHp, tempHp, hpInput, setHpInput, handleHp, isReadOnly, displayAvatar, exp, onOpenExpModal, exhaustion, onLevelUp, currentLevel, imageFilter }: any) => {
  const activeMaxHp = exhaustion >= 4 ? Math.floor(hero.hpMax / 2) : hero.hpMax;
  const hpPercent = (currentHp / activeMaxHp) * 100;
  
  const currentLvlTarget = EXP_TABLE[currentLevel] || (currentLevel * 1000);
  const expPercent = Math.min((exp / currentLvlTarget) * 100, 100);
  const canLevelUp = exp >= currentLvlTarget;

  // State untuk Ganti Profil Foto
  const [avatarUrl, setAvatarUrl] = useState(displayAvatar);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [tempLink, setTempLink] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Membersihkan object URL dari memori browser saat tidak lagi dipakai
    return () => {
      if (avatarUrl && avatarUrl.startsWith("blob:")) {
        URL.revokeObjectURL(avatarUrl);
      }
    };
  }, [avatarUrl]);

  const handleFileUpload = (e: any) => {
     const file = e.target.files?.[0];
     if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
           const img = new Image();
           img.onload = async () => {
              // Mengecilkan gambar dengan Canvas agar ringan untuk MongoDB & Next.js
              const canvas = document.createElement("canvas");
              const MAX_SIZE = 400; // Maksimal ukuran 400x400 px
              let width = img.width;
              let height = img.height;

              if (width > height && width > MAX_SIZE) {
                 height *= MAX_SIZE / width;
                 width = MAX_SIZE;
              } else if (height > MAX_SIZE) {
                 width *= MAX_SIZE / height;
                 height = MAX_SIZE;
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext("2d");
              ctx?.drawImage(img, 0, 0, width, height);

              // Kompres ke format WebP (kualitas 80%) agar ukuran string Base64 sangat kecil
              const compressedBase64 = canvas.toDataURL("image/webp", 0.8);
              
              setAvatarUrl(compressedBase64);
              setIsAvatarModalOpen(false);
              setShowLinkInput(false);
              
              if (!isReadOnly) {
                 try {
                    await updateCharacterAvatarAction(hero._id, compressedBase64);
                 } catch (err) {
                    console.error("Gagal menyimpan foto ke database:", err);
                 }
              }
           };
           img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
     }
  };

  const submitLinkUpload = async () => {
     if (tempLink && tempLink.trim() !== "") { 
        const finalLink = tempLink.trim();
        setAvatarUrl(finalLink); 
        setIsAvatarModalOpen(false);
        setShowLinkInput(false);
        setTempLink("");

        if (!isReadOnly) {
           try {
              await updateCharacterAvatarAction(hero._id, finalLink);
           } catch (err) {
              console.error("Gagal menyimpan link foto ke database:", err);
           }
        }
     }
  };

  const closeAvatarModal = () => {
     setIsAvatarModalOpen(false);
     setShowLinkInput(false);
     setTempLink("");
  };
  
  return (
    <>
    <div className="bg-white/90 backdrop-blur-xl border border-amber-900/20 p-6 md:p-8 rounded-[34px] flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8 relative overflow-hidden shadow-2xl group mb-[21px] w-full">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-800/5 blur-[80px] rounded-full pointer-events-none" />
      
      <div className="flex flex-col sm:flex-row items-start justify-start gap-6 z-10 flex-1 w-full m-0 p-0">
        
        {/* AVATAR */}
        <div className="relative group/avatar cursor-pointer shrink-0 w-32 h-32 md:w-40 md:h-40 m-0" onClick={() => setIsAvatarModalOpen(true)}>
          <motion.div whileHover={{ scale: 1.05 }} className="w-full h-full rounded-[1.5rem] border-2 border-amber-900/20 shadow-lg overflow-hidden bg-stone-100 relative z-10">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Hero" className="w-full h-full object-cover grayscale-[15%] group-hover/avatar:grayscale-0 group-hover/avatar:scale-110 transition-all duration-700 ease-out" crossOrigin="anonymous" style={imageFilter && imageFilter !== 'none' ? { filter: imageFilter } : {}} />
            ) : (
              <User className="w-16 h-16 flex items-center justify-center m-auto opacity-10 text-stone-600 group-hover/avatar:scale-110 transition-transform duration-500" />
            )}
            <div className="absolute inset-0 bg-stone-100/70 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center text-stone-900 transition-all duration-300 backdrop-blur-sm z-20">
               <Camera className="w-6 h-6 mb-1" />
               <span className="text-[9px] font-black tracking-widest uppercase">Ganti Foto</span>
            </div>
          </motion.div>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-800 text-stone-900 text-[9px] font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-md z-30 pointer-events-none">
            Level {currentLevel}
          </div>
        </div>
        
        {/* INFO NAMA & EXPERIENCE */}
        <div className="flex flex-col items-start text-left w-full m-0 justify-start">
          <h1 className="text-4xl md:text-6xl font-black text-stone-900 uppercase tracking-tighter leading-none mb-3 drop-shadow-md text-left">{hero.name}</h1>
          <div className="flex flex-wrap items-center justify-start gap-3 opacity-80 mb-4 w-full">
             <span className="text-amber-700 font-black uppercase tracking-[0.3em] text-xs">{hero.race} {hero.class}</span>
             <span className="text-stone-600 font-bold uppercase tracking-widest text-[10px] italic">• {hero.background}</span>
          </div>
          
          <div className="w-full max-w-[380px] mt-1">
             <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest shrink-0">Experience</span>
                <div className="flex items-center gap-3 shrink-0">
                   <span className="text-[10px] font-bold text-stone-700 whitespace-nowrap">{exp} <span className="text-stone-500">/ {currentLvlTarget} XP</span></span>
                   {!isReadOnly && (
                     <Tooltip text="Tambahkan poin EXP yang didapat dari DM">
                       <button onClick={onOpenExpModal} className="w-5 h-5 flex items-center justify-center bg-amber-700/10 text-amber-700 border border-amber-700/30 rounded hover:bg-amber-700 hover:text-stone-100 transition-all active:scale-90 font-bold leading-none shrink-0">
                         +
                       </button>
                     </Tooltip>
                   )}
                </div>
             </div>
             
             {/* Progress Bar Lebar Penuh */}
             <div className="w-full h-1.5 bg-stone-200/50 rounded-full overflow-hidden border border-amber-900/10 relative">
                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(expPercent, 0)}%` }} transition={{ type: "spring", damping: 25, stiffness: 120 }} className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-600 to-amber-500 shadow-[0_0_10px_rgba(217,119,6,0.5)]" />
             </div>
             
             {canLevelUp && (
                <Tooltip text="Target EXP tercapai! Klik untuk membuka proses kenaikan level.">
                  <div className="mt-3 text-[9px] font-black text-emerald-600 uppercase tracking-widest animate-pulse cursor-pointer hover:text-stone-900 inline-block text-left" onClick={onLevelUp}>
                    ⬆ Ready to Level Up!
                  </div>
                </Tooltip>
             )}
          </div>
        </div>
      </div>

      {/* HP BOX */}
      <div className="z-10 w-full xl:w-[380px] shrink-0 mt-6 xl:mt-0">
        <div className="bg-[#fdfaf6] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] border border-[#d4c5b0] rounded-xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.05)] relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-amber-900/20 to-transparent" />
          <div className="flex justify-between items-start mb-4">
             <Tooltip text="Kesehatan utama karakter. Jika Exhaustion level 4, Max HP berkurang 50%.">
               <div className="text-left w-auto">
                  <span className="text-[9px] font-black text-amber-800 uppercase tracking-[0.3em] block mb-1">Health Points {exhaustion >= 4 && <span className="text-red-500 ml-1 animate-pulse">(Halved)</span>}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-stone-900 tracking-tighter">{currentHp}</span>
                    <span className="text-lg font-bold text-slate-700">/ {activeMaxHp}</span>
                  </div>
               </div>
             </Tooltip>
             <Tooltip text="HP Cadangan. Akan berkurang lebih dulu sebelum HP utama. Tidak ditumpuk.">
               <div className="text-right cursor-help w-auto">
                  <span className="text-[9px] font-black text-stone-500 uppercase tracking-widest block mb-1">Temp HP</span>
                  <span className="text-2xl font-black text-stone-600 drop-shadow-sm">{tempHp}</span>
               </div>
             </Tooltip>
          </div>

          <div className="space-y-2 mb-6">
             <div className={`w-full h-2.5 bg-stone-200/50 rounded-full overflow-hidden border border-amber-900/20 relative shadow-inner ${hpPercent < 30 ? 'animate-pulse ring-2 ring-red-500/30' : ''}`}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${hpPercent}%` }} transition={{ type: "spring", bounce: 0.3 }} className={`absolute top-0 left-0 h-full rounded-full ${hpPercent < 30 ? 'bg-gradient-to-r from-red-600 to-red-500 shadow-[0_0_15px_rgba(220,38,38,0.9)]' : 'bg-gradient-to-r from-red-800 to-red-600'}`} />
             </div>
             <AnimatePresence>
             {tempHp > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 4 }} exit={{ opacity: 0, height: 0 }} className="w-full bg-stone-200/50 rounded-full overflow-hidden relative shadow-inner mt-1">
                   <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((tempHp / activeMaxHp) * 100, 100)}%` }} transition={{ type: "spring" }} className="absolute top-0 left-0 h-full bg-gradient-to-r from-slate-500 to-slate-300 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                </motion.div>
             )}
             </AnimatePresence>
          </div>
          
          {!isReadOnly && (
            <div className="flex gap-2">
              <input type="number" value={hpInput} onChange={e => setHpInput(e.target.value ? Number(e.target.value) : "")} className="w-16 bg-stone-100 border border-amber-900/10 rounded-lg text-center font-black text-lg text-stone-900 outline-none focus:border-amber-800 transition-all" placeholder="0" />
              <Tooltip text="Heal: Pulihkan HP sejumlah input (Maksimal sesuai Max HP).">
                <button onClick={() => handleHp('heal')} className="w-full h-full bg-emerald-700/10 text-emerald-700 border border-emerald-700/20 rounded-lg text-[9px] font-black uppercase hover:bg-emerald-700 hover:text-stone-100 transition-all tracking-widest">Heal</button>
              </Tooltip>
              <Tooltip text="Dmg: Kurangi HP (Akan mengurangi Temp HP dulu jika ada).">
                <button onClick={() => handleHp('dmg')} className="w-full h-full bg-red-700/10 text-red-700 border border-red-700/20 rounded-lg text-[9px] font-black uppercase hover:bg-red-700 hover:text-stone-100 transition-all tracking-widest">Dmg</button>
              </Tooltip>
              <Tooltip text="Temp: Berikan Shield HP yang tidak permanen.">
                <button onClick={() => handleHp('temp')} className="w-full h-full bg-slate-500/10 text-stone-400 border border-slate-500/20 rounded-lg text-[9px] font-black uppercase hover:bg-slate-600 hover:text-stone-100 transition-all tracking-widest">Temp</button>
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* MODAL GANTI FOTO AVATAR CUSTOM */}
    <AnimatePresence>
       {isAvatarModalOpen && (
         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] bg-stone-100/80 backdrop-blur-sm flex items-center justify-center">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white border border-amber-900/20 p-6 rounded-3xl w-full max-w-sm text-center shadow-[0_0_40px_rgba(0,0,0,0.8)] relative z-[310]">
               <h3 className="text-[13px] font-black text-stone-900 uppercase tracking-widest mb-6">Ubah Foto Profil</h3>
               
               {showLinkInput ? (
                 <div className="flex flex-col gap-4">
                    <input 
                      type="text" 
                      placeholder="Paste Link Gambar (URL)..." 
                      value={tempLink} 
                      onChange={e => setTempLink(e.target.value)} 
                      className="w-full bg-stone-100 border border-amber-900/20 p-3 rounded-xl text-xs text-stone-900 outline-none focus:border-yellow-500 transition-colors" 
                      autoFocus
                    />
                    <div className="flex gap-3">
                       <button onClick={() => setShowLinkInput(false)} className="flex-1 py-2.5 bg-stone-200 text-stone-600 font-black rounded-xl text-[10px] uppercase tracking-widest hover:text-stone-900 transition-all border border-amber-900/10">Kembali</button>
                       <button onClick={submitLinkUpload} className="flex-1 py-2.5 bg-yellow-700 text-stone-900 font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-yellow-500 transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)]">Simpan</button>
                    </div>
                 </div>
               ) : (
                 <div className="flex flex-col gap-3">
                    <button onClick={() => fileInputRef.current?.click()} className="py-3 bg-amber-900/10 text-amber-700 font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-amber-800 hover:text-stone-900 transition-all border border-amber-900/20">Upload File Komputer</button>
                    <button onClick={() => setShowLinkInput(true)} className="py-3 bg-yellow-700/10 text-yellow-600 font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-yellow-700 hover:text-stone-900 transition-all border border-yellow-500/20">Gunakan Link URL</button>
                    <button onClick={closeAvatarModal} className="mt-3 py-2 text-stone-500 font-black text-[10px] uppercase tracking-widest hover:text-stone-900 transition-all">Batal</button>
                 </div>
               )}
               
               <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
            </motion.div>
         </motion.div>
       )}
    </AnimatePresence>
    </>
  );
};