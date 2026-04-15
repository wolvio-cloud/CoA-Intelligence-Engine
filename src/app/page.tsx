"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { DashboardPage } from "@/components/pages/DashboardPage";
import { CustomizePage } from "@/components/pages/CustomizePage";

type Page = "dashboard" | "customize";

export default function HomePage() {
  const [activePage, setActivePage] = useState<Page>("dashboard");

  return (
    <div className="flex min-h-screen bg-[#f0f2f5]">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <div className="flex flex-1 flex-col min-w-0">
        <TopBar activePage={activePage} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {activePage === "dashboard" && <DashboardPage />}
          {activePage === "customize" && <CustomizePage />}
        </main>
      </div>
    </div>
  );
}
