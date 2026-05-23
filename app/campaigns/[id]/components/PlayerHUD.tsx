"use client";

import { motion } from "framer-motion";
import { Sword, Wand2, ShieldAlert, Sparkles, Heart, Flame } from "lucide-react";

export function PlayerHUD({ userChar, combatState, selectedTargetId, onRollAttack, onCastSpell }: { userChar: any, combatState?: any, selectedTargetId?: string | null, onRollAttack: (name: string, dmg: string) => void, onCastSpell: (name: string, dmgOrHeal: string, isHeal: boolean) => void }) {
  if (!userChar) return null;

  const weapons = userChar.weapons || [];
  const spells = userChar.spells || [];

  const combatParticipant = combatState?.participants?.find((p: any) => p.name === userChar.name);
  const action = combatParticipant?.action || 0;
  const bonusAction = combatParticipant?.bonusAction || 0;
  const reaction = combatParticipant?.reaction || 0;
  const isMyTurn = combatParticipant && combatState.participants[combatState.turnIndex]?.name === userChar.name;

  const charClass = userChar.class?.split(" ")[0] || "Fighter";
  const isCaster = ["Wizard", "Sorcerer", "Warlock", "Bard"].includes(charClass);
  const isMartial = ["Fighter", "Barbarian", "Rogue", "Monk", "Ranger"].includes(charClass);
  const isHoly = ["Cleric", "Paladin", "Druid"].includes(charClass);

  const handleCast = (name: string, dmgOrHeal: string, isHeal: boolean) => {
    if (action < 1) {
      alert("Anda sudah tidak memiliki Action di giliran ini!");
      return;
    }
    onCastSpell(name, dmgOrHeal, isHeal);
  };

  const handleAttack = (name: string, dmg: string) => {
    if (!selectedTargetId) {
      alert("Pilih target di Battle Grid terlebih dahulu!");
      return;
    }
    if (action < 1) {
      alert("Anda sudah tidak memiliki Action di giliran ini!");
      return;
    }
    onRollAttack(name, dmg);
  };

  return (
    <motion.div 
      initial={{ y: 100 }} 
      animate={{ y: 0 }} 
      className="fixed bottom-0 left-0 right-0 pointer-events-none z-[150] flex justify-center pb-4"
    >
      <div className="pointer-events-auto bg-stone-900/95 backdrop-blur-md border-t-4 border-l-4 border-r-4 border-stone-700 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] p-4 flex gap-6 items-end">
        
        {/* Character Portrait & Status */}
        <div className="relative flex flex-col items-center">
          <div className="w-16 h-16 rounded-full border-4 border-amber-500 overflow-hidden bg-stone-800 shadow-lg">
            <img src={userChar.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=" + userChar.name} className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-3 bg-amber-600 text-stone-900 px-3 py-0.5 rounded-full text-[10px] font-black tracking-widest border border-amber-300">
            LVL {userChar.level}
          </div>
        </div>

        {/* HP & Stats */}
        <div className="flex flex-col gap-1 w-32">
          <div className="flex justify-between text-[9px] font-black text-amber-500 tracking-widest">
            <span>HP</span> <span>{userChar.currentHp}/{userChar.hpMax}</span>
          </div>
          <div className="w-full h-2.5 bg-red-950 rounded-full overflow-hidden border border-stone-800">
            <motion.div 
              className="h-full bg-gradient-to-r from-red-600 to-red-400"
              initial={{ width: 0 }}
              animate={{ width: `${(userChar.currentHp / userChar.hpMax) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex justify-between items-center mt-1">
             <span className="text-[10px] text-stone-400 font-bold flex items-center gap-1"><ShieldAlert className="w-3 h-3 text-stone-300" /> AC {userChar.armorClass}</span>
          </div>
        </div>

        <div className="w-px h-12 bg-stone-700 mx-2" />

        {/* Action Economy Crystals */}
        {combatParticipant && (
          <div className="flex flex-col gap-1.5 justify-center items-center px-2">
            <div className="text-[7px] font-black text-stone-500 uppercase tracking-widest text-center leading-tight">Resources</div>
            <div className="flex gap-2">
              {/* Action */}
              <div className="relative group">
                <div className={`w-3.5 h-3.5 rounded-full rotate-45 border transition-all ${action > 0 ? 'bg-emerald-500 border-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-stone-800 border-stone-600'}`} />
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 bg-stone-900 text-emerald-400 text-[8px] px-1 py-0.5 rounded whitespace-nowrap">Action</span>
              </div>
              {/* Bonus Action */}
              <div className="relative group">
                <div className={`w-3 h-3 mt-0.5 rounded-sm rotate-45 border transition-all ${bonusAction > 0 ? 'bg-orange-500 border-orange-300 shadow-[0_0_8px_rgba(249,115,22,0.8)]' : 'bg-stone-800 border-stone-600'}`} />
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 bg-stone-900 text-orange-400 text-[8px] px-1 py-0.5 rounded whitespace-nowrap">Bonus Action</span>
              </div>
              {/* Reaction */}
              <div className="relative group">
                <div className={`w-3 h-3 mt-0.5 rounded-sm rotate-45 border transition-all ${reaction > 0 ? 'bg-blue-500 border-blue-300 shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'bg-stone-800 border-stone-600'}`} />
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 bg-stone-900 text-blue-400 text-[8px] px-1 py-0.5 rounded whitespace-nowrap">Reaction</span>
              </div>
            </div>
            {isMyTurn && <div className="text-[8px] text-amber-500 font-black animate-pulse uppercase">Your Turn!</div>}
          </div>
        )}

        <div className="w-px h-12 bg-stone-700 mx-2" />

        {/* Weapons Hotbar */}
        <div className="flex gap-2">
          {weapons.map((w: any, idx: number) => (
            <button 
              key={idx}
              onClick={() => handleAttack(w.name, w.damage)}
              className={`group relative w-12 h-12 border-2 rounded-xl transition-all shadow-inner flex items-center justify-center overflow-hidden ${action > 0 && selectedTargetId ? 'bg-stone-800 border-emerald-600 hover:border-emerald-400 hover:bg-stone-700 cursor-pointer' : 'bg-stone-900 border-stone-700 opacity-50 cursor-not-allowed'}`}
            >
              <Sword className={`w-6 h-6 transition-colors ${action > 0 && selectedTargetId ? 'text-emerald-500 group-hover:text-emerald-300' : 'text-stone-600'}`} />
              <div className="absolute inset-x-0 bottom-0 bg-stone-900/80 text-[7px] text-center font-black text-stone-300 py-0.5 truncate px-1">
                {w.name}
              </div>
              {/* Tooltip */}
              <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-stone-900 text-amber-500 text-[10px] font-black px-2 py-1 rounded border border-amber-700 whitespace-nowrap">
                Attack & Roll {w.damage}
              </div>
            </button>
          ))}
          
          {/* Class Spell Book Shortcuts */}
          {isCaster && (
            <>
              {/* Fireball */}
              <button 
                onClick={() => handleCast("Fireball 🔥", "8d6", false)}
                className={`group relative w-12 h-12 border-2 rounded-xl transition-all shadow-inner flex items-center justify-center overflow-hidden ${action > 0 && selectedTargetId ? 'bg-stone-800 border-red-600 hover:border-red-400 hover:bg-stone-700 cursor-pointer' : 'bg-stone-900 border-stone-700 opacity-50 cursor-not-allowed'}`}
              >
                <Flame className={`w-6 h-6 transition-colors ${action > 0 && selectedTargetId ? 'text-red-500 group-hover:text-red-300' : 'text-stone-600'}`} />
                <div className="absolute inset-x-0 bottom-0 bg-stone-900/80 text-[6px] text-center font-black text-stone-300 py-0.5 truncate px-1">
                  Fireball
                </div>
                <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-stone-900 text-red-400 text-[9px] font-black px-2 py-1 rounded border border-red-700 whitespace-nowrap">
                  Cast Fireball (8d6 Fire)
                </div>
              </button>

              {/* Magic Missile */}
              <button 
                onClick={() => handleCast("Magic Missile 🔮", "3d4+3", false)}
                className={`group relative w-12 h-12 border-2 rounded-xl transition-all shadow-inner flex items-center justify-center overflow-hidden ${action > 0 && selectedTargetId ? 'bg-stone-800 border-purple-600 hover:border-purple-400 hover:bg-stone-700 cursor-pointer' : 'bg-stone-900 border-stone-700 opacity-50 cursor-not-allowed'}`}
              >
                <Wand2 className={`w-6 h-6 transition-colors ${action > 0 && selectedTargetId ? 'text-purple-400 group-hover:text-purple-200' : 'text-stone-600'}`} />
                <div className="absolute inset-x-0 bottom-0 bg-stone-900/80 text-[6px] text-center font-black text-stone-300 py-0.5 truncate px-1">
                  M. Missile
                </div>
                <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-stone-900 text-purple-400 text-[9px] font-black px-2 py-1 rounded border border-purple-700 whitespace-nowrap">
                  Cast Magic Missile (3d4+3 Force)
                </div>
              </button>
            </>
          )}

          {isHoly && (
            <>
              {/* Cure Wounds */}
              <button 
                onClick={() => handleCast("Cure Wounds ✨", "1d8", true)}
                className={`group relative w-12 h-12 border-2 rounded-xl transition-all shadow-inner flex items-center justify-center overflow-hidden ${action > 0 ? 'bg-stone-800 border-emerald-600 hover:border-emerald-400 hover:bg-stone-700 cursor-pointer' : 'bg-stone-900 border-stone-700 opacity-50 cursor-not-allowed'}`}
              >
                <Sparkles className={`w-6 h-6 transition-colors ${action > 0 ? 'text-emerald-500 group-hover:text-emerald-300' : 'text-stone-600'}`} />
                <div className="absolute inset-x-0 bottom-0 bg-stone-900/80 text-[6px] text-center font-black text-stone-300 py-0.5 truncate px-1">
                  Cure Wounds
                </div>
                <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-stone-900 text-emerald-400 text-[9px] font-black px-2 py-1 rounded border border-emerald-700 whitespace-nowrap">
                  Cast Cure Wounds (1d8+4 Heal)
                </div>
              </button>
            </>
          )}

          {isMartial && (
            <>
              {/* Second Wind */}
              <button 
                onClick={() => handleCast("Second Wind 💨", "1d10", true)}
                className={`group relative w-12 h-12 border-2 rounded-xl transition-all shadow-inner flex items-center justify-center overflow-hidden ${action > 0 ? 'bg-stone-800 border-orange-600 hover:border-orange-400 hover:bg-stone-700 cursor-pointer' : 'bg-stone-900 border-stone-700 opacity-50 cursor-not-allowed'}`}
              >
                <Heart className={`w-6 h-6 transition-colors ${action > 0 ? 'text-orange-500 group-hover:text-orange-300' : 'text-stone-600'}`} />
                <div className="absolute inset-x-0 bottom-0 bg-stone-900/80 text-[6px] text-center font-black text-stone-300 py-0.5 truncate px-1">
                  Second Wind
                </div>
                <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-stone-900 text-orange-400 text-[9px] font-black px-2 py-1 rounded border border-orange-700 whitespace-nowrap">
                  Use Second Wind (1d10+4 Heal)
                </div>
              </button>
            </>
          )}
          
          {/* Default Unarmed / Ability */}
          <button onClick={() => handleAttack("Unarmed Strike", "1d4")} className={`w-12 h-12 border-2 rounded-xl transition-all flex items-center justify-center relative group ${action > 0 && selectedTargetId ? 'bg-stone-800 border-stone-600 hover:border-amber-400 cursor-pointer' : 'bg-stone-900 border-stone-700 opacity-50 cursor-not-allowed'}`}>
            <Sparkles className="w-5 h-5 text-stone-400 group-hover:text-amber-400" />
            <div className="absolute inset-x-0 bottom-0 bg-stone-900/80 text-[7px] text-center font-black text-stone-300 py-0.5">Punch</div>
          </button>
        </div>

      </div>
    </motion.div>
  );
}
