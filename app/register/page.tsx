"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    if (formData.username.length < 4 || formData.username.length > 20) return "Username harus 4-20 karakter (Huruf & Angka saja).";
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) return "Format Email tidak sah.";
    if (formData.password.length < 8 || formData.password.length > 32) return "Password harus 8-32 karakter.";
    if (!/(?=.*[a-z])/.test(formData.password)) return "Password butuh minimal 1 huruf kecil.";
    if (!/(?=.*[A-Z])/.test(formData.password)) return "Password butuh minimal 1 huruf besar.";
    if (!/(?=.*\d)/.test(formData.password)) return "Password butuh minimal 1 angka.";
    if (formData.password !== formData.confirmPassword) return "Konfirmasi password tidak cocok.";
    return null;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    
    setIsLoading(true);
    
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Pendaftaran sukses, langsung login otomatis
        const signInRes = await signIn("credentials", {
          redirect: false,
          email: formData.email,
          password: formData.password,
        });
        
        if (!signInRes?.error) {
          router.push("/");
          router.refresh(); // Memaksa Next.js mengambil data sesi terbaru
        } else {
          setError("Gagal login otomatis setelah mendaftar.");
        }
      } else {
        setError(data.message || "Gagal mendaftar.");
      }
    } catch (error) {
      setError("Kesalahan koneksi ke Database.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fdfaf6] flex items-center justify-center p-4 relative overflow-hidden selection:bg-amber-500/30 py-20 font-sans">
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Parchment Texture */}
        <div className="absolute inset-0 opacity-[0.4] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />
        
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none select-none flex flex-wrap gap-10 p-10 justify-center items-center text-4xl text-stone-900 font-serif mix-blend-multiply">
          {Array.from({ length: 40 }).map((_, i) => <span key={i}>ᚱ ᚦ ᚠ ᚢ ᚲ ᚷ ᚹ</span>)}
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-lg bg-white/90 backdrop-blur-3xl border-2 border-[#d4c5b0] p-10 rounded-[3.5rem] shadow-xl relative z-10"
      >
        <div className="absolute -top-1 -left-1 w-20 h-20 border-t-4 border-l-4 border-amber-600 rounded-tl-[3.5rem]" />
        <div className="absolute -bottom-1 -right-1 w-20 h-20 border-b-4 border-r-4 border-amber-600 rounded-br-[3.5rem]" />

        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-stone-900 uppercase tracking-[0.4em]">Forge New <span className="text-amber-700">Legend</span></h1>
          <p className="text-[10px] text-stone-500 font-bold uppercase tracking-[0.2em] mt-3">Daftarkan namamu dalam gulungan takdir.</p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-6">
              <div className="bg-red-50 border border-red-200 text-red-600 text-[10px] font-black uppercase tracking-widest p-4 rounded-2xl text-center leading-relaxed shadow-sm">
                ⚠️ {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[9px] font-black text-stone-500 uppercase tracking-widest pl-1">Unique Hero Name</label>
            <input type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value.replace(/[^a-zA-Z0-9]/g, "")})} minLength={4} maxLength={20} required className="w-full bg-[#fdfaf6] border border-[#d4c5b0] p-4 rounded-2xl text-sm font-bold text-stone-900 outline-none focus:bg-white focus:border-amber-500 transition-all shadow-inner placeholder:text-stone-400" placeholder="LordGaldur99 (Tanpa spasi)" />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[9px] font-black text-stone-500 uppercase tracking-widest pl-1">Guild Communication (Email)</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value.replace(/\s/g, "")})} maxLength={64} required className="w-full bg-[#fdfaf6] border border-[#d4c5b0] p-4 rounded-2xl text-sm font-bold text-stone-900 outline-none focus:bg-white focus:border-amber-500 transition-all shadow-inner placeholder:text-stone-400" placeholder="hero@realm.com" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-stone-500 uppercase tracking-widest pl-1">Secure Password</label>
            <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value.replace(/\s/g, "")})} minLength={8} maxLength={32} required className="w-full bg-[#fdfaf6] border border-[#d4c5b0] p-4 rounded-2xl text-sm font-bold text-stone-900 outline-none focus:bg-white focus:border-amber-500 transition-all shadow-inner placeholder:text-stone-400" placeholder="Min 8 Karakter" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-stone-500 uppercase tracking-widest pl-1">Repeat Ritual</label>
            <input type="password" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value.replace(/\s/g, "")})} minLength={8} maxLength={32} required className="w-full bg-[#fdfaf6] border border-[#d4c5b0] p-4 rounded-2xl text-sm font-bold text-stone-900 outline-none focus:bg-white focus:border-amber-500 transition-all shadow-inner placeholder:text-stone-400" placeholder="Ulangi Password" />
          </div>

          <button type="submit" disabled={isLoading} className="md:col-span-2 w-full py-5 bg-gradient-to-b from-amber-600 to-amber-700 rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] text-stone-900 shadow-md hover:from-amber-500 hover:to-amber-600 transition-all active:scale-95 mt-4">
            {isLoading ? "Signing Scroll..." : "Complete Enlistment"}
          </button>
        </form>

        <p className="text-center mt-10 text-[10px] font-bold text-stone-500 tracking-widest uppercase">
          Already a guild member? <Link href="/login" className="text-amber-700 hover:text-amber-900 font-black">Login to Realm</Link>
        </p>
      </motion.div>
    </main>
  );
}