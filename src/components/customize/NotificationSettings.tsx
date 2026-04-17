"use client";

import { useState } from "react";

interface ToggleSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

const INITIAL: ToggleSetting[] = [
  { id: "email_fail", label: "Email on Fail", description: "Send an email when a CoA receives a FAIL status", enabled: true },
  { id: "email_warning", label: "Email on Warning", description: "Notify when a parameter triggers a WARNING flag", enabled: true },
  { id: "email_review", label: "Email on Review", description: "Alert when a CoA is flagged for SME review", enabled: false },
  { id: "daily_digest", label: "Daily Digest", description: "Send a daily summary of all submissions and results", enabled: true },
  { id: "supplier_alerts", label: "Supplier Alerts", description: "Notify when a supplier's pass rate drops below threshold", enabled: false },
];

export function NotificationSettings() {
  const [settings, setSettings] = useState<ToggleSetting[]>(INITIAL);
  const [threshold, setThreshold] = useState("75");
  const [email, setEmail] = useState("qa@supplier.com");

  const toggle = (id: string) => {
    setSettings((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h3 className="text-sm font-semibold text-slate-900">Notification Preferences</h3>
        <p className="mt-0.5 text-xs text-slate-400">Control how and when you receive alerts</p>
      </div>
      <div className="p-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Notification Email</label>
          <input
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="your@email.com"
          />
        </div>
        <div className="divide-y divide-slate-50">
          {settings.map((s) => (
            <div key={s.id} className="flex items-center gap-4 py-3.5">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900">{s.label}</p>
                <p className="mt-0.5 text-xs text-slate-400 leading-snug">{s.description}</p>
              </div>
              <button
                onClick={() => toggle(s.id)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                  s.enabled ? "bg-blue-600" : "bg-slate-200"
                }`}
                role="switch"
                aria-checked={s.enabled}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow ring-0 transition-transform duration-200 ${
                    s.enabled ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Supplier Pass-Rate Alert Threshold
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="50"
              max="100"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="flex-1 accent-blue-600"
            />
            <span className="w-12 text-right text-sm font-semibold text-slate-900">{threshold}%</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Alert when a supplier falls below this pass rate</p>
        </div>
      </div>
      <div className="flex justify-end border-t border-slate-50 px-5 py-3.5">
        <button className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm">
          Save preferences
        </button>
      </div>
    </div>
  );
}
