export type TenantRole = "Founder" | "Admin" | "Operator" | "Developer";
export type LeadStatus = "New" | "Contacted" | "Meeting Booked" | "Proposal Sent" | "Closed Won" | "Lost";
export type InvoiceStatus = "Draft" | "Pending" | "Paid" | "Overdue";
export type AgentExecutionStatus = "Running" | "Completed" | "Failed" | "Paused" | "Awaiting_Approval";
export type WorkflowTriggerType = "webhook" | "scheduled" | "cron" | "manual";

export interface TenantContext {
  organizationId: string;
  userId: string;
  role: TenantRole;
}
