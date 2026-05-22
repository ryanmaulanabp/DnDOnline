"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getUserCampaignsAction, createCampaignAction, joinCampaignAction } from "@/app/actions/campaign";
import { getCharactersByUserAction } from "@/app/actions/character";
import { motion, AnimatePresence } from "framer-motion";
import { Sword, User, Map, Crown, ScrollText, Users, Loader2 } from "lucide-react";

export default function CampaignsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [campaigns, setCampaigns] = useState<{ dmCampaigns: any[], playerCampaigns: any[] }>({ dmCampaigns: [], playerCampaigns: [] });
  const [characters, setCharacters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State untuk Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);

  // Form States
  const [createData, setCreateData] = useState({ name: "", description: "" });
  const [joinData, setJoinData] = useState({ inviteCode: "", characterId: "" });
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.email) {
      fetchData(session.user.email);
    }
  }, [status, session, router]);

  const fetchData = async (email: string) => {
    setLoading(true);
    try {
      const data = await getUserCampaignsAction(email);
      setCampaigns(data);
      const chars = await getCharactersByUserAction(email);
      setCharacters(chars);
    } catch (error) {
      console.error("Failed to fetch campaigns", error);
    }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.email) return;
    setActionLoading(true);
    setErrorMsg("");
    const res = await createCampaignAction(session.user.email, createData.name, createData.description);
    if (res.success) {
      setIsCreateOpen(false);
      fetchData(session.user.email);
      setCreateData({ name: "", description: "" });
    } else {
      setErrorMsg(res.error || "Gagal membuat campaign");
    }
    setActionLoading(false);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.email) return;
    setActionLoading(true);
    setErrorMsg("");
    const res = await joinCampaignAction(joinData.inviteCode, joinData.characterId);
    if (res.success) {
      setIsJoinOpen(false);
      fetchData(session.user.email);
      setJoinData({ inviteCode: "", characterId: "" });
    } else {
      setErrorMsg(res.error || "Gagal bergabung ke campaign");
    }
    setActionLoading(false);
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-[#fdfaf6] flex flex-col items-center justify-center text-amber-700 relative overflow-hidden">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} className="w-20 h-20 border-4 border-amber-200 border-t-amber-600 rounded-full mb-6 relative z-10" />
        <span className="text-xs font-black uppercase tracking-[0.4em] animate-pulse relative z-10 text-amber-800">Menjelajahi The Weave...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfaf6] text-stone-700 p-4 md:p-8 relative overflow-hidden">
      {/* Background Parchment */}
      <div className="absolute inset-0 opacity-[0.4] mix-blend-multiply pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />
      
      <div className="max-w-6xl mx-auto space-y-12 relative z-10 animate-fadeIn">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/90 p-8 rounded-3xl border border-[#d4c5b0] shadow-sm backdrop-blur-sm">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-stone-900 uppercase tracking-tighter italic">
              Adventures & <span className="text-amber-700">Campaigns</span>
            </h1>
            <p className="text-[11px] font-bold text-stone-500 uppercase tracking-widest mt-2 flex items-center gap-2">
             <span className="flex items-center gap-2"><ScrollText className="w-3.5 h-3.5" /> Kelola petualangan Anda sebagai Dungeon Master atau Player</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <button onClick={() => setIsJoinOpen(true)} className="flex-1 md:flex-none bg-[#fdfaf6] border border-emerald-500/50 hover:bg-emerald-50 text-emerald-700 font-black px-6 py-4 rounded-xl uppercase text-[10px] tracking-widest transition-all duration-300 hover:shadow-md">
              + Join Party
            </button>
            <button onClick={() => setIsCreateOpen(true)} className="flex-1 md:flex-none bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 border border-amber-800 text-stone-900 font-black px-6 py-4 rounded-xl uppercase text-[10px] tracking-widest transition-all duration-300 shadow-md hover:shadow-lg">
              + Buat Campaign (DM)
            </button>
          </div>
        </div>

        {/* Player Campaigns */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 border-b border-[#d4c5b0] pb-4">
             <Sword className="w-7 h-7 text-amber-700" />
            <h2 className="text-2xl font-black text-stone-900 uppercase tracking-tight">Perjalanan Sebagai Pahlawan</h2>
          </div>
          
          {(!campaigns.playerCampaigns || campaigns.playerCampaigns.length === 0) ? (
            <div className="bg-white/50 p-12 rounded-3xl border border-[#d4c5b0] border-dashed text-center flex flex-col items-center justify-center">
              <Map className="w-14 h-14 opacity-30 mb-4 text-stone-400" />
              <p className="text-xs font-black text-stone-500 uppercase tracking-widest">Anda belum bergabung dalam petualangan apa pun.</p>
              <button onClick={() => setIsJoinOpen(true)} className="mt-6 text-[10px] font-black text-emerald-700 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors uppercase tracking-widest shadow-sm">Cari Kode Tavern</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.playerCampaigns?.map((camp: any) => (
                <Link href={`/campaigns/${camp._id}`} key={camp._id} className="block group">
                  <motion.div whileHover={{ y: -5 }} className="h-full bg-white p-6 rounded-3xl border border-[#d4c5b0] hover:border-amber-400 shadow-sm group-hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 blur-[40px] group-hover:bg-amber-200 transition-colors opacity-50" />
                    
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-2xl font-black text-stone-900 uppercase tracking-tighter truncate pr-2">{camp.name}</h3>
                         <Sword className="w-6 h-6 opacity-80 group-hover:scale-110 transition-transform duration-300 text-amber-600" />
                      </div>
                      <p className="text-[9px] text-stone-600 font-black uppercase tracking-[0.2em] mb-3 bg-[#fdfaf6] w-max px-3 py-1 rounded-md border border-[#d4c5b0]">DM: {camp.dmEmail ? camp.dmEmail.split('@')[0] : "Dungeon Master"}</p>
                      <p className="text-[11px] text-stone-500 line-clamp-2 mb-6 font-medium leading-relaxed flex-1">{camp.description}</p>
                      
                      <div className="pt-4 border-t border-[#d4c5b0] flex items-center justify-between">
                        <div className="flex -space-x-3">
                          {camp.characters && camp.characters.slice(0, 4).map((char: any, i: number) => (
                             <div key={i} className="w-10 h-10 rounded-full bg-white border-2 border-[#d4c5b0] overflow-hidden shadow-sm z-10 hover:z-20 relative transition-transform hover:scale-110" title={char.name}>
                               {char.avatarUrl ? (
                                 <img src={char.avatarUrl} alt={char.name} className="w-full h-full object-cover" />
                               ) : (
                                  <User className="w-4 h-4 text-stone-400 m-auto mt-2" />
                               )}
                             </div>
                          ))}
                          {camp.characters && camp.characters.length > 4 && (
                            <div className="w-10 h-10 rounded-full bg-[#fdfaf6] border-2 border-[#d4c5b0] flex items-center justify-center text-[10px] font-black text-stone-500 z-0">
                              +{camp.characters.length - 4}
                            </div>
                          )}
                        </div>
                        <span className="text-[9px] font-black text-stone-500 uppercase tracking-widest group-hover:text-amber-700 transition-colors">Masuk Ruangan →</span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Dungeon Master Campaigns */}
        <div className="space-y-6 mt-16">
          <div className="flex items-center gap-4 border-b border-[#d4c5b0] pb-4">
             <Crown className="w-7 h-7 text-stone-800" />
            <h2 className="text-2xl font-black text-stone-900 uppercase tracking-tight">Sebagai Dungeon Master</h2>
          </div>
          
          {(!campaigns.dmCampaigns || campaigns.dmCampaigns.length === 0) ? (
            <div className="bg-white/50 p-12 rounded-3xl border border-[#d4c5b0] border-dashed text-center flex flex-col items-center justify-center">
              <ScrollText className="w-14 h-14 opacity-30 mb-4 text-stone-400" />
              <p className="text-xs font-black text-stone-500 uppercase tracking-widest">Anda belum memimpin dunia apa pun.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.dmCampaigns?.map((camp: any) => (
                <Link href={`/campaigns/${camp._id}`} key={camp._id} className="block group">
                  <motion.div whileHover={{ y: -5 }} className="h-full bg-white p-6 rounded-3xl border border-[#d4c5b0] hover:border-amber-400 shadow-sm group-hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                     <div className="absolute top-0 right-0 bg-emerald-50 border-b border-l border-emerald-200 px-4 py-1.5 rounded-bl-2xl text-[9px] font-black text-emerald-800 uppercase tracking-[0.2em] shadow-sm z-20 flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live
                     </div>
                    
                    <div className="relative z-10 flex flex-col h-full pt-4">
                      <h3 className="text-2xl font-black text-stone-900 uppercase tracking-tighter truncate pr-2 mb-2 group-hover:text-amber-700 transition-colors">{camp.name}</h3>
                      <div className="flex items-center gap-2 mb-4 bg-[#fdfaf6] w-max px-3 py-1.5 rounded-lg border border-[#d4c5b0]">
                        <span className="text-[8px] font-black text-stone-500 uppercase tracking-widest">Kode Invite:</span>
                        <span className="text-xs font-black text-stone-900 tracking-[0.3em] font-mono select-all">{camp.inviteCode}</span>
                      </div>
                      <p className="text-[11px] text-stone-600 line-clamp-2 mb-6 font-medium leading-relaxed flex-1">{camp.description || "Sebuah petualangan tanpa deskripsi menanti..."}</p>
                      
                      <div className="pt-4 border-t border-[#d4c5b0] flex items-center justify-between">
                        <span className="text-[10px] font-black bg-stone-100 px-3 py-1.5 rounded-lg border border-[#d4c5b0] text-stone-700 uppercase tracking-widest flex items-center gap-2">
                         <Users className="w-4 h-4 text-stone-500" /> {camp.characters?.length || 0} Pemain
                        </span>
                        <span className="text-[9px] font-black text-stone-500 uppercase tracking-widest group-hover:text-amber-700 transition-colors">Kelola Dunia →</span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- MODALS --- */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-white border border-[#d4c5b0] p-8 rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-amber-700" />
              <button onClick={() => setIsCreateOpen(false)} className="absolute top-6 right-6 text-stone-400 hover:text-stone-900 font-black text-xl transition-colors">✕</button>
              
              <h2 className="text-2xl font-black text-stone-900 uppercase mb-2 tracking-tight">Tempa Dunia Baru</h2>
              <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest mb-6">Siapkan stage untuk para pahlawan</p>
              
              {errorMsg && <div className="bg-red-50 border border-red-200 text-red-600 text-[10px] font-black uppercase tracking-widest p-3 rounded-xl mb-4 shadow-sm">{errorMsg}</div>}
              
              <form onSubmit={handleCreate} className="space-y-5">
                <div>
                  <label className="block text-[9px] font-black text-stone-600 uppercase tracking-[0.2em] mb-2 pl-1">Nama Campaign</label>
                  <input required value={createData.name} onChange={e => setCreateData({...createData, name: e.target.value})} className="w-full bg-[#fdfaf6] border border-[#d4c5b0] focus:border-amber-500 rounded-xl px-4 py-3.5 text-stone-900 text-sm font-bold outline-none transition-all shadow-inner placeholder:text-stone-400" placeholder="E.g. The Curse of Strahd" />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-stone-600 uppercase tracking-[0.2em] mb-2 pl-1">Deskripsi (Opsional)</label>
                  <textarea value={createData.description} onChange={e => setCreateData({...createData, description: e.target.value})} rows={3} className="w-full bg-[#fdfaf6] border border-[#d4c5b0] focus:border-amber-500 rounded-xl px-4 py-3.5 text-stone-900 text-sm font-bold outline-none transition-all resize-none shadow-inner placeholder:text-stone-400" placeholder="Kisah singkat tentang ancaman yang menanti..." />
                </div>
                <button disabled={actionLoading} type="submit" className="w-full bg-gradient-to-b from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-900 font-black px-6 py-4 rounded-xl uppercase text-[10px] tracking-widest transition-all mt-2 disabled:opacity-50 shadow-md">
                  {actionLoading ? "Menciptakan..." : "Bangun Dunia"}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {isJoinOpen && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-white border border-[#d4c5b0] p-8 rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
              <button onClick={() => setIsJoinOpen(false)} className="absolute top-6 right-6 text-stone-400 hover:text-stone-900 font-black text-xl transition-colors">✕</button>
              
              <h2 className="text-2xl font-black text-stone-900 uppercase mb-2 tracking-tight">Memasuki Tavern</h2>
              <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest mb-6">Gabung dengan party yang ada</p>
              
              {errorMsg && <div className="bg-red-50 border border-red-200 text-red-600 text-[10px] font-black uppercase tracking-widest p-3 rounded-xl mb-4 shadow-sm">{errorMsg}</div>}
              
              <form onSubmit={handleJoin} className="space-y-5">
                <div>
                  <label className="block text-[9px] font-black text-stone-600 uppercase tracking-[0.2em] mb-2 pl-1">Kode Invite DM</label>
                  <input required value={joinData.inviteCode} onChange={e => setJoinData({...joinData, inviteCode: e.target.value.toUpperCase()})} className="w-full bg-[#fdfaf6] border border-[#d4c5b0] focus:border-emerald-500 rounded-xl px-4 py-4 text-stone-900 text-3xl text-center tracking-[0.4em] font-black outline-none transition-all uppercase shadow-inner placeholder:text-stone-300" placeholder="A1B2C3" maxLength={6} />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-stone-600 uppercase tracking-[0.2em] mb-2 pl-1">Pilih Pahlawan Anda</label>
                  {characters.length === 0 ? (
                    <div className="text-[10px] text-red-700 font-bold bg-red-50 p-4 rounded-xl border border-red-200 text-center uppercase tracking-widest shadow-inner">
                      Anda belum menempa karakter.<br/><Link href="/characters/new" className="underline mt-1 block hover:text-red-900">Buat Pahlawan Baru</Link>
                    </div>
                  ) : (
                    <select required value={joinData.characterId} onChange={e => setJoinData({...joinData, characterId: e.target.value})} className="w-full bg-[#fdfaf6] border border-[#d4c5b0] focus:border-emerald-500 rounded-xl px-4 py-3.5 text-stone-900 text-sm font-bold outline-none transition-all appearance-none cursor-pointer shadow-inner">
                      <option value="" disabled>-- Pilih Siapa Yang Akan Bertarung --</option>
                      {characters.map(char => (
                        <option key={char._id} value={char._id}>{char.name} • LVL {char.level} {char.class}</option>
                      ))}
                    </select>
                  )}
                </div>
                <button disabled={actionLoading || characters.length === 0} type="submit" className="w-full bg-gradient-to-b from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-stone-900 font-black px-6 py-4 rounded-xl uppercase text-[10px] tracking-widest transition-all mt-2 disabled:opacity-50 shadow-md">
                  {actionLoading ? "Mengetuk Pintu..." : "Masuk Petualangan"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}