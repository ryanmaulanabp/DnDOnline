"use client";
import { motion, AnimatePresence } from "framer-motion";

export const DiceModal = ({ isRolling, result, onClose }: any) => (
  <AnimatePresence>
    {(isRolling || result) && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-[#fdfaf6] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]/95 backdrop-blur-2xl no-print" onClick={() => !isRolling && onClose()}>
        <motion.div initial={{ scale: 0.8, rotateY: 30 }} animate={{ scale: 1, rotateY: 0 }} className="bg-white border-2 border-stone-300mber-800/30 p-10 md:p-12 rounded-[3rem] flex flex-col items-center min-w-[350px] shadow-[0_0_150px_rgba(59,130,246,0.2)] relative overflow-hidden" onClick={e => e.stopPropagation()}>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-800 to-transparent opacity-50" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-amber-900/10 blur-[80px] rounded-full pointer-events-none" />
          
          {isRolling ? (
            <div className="flex flex-col items-center py-16">
              <div className="relative w-24 h-24 mb-8">
                 <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="absolute inset-0 border-t-4 border-amber-800 rounded-full" />
                 <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="absolute inset-2 border-b-2 border-slate-500 rounded-full opacity-50" />
              </div>
              <span className="text-sm font-black text-amber-800 uppercase tracking-[0.8em] animate-pulse">Calculating</span>
            </div>
          ) : (
            <div className="text-center w-full relative z-10">
              <span className="text-[10px] font-black text-stone-500 uppercase tracking-[0.6em] mb-4 block border-b border-amber-900/10 pb-4">{result.label}</span>
              
              {result.mode !== "normal" && (
                <div className="text-[8px] font-black uppercase tracking-widest text-stone-600 mb-4 bg-white/5 inline-block px-3 py-1.5 rounded-full border border-amber-900/20 shadow-inner">
                   Mode {result.mode}: <span className={result.raw === result.raw1 ? 'text-stone-900' : 'text-stone-400 line-through'}>{result.raw1}</span> &amp; <span className={result.raw === result.raw2 ? 'text-stone-900' : 'text-stone-400 line-through'}>{result.raw2}</span>
                </div>
              )}

              <div className="flex items-center justify-center gap-6 mb-4 bg-stone-100/40 py-3 rounded-xl border border-amber-900/10 mx-8">
                <div className="flex flex-col"><span className="text-[8px] font-black text-stone-400 uppercase tracking-widest">Base</span><span className="text-xl font-bold text-stone-600">{result.raw}</span></div>
                <span className="text-xl font-black text-amber-800">+</span>
                <div className="flex flex-col"><span className="text-[8px] font-black text-stone-400 uppercase tracking-widest">Mod</span><span className="text-xl font-bold text-amber-700">{result.bonus}</span></div>
              </div>
              
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-[8rem] md:text-[10rem] font-black text-stone-900 leading-none tracking-tighter drop-shadow-[0_10px_40px_rgba(59,130,246,0.4)] my-6">{result.result}</motion.div>
              
              <div className="h-6 mb-6">
                {result.dice === 20 && result.raw === 20 && <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity }} className="text-yellow-400 font-black text-[10px] uppercase tracking-widest animate-pulse">Critical Success!</motion.div>}
                {result.dice === 20 && result.raw === 1 && <div className="text-red-600 font-black text-[10px] uppercase tracking-widest animate-pulse">Critical Failure!</div>}
              </div>
              <button onClick={onClose} className="bg-amber-800 hover:bg-amber-800 text-stone-900 text-[9px] font-black px-12 py-3 rounded-lg uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95">Accept Result</button>
            </div>
          )}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);