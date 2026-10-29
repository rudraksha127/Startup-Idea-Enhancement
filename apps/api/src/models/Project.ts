import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProjectTask {
  title: string;
  completed: boolean;
  assignedTo: string;
}

export interface IProject extends Document {
  organizationId: mongoose.Types.ObjectId;
  title: string;
  clientName: string;
  status: "Discovery" | "In Progress" | "Delivered" | "Maintenance";
  budget: number;
  deadline: string;
  scope: string;
  features: string[];
  tasks: IProjectTask[];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectTaskSchema = new Schema<IProjectTask>({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  assignedTo: { type: String, default: "Full-Stack Dev" },
});

const ProjectSchema = new Schema<IProject>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    clientName: { type: String, required: true },
    status: {
      type: String,
      enum: ["Discovery", "In Progress", "Delivered", "Maintenance"],
      default: "Discovery",
    },
    budget: { type: Number, default: 50000 },
    deadline: { type: String, default: "30 Apr 2026" },
    scope: { type: String, default: "" },
    features: [{ type: String }],
    tasks: [ProjectTaskSchema],
  },
  { timestamps: true }
);

export const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);

