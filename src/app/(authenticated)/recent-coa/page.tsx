"use client";

import { useSearchParams } from "next/navigation";
import { RecentCoaPage } from "@/components/pages/RecentCoaPage";

export default function RecentCoaRoute() {
  const searchParams = useSearchParams();
  let statusFilter = searchParams.get("status") || undefined;
  const status2 = searchParams.get("status2");
  const dispositionFilter = searchParams.get("disposition") || undefined;

  // Combine multiple status filters
  if (statusFilter && status2) {
    statusFilter = `${statusFilter},${status2}`;
  }

  return (
    <RecentCoaPage
      statusFilter={statusFilter}
      dispositionFilter={dispositionFilter}
    />
  );
}
