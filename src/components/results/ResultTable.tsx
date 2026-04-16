"use client";

import { useMemo, useState } from "react";
import { statusFilterChipClasses, type ValidationStatusKey } from "@/config/brand";
import type { CoaParameter } from "@/lib/types";
import { ParameterRow } from "./ParameterRow";

const FILTER_OPTIONS: { value: ValidationStatusKey | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PASS", label: "Pass" },
  { value: "WARNING", label: "Warning" },
  { value: "FAIL", label: "Fail" },
  { value: "REVIEW", label: "Review" },
  { value: "ERROR", label: "Error" },
];

export function ResultTable({
  parameters,
  selectedId,
  onSelect,
}: {
  parameters: CoaParameter[];
  selectedId: string | null;
  onSelect: (p: CoaParameter) => void;
}) {
  const [filter, setFilter] = useState<ValidationStatusKey | "ALL">("ALL");

  const rows = useMemo(() => {
    if (filter === "ALL") return parameters;
    return parameters.filter((p) => p.validation_status === filter);
  }, [parameters, filter]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-4px_rgba(15,23,42,0.06)]">
      <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-navy">Parameters</h3>
            <p className="mt-1 text-xs text-slate-500">
              <span className="font-medium tabular-nums text-slate-700">{rows.length}</span>
              <span className="text-slate-400"> / </span>
              <span className="tabular-nums">{parameters.length}</span>
              <span className="text-slate-400"> shown · select a row for detail</span>
            </p>
          </div>
          <div
            className="flex flex-wrap gap-1 rounded-lg border border-slate-200/90 bg-white p-0.5 shadow-sm"
            role="group"
            aria-label="Filter by status"
          >
            {FILTER_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`rounded-md px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition-all sm:px-3 ${
                  filter === value
                    ? `${statusFilterChipClasses[value].active} shadow-sm`
                    : statusFilterChipClasses[value].inactive
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-white">
              <th className="whitespace-nowrap px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:px-5">
                Test
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:px-5">
                Result
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:px-5">
                Unit
              </th>
              <th className="hidden whitespace-nowrap px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:px-5 lg:table-cell">
                Specification
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:px-5">
                Status
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:px-5">
                Confidence
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((p, i) => (
              <ParameterRow
                key={p.id}
                param={p}
                selected={p.id === selectedId}
                zebra={i % 2 === 1}
                onSelect={onSelect}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
