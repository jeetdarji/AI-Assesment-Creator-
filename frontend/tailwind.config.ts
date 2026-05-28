// filepath: frontend/tailwind.config.ts
// description: Tailwind CSS configuration with VedaAI design tokens.

import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1a1a2e",
        surface: "#ffffff",
        background: "#f8f9fa",
        accent: "#10b981",
        danger: "#ef4444",
        warning: "#f59e0b",
        success: "#10b981",
        muted: "#6b7280",
        border: "#e5e7eb",
        veda: {
          text: "var(--text-primary)",
          "text-secondary": "var(--text-secondary)",
          "text-disabled": "var(--text-disabled)",
          white: "var(--bg-white)",
          offwhite: "var(--bg-offwhite)",
          "offwhite-20": "var(--bg-offwhite-20)",
          "offwhite-50": "var(--bg-offwhite-50)",
          dark: "var(--bg-dark)",
          "btn-primary": "var(--btn-primary)",
          "btn-orange": "var(--btn-primary-orange)",
          "btn-create": "var(--btn-create)",
          navy: "var(--color-navy)",
          "navy-light": "var(--color-navy-light)",
          red: "var(--color-red)",
          "surface-dark": "var(--surface-dark)",
          "surface-on": "var(--surface-on)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        bricolage: ["var(--font-bricolage)", "'Bricolage Grotesque'", "sans-serif"],
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        "scale-in": "scale-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
      borderRadius: {
        pill: "9999px",
      },
      width: {
        sidebar: "var(--sidebar-width)",
      },
      height: {
        topbar: "var(--topbar-height)",
      },
      spacing: {
        sidebar: "var(--sidebar-width)",
        topbar: "var(--topbar-height)",
      },
      boxShadow: {
        "veda-realistic": "0px 16px 48px rgba(0, 0, 0, 0.12), 0px 32px 48px rgba(0, 0, 0, 0.2)",
        "veda-create": "0px 16px 48px rgba(255, 255, 255, 0.12), 0px 32px 48px rgba(255, 255, 255, 0.2), inset 0px -1px 3.5px rgba(177, 177, 177, 0.6), inset 0px 0px 34.5px rgba(255, 255, 255, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
