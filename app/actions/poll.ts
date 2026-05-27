"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import Poll from "@/models/Poll";
import Campaign from "@/models/Campaign";
import { z } from "zod";
import { 
  CreatePollSchema, 
  VotePollSchema, 
  ObjectIdSchema 
} from "@/lib/validations/schemas";
import { getSessionUser } from "@/lib/auth";
import { logger } from "@/lib/logger";

// Helper internal untuk memeriksa kepesertaan kampanye
async function validateCampaignMembership(campaignId: string, email: string) {
  const campaign = await Campaign.findById(campaignId).populate('characters');
  if (!campaign) throw new Error("Campaign tidak ditemukan.");

  const lowercaseEmail = email.toLowerCase();
  const isDM = campaign.dmEmail.toLowerCase() === lowercaseEmail;
  const isPlayer = campaign.characters?.some(
    (c: any) => c.userEmail?.toLowerCase() === lowercaseEmail
  );

  if (!isDM && !isPlayer && campaign.dmEmail !== "ai-dm@dnd-online.com") {
    throw new Error("Unauthorized: Anda bukan peserta dalam kampanye ini.");
  }

  return campaign;
}

export async function createPollAction(data: any) {
  try {
    const sessionUser = await getSessionUser();
    const validatedData = CreatePollSchema.parse(data);
    
    await connectDB();

    // Otorisasi: Pastikan pembuat adalah bagian dari campaign
    await validateCampaignMembership(validatedData.campaignId, sessionUser.email!);

    const newPoll = new Poll(validatedData);
    await newPoll.save();
    revalidatePath(`/campaigns/${validatedData.campaignId}`);
    return { success: true, pollId: newPoll._id.toString() };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Data input tidak valid" };
    }
    return { success: false, error: error.message };
  }
}

export async function votePollAction(pollId: string, optionIds: string[], userEmail: string, campaignId: string) {
  try {
    const sessionUser = await getSessionUser();
    
    // BOLA/IDOR Protection: Abaikan userEmail dari client, gunakan email session terverifikasi
    const validatedData = VotePollSchema.parse({
      pollId,
      optionIds,
      userEmail: sessionUser.email!.toLowerCase(),
      campaignId
    });
    
    await connectDB();

    // Otorisasi: Pastikan pemilih adalah bagian dari campaign
    await validateCampaignMembership(validatedData.campaignId, sessionUser.email!);

    const poll = await Poll.findById(validatedData.pollId);
    if (!poll) return { success: false, error: "Polling tidak ditemukan!" };
    if (poll.status === 'closed') return { success: false, error: "Polling sudah ditutup!" };

    // 1. Bersihkan vote sebelumnya dari user ini (Reset)
    poll.options.forEach((opt: any) => {
      opt.votedBy = opt.votedBy.filter((email: string) => email !== validatedData.userEmail);
    });

    // 2. Tambahkan vote baru
    poll.options.forEach((opt: any) => {
      if (validatedData.optionIds.includes(opt._id.toString())) opt.votedBy.push(validatedData.userEmail);
    });

    await poll.save();
    revalidatePath(`/campaigns/${validatedData.campaignId}`);
    return { success: true };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Data input tidak valid" };
    }
    return { success: false, error: error.message };
  }
}

export async function closePollAction(pollId: string, campaignId: string) {
  try {
    const sessionUser = await getSessionUser();
    const validatedPollId = ObjectIdSchema.parse(pollId);
    const validatedCampaignId = ObjectIdSchema.parse(campaignId);
    
    await connectDB();

    // Otorisasi: Hanya Dungeon Master (DM) pembuat kampanye yang boleh menutup polling
    const campaign = await Campaign.findById(validatedCampaignId);
    if (!campaign) return { success: false, error: "Campaign tidak ditemukan!" };
    if (campaign.dmEmail.toLowerCase() !== sessionUser.email?.toLowerCase()) {
      return { success: false, error: "Unauthorized: Hanya Dungeon Master yang dapat menutup polling." };
    }
    
    await Poll.findByIdAndUpdate(validatedPollId, { status: 'closed' });
    revalidatePath(`/campaigns/${validatedCampaignId}`);
    return { success: true };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "ID tidak valid" };
    }
    return { success: false, error: error.message };
  }
}

export async function getPollsByCampaignAction(campaignId: string) {
  try {
    const sessionUser = await getSessionUser();
    const validatedCampaignId = ObjectIdSchema.parse(campaignId);
    
    await connectDB();

    // Otorisasi: Pastikan pencari adalah bagian dari campaign
    await validateCampaignMembership(validatedCampaignId.toString(), sessionUser.email!);

    const polls = await Poll.find({ campaignId: validatedCampaignId }).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(polls));
  } catch (error: any) {
    logger.error("PollAction", "Gagal mengambil polls", error);
    return [];
  }
}