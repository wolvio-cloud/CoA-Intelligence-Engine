import type { ValidationStatusKey } from "@/config/brand";
export type { ValidationStatusKey };

export type PipelineStage =
  | "idle"
  | "intake"
  | "extract"
  | "validate"
  | "store"
  | "complete";

export interface SpecLimit {
  min_value: number | null;
  max_value: number | null;
  text: string | null;
}

export interface CoaParameter {
  id: string;
  name: string;
  result_value: string;
  unit: string | null;
  spec_limit: SpecLimit;
  validation_status: ValidationStatusKey;
  confidence: number;
  notes: string | null;
}

export interface ProductMatch {
  requested_sku: string | null;
  matched_product: string;
  match_score: number;
  match_method: string;
}

export interface CoaJobResult {
  id: string;
  filename: string;
  created_at: string;
  stage: PipelineStage;
  product_match: ProductMatch;
  parameters: CoaParameter[];
  overall_status: ValidationStatusKey;
}

export interface SubmissionSummary {
  id: string;
  filename: string;
  created_at: string;
  stage: Exclude<PipelineStage, "idle">;
  overall_status: ValidationStatusKey;
  parameter_count: number;
}

export const MOCK_JOB_RESULT: CoaJobResult = {
  id: "coa-paracetamol-2026-001",
  filename: "CoA_Paracetamol_IP_Lot42.pdf",
  created_at: new Date().toISOString(),
  stage: "complete",
  product_match: {
    requested_sku: "PARA-IP",
    matched_product: "Paracetamol IP",
    match_score: 0.98,
    match_method: "substring_hit",
  },
  overall_status: "WARNING",
  parameters: [
    {
      id: "p1",
      name: "Description",
      result_value: "White to off-white crystalline powder",
      unit: null,
      spec_limit: { min_value: null, max_value: null, text: "White or almost white, crystalline powder" },
      validation_status: "PASS",
      confidence: 0.94,
      notes: null,
    },
    {
      id: "p2",
      name: "Identification A (IR)",
      result_value: "Conforms",
      unit: null,
      spec_limit: { min_value: null, max_value: null, text: "Conforms to RS" },
      validation_status: "PASS",
      confidence: 0.91,
      notes: null,
    },
    {
      id: "p3",
      name: "Identification B (HPLC)",
      result_value: "Conforms",
      unit: null,
      spec_limit: { min_value: null, max_value: null, text: "RT matches reference" },
      validation_status: "PASS",
      confidence: 0.89,
      notes: null,
    },
    {
      id: "p4",
      name: "Appearance of solution",
      result_value: "Clear and colorless",
      unit: null,
      spec_limit: { min_value: null, max_value: null, text: "Clear and NMT Y7" },
      validation_status: "PASS",
      confidence: 0.88,
      notes: null,
    },
    {
      id: "p5",
      name: "pH (1% w/v solution)",
      result_value: "6.1",
      unit: null,
      spec_limit: { min_value: 5.5, max_value: 6.5, text: null },
      validation_status: "PASS",
      confidence: 0.93,
      notes: null,
    },
    {
      id: "p6",
      name: "Loss on drying",
      result_value: "0.08",
      unit: "%",
      spec_limit: { min_value: null, max_value: 0.5, text: null },
      validation_status: "PASS",
      confidence: 0.95,
      notes: null,
    },
    {
      id: "p7",
      name: "Sulphated ash",
      result_value: "0.03",
      unit: "%",
      spec_limit: { min_value: null, max_value: 0.1, text: null },
      validation_status: "PASS",
      confidence: 0.92,
      notes: null,
    },
    {
      id: "p8",
      name: "Related substances — Impurity A",
      result_value: "0.04",
      unit: "%",
      spec_limit: { min_value: null, max_value: 0.05, text: null },
      validation_status: "PASS",
      confidence: 0.87,
      notes: null,
    },
    {
      id: "p9",
      name: "Related substances — Any other impurity",
      result_value: "0.06",
      unit: "%",
      spec_limit: { min_value: null, max_value: 0.05, text: null },
      validation_status: "FAIL",
      confidence: 0.82,
      notes: "Single impurity exceeds 0.05% limit — confirm system suitability and integration.",
    },
    {
      id: "p10",
      name: "Related substances — Total impurities",
      result_value: "0.11",
      unit: "%",
      spec_limit: { min_value: null, max_value: 0.15, text: null },
      validation_status: "PASS",
      confidence: 0.9,
      notes: null,
    },
    {
      id: "p11",
      name: "Assay (anhydrous basis)",
      result_value: "99.6",
      unit: "%",
      spec_limit: { min_value: 99.0, max_value: 101.0, text: null },
      validation_status: "PASS",
      confidence: 0.96,
      notes: null,
    },
    {
      id: "p12",
      name: "Residual solvents — Class 2",
      result_value: "ND",
      unit: "ppm",
      spec_limit: { min_value: null, max_value: null, text: "Per ICH Q3C" },
      validation_status: "WARNING",
      confidence: 0.78,
      notes: "ND reported — verify LOQ against internal policy.",
    },
    {
      id: "p13",
      name: "Heavy metals",
      result_value: "<10",
      unit: "ppm",
      spec_limit: { min_value: null, max_value: 10, text: null },
      validation_status: "PASS",
      confidence: 0.84,
      notes: null,
    },
    {
      id: "p14",
      name: "Microbial enumeration — TAMC",
      result_value: "<10",
      unit: "CFU/g",
      spec_limit: { min_value: null, max_value: null, text: "NMT 10² CFU/g" },
      validation_status: "REVIEW",
      confidence: 0.8,
      notes: "Microbiology section flagged for SME review.",
    },
    {
      id: "p15",
      name: "Microbial enumeration — TYMC",
      result_value: "<10",
      unit: "CFU/g",
      spec_limit: { min_value: null, max_value: null, text: "NMT 10¹ CFU/g" },
      validation_status: "REVIEW",
      confidence: 0.79,
      notes: "Confirm incubation conditions on source CoA image.",
    },
  ],
};

export const MOCK_RECENT_SUBMISSIONS: SubmissionSummary[] = [
  {
    id: "coa-paracetamol-2026-001",
    filename: "CoA_Paracetamol_IP_Lot42.pdf",
    created_at: new Date().toISOString(),
    stage: "complete",
    overall_status: "WARNING",
    parameter_count: 15,
  },
  {
    id: "sub-8841",
    filename: "Ibuprofen_USP_RMG.pdf",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    stage: "complete",
    overall_status: "PASS",
    parameter_count: 12,
  },
  {
    id: "sub-8830",
    filename: "Aspirin_BP_batchC.pdf",
    created_at: new Date(Date.now() - 172800000).toISOString(),
    stage: "complete",
    overall_status: "REVIEW",
    parameter_count: 11,
  },
];