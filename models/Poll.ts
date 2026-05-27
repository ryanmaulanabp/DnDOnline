import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPollOption {
  _id: Types.ObjectId;
  text: string;
  votedBy: string[]; // Menyimpan email atau ID karakter yang memilih opsi ini
}

export interface IPoll extends Document {
  campaignId: Types.ObjectId;
  creatorEmail: string;
  title: string;
  description: string;
  options: IPollOption[];
  settings: {
    multipleChoice: boolean;
    hideResultsUntilClosed: boolean;
  };
  status: 'open' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

const PollOptionSchema = new Schema({
  text: { type: String, required: true },
  votedBy: [{ type: String }] 
});

const PollSchema = new Schema<IPoll>({
  campaignId: { type: Schema.Types.ObjectId, ref: "Campaign", required: true },
  creatorEmail: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  options: [PollOptionSchema],
  settings: { multipleChoice: { type: Boolean, default: false }, hideResultsUntilClosed: { type: Boolean, default: false } },
  status: { type: String, enum: ['open', 'closed'], default: 'open' }
}, { timestamps: true });

PollSchema.index({ campaignId: 1, createdAt: -1 });

const Poll = mongoose.models.Poll || mongoose.model<IPoll>("Poll", PollSchema);
export default Poll;