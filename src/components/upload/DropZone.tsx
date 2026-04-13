"use client";

import { useCallback, useState } from "react";
import { brandColors } from "@/config/brand";

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
        className="stroke-current"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 2v6h6M8 13h8M8 17h6"
        className="stroke-current"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DropZone({
  onFile,
  disabled,
  className = "",
}: {
  onFile: (file: File) => void;
  disabled?: boolean;
  /** e.g. flex-1 min-h-0 to fill hero column */
  className?: string;
}) {
  const [drag, setDrag] = useState(false);

  const handleFiles = useCallback(
    (list: FileList | null) => {
      if (!list?.length || disabled) return;
      onFile(list[0]);
    },
    [disabled, onFile],
  );

  return (
    <div
      onDragEnter={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`group relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed px-6 py-10 transition-all duration-300 sm:px-10 sm:py-14 ${
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      } ${
        drag
          ? "scale-[1.01] border-brand-blue bg-brand-light shadow-[0_0_0_4px_rgba(37,99,235,0.12)]"
          : "border-slate-200/90 bg-gradient-to-b from-white to-brand-light/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)] hover:border-brand-blue/35 hover:shadow-md"
      } min-h-[280px] sm:min-h-[320px] lg:min-h-[360px] ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.22) 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />
      <div className="relative flex flex-col items-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-4 ring-brand-light transition group-hover:border-brand-blue/25 group-hover:ring-brand-blue/10">
          <DocumentIcon className="h-8 w-8 text-brand-blue" />
        </div>
        <p className="text-center text-lg font-semibold tracking-tight text-navy sm:text-xl">
          Drop your CoA here
        </p>
        <p className="mt-3 max-w-md text-center text-sm leading-relaxed text-brand-slate sm:text-[15px]">
         Your file is securely processed to extract and validate analytical results automatically. No manual intervention is required.
        </p>
        <label className="mt-10">
          <input
            type="file"
            accept=".pdf,image/*"
            className="sr-only"
            disabled={disabled}
            onChange={(e) => handleFiles(e.target.files)}
          />
          <span
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-6 py-3 text-[12px] font-semibold text-white shadow-md transition hover:brightness-110 active:scale-[0.98]"
            style={{ backgroundColor: brandColors.blue }}
          >
            <span className="text-lg leading-none text-[12px]">+</span>
            Choose file
          </span>
        </label>
        <p className="mt-6 text-center text-[12px] text-slate-400">or drag and drop anywhere in this area</p>
      </div>
    </div>
  );
}