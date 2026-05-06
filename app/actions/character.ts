"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb"; 
import Character from "@/models/Character";

export interface CharacterPayload {
  name: string; race: string; class: string; alignment: string; background: string;
  level: number; hpMax: number; currentHp: number; armorClass: number; speed: number;
  initiative: number; stats: { STR: number; DEX: number; CON: number; INT: number; WIS: number; CHA: number; };
  proficientSkills: string[]; equipment: string[]; spells: string[]; features: string[];
  spellCastingStat: string; weapons: any[];
  roleplay: { traits: string; ideals: string; bonds: string; flaws: string; };
  currency: { cp: number; sp: number; ep: number; gp: number; pp: number; };
  conditions: string[];
}

// --- FUNGSI AMBIL DATA (PENTING AGAR HALAMAN TIDAK ERROR) ---
export async function getCharacterById(id: string) {
  try {
    await connectDB();
    const character = await Character.findById(id).lean();
    if (!character) return null;
    
    // Konversi _id ke string agar Next.js tidak komplain
    return JSON.parse(JSON.stringify(character));
  } catch (error) {
    console.error("Gagal mengambil data karakter:", error);
    return null;
  }
}

// --- FUNGSI CREATE ---
export async function createCharacterAction(payload: CharacterPayload) {
  try {
    await connectDB();
    const newChar = new Character(payload);
    await newChar.save();
    revalidatePath("/");
    return { success: true, id: newChar._id.toString() };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- FUNGSI UPDATE HP ---
export async function updateCharacterHpAction(id: string, newHp: number) {
  try {
    await connectDB();
    await Character.findByIdAndUpdate(id, { currentHp: newHp });
    revalidatePath(`/characters/${id}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- FUNGSI UPDATE WEAPONS ---
export async function updateWeaponsAction(id: string, weapons: any[]) {
  try {
    await connectDB();
    await Character.findByIdAndUpdate(id, { weapons });
    revalidatePath(`/characters/${id}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- FUNGSI LEVEL UP ---
export async function levelUpAction(id: string, newLevel: number, hpIncrease: number) {
  try {
    await connectDB();
    const char = await Character.findById(id);
    if (!char) return { success: false, error: "Karakter tidak ditemukan" };
    const updatedHpMax = char.hpMax + hpIncrease;
    await Character.findByIdAndUpdate(id, { 
      level: newLevel, hpMax: updatedHpMax, currentHp: updatedHpMax 
    });
    revalidatePath(`/characters/${id}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- FUNGSI UPDATE CONDITIONS ---
export async function updateConditionsAction(id: string, conditions: string[]) {
  try {
    await connectDB();
    await Character.findByIdAndUpdate(id, { conditions });
    revalidatePath(`/characters/${id}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}