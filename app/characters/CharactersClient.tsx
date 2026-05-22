"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CLASSES } from "@/lib/dnd-data";
import { deleteCharacterAction } from "@/app/actions/character";
import { useRouter } from "next/navigation";
import { Skull, Search, Sword, Dices, User, CandlestickChart, Armchair, Trash2, Shield, Heart, Zap, Sparkles, ChevronLeft, Crown, Flame } from "lucide-react";

// --- DATABASE RAMALAN D20 ---
const D20_LORE = [
  { range: [1, 1], text: "CRITICAL FAIL! DM sedang mengincarmu hari ini...", color: "text-red-700 font-bold" },
  { range: [2, 5], text: "Keberuntunganmu tumpul seperti pedang karat.", color: "text-red-600" },
  { range: [6, 10], text: "Hari yang biasa saja di Realm.", color: "text-stone-500" },
  { range: [11, 15], text: "The Weave memberikan senyuman tipis padamu.", color: "text-amber-600" },
  { range: [16, 19], text: "Buff Terdeteksi! Seranganmu akan terasa lebih tajam.", color: "text-emerald-600 font-bold" },
  { range: [20, 20], text: "NATURAL 20! Keberuntungan dewa menyertaimu!", color: "text-amber-700 font-black animate-pulse" },
];

