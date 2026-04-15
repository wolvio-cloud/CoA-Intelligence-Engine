"use client";

import { useState } from "react";
import { brand } from "@/config/brand";

export type Page = "dashboard" | "new-coa" | "recent-coa" | "customize";

interface MockUser {
  email: string;
  displayName: string;
}

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => Promise<void>;
  user: MockUser;
}

const navGroups: {
  label: string;
  items: { id: Page; label: string; icon: React.ReactNode }[];
}[] = [
  {
    label: "Analytics",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "CoA Module",
    items: [
      {
        id: "new-coa",
        label: "New CoA",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="11" x2="12" y2="17" />
            <line x1="9" y1="14" x2="15" y2="14" />
          </svg>
        ),
      },
      {
        id: "recent-coa",
        label: "Recent CoA",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Settings",
    items: [
      {
        id: "customize",
        label: "Add Baseline Data",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        ),
      },
    ],
  },
];

function getInitials(email: string): string {
  const parts = email.split("@")[0].split(/[._-]/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

export function Sidebar({ activePage, onNavigate, onLogout, user }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await onLogout();
    setLoggingOut(false);
  };

  const initials = getInitials(user.email ?? "QA");

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-slate-200 shadow-sm lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        )}
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-white border-r border-slate-200/80 transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-auto lg:h-full lg:shrink-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-100 px-4">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white text-[11px] font-bold tracking-tight"
            style={{ backgroundColor: "#1a2332" }}
          >
            CoA
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 leading-tight">
              {brand.productName.split(" ").slice(0, 2).join(" ")}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">Intelligence Engine</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 ">
          {navGroups.map((group) => (
             <nav className="flex flex-col gap-0.5">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onNavigate(item.id);
                      setMobileOpen(false);
                    }}
                    className={`my-1 flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-sm font-medium transition-all duration-150 ${
                      activePage === item.id
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span className={`shrink-0 ${activePage === item.id ? "text-white" : "text-slate-400"}`}>
                      {item.icon}
                    </span>
                    {item.label}
                  </button>
                ))}
              </nav>
          ))}
        </div>

        <div className="shrink-0 border-t border-slate-100 p-3 space-y-1">
          <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
            <div className="h-7 w-7 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-[11px] font-semibold">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-900 leading-tight">
                {user.displayName}
              </p>
              <p className="truncate text-[10px] text-slate-400 leading-tight">{user.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150 disabled:opacity-50"
          >
            {loggingOut ? (
              <svg className="h-4 w-4 animate-spin shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            )}
            {loggingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </aside>
    </>
  );
}
