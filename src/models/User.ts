import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: "Founder" | "Admin" | "Member";
  organizationId: mongoose.Types.ObjectId;
  avatarInitials: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["Founder", "Admin", "Member"], default: "Founder" },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    avatarInitials: { type: String, default: "RU" },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

