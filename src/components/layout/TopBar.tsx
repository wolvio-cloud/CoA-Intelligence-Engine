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
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-8">
      <div className="min-w-0 flex items-center gap-6">
        <div className="pl-10 lg:pl-0">
          <p className="text-[11px] font-semibold text-slate-400 leading-none">
            {meta.title} System
          </p>
          <h1 className="mt-2 text-[15px] font-bold tracking-tight text-slate-900 leading-none">
            {meta.description}
          </h1>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <div className="hidden h-8 w-px bg-slate-100 sm:block" />
        <span className="hidden text-[11px] font-semibold text-slate-400 sm:block">
          {dateStr}
        </span>
      </div>
    </header>
  );
}