/**
 * Zoho Catalyst CloudScale Data Store Entity Types
 */

export interface OrganizationRecord {
  ROWID?: string;
  orgId: string;
  name: string;
  slug: string;
  plan: string;
  credits: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserRecord {
  ROWID?: string;
  userId: string;
  organizationId: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "owner" | "admin" | "pm" | "specialist" | "viewer" | "member" | "Founder" | "Admin" | "Operator" | "Developer" | string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadRecord {
  ROWID?: string;
  leadId: string;
  organizationId: string;
  businessName: string;
  category: string;
  address?: string;
  city?: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  opportunityScore?: number;
  qualificationStatus: "New" | "Contacted" | "Qualified" | "Proposal" | "Converted" | "Disqualified";
  source: string;
  sourceAttribution?: string;
  googlePlaceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadAuditRecord {
  ROWID?: string;
  auditId: string;
  leadId: string;
  organizationId: string;
  performanceScore: number;
  seoScore: number;
  accessibilityScore: number;
  mobileScore: number;
  detectedTech?: string;
  issuesJson?: string;
  createdAt: string;
}

export interface LeadNoteRecord {
  ROWID?: string;
  noteId: string;
  leadId: string;
  organizationId: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface CampaignRecord {
  ROWID?: string;
  campaignId: string;
  organizationId: string;
  name: string;
  service: string;
  channel: "Email" | "WhatsApp" | "Multi-channel";
  audience: string;
  status: "Draft" | "Pending_Approval" | "Active" | "Paused" | "Completed";
  sentCount: number;
  openRate: number;
  replyRate: number;
  meetingCount: number;
  leadsTargeted?: number;
  openedCount?: number;
  repliedCount?: number;
  convertedCount?: number;
  templateSubject?: string;
  dryRunMode?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OutreachMessageRecord {
  ROWID?: string;
  messageId: string;
  campaignId: string;
  leadId: string;
  organizationId: string;
  channel: string;
  subject: string;
  body: string;
  status: "Draft" | "Pending_Approval" | "Queued" | "Sent" | "Failed" | "Replied";
  sentAt?: string;
  createdAt: string;
}

export interface ReplyRecord {
  ROWID?: string;
  replyId: string;
  leadId: string;
  organizationId: string;
  sender: string;
  body: string;
  intent: "POSITIVE_LEAD" | "INFORMATION_REQUEST" | "OBJECTION" | "NOT_INTERESTED" | "OUT_OF_OFFICE";
  sentiment: "Positive" | "Neutral" | "Negative";
  status: "Unread" | "Reviewed" | "Actioned";
  receivedAt: string;
}

export interface MeetingRecord {
  ROWID?: string;
  meetingId: string;
  leadId: string;
  organizationId: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  meetLink?: string;
  status: "Scheduled" | "Completed" | "Cancelled";
  attendeesJson?: string;
  createdAt: string;
}

export interface ProposalRecord {
  ROWID?: string;
  proposalId: string;
  leadId: string;
  organizationId: string;
  title: string;
  totalAmount: number;
  currency: string;
  milestonesJson?: string;
  deliverablesJson?: string;
  status: "Draft" | "Pending_Review" | "Approved" | "Signed" | "Rejected";
  createdAt: string;
}

export interface ClientRecord {
  ROWID?: string;
  clientId: string;
  organizationId: string;
  name: string;
  domain?: string;
  type?: string;
  location?: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
  status: "Active" | "Onboarding" | "Completed" | "Archived";
  totalValue: number;
  projectsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectRecord {
  ROWID?: string;
  projectId: string;
  clientId: string;
  clientName?: string;
  organizationId: string;
  name: string;
  subtitle?: string;
  type: string;
  status: "Active" | "Completed" | "On Hold" | "Cancelled";
  budget: number;
  amountPaid: number;
  amountDue: number;
  progress: number;
  deadline?: string;
  milestonesJson?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskRecord {
  ROWID?: string;
  taskId: string;
  projectId: string;
  organizationId: string;
  title: string;
  status: "Todo" | "In Progress" | "Review" | "Done";
  priority: "Low" | "Medium" | "High" | "Urgent";
  assignee?: string;
  dueDate?: string;
  createdAt: string;
}

export interface TemplateRecord {
  ROWID?: string;
  templateId: string;
  name: string;
  category: string;
  categoryBadge?: string;
  previewImage?: string;
  description?: string;
  basePrice: number;
  rating?: number;
  usesCount?: number;
  tagsJson?: string;
  featuresJson?: string;
  variationsJson?: string;
  createdAt: string;
}

export interface InvoiceRecord {
  ROWID?: string;
  invoiceId: string;
  organizationId: string;
  clientId: string;
  clientName?: string;
  projectTitle?: string;
  invoiceNumber?: string;
  paymentMethod?: string;
  stripeInvoiceId?: string;
  amount: number;
  currency: string;
  status: "Draft" | "Pending" | "Paid" | "Overdue" | "Cancelled";
  dueDate?: string;
  paidAt?: string;
  createdAt: string;
}

export interface AgentConfigRecord {
  ROWID?: string;
  configId: string;
  agentId: string;
  name: string;
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  isEnabled: boolean;
  updatedAt: string;
}

export interface AgentExecutionRecord {
  ROWID?: string;
  executionId: string;
  agentId: string;
  organizationId: string;
  status: "RUNNING" | "COMPLETED" | "FAILED" | "PAUSED";
  inputJson: string;
  outputJson?: string;
  tokenCount: number;
  latencyMs: number;
  createdAt: string;
}

export interface AuditLogRecord {
  ROWID?: string;
  auditId: string;
  organizationId: string;
  userId?: string;
  action: string;
  resource: string;
  ip?: string;
  userAgent?: string;
  metadataJson?: string;
  createdAt: string;
}
