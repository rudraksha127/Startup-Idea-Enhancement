import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProjectTask {
  title: string;
  completed: boolean;
  assignedTo: string;
  dueDate?: string;
}

export interface IProject extends Document {
  organizationId: mongoose.Types.ObjectId;
  leadId?: mongoose.Types.ObjectId;
  title: string;
  clientName: string;
  status: "Discovery" | "In Progress" | "Review" | "Delivered";
  budget: number;
  deadline?: string;
  scope: string;
  features: string[];
  tasks: IProjectTask[];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", index: true },
    title: { type: String, required: true },
    clientName: { type: String, required: true },
    status: {
      type: String,
      enum: ["Discovery", "In Progress", "Review", "Delivered"],
      default: "Discovery",
      index: true,
    },
    budget: { type: Number, default: 45000 },
    deadline: { type: String, default: "" },
    scope: { type: String, default: "" },
    features: [{ type: String }],
    tasks: [
      {
        title: { type: String, required: true },
        completed: { type: Boolean, default: false },
        assignedTo: { type: String, default: "Dev Team" },
        dueDate: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);

