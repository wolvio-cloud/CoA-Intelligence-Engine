"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import {
  fetchBaselineConfig,
  saveBaselineConfig,
  type BaselineParameterRow,
} from "@/lib/api";

export function SpecSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const baselineQuery = useQuery({
    queryKey: ["baseline-specs", user?.id ?? "none"],
    queryFn: fetchBaselineConfig,
    enabled: Boolean(user?.id),
  });

  const [matchName, setMatchName] = useState("");
  const [specs, setSpecs] = useState<BaselineParameterRow[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const d = baselineQuery.data;
    if (!d) return;
    setMatchName(d.match_product_name || "");
    if (d.parameters.length > 0) {
      setSpecs(d.parameters.map((p) => ({ ...p })));
    } else if (d.suggested_parameters?.length) {
      setSpecs(
        d.suggested_parameters.map((p, i) => ({
          ...p,
          id: p.id || `suggested-${i}`,
        })),
      );
    } else {
      setSpecs([]);
    }
  }, [baselineQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      setSaveError(null);
      return saveBaselineConfig({
        match_product_name: matchName.trim(),
        parameters: specs
          .filter((s) => s.parameter_name.trim())
          .map((s) => ({
            parameter_name: s.parameter_name.trim(),
            min: s.min,
            max: s.max,
            unit: s.unit,
            active: s.active,
          })),
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["baseline-specs", user?.id] });
    },
    onError: (e: Error) => {
      setSaveError(e.message);
    },
  });

  const applyDemoTemplate = useCallback(() => {
    const sug = baselineQuery.data?.suggested_parameters;
    if (!sug?.length) return;
    setSpecs(
      sug.map((p, i) => ({
        ...p,
        id: `tpl-${i}-${Date.now()}`,
      })),
    );
  }, [baselineQuery.data?.suggested_parameters]);

  const toggle = (id: string) => {
    setSpecs((prev) => prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));
  };

  const update = (id: string, field: keyof BaselineParameterRow, value: string | boolean) => {
    setSpecs((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const remove = (id: string) => {
    setSpecs((prev) => prev.filter((s) => s.id !== id));
  };

  const addNew = () => {
    const newId = `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setSpecs((prev) => [...prev, { id: newId, parameter_name: "", min: "", max: "", unit: "", active: true }]);
    setEditing(newId);
  };

  const showingSuggested =
    Boolean(baselineQuery.data?.suggested_parameters?.length) &&
    baselineQuery.data?.parameters.length === 0;

  if (baselineQuery.isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200/70 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
        Loading your baseline…
      </div>
    );
  }

  if (baselineQuery.isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/80 px-5 py-4 text-sm text-red-800 shadow-sm">
        Could not load baseline. {baselineQuery.error instanceof Error ? baselineQuery.error.message : ""}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h3 className="text-sm font-semibold text-slate-900">Specification limits</h3>
        <p className="mt-0.5 text-xs text-slate-400">
          Stored per account. The product name is used when matching your uploaded CoAs to a material profile.
        </p>
        <div className="mt-4 space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500" htmlFor="match-name">
            Product name for CoA matching
          </label>
          <input
            id="match-name"
            type="text"
            value={matchName}
            onChange={(e) => setMatchName(e.target.value)}
            className="w-full max-w-lg rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-900/[0.06]"
            placeholder="e.g. Paracetamol IP"
          />
        </div>
      </div>

      {showingSuggested && (
        <div className="flex flex-col gap-2 border-b border-amber-100 bg-amber-50/90 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-amber-900">
            Showing suggested limits from the shared demo library. Adjust and click <strong>Save changes</strong> to store your baseline.
          </p>
          <button
            type="button"
            onClick={applyDemoTemplate}
            className="shrink-0 rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100/80"
          >
            Reload demo template
          </button>
        </div>
      )}

      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <p className="text-xs text-slate-500">{specs.length} parameter{specs.length !== 1 ? "s" : ""}</p>
        <button
          type="button"
          onClick={addNew}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden>
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add row
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-50">
              <th className="w-8 px-5 py-3" aria-hidden />
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Parameter</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Min</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Max</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Unit</th>
              <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">Active</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {specs.map((spec) => (
              <tr
                key={spec.id}
                className={`transition-colors ${!spec.active ? "opacity-50" : "hover:bg-slate-50/60"}`}
              >
                <td className="px-5 py-3 text-slate-300" aria-hidden>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="1.5" />
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="12" cy="19" r="1.5" />
                  </svg>
                </td>
                <td className="px-5 py-3.5">
                  {editing === spec.id ? (
                    <input
                      autoFocus
                      className="w-full rounded-lg border border-blue-300 px-2 py-1 text-sm outline-none ring-2 ring-blue-100"
                      value={spec.parameter_name}
                      onChange={(e) => update(spec.id, "parameter_name", e.target.value)}
                      onBlur={() => setEditing(null)}
                    />
                  ) : (
                    <button
                      type="button"
                      className="text-left font-medium text-slate-900 hover:text-blue-600"
                      onClick={() => setEditing(spec.id)}
                    >
                      {spec.parameter_name || <span className="italic text-slate-300">Click to edit</span>}
                    </button>
                  )}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <input
                    className="w-20 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-right text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                    value={spec.min}
                    onChange={(e) => update(spec.id, "min", e.target.value)}
                    placeholder="—"
                  />
                </td>
                <td className="px-5 py-3.5 text-right">
                  <input
                    className="w-20 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-right text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                    value={spec.max}
                    onChange={(e) => update(spec.id, "max", e.target.value)}
                    placeholder="—"
                  />
                </td>
                <td className="px-5 py-3.5">
                  <input
                    className="w-16 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                    value={spec.unit}
                    onChange={(e) => update(spec.id, "unit", e.target.value)}
                    placeholder="—"
                  />
                </td>
                <td className="px-5 py-3.5 text-center">
                  <button
                    type="button"
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
                    type="button"
                    onClick={() => remove(spec.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {saveError && (
        <div className="border-t border-red-100 bg-red-50/80 px-5 py-2 text-xs text-red-800">{saveError}</div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-50 px-5 py-3.5">
        <button
          type="button"
          onClick={() => applyDemoTemplate()}
          disabled={!baselineQuery.data?.suggested_parameters?.length}
          className="rounded-lg border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Reset to demo template
        </button>
        <button
          type="button"
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-60"
        >
          {saveMutation.isPending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
