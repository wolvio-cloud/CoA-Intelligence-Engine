"use client";

import React, { type ReactNode } from "react";
import Link from "next/link";
import { brand } from "@/config/brand";

export function AuthPageShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-[#f0f2f5] to-slate-100/90 px-4 py-12">
      <div className="w-full max-w-[400px]">
        <header className="mb-9 text-center">
          <Link href="/login" className="inline-flex flex-col items-center outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-slate-400/40 rounded-2xl">
            <div
              className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl text-[11px] font-bold tracking-wide text-white shadow-md ring-1 ring-black/5 transition hover:brightness-105"
              style={{ backgroundColor: "#1a2332" }}
            >
              CoA
            </div>
          </Link>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">{brand.productName}</h1>
          <p className="mt-1.5 text-[13px] leading-snug text-slate-500">{brand.tagline}</p>
        </header>

        <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_40px_-12px_rgba(15,23,42,0.08)]">
          <div className="border-b border-slate-100/90 px-6 py-5">
            <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">{title}</h2>
            {subtitle ? <p className="mt-1 text-[13px] leading-relaxed text-slate-500">{subtitle}</p> : null}
          </div>
          {children}
        </div>

        <p className="mt-8 text-center text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
          Secure quality platform
        </p>
      </div>
    </div>
  );
}
