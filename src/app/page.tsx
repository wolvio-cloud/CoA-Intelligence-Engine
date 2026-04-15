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

export default function HomePage() {
  const { user, signOut } = useAuth();
  const [activePage, setActivePage] = useState<Page>("dashboard");

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
