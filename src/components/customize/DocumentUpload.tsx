"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import {
  deleteBaselineDocument,
  getBaselineDocumentViewUrl,
  listBaselineDocuments,
  uploadBaselineDocument,
  type BaselineDocumentRow,
  type BaselineUploadResult,
} from "@/lib/api";

const statusReady = { label: "Ready", bg: "bg-emerald-50", text: "text-emerald-700" };

const UPLOAD_STEPS = [
  { label: "Uploading document", desc: "Sending file to server…" },
  { label: "Extracting specifications", desc: "AI is analysing the document…" },
  { label: "Storing parameters", desc: "Saving spec limits to your baseline…" },
];

const typeColors: Record<string, string> = {
  PDF: "#ef4444",
  XLSX: "#10b981",
  XLS: "#10b981",
  DOCX: "#2563eb",
  CSV: "#f59e0b",
};

function FileTypeIcon({ type }: { type: string }) {
  const color = typeColors[type] ?? "#94a3b8";
  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[10px] font-bold tracking-wide text-white shadow-sm"
      style={{ backgroundColor: color }}
    >
      {type.slice(0, 4)}
    </div>
  );
}

function formatBytes(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function extFromName(name: string | null | undefined): string {
  if (!name || !name.includes(".")) return "FILE";
  return name.split(".").pop()!.toUpperCase().slice(0, 4);
}

export function DocumentUpload() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [lastExtraction, setLastExtraction] = useState<{ filename: string; count: number } | null>(null);
  const [uploadStep, setUploadStep] = useState(0);

  const docsQuery = useQuery({
    queryKey: ["baseline-documents", user?.id ?? "none"],
    queryFn: listBaselineDocuments,
    enabled: Boolean(user?.id),
  });

  const uploadMut = useMutation({
    mutationFn: (file: File) => uploadBaselineDocument(file),
    onSuccess: (result: BaselineUploadResult, file: File) => {
      setUploadErr(null);
      if (result.extracted_count > 0) {
        setLastExtraction({ filename: file.name, count: result.extracted_count });
        // Refresh Spec Limits tab data
        void queryClient.invalidateQueries({ queryKey: ["baseline-specs"] });
      }
      void queryClient.invalidateQueries({ queryKey: ["baseline-documents", user?.id] });
    },
    onError: (e: Error) => setUploadErr(e.message),
  });

  useEffect(() => {
    if (!uploadMut.isPending) {
      setUploadStep(0);
      return;
    }
    setUploadStep(0);
    const t1 = setTimeout(() => setUploadStep(1), 5000);
    const t2 = setTimeout(() => setUploadStep(2), 10000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [uploadMut.isPending]);

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteBaselineDocument(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["baseline-documents", user?.id] });
    },
  });

  const addFiles = useCallback(
    (files: File[]) => {
      setUploadErr(null);
      setLastExtraction(null);
      for (const f of files) {
        uploadMut.mutate(f);
      }
    },
    [uploadMut],
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const openDoc = async (doc: BaselineDocumentRow) => {
    setOpeningId(doc.id);
    try {
      const { url } = await getBaselineDocumentViewUrl(doc.id);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setUploadErr(err instanceof Error ? err.message : "Could not open file");
    } finally {
      setOpeningId(null);
    }
  };

  const docs = docsQuery.data ?? [];

  return (
    <div className="space-y-5">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all duration-200 ${
          dragging ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/40"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="sr-only"
          accept=".pdf,.xlsx,.xls,.docx,.csv"
          onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))}
        />
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-colors ${
            dragging ? "bg-blue-100 text-blue-600" : "bg-white text-slate-400 shadow-sm"
          }`}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Drop files here or click to browse</p>
          <p className="mt-1 text-xs text-slate-400">PDF, XLSX, DOCX, CSV — max 25MB. Spec parameters are automatically extracted and stored.</p>
        </div>
        <span className="rounded-lg border border-blue-200 bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700">
          Browse files
        </span>
      </div>

      {uploadMut.isPending && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 space-y-3">
          {UPLOAD_STEPS.map((step, i) => {
            const done = i < uploadStep;
            const active = i === uploadStep;
            return (
              <div key={i} className="flex items-center gap-3">
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors ${
                    done ? "bg-emerald-500" : active ? "bg-blue-500" : "bg-slate-200"
                  }`}
                >
                  {done ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : active ? (
                    <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-slate-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <p
                    className={`text-sm font-medium leading-tight ${
                      done ? "text-emerald-700" : active ? "text-blue-900" : "text-slate-400"
                    }`}
                  >
                    {step.label}
                  </p>
                  {active && (
                    <p className="mt-0.5 text-xs text-blue-600">{step.desc}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!uploadMut.isPending && lastExtraction && (
        <div className="flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs text-emerald-800">
          <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>
            Extracted <strong>{lastExtraction.count} parameters</strong> from{" "}
            <span className="font-medium">{lastExtraction.filename}</span> — open the{" "}
            <strong>Spec Limits</strong> tab to review.
          </span>
        </div>
      )}

      {uploadErr && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-800">{uploadErr}</div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Baseline documents</h3>
            <p className="mt-0.5 text-xs text-slate-400">
              {docsQuery.isLoading ? "Loading…" : `${docs.length} document${docs.length !== 1 ? "s" : ""} · view opens a secure link`}
            </p>
          </div>
        </div>
        {docsQuery.isError && (
          <div className="px-5 py-4 text-sm text-red-700">
            {docsQuery.error instanceof Error ? docsQuery.error.message : "Failed to load documents"}
          </div>
        )}
        {!docsQuery.isLoading && docs.length === 0 && !docsQuery.isError ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3" aria-hidden>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <p className="text-sm">No documents uploaded yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {docs.map((doc) => {
              const ext = extFromName(doc.original_filename);
              const cfg = statusReady;
              return (
                <div key={doc.id} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-slate-50/60">
                  <FileTypeIcon type={ext} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{doc.original_filename || doc.id}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {formatBytes(doc.file_size_bytes)} ·{" "}
                      {doc.created_at
                        ? new Date(doc.created_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      void openDoc(doc);
                    }}
                    disabled={openingId === doc.id}
                    className="shrink-0 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    {openingId === doc.id ? "…" : "View"}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Remove this document from your baseline library?")) deleteMut.mutate(doc.id);
                    }}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
                    aria-label="Remove document"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
