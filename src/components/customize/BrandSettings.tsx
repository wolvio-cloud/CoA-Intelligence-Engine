"use client";

import { useState } from "react";

export function BrandSettings() {
  const [orgName, setOrgName] = useState("Supplier CoA Intelligence");
  const [tagline, setTagline] = useState("Structured certificate review for quality teams");
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [reportFooter, setReportFooter] = useState("Confidential — For internal use only");
  const [logoName, setLogoName] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h3 className="text-sm font-semibold text-slate-900">Brand & Display</h3>
        <p className="mt-0.5 text-xs text-slate-400">Customise the application appearance and export branding</p>
      </div>
      <div className="p-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Organisation Name</label>
            <input
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tagline</label>
            <input
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Logo</label>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-500">
              {logoName ? "IMG" : "CoA"}
            </div>
            <label className="cursor-pointer rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => setLogoName(e.target.files?.[0]?.name ?? null)}
              />
              {logoName ? "Replace logo" : "Upload logo"}
            </label>
            {logoName && (
              <button onClick={() => setLogoName(null)} className="text-xs text-red-500 hover:text-red-600">
                Remove
              </button>
            )}
          </div>
          {logoName && <p className="mt-1 text-xs text-slate-400">{logoName}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Primary Colour</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="h-9 w-9 cursor-pointer rounded-lg border border-slate-200 p-0.5"
            />
            <input
              className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-mono outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              placeholder="#2563eb"
            />
            <div
              className="h-9 w-9 shrink-0 rounded-lg border border-slate-200"
              style={{ backgroundColor: primaryColor }}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Report Footer Text</label>
          <textarea
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
            rows={2}
            value={reportFooter}
            onChange={(e) => setReportFooter(e.target.value)}
          />
          <p className="mt-1 text-xs text-slate-400">Appears in the footer of all exported PDF reports</p>
        </div>
      </div>
      <div className="flex justify-end border-t border-slate-50 px-5 py-3.5">
        <button className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm">
          Save changes
        </button>
      </div>
    </div>
  );
}
