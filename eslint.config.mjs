import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  {
    ignores: [
      "backend/**",
      "frontend/.next/**",
      "frontend/.open-next/**",
      "frontend/public/**",
      "node_modules/**",
      "dist/**",
      "coverage/**",
      "database/**",
      "n8n/**",
      "scripts/**",
      "**/*.d.ts",
      "**/*.config.*",
      "tests/**",
    ],
  },
  {
    files: ["frontend/src/**/*.{ts,tsx}"],
    plugins: {
      "@typescript-eslint": tsPlugin,
      "react-hooks": reactHooks,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      "no-unused-vars": "off",
      "no-undef": "off",
      "no-empty": "off",
      "no-console": "off",
      "no-case-declarations": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "react-hooks/exhaustive-deps": "warn",
    },
    linterOptions: {
      reportUnusedDisableDirectives: "off",
    },
  },
];
