"use client";

import { useState } from "react";
import { Backpack, Coins } from "lucide-react";
import { addSharedItemAction, updateSharedGoldAction } from "@/app/actions/campaign";

export function SharedLoot({ campaign, campaignId }: { campaign: any, campaignId: string }) {
  const [lootInput, setLootInput] = useState({ name: "", quantity: 1 });
  const [goldInput, setGoldInput] = useState(0);

  const handleAddLoot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lootInput.name) return;
    const newItem = { id: Math.random().toString(36).substring(7), name: lootInput.name, quantity: lootInput.quantity };
    await addSharedItemAction(campaignId, newItem);
    setLootInput({ name: "", quantity: 1 });
  };

  const handleAddGold = async () => {
    if (goldInput === 0) return;
    await updateSharedGoldAction(campaignId, goldInput);
    setGoldInput(0);
  };

  return (
    <div className="bg-white/80 border border-stone-300 shadow-sm p-6 flex flex-col rounded-3xl h-full min-h-[400px]">
      <h2 className="text-xl font-black text-amber-800 uppercase tracking-tight flex items-center gap-2 mb-6"><Backpack className="w-5 h-5" /> Shared Loot</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-1 bg-amber-50 border border-amber-200 p-4 rounded-2xl text-center flex flex-col justify-center">
          <Coins className="w-8 h-8 mb-2 text-amber-600 mx-auto" />
          <h3 className="text-[8px] font-black text-amber-800 uppercase tracking-widest mb-1">Party Fund</h3>
          <span className="text-3xl font-black text-stone-900">{campaign.sharedInventory?.gold || 0} gp</span>
          
          <div className="flex gap-2 mt-4">
            <input type="number" value={goldInput} onChange={e=>setGoldInput(+e.target.value)} className="w-full bg-[#fdfaf6] border border-stone-300 rounded-lg text-center text-stone-900 font-bold outline-none focus:border-amber-500 text-xs py-2" placeholder="0" />
            <button onClick={handleAddGold} className="bg-amber-600 hover:bg-amber-500 text-stone-900 font-black px-3 rounded-lg uppercase text-[9px] tracking-widest transition-all">Add</button>
          </div>
        </div>
        
        <div className="md:col-span-2">
          <form onSubmit={handleAddLoot} className="flex gap-2 mb-4">
            <input required value={lootInput.name} onChange={e=>setLootInput({...lootInput, name: e.target.value})} className="flex-1 bg-[#fdfaf6] border border-stone-300 focus:border-amber-500 rounded-xl px-4 py-2 text-stone-900 text-sm font-bold outline-none transition-colors placeholder:text-stone-400" placeholder="Nama Item / Senjata" />
            <input required type="number" value={lootInput.quantity} onChange={e=>setLootInput({...lootInput, quantity: +e.target.value})} className="w-16 bg-[#fdfaf6] border border-stone-300 focus:border-amber-500 rounded-xl px-2 py-2 text-stone-900 text-center text-sm font-bold outline-none transition-colors" min="1" />
            <button type="submit" className="bg-stone-800 hover:bg-stone-700 text-stone-100 font-black px-4 py-2 rounded-xl uppercase text-[9px] tracking-widest transition-all">Add</button>
          </form>
          
          <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
            {!campaign.sharedInventory?.items?.length ? (
              <div className="text-center text-stone-400 font-black text-[10px] uppercase tracking-widest py-8 border-2 border-dashed border-stone-200 rounded-2xl">Inventory kosong.</div>
            ) : (
              campaign.sharedInventory.items.map((item: any) => (
                <div key={item.id} className="bg-[#fdfaf6] border border-stone-200 px-4 py-3 rounded-xl flex justify-between items-center group hover:border-amber-500 transition-all">
                  <span className="font-bold text-stone-900 uppercase tracking-widest text-xs">{item.name}</span>
                  <span className="text-[9px] font-black bg-stone-200 text-stone-600 px-2 py-1 rounded-lg">x{item.quantity}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
