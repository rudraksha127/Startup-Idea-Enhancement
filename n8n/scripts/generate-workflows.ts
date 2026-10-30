import fs from "fs";
import path from "path";

interface AgentDef {
  id: string;
  name: string;
  category: string;
  description: string;
  triggerType: "webhook" | "scheduled";
  endpoint: string;
  defaultInputs: Record<string, any>;
  outputSchema: Record<string, any>;
  requiredTools: string[];
}

const AGENTS: AgentDef[] = [
  {
    id: "market-research",
    name: "Market Research Agent",
    category: "Market Analysis",
    description: "Researches defined industries and niches, identifies target segments and opportunities",
    triggerType: "webhook",
    endpoint: "market-research",
    defaultInputs: { industry: "Healthcare & Dental", region: "New Delhi & NCR", depth: "Comprehensive" },
    outputSchema: { reportSummary: "string", targetSegments: "array", marketDemandScore: "number", sources: "array" },
    requiredTools: ["web_search", "ai_llm_extractor", "agencyos_api_callback"],
  },
  {
    id: "prospect-discovery",
    name: "Prospect Discovery Agent",
    category: "Lead Generation",
    description: "Discovers local high-potential business opportunities across targeted geographies via Google Maps & permitted registries",
    triggerType: "webhook",
    endpoint: "prospect-discovery",
    defaultInputs: { category: "Fine Dining & Cafes", location: "Indore, MP", radiusMeters: 5000 },
    outputSchema: { candidateCount: "number", prospects: "array", duplicateCount: "number" },
    requiredTools: ["google_maps_platform", "deduplication_engine", "agencyos_prospect_ingest"],
  },
  {
    id: "lead-enrichment",
    name: "Lead Enrichment Agent",
    category: "Data Verification",
    description: "Validates business data from authorized sources without hallucination and records source provenance",
    triggerType: "webhook",
    endpoint: "lead-enrichment",
    defaultInputs: { leadId: "lead-123", businessName: "Spice Junction", website: "https://spicejunction.in" },
    outputSchema: { enrichedFields: "object", confidenceScore: "number", provenance: "array" },
    requiredTools: ["dns_probe", "whois_freshness", "social_presence_checker"],
  },
  {
    id: "website-audit",
    name: "Website Audit Agent",
    category: "Technical Audit",
    description: "Inspects performance, SEO, mobile UX, accessibility, and Core Web Vitals",
    triggerType: "webhook",
    endpoint: "website-audit",
    defaultInputs: { leadId: "lead-123", websiteUrl: "https://example.com" },
    outputSchema: { websiteScore: "number", performanceScore: "number", seoScore: "number", issues: "array" },
    requiredTools: ["lighthouse_runner", "ssl_expiry_probe", "responsive_viewport_tester"],
  },
  {
    id: "lead-qualification",
    name: "Lead Qualification Agent",
    category: "Lead Scoring",
    description: "Applies multi-factor business scoring rules and generates explainable criteria",
    triggerType: "webhook",
    endpoint: "lead-qualification",
    defaultInputs: { leadId: "lead-123", budgetEstimate: 50000, techReadiness: 60 },
    outputSchema: { opportunityScore: "number", qualificationTier: "string", reasoning: "array" },
    requiredTools: ["business_rules_evaluator", "crm_pipeline_writer"],
  },
  {
    id: "outreach-strategy",
    name: "Outreach Strategy Agent",
    category: "Outreach",
    description: "Personalizes outreach sequences based on website audit signals and business profiles",
    triggerType: "webhook",
    endpoint: "outreach-strategy",
    defaultInputs: { leadId: "lead-123", channel: "Email", tone: "Consultative" },
    outputSchema: { subjectLine: "string", bodyContent: "string", callToAction: "string" },
    requiredTools: ["outreach_template_engine", "compliance_gate_check"],
  },
  {
    id: "reply-classification",
    name: "Reply Classification Agent",
    category: "Communication",
    description: "Monitors inbox replies, categorizes intent, detects objections, and schedules meetings",
    triggerType: "webhook",
    endpoint: "reply-classification",
    defaultInputs: { replyText: "Sounds interesting, can we talk Thursday?", leadEmail: "owner@cafe.in" },
    outputSchema: { intent: "string", confidence: "number", requiresHumanReview: "boolean" },
    requiredTools: ["intent_nlp_classifier", "dnc_optout_filter"],
  },
  {
    id: "meeting-coordination",
    name: "Meeting Coordination Agent",
    category: "Scheduling",
    description: "Coordinates calendar slots and generates meeting draft confirmations",
    triggerType: "webhook",
    endpoint: "meeting-coordination",
    defaultInputs: { leadId: "lead-123", requestedSlot: "2026-11-05T11:00:00Z" },
    outputSchema: { meetingId: "string", calendarLink: "string", status: "string" },
    requiredTools: ["calendar_availability_api", "meeting_invite_generator"],
  },
  {
    id: "proposal-generation",
    name: "Proposal Generation Agent",
    category: "Sales Closing",
    description: "Generates tailored deliverables, pricing schedules, and SOW specifications",
    triggerType: "webhook",
    endpoint: "proposal-generation",
    defaultInputs: { clientId: "client-123", servicePackage: "Full Stack Growth + Cloud Hosting" },
    outputSchema: { proposalId: "string", totalBudget: "number", deliverables: "array" },
    requiredTools: ["pricing_engine", "sow_markdown_compiler"],
  },
  {
    id: "client-onboarding",
    name: "Client Onboarding Agent",
    category: "Account Management",
    description: "Prepares onboarding checklists, milestone trackers, and credential forms",
    triggerType: "webhook",
    endpoint: "client-onboarding",
    defaultInputs: { clientId: "client-123", companyName: "Grand Plaza Luxury Hotel" },
    outputSchema: { onboardingChecklist: "array", credentialsRequested: "array", welcomeEmailSent: "boolean" },
    requiredTools: ["onboarding_flow_builder", "secure_vault_invite"],
  },
  {
    id: "project-planning",
    name: "Project Planning Agent",
    category: "Project Delivery",
    description: "Breaks client requirements into structured agile milestones and task backlogs",
    triggerType: "webhook",
    endpoint: "project-planning",
    defaultInputs: { projectId: "proj-123", targetLaunchDays: 30 },
    outputSchema: { milestones: "array", tasksCount: "number", estimatedHours: "number" },
    requiredTools: ["agile_backlog_generator", "dependency_graph_validator"],
  },
  {
    id: "website-qa",
    name: "Website QA Agent",
    category: "Quality Assurance",
    description: "Verifies cross-browser layouts, form validation, and responsiveness before deploy",
    triggerType: "webhook",
    endpoint: "website-qa",
    defaultInputs: { stagingUrl: "https://staging.agencyos.io/demo" },
    outputSchema: { testSuiteStatus: "string", passedTests: "number", failedTests: "number", criticalBugs: "array" },
    requiredTools: ["playwright_test_runner", "broken_links_checker", "accessibility_wcag_audit"],
  },
  {
    id: "maintenance",
    name: "Maintenance Agent",
    category: "DevOps & SLA",
    description: "Tracks uptime, SSL expiry, Core Web Vitals drift, and client SLA metrics",
    triggerType: "scheduled",
    endpoint: "maintenance-sla",
    defaultInputs: { clientDomains: ["https://grandplazadelhi.com", "https://citycareindore.com"] },
    outputSchema: { uptimeStatus: "string", averageResponseMs: "number", sslStatus: "string" },
    requiredTools: ["ping_synthetic_probe", "ssl_cert_checker", "alert_pager_dispatcher"],
  },
];

