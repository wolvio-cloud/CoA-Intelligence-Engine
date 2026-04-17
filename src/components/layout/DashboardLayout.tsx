"use client";

import { useAuth } from "@/context/AuthContext";
import { Sidebar, type Page } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Map pathname to Page type
  const getActivePage = (path: string): Page => {
    if (path.startsWith("/dashboard")) return "dashboard";
    if (path.startsWith("/new-coa")) return "new-coa";
    if (path.startsWith("/recent-coa")) return "recent-coa";
    if (path.startsWith("/customize")) return "customize";
    return "dashboard";
  };

  const activePage = getActivePage(pathname);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center overflow-x-hidden bg-[#f0f2f5] text-sm text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <svg className="h-6 w-6 animate-spin text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <span>Loading session…</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-full min-h-dvh min-h-0 w-full max-w-full overflow-x-hidden bg-[#f0f2f5]">
      <Sidebar activePage={activePage} onLogout={signOut} user={user} />
      <div className="flex h-full min-h-dvh min-h-0 w-full min-w-0 flex-1 flex-col">
        <TopBar activePage={activePage} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-5 lg:p-6 xl:p-7">
          {children}
        </main>
      </div>
    </div>
  );
}
