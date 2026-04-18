/**
 * Client-side data layer for the CoA API (supports { data, error } envelope).
 */

import type { ValidationStatusKey } from "./types";
import type { CoaJobResult, PipelineStage, SubmissionSummary, SpecLimit } from "./types";
import { authHeaders, notifySessionExpired, setStoredToken } from "./authToken";

// const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/coa").replace(/\/$/, "");
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://coa-intelligence-backend-a791f91457e7.herokuapp.com/api/coa").replace(/\/$/, "");
/** Base URL for `/api/auth/*` (derived from CoA base, e.g. strip trailing `/coa`). */
export const API_ROOT = API_BASE.replace(/\/coa\/?$/i, "") || API_BASE;

const SPECS_BASE = `${API_ROOT}/specs`;

const jsonHeaders = {
  Accept: "application/json",
};

function isValidStatus(status: string): status is ValidationStatusKey {
  return ["PASS", "WARNING", "FAIL", "REVIEW", "ERROR"].includes(status);
}

function parseSpecLimit(value: string | null | undefined): SpecLimit {
  if (!value) {
    return { min_value: null, max_value: null, text: null };
  }

  const match = value.match(/(-?\d+(?:\.\d+)?)\s*(?:-|to|–)\s*(-?\d+(?:\.\d+)?)/i);
  if (match) {
    return {
      min_value: Number(match[1]),
      max_value: Number(match[2]),
      text: value,
    };
  }

  return {
    min_value: null,
    max_value: null,
    text: value,
  };
}

function normalizeFilename(path: string | null | undefined, id: string): string {
  if (!path) return id;
  const segments = path.split("/").filter(Boolean);
  return segments.length ? segments[segments.length - 1] : path;
}

function unwrapEnvelope<T>(j: unknown): T {
  if (j && typeof j === "object" && "data" in (j as object) && "error" in (j as object)) {
    const body = j as { data: T; error: { code?: string; message?: string } | null };
    if (body.error) {
      throw new Error(body.error.message || body.error.code || "API error");
    }
    return body.data as T;
  }
  return j as T;
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...jsonHeaders,
      ...authHeaders(),
      ...(init?.headers as Record<string, string> | undefined),
    },
  });

  if (response.status === 401) {
    setStoredToken(null);
    notifySessionExpired();
  }

  let j: unknown;
  try {
    j = await response.json();
  } catch {
    const body = await response.text();
    throw new Error(`CoA API error ${response.status}: ${body}`);
  }

  if (!response.ok) {
    if (j && typeof j === "object" && "error" in j) {
      const err = (j as { error?: { message?: string; code?: string } }).error;
      if (err?.message) throw new Error(err.message);
      if (err?.code) throw new Error(err.code);
    }
    const raw = typeof j === "object" && j && "detail" in j ? JSON.stringify((j as { detail: unknown }).detail) : JSON.stringify(j);
    throw new Error(`CoA API error ${response.status}: ${raw}`);
  }

  return unwrapEnvelope<T>(j);
}

async function readHttpError(response: Response): Promise<string> {
  const raw = await response.text();
  try {
    const j = JSON.parse(raw) as { detail?: unknown; error?: { message?: string; code?: string } };
    if (j.error?.message) return j.error.message;
    if (j.error?.code && !j.detail) return j.error.code;
    if (typeof j.detail === "string") return j.detail;
    if (Array.isArray(j.detail)) {
      return j.detail
        .map((d: { msg?: string }) => d?.msg)
        .filter(Boolean)
        .join("; ");
    }
  } catch {
    /* not JSON */
  }
  return raw || `HTTP ${response.status}`;
}

export async function uploadCoa(file: File): Promise<{ id: string; stage: PipelineStage; filename: string; status: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
    headers: authHeaders(),
  });

  if (response.status === 401) {
    setStoredToken(null);
    notifySessionExpired();
  }

  if (!response.ok) {
    throw new Error(await readHttpError(response));
  }

  const j = await response.json();
  const data = unwrapEnvelope<{
    submission_id: string;
    status: string;
  }>(j);

  return {
    id: data.submission_id,
    stage: "intake",
    filename: file.name,
    status: data.status,
  };
}

const SERVER_STAGES = new Set(["intake", "extract", "validate", "store", "complete"]);

