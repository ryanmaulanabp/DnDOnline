"use server";

import { connectDB } from "@/lib/mongodb";
import { CommunityPost } from "@/models/CommunityPost";
import { z } from "zod";
import { CreateCommunityPostSchema } from "@/lib/validations/schemas";
import { getSessionUser } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function getCommunityPostsAction() {
  try {
    await connectDB();
    const posts = await CommunityPost.find({}).sort({ createdAt: -1 }).limit(20);
    return JSON.parse(JSON.stringify(posts));
  } catch (error: any) {
    logger.error("CommunityAction", "Error fetching community posts", error);
    return [];
  }
}

export async function createCommunityPostAction(data: any) {
  try {
    const sessionUser = await getSessionUser();
    
    // BOLA/IDOR Protection: Paksa authorName dan authorEmail dari session terverifikasi di server
    const securedData = {
      ...data,
      authorName: sessionUser.name || sessionUser.email?.split("@")[0] || "Hero",
      authorEmail: sessionUser.email!.toLowerCase()
    };

    const validatedData = CreateCommunityPostSchema.parse(securedData);
    await connectDB();
    const newPost = new CommunityPost(validatedData);
    await newPost.save();
    return { success: true, post: JSON.parse(JSON.stringify(newPost)) };
  } catch (error: any) {
    logger.error("CommunityAction", "Error creating community post", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Data input tidak valid" };
    }
    return { success: false, error: error.message };
  }
}
