"use client";

import React, { type ReactNode } from "react";
import Link from "next/link";
import { brand, brandColors } from "@/config/brand";

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
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-200 px-4 py-12">
      <div className="w-full max-w-[380px]">
        <header className="mb-10">
          <div className="flex flex-col items-center">
            <Link href="/login" className="flex items-center gap-3 outline-none group text-left">
              {brand.logoSrc && (
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white p-1 border border-slate-200 shadow-sm transition group-hover:border-slate-300">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={brand.logoSrc} alt={brand.logoAlt} className="h-full w-full object-contain" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-slate-900 tracking-tight leading-none">Axivera</span>
                <span className="text-xs text-slate-400 font-medium tracking-wide mt-1">Pharmaceuticals</span>
              </div>
            </Link>
            <div className="w-full border-t border-slate-200/60 pt-2 text-center">
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-slate-400 whitespace-nowrap">
                {brand.tagline}
              </p>
            </div>
          </div>
        </header>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-sm font-bold text-slate-900">{title}</h2>
            {subtitle ? <p className="mt-2 text-xs font-semibold text-slate-400 leading-relaxed">{subtitle}</p> : null}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
