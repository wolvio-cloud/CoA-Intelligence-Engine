"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { NewCoaPage } from "@/components/pages/NewCoaPage";

export default function NewCoaRoute() {
  return (
    <DashboardLayout>
      <NewCoaPage />
    </DashboardLayout>
  );
}