function stageFromServer(data: {
  pipeline_stage?: string | null;
  status: string;
  page_count: number;
  pages_processed: number;
}): PipelineStage {
  if (data.status === "completed") return "complete";
  if (data.status === "failed") return (data.pipeline_stage && SERVER_STAGES.has(data.pipeline_stage)
    ? (data.pipeline_stage as PipelineStage)
    : "complete");
  const raw = (data.pipeline_stage || "").toLowerCase();
  if (raw && SERVER_STAGES.has(raw)) return raw as PipelineStage;
  if (data.status === "pending") return "intake";
  if (data.status === "processing") return "extract";
  return "idle";
}

function progressFromServer(data: {
  pipeline_stage?: string | null;
  status: string;
  page_count: number;
  pages_processed: number;
}): number {
  if (data.status === "completed") return 100;
  if (data.status === "failed") return 100;
  const ps = (data.pipeline_stage || "").toLowerCase();
  if (ps === "intake") return 12;
  if (ps === "extract") {
    if (!data.page_count) return 22;
    const frac = Math.min(1, data.pages_processed / data.page_count);
    return Math.min(72, 15 + Math.round(frac * 57));
  }
  if (ps === "validate") return 82;
  if (ps === "store") return 94;
  if (ps === "complete") return 100;
  if (data.status === "pending") return 8;
  if (data.status === "processing" && data.page_count > 0) {
    return 12 + Math.round((data.pages_processed / data.page_count) * 40);
  }
  return 15;
}

export async function fetchStatus(jobId: string): Promise<{
  id: string;
  stage: PipelineStage;
  progress: number;
  status: string;
  page_count: number;
  pages_processed: number;
  error_message: string | null;
  pipeline_stage: string | null;
}> {
  const data = await fetchJson<{
    submission_id: string;
    status: string;
    pipeline_stage?: string | null;
    page_count: number;
    pages_processed: number;
    error_message?: string | null;
  }>(`${API_BASE}/status/${encodeURIComponent(jobId)}`);

  const stage = stageFromServer(data);
  const progress = progressFromServer(data);

  return {
    id: data.submission_id,
    stage,
    progress: Math.min(100, Math.max(0, progress)),
    status: data.status,
    page_count: data.page_count,
    pages_processed: data.pages_processed,
    error_message: data.error_message ?? null,
    pipeline_stage: data.pipeline_stage ?? null,
  };
}

export async function fetchResult(jobId: string): Promise<CoaJobResult> {
  const data = await fetchJson<any>(`${API_BASE}/result/${encodeURIComponent(jobId)}`);

  const overallStatus = isValidStatus(data.overall_status)
    ? data.overall_status
    : isValidStatus(data.status)
      ? data.status
      : data.summary
        ? data.summary.ERROR > 0
          ? "ERROR"
          : data.summary.FAIL > 0
            ? "FAIL"
            : data.summary.REVIEW > 0
              ? "REVIEW"
              : data.summary.WARNING > 0
                ? "WARNING"
                : "PASS"
        : "REVIEW";

  const rawConf = (p: any) => {
    const c = Number(p.confidence ?? 0);
    return c > 1 ? c / 100 : c;
  };

  const parameters = Array.isArray(data.parameters)
    ? data.parameters.map((p: any, index: number) => ({
      id: p.id ?? `param-${index + 1}`,
      name: p.parameter_name ?? p.name ?? `Parameter ${index + 1}`,
      method: p.method_reference ?? p.method ?? null,
      result_value: p.result_value ?? "",
      unit: p.result_unit ?? p.unit ?? null,
      spec_limit: parseSpecLimit(
        p.specification_limit ?? p.specification ?? p.spec_limit?.text ?? null,
      ),
      validation_status: isValidStatus(p.validation_status ?? p.status ?? "REVIEW")
        ? (p.validation_status ?? p.status ?? "REVIEW")
        : "REVIEW",
      confidence: rawConf(p),
      notes: p.validation_notes ?? p.notes ?? null,
    }))
    : [];

  const rawSummary = data.summary;
  const status_summary =
    rawSummary && typeof rawSummary === "object"
      ? {
          PASS: Number(rawSummary.PASS ?? 0),
          WARNING: Number(rawSummary.WARNING ?? 0),
          FAIL: Number(rawSummary.FAIL ?? 0),
          REVIEW: Number(rawSummary.REVIEW ?? 0),
          ERROR: Number(rawSummary.ERROR ?? 0),
        }
      : undefined;

  return {
    id: data.submission_id ?? jobId,
    filename: normalizeFilename(
      data.header?.filename ?? data.header?.file_path ?? data.header?.source ?? null,
      data.submission_id ?? jobId,
    ),
    created_at: new Date().toISOString(),
    stage: "complete",
    product_match: {
      requested_sku: data.header?.requested_sku ?? null,
      matched_product: data.header?.matched_product ?? data.header?.product_name ?? "Unknown product",
      match_score: Number(data.header?.match_score ?? 0),
      match_method: data.header?.match_method ?? "unknown",
    },
    parameters,
    overall_status: overallStatus,
    status_summary,
    header: data.header,
    approval_status: data.approval_status ?? "PENDING",
    analyst_name: data.analyst_name,
    analyst_acknowledged_at: data.analyst_acknowledged_at,
    manager_name: data.manager_name,
    manager_signed_at: data.manager_signed_at,
    disposition: data.disposition,
    manager_notes: data.manager_notes,
  };
}

