"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import Campaign from "@/models/Campaign";
import Character from "@/models/Character";

// Fungsi pembantu untuk mengenerate kode acak (misal: "A1B2C3")
const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// --- FUNGSI CREATE CAMPAIGN (Dungeon Master) ---
export async function createCampaignAction(dmEmail: string, name: string, description: string) {
  try {
    await connectDB();
    const inviteCode = generateInviteCode();
    const newCampaign = new Campaign({ dmEmail, name, description, inviteCode });
    await newCampaign.save();
    revalidatePath("/campaigns");
    return { success: true, id: newCampaign._id.toString(), inviteCode };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- FUNGSI JOIN CAMPAIGN (Player) ---
export async function joinCampaignAction(inviteCode: string, characterId: string) {
  try {
    await connectDB();
    const campaign = await Campaign.findOne({ inviteCode });
    if (!campaign) return { success: false, error: "Kode Invite tidak ditemukan!" };

    // Cek apakah karakter valid
    const character = await Character.findById(characterId);
    if (!character) return { success: false, error: "Karakter tidak ditemukan!" };

    // Cek apakah karakter sudah ada di dalam campaign
    if (campaign.characters.includes(characterId)) {
      return { success: false, error: "Karakter ini sudah bergabung di Campaign tersebut!" };
    }

    // Tambahkan karakter ke campaign
    campaign.characters.push(characterId);
    await campaign.save();

    revalidatePath("/campaigns");
    revalidatePath(`/campaigns/${campaign._id}`);
    return { success: true, campaignId: campaign._id.toString() };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- FUNGSI GET CAMPAIGNS (Berdasarkan Email DM atau Karakter) ---
export async function getUserCampaignsAction(userEmail: string) {
  try {
    await connectDB();
    
    // 1. Cari campaign di mana user adalah DM
    const dmCampaigns = await Campaign.find({ dmEmail: userEmail }).lean();
    
    // 2. Cari campaign di mana user bermain sebagai Player
    // Pertama, cari semua ID karakter milik user
    const userCharacters = await Character.find({ userEmail }).select('_id').lean();
    const charIds = userCharacters.map(c => c._id);
    
    // Kedua, cari campaign yang memiliki ID karakter user di dalamnya
    const playerCampaigns = await Campaign.find({ characters: { $in: charIds } })
      .populate('characters', 'name race class level avatarUrl currentHp hpMax') // Populate untuk menampilkan UI ringkas
      .lean();

    return JSON.parse(JSON.stringify({ dmCampaigns, playerCampaigns }));
  } catch (error) {
    console.error("Gagal mengambil data Campaign:", error);
    return { dmCampaigns: [], playerCampaigns: [] };
  }
}

// --- FUNGSI GET CAMPAIGN BY ID (Beserta data detail karakter) ---
export async function getCampaignByIdAction(id: string) {
  try {
    await connectDB();
    const campaign = await Campaign.findById(id).populate('characters').lean();
    if (!campaign) return null;
    return JSON.parse(JSON.stringify(campaign));
  } catch (error) {
    console.error("Gagal mengambil detail Campaign:", error);
    return null;
  }
}

// --- ADVANCED FEATURES ACTIONS ---

export async function sendCampaignMessageAction(campaignId: string, senderName: string, text: string, isRoll: boolean = false) {
  try {
    await connectDB();
    await Campaign.findByIdAndUpdate(campaignId, {
      $push: { chatMessages: { senderName, text, isRoll, createdAt: new Date() } }
    });
    revalidatePath(`/campaigns/${campaignId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateCombatStateAction(campaignId: string, combatState: any) {
  try {
    await connectDB();
    await Campaign.findByIdAndUpdate(campaignId, { combatState });
    revalidatePath(`/campaigns/${campaignId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addSharedItemAction(campaignId: string, item: { id: string, name: string, quantity: number }) {
  try {
    await connectDB();
    await Campaign.findByIdAndUpdate(campaignId, {
      $push: { "sharedInventory.items": item }
    });
    revalidatePath(`/campaigns/${campaignId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateSharedGoldAction(campaignId: string, amount: number) {
  try {
    await connectDB();
    const campaign = await Campaign.findById(campaignId);
    if (campaign) {
      campaign.sharedInventory.gold += amount;
      await campaign.save();
      revalidatePath(`/campaigns/${campaignId}`);
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateAudioStateAction(campaignId: string, audioState: string) {
  try {
    await connectDB();
    await Campaign.findByIdAndUpdate(campaignId, { audioState });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateGridStateAction(campaignId: string, gridState: any) {
  try {
    await connectDB();
    await Campaign.findByIdAndUpdate(campaignId, { gridState });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function claimLootAction(characterId: string, itemName: string) {
  try {
    await connectDB();
    // Cari apakah itu Gold atau Item. Kalau ada kata "Gold" atau "gp"
    if (itemName.toLowerCase().includes("gold") || itemName.toLowerCase().includes("gp")) {
      const match = itemName.match(/\d+/);
      const amount = match ? parseInt(match[0]) : 0;
      if (amount > 0) {
         // Cukup tambahkan gold. Namun Character schema mungkin beda, anggap punya currency.gp
         await Character.findByIdAndUpdate(characterId, { $inc: { "currency.gp": amount } });
      }
    } else {
      // Masukkan ke equipment array
      await Character.findByIdAndUpdate(characterId, { $push: { equipment: itemName } });
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
