"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
      } else {
        if (user.role === "manager") {
          router.replace("/qc-panel");
        } else {
          router.replace("/dashboard");
        }
      }
    }
  }, [loading, user, router]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#f0f2f5] text-sm text-slate-500">
      <div className="flex flex-col items-center gap-3">
        <svg className="h-6 w-6 animate-spin text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        <span>Preparing your workspace…</span>
      </div>
    </div>
  );
}
