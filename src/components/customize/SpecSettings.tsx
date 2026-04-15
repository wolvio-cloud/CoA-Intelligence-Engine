"use client";

import { useState } from "react";

interface SpecEntry {
  id: string;
  parameter: string;
  min: string;
  max: string;
  unit: string;
  active: boolean;
}

const INITIAL_SPECS: SpecEntry[] = [
  { id: "1", parameter: "Assay (anhydrous)", min: "99.0", max: "101.0", unit: "%", active: true },
  { id: "2", parameter: "pH (1% w/v solution)", min: "5.5", max: "6.5", unit: "", active: true },
  { id: "3", parameter: "Loss on drying", min: "", max: "0.5", unit: "%", active: true },
  { id: "4", parameter: "Heavy metals", min: "", max: "10", unit: "ppm", active: true },
  { id: "5", parameter: "Sulphated ash", min: "", max: "0.1", unit: "%", active: false },
];

export function SpecSettings() {
  const [specs, setSpecs] = useState<SpecEntry[]>(INITIAL_SPECS);
  const [editing, setEditing] = useState<string | null>(null);

  const toggle = (id: string) => {
    setSpecs((prev) => prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));
  };

  const update = (id: string, field: keyof SpecEntry, value: string | boolean) => {
    setSpecs((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const remove = (id: string) => {
    setSpecs((prev) => prev.filter((s) => s.id !== id));
  };

  const addNew = () => {
    const newId = Math.random().toString(36).slice(2);
    setSpecs((prev) => [...prev, { id: newId, parameter: "", min: "", max: "", unit: "", active: true }]);
    setEditing(newId);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Specification Limits</h3>
          <p className="mt-0.5 text-xs text-slate-400">Override baseline spec limits per parameter</p>
        </div>
        <button
          onClick={addNew}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          Add
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-50">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 w-8"></th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Parameter</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Min</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Max</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Unit</th>
              <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">Active</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {specs.map((spec) => (
              <tr
                key={spec.id}
                className={`transition-colors ${!spec.active ? "opacity-50" : "hover:bg-slate-50/60"}`}
              >
                <td className="px-5 py-3 text-slate-300">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                </td>
                <td className="px-5 py-3.5">
                  {editing === spec.id ? (
                    <input
                      autoFocus
                      className="w-full rounded-lg border border-blue-300 px-2 py-1 text-sm outline-none ring-2 ring-blue-100"
                      value={spec.parameter}
                      onChange={(e) => update(spec.id, "parameter", e.target.value)}
                      onBlur={() => setEditing(null)}
                    />
                  ) : (
                    <span
                      className="cursor-pointer font-medium text-slate-900 hover:text-blue-600 transition-colors"
                      onClick={() => setEditing(spec.id)}
                    >
                      {spec.parameter || <span className="text-slate-300 italic">Click to edit</span>}
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <input
                    className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-sm text-right outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 bg-slate-50"
                    value={spec.min}
                    onChange={(e) => update(spec.id, "min", e.target.value)}
                    placeholder="—"
                  />
                </td>
                <td className="px-5 py-3.5 text-right">
                  <input
                    className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-sm text-right outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 bg-slate-50"
                    value={spec.max}
                    onChange={(e) => update(spec.id, "max", e.target.value)}
                    placeholder="—"
                  />
                </td>
                <td className="px-5 py-3.5">
                  <input
                    className="w-16 rounded-lg border border-slate-200 px-2 py-1 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 bg-slate-50"
                    value={spec.unit}
                    onChange={(e) => update(spec.id, "unit", e.target.value)}
                    placeholder="—"
                  />
                </td>
                <td className="px-5 py-3.5 text-center">
                  <button
                    onClick={() => toggle(spec.id)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                      spec.active ? "bg-blue-600" : "bg-slate-200"
                    }`}
                    role="switch"
                    aria-checked={spec.active}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow ring-0 transition-transform duration-200 ${
                        spec.active ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </td>
                <td className="px-5 py-3.5">
                  <button
                    onClick={() => remove(spec.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-end gap-3 border-t border-slate-50 px-5 py-3.5">
        <button className="rounded-lg border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
          Reset to defaults
        </button>
        <button className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm">
          Save changes
        </button>
      </div>
    </div>
  );
}
