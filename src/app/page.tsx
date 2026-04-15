"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { LoginPage } from "@/components/auth/LoginPage";
import { Sidebar, type Page } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { DashboardPage } from "@/components/pages/DashboardPage";
import { NewCoaPage } from "@/components/pages/NewCoaPage";
import { RecentCoaPage } from "@/components/pages/RecentCoaPage";
import { CustomizePage } from "@/components/pages/CustomizePage";

function LoadingScreen() {
  return (
    <div className="flex h-full items-center justify-center bg-[#f0f2f5]">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        <p className="text-sm">Loading…</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { user, loading, signOut } = useAuth();
  const [activePage, setActivePage] = useState<Page>("dashboard");

  if (loading) return <LoadingScreen />;
  if (!user) return <LoginPage />;

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
