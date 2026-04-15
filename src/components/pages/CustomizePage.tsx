"use client";

import { useState } from "react";
import { DocumentUpload } from "@/components/customize/DocumentUpload";
import { SpecSettings } from "@/components/customize/SpecSettings";
import { NotificationSettings } from "@/components/customize/NotificationSettings";
import { BrandSettings } from "@/components/customize/BrandSettings";

type Tab = "documents" | "specs" | "notifications" | "brand";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: "documents",
    label: "Documents",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
    ),
  },
  {
    id: "specs",
    label: "Spec Limits",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="6" x2="20" y2="6"/>
        <line x1="4" y1="10" x2="20" y2="10"/>
        <line x1="4" y1="14" x2="11" y2="14"/>
        <polyline points="16 16 19 19 22 16"/>
        <line x1="19" y1="13" x2="19" y2="19"/>
      </svg>
    ),
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
  },
  {
    id: "brand",
    label: "Brand",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
        <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.47-1.125-.29-.29-.47-.688-.47-1.125 0-.941.806-1.687 1.748-1.687H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8z"/>
      </svg>
    ),
  },
];

export function CustomizePage() {
  const [activeTab, setActiveTab] = useState<Tab>("documents");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-150 ${
              activeTab === tab.id
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <span className={activeTab === tab.id ? "text-white" : "text-slate-400"}>
              {tab.icon}
            </span>
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {activeTab === "documents" && <DocumentUpload />}
        {activeTab === "specs" && <SpecSettings />}
        {activeTab === "notifications" && <NotificationSettings />}
        {activeTab === "brand" && <BrandSettings />}
      </div>
    </div>
  );
}
