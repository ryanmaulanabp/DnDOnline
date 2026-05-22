"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useSession } from "next-auth/react";
import { Search, Menu, ChevronLeft, ChevronRight, Play, BookOpen, Users, User, Settings, Shield, Sword, Sparkles, Map, Skull, ScrollText, Dices } from "lucide-react";

// --- HIGH-QUALITY LOCAL ASSETS ---
const HERO_SLIDES = [
  {
    id: 1,
    title: "SECRETS OF THE ARCANE",
    subtitle: "The Weave Awaits Your Command",
    description: "Selami misteri sihir yang belum terpecahkan. Panduan komprehensif untuk para penyihir, warlock, dan sorcerer yang berani menyentuh inti dari Weave.",
    badge: "Arcane Expansion",
    btnText: "BACA LORE",
    btnLink: "/characters",
    bgImage: "/images/hero_arcane.png",
    mainTitle: "ARCANE SECRETS"
  },
  {
    id: 2,
    title: "VOYAGE TO THE ASTRAL SEA",
    subtitle: "Spelljammer Adventurer's Guide",
    description: "Kendalikan kapal terbang melintasi lautan bintang kosmik. Temukan ras baru, monster alien, dan harta karun yang tersembunyi di balik rasi bintang.",
    badge: "Cosmic Journey",
    btnText: "MULAI PETUALANGAN",
    btnLink: "/campaigns",
    bgImage: "/images/hero_astral.png",
    mainTitle: "ASTRAL VOYAGE"
  }
];

const CLASSES = [
  { name: "Fighter", icon: Sword, desc: "Ahli pertempuran jarak dekat.", image: "/images/class_fighter.png" },
  { name: "Wizard", icon: Sparkles, desc: "Penguasa sihir misterius.", image: "/images/class_wizard.png" },
  { name: "Paladin", icon: Shield, desc: "Ksatria suci pembawa cahaya.", image: "/images/class_paladin.png" },
  { name: "Rogue", icon: Skull, desc: "Pembunuh bayaran dalam gelap.", image: "/images/class_rogue.png" },
];

const BESTIARY = [
  { name: "Ancient Blue Dragon", type: "Dragon", cr: "23", image: "/images/monster_dragon.png" },
  { name: "Mind Flayer", type: "Aberration", cr: "7", image: "/images/class_rogue.png" },
  { name: "Lich", type: "Undead", cr: "21", image: "/images/class_wizard.png" },
];

const EXPLORE_ARTICLES = [
  { id: 1, title: "Misteri Rasi Bintang Utara", category: "ASTRAL LORE", date: "May 18, 2026", image: "/images/hero_astral.png" },
  { id: 2, title: "Cara Menguasai Counterspell", category: "MAGIC GUIDE", date: "May 15, 2026", image: "/images/hero_arcane.png" },
  { id: 3, title: "Legenda Kota Kristal Bawah Laut", category: "WORLD BUILDING", date: "May 12, 2026", image: "/images/class_paladin.png" },
  { id: 4, title: "Bernegosiasi dengan Archfey", category: "DM TIPS", date: "May 10, 2026", image: "/images/class_fighter.png" },
];

