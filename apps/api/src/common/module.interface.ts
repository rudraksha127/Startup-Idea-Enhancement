import { Router } from "express";

export interface AppModule {
  /**
   * Unique identifier for the module (e.g. "leads", "auth", "billing")
   */
  name: string;

  /**
   * The URL prefix where this module's router is mounted.
   * Example: "/leads" mounts at "/api/v1/leads" and "/api/leads"
   */
  routePrefix: string;

  /**
   * The Express router containing all routes for this module.
   */
  router: Router;

  /**
   * Optional initialization lifecycle hook.
   * Runs when the module is mounted (e.g. to setup indexes, seed data, or background queues).
   */
  init?: () => Promise<void> | void;
}

