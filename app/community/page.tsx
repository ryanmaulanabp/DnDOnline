"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, MessageSquare, Flame, Clock } from "lucide-react";
import { getCommunityPostsAction, createCommunityPostAction } from "@/app/actions/community";
import { useSession } from "next-auth/react";

// --- DUMMY DATA COMMUNITY BOARDS ---
const BOUNTIES = [
  { id: "d1", type: "LFG", title: "Looking For Group: Curse of Strahd", author: "Elara Moonwhisper", role: "DM", slots: "2/5 Terisi", desc: "Mencari 3 pemain pemberani untuk menjelajahi Barovia. Sesi setiap Sabtu malam. Pemula sangat diterima!", tags: ["Roleplay Heavy", "Horror", "Level 1-10"], time: "2 jam yang lalu", color: "purple" },
  { id: "d2", type: "QUEST", title: "Bounty: Menangkap Goblin King", author: "Tavern Master", role: "NPC", slots: "Reward: 500 GP", desc: "Goblin King telah mencuri persediaan ale kami! Butuh party yang tangguh untuk membersihkan sarang mereka di utara kota.", tags: ["Combat Focus", "One-Shot", "Level 3"], time: "5 jam yang lalu", color: "amber" },
  { id: "d3", type: "LFP", title: "Pemain mencari Party (Cleric/Support)", author: "Throm Ironfist", role: "Player", slots: "Mencari DM", desc: "Saya seorang pemain berpengalaman yang suka main Cleric Life Domain. Mencari party yang kekurangan healer untuk long-term campaign.", tags: ["Support", "Experienced", "Flexible Time"], time: "1 hari yang lalu", color: "blue" },
  { id: "d4", type: "DISCUSSION", title: "Bagaimana cara roleplay Warlock yang baik?", author: "ShadowBlight99", role: "Player", slots: "12 Balasan", desc: "Patron saya adalah Archfey, tapi saya bingung cara memasukkan elemen patron ke dalam interaksi sehari-hari party tanpa terlihat aneh.", tags: ["Tips", "Roleplay", "Warlock"], time: "2 hari yang lalu", color: "emerald" },
];

