/**
 * Client-side data layer — resolves with local sample payloads (no HTTP).
 * Shapes align with the CoA API for future backend wiring.
 */

import type { ValidationStatusKey } from "./types";
import {
  MOCK_JOB_RESULT,
  MOCK_RECENT_SUBMISSIONS,
  type CoaJobResult,
  type PipelineStage,
  type SubmissionSummary,
} from "./types";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function mockUploadCoa(filename: string): Promise<{ id: string; stage: PipelineStage }> {
  await delay(400);
  return { id: `upload-${filename.replace(/\W+/g, "-").slice(0, 24)}`, stage: "intake" };
}

export async function mockFetchStatus(jobId: string): Promise<{ id: string; stage: PipelineStage }> {
  await delay(120);
  return { id: jobId, stage: "complete" };
}

/** Full result per known job id so Recent activity switches update the main panel. */
const MOCK_RESULTS_BY_JOB_ID: Record<string, CoaJobResult> = {
  [MOCK_JOB_RESULT.id]: MOCK_JOB_RESULT,
  "sub-8841": {
    ...MOCK_JOB_RESULT,
    id: "sub-8841",
    filename: "Ibuprofen_USP_RMG.pdf",
    overall_status: "PASS",
    product_match: {
      requested_sku: "IBU-USP",
      matched_product: "Ibuprofen USP",
      match_score: 0.97,
      match_method: "substring_hit",
    },
    parameters: MOCK_JOB_RESULT.parameters.slice(0, 12).map((p, i) => ({
      ...p,
      id: `ibu-${i + 1}`,
      validation_status: "PASS" as ValidationStatusKey,
      notes: null,
    })),
  },
  "sub-8830": {
    ...MOCK_JOB_RESULT,
    id: "sub-8830",
    filename: "Aspirin_BP_batchC.pdf",
    overall_status: "REVIEW",
    product_match: {
      requested_sku: "ASP-BP",
      matched_product: "Aspirin BP",
      match_score: 0.95,
      match_method: "substring_hit",
    },
    parameters: MOCK_JOB_RESULT.parameters.slice(0, 11).map((p, i) => ({
      ...p,
      id:`asp-${i + 1}`,
      validation_status: (i >= 8 ? "REVIEW" : "PASS") as ValidationStatusKey,
      notes: i >= 8 ? "Awaiting SME sign-off per internal SOP." : null,
    })),
  },
};

export async function mockFetchResult(jobId: string): Promise<CoaJobResult> {
  await delay(200);
  const id = jobId || MOCK_JOB_RESULT.id;
  const base = MOCK_RESULTS_BY_JOB_ID[id] ?? {
    ...MOCK_JOB_RESULT,
    id,
  };
  return {
    ...base,
    id,
    created_at: new Date().toISOString(),
  };
}

export async function mockListSubmissions(): Promise<SubmissionSummary[]> {
  await delay(150);
  return [...MOCK_RECENT_SUBMISSIONS];
}

export function mockExportUrl(jobId: string, format: "json" | "csv" | "pdf"): string {
  return `/export/preview/${jobId}.${format}`;
}