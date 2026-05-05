"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCharacterStore } from "@/store/useCharacterStore";
import { createCharacterAction, CharacterPayload } from "@/app/actions/character";
import { CLASSES, RACES, BACKGROUNDS } from "@/lib/dnd-data";

export default function FinalizeStep() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const store = useCharacterStore();

  const rulesClass = CLASSES[store.charClass] || null;
  const rulesRace = RACES[store.race] || null;
  const rulesSubrace = rulesRace?.subraces?.find((s: any) => s.name === store.subrace) || null;
  const rulesBg = BACKGROUNDS[store.background] || null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    const allProficientSkills = [...(rulesBg?.skills || []), ...store.selectedClassSkills];
    
    // LOGIKA EQUIPMENT VS STARTING WEALTH
    const finalEquipment = [];
    if (!store.useStartingWealth) {
      // Jika pakai barang bawaan (Standard)
      finalEquipment.push(...(rulesBg?.equipment || []));
      if (rulesClass?.baseEquipment) finalEquipment.push(...rulesClass.baseEquipment);
      Object.values(store.equipmentSelections).forEach(item => finalEquipment.push(item as string));
    } else {
      // Jika pakai Gold, hanya simpan barang trinket dasar atau kosongkan
      finalEquipment.push("Set of traveler's clothes", "A pouch");
    }

    const finalClassName = `${store.charClass}${store.subclass ? ` (${store.subclass})` : ''}`;
    const finalRaceName = store.subrace ? `${store.race} (${store.subrace})` : store.race;
    const flattenedTraits = [
      ...(rulesRace?.traits ? rulesRace.traits.map((t: any) => t.name) : []),
      ...(rulesSubrace?.traits ? rulesSubrace.traits.map((t: any) => t.name) : [])
    ];

    // MENGHITUNG STATS FINAL BERDASARKAN PILIHAN ASI
    const getBonus = (stat: string) => {
      if (store.asiChoice === "standard") return (rulesRace?.bonuses[stat] || 0) + (rulesSubrace?.bonuses[stat] || 0);
      if (store.asiChoice === "custom21") return stat === store.customBonus1 ? 2 : stat === store.customBonus2 ? 1 : 0;
      if (store.asiChoice === "custom111") return (stat === store.customBonus1 || stat === store.customBonus2 || stat === store.customBonus3) ? 1 : 0;
      return 0;
    };
    
    const totalStats = {
      STR: store.baseStats.STR + getBonus("STR"), DEX: store.baseStats.DEX + getBonus("DEX"),
      CON: store.baseStats.CON + getBonus("CON"), INT: store.baseStats.INT + getBonus("INT"),
      WIS: store.baseStats.WIS + getBonus("WIS"), CHA: store.baseStats.CHA + getBonus("CHA"),
    };
    const calcMod = (val: number) => Math.floor((val - 10) / 2);
    const modifiers = { STR: calcMod(totalStats.STR), DEX: calcMod(totalStats.DEX), CON: calcMod(totalStats.CON), INT: calcMod(totalStats.INT), WIS: calcMod(totalStats.WIS), CHA: calcMod(totalStats.CHA) };

    const payload: CharacterPayload = {
      name: store.name, race: finalRaceName, class: finalClassName, alignment: store.alignment, background: store.background,
      level: 1, hpMax: (rulesClass?.hitDie || 10) + modifiers.CON, currentHp: (rulesClass?.hitDie || 10) + modifiers.CON, 
      armorClass: rulesRace?.traits?.some((t: any) => t.name === "Natural Armor") ? 17 : (10 + modifiers.DEX),
      speed: rulesRace?.speed || 30, initiative: modifiers.DEX,
      stats: totalStats, proficientSkills: allProficientSkills,
      equipment: finalEquipment, spells: [...store.selectedCantrips, ...store.selectedSpells],
      features: flattenedTraits, spellCastingStat: "NONE", weapons: [],
      // DATA ROLEPLAY DAN UANG UNTUK MONGODB
      roleplay: { traits: store.traits, ideals: store.ideals, bonds: store.bonds, flaws: store.flaws },
      currency: { cp: 0, sp: 0, ep: 0, gp: store.gold, pp: 0 }
    };

    try {
      const result = await createCharacterAction(payload);
      if (result?.success) { store.reset(); router.push("/"); }
    } catch (err) { alert("Gagal menciptakan karakter."); setIsSubmitting(false); }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl pb-20 text-center mt-12">
      <h2 className="text-5xl font-black text-white mb-2">Petualangan Menanti!</h2>
      <p className="text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed">Peralatan telah disiapkan, atribut telah ditempa, dan masa lalu telah terukir. Klik tombol di bawah ini untuk mencetak namamu ke dalam panteon Realm kami.</p>
      
      <div className="bg-[#181b26] p-8 rounded-3xl border border-[#2d3245] max-w-md mx-auto shadow-2xl">
        <h3 className="text-xl font-black text-white mb-6 uppercase tracking-widest border-b border-[#2d3245] pb-4">Validasi Akhir</h3>
        <div className="flex justify-between items-center mb-4"><span className="text-sm font-bold text-slate-500">Karakter</span><span className="text-sm font-black text-blue-400">{store.name || "Unnamed"}</span></div>
        <div className="flex justify-between items-center mb-4"><span className="text-sm font-bold text-slate-500">Mata Uang</span><span className="text-sm font-black text-yellow-500">{store.gold} GP</span></div>
        <div className="flex justify-between items-center mb-8"><span className="text-sm font-bold text-slate-500">Total Item</span><span className="text-sm font-black text-slate-300">{store.useStartingWealth ? "Sesuai Pembelian" : "Paket Standar"}</span></div>
        
        <button onClick={handleSubmit} disabled={isSubmitting} className="w-full bg-red-600 hover:bg-red-500 disabled:bg-slate-800 text-white font-black text-lg py-5 rounded-xl transition-all shadow-[0_0_40px_-10px_rgba(220,38,38,0.5)] active:scale-95 flex items-center justify-center gap-3 tracking-wide">
          {isSubmitting ? <span className="animate-pulse">MEMANGGIL KARAKTER...</span> : "SAHKAN KARAKTER KE DALAM REALM"}
        </button>
      </div>
    </div>
  );
}