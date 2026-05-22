"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import CharactersClient from "./CharactersClient";
import { getCharactersByUserAction } from "@/app/actions/character";
import { motion } from "framer-motion";

export default function CharactersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [characters, setCharacters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.email) {
      const fetchChars = async () => {
        try {
          const chars = await getCharactersByUserAction(session.user!.email as string);
          setCharacters(chars);
        } catch (error) {
          console.error("Failed to fetch characters", error);
        } finally {
          setLoading(false);
        }
      };
      fetchChars();
    }
  }, [status, session, router]);

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-[#fdfaf6] flex flex-col items-center justify-center text-amber-700 relative overflow-hidden">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} className="w-20 h-20 border-4 border-amber-200 border-t-amber-600 rounded-full mb-6 relative z-10" />
        <span className="text-xs font-black uppercase tracking-[0.4em] animate-pulse relative z-10 text-amber-800">Menelusuri Catatan Pahlawan...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfaf6] pt-8">
      <CharactersClient characters={characters} user={session?.user} />
    </div>
  );
}
