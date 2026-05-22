"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, BookOpen, Sword, Shield, Wind, Flame, Droplets, Sparkles, Move, Clock, Skull, Zap, Dices } from "lucide-react";

const RULES_SECTIONS = [
  {
    id: "combat",
    title: "Mekanik Pertempuran",
    icon: Sword,
    content: (
      <div className="space-y-6 text-stone-800">
        <h2 className="text-4xl font-black text-stone-900 uppercase tracking-tighter" style={{ fontFamily: 'Georgia, serif' }}>Pertempuran (Combat)</h2>
        <p className="text-lg font-medium leading-relaxed text-stone-600">Dalam pertempuran, setiap detik menentukan hidup atau mati. Siklus pertempuran dibagi menjadi ronde (rounds) dan giliran (turns).</p>
        
        <div className="bg-[#f9f6f0] border border-[#d4c5b0] p-6 rounded-2xl shadow-sm">
          <h3 className="text-xl font-bold text-stone-900 mb-3 uppercase tracking-widest flex items-center gap-2"><Clock size={18} className="text-amber-700" /> Urutan Giliran (Initiative)</h3>
          <p className="text-sm leading-relaxed mb-4">Setiap karakter melempar d20 + Dexterity modifier. Karakter dengan nilai tertinggi bertindak lebih dulu.</p>
          <div className="bg-white p-4 rounded-xl border border-[#d4c5b0] font-mono text-sm text-stone-700 flex items-center gap-4 shadow-inner">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center border border-amber-200"><Dices size={22} className="text-amber-700" /></div>
            <div>Roll: <span className="text-stone-900 font-bold">1d20</span> + <span className="text-emerald-700 font-bold">DEX Mod</span></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
           <div className="bg-white p-5 rounded-xl border border-[#d4c5b0] shadow-sm hover:border-amber-400 transition-colors">
              <h4 className="text-amber-700 font-bold uppercase tracking-widest text-sm mb-2 flex items-center gap-2"><Move size={16} /> Action</h4>
              <p className="text-xs text-stone-600">Satu tindakan utama per giliran. Bisa digunakan untuk Menyerang, Membaca Mantra, Dash, atau Dodge.</p>
           </div>
           <div className="bg-white p-5 rounded-xl border border-[#d4c5b0] shadow-sm hover:border-amber-400 transition-colors">
              <h4 className="text-emerald-700 font-bold uppercase tracking-widest text-sm mb-2 flex items-center gap-2"><Zap size={16} /> Bonus Action</h4>
              <p className="text-xs text-stone-600">Tindakan tambahan jika fitur kelas atau mantra mengizinkannya (misal: serangan off-hand).</p>
           </div>
        </div>
      </div>
    )
  },
  {
    id: "magic",
    title: "Sistem Sihir",
    icon: Sparkles,
    content: (
      <div className="space-y-6 text-stone-800">
        <h2 className="text-4xl font-black text-stone-900 uppercase tracking-tighter" style={{ fontFamily: 'Georgia, serif' }}>Menyalurkan Weave</h2>
        <p className="text-lg font-medium leading-relaxed text-stone-600">Sihir (Magic) adalah manipulasi Weave, jaringan energi mistis yang melingkupi multiverse.</p>
        
        <div className="bg-[#f9f6f0] border border-[#d4c5b0] p-6 rounded-2xl shadow-sm">
          <h3 className="text-xl font-bold text-stone-900 mb-3 uppercase tracking-widest flex items-center gap-2"><Flame size={18} className="text-amber-700" /> Spell Slots</h3>
          <p className="text-sm leading-relaxed mb-4">Mantra membutuhkan energi. Spell Slot adalah kapasitas energi karakter. Mengucapkan mantra level tinggi membakar slot level tinggi.</p>
          <div className="flex gap-2">
            {[1,2,3,4].map(i => <div key={i} className="w-8 h-8 rounded-full bg-amber-200 border border-amber-600 flex items-center justify-center text-xs font-bold text-amber-900 shadow-inner">{i}</div>)}
          </div>
        </div>

        <h3 className="text-lg font-bold text-stone-900 mt-8 mb-4 uppercase tracking-widest">Komponen Sihir</h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3 bg-white p-4 rounded-xl border border-[#d4c5b0]">
             <span className="bg-amber-200 border border-amber-300 text-amber-900 font-black text-[10px] px-2 py-1 rounded">V</span>
             <p className="text-sm text-stone-600"><strong>Verbal (V):</strong> Mantra membutuhkan kata-kata mistis dengan nada tertentu.</p>
          </li>
          <li className="flex items-start gap-3 bg-white p-4 rounded-xl border border-[#d4c5b0]">
             <span className="bg-amber-200 border border-amber-300 text-amber-900 font-black text-[10px] px-2 py-1 rounded">S</span>
             <p className="text-sm text-stone-600"><strong>Somatic (S):</strong> Membutuhkan pergerakan tangan atau gestur mistis.</p>
          </li>
          <li className="flex items-start gap-3 bg-white p-4 rounded-xl border border-[#d4c5b0]">
             <span className="bg-amber-100 border border-amber-200 text-amber-800 font-black text-[10px] px-2 py-1 rounded">M</span>
             <p className="text-sm text-stone-600"><strong>Material (M):</strong> Benda fisik atau fokus sihir yang dibutuhkan.</p>
          </li>
        </ul>
      </div>
    )
  },
  {
    id: "survival",
    title: "Eksplorasi & Survival",
    icon: Wind,
    content: (
      <div className="space-y-6 text-stone-800">
        <h2 className="text-4xl font-black text-stone-900 uppercase tracking-tighter" style={{ fontFamily: 'Georgia, serif' }}>Bertahan Hidup</h2>
        <p className="text-lg font-medium leading-relaxed text-stone-600">Dunia luar penuh dengan bahaya. Perjalanan membutuhkan manajemen waktu, sumber daya, dan persepsi.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
           <div className="bg-[#f9f6f0] p-6 rounded-2xl border border-[#d4c5b0] hover:border-amber-400 transition-colors shadow-sm">
              <h4 className="text-stone-900 font-bold uppercase tracking-widest text-lg mb-3 flex items-center gap-2"><Clock size={20} className="text-amber-700" /> Short Rest</h4>
              <p className="text-sm leading-relaxed mb-4 text-stone-600">Istirahat setidaknya 1 jam. Karakter dapat menggunakan Hit Dice (HD) untuk memulihkan HP.</p>
           </div>
           <div className="bg-[#f9f6f0] p-6 rounded-2xl border border-[#d4c5b0] hover:border-amber-400 transition-colors shadow-sm">
              <h4 className="text-stone-900 font-bold uppercase tracking-widest text-lg mb-3 flex items-center gap-2"><Clock size={20} className="text-emerald-700" /> Long Rest</h4>
              <p className="text-sm leading-relaxed mb-4 text-stone-600">Istirahat minimal 8 jam (tidur 6 jam). Memulihkan semua HP, spell slots, dan fitur kemampuan kelas.</p>
           </div>
        </div>
      </div>
    )
  },
  {
    id: "death",
    title: "Kematian (Death Saves)",
    icon: Skull,
    content: (
      <div className="space-y-6 text-stone-800">
        <h2 className="text-4xl font-black text-red-800 uppercase tracking-tighter" style={{ fontFamily: 'Georgia, serif' }}>Di Ambang Kematian</h2>
        <p className="text-lg font-medium leading-relaxed text-stone-600">Ketika Hit Points (HP) mencapai 0, karakter jatuh pingsan (Unconscious) dan sekarat.</p>
        
        <div className="bg-red-50 border border-red-200 p-6 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 text-red-900"><Skull size={100} /></div>
          <h3 className="text-xl font-bold text-red-900 mb-3 uppercase tracking-widest flex items-center gap-2 relative z-10"><Skull size={18} className="text-red-600" /> Death Saving Throws</h3>
          <p className="text-sm leading-relaxed mb-4 relative z-10 text-red-800">Setiap awal giliran, karakter melempar d20 murni (tanpa modifier).</p>
          <ul className="space-y-2 text-sm relative z-10 font-bold">
            <li className="flex items-center gap-2"><span className="text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded">10 atau lebih</span> Sukses (Kumpulkan 3 untuk stabil).</li>
            <li className="flex items-center gap-2"><span className="text-red-700 bg-red-100 border border-red-200 px-2 py-0.5 rounded">9 atau kurang</span> Gagal (Kumpulkan 3 untuk MATI PERMANEN).</li>
            <li className="flex items-center gap-2"><span className="text-stone-900 bg-red-600 border border-red-800 px-2 py-0.5 rounded shadow-sm">Roll 1</span> Dihitung sebagai DUA Kegagalan.</li>
            <li className="flex items-center gap-2"><span className="text-stone-900 bg-emerald-500 border border-emerald-700 px-2 py-0.5 rounded shadow-sm">Roll 20</span> Karakter sadar dengan 1 HP!</li>
          </ul>
        </div>
      </div>
    )
  }
];

export default function RulesGrimoirePage() {
  const [activeSection, setActiveSection] = useState(RULES_SECTIONS[0]);

  return (
    <div className="min-h-screen bg-[#fdfaf6] text-stone-800 font-sans selection:bg-amber-500/30 selection:text-amber-900">
      
      {/* Background Noise (Parchment) */}
      <div className="fixed inset-0 opacity-[0.4] pointer-events-none z-0 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />

      {/* Simplified Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#fdfaf6]/90 backdrop-blur-md border-b border-[#d4c5b0] shadow-sm py-4">
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
           <Link href="/" className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors group">
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-black uppercase tracking-widest">Kembali ke Portal</span>
           </Link>
           <span className="text-lg font-black text-stone-900 uppercase tracking-[0.2em] flex items-center gap-2">
             <BookOpen size={20} className="text-amber-700" /> The Grimoire
           </span>
        </div>
      </nav>

      {/* Main Layout (Grimoire Style) */}
      <main className="relative z-10 pt-28 pb-20 px-6 max-w-[1200px] mx-auto min-h-screen flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Index */}
        <div className="w-full md:w-64 shrink-0 space-y-2">
           <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] mb-6 px-4">Daftar Isi</div>
           {RULES_SECTIONS.map((section) => {
             const isActive = activeSection.id === section.id;
             return (
               <button
                 key={section.id}
                 onClick={() => setActiveSection(section)}
                 className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-300 ${
                   isActive 
                     ? "bg-amber-100 border border-amber-300 shadow-inner text-amber-900" 
                     : "text-stone-500 hover:bg-white hover:text-stone-800 border border-transparent hover:border-[#d4c5b0]"
                 }`}
               >
                 <section.icon size={16} className={isActive ? "text-amber-700" : "opacity-50"} />
                 <span className="text-[11px] font-bold uppercase tracking-widest">{section.title}</span>
               </button>
             );
           })}
        </div>

        {/* Content Area (The Page) */}
        <div className="flex-1 bg-white/95 backdrop-blur-md border border-[#d4c5b0] rounded-[2rem] p-8 md:p-12 shadow-xl relative overflow-hidden min-h-[600px]">
           {/* Book Binding Visual */}
           <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-stone-200 to-white border-r border-[#d4c5b0] opacity-50"></div>
           
           <AnimatePresence mode="wait">
             <motion.div
               key={activeSection.id}
               initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
               animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
               exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
               transition={{ duration: 0.4 }}
               className="h-full pl-8"
             >
               {activeSection.content}
             </motion.div>
           </AnimatePresence>
        </div>

      </main>
    </div>
  );
}
