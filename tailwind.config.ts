import type { Config } from "tailwindcss";
import { brandColors } from "./src/config/brand";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    // Status / filter class strings live here — must be scanned or utilities are purged
    "./src/config/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: brandColors.navy,
        brand: {
          blue: brandColors.blue,
          slate: brandColors.slate,
          light: brandColors.lightGray,
          lightGray: brandColors.lightGray,
        },
        status: {
          pass: brandColors.statusStripe.PASS,
          warning: brandColors.statusStripe.WARNING,
          fail: brandColors.statusStripe.FAIL,
          review: brandColors.statusStripe.REVIEW,
          error: brandColors.statusStripe.ERROR,
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        panel: "0 1px 2px rgba(15, 23, 42, 0.04)",
        card: "0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 16px rgba(15, 23, 42, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;