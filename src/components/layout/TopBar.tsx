"use client";

type Page = "dashboard" | "customize";

interface TopBarProps {
  activePage: Page;
}

const pageMeta: Record<Page, { title: string; description: string }> = {
  dashboard: {
    title: "Dashboard",
    description: "Analytics overview and submission insights",
  },
  customize: {
    title: "Customize",
    description: "Manage documents, specs and system configuration",
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
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/80 px-6 backdrop-blur-md lg:px-8">
      <div className="min-w-0">
        <h1 className="text-lg font-semibold text-slate-900 leading-tight">{meta.title}</h1>
        <p className="text-xs text-slate-400 mt-0.5">{meta.description}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="hidden text-xs text-slate-400 sm:block">{dateStr}</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 cursor-pointer transition-colors">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 cursor-pointer transition-colors">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </div>
      </div>
    </header>
  );
}
