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
    PASS: "#10B981", // Emerald 500
    WARNING: "#F59E0B", // Amber 500
    FAIL: "#E11D48", // Rose 600
    REVIEW: "#6366F1", // Indigo 500
    ERROR: "#F97316", // Orange 500
  },
} as const;

export type ValidationStatusKey = keyof typeof brandColors.statusStripe;

/** Status badges — Subtle tints with strong text for high professional clarity. */
export const statusBadgeClasses: Record<
  keyof typeof brandColors.statusStripe,
  { label: string; className: string }
> = {
  PASS: {
    label: "Pass",
    className: "border-emerald-100 bg-emerald-50 text-emerald-700",
  },
  WARNING: {
    label: "Warning",
    className: "border-amber-100 bg-amber-50 text-amber-700",
  },
  FAIL: {
    label: "Fail",
    className: "border-rose-100 bg-rose-50 text-rose-700",
  },
  REVIEW: {
    label: "Review",
    className: "border-indigo-100 bg-indigo-50 text-indigo-700",
  },
  ERROR: {
    label: "Error",
    className: "border-orange-100 bg-orange-50 text-orange-700",
  },
};

/** Table filter pills — Clean, flat headers with subtle active indicators. */
export const statusFilterChipClasses: Record<
  ValidationStatusKey | "ALL",
  { inactive: string; active: string }
> = {
  ALL: {
    inactive: "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50",
    active: "border border-slate-900 bg-slate-900 text-white",
  },
  PASS: {
    inactive: "border border-slate-200 bg-white text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200",
    active: "border border-emerald-600 bg-emerald-600 text-white",
  },
  WARNING: {
    inactive: "border border-slate-200 bg-white text-slate-500 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200",
    active: "border border-amber-600 bg-amber-600 text-white",
  },
  FAIL: {
    inactive: "border border-slate-200 bg-white text-slate-500 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200",
    active: "border border-rose-600 bg-rose-600 text-white",
  },
  REVIEW: {
    inactive: "border border-slate-200 bg-white text-slate-500 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200",
    active: "border border-indigo-600 bg-indigo-600 text-white",
  },
  ERROR: {
    inactive: "border border-slate-200 bg-white text-slate-500 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200",
    active: "border border-orange-600 bg-orange-600 text-white",
  },
};

export type BrandConfig = {
  productName: string;
  /** Second line next to logo in `icon` presentation (e.g. “Pharmaceuticals”). Omit for wordmark-only. */
  productSubtitle?: string | null;
  tagline: string;
  /** Shown in the nav when logoSrc is not set. */
  logoMark: string;
  /**
   * Optional navbar logo: path under public/ (e.g. /logo.svg) or absolute URL.
   * Set to null to use logoMark only.
   */
  logoSrc: string | null;
  logoAlt: string;
  /**
   * `wordmark` = image is the full mark (e.g. WOLVIC); no extra title text beside it.
   * `icon` = small mark + productName + optional productSubtitle.
   */
  logoPresentation: "icon" | "wordmark";
};

export const brand: BrandConfig = {
  productName: "WOLVIO",
  productSubtitle: null,
  tagline: "CoA AI Assistant",
  logoMark: "W",
  logoSrc: "/wolvic-logo.png",
  logoAlt: "WOLVIO",
  logoPresentation: "wordmark",
};