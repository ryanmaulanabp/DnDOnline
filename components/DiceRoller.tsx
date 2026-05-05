"use client";

import { useState } from "react";

export default function DiceRoller() {
  const [result, setResult] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const rollDice = () => {
    setIsRolling(true);
    setResult(null);
    
    // Simulasi animasi putar dadu selama 600ms
    setTimeout(() => {
      const roll = Math.floor(Math.random() * 20) + 1;
      setResult(roll);
      setIsRolling(false);
    }, 600);
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-inner flex flex-col items-center">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">D20 Dice Roller</h3>
      
      <div className={`w-20 h-20 flex items-center justify-center rounded-lg border-2 border-blue-500 bg-slate-900 text-3xl font-black mb-4 transition-all ${isRolling ? 'animate-bounce border-yellow-500 text-yellow-500' : 'text-blue-400'}`}>
        {isRolling ? "?" : result || "-"}
      </div>

      <button
        onClick={rollDice}
        disabled={isRolling}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg transition-all"
      >
        {isRolling ? "Rolling..." : "Roll D20"}
      </button>

      {result === 20 && <p className="mt-2 text-yellow-400 font-bold animate-pulse">NATURAL 20! CRITICAL!</p>}
      {result === 1 && <p className="mt-2 text-red-500 font-bold">NATURAL 1... Critical Failure.</p>}
    </div>
  );
}