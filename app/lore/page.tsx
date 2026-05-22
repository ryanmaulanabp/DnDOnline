"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Library, Search, Filter, Shield, Skull, Sparkles, BookOpen } from "lucide-react";

// --- DUMMY DATA LORE ---
const LORE_DATA = [
  { id: 1, type: "monster", title: "Ancient Blue Dragon", category: "Dragon", image: "/images/monster_dragon.png", desc: "Penguasa gurun dan badai pasir yang menyemburkan petir mematikan." },
  { id: 2, type: "class", title: "Paladin", category: "Holy Warrior", image: "/images/class_paladin.png", desc: "Ksatria suci yang terikat oleh sumpah (Oath) untuk menegakkan keadilan." },
  { id: 3, type: "class", title: "Wizard", category: "Arcane Caster", image: "/images/class_wizard.png", desc: "Pelajar rahasia mistis yang menarik sihir dari lembaran The Weave." },
  { id: 4, type: "monster", title: "Mind Flayer", category: "Aberration", image: "/images/class_rogue.png", desc: "Makhluk telepatik penjelajah kosmos yang memakan ingatan makhluk lain." },
  { id: 5, type: "class", title: "Fighter", category: "Martial Artist", image: "/images/class_fighter.png", desc: "Master segala jenis senjata dan taktik pertempuran jarak dekat maupun jauh." },
  { id: 6, type: "monster", title: "Lich", category: "Undead", image: "/images/class_wizard.png", desc: "Penyihir kuno yang menolak kematian dengan mengikat jiwanya ke dalam Phylactery." },
  { id: 7, type: "class", title: "Rogue", category: "Stealth Specialist", image: "/images/class_rogue.png", desc: "Ahli menyelinap, menyusup, dan menyerang di titik buta musuh." },
];

export default function GrandLibraryPage() {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = LORE_DATA.filter(item => {
    const matchFilter = filter === "all" || item.type === filter;
    const matchSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#fdfaf6] text-stone-700 font-sans selection:bg-amber-500/30 selection:text-amber-900">
      
      {/* Background Noise (Parchment Texture) */}
      <div className="fixed inset-0 opacity-[0.4] pointer-events-none z-0 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />

      {/* Simplified Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#fdfaf6]/90 backdrop-blur-md border-b border-[#d4c5b0] shadow-sm py-4">
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
           <Link href="/" className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors group">
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-black uppercase tracking-widest">Kembali ke Portal</span>
           </Link>
           <span className="text-lg font-black text-stone-900 uppercase tracking-[0.2em] flex items-center gap-2">
             <Library size={20} className="text-amber-700" /> Grand Library
           </span>
        </div>
      </nav>

      {/* Main Layout */}
      <main className="relative z-10 pt-28 pb-20 px-6 max-w-[1400px] mx-auto min-h-screen">
        
        {/* Header & Controls */}
        <div className="flex flex-col lg:flex-row items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-5xl md:text-7xl font-black text-stone-900 uppercase tracking-tighter mb-4" style={{ fontFamily: 'Georgia, serif' }}>Pustaka <span className="text-amber-700">Kosmik</span></h1>
            <p className="text-stone-600 text-lg font-medium max-w-2xl">Arsip terbesar multiverse yang mencatat segala ras, kelas legendaris, hingga monster yang mengintai di balik kegelapan The Weave.</p>
          </div>
          
          <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-4">
            <div className="relative">
               <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
               <input 
                 type="text" 
                 placeholder="Cari Entri..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full sm:w-64 bg-white border border-[#d4c5b0] rounded-xl py-3 pl-12 pr-4 text-sm text-stone-900 focus:outline-none focus:border-amber-500 transition-colors shadow-inner placeholder:text-stone-400"
               />
            </div>
            <div className="flex bg-[#fdfaf6] rounded-xl border border-[#d4c5b0] p-1 shadow-sm">
               {["all", "class", "monster"].map(f => (
                 <button 
                   key={f}
                   onClick={() => setFilter(f)}
                   className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                     filter === f 
                       ? "bg-amber-600 text-stone-900 shadow-md" 
                       : "text-stone-500 hover:text-stone-900 hover:bg-stone-200/50"
                   }`}
                 >
                   {f}
                 </button>
               ))}
            </div>
          </div>
        </div>

        {/* Masonry Grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredData.map((item, i) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={item.id}
                className="group cursor-pointer"
              >
                <div className="relative h-96 rounded-[2rem] overflow-hidden border border-[#d4c5b0] group-hover:border-amber-400 transition-all shadow-md hover:shadow-xl bg-white">
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110" style={{ backgroundImage: `url('${item.image}')`, filter: 'sepia(0.2)' }}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/40 to-transparent"></div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-6 left-6 flex items-center gap-2">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border ${
                      item.type === 'monster' ? 'bg-red-50 border-red-200 text-red-700 shadow-inner' : 'bg-amber-50 border-amber-200 text-amber-700 shadow-inner'
                    }`}>
                      {item.type === 'monster' ? <Skull size={14} /> : <Shield size={14} />}
                    </span>
                    <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-stone-700 uppercase tracking-widest border border-[#d4c5b0] shadow-sm">
                      {item.category}
                    </span>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end">
                    <h3 className="text-2xl font-black text-stone-900 uppercase tracking-tight mb-2 group-hover:text-amber-400 transition-colors">{item.title}</h3>
                    <p className="text-xs text-[#d4c5b0] font-medium leading-relaxed opacity-0 transform translate-y-4 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        
        {filteredData.length === 0 && (
          <div className="py-32 text-center text-stone-500">
            <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold uppercase tracking-widest text-stone-700">Arsip Tidak Ditemukan</h3>
            <p className="text-sm mt-2">The Weave tidak mendeteksi kata kunci yang Anda cari.</p>
          </div>
        )}

      </main>
    </div>
  );
}
