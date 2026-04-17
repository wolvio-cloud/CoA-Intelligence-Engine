"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { DocumentUpload } from "@/components/customize/DocumentUpload";
import { SpecSettings } from "@/components/customize/SpecSettings";

type Tab = "documents" | "specs";

const TABS: { id: Tab; label: string; icon: ReactNode }[] = [
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
];

export function CustomizePage() {
  const [activeTab, setActiveTab] = useState<Tab>("documents");

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-600">
        Baseline setup is saved to <strong>your account</strong> (spec limits, matching product name, and reference documents).
      </p>
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
      </div>
    </div>
  );
}
