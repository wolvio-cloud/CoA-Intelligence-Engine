/**
 * Brand tokens — align with design system.
 *
 * Core (hex):
 * - Navy #1A2332 — header bar, primary text, table header text
 * - Blue #2563EB — CTAs, active states, links, progress accents
 * - Slate #475569 — secondary text, labels
 * - Light gray #F1F5F9 — page canvas, input / muted surfaces
 *
 * Status chips — Tailwind 50 / 700 / 200 per status (see statusBadgeClasses).
 */

export const brandColors = {
  navy: "#1A2332",
  blue: "#2563EB",
  slate: "#475569",
  lightGray: "#F1F5F9",
  /**
   * Left accent stripe on summary cards (700-series for visibility on white).
   * Chips use StatusBadge Tailwind classes (50/700/200).
   */
  statusStripe: {
    PASS: "#15803D",
    WARNING: "#B45309",
    FAIL: "#B91C1C",
    REVIEW: "#0E7490",
    ERROR: "#C2410C",
  },
} as const;

export type ValidationStatusKey = keyof typeof brandColors.statusStripe;

/** Status badges — bg 50, text 700, border 200 (Tailwind palette). */
export const statusBadgeClasses: Record<
  keyof typeof brandColors.statusStripe,
  { label: string; className: string }
> = {
  PASS: {
    label: "Pass",
    className: "border-green-200 bg-green-50 text-green-700",
  },
  WARNING: {
    label: "Warning",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  FAIL: {
    label: "Fail",
    className: "border-red-200 bg-red-50 text-red-700",
  },
  REVIEW: {
    label: "Review",
    className: "border-cyan-200 bg-cyan-50 text-cyan-700",
  },
  ERROR: {
    label: "Error",
    className: "border-orange-200 bg-orange-50 text-orange-700",
  },
};

/** Table filter pills — same 50/700/200 as badges when idle; active = solid 700 for clear selection. */
export const statusFilterChipClasses: Record<
  ValidationStatusKey | "ALL",
  { inactive: string; active: string }
> = {
  ALL: {
    inactive: "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100",
    active: "border border-brand-blue bg-brand-blue text-white",
  },
  PASS: {
    inactive: "border border-green-200 bg-green-50 text-green-700 hover:bg-green-100",
    active: "border border-green-700 bg-green-700 text-white",
  },
  WARNING: {
    inactive: "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
    active: "border border-amber-700 bg-amber-700 text-white",
  },
  FAIL: {
    inactive: "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
    active: "border border-red-700 bg-red-700 text-white",
  },
  REVIEW: {
    inactive: "border border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100",
    active: "border border-cyan-700 bg-cyan-700 text-white",
  },
  ERROR: {
    inactive: "border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100",
    active: "border border-orange-700 bg-orange-700 text-white",
  },
};

export type BrandConfig = {
  productName: string;
  tagline: string;
  /** Shown in the nav when logoSrc is not set. */
  logoMark: string;
  /**
   * Optional navbar logo: path under public/ (e.g. /logo.svg) or absolute URL.
   * Set to null to use logoMark only.
   */
  logoSrc: string | null;
  logoAlt: string;
};

export const brand: BrandConfig = {
  productName: "Axivera Pharmaceuticals",
  tagline: "Quality · Science · Trust",
  logoMark: "AXV",
  logoSrc: "/logo.svg",
  logoAlt: "Axivera Pharmaceuticals",
};