function submissionListStage(status: string): Exclude<PipelineStage, "idle"> {
  if (status === "pending") return "intake";
  if (status === "processing") return "extract";
  return "complete";
}

function submissionListOverallStatus(status: string): ValidationStatusKey {
  if (status === "failed") return "ERROR";
  if (status === "completed") return "REVIEW";
  return "REVIEW";
}

function parseListOverallStatus(raw: unknown, fallback: ValidationStatusKey): ValidationStatusKey {
  if (typeof raw === "string" && isValidStatus(raw)) return raw;
  return fallback;
}

export async function listSubmissions(limit = 100): Promise<SubmissionSummary[]> {
  const q = new URLSearchParams({ limit: String(Math.min(500, Math.max(1, limit))) });
  const data = await fetchJson<any[]>(`${API_BASE}/submissions?${q.toString()}`);
  return data.map((item) => {
    const stage = submissionListStage(item.status);
    const fallbackOverall = submissionListOverallStatus(item.status);
    return {
      id: item.id,
      filename: normalizeFilename(item.original_filename ?? item.file_path, item.id),
      created_at: item.created_at,
      stage,
      overall_status: parseListOverallStatus(item.overall_status, fallbackOverall),
      parameter_count: Number(
        item.parameter_count != null ? item.parameter_count : item.page_count ?? 0,
      ),
      status_summary: item.status_summary,
      header: item.header,
      approval_status: item.approval_status || "PENDING",
      analyst_name: item.analyst_name,
      analyst_acknowledged_at: item.analyst_acknowledged_at,
      manager_name: item.manager_name,
      manager_signed_at: item.manager_signed_at,
      disposition: item.disposition,
      manager_notes: item.manager_notes,
    };
  });
}

export function exportUrl(jobId: string, format: "csv" | "pdf"): string {
  return `${API_BASE}/export/${encodeURIComponent(jobId)}?format=${format}`;
}

export function bulkExportUrl(ids: string[], format: "csv" | "pdf"): string {
  const q = new URLSearchParams({
    ids: ids.join(","),
    format,
  });
  return `${API_BASE}/export/bulk?${q.toString()}`;
}

