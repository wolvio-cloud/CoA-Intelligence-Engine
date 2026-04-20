"use client";

import { useState } from "react";
import { brand } from "@/config/brand";
import Link from "next/link";

export type Page = "dashboard" | "new-coa" | "recent-coa" | "customize" | "qc-panel";

interface AppUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
}

interface SidebarProps {
  activePage: Page;
  onLogout: () => Promise<void>;
  user: AppUser;
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
  //   {
  //   label: "Settings",
  //   items: [
  //     {
  //       id: "customize",
  //       label: "Baseline Setup",
  //       icon: (
  //         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  //           <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
  //           <circle cx="12" cy="12" r="3" />
  //         </svg>
  //       ),
  //     },
  //   ],
  // },
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

];

function getInitials(email: string): string {
  const parts = email.split("@")[0].split(/[._-]/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

export function Sidebar({ activePage, onLogout, user }: SidebarProps) {
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
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-[#0f172a] border-r border-slate-800 transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-auto lg:h-full lg:shrink-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex shrink-0 flex-col items-center gap-3 border-b border-slate-800 px-4 py-6">
          <div className="flex w-full items-center gap-3">
            {brand.logoSrc && (
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white/5 p-1 ring-1 ring-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={brand.logoSrc} alt={brand.logoAlt} className="h-full w-full object-contain brightness-110" />
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-2xl font-bold text-white tracking-tight leading-none">Axivera</span>
              <span className="text-xs text-slate-300 font-medium tracking-wide mt-1">Pharmaceuticals</span>
            </div>
          </div>
          <div className="w-full text-center border-t border-slate-800/50">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 whitespace-nowrap">
              {brand.tagline}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-6 ">
          <nav className="flex flex-col gap-3">
            {/* ANALYST ITEMS */}
            {user.role !== "manager" && (
              <>
                <div className="px-3 mb-2 mt-4 first:mt-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Operations</p>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    activePage === "dashboard"
                      ? "bg-slate-800 text-white shadow-sm ring-1 ring-white/10"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  }`}
                >
                  <span className={`shrink-0 ${activePage === "dashboard" ? "text-indigo-400" : "text-slate-500"}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7" rx="1.5" />
                      <rect x="14" y="3" width="7" height="7" rx="1.5" />
                      <rect x="3" y="14" width="7" height="7" rx="1.5" />
                      <rect x="14" y="14" width="7" height="7" rx="1.5" />
                    </svg>
                  </span>
                  Dashboard
                </Link>
                <Link
                  href="/new-coa"
                  onClick={() => setMobileOpen(false)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    activePage === "new-coa"
                      ? "bg-slate-800 text-white shadow-sm ring-1 ring-white/10"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  }`}
                >
                  <span className={`shrink-0 ${activePage === "new-coa" ? "text-indigo-400" : "text-slate-500"}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="12" y1="11" x2="12" y2="17" />
                      <line x1="9" y1="14" x2="15" y2="14" />
                    </svg>
                  </span>
                  New CoA
                </Link>
                <Link
                  href="/recent-coa"
                  onClick={() => setMobileOpen(false)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    activePage === "recent-coa"
                      ? "bg-slate-800 text-white shadow-sm ring-1 ring-white/10"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  }`}
                >
                  <span className={`shrink-0 ${activePage === "recent-coa" ? "text-indigo-400" : "text-slate-500"}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </span>
                  Recent CoA
                </Link>
              </>
            )}

            {/* MANAGER ITEMS */}
            {user.role === "manager" && (
              <>
                <div className="px-3 mb-2 mt-4 first:mt-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Oversight</p>
                </div>
                <Link
                  href="/qc-panel"
                  onClick={() => setMobileOpen(false)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    activePage === "qc-panel"
                      ? "bg-slate-800 text-white shadow-sm ring-1 ring-white/10"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  }`}
                >
                  <span className={`shrink-0 ${activePage === "qc-panel" ? "text-indigo-400" : "text-slate-500"}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      <polyline points="9 12 11 14 15 10"/>
                    </svg>
                  </span>
                  QC Panel
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="shrink-0 border-t border-slate-800 p-4 space-y-3">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="h-8 w-8 shrink-0 rounded-full bg-slate-800 ring-1 ring-white/10 flex items-center justify-center text-slate-200 text-xs font-semibold">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white leading-tight">
                {user.displayName}
              </p>
              <p className="truncate text-[10px] text-slate-500 leading-tight mt-0.5">{user.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-50"
          >
            {loggingOut ? (
              <svg className="h-4 w-4 animate-spin shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
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
