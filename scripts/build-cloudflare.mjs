import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const rootDir = process.cwd();
const frontendDir = path.resolve(rootDir, "frontend");
const srcOpenNext = path.resolve(frontendDir, ".open-next");
const destOpenNext = path.resolve(rootDir, ".open-next");

console.log("[Build] Building Next.js application with OpenNext in frontend directory...");
execSync("npx opennextjs-cloudflare build", {
  cwd: frontendDir,
  stdio: "inherit",
});

console.log("[Build] Syncing .open-next output to project root for Cloudflare deployment...");
if (fs.existsSync(srcOpenNext)) {
  fs.cpSync(srcOpenNext, destOpenNext, { recursive: true, force: true });
  console.log("✓ OpenNext worker and assets successfully staged in root `.open-next`.");
} else {
  console.error("✗ Failed to locate frontend/.open-next build output!");
  process.exit(1);
}
