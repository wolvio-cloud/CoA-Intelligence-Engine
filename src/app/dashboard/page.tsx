"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardPage } from "@/components/pages/DashboardPage";

export default function DashboardRoute() {
  return (
    <DashboardLayout>
      <DashboardPage onNavigate={() => {}} />
    </DashboardLayout>
  );
}
