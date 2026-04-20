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
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="text-sm font-bold tracking-tight text-slate-900">Analysis Results</h3>
            <p className="mt-1 text-[11px] font-semibold text-slate-400">
              <span className="text-slate-900">{rows.length}</span>
              <span> Records Matched</span>
            </p>
          </div>
          <div
            className="flex flex-wrap gap-1 rounded bg-slate-50 p-1"
            role="group"
            aria-label="Filter"
          >
            {FILTER_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`rounded px-3 py-1.5 text-[11px] font-semibold transition-all ${
                  filter === value
                    ? `${statusFilterChipClasses[value].active}`
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
        <table className="w-full min-w-[min(100%,720px)] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/30">
              <th className="whitespace-nowrap px-6 py-4 text-left text-[11px] font-semibold text-slate-400">
                Test Parameter
              </th>
              <th className="whitespace-nowrap px-6 py-4 text-left text-[11px] font-semibold text-slate-400">
                Method
              </th>
              <th className="whitespace-nowrap px-6 py-4 text-left text-[11px] font-semibold text-slate-400">
                Observed Result
              </th>
              <th className="whitespace-nowrap px-6 py-4 text-left text-[11px] font-semibold text-slate-400">
                Compliance
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
