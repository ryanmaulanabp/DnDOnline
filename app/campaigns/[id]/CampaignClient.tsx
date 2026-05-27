"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  sendCampaignMessageAction, 
  getCampaignByIdAction, 
  claimLootAction, 
  updateCombatStateAction, 
  updateSharedGoldAction, 
  addSharedItemAction, 
  updateGridStateAction, 
  joinCampaignAction, 
  processSoloStoryAction 
} from "@/app/actions/campaign";
import { getCharactersByUserAction, updateCharacterHpAction } from "@/app/actions/character";
import { 
  ScrollText, 
  Send, 
  User, 
  Dice5, 
  Crown, 
  Map, 
  Pickaxe, 
  Flame, 
  RefreshCw, 
  Sword, 
  Shield, 
  ChevronDown, 
  Sparkles,
  Award,
  BookOpen,
  Dice1,
  Coins
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import { AudioSync } from "./components/AudioSync";
import { BattleGrid } from "./components/BattleGrid";
import { DMScreen } from "./components/DMScreen";
import { CombatTracker } from "./components/CombatTracker";
import { SharedLoot } from "./components/SharedLoot";
import { PlayerHUD } from "./components/PlayerHUD";
import confetti from "canvas-confetti";

export default function CampaignClient({ initialCampaign }: { initialCampaign: any }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [campaign, setCampaign] = useState(initialCampaign);
  const [chatMsg, setChatMsg] = useState("");
  const [isRolling, setIsRolling] = useState(false);
  const [screenShake, setScreenShake] = useState(""); // "crit", "fail", ""
  const [activeTab, setActiveTab] = useState("grid"); // "grid", "combat", "loot"
  const [showMyTurn, setShowMyTurn] = useState(false);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [myCharacters, setMyCharacters] = useState<any[]>([]);
  const [loadingChars, setLoadingChars] = useState(false);
  const [joiningCharId, setJoiningCharId] = useState<string>("");
  const [isJoining, setIsJoining] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [spellTrigger, setSpellTrigger] = useState<{ type: string } | null>(null);

  // Smart Scroll states
  const [showScrollBottomBadge, setShowScrollBottomBadge] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const isDM = session?.user?.email === campaign.dmEmail;
  const userChar = campaign.characters?.find((c: any) => c.userEmail === session?.user?.email);
  const isSoloCampaign = campaign.dmEmail === "ai-dm@dnd-online.com";

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // Polling data data kampanye setiap 5 detik
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!aiThinking) {
        const updated = await getCampaignByIdAction(campaign._id);
        if (updated) setCampaign(updated);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [campaign._id, aiThinking]);

  // Pantau scroll user untuk mendeteksi scroll up / scroll down
  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (!container) return;

    // Anggap di dasar jika jarak ke bawah <= 180px
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight <= 180;
    
    if (isAtBottom) {
      setShowScrollBottomBadge(false);
      setUnreadCount(0);
    } else {
      setShowScrollBottomBadge(true);
    }
  };

  // Smart Scroll Trigger: Hanya melompat ke bawah jika user sudah berada di bawah, atau user baru saja melakukan aksi
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight <= 180;
    
    const messages = campaign.chatMessages || [];
    if (messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];
    
    // Cek jika pesan berasal dari tindakan user sendiri
    const isMyMsg = lastMessage?.senderName === (isDM ? "Dungeon Master" : userChar?.name);
    const isThinkingMsg = lastMessage?.senderName === "System" && lastMessage?.text?.includes("sedang merajut takdir");

    if (isAtBottom || isMyMsg || isThinkingMsg) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setUnreadCount(0);
      setShowScrollBottomBadge(false);
    } else {
      // Jika user sedang membaca ke atas, tampilkan badge unread dan cegah auto-scroll yang mengganggu
      setUnreadCount(prev => prev + 1);
      setShowScrollBottomBadge(true);
    }
  }, [campaign.chatMessages, isDM, userChar?.name]);

  useEffect(() => {
    if (!campaign.combatState || !campaign.combatState.isActive || !userChar) return;
    const currentParticipant = campaign.combatState.participants[campaign.combatState.turnIndex];
    if (currentParticipant && currentParticipant.name === userChar.name) {
      setShowMyTurn(true);
      setTimeout(() => setShowMyTurn(false), 3000);
    }
  }, [campaign.combatState?.turnIndex, campaign.combatState?.round]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email && !userChar && !isDM) {
      setLoadingChars(true);
      getCharactersByUserAction(session.user.email).then(chars => {
        setMyCharacters(chars || []);
        setLoadingChars(false);
      });
    }
  }, [status, session, userChar, isDM]);

  // Web Audio API Synthesized sound effects
  const playSound = (type: 'dice' | 'hit' | 'miss' | 'crit' | 'heal') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (type === 'dice') {
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(100 + Math.random() * 200, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.1);
          }, i * 80);
        }
      } else if (type === 'hit') {
        const bufferSize = audioCtx.sampleRate * 0.15;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        noise.start();
      } else if (type === 'miss') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
      } else if (type === 'crit') {
        const notes = [261.63, 329.63, 392.00, 523.25];
        notes.forEach((freq, idx) => {
          setTimeout(() => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.3);
          }, idx * 100);
        });
      } else if (type === 'heal') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(250, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(850, audioCtx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      }
    } catch (e) {}
  };

  // Visual Spell particles canvas overlay loop
  useEffect(() => {
    if (!spellTrigger || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
    canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;

    let particles: Array<{ x: number; y: number; vx: number; vy: number; radius: number; color: string; alpha: number }> = [];
    const colorMap: Record<string, string[]> = {
      fireball: ['#ef4444', '#f97316', '#facc15', '#ffffff'],
      magicmissile: ['#a855f7', '#c084fc', '#e9d5ff', '#ffffff'],
      curewounds: ['#10b981', '#34d399', '#a7f3d0', '#ffffff']
    };

    const colors = colorMap[spellTrigger.type] || ['#fbbf24', '#f59e0b'];
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    if (spellTrigger.type === 'fireball') {
      for (let i = 0; i < 90; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 3;
        particles.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 9 + 3,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1
        });
      }
    } else if (spellTrigger.type === 'magicmissile') {
      for (let i = 0; i < 45; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 3;
        particles.push({
          x: centerX + (Math.random() * 80 - 40),
          y: centerY + (Math.random() * 80 - 40),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 4 + 1.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1
        });
      }
    } else if (spellTrigger.type === 'curewounds') {
      for (let i = 0; i < 60; i++) {
        particles.push({
          x: centerX + (Math.random() * 140 - 70),
          y: centerY + 80,
          vx: Math.random() * 2 - 1,
          vy: -(Math.random() * 3 + 1.5),
          radius: Math.random() * 5 + 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1
        });
      }
    }

    let animationFrameId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let active = false;

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (spellTrigger.type === 'curewounds') {
          p.alpha -= 0.02;
        } else {
          p.alpha -= 0.025;
          p.radius *= 0.95;
        }
        if (p.alpha > 0) {
          active = true;
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color;
          ctx.fill();
          ctx.restore();
        }
      });

      if (active) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        setSpellTrigger(null);
      }
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [spellTrigger]);

  const handleJoinCampaign = async (charId: string) => {
    if (!charId) return;
    setIsJoining(true);
    const res = await joinCampaignAction(campaign.inviteCode, charId);
    if (res.success) {
      const updated = await getCampaignByIdAction(campaign._id);
      if (updated) setCampaign(updated);
    } else {
      alert(res.error || "Gagal bergabung ke kampanye.");
    }
    setIsJoining(false);
  };

  // --- AI DM TURN AUTOMATION TRIGGER ---
  useEffect(() => {
    if (!isSoloCampaign || !campaign.combatState || !campaign.combatState.isActive) return;
    
    const { participants, turnIndex } = campaign.combatState;
    const currentParticipant = participants[turnIndex];
    if (!currentParticipant) return;

    if (currentParticipant.isMonster && currentParticipant.hp > 0) {
      triggerMonsterTurn(currentParticipant);
    }
  }, [campaign.combatState?.turnIndex, campaign.combatState?.round, campaign.combatState?.isActive]);

  const triggerMonsterTurn = async (monster: any) => {
    if (aiThinking) return;
    setAiThinking(true);

    await sendCampaignMessageAction(campaign._id, "System", `👹 AI Dungeon Master sedang meracik strategi ${monster.name}...`, false);

    setTimeout(async () => {
      const latest = await getCampaignByIdAction(campaign._id);
      const activeCombatState = latest?.combatState || campaign.combatState;

      const playerIdx = activeCombatState.participants.findIndex((p: any) => !p.isMonster);
      if (playerIdx === -1) {
        setAiThinking(false);
        return;
      }
      
      const playerParticipant = activeCombatState.participants[playerIdx];
      const playerCharId = userChar?._id;
      if (!playerCharId) {
        setAiThinking(false);
        return;
      }

      const attackRoll = Math.floor(Math.random() * 20) + 1;
      const attackMod = monster.name.includes("Shaman") ? 4 : 3;
      const attackTotal = attackRoll + attackMod;
      const isHit = attackTotal >= playerParticipant.ac;

      let damage = 0;
      let text = "";
      let newHp = playerParticipant.hp;

      if (isHit) {
        const dmgRoll = Math.floor(Math.random() * 6) + 1;
        const dmgMod = monster.name.includes("Shaman") ? 3 : 2;
        damage = dmgRoll + dmgMod;
        newHp = Math.max(0, playerParticipant.hp - damage);

        playSound("hit");
        setScreenShake("fail");

        const hitQuotes = monster.name.includes("Shaman")
          ? [
              `mengarahkan tongkat tulang miliknya, menembakkan berkas sihir asam hijau berbau busuk!`,
              `mengucapkan mantra kuno, meremukkan zirah Anda dengan sambaran petir kecil!`
            ]
          : [
              `menebaskan belati bergerigi berkaratnya ke celah pelindung dada Anda!`,
              `meloncat dari reruntuhan batu, menyayat pergelangan kaki Anda dengan belati tajam!`
            ];
        
        const quote = hitQuotes[Math.floor(Math.random() * hitQuotes.length)];
        text = `[COMBAT_LOG] 👹 ${monster.name} ${quote}\nRoll Serangan: ${attackRoll} + ${attackMod} = ${attackTotal} vs AC ${playerParticipant.ac}. HIT!\nMenyebabkan ${damage} damage asam/tusuk!`;
      } else {
        playSound("miss");
        setScreenShake("");

        const missQuotes = monster.name.includes("Shaman")
          ? [
              `menembakkan berkas sihir asam, tetapi meleset jauh dan melelehkan batu dinding di belakang Anda.`,
              `merapal mantra petir, tetapi kubah pelindung magis Anda mementalkannya secara instan.`
            ]
          : [
              `mencoba menebas leher Anda, tetapi Anda menangkisnya dengan tangkas menggunakan pedang!`,
              `menyerang secara agresif, tetapi kehilangan keseimbangan dan meleset mengenai pelindung kaki Anda.`
            ];

        const quote = missQuotes[Math.floor(Math.random() * missQuotes.length)];
        text = `[COMBAT_LOG] 👹 ${monster.name} ${quote}\nRoll Serangan: ${attackRoll} + ${attackMod} = ${attackTotal} vs AC ${playerParticipant.ac}. MISS!`;
      }

      let newCombatState = { ...activeCombatState };
      newCombatState.participants = [...newCombatState.participants];
      
      const monsterIdx = newCombatState.participants.findIndex((p: any) => p.id === monster.id);
      if (monsterIdx !== -1) {
        newCombatState.participants[monsterIdx] = { ...newCombatState.participants[monsterIdx], action: 0 };
      }

      newCombatState.participants[playerIdx] = { ...newCombatState.participants[playerIdx], hp: newHp };

      let nextTurnIdx = newCombatState.turnIndex + 1;
      let nextRound = newCombatState.round;
      if (nextTurnIdx >= newCombatState.participants.length) {
        nextTurnIdx = 0;
        nextRound++;
      }

      newCombatState.turnIndex = nextTurnIdx;
      newCombatState.round = nextRound;

      newCombatState.participants = newCombatState.participants.map((p: any, idx: number) => {
        if (idx === nextTurnIdx) {
          return { ...p, action: 1, bonusAction: 1, reaction: 1, speed: 30 };
        }
        return p;
      });

      await sendCampaignMessageAction(campaign._id, "Dungeon Master", text, true);
      await updateCombatStateAction(campaign._id, newCombatState);
      await updateCharacterHpAction(playerCharId, newHp);

      const updated = await getCampaignByIdAction(campaign._id);
      if (updated) setCampaign(updated);

      setAiThinking(false);
    }, 2000);
  };

  const handleCastSpell = async (spellName: string, damageOrHealStr: string, isHeal: boolean) => {
    if (!userChar || !campaign.combatState) return;

    const combatParticipant = campaign.combatState.participants.find((p: any) => p.name === userChar.name);
    if (!combatParticipant) return;

    const action = combatParticipant.action;
    
    if (action < 1) {
      alert("Anda tidak memiliki Action untuk mengeluarkan mantra!");
      return;
    }

    let target = null;
    if (!isHeal) {
      if (!selectedTargetId) {
        alert("Pilih target musuh di Battle Grid terlebih dahulu!");
        return;
      }
      target = campaign.combatState.participants.find((p: any) => p.id === selectedTargetId);
      if (!target || target.hp <= 0) return;
    }

    setIsRolling(true);
    
    const spellType = 
      spellName.toLowerCase().includes("fireball") ? "fireball" :
      spellName.toLowerCase().includes("cure") ? "curewounds" : "magicmissile";
    
    setSpellTrigger({ type: spellType });
    playSound(isHeal ? "heal" : "crit");

    const match = damageOrHealStr.match(/(\d+)d(\d+)/);
    let rollTotal = 0;
    if (match) {
      const count = parseInt(match[1]);
      const sides = parseInt(match[2]);
      for (let i = 0; i < count; i++) rollTotal += Math.floor(Math.random() * sides) + 1;
    } else {
      rollTotal = parseInt(damageOrHealStr) || 4;
    }

    rollTotal += 4; 

    let text = "";
    let newCombatState = { ...campaign.combatState };
    newCombatState.participants = [...newCombatState.participants];
    
    const attackerIdx = newCombatState.participants.findIndex((p: any) => p.name === userChar.name);

    if (isHeal) {
      const targetIdx = newCombatState.participants.findIndex((p: any) => p.name === userChar.name);
      const oldHp = newCombatState.participants[targetIdx].hp;
      const maxHp = newCombatState.participants[targetIdx].maxHp;
      const healedHp = Math.min(maxHp, oldHp + rollTotal);
      
      newCombatState.participants[targetIdx] = {
        ...newCombatState.participants[targetIdx],
        hp: healedHp
      };

      text = `[COMBAT_LOG] ✨ Merapal mantra ${spellName}!\nAura menyembuhkan berwarna hijau menyelimuti tubuh Anda.\nMemulihkan ${rollTotal} HP! (HP Anda sekarang: ${healedHp}/${maxHp})`;
      
      await updateCharacterHpAction(userChar._id, healedHp);
    } else {
      const targetIdx = newCombatState.participants.findIndex((p: any) => p.id === selectedTargetId);
      const targetParticipant = newCombatState.participants[targetIdx];
      
      let dmgResult = rollTotal;
      let hitDetails = "";

      if (spellName.toLowerCase().includes("fireball")) {
        const saveRoll = Math.floor(Math.random() * 20) + 1;
        const saveTotal = saveRoll + 2; 
        const isSaved = saveTotal >= 14;

        if (isSaved) {
          dmgResult = Math.floor(dmgResult / 2);
          hitDetails = `\n👹 Goblin berhasil melakukan Dex Save (Roll: ${saveRoll} + 2 = ${saveTotal} vs DC 14). Hanya menerima SETENGAH damage!`;
        } else {
          hitDetails = `\n👹 Goblin gagal melakukan Dex Save (Roll: ${saveRoll} + 2 = ${saveTotal} vs DC 14). MENERIMA FULL DAMAGE!`;
        }
      } else {
        hitDetails = `\n🔮 Sihir Magic Missile memburu target secara otomatis tanpa meleset!`;
      }

      const targetNewHp = Math.max(0, targetParticipant.hp - dmgResult);
      newCombatState.participants[targetIdx] = {
        ...targetParticipant,
        hp: targetNewHp
      };

      text = `[COMBAT_LOG] ☄️ Merapal mantra ${spellName} ke arah ${targetParticipant.name}!\nMenghasilkan ${dmgResult} Damage!${hitDetails}`;
      setScreenShake("crit");

      if (targetNewHp <= 0) {
        text += `\n💀 ${targetParticipant.name} hangus terbakar dan tewas!`;
        if (campaign.gridState && campaign.gridState.tokens) {
          const newTokens = campaign.gridState.tokens.filter((t: any) => t.id !== selectedTargetId);
          await updateGridStateAction(campaign._id, { ...campaign.gridState, tokens: newTokens });
        }
      }

      const aliveMonsters = newCombatState.participants.filter((p: any) => p.isMonster && p.hp > 0);
      if (aliveMonsters.length === 0) {
        playSound("crit");
        const lootText = `⚔️ [VICTORY] Selamat! Anda berhasil meratakan seluruh Goblin di ruangan ini! Di tengah abu sisa mantra Anda, tampak sebuah peti baja yang meleleh sebagian, memperlihatkan tumpukan emas dan senjata berkilau. Anda mendapatkan [LOOT: Pedang Naga Api (Flame Tongue)] dan [LOOT: Kantong Emas Tavern (150 GP)]!`;
        
        await sendCampaignMessageAction(campaign._id, "Dungeon Master", lootText, false);
        
        const lootItems = [
          { id: "loot-flame-tongue", name: "Pedang Naga Api (Flame Tongue)", quantity: 1 },
          { id: "loot-150gp", name: "Kantong Emas Tavern (150 GP)", quantity: 1 }
        ];

        await updateSharedGoldAction(campaign._id, 150);
        for (const item of lootItems) {
          await addSharedItemAction(campaign._id, item);
        }

        newCombatState.isActive = false;

        confetti({
          particleCount: 200,
          spread: 120,
          origin: { y: 0.5 },
          colors: ['#22c55e', '#fbbf24', '#eab308']
        });
      }
    }

    newCombatState.participants[attackerIdx] = { 
      ...newCombatState.participants[attackerIdx], 
      action: Math.max(0, action - 1) 
    };

    await sendCampaignMessageAction(campaign._id, userChar.name, text, true);
    await updateCombatStateAction(campaign._id, newCombatState);

    const updated = await getCampaignByIdAction(campaign._id);
    if (updated) setCampaign(updated);

    setTimeout(() => {
      setIsRolling(false);
      setScreenShake("");
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 1500);
  };

  if (!isDM && !userChar && status === "authenticated") {
    return (
      <div className="min-h-screen bg-[#fdfaf6] flex flex-col items-center justify-center text-stone-700 p-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.4] mix-blend-multiply pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />
        
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white border-2 border-[#d4c5b0] p-10 rounded-[2.5rem] w-full max-w-lg shadow-2xl relative overflow-hidden text-center">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-700 to-amber-500" />
          
          <Crown className="w-16 h-16 text-amber-700 mx-auto mb-4 animate-bounce" />
          <h2 className="text-3xl font-black text-stone-900 uppercase tracking-tighter mb-2" style={{ fontFamily: 'Georgia, serif' }}>Gerbang Tavern Terkunci</h2>
          <p className="text-[10px] text-stone-500 font-black uppercase tracking-widest mb-8 pl-1">Pilihlah pahlawan untuk memasuki dunia ini</p>
          
          {loadingChars ? (
            <div className="flex flex-col items-center justify-center py-8">
              <RefreshCw className="w-8 h-8 text-amber-700 animate-spin mb-2" />
              <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest">Memanggil pahlawan dari The Weave...</span>
            </div>
          ) : myCharacters.length === 0 ? (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-6 rounded-2xl mb-6 uppercase tracking-wider">
              Anda belum memiliki pahlawan di Realm ini!<br/>
              <Link href="/characters/new" className="mt-4 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-stone-900 font-black px-6 py-3.5 rounded-xl uppercase text-[10px] tracking-widest transition-all inline-block shadow-md">
                ⚔️ Ciptakan Pahlawan Pertama Anda
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <select 
                value={joiningCharId} 
                onChange={e => setJoiningCharId(e.target.value)} 
                className="w-full bg-[#fdfaf6] border border-[#d4c5b0] focus:border-amber-500 rounded-xl px-4 py-3.5 text-stone-900 text-sm font-bold outline-none cursor-pointer shadow-inner appearance-none"
              >
                <option value="">-- Pilih Karakter Anda --</option>
                {myCharacters.map(char => (
                  <option key={char._id} value={char._id}>{char.name} • LVL {char.level} {char.class}</option>
                ))}
              </select>
              
              <button 
                onClick={() => handleJoinCampaign(joiningCharId)}
                disabled={isJoining || !joiningCharId}
                className="w-full bg-gradient-to-b from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-stone-900 font-black px-6 py-4 rounded-xl uppercase text-[10px] tracking-widest transition-all disabled:opacity-50 shadow-md flex items-center justify-center gap-2"
              >
                {isJoining ? (
                  <>
                     <RefreshCw className="w-4 h-4 animate-spin" />
                     Memasuki Tavern...
                  </>
                ) : (
                  <>
                     <Sword className="w-4 h-4" />
                     Masuk Kampanye Sekarang
                  </>
                )}
              </button>
            </div>
          )}
          
          <Link href="/campaigns" className="mt-8 text-[9px] font-black text-stone-500 hover:text-stone-900 transition-colors uppercase tracking-[0.2em] block pl-1">
            ← Kembali ke Beranda Petualang
          </Link>
        </motion.div>
      </div>
    );
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMsg.trim() || aiThinking) return;
    
    const sender = isDM ? "Dungeon Master" : (userChar?.name || "Player");
    const textToSend = chatMsg;
    setChatMsg("");
    
    const updatedMessages = [...(campaign.chatMessages || []), { senderName: sender, text: textToSend, isRoll: false, createdAt: new Date() }];
    setCampaign((prev: any) => ({
      ...prev,
      chatMessages: updatedMessages
    }));

    // Paksa scroll ke bawah instan saat player mengetik pesan sendiri
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setUnreadCount(0);
      setShowScrollBottomBadge(false);
    }, 60);

    if (isSoloCampaign && !campaign.combatState?.isActive && !isDM) {
      setAiThinking(true);
      
      setCampaign((prev: any) => ({
        ...prev,
        chatMessages: [...updatedMessages, { senderName: "System", text: "🎙️ AI Dungeon Master sedang merajut takdir Anda...", isRoll: false, createdAt: new Date() }]
      }));

      const res = await processSoloStoryAction(campaign._id, textToSend);
      if (res.success && res.campaign) {
        setCampaign(res.campaign);
      }
      setAiThinking(false);
    } else {
      await sendCampaignMessageAction(campaign._id, sender, textToSend, false);
    }
  };

  const rollDice = async (sides: number) => {
    if (isRolling) return;
    setIsRolling(true);
    playSound("dice");
    
    const result = Math.floor(Math.random() * sides) + 1;
    const sender = isDM ? "Dungeon Master" : (userChar?.name || "Player");
    
    if (sides === 20 && result === 20) { 
      setScreenShake("crit"); 
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#d97706', '#f59e0b', '#fbbf24', '#2563eb']
      });
    }
    if (sides === 20 && result === 1) { setScreenShake("fail"); }
    
    const text = `Memutar d${sides} dan mendapat hasil: ${result}`;
    
    await sendCampaignMessageAction(campaign._id, sender, text, true);
    
    setCampaign({
      ...campaign,
      chatMessages: [...(campaign.chatMessages || []), { senderName: sender, text, isRoll: true, createdAt: new Date() }]
    });

    // Paksa scroll ke bawah instan saat player mengocok dadu
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setUnreadCount(0);
      setShowScrollBottomBadge(false);
    }, 60);
    
    setTimeout(() => {
      setIsRolling(false);
      setScreenShake("");
    }, 1500); 
  };

  const handleClaimLoot = async (itemName: string) => {
    if (!userChar) return alert("Hanya player yang bisa mengklaim rampasan loot!");
    const res = await claimLootAction(userChar._id, itemName);
    if (res.success) {
      alert(`Berhasil mengambil: ${itemName}! Silakan evaluasi lembar Karakter Anda.`);
      await sendCampaignMessageAction(campaign._id, "System", `${userChar.name} telah mengambil [${itemName}]`, false);
    } else {
      alert("Gagal mengklaim loot.");
    }
  };

  const handleRollAttack = async (weaponName: string, damageStr: string) => {
    if (!userChar || !selectedTargetId || !campaign.combatState) return;
    
    const target = campaign.combatState.participants.find((p: any) => p.id === selectedTargetId);
    if (!target) return;

    const attackerIdx = campaign.combatState.participants.findIndex((p: any) => p.name === userChar.name);
    if (attackerIdx === -1) return;

    setIsRolling(true);

    const attackRoll = Math.floor(Math.random() * 20) + 1;
    const attackTotal = attackRoll + 3;
    const isHit = attackTotal >= (target.ac || 10);

    let text = `[COMBAT_LOG] Menyerang ${target.name} dengan ${weaponName}!\nRoll Serangan: ${attackRoll} + 3 = ${attackTotal} vs AC ${target.ac || 10}.`;
    
    let newCombatState = { ...campaign.combatState };
    newCombatState.participants = [...newCombatState.participants];

    if (isHit) {
      const dmgMatch = damageStr.match(/(\d+)d(\d+)/);
      let dmgResult = 0;
      if (dmgMatch) {
        const count = parseInt(dmgMatch[1]);
        const sides = parseInt(dmgMatch[2]);
        for(let i=0; i<count; i++) dmgResult += Math.floor(Math.random() * sides) + 1;
      } else {
        dmgResult = parseInt(damageStr) || 1;
      }
      dmgResult += 2;
      
      text += `\nHIT! Menghasilkan ${dmgResult} Damage!`;
      setScreenShake("crit");
      
      const targetIdx = newCombatState.participants.findIndex((p: any) => p.id === selectedTargetId);
      newCombatState.participants[targetIdx] = { ...newCombatState.participants[targetIdx], hp: newCombatState.participants[targetIdx].hp - dmgResult };
    } else {
      text += `\nMISS! Serangan meleset dari target.`;
      setScreenShake("fail");
    }

    newCombatState.participants[attackerIdx] = { ...newCombatState.participants[attackerIdx], action: newCombatState.participants[attackerIdx].action - 1 };

    await sendCampaignMessageAction(campaign._id, userChar.name, text, true);
    await updateCombatStateAction(campaign._id, newCombatState);
    
    setCampaign({
      ...campaign,
      combatState: newCombatState,
      chatMessages: [...(campaign.chatMessages || []), { senderName: userChar.name, text, isRoll: true, createdAt: new Date() }]
    });
    
    setTimeout(() => { 
      setIsRolling(false); 
      setScreenShake(""); 
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 1500);
  };

  return (
    <motion.div 
      animate={
        screenShake === "crit" ? { x: [-10, 10, -10, 10, 0], y: [-10, 10, -5, 5, 0] } :
        screenShake === "fail" ? { x: [-5, 5, -5, 5, 0], opacity: [1, 0.8, 1] } : {}
      }
      transition={{ duration: 0.5 }}
      className={`min-h-screen ${screenShake === 'crit' ? 'bg-amber-100' : screenShake === 'fail' ? 'bg-red-950/80' : 'bg-[#fdfaf6]'} text-stone-700 p-4 md:p-8 relative overflow-hidden flex flex-col transition-colors duration-500`}
    >
      <div className="absolute inset-0 opacity-[0.4] mix-blend-multiply pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />
      
      {/* Spell Particles Canvas Overlay */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[160]" />
      
      {/* 3D Dynamic Dice Roll Ceremony overlay */}
      <AnimatePresence>
        {isRolling && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[200] pointer-events-none flex flex-col items-center justify-center bg-black/35 backdrop-blur-xs"
          >
             <motion.div 
               initial={{ scale: 0.4, rotate: -270 }} 
               animate={{ scale: [1, 1.15, 1], rotate: 720 }} 
               exit={{ scale: 0, opacity: 0 }} 
               transition={{ type: "spring", stiffness: 120, damping: 10 }}
               className="drop-shadow-[0_0_50px_rgba(217,119,6,0.6)] bg-[#fdfaf6] p-10 rounded-3xl border border-[#d4c5b0] flex flex-col items-center justify-center gap-4"
             >
               <Dice5 className="w-24 h-24 text-amber-700 animate-spin" style={{ animationDuration: '0.8s' }} />
               <span className="text-amber-800 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Merajut Takdir Dadu...</span>
             </motion.div>
          </motion.div>
        )}
        
        {/* Your Turn Indicator banner */}
        {showMyTurn && (
          <motion.div initial={{ scale: 3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ type: "spring", stiffness: 150, damping: 10 }} className="fixed inset-0 z-[250] pointer-events-none flex items-center justify-center bg-black/20 backdrop-blur-xs">
             <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 uppercase tracking-tighter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]" style={{ WebkitTextStroke: '3px #451a03' }}>
               GILIRAN ANDA!
             </h1>
          </motion.div>
        )}
      </AnimatePresence>
      
      {isDM && <DMScreen campaignId={campaign._id} characters={campaign.characters} />}

      {/* HEADER HUD BAR */}
      <header className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6 bg-white/80 p-5 rounded-3xl border border-[#d4c5b0] shadow-sm backdrop-blur-sm">
        <div>
           <h1 className="text-3xl font-black text-stone-900 uppercase tracking-tighter flex items-center gap-3">
             <Map className="w-8 h-8 text-amber-800 shrink-0" /> {campaign.name}
           </h1>
           <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mt-1.5 pl-0.5">Invite Code: {campaign.inviteCode}</p>
        </div>
        <div className="flex flex-col md:flex-row items-end md:items-center gap-4 w-full lg:w-auto shrink-0">
           <AudioSync currentAudio={campaign.audioState} isDM={isDM} campaignId={campaign._id} />
           
           <div className="flex items-center gap-3 bg-[#fdfaf6] border border-[#d4c5b0] px-4 py-2.5 rounded-xl h-full shadow-sm">
             <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest">Sesi Aktif:</span>
             <span className={`text-[10.5px] font-black uppercase tracking-widest ${isDM ? 'text-amber-800' : 'text-emerald-700'}`}>
               {isDM ? 'Dungeon Master' : userChar?.name}
             </span>
           </div>
        </div>
      </header>

      {/* DASHBOARD GRID */}
      <div className="flex-1 relative z-10 grid grid-cols-1 xl:grid-cols-4 gap-6 min-h-0">
         
         {/* LEFT COLUMN: VTT grid and trackers */}
         <div className="xl:col-span-3 flex flex-col gap-6">
           <div className="flex gap-2 overflow-x-auto custom-scrollbar border-b border-[#d4c5b0] pb-2.5">
             {[
               { id: "grid", icon: <Map className="w-4 h-4" />, label: "Battle Grid" },
               { id: "combat", icon: <Flame className="w-4 h-4" />, label: "Combat Tracker" },
               { id: "loot", icon: <Crown className="w-4 h-4" />, label: "Shared Loot" }
             ].map(tab => (
               <button 
                 key={tab.id} 
                 onClick={() => setActiveTab(tab.id)} 
                 className={`px-5 py-3 rounded-xl font-black uppercase text-[9.5px] tracking-widest transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer
                   ${activeTab === tab.id ? 'bg-amber-850 text-stone-100 shadow-md border border-amber-900/30' : 'bg-white/70 text-stone-500 hover:text-stone-850 hover:bg-white'}`}
               >
                 {tab.icon} {tab.label}
               </button>
             ))}
           </div>
           
           <div className="flex-1 min-h-[420px]">
             {activeTab === "grid" && <BattleGrid gridState={campaign.gridState || {}} combatState={campaign.combatState || {}} isDM={isDM} campaignId={campaign._id} characters={campaign.characters || []} userCharId={userChar?._id} selectedTargetId={selectedTargetId} onSelectTarget={setSelectedTargetId} />}
             {activeTab === "combat" && <CombatTracker campaign={campaign} isDM={isDM} campaignId={campaign._id} />}
             {activeTab === "loot" && <SharedLoot campaign={campaign} campaignId={campaign._id} />}
           </div>
         </div>

         {/* RIGHT COLUMN: Party Tracker & Chat System */}
         <div className="xl:col-span-1 flex flex-col gap-6">
           
           {/* PARTY TRACKER STATUS PANEL */}
           <div className="bg-white/85 border border-[#d4c5b0] rounded-[2rem] shadow-sm p-4 flex flex-col max-h-[250px] overflow-hidden">
              <h2 className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-stone-100 pb-2">
                <User className="w-3.5 h-3.5 text-stone-400" /> Anggota Party ({campaign.characters?.length || 0})
              </h2>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2.5 pr-0.5 select-none">
                 {campaign.characters?.map((char: any) => {
                   const hpPercent = (char.currentHp / char.hpMax) * 100;
                   return (
                     <div key={char._id} className="bg-[#fdfaf6] border border-[#d4c5b0] p-3 rounded-xl relative overflow-hidden shadow-xs hover:border-[#a6937a] transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black text-stone-800 uppercase tracking-wide truncate">{char.name}</span>
                          <span className="text-[8px] font-black bg-stone-200/60 text-stone-600 px-2 py-0.5 rounded-lg tracking-wider shrink-0 uppercase">Lv {char.level || 1} {char.class?.split(' ')[0]}</span>
                        </div>
                        
                        <div className="flex justify-between items-center mb-1 text-[8px] font-black text-stone-400 uppercase tracking-widest">
                          <span>Hit Points (HP)</span>
                          <span className="text-stone-700 font-mono">{char.currentHp} / {char.hpMax}</span>
                        </div>
                        
                        <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden border border-stone-300/30">
                          <motion.div 
                            animate={{ width: `${hpPercent}%` }} 
                            className={`h-full ${hpPercent < 30 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} 
                          />
                        </div>
                     </div>
                   )
                 })}
                 {(!campaign.characters || campaign.characters.length === 0) && (
                   <div className="text-center py-6 text-[9.5px] font-black text-stone-400 uppercase tracking-widest italic">Kosong</div>
                 )}
              </div>
           </div>
           
           {/* TAVERN NARRATIVE DIARY CHAT */}
           <div className="bg-white/85 border border-[#d4c5b0] rounded-[2rem] shadow-sm flex flex-col xl:h-[390px] h-[450px] overflow-hidden relative">
              <h2 className="text-[9px] font-black text-stone-400 uppercase tracking-widest p-4 border-b border-stone-200 flex items-center justify-between shrink-0 select-none bg-white">
                <span className="flex items-center gap-2"><ScrollText className="w-3.5 h-3.5 text-stone-400" /> Tavern Log</span>
                {isRolling && <span className="text-amber-800 animate-pulse font-bold tracking-widest text-[8px] uppercase">Mengocok takdir...</span>}
              </h2>
              
              {/* Tavern Log Main scroll container */}
              <div 
                ref={chatContainerRef} 
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fdfaf6] custom-scrollbar relative"
              >
                  {/* Parchment background layers */}
                  <div className="absolute inset-0 opacity-[0.25] mix-blend-multiply pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] z-0" />
                  
                  {campaign.chatMessages?.map((msg: any, i: number) => {
                    const isMyMsg = msg.senderName === (isDM ? "Dungeon Master" : userChar?.name);
                    const isSysMsg = msg.senderName === "System";
                    
                    if (isSysMsg) {
                      return (
                        <div key={i} className="text-center py-1 z-10 relative">
                          <span className="inline-block bg-stone-200 text-stone-500 px-3.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-stone-300/60 shadow-xs">{msg.text}</span>
                        </div>
                      )
                    }

                    // Parse [LOOT: item] tag
                    const lootMatch = msg.text.match(/\[LOOT:\s*(.+?)\]/);
                    let displayText = msg.text;
                    if (lootMatch) {
                      displayText = msg.text.replace(lootMatch[0], ""); 
                    }

                    const isCombatLog = msg.text.startsWith("[COMBAT_LOG] ");
                    const actualText = isCombatLog ? msg.text.replace("[COMBAT_LOG] ", "") : displayText;

                    const isNarrator = msg.senderName === "Dungeon Master";

                    return (
                      <div key={i} className={`flex flex-col ${isMyMsg ? 'items-end' : 'items-start'} mb-2.5 z-10 relative`}>
                         <span className="text-[8px] font-black text-amber-900/60 uppercase tracking-widest mb-1 mx-1.5 drop-shadow-sm select-none">
                           {msg.senderName}
                         </span>
                         
                         {/* Highly rich styled story bubble frames */}
                         <div className={`max-w-[90%] p-3.5 rounded-2xl border flex flex-col gap-1.5 shadow-sm transition-all duration-300
                           ${isCombatLog 
                             ? 'bg-red-950/5 border-red-900/20 text-red-950 font-serif text-xs leading-relaxed font-bold shadow-[0_4px_12px_rgba(153,27,27,0.02)]' 
                             : msg.isRoll 
                               ? 'bg-amber-50 border-amber-300 text-amber-950 font-serif text-xs leading-relaxed font-semibold border-2' 
                               : isNarrator
                                 ? 'bg-amber-50/40 border-amber-250 text-amber-950 font-serif text-[12.5px] leading-relaxed font-medium shadow-[0_4px_12px_rgba(217,119,6,0.02)]'
                                 : isMyMsg 
                                   ? 'bg-stone-850 text-stone-100 border-stone-900 font-medium text-xs shadow-md' 
                                   : 'bg-white border-[#d4c5b0] text-stone-800 font-medium text-xs'}
                         `}>
                           {msg.isRoll && !isCombatLog && <Dice5 className="w-3.5 h-3.5 text-amber-700 inline-block mr-1.5 shrink-0" />}
                           {isCombatLog && <Sword className="w-3.5 h-3.5 text-red-800 inline-block mr-1.5 shrink-0" />}
                           
                           {actualText && (
                             <span className="whitespace-pre-wrap leading-relaxed">
                               {actualText}
                             </span>
                           )}
                           
                           {lootMatch && (
                             <div className="mt-2.5 bg-amber-50 border border-amber-200 p-2.5 rounded-xl flex items-center justify-between gap-3 w-full shadow-inner">
                               <span className="text-[8.5px] font-black text-amber-800 uppercase flex items-center gap-1.5 truncate"><Pickaxe className="w-3.5 h-3.5 shrink-0 text-amber-750"/> {lootMatch[1]}</span>
                               <button onClick={() => handleClaimLoot(lootMatch[1])} className="bg-gradient-to-b from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-650 text-stone-900 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all shadow-sm shrink-0 border border-amber-800 cursor-pointer">Klaim</button>
                             </div>
                           )}
                         </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
              </div>

              {/* Floating Smart Scroll unread messages alert badge */}
              <AnimatePresence>
                {showScrollBottomBadge && (
                  <motion.button 
                    initial={{ opacity: 0, y: 15, x: "-50%" }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    onClick={() => {
                      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
                      setUnreadCount(0);
                      setShowScrollBottomBadge(false);
                    }}
                    className="absolute bottom-18 left-1/2 z-30 bg-amber-850 hover:bg-amber-800 text-stone-100 px-4.5 py-2.5 rounded-full text-[8.5px] font-black uppercase tracking-wider shadow-lg border border-amber-900/30 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  >
                    <ChevronDown className="w-3.5 h-3.5 text-stone-100 animate-bounce" /> 
                    Ada Cerita Baru {unreadCount > 0 ? `(${unreadCount})` : ''}
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Chat action control deck */}
              <div className="p-3 border-t border-stone-200 bg-white shrink-0">
                 <div className="flex gap-1.5 mb-2 overflow-x-auto pb-1.5 custom-scrollbar">
                   {[4, 6, 8, 10, 12, 20].map(d => (
                     <button key={d} onClick={() => rollDice(d)} className="shrink-0 bg-[#fdfaf6] border border-stone-300 hover:border-amber-500 hover:bg-amber-50/50 text-stone-600 text-[8px] font-black px-2.5 py-2 rounded-lg uppercase tracking-widest transition-all shadow-xs flex items-center gap-1 cursor-pointer">
                       <Dice5 className="w-3 h-3 text-amber-700/60" /> d{d}
                     </button>
                   ))}
                 </div>
                 
                 <form onSubmit={sendMessage} className="flex gap-2">
                   <input 
                     type="text" 
                     value={chatMsg} 
                     onChange={e => setChatMsg(e.target.value)} 
                     placeholder="Ketik pesan naratif..." 
                     className="flex-1 bg-[#fdfaf6] border border-[#d4c5b0] focus:border-amber-500 rounded-lg px-3 py-2 text-xs font-semibold outline-none transition-all shadow-inner placeholder:text-stone-400" 
                   />
                   <button type="submit" className="bg-stone-850 hover:bg-stone-850 text-stone-100 px-3.5 py-2 rounded-lg shadow-sm transition-all flex items-center justify-center cursor-pointer shrink-0">
                     <Send className="w-3.5 h-3.5" />
                   </button>
                 </form>
              </div>
           </div>
         </div>
      </div>

      {/* Player HUD Hotbar control deck */}
      {!isDM && userChar && (
        <PlayerHUD userChar={userChar} combatState={campaign.combatState} selectedTargetId={selectedTargetId} onRollAttack={handleRollAttack} onCastSpell={handleCastSpell} />
      )}
    </motion.div>
  );
}
