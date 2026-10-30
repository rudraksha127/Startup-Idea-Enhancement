#!/usr/bin/env node

/**
 * AgencyOS Backend Module Scaffolder
 * ----------------------------------
 * Generates an isolated, plug-and-play vertical slice module under `apps/api/src/modules/<name>/`
 * and registers it automatically into the central module registry.
 *
 * Usage:
 *   npm run new:module <name>
 * Example:
 *   npm run new:module invoices
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const rawName = process.argv[2];

if (!rawName) {
  console.error("\x1b[31m[ERROR] Please provide a module name.\x1b[0m");
  console.log("Usage:   npm run new:module <module-name>");
  console.log("Example: npm run new:module invoices");
  process.exit(1);
}

// Format naming variations
function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

function toCamelCase(str) {
  const kebab = toKebabCase(str);
  return kebab.replace(/-([a-z])/g, (_, g) => g.toUpperCase());
}

function toPascalCase(str) {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

const kebabName = toKebabCase(rawName);
const camelName = toCamelCase(rawName);
const pascalName = toPascalCase(rawName);

const moduleDir = path.join(rootDir, "apps", "api", "src", "modules", kebabName);
const registryFile = path.join(rootDir, "apps", "api", "src", "modules", "index.ts");

if (fs.existsSync(moduleDir)) {
  console.error(`\x1b[31m[ERROR] Module "${kebabName}" already exists at ${moduleDir}\x1b[0m`);
  process.exit(1);
}

// 1. Create directory
fs.mkdirSync(moduleDir, { recursive: true });

// 2. Generate Service
const serviceContent = `import { resolveOrgId } from "../../common/resolve-org.js";

export class ${pascalName}Service {
  static async getAll(orgId: string) {
    // Implement database query or business logic here
    return [];
  }

  static async getById(id: string, orgId: string) {
    // Implement database lookup here
    return null;
  }

  static async create(data: Record<string, any>, orgId: string) {
    // Implement creation persistence here
    return { id: "mock-" + Date.now(), ...data, organizationId: orgId };
  }

  static async update(id: string, data: Record<string, any>, orgId: string) {
    // Implement update mutation here
    return { id, ...data, organizationId: orgId };
  }

  static async delete(id: string, orgId: string) {
    // Implement deletion logic here
    return { id, deleted: true };
  }
}
`;

// 3. Generate Controller
const controllerContent = `import { Request, Response } from "express";
import { ${pascalName}Service } from "./${kebabName}.service.js";
import { resolveOrgId, extractId } from "../../common/resolve-org.js";
import { sendSuccess, sendError } from "../../common/api-response.js";

export class ${pascalName}Controller {
  static getAll = async (req: Request, res: Response) => {
    const orgId = await resolveOrgId(req);
    const items = await ${pascalName}Service.getAll(orgId);
    return sendSuccess(res, items);
  };

  static getById = async (req: Request, res: Response) => {
    const orgId = await resolveOrgId(req);
    const id = extractId(req.params.id);
    const item = await ${pascalName}Service.getById(id, orgId);
    if (!item) {
      return sendError(res, "${pascalName} not found", 404);
    }
    return sendSuccess(res, item);
  };

  static create = async (req: Request, res: Response) => {
    const orgId = await resolveOrgId(req);
    const item = await ${pascalName}Service.create(req.body, orgId);
    return sendSuccess(res, item, "Created successfully", 201);
  };

  static update = async (req: Request, res: Response) => {
    const orgId = await resolveOrgId(req);
    const id = extractId(req.params.id);
    const item = await ${pascalName}Service.update(id, req.body, orgId);
    return sendSuccess(res, item, "Updated successfully");
  };

  static delete = async (req: Request, res: Response) => {
    const orgId = await resolveOrgId(req);
    const id = extractId(req.params.id);
    const result = await ${pascalName}Service.delete(id, orgId);
    return sendSuccess(res, result, "Deleted successfully");
  };
}
`;

// 4. Generate Routes
const routesContent = `import { Router } from "express";
import { ${pascalName}Controller } from "./${kebabName}.controller.js";
import { asyncHandler } from "../../common/async-handler.js";
import { requireAuth } from "../../middleware/auth.js";

export const ${camelName}Router = Router();

${camelName}Router.get("/", asyncHandler(${pascalName}Controller.getAll));
${camelName}Router.post("/", requireAuth, asyncHandler(${pascalName}Controller.create));
${camelName}Router.get("/:id", asyncHandler(${pascalName}Controller.getById));
${camelName}Router.patch("/:id", requireAuth, asyncHandler(${pascalName}Controller.update));
${camelName}Router.delete("/:id", requireAuth, asyncHandler(${pascalName}Controller.delete));
`;

// 5. Generate index.ts
const indexContent = `import { AppModule } from "../../common/module.interface.js";
import { ${camelName}Router } from "./${kebabName}.routes.js";

export const ${camelName}Module: AppModule = {
  name: "${kebabName}",
  routePrefix: "/${kebabName}",
  router: ${camelName}Router,
};

export { ${pascalName}Service } from "./${kebabName}.service.js";
export { ${pascalName}Controller } from "./${kebabName}.controller.js";
`;

// Write module files
fs.writeFileSync(path.join(moduleDir, `${kebabName}.service.ts`), serviceContent);
fs.writeFileSync(path.join(moduleDir, `${kebabName}.controller.ts`), controllerContent);
fs.writeFileSync(path.join(moduleDir, `${kebabName}.routes.ts`), routesContent);
fs.writeFileSync(path.join(moduleDir, "index.ts"), indexContent);

// 6. Update central registry (apps/api/src/modules/index.ts)
if (fs.existsSync(registryFile)) {
  let registryCode = fs.readFileSync(registryFile, "utf-8");

  // Insert import statement cleanly above the central registry documentation
  const importStatement = `import { ${camelName}Module } from "./${kebabName}/index.js";\n`;
  if (!registryCode.includes(importStatement)) {
    const importTarget = "/**\n * Central Module Registry";
    if (registryCode.includes(importTarget)) {
      registryCode = registryCode.replace(importTarget, `${importStatement}\n${importTarget}`);
    } else {
      const activeIndex = registryCode.indexOf("export const activeModules: AppModule[] = [");
      if (activeIndex !== -1) {
        registryCode =
          registryCode.slice(0, activeIndex) +
          importStatement +
          registryCode.slice(activeIndex);
      }
    }

    // Insert module into activeModules array
    const closingBracketIndex = registryCode.indexOf("];", activeIndex);
    if (closingBracketIndex !== -1) {
      registryCode =
        registryCode.slice(0, closingBracketIndex) +
        `  ${camelName}Module,\n` +
        registryCode.slice(closingBracketIndex);
    }

    fs.writeFileSync(registryFile, registryCode);
  }
}

console.log(`\n\x1b[32m✔ Plug-and-play module "${kebabName}" created successfully!\x1b[0m\n`);
console.log(`📁 Files generated in: apps/api/src/modules/${kebabName}/`);
console.log(`   ├── ${kebabName}.service.ts    (Business logic & DB queries)`);
console.log(`   ├── ${kebabName}.controller.ts (HTTP request handlers)`);
console.log(`   ├── ${kebabName}.routes.ts     (Express route definitions)`);
console.log(`   └── index.ts            (Module contract & export)`);
console.log(`\n🔗 Mounted Endpoints (Live on next reload):`);
console.log(`   GET    /api/v1/${kebabName}`);
console.log(`   POST   /api/v1/${kebabName}`);
console.log(`   GET    /api/v1/${kebabName}/:id`);
console.log(`   PATCH  /api/v1/${kebabName}/:id`);
console.log(`   DELETE /api/v1/${kebabName}/:id`);
console.log(`\n⚡ Zero changes needed in existing modules! You are ready to code.`);
