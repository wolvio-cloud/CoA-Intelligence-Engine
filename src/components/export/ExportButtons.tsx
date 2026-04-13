"use client";

import { useCallback, useState } from "react";
import { mockExportUrl } from "@/lib/api";

export function ExportButtons({ jobId }: { jobId: string | null }) {
  const [last, setLast] = useState<string | null>(null);

  const handle = useCallback(
    (fmt: "json" | "csv" | "pdf") => {
      const id = jobId ?? "session";
      setLast(mockExportUrl(id, fmt));
    },
    [jobId],
  );

  return (
    <div className="rounded-lg border border-slate-200/90 bg-white p-5 shadow-card mt-8">
      <p className="text-[12px] font-semibold text-navy">Export</p>
      <p className="mt-1 text-xs leading-relaxed text-brand-slate">
        Download structured evidence packages for your quality record (JSON, CSV, or PDF summary).
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {(["JSON", "CSV", "PDF"] as const).map((label) => {
          const fmt = label.toLowerCase() as "json" | "csv" | "pdf";
          return (
            <button
              key={label}
              type="button"
              onClick={() => handle(fmt)}
              className="rounded-md border border-slate-200 bg-brand-light px-3 py-1.5 text-xs font-medium text-navy transition hover:border-brand-blue/40 hover:bg-white"
            >
              {label}
            </button>
          );
        })}
      </div>
      {last ? (
        <p className="mt-3 truncate font-mono text-[10px] text-slate-400" title={last}>
          {last}
        </p>
      ) : null}
    </div>
  );
}