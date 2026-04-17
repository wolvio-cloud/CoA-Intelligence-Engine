import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#f0f2f5",
        navy: "#1a2332",
        /** Match src/config/brand.ts — required for `bg-brand-blue`, `text-brand-slate`, etc. */
        "brand-blue": "#2563eb",
        "brand-slate": "#475569",
        "brand-light": "#f1f5f9",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        sm: "0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)",
        md: "0 4px 12px rgba(15, 23, 42, 0.08), 0 2px 4px rgba(15, 23, 42, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
