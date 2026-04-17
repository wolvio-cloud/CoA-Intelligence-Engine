"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RecentCoaPage } from "@/components/pages/RecentCoaPage";

export default function RecentCoaRoute() {
  return (
    <DashboardLayout>
      <RecentCoaPage />
    </DashboardLayout>
  );
}
