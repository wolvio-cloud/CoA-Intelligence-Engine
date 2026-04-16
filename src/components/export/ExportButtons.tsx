"use client";

import { useCallback, useState } from "react";
import { downloadExport } from "@/lib/api";

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ExportButtons({ jobId, compact }: { jobId: string | null; compact?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handle = useCallback(
    async (fmt: "json" | "csv") => {
      const id = jobId ?? "session";
      setErr(null);
      setBusy(true);
      try {
        await downloadExport(id, fmt);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Download failed.");
      } finally {
        setBusy(false);
      }
    },
    [jobId],
  );

  if (compact) {
    return (
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 hidden text-[11px] font-medium uppercase tracking-wide text-slate-400 sm:inline">Export</span>
        {(["JSON", "CSV"] as const).map((label) => {
          const fmt = label.toLowerCase() as "json" | "csv";
          return (
            <button
              key={label}
              type="button"
              title={`Download ${label} evidence package`}
              disabled={busy}
              onClick={() => void handle(fmt)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-navy shadow-sm transition hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] disabled:opacity-50"
            >
              <DownloadIcon />
              {label}
            </button>
          );
        })}
        </div>
        {err && <p className="text-[11px] text-red-600">{err}</p>}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold text-navy">Export evidence</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">Structured packages for your quality record.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {(["JSON", "CSV"] as const).map((label) => {
          const fmt = label.toLowerCase() as "json" | "csv";
          return (
            <button
              key={label}
              type="button"
              disabled={busy}
              onClick={() => void handle(fmt)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-navy transition hover:bg-white hover:border-slate-300 disabled:opacity-50"
            >
              <DownloadIcon />
              {label}
            </button>
          );
        })}
      </div>
      {err && <p className="mt-3 text-xs text-red-600">{err}</p>}
    </div>
  );
}
