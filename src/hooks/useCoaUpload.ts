"use client";

import { useCallback, useState } from "react";
import { uploadCoa } from "@/lib/api";
import type { PipelineStage } from "@/lib/types";

export function useCoaUpload() {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initialStage, setInitialStage] = useState<PipelineStage>("idle");

  const upload = useCallback(async (file: File) => {
    setJobId(null);
    setUploading(true);
    setError(null);
    setFileName(file.name);
    try {
      const res = await uploadCoa(file);
      setJobId(res.id);
      setInitialStage("intake");
      return res.id;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Upload could not be queued.";
      setError(message);
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
