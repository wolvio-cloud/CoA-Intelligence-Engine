"use client";

import { useEffect, useState } from "react";
import { mockFetchResult } from "@/lib/api";
import type { CoaJobResult } from "@/lib/types";

export function useCoaResult(jobId: string | null, shouldLoad: boolean) {
  const [data, setData] = useState<CoaJobResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!shouldLoad) {
      setData(null);
      return;
    }
    const id = jobId ?? "session";
    let cancelled = false;
    setLoading(true);
    setData(null);
    mockFetchResult(id)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [jobId, shouldLoad]);

  return { data, loading };
}