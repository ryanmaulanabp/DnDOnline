"use client";

import { useState } from "react";
import { Flame, ChevronRight } from "lucide-react";
import { updateCombatStateAction } from "@/app/actions/campaign";

export function CombatTracker({ campaign, isDM, campaignId }: { campaign: any, isDM: boolean, campaignId: string }) {
  const [monsterInput, setMonsterInput] = useState({ name: "", hp: 10, initiative: 10, ac: 10 });

  const handleAddParticipant = async () => {
    if (!monsterInput.name) return;
    const newParticipant = {
      id: Math.random().toString(36).substring(7),
      name: monsterInput.name,
      initiative: monsterInput.initiative,
      hp: monsterInput.hp,
      maxHp: monsterInput.hp,
      ac: monsterInput.ac || 10,
      action: 1,
      bonusAction: 1,
      reaction: 1,
      speed: 30,
      isMonster: true
    };
    const currentCombat = campaign.combatState || { isActive: true, round: 1, turnIndex: 0, participants: [] };
    const updatedParticipants = [...currentCombat.participants, newParticipant].sort((a: any, b: any) => b.initiative - a.initiative);
    
    const newState = { ...currentCombat, participants: updatedParticipants, isActive: true };
    await updateCombatStateAction(campaignId, newState);
    setMonsterInput({ name: "", hp: 10, initiative: 10, ac: 10 });
  };

  const handleNextTurn = async () => {
    if (!campaign.combatState) return;
    let { round, turnIndex, participants } = campaign.combatState;
    turnIndex++;
    if (turnIndex >= participants.length) {
      turnIndex = 0;
      round++;
    }
    const updatedParticipants = participants.map((p: any, i: number) => {
      if (i === turnIndex) {
        return { ...p, action: 1, bonusAction: 1, reaction: 1, speed: 30 };
      }
      return p;
    });
    const newState = { ...campaign.combatState, round, turnIndex, participants: updatedParticipants };
    await updateCombatStateAction(campaignId, newState);
  };

  return (
    <div className="bg-white/80 border border-stone-300 shadow-sm p-6 flex flex-col rounded-3xl h-full min-h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-black text-amber-800 uppercase tracking-tight flex items-center gap-2"><Flame className="w-5 h-5" /> Initiative Tracker</h2>
          <p className="text-[9px] font-black text-stone-500 uppercase tracking-widest mt-1">Round: {campaign.combatState?.round || 1}</p>
        </div>
        {isDM && (
          <button onClick={handleNextTurn} className="bg-amber-800 hover:bg-amber-700 text-stone-100 font-black px-4 py-2 rounded-xl uppercase text-[9px] tracking-widest transition-all shadow-md flex items-center gap-1">Next Turn <ChevronRight className="w-4 h-4" /></button>
        )}
      </div>
      
      {isDM && (
        <div className="flex gap-2 mb-6 bg-[#fdfaf6] p-3 rounded-2xl border border-stone-200">
          <input value={monsterInput.name} onChange={e=>setMonsterInput({...monsterInput, name: e.target.value})} placeholder="Monster Name" className="flex-1 bg-transparent border-b-2 border-stone-300 focus:border-amber-600 px-2 py-1 text-stone-900 text-sm font-bold outline-none" />
          <input type="number" value={monsterInput.initiative} onChange={e=>setMonsterInput({...monsterInput, initiative: +e.target.value})} placeholder="Init" className="w-12 bg-transparent border-b-2 border-stone-300 focus:border-amber-600 px-1 py-1 text-stone-900 text-sm font-bold outline-none text-center" />
          <input type="number" value={monsterInput.ac} onChange={e=>setMonsterInput({...monsterInput, ac: +e.target.value})} placeholder="AC" className="w-12 bg-transparent border-b-2 border-stone-300 focus:border-amber-600 px-1 py-1 text-stone-900 text-sm font-bold outline-none text-center" />
          <input type="number" value={monsterInput.hp} onChange={e=>setMonsterInput({...monsterInput, hp: +e.target.value})} placeholder="HP" className="w-12 bg-transparent border-b-2 border-stone-300 focus:border-amber-600 px-1 py-1 text-stone-900 text-sm font-bold outline-none text-center" />
          <button onClick={handleAddParticipant} className="bg-stone-200 text-stone-700 hover:bg-stone-300 hover:text-stone-900 font-black px-4 py-2 rounded-lg text-[9px] uppercase tracking-widest transition-all">Add</button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
        {!campaign.combatState?.participants?.length ? (
          <div className="text-center text-stone-400 font-black text-[10px] uppercase tracking-widest py-8 border-2 border-dashed border-stone-200 rounded-2xl">Belum ada pertarungan aktif.</div>
        ) : (
          campaign.combatState.participants.map((p: any, idx: number) => {
            const isCurrentTurn = campaign.combatState.turnIndex === idx;
            return (
              <div key={p.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isCurrentTurn ? 'bg-amber-100 border-amber-400 shadow-sm' : 'bg-[#fdfaf6] border-stone-200'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-stone-100 ${isCurrentTurn ? 'bg-amber-700' : 'bg-stone-800'}`}>
                    {p.initiative}
                  </div>
                  <div>
                    <h3 className={`text-sm font-black uppercase tracking-widest ${p.isMonster ? 'text-red-700' : 'text-emerald-700'}`}>{p.name} {isCurrentTurn && <Flame className="inline w-3 h-3 text-amber-600" />}</h3>
                    <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest">{p.isMonster ? 'Monster' : 'Player'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-[8px] font-black text-stone-400 uppercase tracking-widest">HP</span>
                  <span className="text-lg font-black text-stone-900 leading-none">{p.hp}</span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  );
}
