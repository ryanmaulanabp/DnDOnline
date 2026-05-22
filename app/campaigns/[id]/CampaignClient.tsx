"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { sendCampaignMessageAction, getCampaignByIdAction, claimLootAction } from "@/app/actions/campaign";
import { ScrollText, Send, User, Dice5, Crown, Map, Pickaxe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { AudioSync } from "./components/AudioSync";
import { BattleGrid } from "./components/BattleGrid";
import { DMScreen } from "./components/DMScreen";
import confetti from "canvas-confetti";

export default function CampaignClient({ initialCampaign }: { initialCampaign: any }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [campaign, setCampaign] = useState(initialCampaign);
  const [chatMsg, setChatMsg] = useState("");
  const [isRolling, setIsRolling] = useState(false);
  const [screenShake, setScreenShake] = useState(""); // "crit", "fail", ""
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isDM = session?.user?.email === campaign.dmEmail;
  const userChar = campaign.characters?.find((c: any) => c.userEmail === session?.user?.email);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // Polling data every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const updated = await getCampaignByIdAction(campaign._id);
      if (updated) setCampaign(updated);
    }, 5000);
    return () => clearInterval(interval);
  }, [campaign._id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [campaign.chatMessages]);

  if (!isDM && !userChar && status === "authenticated") {
    return <div className="min-h-screen bg-[#fdfaf6] flex items-center justify-center font-black text-amber-700 uppercase tracking-widest">Akses Ditolak. Anda bukan anggota campaign ini.</div>;
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMsg.trim()) return;
    
    const sender = isDM ? "Dungeon Master" : (userChar?.name || "Player");
    await sendCampaignMessageAction(campaign._id, sender, chatMsg, false);
    setChatMsg("");
    
    // Optimistic Update
    setCampaign({
      ...campaign,
      chatMessages: [...(campaign.chatMessages || []), { senderName: sender, text: chatMsg, isRoll: false, createdAt: new Date() }]
    });
  };

  const rollDice = async (sides: number) => {
    if (isRolling) return;
    setIsRolling(true);
    
    const result = Math.floor(Math.random() * sides) + 1;
    const sender = isDM ? "Dungeon Master" : (userChar?.name || "Player");
    
    let effect = "";
    if (sides === 20 && result === 20) { 
      effect = "crit"; 
      setScreenShake("crit"); 
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#d97706', '#f59e0b', '#fbbf24', '#2563eb']
      });
    }
    if (sides === 20 && result === 1) { effect = "fail"; setScreenShake("fail"); }
    
    const text = `Memutar d${sides} dan mendapat hasil: ${result}`;
    
    await sendCampaignMessageAction(campaign._id, sender, text, true);
    
    setCampaign({
      ...campaign,
      chatMessages: [...(campaign.chatMessages || []), { senderName: sender, text, isRoll: true, createdAt: new Date() }]
    });
    
    setTimeout(() => {
      setIsRolling(false);
      setScreenShake("");
    }, 1500); // Effect duration
  };

  const handleClaimLoot = async (itemName: string) => {
    if (!userChar) return alert("Hanya player (karakter) yang bisa klaim loot!");
    const res = await claimLootAction(userChar._id, itemName);
    if (res.success) {
      alert(`Berhasil mengambil: ${itemName}! (Silakan cek di halaman Karakter Anda)`);
      // Optionally notify group
      await sendCampaignMessageAction(campaign._id, "System", `${userChar.name} telah mengambil [${itemName}]`, false);
    } else {
      alert("Gagal mengklaim loot.");
    }
  };

  return (
    <motion.div 
      animate={
        screenShake === "crit" ? { x: [-10, 10, -10, 10, 0], y: [-10, 10, -5, 5, 0] } :
        screenShake === "fail" ? { x: [-5, 5, -5, 5, 0], opacity: [1, 0.8, 1] } : {}
      }
      transition={{ duration: 0.5 }}
      className={`min-h-screen ${screenShake === 'crit' ? 'bg-amber-100' : screenShake === 'fail' ? 'bg-red-950' : 'bg-[#fdfaf6]'} text-stone-700 p-4 md:p-8 relative overflow-hidden flex flex-col transition-colors duration-500`}
    >
      <div className="absolute inset-0 opacity-[0.4] mix-blend-multiply pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />
      
      {/* 3D Dice Overlay Effect */}
      <AnimatePresence>
        {isRolling && (
          <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 2, rotate: 360 }} exit={{ scale: 0, opacity: 0 }} transition={{ type: "spring", stiffness: 100 }} className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center drop-shadow-[0_0_50px_rgba(217,119,6,0.6)]">
             <Dice5 className="w-32 h-32 text-amber-600 animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>
      
      {isDM && <DMScreen campaignId={campaign._id} characters={campaign.characters} />}

      <header className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6 bg-white/80 p-6 rounded-3xl border border-stone-300 shadow-sm backdrop-blur-sm">
        <div>
           <h1 className="text-3xl font-black text-stone-900 uppercase tracking-tighter flex items-center gap-3">
             <Map className="w-8 h-8 text-amber-700" /> {campaign.name}
           </h1>
           <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest mt-1">Kode Invite: {campaign.inviteCode}</p>
        </div>
        <div className="flex flex-col md:flex-row items-end md:items-center gap-4 w-full lg:w-auto">
           <AudioSync currentAudio={campaign.audioState} isDM={isDM} campaignId={campaign._id} />
           <div className="flex items-center gap-3 bg-[#fdfaf6] border border-stone-300 px-4 py-3 rounded-xl h-full">
             <span className="text-[9px] font-black text-stone-500 uppercase tracking-widest">Sesi:</span>
             <span className={`text-xs font-black uppercase tracking-widest ${isDM ? 'text-amber-700' : 'text-emerald-700'}`}>
               {isDM ? 'Dungeon Master' : userChar?.name}
             </span>
           </div>
        </div>
      </header>

      <div className="flex-1 relative z-10 grid grid-cols-1 xl:grid-cols-4 gap-6 min-h-0">
         
         {/* LEFT COLUMN: Party Tracker & Grid */}
         <div className="xl:col-span-1 flex flex-col gap-6">
           <div className="bg-white/80 border border-stone-300 rounded-3xl shadow-sm p-5 flex flex-col max-h-[300px] overflow-hidden">
              <h2 className="text-[10px] font-black text-stone-500 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-stone-200 pb-3">
                <User className="w-4 h-4 text-stone-400" /> Anggota Party
              </h2>
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                 {campaign.characters?.map((char: any) => {
                   const hpPercent = (char.currentHp / char.hpMax) * 100;
                   return (
                     <div key={char._id} className="bg-[#fdfaf6] border border-stone-200 p-3 rounded-2xl relative overflow-hidden">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black text-stone-900 uppercase tracking-widest">{char.name}</span>
                          <span className="text-[8px] font-black bg-stone-200 text-stone-600 px-2 py-0.5 rounded-full uppercase tracking-widest">Lv {char.level}</span>
                        </div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[8px] font-black text-stone-500 uppercase tracking-widest">Health</span>
                          <span className="text-[9px] font-bold text-stone-700">{char.currentHp} / {char.hpMax}</span>
                        </div>
                        <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                          <motion.div animate={{ width: `${hpPercent}%` }} className={`h-full ${hpPercent < 30 ? 'bg-red-500' : 'bg-emerald-500'}`} />
                        </div>
                     </div>
                   )
                 })}
                 {(!campaign.characters || campaign.characters.length === 0) && (
                   <div className="text-center p-6 text-[10px] font-black text-stone-400 uppercase tracking-widest">Belum ada pemain bergabung</div>
                 )}
              </div>
           </div>
           
           {/* BATTLE GRID */}
           <BattleGrid gridState={campaign.gridState} isDM={isDM} campaignId={campaign._id} characters={campaign.characters || []} />
         </div>

         {/* RIGHT COLUMN: Chat & Dice Log */}
         <div className="xl:col-span-3 bg-white/80 border border-stone-300 rounded-3xl shadow-sm flex flex-col overflow-hidden">
            <h2 className="text-[10px] font-black text-stone-500 uppercase tracking-widest p-5 border-b border-stone-200 flex items-center justify-between">
              <span className="flex items-center gap-2"><ScrollText className="w-4 h-4 text-stone-400" /> Meja Petualangan (Tavern Log)</span>
              {isRolling && <span className="text-amber-600 animate-pulse font-bold tracking-widest text-[9px] uppercase">Mengocok dadu...</span>}
            </h2>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#fdfaf6] custom-scrollbar">
               {campaign.chatMessages?.map((msg: any, i: number) => {
                 const isMyMsg = msg.senderName === (isDM ? "Dungeon Master" : userChar?.name);
                 const isSysMsg = msg.senderName === "System";
                 
                 if (isSysMsg) {
                   return (
                     <div key={i} className="text-center">
                       <span className="inline-block bg-stone-200 text-stone-500 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-stone-300">{msg.text}</span>
                     </div>
                   )
                 }

                 // Parse LOOT Tag
                 const lootMatch = msg.text.match(/\[LOOT:\s*(.+?)\]/);
                 let displayText = msg.text;
                 if (lootMatch) {
                   displayText = msg.text.replace(lootMatch[0], ""); // We will render a button instead
                 }

                 return (
                   <div key={i} className={`flex flex-col ${isMyMsg ? 'items-end' : 'items-start'}`}>
                      <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest mb-1 mx-1">
                        {msg.senderName} • {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                      <div className={`max-w-[80%] p-3 rounded-2xl border flex flex-col gap-2 ${msg.isRoll ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-sm' : isMyMsg ? 'bg-stone-800 text-stone-100 border-stone-900' : 'bg-white text-stone-700 border-stone-200 shadow-sm'}`}>
                        {msg.isRoll && <Dice5 className="w-4 h-4 text-amber-600 inline-block mr-2" />}
                        {displayText && <span className="text-sm font-medium">{displayText}</span>}
                        
                        {lootMatch && (
                          <div className="mt-1 bg-amber-50 border border-amber-200 p-2 rounded-xl flex items-center justify-between gap-4 w-full">
                            <span className="text-[10px] font-black text-amber-800 uppercase flex items-center gap-1"><Pickaxe className="w-3 h-3"/> {lootMatch[1]}</span>
                            <button onClick={() => handleClaimLoot(lootMatch[1])} className="bg-amber-600 hover:bg-amber-500 text-stone-900 px-3 py-1 rounded text-[8px] font-black uppercase tracking-widest transition-colors shadow-sm">Klaim</button>
                          </div>
                        )}
                      </div>
                   </div>
                 );
               })}
               <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-stone-200 bg-white">
               {/* Quick Dice Trays */}
               <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                 {[4, 6, 8, 10, 12, 20].map(d => (
                   <button key={d} onClick={() => rollDice(d)} className="shrink-0 bg-[#fdfaf6] border border-stone-300 hover:border-amber-400 hover:bg-amber-50 text-stone-600 text-[9px] font-black px-4 py-2 rounded-lg uppercase tracking-widest transition-all shadow-sm flex items-center gap-1">
                     <Dice5 className="w-3 h-3 text-amber-600/50" /> d{d}
                   </button>
                 ))}
               </div>
               
               <form onSubmit={sendMessage} className="flex gap-3">
                 <input 
                   type="text" 
                   value={chatMsg} 
                   onChange={e => setChatMsg(e.target.value)} 
                   placeholder="Berbicara (sebagai karakter), beraksi, atau deskripsikan sesuatu..." 
                   className="flex-1 bg-[#fdfaf6] border border-stone-300 focus:border-amber-500 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all shadow-inner placeholder:text-stone-400" 
                 />
                 <button type="submit" className="bg-stone-800 hover:bg-stone-700 text-stone-100 px-6 py-3 rounded-xl shadow-md transition-all flex items-center justify-center">
                   <Send className="w-5 h-5" />
                 </button>
               </form>
            </div>
         </div>
      </div>
    </motion.div>
  );
}