export default function CharactersClient({ characters, user }: { characters: any[], user?: any }) {
  const router = useRouter();
  
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [d20Result, setD20Result] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const filteredChars = useMemo(() => {
    return characters.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.class.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [characters, searchQuery]);

  const spotlightHero = characters[0];

  const rollDailyD20 = () => {
    if (isRolling) return;
    setIsRolling(true); setD20Result(null);
    setTimeout(() => {
      const res = Math.floor(Math.random() * 20) + 1;
      setD20Result(res);
      setIsRolling(false);
    }, 800);
  };

  const getLore = (val: number) => D20_LORE.find(l => val >= l.range[0] && val <= l.range[1]);

  return (
    <div className="min-h-screen bg-[#fdfaf6] text-stone-800 font-sans selection:bg-amber-500/30 selection:text-amber-900 pb-20">
      
      {/* Background Parchment Noise */}
      <div className="fixed inset-0 opacity-[0.4] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pointer-events-none z-0" />

      {/* --- DELETE MODAL --- */}
      <AnimatePresence>
        {deletingId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/60 backdrop-blur-md p-4 text-center">
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-[#fdfaf6] border border-amber-900/30 p-10 rounded-3xl max-w-sm w-full relative shadow-2xl overflow-hidden">
              <div className="absolute inset-0 opacity-10 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pointer-events-none" />
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-700 to-red-900" />
              
              <Skull className="w-16 h-16 text-red-700 mx-auto mb-4 drop-shadow-sm" />
              <h3 className="text-2xl font-black text-stone-900 uppercase mb-3 tracking-widest" style={{ fontFamily: 'Georgia, serif' }}>Hapus Karakter?</h3>
              <p className="text-[10px] text-stone-500 mb-8 font-bold uppercase tracking-[0.2em] leading-relaxed">Pahlawan ini akan dikirim ke alam baka untuk selamanya. Apakah Anda yakin?</p>
              
              <div className="flex gap-4 relative z-10">
                <button onClick={() => setDeletingId(null)} className="flex-1 py-4 rounded-xl font-black text-stone-600 bg-white border border-[#d4c5b0] hover:text-stone-900 hover:border-amber-400 shadow-sm transition-all text-[10px] uppercase tracking-widest">Batal</button>
                <button onClick={async () => { setIsDeleting(true); await deleteCharacterAction(deletingId); setDeletingId(null); setIsDeleting(false); router.refresh(); }} disabled={isDeleting} className="flex-1 py-4 rounded-xl font-black text-stone-900 bg-gradient-to-br from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 shadow-md transition-all text-[10px] uppercase tracking-widest">{isDeleting ? "Menghapus..." : "Hancurkan"}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- EPIC NAVBAR --- */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#fdfaf6]/90 backdrop-blur-md border-b border-[#d4c5b0] shadow-sm py-4">
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
           <Link href="/" className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors group">
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-black uppercase tracking-widest">Kembali ke Beranda</span>
           </Link>
           <span className="text-lg font-black text-amber-700 uppercase tracking-[0.2em] flex items-center gap-2 drop-shadow-sm">
             <Crown size={20} /> Hall of Heroes
           </span>
        </div>
      </nav>

      {/* --- HERO HEADER --- */}
      <header className="relative pt-32 pb-16 px-6 z-10 text-center overflow-hidden">
        <Flame size={48} className="mx-auto text-amber-600 mb-4 drop-shadow-sm opacity-80" />
        <h1 className="text-5xl md:text-7xl font-black text-stone-900 tracking-tighter uppercase mb-4" style={{ fontFamily: 'Georgia, serif' }}>
          Gudang <span className="text-amber-700">Pahlawan</span>
        </h1>
        <p className="text-stone-600 text-lg font-medium max-w-2xl mx-auto mb-10">Semua pahlawan yang telah Anda tempa dari The Weave. Siap bertarung, bereksplorasi, dan mengukir sejarah.</p>

        {/* Quick Actions & Search */}
        <div className="max-w-[800px] mx-auto flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full group flex-1">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-amber-600 transition-colors"><Search className="w-5 h-5" /></span>
            <input 
              type="text" placeholder="CARI PAHLAWAN..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white backdrop-blur-sm border-2 border-[#d4c5b0] focus:border-amber-500 rounded-2xl py-4 pl-14 pr-6 text-[10px] font-black tracking-[0.2em] text-stone-900 placeholder:text-stone-400 shadow-inner outline-none transition-all duration-300"
            />
          </div>
          <Link href="/characters/new" className="w-full md:w-auto shrink-0 bg-gradient-to-b from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-900 font-black px-8 py-4 rounded-2xl border border-amber-800 shadow-md transition-all duration-300 text-[11px] tracking-[0.2em] uppercase flex items-center justify-center gap-2 hover:scale-105">
             <Sword className="w-4 h-4" /> Tempa Baru
          </Link>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 relative z-10 flex flex-col xl:flex-row gap-10">
        
        {/* --- LEFT SIDEBAR: DAILY D20 & SPOTLIGHT --- */}
        <div className="xl:w-[400px] shrink-0 space-y-8">
          
          {/* Daily Prophecy */}
          <div className="bg-white rounded-3xl border border-[#d4c5b0] p-6 shadow-md relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />
             <div className="flex items-start gap-4">
               <button onClick={rollDailyD20} className={`w-14 h-14 shrink-0 flex items-center justify-center bg-[#fdfaf6] border-2 border-stone-300mber-200 rounded-2xl text-amber-600 shadow-inner transition-all hover:bg-amber-50 hover:scale-105 active:scale-95 ${isRolling && 'animate-spin shadow-md border-amber-500 text-amber-700'}`}>
                 <Dices className="w-8 h-8" />
               </button>
               <div className="flex-1 pt-1">
                 <span className="block text-[9px] font-black text-stone-400 uppercase tracking-[0.3em] mb-1">Ramalan Hari Ini</span>
                 <div className="text-xs font-bold leading-relaxed min-h-[40px]">
                    {isRolling ? <span className="text-amber-600 animate-pulse tracking-widest uppercase">Membaca Takdir...</span> : d20Result ? <span className={getLore(d20Result)?.color}>[{d20Result}] {getLore(d20Result)?.text}</span> : <span className="text-stone-400 italic">Tekan dadu untuk meramal keberuntunganmu.</span>}
                 </div>
               </div>
             </div>
          </div>

          {/* Spotlight Hero (Premium Dossier) */}
          {spotlightHero && !searchQuery && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative group">
              <Link href={`/characters/${spotlightHero._id}`} className="block relative bg-stone-900 rounded-[2.5rem] p-1 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group-hover:-translate-y-2">
                
                {/* Dossier Content */}
                <div className="bg-[#fdfaf6] rounded-[2.3rem] overflow-hidden border border-stone-700 relative h-full flex flex-col">
                  
                  {/* Parchment Overlay */}
                  <div className="absolute inset-0 opacity-40 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pointer-events-none z-10" />
                  
                  {/* Avatar Banner */}
                  <div className="relative h-64 overflow-hidden border-b-2 border-stone-800">
                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110" style={{ backgroundImage: `url('${spotlightHero.avatarUrl || CLASSES[spotlightHero.class.split(' ')[0]]?.image}')`, filter: 'sepia(0.2)' }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent opacity-90" />
                    <div className="absolute top-4 right-4 bg-amber-500 text-stone-900 font-black text-[9px] uppercase tracking-[0.3em] px-4 py-1.5 rounded-full shadow-md z-20">
                      Pahlawan Utama
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-8 relative z-20 -mt-16 text-center">
                    <div className="w-24 h-24 mx-auto bg-stone-900 rounded-full border-4 border-[#fdfaf6] p-1 shadow-xl mb-4 overflow-hidden">
                       <img src={spotlightHero.avatarUrl || CLASSES[spotlightHero.class.split(' ')[0]]?.image} className="w-full h-full object-cover rounded-full" alt="ava" crossOrigin="anonymous" />
                    </div>
                    
                    <h2 className="text-4xl font-black text-stone-900 uppercase tracking-tighter mb-1" style={{ fontFamily: 'Georgia, serif' }}>{spotlightHero.name}</h2>
                    <p className="text-[10px] font-black text-amber-700 uppercase tracking-[0.3em] mb-6">
                      Level {spotlightHero.level} • {spotlightHero.race} {spotlightHero.class}
                    </p>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-3 gap-3">
                       <div className="bg-white border border-[#d4c5b0] rounded-xl p-3 shadow-inner">
                          <Heart className="w-4 h-4 text-red-600 mx-auto mb-1" />
                          <div className="text-lg font-black text-stone-900">{spotlightHero.currentHp}</div>
                          <div className="text-[7px] font-black text-stone-400 uppercase tracking-widest">Health</div>
                       </div>
                       <div className="bg-white border border-[#d4c5b0] rounded-xl p-3 shadow-inner">
                          <Shield className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                          <div className="text-lg font-black text-stone-900">{spotlightHero.stats.DEX >= 10 ? Math.floor((spotlightHero.stats.DEX - 10) / 2) + 10 : 10}</div>
                          <div className="text-[7px] font-black text-stone-400 uppercase tracking-widest">Armor</div>
                       </div>
                       <div className="bg-white border border-[#d4c5b0] rounded-xl p-3 shadow-inner">
                          <Zap className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                          <div className="text-lg font-black text-stone-900">+{spotlightHero.proficiencyBonus || 2}</div>
                          <div className="text-[7px] font-black text-stone-400 uppercase tracking-widest">Prof.</div>
                       </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}
        </div>

        {/* --- RIGHT CONTENT: CHARACTER GRID --- */}
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-8">
             <h3 className="text-xs font-black text-stone-400 uppercase tracking-[0.5em]">Anggota Party ({filteredChars.length})</h3>
             <div className="h-px flex-1 bg-gradient-to-r from-[#d4c5b0] to-transparent"></div>
          </div>

          {filteredChars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredChars.map((char, i) => (
                <motion.div key={char._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="relative group h-full">
                  <Link href={`/characters/${char._id}`} className="block h-full">
                    <div className="h-full bg-white rounded-3xl border border-[#d4c5b0] p-6 hover:border-amber-400 hover:shadow-xl shadow-sm transition-all duration-300 overflow-hidden relative flex flex-col group-hover:-translate-y-1">
                       
                       {/* Background Vignette */}
                       <div className="absolute top-0 right-0 w-full h-32 opacity-10 group-hover:opacity-20 transition-opacity bg-cover bg-center pointer-events-none" style={{ backgroundImage: `url('${char.avatarUrl || CLASSES[char.class.split(' ')[0]]?.image}')`, filter: 'sepia(0.5)', WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)' }} />
                       
                       <div className="flex justify-between items-start relative z-10 mb-6">
                         <div className="w-16 h-16 rounded-2xl bg-[#fdfaf6] border-2 border-[#d4c5b0] overflow-hidden shadow-md group-hover:border-amber-400 transition-colors duration-300">
                            <img src={char.avatarUrl || CLASSES[char.class.split(' ')[0]]?.image} className="w-full h-full object-cover" alt="ava" crossOrigin="anonymous" style={{ filter: 'sepia(0.1)' }} />
                         </div>
                         <div className="flex flex-col items-end">
                           <span className="bg-stone-900 text-stone-900 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm mb-1">Level {char.level}</span>
                           <span className="text-[8px] font-black text-stone-400 uppercase tracking-[0.2em]">{char.race}</span>
                         </div>
                       </div>
                       
                       <div className="flex-1 mb-6 relative z-10">
                          <h4 className="text-2xl font-black text-stone-900 uppercase truncate mb-1 group-hover:text-amber-700 transition-colors drop-shadow-sm" style={{ fontFamily: 'Georgia, serif' }}>{char.name}</h4>
                          <p className="text-[10px] font-bold text-amber-700 uppercase tracking-[0.2em] truncate">{char.class}</p>
                       </div>
                       
                       {/* Stats Footer */}
                       <div className="grid grid-cols-4 gap-2 relative z-10 border-t border-[#d4c5b0] pt-4">
                          {[
                            { l: 'STR', v: char.stats.STR }, { l: 'DEX', v: char.stats.DEX },
                            { l: 'CON', v: char.stats.CON }, { l: 'INT', v: char.stats.INT }
                          ].map((s, idx) => (
                            <div key={idx} className="text-center">
                               <span className="block text-[7px] font-black text-stone-400 uppercase tracking-widest">{s.l}</span>
                               <span className="text-sm font-black text-stone-800">{s.v}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                  </Link>

                  {/* Delete Button */}
                  <button onClick={(e) => { e.preventDefault(); setDeletingId(char._id); }} className="absolute top-5 right-5 w-8 h-8 bg-white/80 backdrop-blur-sm border border-red-200 hover:bg-red-600 hover:border-red-600 text-red-500 hover:text-stone-900 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow-md z-20">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
              
              {/* Add New Hero Card */}
              <Link href="/characters/new" className="h-full bg-[#fdfaf6]/50 border-2 border-[#d4c5b0] border-dashed rounded-3xl p-8 flex flex-col items-center justify-center group hover:bg-white hover:border-amber-400 hover:shadow-md transition-all duration-300 min-h-[250px]">
                <div className="w-16 h-16 rounded-full bg-white border border-[#d4c5b0] flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-amber-50 group-hover:border-amber-300 transition-all duration-500 shadow-sm">
                   <Sparkles className="w-6 h-6 text-amber-600 opacity-60 group-hover:opacity-100" />
                </div>
                <span className="text-[11px] font-black text-stone-500 uppercase tracking-[0.3em] group-hover:text-amber-700 transition-colors text-center">Rekrut Pahlawan Baru</span>
              </Link>
            </div>
          ) : (
            <div className="py-32 text-center border-2 border-[#d4c5b0] border-dashed rounded-[3rem] bg-white/40 backdrop-blur-sm">
              <CandlestickChart className="w-16 h-16 opacity-30 block mx-auto mb-6 text-stone-400" />
              <h3 className="text-xl font-black text-stone-900 uppercase tracking-widest mb-2" style={{ fontFamily: 'Georgia, serif' }}>Tavern Kosong</h3>
              <p className="text-[10px] font-bold text-stone-500 uppercase tracking-[0.2em]">Belum ada pahlawan yang mendaftar. Mulai tempa legendamu.</p>
            </div>
          )}
        </div>
      </main>

    </div>
  );
}