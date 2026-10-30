/**
 * @agencyos/contracts
 * Canonical shared serializable types, DTOs, and API responses.
 * Safe for both browser bundles and server runtimes (zero secrets, zero db drivers).
 */

// 1. Generic API Envelope
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  requestId?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 2. Organization & User DTOs
export interface OrganizationDTO {
  id: string;
  name: string;
  slug: string;
  plan: "Starter" | "Pro" | "Enterprise";
  credits: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: "Founder" | "Developer" | "GrowthSpecialist" | "Admin";
  organizationId: string;
  avatarInitials: string;
  twoFactorEnabled: boolean;
  createdAt: string;
}

// 3. Lead DTOs
export interface LeadAuditResultsDTO {
  overallScore: number;
  mobileScore: number;
  desktopScore: number;
  seoScore: number;
  speedScore: number;
  cwvScore: number;
  sslScore: number;
  lcp: string;
  cls: string;
  hasContactForm: boolean;
  hasWhatsAppCta: boolean;
  viewportMeta: boolean;
  sslValid: boolean;
  auditedAt: string;
}

export interface LeadDTO {
  id: string;
  organizationId: string;
  slug: string;
  businessName: string;
  category: string;
  rating: number;
  reviewCount: number;
  address: string;
  city: string;
  state: string;
  pincode?: string;
  phone?: string;
  email?: string;
  website?: string;
  status: "New" | "Contacted" | "Interested" | "Replied" | "Converted" | "Archived";
  opportunityScore: number;
  pipelineStage?: string;
  source: string;
  assignedTo?: string;
  estimatedValue?: number;
  auditResults?: LeadAuditResultsDTO;
  createdAt: string;
  updatedAt: string;
}

// 4. Client DTOs
export interface ClientDTO {
  id: string;
  organizationId: string;
  leadId?: string;
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  status: "Active" | "Onboarding" | "Retainer" | "Past";
  monthlyRetainer: number;
  plan: string;
  website?: string;
  activeProjectsCount: number;
  totalPaid: number;
  onboardedAt: string;
  createdAt: string;
  updatedAt: string;
}

// 5. Project DTOs
export interface ProjectTaskDTO {
  id?: string;
  title: string;
  completed: boolean;
  assignedTo: string;
  dueDate?: string;
}

export interface ProjectDTO {
  id: string;
  organizationId: string;
  leadId?: string;
  clientId?: string;
  title: string;
  clientName: string;
  status: "Discovery" | "In Progress" | "Review" | "Delivered";
  budget: number;
  deadline?: string;
  scope: string;
  features: string[];
  tasks: ProjectTaskDTO[];
  createdAt: string;
  updatedAt: string;
}

// 6. AI Agent DTOs
export interface AgentConfigDTO {
  id: string;
  organizationId: string;
  name: string;
  role: string;
  status: "Active" | "Idle" | "Paused";
  dailyTarget: number;
  processedToday: number;
  confidenceThreshold: number;
  model: string;
  lastRunAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentRunLogDTO {
  id: string;
  agentId: string;
  agentName: string;
  action: string;
  target: string;
  status: "Success" | "Warning" | "Failure";
  durationMs: number;
  tokensUsed: number;
  costInr: number;
  timestamp: string;
}

// 7. Outreach DTOs
export interface OutreachCampaignDTO {
  id: string;
  organizationId: string;
  name: string;
  channel: "Email" | "WhatsApp" | "Multi-channel";
  status: "Active" | "Paused" | "Completed" | "Draft";
  leadsTargeted: number;
  sentCount: number;
  openedCount: number;
  repliedCount: number;
  convertedCount: number;
  templateSubject: string;
  dryRunMode: boolean;
  createdAt: string;
  updatedAt: string;
}

// 8. Analytics & Metrics DTOs
export interface DashboardMetricsDTO {
  totalLeads: number;
  activeClients: number;
  monthlyRevenue: number;
  auditPassRate: number;
  growthRate: number;
  conversionRate: number;
  averageDealSize: number;
  activeAgentsCount: number;
}

export interface AnalyticsTimeframeDTO {
  timeframe: "7d" | "30d" | "90d" | "1y";
  totalOutreachSent: number;
  repliesReceived: number;
  meetingsBooked: number;
  closedRevenue: number;
}

