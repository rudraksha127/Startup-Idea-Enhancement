import { Router } from "express";
import * as authCtrl from "../controllers/auth.controller.js";
import * as leadsCtrl from "../controllers/leads.controller.js";
import * as dashCtrl from "../controllers/dashboard.controller.js";
import * as agentsCtrl from "../controllers/agents.controller.js";
import * as clientsCtrl from "../controllers/clients.controller.js";
import { requireAuth } from "../middleware/auth.js";

export const apiRouter = Router();

// Health Probe
apiRouter.get("/health", agentsCtrl.getHealth);

// --- Auth Routes ---
apiRouter.post("/auth/register", authCtrl.register);
apiRouter.post("/auth/login", authCtrl.login);
apiRouter.post("/auth/logout", authCtrl.logout);
apiRouter.get("/auth/me", authCtrl.me);

// --- Leads Routes ---
apiRouter.get("/leads", leadsCtrl.getLeads);
apiRouter.post("/leads", leadsCtrl.createLead);
apiRouter.get("/leads/:leadId", leadsCtrl.getLeadById);
apiRouter.patch("/leads/:leadId", leadsCtrl.updateLeadStatus);

// --- Clients Routes ---
apiRouter.get("/clients", clientsCtrl.getClients);
apiRouter.post("/clients", requireAuth, clientsCtrl.createClient);

// --- Dashboard Routes ---
apiRouter.get("/dashboard/metrics", dashCtrl.getDashboardMetrics);
apiRouter.get("/dashboard/activity", dashCtrl.getDashboardActivity);

// --- Agents Routes ---
apiRouter.get("/agents", agentsCtrl.getAgents);
apiRouter.patch("/agents/:id", requireAuth, agentsCtrl.updateAgent);

// --- Projects Routes ---
apiRouter.get("/projects", agentsCtrl.getProjects);
apiRouter.post("/projects", requireAuth, agentsCtrl.createProject);

