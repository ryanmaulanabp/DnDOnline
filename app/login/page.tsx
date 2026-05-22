"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) { 
      setError("Email dan Password tidak boleh kosong."); 
      return; 
    }
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError("Format email tidak valid.");
      return;
    }

    setIsLoading(true);
    
    // Proses SignIn lewat NextAuth
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setIsLoading(false);

    if (res?.error) {
      setError(res.error);
    } else {
      // Login sukses, masuk ke Dashboard utama!
      router.push("/");
      router.refresh();
    }
  };

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <main className="min-h-screen bg-[#fdfaf6] flex items-center justify-center p-4 relative overflow-hidden selection:bg-amber-500/30 font-sans">
      
      {/* --- BACKGROUND VISUALS --- */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Parchment Texture */}
        <div className="absolute inset-0 opacity-[0.4] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />

        {/* Vintage Map / Arcane Diagram lines */}
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }} 
          className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] border-[2px] border-[#d4c5b0] rounded-full opacity-50 border-dashed" 
        />
        
        {/* Core Ambient Light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(217,119,6,0.05)_0%,_transparent_70%)] blur-[100px]" />
      </div>

      {/* --- MAIN LOGIN CARD --- */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Classic Parchment Card */}
        <div className="bg-white/90 backdrop-blur-3xl border border-[#d4c5b0] p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden">
          
          {/* Header */}
          <div className="text-center mb-10 relative">
            <Link href="/" className="font-black text-stone-900 tracking-tighter text-4xl uppercase inline-block mb-2">
              DND<span className="text-amber-700">ONLINE</span>
            </Link>
            <h1 className="text-sm font-black text-stone-500 uppercase tracking-[0.4em] mt-1">Sign Into Realm</h1>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-1 bg-amber-600 rounded-full" />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="mb-6">
                <div className="bg-red-50 border border-red-200 text-red-600 text-[10px] font-black uppercase tracking-widest p-4 rounded-2xl text-center leading-relaxed shadow-sm">
                  ⚠️ {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-stone-500 uppercase tracking-[0.2em] pl-2">Adventurer Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value.replace(/\s/g, ""))} 
                maxLength={64} 
                required 
                className="w-full bg-[#fdfaf6] border border-[#d4c5b0] px-5 py-4 rounded-2xl text-sm font-bold text-stone-900 outline-none focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500/50 shadow-inner transition-all duration-300 placeholder:text-stone-400" 
                placeholder="name@tavern.com" 
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-2">
                <label className="text-[9px] font-black text-stone-500 uppercase tracking-[0.2em]">Secret Key</label>
                <button type="button" className="text-[8px] font-bold text-amber-600 hover:text-amber-800 uppercase tracking-widest transition-colors">Forgot?</button>
              </div>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value.replace(/\s/g, ""))} 
                minLength={8} 
                maxLength={32} 
                required 
                className="w-full bg-[#fdfaf6] border border-[#d4c5b0] px-5 py-4 rounded-2xl text-sm font-bold text-stone-900 outline-none focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500/50 shadow-inner transition-all duration-300 placeholder:text-stone-400" 
                placeholder="••••••••" 
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full py-4 bg-gradient-to-br from-amber-700 to-amber-600 border border-amber-800 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] text-stone-900 shadow-md hover:from-amber-600 hover:to-amber-500 hover:shadow-lg active:scale-[0.98] transition-all duration-300 mt-2 relative overflow-hidden group"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              {isLoading ? "Channeling..." : "Enter Tavern"}
            </button>
          </form>

          <div className="my-8 flex items-center gap-4 opacity-60">
            <div className="h-px bg-gradient-to-r from-transparent to-[#d4c5b0] flex-1" />
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-stone-400">OR</span>
            <div className="h-px bg-gradient-to-l from-transparent to-[#d4c5b0] flex-1" />
          </div>

          <button 
            type="button" 
            onClick={handleGoogleLogin}
            className="w-full bg-[#fdfaf6] text-stone-900 font-black text-[10px] uppercase tracking-[0.2em] py-4 rounded-2xl hover:bg-white active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 shadow-sm border border-[#d4c5b0] hover:shadow-md"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" className="w-4 h-4" alt="Google" />
            Sign in with Google
          </button>

          <p className="text-center mt-8 text-[10px] font-bold text-stone-500 tracking-widest uppercase">
            New to the party? <Link href="/register" className="text-amber-700 hover:text-amber-900 transition-colors underline underline-offset-4 decoration-amber-500/50 hover:decoration-amber-900 font-black ml-1">Create Profile</Link>
          </p>
        </div>
      </motion.div>

      {/* Global CSS animation for button shimmer */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </main>
  );
}