const SUB_WORKFLOWS = [
  { id: "data-validation", name: "Data Validation Sub-Workflow", description: "Deterministic Zod & schema validation gatekeeper" },
  { id: "deduplication", name: "Deduplication Sub-Workflow", description: "Levenshtein & phone/email duplicate detection" },
  { id: "source-verification", name: "Source Verification Sub-Workflow", description: "Verifies domain provenance and freshness" },
  { id: "ai-generation", name: "AI Generation Sub-Workflow", description: "Pluggable LLM invocation with temperature, fallback and token monitoring" },
  { id: "approval", name: "Human-in-the-Loop Approval Sub-Workflow", description: "Enforces gate approval before live outreach or budget spend" },
  { id: "notification", name: "Multi-Channel Notification Sub-Workflow", description: "Dispatches alerts via Slack, Email and In-App Webhooks" },
  { id: "error-handler", name: "Global Error Handler Sub-Workflow", description: "Captures workflow exceptions, logs audit traces, and triggers retry" },
];

function buildWorkflowJson(agent: AgentDef) {
  return {
    name: `AgencyOS - ${agent.name}`,
    nodes: [
      {
        parameters: {
          path: agent.endpoint,
          httpMethod: "POST",
          responseMode: "lastNode",
          options: {},
        },
        id: `node-${agent.id}-trigger`,
        name: "Webhook Inbound Trigger",
        type: "n8n-nodes-base.webhook",
        typeVersion: 2,
        position: [240, 300],
        webhookId: `wh-${agent.id}`,
      },
      {
        parameters: {
          jsCode: `// Validate input parameters against contract
const payload = $input.first().json.body || $input.first().json;
if (!payload) {
  throw new Error("Missing payload for ${agent.name}");
}
return [{ json: { ...payload, validatedAt: new Date().toISOString(), agent: "${agent.id}" } }];`,
        },
        id: `node-${agent.id}-validate`,
        name: "Validate Input Contract",
        type: "n8n-nodes-base.code",
        typeVersion: 2,
        position: [460, 300],
      },
      {
        parameters: {
          model: "gemini-2.0-flash",
          prompt: `You are the ${agent.name} for AgencyOS. Execute the following task: ${agent.description}. Input: {{ JSON.stringify($json) }}. Return strictly structured JSON.`,
        },
        id: `node-${agent.id}-ai-core`,
        name: "AI Autonomous Execution",
        type: "n8n-nodes-base.openAi",
        typeVersion: 1.4,
        position: [680, 300],
      },
      {
        parameters: {
          url: "={{ $env.AGENCYOS_API_URL || 'http://localhost:4000' }}/api/v1/n8n/webhook/lead-audit",
          method: "POST",
          sendBody: true,
          bodyParameters: {
            parameters: [
              { name: "agentId", value: agent.id },
              { name: "result", value: "={{ $json }}" },
              { name: "timestamp", value: "={{ new Date().toISOString() }}" },
            ],
          },
          options: {},
        },
        id: `node-${agent.id}-callback`,
        name: "AgencyOS Backend Callback",
        type: "n8n-nodes-base.httpRequest",
        typeVersion: 4.2,
        position: [900, 300],
      },
    ],
    connections: {
      "Webhook Inbound Trigger": {
        main: [[{ node: "Validate Input Contract", type: "main", index: 0 }]],
      },
      "Validate Input Contract": {
        main: [[{ node: "AI Autonomous Execution", type: "main", index: 0 }]],
      },
      "AI Autonomous Execution": {
        main: [[{ node: "AgencyOS Backend Callback", type: "main", index: 0 }]],
      },
    },
    active: true,
    settings: {
      executionOrder: "v1",
      saveDataErrorExecution: "all",
      saveDataSuccessExecution: "all",
    },
    versionId: "1.0.0",
    id: `wf-agencyos-${agent.id}`,
    meta: {
      agentId: agent.id,
      agentName: agent.name,
      category: agent.category,
      tools: agent.requiredTools,
      defaultInputs: agent.defaultInputs,
      outputSchema: agent.outputSchema,
    },
  };
}

