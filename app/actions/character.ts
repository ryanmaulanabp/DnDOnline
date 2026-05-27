"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb"; 
import Character from "@/models/Character";
import Campaign from "@/models/Campaign";
import { z } from "zod";
import { 
  CharacterPayloadSchema, 
  ObjectIdSchema, 
  WeaponSchema 
} from "@/lib/validations/schemas";
import { getSessionUser } from "@/lib/auth";
import { logger } from "@/lib/logger";

export interface CharacterPayload {
  userEmail: string;
  name: string; race: string; class: string; alignment: string; background: string;
  avatarUrl?: string;
  level: number; hpMax: number; currentHp: number; armorClass: number; speed: number;
  initiative: number; stats: { STR: number; DEX: number; CON: number; INT: number; WIS: number; CHA: number; };
  proficientSkills: string[]; equipment: string[]; spells: string[]; features: string[];
  spellCastingStat: string; weapons: any[];
  roleplay: { traits: string; ideals: string; bonds: string; flaws: string; };
  currency: { cp: number; sp: number; ep: number; gp: number; pp: number; };
  conditions: string[];
}

// --- FUNGSI AMBIL DATA BERDASARKAN ID ---
export async function getCharacterById(id: string) {
  try {
    const validatedId = ObjectIdSchema.parse(id);
    await connectDB();
    const character = await Character.findById(validatedId).lean();
    if (!character) return null;
    
    return JSON.parse(JSON.stringify(character));
  } catch (error: any) {
    logger.error("CharacterAction", "Gagal mengambil data karakter", error);
    return null;
  }
}

// --- FUNGSI AMBIL DATA BERDASARKAN AKUN (EMAIL) ---
export async function getCharactersByUserAction(email: string) {
  try {
    const sessionUser = await getSessionUser();
    const validatedEmail = z.string().email("Format email salah").parse(email);

    // BOLA/IDOR Protection: Pastikan email yang dicari adalah email session user
    if (validatedEmail.toLowerCase() !== sessionUser.email?.toLowerCase()) {
      throw new Error("Unauthorized: Anda tidak berhak melihat daftar karakter pemain lain.");
    }

    await connectDB();
    const characters = await Character.find({ userEmail: validatedEmail.toLowerCase() }).lean();
    return JSON.parse(JSON.stringify(characters));
  } catch (error: any) {
    logger.error("CharacterAction", "Gagal mengambil data karakter player", error);
    return [];
  }
}

// --- FUNGSI CREATE ---
export async function createCharacterAction(payload: CharacterPayload) {
  try {
    const sessionUser = await getSessionUser();
    
    // BOLA Protection: Paksa userEmail menggunakan email session terotentikasi dari server
    const securedPayload = {
      ...payload,
      userEmail: sessionUser.email!.toLowerCase()
    };

    const validatedPayload = CharacterPayloadSchema.parse(securedPayload);
    await connectDB();
    const newChar = new Character(validatedPayload);
    await newChar.save();
    revalidatePath("/");
    return { success: true, id: newChar._id.toString() };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Payload tidak valid" };
    }
    return { success: false, error: error.message };
  }
}

// --- FUNGSI UPDATE HP ---
export async function updateCharacterHpAction(id: string, newHp: number) {
  try {
    const sessionUser = await getSessionUser();
    const validatedId = ObjectIdSchema.parse(id);
    const validatedHp = z.number().int().min(0, "HP tidak boleh negatif").parse(newHp);
    
    await connectDB();
    
    // Otorisasi: Pemilik karakter ATAU Dungeon Master dari campaign tempat karakter terdaftar
    const character = await Character.findById(validatedId);
    if (!character) {
      return { success: false, error: "Karakter tidak ditemukan" };
    }

    const isOwner = character.userEmail.toLowerCase() === sessionUser.email?.toLowerCase();
    let isDM = false;

    if (!isOwner) {
      const activeCampaign = await Campaign.findOne({
        characters: validatedId,
        dmEmail: sessionUser.email?.toLowerCase()
      });
      if (activeCampaign) {
        isDM = true;
      }
    }

    if (!isOwner && !isDM) {
      return { success: false, error: "Unauthorized: Anda tidak berhak mengubah HP karakter ini." };
    }

    await Character.findByIdAndUpdate(validatedId, { currentHp: validatedHp });
    revalidatePath(`/characters/${validatedId}`);
    return { success: true };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Data tidak valid" };
    }
    return { success: false, error: error.message };
  }
}

