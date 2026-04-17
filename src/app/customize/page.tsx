"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CustomizePage } from "@/components/pages/CustomizePage";

export default function CustomizeRoute() {
  return (
    <DashboardLayout>
      <CustomizePage />
    </DashboardLayout>
  );
}
