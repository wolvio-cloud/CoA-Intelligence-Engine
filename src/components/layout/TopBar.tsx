"use client";

import type { Page } from "./Sidebar";

interface TopBarProps {
  activePage: Page;
}

const pageMeta: Record<Page, { title: string; description: string }> = {
  dashboard: {
    title: "Dashboard",
    description: "Analytics overview and submission insights",
  },
  "new-coa": {
    title: "New CoA",
    description: "Upload and analyse a Certificate of Analysis",
  },
  "recent-coa": {
    title: "Recent CoA",
    description: "Browse and review past submissions",
  },
  customize: {
    title: "Baseline Setup",
    description: "Configure your baseline parameters and preferences",
  },
  "qc-panel": {
    title: "QC Panel",
    description: "Quality control panel overview",
  },
};

export function TopBar({ activePage }: TopBarProps) {
  const meta = pageMeta[activePage];

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/90 px-6 backdrop-blur-md lg:px-8">
      <div className="min-w-0 pl-10 lg:pl-0">
        <h1 className="text-base font-semibold text-slate-900 leading-tight">
          {meta.title}
        </h1>
        <p className="text-[11px] text-slate-400 mt-0.5">
          {meta.description}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2.5">
        <span className="hidden text-xs text-slate-400 sm:block">
          {dateStr}
        </span>
      </div>
    </header>
  );
}