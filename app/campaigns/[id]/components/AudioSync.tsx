"use client";

import { useEffect, useRef, useState } from "react";
import { Music, VolumeX, Volume2 } from "lucide-react";
import { updateAudioStateAction } from "@/app/actions/campaign";

// Pilihan lagu BGM yang tersedia. 
// Karena ini tidak memiliki file asli, kita menggunakan placeholder atau file yang umum ada.
// Dalam skenario nyata, kita butuh file mp3 sungguhan di folder public/audio
const AUDIO_TRACKS: Record<string, string> = {
  "none": "",
  "tavern": "https://cdn.pixabay.com/download/audio/2022/02/22/audio_c8bd214150.mp3?filename=tavern-music-111118.mp3",
  "combat": "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=epic-battle-music-1-105741.mp3",
  "exploration": "https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=fantasy-ambient-1-1-117565.mp3"
};

export function AudioSync({ currentAudio, isDM, campaignId }: { currentAudio: string, isDM: boolean, campaignId: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      if (currentAudio === "none" || !AUDIO_TRACKS[currentAudio]) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.src = AUDIO_TRACKS[currentAudio];
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false)); // Autoplay policy mitigation
      }
    }
  }, [currentAudio]);

  const handleSetAudio = async (track: string) => {
    if (!isDM) return;
    await updateAudioStateAction(campaignId, track);
  };

  return (
    <div className="bg-[#fdfaf6] border border-stone-300 rounded-xl p-3 flex flex-col gap-2 shadow-sm">
      <audio ref={audioRef} loop muted={muted} />
      
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-1">
          <Music className={`w-3 h-3 ${isPlaying ? 'text-amber-600 animate-pulse' : 'text-stone-400'}`} /> 
          Tavern Tunes
        </span>
        <button onClick={() => setMuted(!muted)} className="text-stone-500 hover:text-amber-700 transition-colors">
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {isDM && (
        <div className="flex flex-wrap gap-1 mt-1">
          {Object.keys(AUDIO_TRACKS).map(track => (
            <button
              key={track}
              onClick={() => handleSetAudio(track)}
              className={`px-2 py-1 text-[8px] font-black uppercase tracking-widest rounded-md border transition-all ${
                currentAudio === track 
                  ? "bg-amber-600 text-stone-900 border-amber-700" 
                  : "bg-white text-stone-600 border-stone-200 hover:bg-amber-50"
              }`}
            >
              {track}
            </button>
          ))}
        </div>
      )}
      {!isDM && (
        <div className="text-[10px] font-bold text-stone-600 italic">
          {currentAudio === "none" ? "Keheningan..." : `Memutar: ${currentAudio.toUpperCase()}`}
        </div>
      )}
    </div>
  );
}
