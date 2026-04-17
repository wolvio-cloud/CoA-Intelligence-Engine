"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Sidebar, type Page } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { DashboardPage } from "@/components/pages/DashboardPage";
import { NewCoaPage } from "@/components/pages/NewCoaPage";
import { RecentCoaPage } from "@/components/pages/RecentCoaPage";
import { CustomizePage } from "@/components/pages/CustomizePage";

export default function HomePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [activePage, setActivePage] = useState<Page>("dashboard");

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center overflow-x-hidden bg-[#f0f2f5] text-sm text-slate-500">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-dvh items-center justify-center overflow-x-hidden bg-[#f0f2f5] text-sm text-slate-500">
        Redirecting to sign in…
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-dvh min-h-0 w-full max-w-full overflow-x-hidden bg-[#f0f2f5]">
      <Sidebar activePage={activePage} onNavigate={setActivePage} onLogout={signOut} user={user} />
      <div className="flex h-full min-h-dvh min-h-0 w-full min-w-0 flex-1 flex-col">
        <TopBar activePage={activePage} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-5 lg:p-6 xl:p-7">
          {activePage === "dashboard" && <DashboardPage onNavigate={setActivePage} />}
          {activePage === "new-coa" && <NewCoaPage />}
          {activePage === "recent-coa" && <RecentCoaPage />}
          {activePage === "customize" && <CustomizePage />}
        </main>
      </div>
    </div>
  );
}
