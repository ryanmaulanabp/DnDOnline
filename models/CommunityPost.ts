import mongoose, { Schema, model, models } from 'mongoose';

const CommunityPostSchema = new Schema({
  type: { type: String, required: true }, // "LFG", "QUEST", "DISCUSSION"
  title: { type: String, required: true },
  author: { type: String, required: true },
  role: { type: String, default: "Player" },
  slots: { type: String, default: "" },
  desc: { type: String, required: true },
  tags: { type: [String], default: [] },
  color: { type: String, default: "amber" },
}, { timestamps: true });

export const CommunityPost = models.CommunityPost || model('CommunityPost', CommunityPostSchema);
