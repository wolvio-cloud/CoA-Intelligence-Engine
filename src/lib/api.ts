/**
 * Client-side data layer for the CoA API.
 */

import type { ValidationStatusKey } from "./types";
import type { CoaJobResult, PipelineStage, SubmissionSummary, SpecLimit } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/coa";

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

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...jsonHeaders,
      ...(init?.headers as Record<string, string> | undefined),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`CoA API error ${response.status}: ${body}`);
  }

  return response.json();
}

export async function uploadCoa(file: File): Promise<{ id: string; stage: PipelineStage; filename: string; status: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Upload failed: ${response.status} ${body}`);
  }

  const data = await response.json();
  return {
    id: data.submission_id,
    stage: "intake",
    filename: file.name,
    status: data.status,
  };
}

export async function fetchStatus(jobId: string): Promise<{
  id: string;
  stage: PipelineStage;
  progress: number;
  status: string;
  page_count: number;
  pages_processed: number;
}> {
  const data = await fetchJson<{
    submission_id: string;
    status: string;
    page_count: number;
    pages_processed: number;
  }>(`${API_BASE}/status/${encodeURIComponent(jobId)}`);

  const progress = data.page_count > 0
    ? Math.round((data.pages_processed / data.page_count) * 100)
    : data.status === "completed"
      ? 100
      : 0;

  const stage = data.status === "pending"
    ? "intake"
    : data.status === "processing"
      ? progress >= 90
        ? "store"
        : progress >= 65
          ? "validate"
          : progress >= 35
            ? "extract"
            : "intake"
      : data.status === "completed" || data.status === "failed"
        ? "complete"
        : "idle";

  return {
    id: data.submission_id,
    stage,
    progress: Math.min(100, Math.max(0, progress)),
    status: data.status,
    page_count: data.page_count,
    pages_processed: data.pages_processed,
  };
}

export async function fetchResult(jobId: string): Promise<CoaJobResult> {
  const data = await fetchJson<any>(`${API_BASE}/result/${encodeURIComponent(jobId)}`);

  const overallStatus = isValidStatus(data.status)
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

  const parameters = Array.isArray(data.parameters)
    ? data.parameters.map((p: any, index: number) => ({
      id: p.id ?? `param-${index + 1}`,
      name: p.parameter_name ?? p.name ?? `Parameter ${index + 1}`,
      result_value: p.result_value ?? "",
      unit: p.unit ?? null,
      spec_limit: parseSpecLimit(p.specification ?? p.spec_limit?.text ?? p.specification ?? null),
      validation_status: isValidStatus(p.validation_status ?? p.status ?? "REVIEW")
        ? (p.validation_status ?? p.status ?? "REVIEW")
        : "REVIEW",
      confidence: Number(p.confidence ?? 0),
      notes: p.notes ?? null,
    }))
    : [];

  return {
    id: data.submission_id ?? jobId,
    filename: normalizeFilename(data.header?.filename ?? data.header?.file_path ?? data.header?.source ?? null, data.submission_id ?? jobId),
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
  };
}

export async function listSubmissions(): Promise<SubmissionSummary[]> {
  const data = await fetchJson<any[]>(`${API_BASE}/submissions`);
  return data.map((item) => ({
    id: item.id,
    filename: normalizeFilename(item.file_path, item.id),
    created_at: item.created_at,
    stage: item.status === "pending" ? "intake" : item.status === "processing" ? "extract" : "complete",
    overall_status: isValidStatus(item.status) ? item.status : "REVIEW",
    parameter_count: Number(item.page_count ?? 0),
  }));
}

export function exportUrl(jobId: string, format: "json" | "csv"): string {
  return `${API_BASE}/export/${encodeURIComponent(jobId)}?format=${format}`;
}
