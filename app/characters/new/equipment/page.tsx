"use client";

import { useState } from "react";
import { useCharacterStore } from "@/store/useCharacterStore";
import { CLASSES, BACKGROUNDS } from "@/lib/dnd-data";

export default function EquipmentStep() {
  const { 
    charClass, background, selectedClassSkills, equipmentSelections, 
    useStartingWealth, gold, updateField 
  } = useCharacterStore();

  const [openSection, setOpenSection] = useState<string>("Choose Equipment");

  const rulesClass = CLASSES[charClass] || null;
  const rulesBg = BACKGROUNDS[background] || null;

  const toggleSection = (section: string) => setOpenSection(prev => prev === section ? "" : section);

  const toggleClassSkill = (skill: string) => {
    if (selectedClassSkills.includes(skill)) {
      updateField("selectedClassSkills", selectedClassSkills.filter(s => s !== skill));
    } else if (rulesClass && selectedClassSkills.length < rulesClass.skillCount) {
      updateField("selectedClassSkills", [...selectedClassSkills, skill]);
    }
  };

  const handleWealthChoice = (choice: "equipment" | "gold") => {
    if (choice === "gold") {
      updateField("useStartingWealth", true);
      updateField("gold", 150); // Default D&D rata-rata gold jika memilih starting wealth
      updateField("equipmentSelections", {}); // Reset pilihan senjata jika milih gold
    } else {
      updateField("useStartingWealth", false);
      updateField("gold", 15); // Default saku background
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl">
      <div>
        <h2 className="text-3xl font-black text-white">Proficiencies & Equipment</h2>
        <p className="text-slate-400">Pilih keahlian akhir Anda dan kelola inventaris pahlawan.</p>
      </div>

      {/* --- SKILLS SECTION (Diperindah) --- */}
      <div className="bg-[#181b26] p-6 md:p-8 rounded-3xl border border-[#2d3245] shadow-lg">
        <div className="flex justify-between items-center mb-6 border-b border-[#2d3245] pb-4">
          <h3 className="text-lg font-black text-white flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Skill Proficiencies</h3>
          <span className="text-[10px] font-black text-white bg-purple-600 px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md">Pilih {selectedClassSkills.length} / {rulesClass?.skillCount || 0}</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {rulesClass?.skillOptions.map((skill: string) => {
            const isBgSkill = rulesBg?.skills.includes(skill);
            const isSelected = selectedClassSkills.includes(skill);
            const isDisabled = isBgSkill || (!isSelected && selectedClassSkills.length >= (rulesClass?.skillCount || 0));
            return (
              <div key={skill} onClick={() => !isDisabled && toggleClassSkill(skill)} className={`p-3.5 rounded-xl border text-sm flex items-center justify-between transition-all ${isBgSkill ? 'bg-[#181b26]/50 border-[#2d3245] opacity-60 cursor-not-allowed' : isSelected ? 'bg-purple-900/30 border-purple-500 text-white cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.15)]' : isDisabled ? 'bg-[#0f111a] border-[#2d3245] text-slate-600 cursor-not-allowed' : 'bg-[#0f111a] border-[#3e455c] text-slate-300 hover:border-purple-500/50 cursor-pointer'}`}>
                <span className="font-bold truncate">{skill}</span>{isBgSkill && <span className="text-[10px] bg-[#2d3245] px-2 py-0.5 rounded text-slate-300 font-bold uppercase">From BG</span>}
              </div>
            )
          })}
        </div>
      </div>

      {/* --- INVENTORY MANAGEMENT ACCORDION (D&D BEYOND STYLE) --- */}
      <div className="space-y-3">
        
        {/* 1. CHOOSE EQUIPMENT ACCORDION */}
        <div className="bg-[#181b26] rounded-xl border border-[#2d3245] overflow-hidden">
          <button onClick={() => toggleSection("Choose Equipment")} className="w-full flex justify-between items-center p-5 hover:bg-[#2d3245]/50 border-l-4 border-l-yellow-500">
            <h3 className="text-lg font-black text-white">Choose Equipment</h3>
            <span className={`text-slate-500 transform transition-transform ${openSection === "Choose Equipment" ? "rotate-180" : ""}`}>▼</span>
          </button>
          
          {openSection === "Choose Equipment" && (
            <div className="p-6 bg-[#0f111a] border-t border-[#2d3245] animate-fadeIn">
              <p className="text-sm text-slate-300 mb-6">Sebagai seorang {charClass}, Anda berhak menerima perlengkapan tempur standar, ATAU Anda bisa memilih menolaknya dan menerima modal keping emas tambahan (Starting Wealth) untuk berbelanja sendiri nanti.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div onClick={() => handleWealthChoice("equipment")} className={`cursor-pointer p-5 rounded-xl border-2 transition-all flex flex-col items-center text-center ${!useStartingWealth ? 'bg-blue-900/20 border-blue-500 shadow-md' : 'bg-[#181b26] border-[#3e455c] hover:border-slate-500'}`}>
                  <span className="text-3xl mb-3">⚔️</span>
                  <h4 className="text-sm font-black text-white uppercase tracking-widest">Starting Equipment</h4>
                  <p className="text-xs text-slate-500 mt-2">Dapatkan perlengkapan bawaan dari class & masa lalu Anda.</p>
                </div>
                <div onClick={() => handleWealthChoice("gold")} className={`cursor-pointer p-5 rounded-xl border-2 transition-all flex flex-col items-center text-center ${useStartingWealth ? 'bg-yellow-900/20 border-yellow-500 shadow-md' : 'bg-[#181b26] border-[#3e455c] hover:border-slate-500'}`}>
                  <span className="text-3xl mb-3">💰</span>
                  <h4 className="text-sm font-black text-white uppercase tracking-widest">Starting Wealth</h4>
                  <p className="text-xs text-slate-500 mt-2">Tolak barang gratisan, ambil keping emas (GP), beli sendiri.</p>
                </div>
              </div>

              {/* JIKA PILIH EQUIPMENT (TAMPILKAN PILIHAN SENJATA) */}
              {!useStartingWealth && (
                <div className="space-y-6 pt-6 border-t border-[#2d3245] animate-fadeIn">
                  {rulesClass?.baseEquipment && (
                    <div>
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Diberikan Otomatis</h4>
                      <div className="flex flex-wrap gap-2.5">
                        {rulesClass.baseEquipment.map((eq: string) => (<span key={eq} className="bg-[#181b26] text-slate-300 text-sm font-medium px-4 py-2 rounded-lg border border-[#3e455c]">{eq}</span>))}
                      </div>
                    </div>
                  )}
                  {rulesClass?.equipmentChoices?.map((choiceGroup: any, idx: number) => (
                    <div key={idx} className="bg-[#181b26] p-5 rounded-2xl border border-[#3e455c]">
                      <p className="text-[10px] font-black text-blue-400 mb-3 uppercase tracking-wider">Opsi Tempur {idx + 1}</p>
                      <div className="flex flex-col gap-3">
                        {choiceGroup.options.map((opt: string) => (
                          <label key={opt} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${equipmentSelections[choiceGroup.id] === opt ? 'bg-blue-900/30 border-blue-500' : 'bg-[#0f111a] border-[#2d3245] hover:border-[#3e455c]'}`}>
                            <input type="radio" checked={equipmentSelections[choiceGroup.id] === opt} onChange={() => updateField("equipmentSelections", { ...equipmentSelections, [choiceGroup.id]: opt })} className="w-5 h-5 accent-blue-500" />
                            <span className="text-sm md:text-base font-medium text-slate-200">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* JIKA PILIH GOLD */}
              {useStartingWealth && (
                <div className="pt-6 border-t border-[#2d3245] animate-fadeIn text-center">
                  <span className="text-6xl block mb-4">👑</span>
                  <h4 className="text-xl font-black text-yellow-500">Anda Memilih Kebebasan</h4>
                  <p className="text-sm text-slate-400 mt-2 mb-6 max-w-md mx-auto">Anda tidak akan menerima perlengkapan standar D&D dari ras atau class. Sebagai gantinya, Anda menerima Modal Awal berupa Keping Emas (GP).</p>
                  <div className="inline-flex items-center gap-4 bg-[#181b26] border-2 border-yellow-500/50 px-6 py-4 rounded-2xl shadow-[0_0_30px_rgba(234,179,8,0.15)]">
                    <span className="text-sm font-black text-slate-300 uppercase tracking-widest">Modal Awal Anda:</span>
                    <input type="number" value={gold} onChange={e => updateField("gold", Number(e.target.value))} className="w-24 bg-[#0f111a] border border-[#3e455c] rounded text-white text-center text-2xl font-black py-2 outline-none focus:border-yellow-500" />
                    <span className="text-xl font-black text-yellow-500">GP</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2. CURRENCY ACCORDION */}
        <div className="bg-[#181b26] rounded-xl border border-[#2d3245] overflow-hidden">
          <button onClick={() => toggleSection("Currency")} className="w-full flex justify-between items-center p-5 hover:bg-[#2d3245]/50 border-l-4 border-l-green-500">
            <h3 className="text-lg font-black text-white">Currency (Keuangan)</h3>
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-yellow-500">Total: {gold} GP</span>
              <span className={`text-slate-500 transform transition-transform ${openSection === "Currency" ? "rotate-180" : ""}`}>▼</span>
            </div>
          </button>
          {openSection === "Currency" && (
            <div className="p-6 bg-[#0f111a] border-t border-[#2d3245] flex flex-col items-center justify-center animate-fadeIn">
              <div className="flex items-center gap-4 bg-[#181b26] px-8 py-6 rounded-2xl border border-[#3e455c] shadow-lg">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-700 flex items-center justify-center shadow-inner">
                  <div className="w-7 h-7 rounded-full bg-yellow-500 border border-yellow-300"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gold Pieces</span>
                  <div className="flex items-center gap-2">
                    <input type="number" value={gold} onChange={e => updateField("gold", Number(e.target.value))} className="w-24 bg-transparent border-b-2 border-[#3e455c] text-white text-3xl font-black outline-none focus:border-yellow-500" />
                    <span className="text-xl font-black text-yellow-500">GP</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-6 max-w-sm text-center">Ini adalah uang tunai yang Anda bawa. Anda dapat mengaturnya secara manual sesuai dengan aturan Dungeon Master Anda.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}