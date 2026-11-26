import path from "path";
import { defineConfig, devices } from "@playwright/test";

const e2ePort = process.env.E2E_PORT || "3100";
const baseURL = process.env.BASE_URL || `http://localhost:${e2ePort}`;
const rootDir = path.resolve(process.cwd());

export default defineConfig({
  testDir: "./browser",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    headless: true,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `npm run dev -- --port ${e2ePort}`,
    cwd: rootDir,
    url: baseURL,
    reuseExistingServer: !process.env.CI && Boolean(process.env.BASE_URL),
    timeout: 120 * 1000,
  },
});

