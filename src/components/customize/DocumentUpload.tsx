"use client";

import { useState, useRef } from "react";

interface UploadedDoc {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  status: "processing" | "ready" | "error";
}

const MOCK_DOCS: UploadedDoc[] = [
  { id: "1", name: "Baseline_Paracetamol_IP.pdf", size: "1.2 MB", type: "PDF", uploadedAt: "Apr 10, 2026", status: "ready" },
  { id: "2", name: "Spec_Ibuprofen_USP.xlsx", size: "340 KB", type: "XLSX", uploadedAt: "Apr 8, 2026", status: "ready" },
  { id: "3", name: "Template_CoA_v3.docx", size: "89 KB", type: "DOCX", uploadedAt: "Apr 5, 2026", status: "ready" },
];

const statusConfig = {
  ready: { label: "Ready", bg: "bg-emerald-50", text: "text-emerald-700" },
  processing: { label: "Processing", bg: "bg-blue-50", text: "text-blue-700" },
  error: { label: "Error", bg: "bg-red-50", text: "text-red-600" },
};

const typeColors: Record<string, string> = {
  PDF: "#ef4444",
  XLSX: "#10b981",
  DOCX: "#2563eb",
  CSV: "#f59e0b",
};

function FileTypeIcon({ type }: { type: string }) {
  const color = typeColors[type] ?? "#94a3b8";
  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white text-[10px] font-bold tracking-wide shadow-sm"
      style={{ backgroundColor: color }}
    >
      {type}
    </div>
  );
}

export function DocumentUpload() {
  const [docs, setDocs] = useState<UploadedDoc[]>(MOCK_DOCS);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const addFiles = (files: File[]) => {
    const newDocs = files.map((f) => ({
      id: Math.random().toString(36).slice(2),
      name: f.name,
      size: `${(f.size / 1024).toFixed(0)} KB`,
      type: f.name.split(".").pop()?.toUpperCase() ?? "FILE",
      uploadedAt: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      status: "ready" as const,
    }));
    setDocs((prev) => [...newDocs, ...prev]);
  };

  const removeDoc = (id: string) => {
    setDocs((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="space-y-5">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all duration-200 ${
          dragging
            ? "border-blue-400 bg-blue-50"
            : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/40"
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
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Drop files here or click to browse</p>
          <p className="mt-1 text-xs text-slate-400">Supports PDF, XLSX, DOCX, CSV — max 25MB per file</p>
        </div>
        <span className="rounded-lg border border-blue-200 bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors">
          Browse Files
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Uploaded Documents</h3>
            <p className="mt-0.5 text-xs text-slate-400">{docs.length} document{docs.length !== 1 ? "s" : ""} stored</p>
          </div>
        </div>
        {docs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <p className="text-sm">No documents uploaded yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {docs.map((doc) => {
              const cfg = statusConfig[doc.status];
              return (
                <div key={doc.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                  <FileTypeIcon type={doc.type} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{doc.name}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{doc.size} · Uploaded {doc.uploadedAt}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
                    {cfg.label}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeDoc(doc.id); }}
                    className="shrink-0 flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M18 6L6 18M6 6l12 12"/>
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
