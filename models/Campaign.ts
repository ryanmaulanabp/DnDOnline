import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICampaign extends Document {
  name: string;
  description: string;
  dmEmail: string; // Email akun Dungeon Master
  characters: Types.ObjectId[]; // Referensi ke ID Karakter pemain yang bergabung
  inviteCode: string; // Kode unik untuk invite pemain
  
  // Advanced Features
  chatMessages: { senderName: string; text: string; isRoll: boolean; createdAt: Date }[];
  combatState: {
    isActive: boolean;
    round: number;
    turnIndex: number;
    participants: {
      id: string;
      name: string;
      initiative: number;
      hp: number;
      maxHp: number;
      ac: number;
      action: number;
      bonusAction: number;
      reaction: number;
      speed: number;
      isMonster: boolean;
    }[];
  };
  sharedInventory: {
    gold: number;
    items: { id: string; name: string; quantity: number }[];
  };
  audioState: string; // URL or ID of the audio track playing
  gridState: {
    bgUrl: string;
    weather: string;
    tokens: { id: string; x: number; y: number; img: string; name: string; isMonster: boolean }[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema = new Schema<ICampaign>(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    dmEmail: { type: String, required: true },
    // Kita me-referensikan model "Character" yang sudah Anda buat sebelumnya
    characters: [{ type: Schema.Types.ObjectId, ref: "Character" }],
    inviteCode: { type: String, required: true, unique: true },

    // Advanced Features Schemas
    chatMessages: [{
      senderName: { type: String },
      text: { type: String },
      isRoll: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }],
    combatState: {
      isActive: { type: Boolean, default: false },
      round: { type: Number, default: 1 },
      turnIndex: { type: Number, default: 0 },
      participants: [{
        id: { type: String },
        name: { type: String },
        initiative: { type: Number, default: 0 },
        hp: { type: Number, default: 0 },
        maxHp: { type: Number, default: 0 },
        ac: { type: Number, default: 10 },
        action: { type: Number, default: 1 },
        bonusAction: { type: Number, default: 1 },
        reaction: { type: Number, default: 1 },
        speed: { type: Number, default: 30 },
        isMonster: { type: Boolean, default: false }
      }]
    },
    sharedInventory: {
      gold: { type: Number, default: 0 },
      items: [{
        id: { type: String },
        name: { type: String },
        quantity: { type: Number, default: 1 }
      }]
    },
    audioState: { type: String, default: "none" },
    gridState: {
      bgUrl: { type: String, default: "" },
      weather: { type: String, default: "none" },
      tokens: [{
        id: { type: String },
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
        img: { type: String },
        name: { type: String },
        isMonster: { type: Boolean, default: false }
      }]
    }
  },
  { timestamps: true }
);

const Campaign = mongoose.models.Campaign || mongoose.model<ICampaign>("Campaign", CampaignSchema);

export default Campaign;