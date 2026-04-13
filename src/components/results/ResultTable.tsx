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
    <div className="overflow-hidden rounded-lg border border-slate-200/90 bg-white shadow-card">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-navy lg:text-base">Parameters</h3>
          <p className="mt-1 text-xs text-slate-500 lg:text-sm">
            {rows.length} of {parameters.length} shown · select a row for detail
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTER_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors lg:text-sm lg:py-2 ${
                filter === value
                  ? statusFilterChipClasses[value].active
                  : statusFilterChipClasses[value].inactive
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-brand-light">
              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-navy sm:px-5">
                Test
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-navy sm:px-5">
                Result
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-navy sm:px-5">
                Unit
              </th>
              <th className="hidden px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-navy sm:px-5 lg:table-cell">
                Specification
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-navy sm:px-5">
                Status
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-navy sm:px-5">
                Confidence
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((p) => (
              <ParameterRow
                key={p.id}
                param={p}
                selected={p.id === selectedId}
                onSelect={onSelect}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}