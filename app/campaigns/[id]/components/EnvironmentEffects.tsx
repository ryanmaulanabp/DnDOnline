"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function EnvironmentEffects({ weather }: { weather: string }) {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; duration: number; delay: number }[]>([]);

  useEffect(() => {
    if (!weather || weather === "none") {
      setParticles([]);
      return;
    }

    // Generate random particles based on weather type
    const count = weather === "rain" ? 100 : weather === "snow" || weather === "embers" ? 50 : 0;
    const newParticles = Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage
      y: Math.random() * 100, // percentage
      size: Math.random() * (weather === "snow" ? 6 : weather === "embers" ? 4 : 2) + 1,
      duration: Math.random() * 2 + (weather === "rain" ? 0.5 : 3),
      delay: Math.random() * 2,
    }));
    
    setParticles(newParticles);
  }, [weather]);

  if (!weather || weather === "none") return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden mix-blend-screen" style={{ transform: "translateZ(100px)" }}>
      {weather === "fog" && (
        <>
          <motion.div animate={{ x: ["-10%", "10%", "-10%"] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/foggy-birds.png')] opacity-30 mix-blend-overlay" />
          <motion.div animate={{ x: ["10%", "-10%", "10%"] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/foggy-birds.png')] opacity-20 scale-150 mix-blend-overlay" />
        </>
      )}

      {weather === "rain" && particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ top: "-10%", left: `${p.x}%`, opacity: 0 }}
          animate={{ top: "110%", opacity: [0, 0.5, 0.5, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }}
          className="absolute w-[1px] h-6 bg-blue-300 drop-shadow-[0_0_2px_rgba(147,197,253,0.8)]"
          style={{ rotate: "15deg" }}
        />
      ))}

      {weather === "snow" && particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ top: "-10%", left: `${p.x}%`, opacity: 0, rotate: 0 }}
          animate={{ top: "110%", left: `${p.x + (Math.random() * 10 - 5)}%`, opacity: [0, 0.8, 0], rotate: 360 }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }}
          className="absolute bg-white rounded-full drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]"
          style={{ width: p.size, height: p.size }}
        />
      ))}

      {weather === "embers" && particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ bottom: "-10%", left: `${p.x}%`, opacity: 0, scale: 0 }}
          animate={{ bottom: "110%", left: `${p.x + (Math.random() * 20 - 10)}%`, opacity: [0, 1, 0], scale: [0, 1, 0.5] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeOut" }}
          className="absolute rounded-full"
          style={{ 
            width: p.size, 
            height: p.size,
            background: "radial-gradient(circle, #fbbf24 0%, #ea580c 50%, transparent 100%)",
            boxShadow: "0 0 10px #ea580c, 0 0 20px #f59e0b"
          }}
        />
      ))}
    </div>
  );
}
