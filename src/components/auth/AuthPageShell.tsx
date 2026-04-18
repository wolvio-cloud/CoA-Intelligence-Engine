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
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12 text-slate-900">
      <div className="w-full max-w-[400px]">
        <header className="mb-12 flex flex-col items-center">
          <div className="flex flex-col items-center">
            <Link href="/login" className="flex items-center gap-4 outline-none ring-offset-4 focus-visible:ring-2 focus-visible:ring-indigo-500/40 rounded-xl">
              {brand.logoSrc && (
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white p-2 shadow-sm ring-1 ring-slate-200">
                  <img src={brand.logoSrc} alt={brand.logoAlt} className="h-full w-full object-contain" />
                </div>
              )}
              <div className="flex flex-col text-left">
                <span className="text-3xl font-bold text-slate-900 tracking-tight leading-none">Axivera</span>
                <span className="text-sm text-slate-500 font-medium tracking-wide mt-1.5 uppercase">Pharmaceuticals</span>
              </div>
            </Link>
            <div className="mt-8 w-full border-t border-slate-200 pt-4 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">
                {brand.tagline}
              </p>
            </div>
          </div>
        </header>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            {subtitle ? <p className="mt-1 text-sm text-slate-500 leading-relaxed">{subtitle}</p> : null}
          </div>
          {children}
        </div>
{/* 
        <p className="mt-8 text-center text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
          Secure quality platform
        </p> */}
      </div>
    </div>
  );
}
