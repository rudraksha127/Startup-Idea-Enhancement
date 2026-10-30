import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInvoice extends Document {
  organizationId: mongoose.Types.ObjectId;
  invoiceNumber: string;
  clientName: string;
  projectTitle: string;
  amount: number;
  currency: string;
  status: "Paid" | "Pending" | "Overdue" | "Draft" | "Cancelled";
  dueDate: string;
  paidAt?: Date;
  paymentMethod?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    invoiceNumber: { type: String, required: true },
    clientName: { type: String, required: true },
    projectTitle: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["Paid", "Pending", "Overdue", "Draft", "Cancelled"],
      default: "Pending",
      index: true,
    },
    dueDate: { type: String, required: true },
    paidAt: { type: Date },
    paymentMethod: { type: String, default: "Bank Transfer" },
    notes: { type: String },
  },
  { timestamps: true }
);

InvoiceSchema.index({ organizationId: 1, invoiceNumber: 1 }, { unique: true });

export const Invoice: Model<IInvoice> =
  mongoose.models.Invoice || mongoose.model<IInvoice>("Invoice", InvoiceSchema);

