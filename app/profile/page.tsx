"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { getCharactersByUserAction } from "@/app/actions/character";
import { updateUserProfileAction, getUserProfileAction } from "@/app/actions/user";
import { CheckCircle, Flame, User, Camera, Mail, Shield, LogOut, Settings2, Lock, Loader2, PenLine } from "lucide-react";

export default function ProfilePage() {
  // 'update' digunakan untuk me-refresh data sesi klien tanpa perlu memaksanya logout
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [charCount, setCharCount] = useState(0);

  // State Mode & Notifikasi
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error", msg: string } | null>(null);
  
  // State Data Formulir
  const [formData, setFormData] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [avatarUrl, setAvatarUrl] = useState("");
  const [displayUser, setDisplayUser] = useState<{name: string, email: string, image: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.email) {
      getCharactersByUserAction(session.user.email).then(chars => {
        setCharCount(chars.length);
      });
      // Ambil data FRESH dari database, mengabaikan cache JWT token bawaan NextAuth
      getUserProfileAction(session.user.email).then(freshUser => {
        if (freshUser) {
          setDisplayUser({
            name: freshUser.username || session?.user?.name || "",
            email: freshUser.email || session?.user?.email || "",
            image: freshUser.image || session?.user?.image || ""
          });
          setFormData(prev => ({
            ...prev,
            username: freshUser.username || session?.user?.name || "",
            email: freshUser.email || session?.user?.email || ""
          }));
          setAvatarUrl(freshUser.image || session?.user?.image || "");
        } else {
          setFormData(prev => ({ ...prev, username: session?.user?.name || session?.user?.email?.split('@')[0] || "", email: session?.user?.email || "" }));
          setAvatarUrl(session?.user?.image || "");
        }
      });
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#fdfaf6] flex flex-col items-center justify-center text-amber-700">
        <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mb-4" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Menghubungkan ke Weave...</span>
      </div>
    );
  }

  if (!session?.user) return null;

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  // Sistem Notifikasi Melayang (Floating Toast)
  const showNotif = (type: "success" | "error", msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 5000);
  };

  // Engine Kompresi Gambar Avatar (Client-Side)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 400; // Dikompres jadi resolusi kecil agar ringan masuk DB
        let width = img.width; let height = img.height;
        if (width > height && width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } 
        else if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        setAvatarUrl(canvas.toDataURL("image/webp", 0.8));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Kirim data ke API (Update Database)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password && formData.password.length < 8) return showNotif("error", "Sandi Arcane (Password) minimal 8 karakter!");
    if (formData.password !== formData.confirmPassword) return showNotif("error", "Konfirmasi sandi tidak beresonansi (TIDAK COCOK)!");

    setIsSaving(true);
    const result = await updateUserProfileAction(session?.user?.email!, {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      image: avatarUrl
    });
    setIsSaving(false);

    if (result.success) {
      showNotif("success", result.message || "Gulungan identitas berhasil diperbarui!");
      setIsEditing(false);
      
      // Update tampilan UI seketika!
      setDisplayUser({
        name: formData.username,
        email: formData.email,
        image: avatarUrl
      });

      // Perbarui sesi lokal secara diam-diam
      await update({ name: formData.username, email: formData.email, image: avatarUrl });
      
      // Jika email atau password diubah, demi keamanan kita tendang (logout) user untuk login ulang
      if (formData.email !== session?.user?.email || formData.password) {
        showNotif("success", "Keamanan inti berubah. Melakukan relokasi dimensi (Login Ulang)...");
        setTimeout(() => handleLogout(), 3000);
      }
    } else {
      // Menampilkan pesan error dari Backend (misal: Email/Nama sudah dipakai orang lain)
      showNotif("error", result.message || "Gagal mengubah gulungan identitas.");
    }
  };

  return (
    <main className="min-h-screen bg-[#fdfaf6] text-stone-800 p-8 selection:bg-amber-500/30 overflow-x-auto relative flex flex-col items-center justify-center font-sans">
      {/* Background Visuals */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Parchment Texture */}
        <div className="absolute inset-0 opacity-[0.4] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />
        
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(212,197,176,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(212,197,176,0.2)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_80%)]" />
        
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-amber-600/5 blur-[150px] rounded-full mix-blend-multiply" />
      </div>

      {/* Notifikasi Melayang */}
      <AnimatePresence>
        {notification && (
          <motion.div initial={{ opacity: 0, y: -50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.9 }} className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4">
            <div className={`backdrop-blur-xl px-6 py-4 rounded-2xl border text-center font-black uppercase tracking-widest text-[10px] shadow-lg flex items-center justify-center gap-3 ${notification.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>
              <span className="text-xl">{notification.type === "success" ? <CheckCircle className="w-5 h-5" /> : <Flame className="w-5 h-5" />}</span>
              {notification.msg}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        layout
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="w-[900px] min-w-[900px] min-h-[500px] bg-white/90 backdrop-blur-3xl border border-[#d4c5b0] rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-row"
      >
        {/* Hologram / Watermark */}
        <div className="absolute top-1/2 left-[60%] -translate-x-1/2 -translate-y-1/2 text-[180px] font-black text-stone-900/[0.03] pointer-events-none select-none tracking-tighter -rotate-12 z-0 mix-blend-multiply">
          REALM
        </div>

        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-600 to-amber-400" />
        
        {/* LEFT COLUMN: IDENTITY BADGE & AVATAR */}
        <div className="w-[35%] flex flex-col items-center justify-center p-10 relative border-r border-[#d4c5b0] bg-[#fdfaf6] z-10 shadow-sm">
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
          <div 
            onClick={() => isEditing && fileInputRef.current?.click()} 
            className={`w-40 h-40 rounded-full border-4 shadow-sm flex items-center justify-center text-6xl relative overflow-hidden group transition-all duration-300 ${isEditing ? 'border-dashed border-amber-400 cursor-pointer hover:border-amber-500 bg-white' : 'border-[#d4c5b0] bg-white'}`}
          >
            {(isEditing ? avatarUrl : (displayUser?.image || session.user.image)) ? (
              <img src={(isEditing ? avatarUrl : (displayUser?.image || session.user.image)) as string} alt="Profile" className={`w-full h-full object-cover transition-all duration-500 ${isEditing ? 'group-hover:opacity-30' : ''}`} />
            ) : (
              <span className={`transition-transform duration-500 ${isEditing ? 'group-hover:scale-90 opacity-50' : ''}`}><User className="w-16 h-16 text-stone-400" /></span>
            )}
            {isEditing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm">
                <Camera className="w-8 h-8 text-amber-700" />
                <span className="text-[8px] font-black text-stone-700 mt-2 uppercase tracking-widest">Ubah Wujud</span>
              </div>
            )}
          </div>
          
          <h1 className="text-3xl font-black text-stone-900 uppercase tracking-tighter mt-6 text-center" style={{ fontFamily: 'Georgia, serif' }}>
            {isEditing ? formData.username || "UNKNOWN" : (displayUser?.name || session.user.name || session.user.email?.split('@')[0])}
          </h1>
          <p className="text-[9px] font-black text-amber-700 uppercase tracking-[0.4em] mt-3 text-center bg-amber-50 px-4 py-1.5 rounded-full border border-amber-200 shadow-sm">
            Tavern Member
          </p>
        </div>

        {/* RIGHT COLUMN: DYNAMIC CONTENT (VIEW / EDIT) */}
        <div className="w-[65%] p-12 flex flex-col justify-center relative z-10">
          <AnimatePresence mode="wait">
            {!isEditing ? (
              /* --- VIEW MODE --- */
              <motion.div key="view" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#d4c5b0]">
                    <h2 className="text-2xl font-black text-stone-900 uppercase tracking-widest">Dossier Profil</h2>
                    <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-white border border-[#d4c5b0] rounded-lg text-[10px] font-black text-stone-600 uppercase tracking-widest hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 transition-all shadow-sm flex items-center gap-1.5">
                      <Settings2 className="w-3.5 h-3.5" /> Rekayasa (Edit)
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-10">
                    <div className="bg-[#fdfaf6] border border-[#d4c5b0] p-6 rounded-2xl shadow-inner group hover:border-amber-400 transition-colors">
                      <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-2 mb-2"><Mail className="w-4 h-4" /> Email Guild</span>
                      <span className="text-sm font-bold text-stone-800 group-hover:text-amber-700 transition-colors truncate block">{displayUser?.email || session.user.email}</span>
                    </div>
                    <div className="bg-[#fdfaf6] border border-[#d4c5b0] p-6 rounded-2xl shadow-inner group hover:border-amber-400 transition-colors">
                      <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-2 mb-2"><Shield className="w-4 h-4" /> Total Pahlawan</span>
                      <span className="text-2xl font-black text-amber-700 group-hover:text-amber-600 transition-colors">{charCount} Hero</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-auto">
                  <Link href="/" className="flex-1 py-4 bg-gradient-to-r from-amber-600 to-amber-700 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] text-stone-900 text-center shadow-md hover:from-amber-500 hover:to-amber-600 transition-all active:scale-95 border border-amber-800">
                    ← Kembali ke Tavern
                  </Link>
                  <button onClick={handleLogout} className="flex-1 py-4 bg-white border-2 border-red-200 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] text-red-600 hover:bg-red-50 hover:border-red-300 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </motion.div>
            ) : (
              /* --- EDIT MODE --- */
              <motion.form key="edit" onSubmit={handleSaveProfile} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full justify-between">
                <div>
                  <h3 className="text-xl font-black text-stone-900 uppercase tracking-widest mb-6 border-b border-[#d4c5b0] pb-4">Ubah Gulungan Identitas</h3>
                  
                  <div className="grid grid-cols-2 gap-5 mb-6">
                    <div className="col-span-1">
                      <label className="text-[9px] font-black text-stone-600 uppercase tracking-[0.2em] pl-1 block mb-2">Nama Pahlawan (Username)</label>
                      <input type="text" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value.replace(/[^a-zA-Z0-9]/g, "") })} minLength={4} maxLength={20} required className="w-full bg-[#fdfaf6] border border-[#d4c5b0] px-4 py-3.5 rounded-xl text-sm font-bold text-stone-900 outline-none focus:bg-white focus:border-amber-500 transition-all shadow-inner" />
                    </div>
                    <div className="col-span-1">
                      <label className="text-[9px] font-black text-stone-600 uppercase tracking-[0.2em] pl-1 block mb-2">Email Komunikasi</label>
                      <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value.replace(/\s/g, "") })} required className="w-full bg-[#fdfaf6] border border-[#d4c5b0] px-4 py-3.5 rounded-xl text-sm font-bold text-stone-900 outline-none focus:bg-white focus:border-amber-500 transition-all shadow-inner" />
                    </div>
                  </div>
                    
                  <div className="bg-white border border-[#d4c5b0] p-5 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <Lock className="w-4 h-4 text-amber-700" />
                      <p className="text-[9px] font-black text-stone-600 uppercase tracking-widest">Sandi Arcane (Kosongkan jika tak diubah)</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value.replace(/\s/g, "") })} minLength={8} className="w-full bg-[#fdfaf6] border border-[#d4c5b0] px-4 py-3 rounded-xl text-sm text-stone-900 outline-none focus:bg-white focus:border-amber-500 transition-all placeholder:text-stone-400 shadow-inner" placeholder="Sandi Baru..." />
                      <input type="password" value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value.replace(/\s/g, "") })} minLength={8} className="w-full bg-[#fdfaf6] border border-[#d4c5b0] px-4 py-3 rounded-xl text-sm text-stone-900 outline-none focus:bg-white focus:border-amber-500 transition-all placeholder:text-stone-400 shadow-inner" placeholder="Konfirmasi Sandi..." />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-auto">
                  <button type="button" onClick={() => { setIsEditing(false); setFormData({ username: session?.user?.name || "", email: session?.user?.email || "", password: "", confirmPassword: "" }); setAvatarUrl(session?.user?.image || ""); }} className="flex-1 py-4 bg-white border-2 border-[#d4c5b0] rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-stone-500 hover:text-stone-900 hover:border-amber-300 hover:bg-amber-50 transition-all active:scale-95 shadow-sm">
                    Batal
                  </button>
                  <button type="submit" disabled={isSaving} className="flex-[2] py-4 bg-gradient-to-r from-amber-600 to-amber-700 border border-amber-800 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] text-stone-900 shadow-md hover:from-amber-500 hover:to-amber-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <PenLine className="w-4 h-4" />}
                    {isSaving ? "Mengukir Takdir..." : "Simpan Perubahan"}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </main>
  );
}