import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [],
    exclude: ["node_modules", "prototype", "tests/e2e/**"],
  },
  esbuild: {
    jsx: "automatic",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@agencyos/contracts": path.resolve(__dirname, "./packages/contracts/src"),
      "@agencyos/validation": path.resolve(__dirname, "./packages/validation/src"),
      "@agencyos/config": path.resolve(__dirname, "./packages/config/src"),
      "@agencyos/utils": path.resolve(__dirname, "./packages/utils/src"),
    },
  },
});