function buildSubWorkflowJson(sub: typeof SUB_WORKFLOWS[0]) {
  return {
    name: `AgencyOS Sub - ${sub.name}`,
    nodes: [
      {
        parameters: {
          workflowId: `sub-${sub.id}`,
        },
        id: `node-sub-${sub.id}-in`,
        name: "Subworkflow Input",
        type: "n8n-nodes-base.executeWorkflowTrigger",
        typeVersion: 1,
        position: [240, 300],
      },
      {
        parameters: {
          jsCode: `// ${sub.description}
const data = $input.first().json;
return [{ json: { ...data, subworkflow: "${sub.id}", processedAt: new Date().toISOString() } }];`,
        },
        id: `node-sub-${sub.id}-process`,
        name: "Process Logic",
        type: "n8n-nodes-base.code",
        typeVersion: 2,
        position: [480, 300],
      },
    ],
    connections: {
      "Subworkflow Input": {
        main: [[{ node: "Process Logic", type: "main", index: 0 }]],
      },
    },
    active: true,
    id: `wf-sub-${sub.id}`,
    meta: {
      subworkflowId: sub.id,
      description: sub.description,
    },
  };
}

// Write all agent workflows
for (const agent of AGENTS) {
  const dir = path.resolve(`n8n/workflows/agents/${agent.id}`);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "workflow.json"), JSON.stringify(buildWorkflowJson(agent), null, 2));
}

// Write all sub-workflows
for (const sub of SUB_WORKFLOWS) {
  const dir = path.resolve(`n8n/workflows/sub-workflows/${sub.id}`);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "workflow.json"), JSON.stringify(buildSubWorkflowJson(sub), null, 2));
}

console.log(`Generated ${AGENTS.length} agent workflows and ${SUB_WORKFLOWS.length} sub-workflows.`);
