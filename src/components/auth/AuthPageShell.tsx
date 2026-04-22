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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#d6dee8] px-5 py-14 sm:px-8">
      <div className="w-full max-w-md">
        <header className="mb-12 flex flex-col items-center">
          <Link
            href="/login"
            className="group flex flex-col items-center text-center outline-none focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-slate-500/30 focus-visible:ring-offset-4 focus-visible:ring-offset-[#d6dee8]"
          >
            {brand.logoSrc && brand.logoPresentation === "wordmark" ? (
              <>
                <div className="rounded-xl bg-black px-8 py-4 shadow-sm transition group-hover:shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={brand.logoSrc}
                    alt={brand.logoAlt}
                    className="mx-auto h-12 w-auto max-w-[min(100%,300px)] object-contain transition-opacity group-hover:opacity-95 sm:h-14"
                  />
                </div>
                <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500">
                  {brand.tagline}
                </p>
              </>
            ) : (
              <div className="flex flex-col items-center gap-5">
                <div className="flex items-center gap-3">
                  {brand.logoSrc ? (
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-300/60 p-1 transition group-hover:border-slate-400/80">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={brand.logoSrc} alt={brand.logoAlt} className="h-full w-full object-contain" />
                    </div>
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-slate-300/60 text-lg font-bold text-slate-600">
                      {brand.logoMark}
                    </div>
                  )}
                  <div className="flex flex-col text-left">
                    <span className="text-2xl font-bold tracking-tight text-slate-800 leading-none">{brand.productName}</span>
                    {brand.productSubtitle ? (
                      <span className="mt-1 text-xs font-medium tracking-wide text-slate-500">{brand.productSubtitle}</span>
                    ) : null}
                  </div>
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500">{brand.tagline}</p>
              </div>
            )}
          </Link>
        </header>

        <div className="overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_16px_48px_-16px_rgba(15,23,42,0.18)]">
          <div className="border-b border-slate-200/80 px-6 py-5">
            <h2 className="text-sm font-bold text-slate-900">{title}</h2>
            {subtitle ? <p className="mt-2 text-xs font-semibold text-slate-500 leading-relaxed">{subtitle}</p> : null}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
