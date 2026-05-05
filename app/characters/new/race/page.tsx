"use client";

import { useCharacterStore } from "@/store/useCharacterStore";
import { RACES } from "@/lib/dnd-data";

export default function RaceSelectionStep() {
  const { race, subrace, updateField } = useCharacterStore();

  const handleRaceChange = (newRace: string) => {
    updateField("race", newRace);
    updateField("subrace", ""); // Reset subrace saat ras berubah
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-3xl font-black text-white">Choose a Species (Race)</h2>
        <p className="text-slate-400">Ras menentukan warisan fisik, budaya, dan kemampuan magis bawaanmu.</p>
      </div>
      
      <div className="flex flex-col gap-3 max-w-3xl">
        {Object.entries(RACES).map(([raceName, data]) => {
          const isSelected = race === raceName;
          return (
            <div key={raceName} className={`rounded-xl border transition-all duration-300 overflow-hidden ${isSelected ? "bg-slate-50 border-blue-500 ring-2 ring-blue-500/50 shadow-lg" : "bg-white border-slate-300 hover:border-slate-400"}`}>
              <div onClick={() => handleRaceChange(raceName)} className={`cursor-pointer flex items-center p-3 ${isSelected ? 'bg-white border-b border-slate-200' : 'bg-white'}`}>
                <div className="w-14 h-14 rounded-md bg-slate-800 flex items-center justify-center text-3xl shadow-inner shrink-0 border border-slate-700">{data.icon}</div>
                <div className="ml-4 flex-1">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none mb-1">{raceName}</h3>
                  <p className="text-sm text-slate-500 font-medium leading-none">Player's Handbook / Expanded</p>
                </div>
              </div>

              {isSelected && (
                <div className="bg-slate-50 p-6">
                  <p className="text-sm text-slate-700 leading-relaxed mb-5 font-medium">{data.desc}</p>
                  <div className="flex flex-wrap gap-3 text-xs font-bold uppercase tracking-wider mb-6">
                    <span className="bg-slate-200 text-slate-800 px-3 py-1.5 rounded-md border border-slate-300 shadow-sm">Speed: {data.speed} ft</span>
                    {Object.entries(data.bonuses).map(([stat, val]) => (
                      <span key={stat} className="bg-green-100 text-green-800 px-3 py-1.5 rounded-md border border-green-200 shadow-sm">+{val} {stat}</span>
                    ))}
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Kemampuan Ras Dasar</h4>
                    <div className="space-y-3">
                      {data.traits.map((trait: any) => (
                        <div key={trait.name} className="text-sm"><span className="font-bold text-blue-700">{trait.name}: </span><span className="text-slate-600 font-medium">{trait.desc}</span></div>
                      ))}
                    </div>
                  </div>

                  {data.subraces && data.subraces.length > 0 && (
                    <div>
                      <h4 className="text-lg font-black text-slate-900 tracking-tight mb-4">Pilih Garis Keturunan (Subrace)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.subraces.map((sub: any) => (
                          <div key={sub.name} onClick={() => updateField("subrace", sub.name)} className={`cursor-pointer p-5 rounded-xl border-2 transition-all flex flex-col justify-between ${subrace === sub.name ? 'bg-blue-50 border-blue-500 shadow-md' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                            <div className="mb-3">
                              <h5 className={`text-base font-black tracking-tight mb-2 ${subrace === sub.name ? 'text-blue-700' : 'text-slate-900'}`}>{sub.name}</h5>
                              <p className="text-xs leading-relaxed font-medium mb-3 text-slate-500">{sub.desc}</p>
                              <div className="flex gap-2 text-[10px] font-bold uppercase tracking-wider mb-2">
                                {Object.entries(sub.bonuses).map(([s, v]) => (<span key={s} className="bg-green-100 text-green-700 px-2 py-1 rounded border border-green-200">+{v as number} {s}</span>))}
                              </div>
                            </div>
                            <div className="border-t border-slate-200 pt-3 mt-auto">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Kemampuan Tambahan:</span>
                              {sub.traits.map((t: any) => (<p key={t.name} className="text-xs text-slate-600 leading-tight mb-1"><span className="font-bold text-slate-800">{t.name}.</span> {t.desc}</p>))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}