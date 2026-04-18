"use client";

import { RecentCoaPage } from "@/components/pages/RecentCoaPage";
import { useParams } from "next/navigation";

export default function CoaDetailRoute() {
  const params = useParams();
  const id = params.id as string;

  return <RecentCoaPage initialId={id} initialView="detail" />;
}