export async function deleteSubmission(id: string): Promise<void> {
  await fetchJson<any>(`${API_BASE}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function acknowledgeSubmission(id: string): Promise<void> {
  await fetchJson<any>(`${API_BASE}/submissions/${encodeURIComponent(id)}/acknowledge`, {
    method: "POST",
  });
}

export async function signOffSubmission(id: string, disposition: string, notes: string): Promise<void> {
  const url = `${API_BASE}/submissions/${encodeURIComponent(id)}/sign-off?disposition=${encodeURIComponent(disposition)}&notes=${encodeURIComponent(notes)}`;
  await fetchJson<any>(url, {
    method: "POST",
  });
}


function triggerBrowserDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function downloadExport(jobId: string, format: "csv" | "pdf"): Promise<void> {
  const url = exportUrl(jobId, format);
  const acceptMap: Record<typeof format, string> = {
    csv: "text/csv,*/*",
    pdf: "application/pdf,*/*",
  };
  const response = await fetch(url, {
    headers: {
      Accept: acceptMap[format],
      ...authHeaders(),
    },
  });

  if (response.status === 401) {
    setStoredToken(null);
    notifySessionExpired();
    throw new Error("Session expired; please sign in again.");
  }

  if (!response.ok) {
    throw new Error(await readHttpError(response));
  }

  const blob = await response.blob();
  const cd = response.headers.get("Content-Disposition");
  const m = cd?.match(/filename=([^;]+)/i);
  const defaultName = format === "pdf" ? `${jobId}.pdf` : `${jobId}.csv`;
  const name = m?.[1]?.replace(/"/g, "").trim() || defaultName;
  triggerBrowserDownload(blob, name);
}

export async function downloadBulkExport(ids: string[], format: "csv" | "pdf"): Promise<void> {
  if (!ids.length) return;
  const url = bulkExportUrl(ids, format);
  const acceptMap: Record<typeof format, string> = {
    csv: "text/csv,*/*",
    pdf: "application/pdf,*/*",
  };
  const response = await fetch(url, {
    headers: {
      Accept: acceptMap[format],
      ...authHeaders(),
    },
  });

  if (response.status === 401) {
    setStoredToken(null);
    notifySessionExpired();
    throw new Error("Session expired; please sign in again.");
  }

  if (!response.ok) {
    throw new Error(await readHttpError(response));
  }

  const blob = await response.blob();
  const cd = response.headers.get("Content-Disposition");
  const m = cd?.match(/filename=([^;]+)/i);
  const dateStr = new Date().toISOString().split("T")[0];
  const defaultName = format === "pdf" 
    ? `Bulk_CoA_Reports_${dateStr}.pdf` 
    : `Bulk_CoA_Reports_${dateStr}.csv`;
  const name = m?.[1]?.replace(/"/g, "").trim() || defaultName;
  triggerBrowserDownload(blob, name);
}

/** Per-user baseline (spec limits + CoA product name for matching). */
export type BaselineParameterRow = {
  id: string;
  parameter_name: string;
  min: string;
  max: string;
  unit: string;
  active: boolean;
  specification_limit?: string;
};

export type BaselineConfig = {
  product_id: string;
  spec_table_id: string;
  match_product_name: string;
  parameters: BaselineParameterRow[];
  suggested_parameters: BaselineParameterRow[] | null;
};

export async function fetchBaselineConfig(): Promise<BaselineConfig> {
  return fetchJson<BaselineConfig>(`${SPECS_BASE}/baseline`);
}

export async function saveBaselineConfig(body: {
  match_product_name: string;
  parameters: { parameter_name: string; min?: string; max?: string; unit?: string; active: boolean }[];
}): Promise<BaselineConfig> {
  return fetchJson<BaselineConfig>(`${SPECS_BASE}/baseline`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export type BaselineDocumentRow = {
  id: string;
  storage_path: string;
  original_filename: string | null;
  mime_type: string | null;
  file_size_bytes: number | null;
  created_at: string;
};

export async function listBaselineDocuments(): Promise<BaselineDocumentRow[]> {
  return fetchJson<BaselineDocumentRow[]>(`${SPECS_BASE}/baseline/documents`);
}

export type BaselineExtractedParam = {
  parameter_name: string;
  specification_limit: string | null;
  min_text: string | null;
  max_text: string | null;
  unit_text: string | null;
  is_quantitative: boolean;
};

export type BaselineUploadResult = {
  id: string;
  original_filename: string;
  extracted_count: number;
  parameters: BaselineExtractedParam[];
};

export async function uploadBaselineDocument(file: File): Promise<BaselineUploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${SPECS_BASE}/baseline/documents`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });
  if (response.status === 401) {
    setStoredToken(null);
    notifySessionExpired();
  }
  if (!response.ok) {
    throw new Error(await readHttpError(response));
  }
  const j = await response.json();
  return unwrapEnvelope<BaselineUploadResult>(j);
}

export async function deleteBaselineDocument(docId: string): Promise<void> {
  await fetchJson<{ deleted: boolean }>(`${SPECS_BASE}/baseline/documents/${encodeURIComponent(docId)}`, {
    method: "DELETE",
  });
}

export async function getBaselineDocumentViewUrl(docId: string): Promise<{ url: string; filename?: string | null }> {
  return fetchJson<{ url: string; filename?: string | null }>(
    `${SPECS_BASE}/baseline/documents/${encodeURIComponent(docId)}/url`,
  );
}
