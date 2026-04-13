"use client";

import { useCallback, useState } from "react";
import { mockUploadCoa } from "@/lib/api";
import type { PipelineStage } from "@/lib/types";

export function useCoaUpload() {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initialStage, setInitialStage] = useState<PipelineStage>("idle");

  const upload = useCallback(async (file: File) => {
    setUploading(true);
    setError(null);
    setFileName(file.name);
    try {
      const res = await mockUploadCoa(file.name);
      setJobId(res.id);
      setInitialStage(res.stage);
      return res.id;
    } catch {
      setError("Upload could not be queued. Retry with a PDF or image CoA.");
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setFileName(null);
    setJobId(null);
    setError(null);
    setInitialStage("idle");
  }, []);

  return {
    upload,
    uploading,
    fileName,
    jobId,
    error,
    initialStage,
    reset,
    setJobId,
  };
}