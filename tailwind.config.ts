import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "var(--paper, #f8f6f0)",
          2: "var(--paper-2, #f3f1eb)",
          card: "#ffffff",
        },
        ink: {
          DEFAULT: "var(--ink, #101413)",
          muted: "var(--muted, #555956)",
          faint: "#828a84",
        },
        agency: {
          green: "#0d251f",
          "green-dark": "#091511",
          "green-hover": "#173e32",
          accent: "#0da66c",
          sidebar: "#0d1716",
          "sidebar-border": "#1a2c27",
        },
        border: "var(--line, rgba(22, 31, 27, 0.12))",
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["DM Sans", "Inter", "Arial", "sans-serif"],
        handwriting: ["Caveat", "cursive"],
      },
      boxShadow: {
        card: "0 10px 30px rgba(22, 26, 20, 0.055)",
        subtle: "0 2px 8px rgba(0, 0, 0, 0.04)",
        float: "0 12px 36px rgba(0, 0, 0, 0.12)",
      },
      borderRadius: {
        card: "10px",
      },
    },
  },
  plugins: [],
};

export default config;