export default function EpicLandingPage() {
  const { data: session } = useSession();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);

  return (
    <div className="min-h-screen bg-[#fdfaf6] text-stone-900 font-sans selection:bg-amber-500/30 selection:text-amber-900 overflow-x-hidden relative">
      
      {/* GLOBAL BACKGROUND NOISE (PARCHMENT TEXTURE) */}
      <div className="fixed inset-0 opacity-[0.4] pointer-events-none z-0 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>

      {/* ---------------- NAVBAR ---------------- */}
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 border-b ${isScrolled ? "bg-[#fdfaf6]/90 backdrop-blur-md border-[#d4c5b0] shadow-sm py-3" : "bg-[#fdfaf6]/50 border-transparent py-6"}`}>
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-10">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 border-2 border-stone-300mber-700 rounded-xl flex items-center justify-center text-xl bg-[#f9f6f0] group-hover:bg-amber-50 transition-all duration-300 overflow-hidden shadow-sm">
                <img src="/images/logo_dragon.png" alt="DnDOnline Logo" className="w-full h-full object-cover scale-125 mix-blend-multiply opacity-80" />
              </div>
              <span className="text-2xl font-black text-stone-900 tracking-tighter uppercase drop-shadow-sm">
                DnD<span className="text-amber-700">Online</span>
              </span>
            </Link>
            
            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-stone-600">
              <Link href="/campaigns" className="hover:text-amber-700 transition-colors flex items-center gap-1">Play D&D <ChevronRight size={12} className="opacity-50 rotate-90" /></Link>
              <Link href="/rules" className="hover:text-amber-700 transition-colors flex items-center gap-1">Rules <ChevronRight size={12} className="opacity-50 rotate-90" /></Link>
              <Link href="/lore" className="hover:text-amber-700 transition-colors flex items-center gap-1">Library & Lore <ChevronRight size={12} className="opacity-50 rotate-90" /></Link>
              <Link href="/community" className="hover:text-amber-700 transition-colors flex items-center gap-1">Community <ChevronRight size={12} className="opacity-50 rotate-90" /></Link>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-5">
            <button className="text-stone-600 hover:text-stone-900 transition-colors hidden md:block"><Search size={20} /></button>
            
            {session ? (
              <div className="flex items-center gap-4">
                <Link href="/profile" className="flex items-center gap-3 bg-white hover:bg-amber-50 border border-[#d4c5b0] px-4 py-2 rounded-xl transition-all shadow-sm">
                  <div className="w-6 h-6 bg-amber-700 rounded-md flex items-center justify-center text-xs font-black text-stone-900">
                    {session.user?.name?.charAt(0) || "U"}
                  </div>
                  <span className="text-[11px] font-bold text-stone-700 hidden sm:block">Hi, {session.user?.name || session.user?.email?.split('@')[0]}</span>
                </Link>
                <Link href="/characters" className="text-[11px] font-black uppercase tracking-widest text-stone-600 hover:text-stone-900 transition-colors hidden md:block">
                  Karakter Saya
                </Link>
                <Link href="/campaigns" className="bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-stone-900 font-black text-[11px] uppercase tracking-widest px-6 py-2.5 rounded-xl transition-all shadow-md hover:scale-105">
                  Dashboard
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-[11px] font-black uppercase tracking-widest text-stone-600 hover:text-stone-900 transition-colors">Sign In</Link>
                <Link href="/register" className="bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-stone-900 font-black text-[11px] uppercase tracking-widest px-6 py-2.5 rounded-xl transition-all shadow-md hover:scale-105">
                  Register
                </Link>
              </div>
            )}
            <button className="lg:hidden text-stone-600"><Menu size={24} /></button>
          </div>
        </div>
      </nav>

      {/* ---------------- HERO CAROUSEL ---------------- */}
      <section className="relative w-full h-[95vh] overflow-hidden bg-stone-900 flex items-center pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('${HERO_SLIDES[currentSlide].bgImage}')`, filter: 'sepia(0.3)' }}></div>
            <div className="absolute inset-0 bg-gradient-to-r from-stone-900/95 via-stone-900/70 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent"></div>

            {/* Content */}
            <div className="relative z-10 h-full max-w-[1400px] mx-auto px-6 lg:px-20 flex flex-col justify-center">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }} className="max-w-3xl mt-12">
                
                <div className="flex items-center gap-3 mb-6">
                  <span className="bg-amber-700 text-stone-900 text-[9px] font-black uppercase px-3 py-1 rounded-full tracking-widest shadow-sm">{HERO_SLIDES[currentSlide].badge}</span>
                  <span className="text-amber-400 text-xs font-bold tracking-widest uppercase italic">{HERO_SLIDES[currentSlide].subtitle}</span>
                </div>
                
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-[#fdfaf6] uppercase tracking-tighter leading-[0.9] mb-6 drop-shadow-md" style={{ fontFamily: 'Georgia, serif' }}>
                  {HERO_SLIDES[currentSlide].mainTitle}
                </h1>
                
                <p className="text-sm md:text-lg text-[#d4c5b0] font-medium mb-12 leading-relaxed max-w-xl">
                  {HERO_SLIDES[currentSlide].description}
                </p>
                
                <Link href={HERO_SLIDES[currentSlide].btnLink} className="inline-flex items-center justify-center gap-3 bg-[#fdfaf6] text-stone-900 hover:bg-white font-black text-xs uppercase tracking-[0.2em] px-10 py-5 rounded-2xl transition-all shadow-md group hover:scale-105 border border-[#d4c5b0]">
                  {HERO_SLIDES[currentSlide].btnText} <span className="group-hover:translate-x-1 transition-transform text-xl text-amber-700">→</span>
                </Link>

              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Controls */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full px-4 lg:px-10 flex justify-between pointer-events-none z-20">
          <button onClick={prevSlide} className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-stone-900 backdrop-blur-md pointer-events-auto transition-all hover:scale-110 shadow-lg">
            <ChevronLeft size={28} />
          </button>
          <button onClick={nextSlide} className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-stone-900 backdrop-blur-md pointer-events-auto transition-all hover:scale-110 shadow-lg">
            <ChevronRight size={28} />
          </button>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 z-20 bg-stone-900/50 backdrop-blur-md px-6 py-3 rounded-full border border-amber-900/20">
          {HERO_SLIDES.map((_, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <button onClick={() => setCurrentSlide(idx)} className="relative w-16 h-1.5 bg-white/20 rounded-full overflow-hidden transition-all hover:bg-white/40">
                {currentSlide === idx && (
                  <motion.div layoutId="activeSlideIndicator" className="absolute top-0 left-0 h-full bg-amber-500 w-full shadow-sm" />
                )}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- QUICK TOOLS BAR ---------------- */}
      <section className="relative z-20 -mt-8 px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="bg-white/95 backdrop-blur-xl border border-[#d4c5b0] rounded-3xl p-6 shadow-xl flex flex-wrap items-center justify-center lg:justify-between gap-6">
            <div className="text-[10px] font-black text-amber-700 uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={14} /> Akses Cepat Weave
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-10">
              {[
                { label: "Buku Peraturan", icon: BookOpen, href: "/rules" },
                { label: "Tempa Karakter", icon: Settings, href: "/characters/new" },
                { label: "Karakter Saya", icon: User, href: "/characters" },
                { label: "Kelola Party", icon: Users, href: "/campaigns" },
                { label: "Monster Manual", icon: Skull, href: "/lore" },
              ].map((tool, idx) => (
                <Link key={idx} href={tool.href} className="flex items-center gap-3 text-stone-600 hover:text-amber-700 transition-all group">
                  <div className={`w-10 h-10 rounded-xl bg-[#fdfaf6] border border-[#d4c5b0] group-hover:bg-amber-50 group-hover:border-amber-200 flex items-center justify-center transition-all group-hover:scale-110`}>
                    <tool.icon size={16} />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-widest">{tool.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- HALL OF HEROES (CLASSES) ---------------- */}
      <section className="py-32 px-6 relative z-10 overflow-hidden">
        <div className="max-w-[1400px] mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
            <span className="text-amber-600 font-black text-[10px] uppercase tracking-[0.3em] mb-2 block">Pilih Jalan Takdirmu</span>
            <h2 className="text-4xl md:text-6xl font-black text-stone-900 uppercase tracking-tighter" style={{ fontFamily: 'Georgia, serif' }}>
              Hall of <span className="text-amber-700">Heroes</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CLASSES.map((cls, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="group cursor-pointer">
                <div className="relative h-80 rounded-[2rem] overflow-hidden border border-[#d4c5b0] bg-white shadow-md hover:shadow-xl hover:border-amber-400 transition-all">
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1" style={{ backgroundImage: `url('${cls.image}')`, filter: 'sepia(0.2)' }}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/50 to-transparent opacity-80 group-hover:opacity-70 transition-opacity"></div>
                  
                  <div className="absolute inset-0 p-8 flex flex-col justify-end">
                    <div className="w-12 h-12 rounded-full bg-[#fdfaf6] border border-[#d4c5b0] flex items-center justify-center text-amber-700 mb-4 group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-stone-900 transition-all shadow-sm">
                      <cls.icon size={20} />
                    </div>
                    <h3 className="text-3xl font-black text-stone-900 uppercase tracking-tight mb-2 group-hover:text-amber-400 transition-colors">{cls.name}</h3>
                    <p className="text-xs text-[#d4c5b0] font-medium transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">{cls.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- IMMERSIVE FEATURE: COMBAT ENGINE ---------------- */}
      <section className="py-32 px-6 relative bg-white border-y border-[#d4c5b0]">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center gap-20 relative z-10">
          
          {/* Left Visual */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="flex-1 w-full relative">
            <div className="relative aspect-square md:aspect-video lg:aspect-square bg-[#fdfaf6] rounded-[3rem] border border-[#d4c5b0] overflow-hidden shadow-lg flex flex-col items-center justify-center p-8 group">
              
              <div className="absolute inset-0 opacity-20 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>
              
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 40, ease: "linear" }} className="absolute w-[150%] h-[150%] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(217,119,6,0.1)_360deg)] opacity-50"></motion.div>
              
              <div className="relative z-10 w-40 h-40 bg-white rounded-3xl rotate-12 flex items-center justify-center shadow-lg group-hover:rotate-0 transition-transform duration-500 border-2 border-stone-300mber-600">
                <Dices size={80} className="text-amber-700 drop-shadow-sm" />
              </div>
              
              <div className="relative z-10 mt-12 w-full max-w-sm bg-white/90 backdrop-blur-md border border-[#d4c5b0] rounded-2xl p-6 shadow-md transform group-hover:-translate-y-4 transition-transform duration-500">
                <div className="flex justify-between items-center mb-4 border-b border-[#d4c5b0] pb-2">
                  <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Combat Log</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <div className="space-y-3">
                  <div className="text-sm font-bold text-stone-700"><span className="text-amber-700">Paladin</span> menyerang dengan Longsword...</div>
                  <div className="text-lg font-black text-stone-900 bg-stone-50 px-4 py-2 rounded-lg border border-[#d4c5b0] flex items-center justify-between">
                    <span>Roll: 1d20 + 5</span>
                    <span className="text-amber-700">19</span>
                  </div>
                  <div className="text-xs font-black text-emerald-600 uppercase tracking-widest">Hit! Mengurangi 12 HP.</div>
                </div>
              </div>

            </div>
          </motion.div>

          {/* Right Content */}
          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="flex-1 space-y-8">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg border border-amber-500/30 bg-amber-50 text-amber-700 text-[9px] font-black uppercase tracking-widest shadow-sm">
               <Settings size={12} /> Arcane Engine
             </div>
             <h2 className="text-5xl font-black text-stone-900 uppercase tracking-tighter leading-[1.1]" style={{ fontFamily: 'Georgia, serif' }}>
               Otomatisasi <br/>
               <span className="text-amber-700 drop-shadow-sm">Pertempuran</span>
             </h2>
             <p className="text-stone-600 text-lg leading-relaxed max-w-lg">
               Sistem pertarungan terintegrasi DnDOnline akan menangani semua matematika kompleks untuk Anda. Fokus pada deskripsi epik dan roleplay, biarkan Weave yang menghitung dadu.
             </p>
             
             <div className="space-y-6 pt-4">
               {[
                 { title: "Floating Dice Tray", desc: "Lempar d4 hingga d20 secara instan dengan efek visual dadu yang menyatu dengan tema tanpa harus meninggalkan halaman." },
                 { title: "Smart Inventory Sync", desc: "Senjata yang Anda simpan di tas akan otomatis muncul di daftar serangan, lengkap dengan modifier." },
                 { title: "Real-time HP Tracking", desc: "Pantau *Health Points*, *Spell Slots*, dan *Death Saves* secara langsung dengan anggota party." }
               ].map((item, i) => (
                 <div key={i} className="flex gap-5">
                   <div className="mt-1 w-10 h-10 shrink-0 rounded-xl bg-[#fdfaf6] border border-[#d4c5b0] text-amber-700 flex items-center justify-center text-lg font-black shadow-sm">
                     {i+1}
                   </div>
                   <div>
                     <h4 className="text-lg font-black text-stone-900 uppercase tracking-tight mb-1">{item.title}</h4>
                     <p className="text-xs text-stone-500 leading-relaxed font-medium">{item.desc}</p>
                   </div>
                 </div>
               ))}
             </div>
             
             <div className="pt-6">
               <Link href="/characters/new" className="inline-flex items-center justify-center gap-3 bg-white hover:bg-amber-50 border border-[#d4c5b0] hover:border-amber-400 text-stone-900 font-black text-[10px] uppercase tracking-widest px-8 py-4 rounded-xl transition-all shadow-sm group">
                 Coba Simulasi Sekarang <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform text-amber-700" />
               </Link>
             </div>
          </motion.div>
        </div>
      </section>

      {/* ---------------- INTERACTIVE BESTIARY ---------------- */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-[1400px] mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-16">
            <span className="text-red-700 font-black text-[10px] uppercase tracking-[0.3em] mb-2 block">Monster Manual</span>
            <h2 className="text-4xl md:text-6xl font-black text-stone-900 uppercase tracking-tighter" style={{ fontFamily: 'Georgia, serif' }}>
              Hadapi <span className="text-red-700">Kegelapan</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {BESTIARY.map((monster, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.2 }} className="group relative">
                <div className="relative h-[400px] rounded-[3rem] overflow-hidden border border-[#d4c5b0] bg-white group-hover:border-red-400 transition-colors shadow-md hover:shadow-xl">
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url('${monster.image}')`, filter: 'sepia(0.1)' }}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent"></div>
                  
                  <div className="absolute inset-x-0 bottom-0 p-8 text-left">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="bg-red-900/90 backdrop-blur-md text-red-50 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-red-500/50">CR {monster.cr}</span>
                      <span className="text-[10px] font-bold text-[#d4c5b0] uppercase tracking-widest">{monster.type}</span>
                    </div>
                    <h3 className="text-2xl font-black text-stone-900 uppercase tracking-tight mb-2 group-hover:text-red-400 transition-colors">{monster.name}</h3>
                  </div>
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-stone-900/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-6 text-center border-4 border-red-900/30 rounded-[3rem]">
                    <Skull size={40} className="text-red-500 mb-4" />
                    <h4 className="text-xl font-black text-stone-900 uppercase mb-2">Lihat Stat Block</h4>
                    <p className="text-xs text-[#d4c5b0] font-medium">Pelajari kelemahan dan serangan khusus dari makhluk ini.</p>
                    <button className="mt-6 px-6 py-2 border border-red-500 rounded-full text-[10px] font-black text-stone-900 uppercase tracking-widest hover:bg-red-600 transition-colors">Buka Manual</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- EXPLORE MORE (LORE ARTICLES) ---------------- */}
      <section className="py-32 px-6 bg-stone-100 relative overflow-hidden border-t border-[#d4c5b0]">
        <div className="max-w-[1400px] mx-auto relative z-10">
          
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-stone-900 tracking-tighter mb-4 uppercase" style={{ fontFamily: 'Georgia, serif' }}>
              Perluas <span className="text-amber-700">Wawasanmu</span>
            </h2>
            <div className="w-24 h-1 bg-amber-600 mx-auto rounded-full mb-6"></div>
            <p className="text-stone-500 text-sm font-medium">Berita terbaru, lore mendalam, dan tip untuk DM.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {EXPLORE_ARTICLES.map((article) => (
              <motion.div key={article.id} whileHover={{ y: -10 }} className="bg-white rounded-2xl overflow-hidden group border border-[#d4c5b0] hover:border-amber-400 transition-all duration-300 shadow-md hover:shadow-xl cursor-pointer flex flex-col">
                <div className="relative h-48 overflow-hidden shrink-0">
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url('${article.image}')`, filter: 'sepia(0.2)' }}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 to-transparent"></div>
                  <div className="absolute top-4 left-4 bg-amber-700/90 backdrop-blur-md text-stone-900 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-amber-500/50">
                    {article.category}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <p className="text-[9px] text-stone-400 font-bold tracking-widest mb-3 uppercase">{article.date}</p>
                  <h3 className="text-lg font-black text-stone-900 leading-snug mb-4 group-hover:text-amber-700 transition-colors">{article.title}</h3>
                  <div className="mt-auto flex items-center text-[10px] font-black text-amber-700 uppercase tracking-widest group-hover:text-amber-500 transition-colors">
                    Baca Selengkapnya <ChevronRight size={14} className="ml-1" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <button className="px-8 py-3 rounded-full border border-[#d4c5b0] hover:border-amber-400 bg-white text-[10px] font-black text-stone-600 uppercase tracking-widest transition-colors hover:text-amber-700 shadow-sm hover:shadow-md">Lihat Semua Arsip</button>
          </div>
        </div>
      </section>

      {/* ---------------- TAVERN RUMORS (TESTIMONIALS) ---------------- */}
      <section className="py-24 px-6 relative z-10 bg-[#fdfaf6]">
        <div className="max-w-[1000px] mx-auto text-center relative z-10">
          <ScrollText size={40} className="text-amber-700/50 mx-auto mb-6" />
          <h2 className="text-2xl md:text-3xl font-black text-stone-900 uppercase tracking-widest mb-12">Rumor di The Yawning Portal</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-[#d4c5b0] relative shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl text-amber-200 absolute top-4 left-4 font-serif">"</div>
              <p className="text-sm text-stone-600 leading-relaxed italic mb-6 relative z-10">DnDOnline mengubah cara party saya bermain. Tidak ada lagi kebingungan menghitung bonus serangan. Semuanya otomatis, dan gayanya sungguh klasik!</p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-700 flex items-center justify-center text-xs font-black text-stone-900">E</div>
                <div className="text-left">
                  <div className="text-[11px] font-black text-stone-900 uppercase tracking-widest">Elara Moonwhisper</div>
                  <div className="text-[9px] font-bold text-stone-500 uppercase tracking-widest">Dungeon Master (3 Tahun)</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-3xl border border-[#d4c5b0] relative shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl text-amber-200 absolute top-4 left-4 font-serif">"</div>
              <p className="text-sm text-stone-600 leading-relaxed italic mb-6 relative z-10">Sebagai pemain baru, membuat karakter dulu terasa mengintimidasi. Dengan sistem DNDOnline, rasanya seperti membaca perkamen legendaris yang mudah dipahami.</p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-stone-700 flex items-center justify-center text-xs font-black text-stone-900">T</div>
                <div className="text-left">
                  <div className="text-[11px] font-black text-stone-900 uppercase tracking-widest">Throm Ironfist</div>
                  <div className="text-[9px] font-bold text-stone-500 uppercase tracking-widest">Level 5 Fighter</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- EPIC CTA SECTION ---------------- */}
      <section className="relative py-40 px-6 overflow-hidden bg-stone-900">
        <div className="absolute inset-0 bg-[url('/images/hero_astral.png')] bg-cover bg-center opacity-20 filter grayscale sepia-[0.5]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/80 to-transparent"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="bg-[#fdfaf6]/95 backdrop-blur-xl p-12 md:p-24 rounded-[4rem] border border-[#d4c5b0] shadow-2xl">
            <div className="w-20 h-20 bg-white border-4 border-amber-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg mx-auto mb-8 animate-bounce overflow-hidden">
              <img src="/images/logo_dragon.png" alt="Logo CTA" className="w-full h-full object-cover mix-blend-multiply scale-125 opacity-80" />
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-stone-900 uppercase tracking-tighter mb-6" style={{ fontFamily: 'Georgia, serif' }}>Mulailah <br/><span className="text-amber-700">Legenda Anda</span></h2>
            <p className="text-stone-600 font-medium mb-12 max-w-xl mx-auto text-lg leading-relaxed">Pintu Tavern telah terbuka. Ambil senjatamu, kumpulkan party, dan mulailah petualangan yang tak terlupakan hari ini juga.</p>
            <Link href="/register" className="inline-flex items-center justify-center gap-3 w-full sm:w-auto px-12 py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest text-stone-900 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 shadow-xl transition-all hover:scale-105 group border border-amber-800">
              BUAT AKUN GRATIS <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="bg-stone-950 pt-24 pb-12 px-6 border-t border-stone-800 relative z-10">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-10 mb-20">
            <div className="col-span-2 lg:col-span-2">
               <span className="text-3xl font-black text-stone-900 tracking-tighter uppercase flex items-center mb-6">
                  DnD<span className="text-amber-600">Online</span>
               </span>
               <p className="text-xs text-stone-400 font-medium leading-relaxed max-w-sm mb-8">Platform revolusioner Next-Gen D&D 5e bergaya klasik untuk mempermudah permainan roleplaying Anda. Jelajahi dunia, bertarung dengan naga, dan buat cerita legendaris bersama teman-teman.</p>
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center text-stone-500 hover:bg-amber-600 hover:text-stone-900 border border-stone-800 transition-colors cursor-pointer">X</div>
                 <div className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center text-stone-500 hover:bg-amber-600 hover:text-stone-900 border border-stone-800 transition-colors cursor-pointer">DC</div>
                 <div className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center text-stone-500 hover:bg-amber-600 hover:text-stone-900 border border-stone-800 transition-colors cursor-pointer">YT</div>
               </div>
            </div>
            
            {/* Footer Links */}
            {[
              { title: "Mulai Bermain", links: ["Buat Karakter", "Cari Campaign", "Lempar Dadu", "Tools DM"] },
              { title: "Pustaka Sihir", links: ["Daftar Kelas", "Ras & Origin", "Grimoire Spell", "Monster Manual"] },
              { title: "Komunitas", links: ["Tavern Forum", "Discord Server", "Twitch Streams", "Event Komunitas"] },
              { title: "Bantuan", links: ["Pusat Bantuan", "Hubungi Support", "Kebijakan Privasi", "Syarat Ketentuan"] }
            ].map((col, idx) => (
              <div key={idx} className="col-span-1">
                <h4 className="text-stone-300 text-[10px] font-black uppercase tracking-widest mb-6">{col.title}</h4>
                <ul className="space-y-4">
                  {col.links.map((link, i) => (
                    <li key={i}><a href="#" className="text-[11px] font-bold text-stone-500 hover:text-amber-500 hover:underline transition-all uppercase tracking-wider">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-stone-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-[9px] text-stone-600 font-bold tracking-[0.2em] uppercase text-center md:text-left">
              © 2026 DnDOnline. Dungeons & Dragons adalah properti dari Wizards of the Coast. Website ini adalah fan-made platform independen non-komersial. Dibuat dengan sihir Next.js 16.
            </p>
            <div className="flex gap-4">
              <span className="w-2 h-2 rounded-full bg-stone-800"></span>
              <span className="w-2 h-2 rounded-full bg-stone-800"></span>
              <span className="w-2 h-2 rounded-full bg-amber-700/50"></span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}