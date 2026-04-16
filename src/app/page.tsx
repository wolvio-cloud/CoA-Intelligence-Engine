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
      <div className="flex h-full min-h-screen items-center justify-center bg-[#f0f2f5] text-sm text-slate-500">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-full min-h-screen items-center justify-center bg-[#f0f2f5] text-sm text-slate-500">
        Redirecting to sign in…
      </div>
    );
  }

  return (
    <div className="flex h-full bg-[#f0f2f5]">
      <Sidebar activePage={activePage} onNavigate={setActivePage} onLogout={signOut} user={user} />
      <div className="flex flex-1 flex-col min-w-0 h-full">
        <TopBar activePage={activePage} />
        <main className="flex-1 overflow-y-auto p-5 lg:p-7">
          {activePage === "dashboard" && <DashboardPage />}
          {activePage === "new-coa" && <NewCoaPage />}
          {activePage === "recent-coa" && <RecentCoaPage />}
          {activePage === "customize" && <CustomizePage />}
        </main>
      </div>
    </div>
  );
}
