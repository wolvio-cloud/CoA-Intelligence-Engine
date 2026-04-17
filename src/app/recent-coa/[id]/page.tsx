"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RecentCoaPage } from "@/components/pages/RecentCoaPage";
import { useParams } from "next/navigation";

export default function CoaDetailRoute() {
  const params = useParams();
  const id = params.id as string;

  return (
    <DashboardLayout>
       {/* 
          In a real app, we'd refactor RecentCoaPage to accept an initial ID or view.
          For now, we can pass props if we modify RecentCoaPage, or just render it.
          Actually, let's see how RecentCoaPage handles it.
       */}
      <RecentCoaPage initialId={id} initialView="detail" />
    </DashboardLayout>
  );
}
