"use server";

import { connectDB } from "@/lib/mongodb";
import { CommunityPost } from "@/models/CommunityPost";

export async function getCommunityPostsAction() {
  try {
    await connectDB();
    const posts = await CommunityPost.find({}).sort({ createdAt: -1 }).limit(20);
    return JSON.parse(JSON.stringify(posts));
  } catch (error: any) {
    console.error("Error fetching community posts:", error);
    return [];
  }
}

export async function createCommunityPostAction(data: any) {
  try {
    await connectDB();
    const newPost = new CommunityPost(data);
    await newPost.save();
    return { success: true, post: JSON.parse(JSON.stringify(newPost)) };
  } catch (error: any) {
    console.error("Error creating community post:", error);
    return { success: false, error: error.message };
  }
}
