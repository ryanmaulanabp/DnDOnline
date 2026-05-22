"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import Poll from "@/models/Poll";

export async function createPollAction(data: any) {
  try {
    await connectDB();
    const newPoll = new Poll(data);
    await newPoll.save();
    revalidatePath(`/campaigns/${data.campaignId}`);
    return { success: true, pollId: newPoll._id.toString() };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function votePollAction(pollId: string, optionIds: string[], userEmail: string, campaignId: string) {
  try {
    await connectDB();
    const poll = await Poll.findById(pollId);
    if (!poll) return { success: false, error: "Polling tidak ditemukan!" };
    if (poll.status === 'closed') return { success: false, error: "Polling sudah ditutup!" };

    // 1. Bersihkan vote sebelumnya dari user ini (Reset)
    poll.options.forEach((opt: any) => {
      opt.votedBy = opt.votedBy.filter((email: string) => email !== userEmail);
    });

    // 2. Tambahkan vote baru
    poll.options.forEach((opt: any) => {
      if (optionIds.includes(opt._id.toString())) opt.votedBy.push(userEmail);
    });

    await poll.save();
    revalidatePath(`/campaigns/${campaignId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function closePollAction(pollId: string, campaignId: string) {
  try {
    await connectDB();
    await Poll.findByIdAndUpdate(pollId, { status: 'closed' });
    revalidatePath(`/campaigns/${campaignId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getPollsByCampaignAction(campaignId: string) {
  try {
    await connectDB();
    const polls = await Poll.find({ campaignId }).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(polls));
  } catch (error) {
    console.error("Gagal mengambil polls:", error);
    return [];
  }
}