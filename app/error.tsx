"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { reportClientErrorAction } from "@/app/actions/observability";
import { RefreshCw, Home, ShieldAlert } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Otomatis laporkan crash client ke telemetry server
    reportClientErrorAction(
      error.name || "Error",
      error.message || "Unknown error inside Client boundary",
      error.stack || ""
    );
  }, [error]);

  const flavorTexts = [
    "Langkah pahlawan Anda terantuk akar pohon purba yang licin, meluncur bebas menabrak tumpukan kembung kotoran Goblin! Weave berguncang hebat!",
    "Mantra sihir Anda memantul liar menghantam kuali besi Barnaby! Uap mengepul menutupi taverna dan melumpuhkan penglihatan party Anda!",
    "Zirah berat Anda berderit kencang memecah keheningan gua basah. Sekawanan kelelawar gua menyerbu wajah Anda di kegelapan!",
    "Dadu takdir berputar canggung and tergelincir masuk ke dalam retakan lantai kayu ubin tavern. Seluruh dunia fantasi terhenti sejenak!"
  ];

  // Ambil flavor text acak untuk comedic effect
  const randomFlavor = flavorTexts[Math.floor((error.message.length + error.name.length) % flavorTexts.length)];

  return (
    <div className="min-h-screen bg-[#fdfaf6] text-stone-700 flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background Parchment Texture */}
      <div className="absolute inset-0 opacity-[0.4] mix-blend-multiply pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />
      
      {/* Glassmorphism Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="relative z-10 w-full max-w-xl bg-white/90 border-2 border-[#d4c5b0] rounded-[2.5rem] p-8 md:p-12 shadow-2xl backdrop-blur-sm text-center border-dashed"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-600 to-amber-700" />
        
        {/* Animated Dice D20 representing Nat 1 */}
        <div className="relative w-36 h-36 mx-auto mb-8 flex items-center justify-center">
          {/* Pulsating Glowing Ring */}
          <motion.div 
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-red-100 rounded-full blur-[25px]"
          />
          
          {/* Glowing Red Dice Outline */}
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 w-28 h-28 bg-[#9a1c1c] text-white flex flex-col items-center justify-center shadow-lg border-2 border-red-500"
            style={{
              clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
            }}
          >
            <ShieldAlert className="w-6 h-6 text-red-300 absolute top-4 animate-bounce" />
            <span className="text-4xl font-black font-mono mt-4 text-red-100">1</span>
            <span className="text-[7.5px] font-black uppercase tracking-[0.2em] text-red-300 mt-0.5">CRIT FAIL</span>
          </motion.div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl md:text-4xl font-black text-stone-900 uppercase tracking-tighter mb-3">
          Critical <span className="text-red-750">Failure!</span>
        </h1>
        <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] mb-6">
          Bencana Kosmis Terdeteksi di Dunia D&D
        </p>

        {/* Flavor Text */}
        <div className="bg-[#fdfaf6] border border-[#d4c5b0] rounded-2xl p-5 mb-8 text-left relative overflow-hidden shadow-inner">
          <span className="text-[8px] font-black text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded uppercase tracking-widest absolute top-3 right-3 select-none">Setback</span>
          <h4 className="text-[9.5px] font-black text-stone-500 uppercase tracking-widest mb-2 select-none">Catatan Dungeon Master:</h4>
          <p className="text-xs font-bold text-stone-600 leading-relaxed italic pr-12">
            "{randomFlavor}"
          </p>
        </div>

        {/* Technical Error Details (Safely Cropped) */}
        <div className="text-left mb-8 max-h-[100px] overflow-y-auto bg-stone-50 border border-stone-200 rounded-xl p-4 font-mono text-[9.5px] text-stone-500 select-all custom-scrollbar leading-normal">
          <p className="font-bold text-stone-700 mb-1 select-none">Error Log:</p>
          <span className="font-semibold block break-all">[{error.name || "Error"}]: {error.message || "Unknown client error"}</span>
          {error.digest && <span className="block mt-1 font-bold text-red-500 select-none">Digest ID: {error.digest}</span>}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <button 
            onClick={reset}
            className="flex-1 bg-gradient-to-r from-red-750 to-red-650 hover:from-red-650 hover:to-red-550 border border-red-800 text-stone-900 font-black px-6 py-4 rounded-xl uppercase text-[10px] tracking-widest transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Cast Revive (Coba Lagi)
          </button>
          
          <Link 
            href="/"
            className="flex-1 bg-[#fdfaf6] border-2 border-[#d4c5b0] hover:border-amber-400 hover:bg-amber-50/30 text-stone-600 hover:text-stone-900 font-black px-6 py-4 rounded-xl uppercase text-[10px] tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" /> Kembali Ke Tavern
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