// --- FUNGSI UPDATE AVATAR ---
export async function updateCharacterAvatarAction(id: string, newAvatarUrl: string) {
  try {
    const sessionUser = await getSessionUser();
    const validatedId = ObjectIdSchema.parse(id);
    const validatedUrl = z.string().url("Format URL avatar tidak valid").parse(newAvatarUrl);
    
    await connectDB();

    // Otorisasi: Hanya pemilik karakter yang boleh mengganti avatar
    const character = await Character.findById(validatedId);
    if (!character) return { success: false, error: "Karakter tidak ditemukan" };
    if (character.userEmail.toLowerCase() !== sessionUser.email?.toLowerCase()) {
      return { success: false, error: "Unauthorized: Anda tidak berhak mengubah avatar karakter ini." };
    }
    
    await Character.findByIdAndUpdate(validatedId, { avatarUrl: validatedUrl }, { strict: false });
    revalidatePath(`/characters/${validatedId}`);
    revalidatePath("/"); 
    return { success: true };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Data tidak valid" };
    }
    return { success: false, error: error.message };
  }
}

// --- FUNGSI UPDATE WEAPONS ---
export async function updateWeaponsAction(id: string, weapons: any[]) {
  try {
    const sessionUser = await getSessionUser();
    const validatedId = ObjectIdSchema.parse(id);
    const validatedWeapons = z.array(WeaponSchema).parse(weapons);
    
    await connectDB();

    // Otorisasi: Hanya pemilik karakter yang boleh memodifikasi senjata
    const character = await Character.findById(validatedId);
    if (!character) return { success: false, error: "Karakter tidak ditemukan" };
    if (character.userEmail.toLowerCase() !== sessionUser.email?.toLowerCase()) {
      return { success: false, error: "Unauthorized: Anda tidak berhak memodifikasi senjata karakter ini." };
    }
    
    await Character.findByIdAndUpdate(validatedId, { weapons: validatedWeapons });
    revalidatePath(`/characters/${validatedId}`);
    return { success: true };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Data senjata tidak valid" };
    }
    return { success: false, error: error.message };
  }
}

// --- FUNGSI LEVEL UP ---
export async function levelUpAction(id: string, newLevel: number, hpIncrease: number) {
  try {
    const sessionUser = await getSessionUser();
    const validatedId = ObjectIdSchema.parse(id);
    const validatedLevel = z.number().int().min(1).max(20).parse(newLevel);
    const validatedHpIncrease = z.number().int().min(1, "Pertambahan HP minimal 1").parse(hpIncrease);
    
    await connectDB();

    // Otorisasi: Hanya pemilik karakter yang boleh menaikkan level
    const character = await Character.findById(validatedId);
    if (!character) return { success: false, error: "Karakter tidak ditemukan" };
    if (character.userEmail.toLowerCase() !== sessionUser.email?.toLowerCase()) {
      return { success: false, error: "Unauthorized: Anda tidak berhak melakukan level-up pada karakter ini." };
    }
    
    const updatedHpMax = character.hpMax + validatedHpIncrease;
    await Character.findByIdAndUpdate(validatedId, { 
      level: validatedLevel, hpMax: updatedHpMax, currentHp: updatedHpMax 
    });
    revalidatePath(`/characters/${validatedId}`);
    return { success: true };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Data tidak valid" };
    }
    return { success: false, error: error.message };
  }
}

// --- FUNGSI UPDATE CONDITIONS ---
export async function updateConditionsAction(id: string, conditions: string[]) {
  try {
    const sessionUser = await getSessionUser();
    const validatedId = ObjectIdSchema.parse(id);
    const validatedConditions = z.array(z.string()).parse(conditions);
    
    await connectDB();

    // Otorisasi: Pemilik karakter ATAU Dungeon Master dari campaign tempat karakter terdaftar
    const character = await Character.findById(validatedId);
    if (!character) return { success: false, error: "Karakter tidak ditemukan" };

    const isOwner = character.userEmail.toLowerCase() === sessionUser.email?.toLowerCase();
    let isDM = false;

    if (!isOwner) {
      const activeCampaign = await Campaign.findOne({
        characters: validatedId,
        dmEmail: sessionUser.email?.toLowerCase()
      });
      if (activeCampaign) {
        isDM = true;
      }
    }

    if (!isOwner && !isDM) {
      return { success: false, error: "Unauthorized: Anda tidak berhak memodifikasi status kondisi karakter ini." };
    }
    
    await Character.findByIdAndUpdate(validatedId, { conditions: validatedConditions });
    revalidatePath(`/characters/${validatedId}`);
    return { success: true };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Data tidak valid" };
    }
    return { success: false, error: error.message };
  }
}

// --- FUNGSI HAPUS KARAKTER ---
export async function deleteCharacterAction(id: string) {
  try {
    const sessionUser = await getSessionUser();
    const validatedId = ObjectIdSchema.parse(id);
    await connectDB();

    // Otorisasi: Hanya pemilik karakter yang boleh menghapus karakter
    const character = await Character.findById(validatedId);
    if (!character) return { success: false, error: "Karakter tidak ditemukan" };
    if (character.userEmail.toLowerCase() !== sessionUser.email?.toLowerCase()) {
      return { success: false, error: "Unauthorized: Anda tidak berhak menghapus karakter ini." };
    }
    
    await Character.findByIdAndDelete(validatedId);
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "ID tidak valid" };
    }
    return { success: false, error: error.message };
  }
}