import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILeadNote extends Document {
  leadId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  author: string;
  authorRole: string;
  content: string;
  type: "note" | "call" | "email" | "meeting" | "audit";
  createdAt: Date;
  updatedAt: Date;
}

const LeadNoteSchema = new Schema<ILeadNote>(
  {
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    author: { type: String, default: "Rudraksh" },
    authorRole: { type: String, default: "Founder" },
    content: { type: String, required: true },
    type: {
      type: String,
      enum: ["note", "call", "email", "meeting", "audit"],
      default: "note",
    },
  },
  { timestamps: true }
);

export const LeadNote: Model<ILeadNote> =
  mongoose.models.LeadNote || mongoose.model<ILeadNote>("LeadNote", LeadNoteSchema);

