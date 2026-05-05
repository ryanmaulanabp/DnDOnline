"use client";

import { useState } from "react";
import { useCharacterStore } from "@/store/useCharacterStore";
import { CLASSES, SUBCLASSES } from "@/lib/dnd-data";

export default function ClassSelectionStep() {
  const { charClass, subclass, updateField } = useCharacterStore();
  
  // State untuk Tab (Class Features / Spells) dan Accordion yang terbuka
  const [activeTab, setActiveTab] = useState<"FEATURES" | "SPELLS">("FEATURES");
  const [openFeature, setOpenFeature] = useState<string | null>(null);

  const handleClassChange = (newClass: string) => {
    updateField("charClass", newClass);
    updateField("subclass", ""); 
    updateField("selectedClassSkills", []);
    updateField("equipmentSelections", {});
    updateField("selectedCantrips", []);
    updateField("selectedSpells", []);
    setOpenFeature(null);
  };

  const toggleFeature = (featureName: string) => {
    setOpenFeature(prev => prev === featureName ? null : featureName);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl">
      <div>
        <h2 className="text-3xl font-black text-white">Choose a Class</h2>
        <p className="text-slate-400">Pilih jalan hidup utamamu dan taklukkan Realm dengan kemampuan unikmu.</p>
      </div>
      
      <div className="flex flex-col gap-4">
        {Object.entries(CLASSES).map(([className, data]) => {
          const isSelected = charClass === className;
          return (
            <div key={className} className={`rounded-xl border transition-all duration-300 overflow-hidden ${isSelected ? "bg-[#181b26] border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.15)]" : "bg-[#181b26] border-[#2d3245] hover:border-[#3e455c]"}`}>
              
              {/* HEADER CLASS */}
              <div onClick={() => handleClassChange(className)} className={`cursor-pointer flex items-center p-4 transition-colors ${isSelected ? 'bg-[#2d3245]/30 border-b border-[#2d3245]' : ''}`}>
                <div className="w-16 h-16 rounded-xl bg-cover bg-center shrink-0 border border-[#3e455c] shadow-inner" style={{ backgroundImage: `url('${data.image}')` }}></div>
                <div className="ml-5 flex-1">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">{className}</h3>
                  <div className="flex gap-3 mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    <span className="bg-[#0f111a] px-2 py-1 rounded border border-[#2d3245]">Hit Die: d{data.hitDie}</span>
                    <span className="bg-[#0f111a] px-2 py-1 rounded border border-[#2d3245]">Primary: {data.primary}</span>
                  </div>
                </div>
              </div>

              {/* KONTEN CLASS (JIKA DIPILIH) */}
              {isSelected && (
                <div className="bg-[#0f111a] flex flex-col animate-fadeIn">
                  
                  {/* TAB NAVIGASI */}
                  <div className="flex border-b border-[#2d3245] px-6 bg-[#181b26]">
                    <button onClick={() => setActiveTab("FEATURES")} className={`py-4 text-xs font-black uppercase tracking-widest border-b-2 mr-6 transition-colors ${activeTab === "FEATURES" ? 'text-blue-500 border-blue-500' : 'text-slate-500 border-transparent hover:text-slate-300'}`}>CLASS FEATURES</button>
                    {data.isCaster && (
                       <button onClick={() => setActiveTab("SPELLS")} className={`py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-colors ${activeTab === "SPELLS" ? 'text-blue-500 border-blue-500' : 'text-slate-500 border-transparent hover:text-slate-300'}`}>SPELLS</button>
                    )}
                  </div>

                  <div className="p-6">
                    {/* ISI TAB: CLASS FEATURES */}
                    {activeTab === "FEATURES" && (
                      <div className="space-y-6 animate-fadeIn">
                        <p className="text-sm text-slate-300 leading-relaxed font-medium">{data.desc}</p>
                        
                        {/* --- ACCORDION CLASS FEATURES (D&D BEYOND STYLE) --- */}
                        <div className="space-y-2 mt-6">
                           <h4 className="text-sm font-black text-white mb-4 flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Available at 1st Level</h4>
                           
                           {/* Mapping Dummy Features berdasarkan D&D Asli */}
                           {[
                             { name: `Core ${className} Traits`, level: "1st level", desc: "Profisiensi dasar, saving throws, dan perlengkapan awal yang membentuk fondasi kelas Anda." },
                             ...(className === "Warlock" ? [{ name: "Pact Magic", level: "1st level", desc: "Kekuatan mistis yang diberikan oleh Patron gaib Anda." }] : []),
                             ...(className === "Fighter" ? [{ name: "Fighting Style", level: "1st level", desc: "Anda mengadopsi gaya bertarung tertentu sebagai spesialisasi Anda." }, { name: "Second Wind", level: "1st level", desc: "Anda memiliki stamina tak terbatas untuk memulihkan diri di tengah pertempuran." }] : []),
                           ].map((feat) => (
                             <div key={feat.name} className="bg-[#181b26] rounded border border-[#2d3245] overflow-hidden">
                               <button onClick={() => toggleFeature(feat.name)} className="w-full flex justify-between items-center p-4 hover:bg-[#2d3245]/50 transition-colors">
                                 <div className="text-left"><h5 className="text-sm font-bold text-white">{feat.name}</h5><p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{feat.level}</p></div>
                                 <span className={`text-slate-500 transform transition-transform ${openFeature === feat.name ? "rotate-180" : ""}`}>▼</span>
                               </button>
                               {openFeature === feat.name && (<div className="p-4 bg-[#0f111a] border-t border-[#2d3245] text-sm text-slate-300 leading-relaxed animate-fadeIn">{feat.desc}</div>)}
                             </div>
                           ))}

                           {/* SUBCLASS SELECTION (Dimasukkan ke dalam Accordion Level) */}
                           {SUBCLASSES[className] && (
                             <>
                               <h4 className="text-sm font-black text-white mt-8 mb-4 flex items-center gap-2 pt-4 border-t border-[#2d3245]"><span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span> Subclass Selection</h4>
                               <div className="bg-[#181b26] rounded border border-purple-900/50 overflow-hidden shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                                 <div className="p-4 bg-[#181b26] border-b border-[#2d3245]">
                                   <div className="flex justify-between items-center mb-2">
                                     <h5 className="text-sm font-bold text-white">Pilih Spesialisasi ({className})</h5>
                                     <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${subclass ? 'bg-green-900/40 text-green-400 border border-green-900/50' : 'bg-red-900/40 text-red-400 border border-red-900/50'}`}>{subclass ? '✓ Terpilih' : 'Wajib Dipilih'}</span>
                                   </div>
                                 </div>
                                 <div className="p-4 bg-[#0f111a] grid grid-cols-1 md:grid-cols-2 gap-4">
                                   {SUBCLASSES[className].map((sub: any) => (
                                     <div key={sub.name} onClick={() => updateField("subclass", sub.name)} className={`cursor-pointer p-5 rounded-xl border-2 transition-all ${subclass === sub.name ? 'bg-purple-900/20 border-purple-500 shadow-md' : 'bg-[#181b26] border-[#3e455c] hover:border-purple-500/50'}`}>
                                       <h5 className={`text-base font-black tracking-tight mb-2 ${subclass === sub.name ? 'text-purple-400' : 'text-slate-200'}`}>{sub.name}</h5>
                                       <p className="text-xs text-slate-400 leading-relaxed">{sub.desc}</p>
                                     </div>
                                   ))}
                                 </div>
                               </div>
                             </>
                           )}
                        </div>
                      </div>
                    )}

                    {/* ISI TAB: SPELLS (Jika Caster) */}
                    {activeTab === "SPELLS" && (
                      <div className="py-12 flex flex-col items-center justify-center text-center animate-fadeIn">
                        <span className="text-5xl mb-4">✨</span>
                        <h4 className="text-lg font-black text-white mb-2">Kekuatan Magis</h4>
                        <p className="text-sm text-slate-400 max-w-md">Pemilihan mantra (Cantrips dan Spells) akan dilakukan di Tahap 5 (Equipment & Spells) setelah statistik atribut Anda terkunci.</p>
                      </div>
                    )}

                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}