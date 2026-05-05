"use server";

import { revalidatePath } from "next/cache";

// ==========================================
// PENTING: Sesuaikan dua jalur (path) import ini 
// dengan lokasi asli file koneksi database dan model Mongoose Anda!
// ==========================================
import connectDB from "@/lib/mongodb"; 
import Character from "@/models/Character"; 

export interface CharacterPayload {
  name: string;
  race: string;
  class: string;
  alignment: string;
  background: string;
  level: number;
  hpMax: number;
  currentHp?: number;
  tempHp?: number;
  hitDice?: string;
  armorClass: number;
  speed: number;
  initiative: number;
  stats: Record<string, number>;
  proficientSkills: string[];
  weapons?: { name: string; damage: string; isFinesse: boolean; isRanged: boolean }[];
  equipment: string[];
  currency?: { cp: number; sp: number; ep: number; gp: number; pp: number };
  spellCastingStat?: "INT" | "WIS" | "CHA" | "NONE";
  spells: string[];
  features: string[];
  roleplay?: { traits: string; ideals: string; bonds: string; flaws: string };
}

export async function createCharacterAction(payload: CharacterPayload) {
  try {
    // 1. Membuka gerbang dimensi ke MongoDB
    await connectDB();

    // 2. Menyimpan entitas karakter ke dalam database secara permanen
    await Character.create(payload);

    // 3. Membersihkan cache Next.js pada halaman utama ("/") 
    // Ini memaksa Next.js mengambil data terbaru dari database saat Anda dialihkan!
    revalidatePath("/");

    return { success: true };
    
  } catch (error) {
    console.error("Terjadi kesalahan sistem saat menyimpan ke Mongoose:", error);
    throw new Error("Gagal menyimpan ke database"); 
  }
}

export async function getCharacterById(id: string) {
  try {
    const mongoose = (await import("mongoose")).default;
    await import("@/lib/mongodb").then(m => m.default());
    const Character = (await import("@/models/Character")).default;

    // Pastikan ID valid secara format Mongoose
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    const char = await Character.findById(id).lean();
    if (!char) return null;

    // Serialize data agar aman dikirim dari Server ke Client
    return JSON.parse(JSON.stringify(char));
  } catch (error) {
    console.error("Gagal mengambil data karakter:", error);
    return null;
  }
}

export async function updateCharacterHpAction(id: string, currentHp: number) {
  try {
    await connectDB();
    const Character = (await import("@/models/Character")).default; // Pastikan import model sesuai
    await Character.findByIdAndUpdate(id, { currentHp });
    
    // Refresh halaman secara otomatis setelah HP berubah
    const { revalidatePath } = await import("next/cache");
    revalidatePath(`/characters/${id}`);
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateWeaponsAction(id: string, weapons: any[]) {
  try {
    await connectDB();
    const Character = (await import("@/models/Character")).default;
    await Character.findByIdAndUpdate(id, { weapons });
    
    const { revalidatePath } = await import("next/cache");
    revalidatePath(`/characters/${id}`);
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}