export default function CommunityTavernPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("all");
  const [posts, setPosts] = useState<any[]>(BOUNTIES); // Hybrid: default is dummy
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ type: "LFG", title: "", desc: "", slots: "", tags: "" });

  useEffect(() => {
    async function loadData() {
      const realPosts = await getCommunityPostsAction();
      // Hybrid Merge: Real posts first, then Dummies
      const formattedReal = realPosts.map((p: any) => ({
        id: p._id,
        type: p.type,
        title: p.title,
        author: p.author,
        role: p.role,
        slots: p.slots,
        desc: p.desc,
        tags: p.tags,
        time: new Date(p.createdAt).toLocaleDateString(),
        color: p.color
      }));
      setPosts([...formattedReal, ...BOUNTIES]);
      setLoading(false);
    }
    loadData();
  }, []);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.email) return alert("Anda harus login untuk memposting.");
    
    const colorMap: any = { "LFG": "purple", "QUEST": "amber", "LFP": "blue", "DISCUSSION": "emerald" };
    
    const newPostData = {
      type: formData.type,
      title: formData.title,
      author: session.user.name || session.user.email.split('@')[0],
      role: "Player",
      slots: formData.slots,
      desc: formData.desc,
      tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
      color: colorMap[formData.type] || "amber"
    };

    const res = await createCommunityPostAction(newPostData);
    if (res.success) {
      setPosts([{
        id: res.post._id,
        ...newPostData,
        time: new Date().toLocaleDateString()
      }, ...posts]);
      setIsModalOpen(false);
      setFormData({ type: "LFG", title: "", desc: "", slots: "", tags: "" });
    } else {
      alert("Gagal membuat postingan: " + res.error);
    }
  };

  const filteredPosts = posts.filter(p => {
    if (activeTab === "all") return true;
    if (activeTab === "lfg") return p.type === "LFG" || p.type === "LFP";
    if (activeTab === "quest") return p.type === "QUEST";
    if (activeTab === "discuss") return p.type === "DISCUSSION";
    return true;
  });

  return (
    <div className="min-h-screen bg-[#fdfaf6] text-stone-800 font-sans selection:bg-amber-500/30 selection:text-amber-900">
      
      {/* Background Parchment Noise */}
      <div className="fixed inset-0 opacity-[0.4] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />

      {/* Simplified Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#fdfaf6]/90 backdrop-blur-md border-b border-[#d4c5b0] shadow-sm py-4">
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
           <Link href="/" className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors group">
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-black uppercase tracking-widest">Keluar Tavern</span>
           </Link>
           <span className="text-lg font-black text-amber-700 uppercase tracking-[0.2em] flex items-center gap-2 drop-shadow-sm">
             <MessageSquare size={20} /> The Yawning Portal
           </span>
        </div>
      </nav>

      {/* Main Layout */}
      <main className="relative z-10 pt-32 pb-20 px-6 max-w-[1200px] mx-auto min-h-screen">
        
        {/* Header - Fireplace vibe */}
        <div className="text-center mb-16 relative">
          <Flame size={48} className="mx-auto text-amber-600 mb-6 drop-shadow-sm" />
          <h1 className="text-5xl md:text-7xl font-black text-stone-900 uppercase tracking-tighter mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            Papan <span className="text-amber-700">Pengumuman</span>
          </h1>
          <p className="text-stone-600 text-lg font-medium max-w-2xl mx-auto">Tarik kursi, pesan segelas Ale, dan temukan petualangan atau kawan baru di papan pengumuman tavern kami.</p>
          
          <button onClick={() => setIsModalOpen(true)} className="mt-8 bg-amber-700 hover:bg-amber-600 text-stone-900 font-black px-8 py-4 rounded-xl uppercase tracking-widest shadow-md transition-all">
            + Tempel Pengumuman Baru
          </button>
        </div>

        {/* Board Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
           {[
             { id: "all", label: "Semua Kertas" },
             { id: "lfg", label: "Cari Party" },
             { id: "quest", label: "Bounty/Quest" },
             { id: "discuss", label: "Diskusi & Rumor" }
           ].map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-all ${
                 activeTab === tab.id
                   ? "bg-amber-600 border-amber-700 text-stone-900 shadow-md"
                   : "bg-white border-[#d4c5b0] text-stone-600 hover:border-amber-400 hover:text-amber-700 shadow-sm"
               }`}
             >
               {tab.label}
             </button>
           ))}
        </div>

        {/* The Notice Board (Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative p-8">
           {/* Corkboard background effect */}
           <div className="absolute inset-0 bg-[#dcb17a]/20 rounded-[3rem] border border-[#d4c5b0] shadow-inner -z-10"></div>

           {loading && <div className="col-span-1 md:col-span-2 text-center text-amber-700 font-black animate-pulse uppercase">Memuat Gulungan Kertas...</div>}

           {filteredPosts.map((bounty) => (
             <div key={bounty.id} className="relative group hover:-translate-y-2 transition-transform duration-300">
               
               {/* Pin */}
               <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-700 shadow-sm z-20 border border-red-900">
                 <div className="absolute inset-[2px] rounded-full bg-gradient-to-br from-red-500 to-red-800"></div>
               </div>

               {/* Paper Card */}
               <div className="bg-white text-stone-800 p-8 pt-10 rounded-sm shadow-md border border-[#d4c5b0] min-h-[320px] flex flex-col relative overflow-hidden">
                 
                 {/* Paper edge effect */}
                 <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-[#fdfaf6] to-transparent pointer-events-none"></div>

                 <div className="flex items-center justify-between mb-4">
                   <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-sm border ${
                     bounty.color === 'purple' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                     bounty.color === 'amber' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                     bounty.color === 'blue' ? 'bg-amber-100 text-amber-900 border-amber-300' :
                     'bg-emerald-50 text-emerald-700 border-emerald-200'
                   }`}>
                     {bounty.type}
                   </span>
                   <div className="flex items-center gap-1 text-[10px] font-bold text-stone-400">
                     <Clock size={12} /> {bounty.time}
                   </div>
                 </div>

                 <h3 className="text-2xl font-black uppercase tracking-tight mb-4 text-stone-900 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
                   {bounty.title}
                 </h3>

                 <p className="text-sm font-medium text-stone-600 mb-6 flex-1 italic leading-relaxed whitespace-pre-wrap">
                   "{bounty.desc}"
                 </p>

                 <div className="flex flex-wrap gap-2 mb-6">
                   {bounty.tags.map((tag: string, i: number) => (
                     <span key={i} className="text-[10px] font-bold uppercase tracking-widest text-stone-500 border border-[#d4c5b0] px-2 py-0.5 rounded-sm">
                       {tag}
                     </span>
                   ))}
                 </div>

                 <div className="border-t border-[#d4c5b0] pt-4 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-[#fdfaf6] flex items-center justify-center text-[10px] font-black text-stone-500 border border-[#d4c5b0]">
                       {bounty.author.charAt(0)}
                     </div>
                     <div>
                       <div className="text-[11px] font-black text-stone-900 uppercase">{bounty.author}</div>
                       <div className="text-[9px] font-bold text-stone-500 uppercase tracking-widest">{bounty.role}</div>
                     </div>
                   </div>
                   <div className="text-right">
                     <div className="text-[10px] font-black text-amber-700 uppercase tracking-widest bg-amber-50 px-2 py-1 rounded-sm border border-amber-200">
                       {bounty.slots}
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           ))}
        </div>
      </main>

      {/* Modal Buat Post */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/50 backdrop-blur-sm p-4">
          <div className="bg-[#fdfaf6] border border-stone-300 p-8 rounded-3xl w-full max-w-lg shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-stone-400 font-bold hover:text-stone-900">✕</button>
            <h2 className="text-2xl font-black text-stone-900 uppercase tracking-tighter mb-6">Tulis Pengumuman</h2>
            <form onSubmit={handlePostSubmit} className="space-y-4">
              <div>
                <label className="text-[9px] font-black uppercase text-stone-500">Tipe Papan</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full mt-1 bg-white border border-stone-300 p-3 rounded-lg text-sm font-bold">
                  <option value="LFG">Looking For Group</option>
                  <option value="LFP">Looking For Player</option>
                  <option value="QUEST">Tawaran Quest / Bounty</option>
                  <option value="DISCUSSION">Diskusi & Rumor</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-stone-500">Judul Pengumuman</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full mt-1 bg-white border border-stone-300 p-3 rounded-lg text-sm font-bold" placeholder="Cari Cleric Level 3..." />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-stone-500">Isi Pesan (Rumor/Detail)</label>
                <textarea required rows={4} value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} className="w-full mt-1 bg-white border border-stone-300 p-3 rounded-lg text-sm font-medium resize-none" placeholder="Tulis rincian pesanmu..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black uppercase text-stone-500">Keterangan Slot/Status</label>
                  <input value={formData.slots} onChange={e => setFormData({...formData, slots: e.target.value})} className="w-full mt-1 bg-white border border-stone-300 p-3 rounded-lg text-sm font-bold" placeholder="E.g. Butuh 2 Orang" />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-stone-500">Tags (Pisahkan dgn koma)</label>
                  <input value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="w-full mt-1 bg-white border border-stone-300 p-3 rounded-lg text-sm font-bold" placeholder="Horror, Online, 5e" />
                </div>
              </div>
              <button type="submit" className="w-full mt-4 bg-amber-700 hover:bg-amber-600 text-stone-900 font-black py-4 rounded-xl shadow-md uppercase tracking-widest transition-all">
                Paku Ke Papan
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
