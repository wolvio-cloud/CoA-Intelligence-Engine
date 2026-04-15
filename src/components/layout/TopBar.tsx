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
    title: "Customize",
    description: "Manage documents, spec limits and configuration",
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
        <h1 className="text-base font-semibold text-slate-900 leading-tight">{meta.title}</h1>
        <p className="text-[11px] text-slate-400 mt-0.5">{meta.description}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2.5">
        <span className="hidden text-xs text-slate-400 sm:block">{dateStr}</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 cursor-pointer transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>
      </div>
    </header>
  );
}
