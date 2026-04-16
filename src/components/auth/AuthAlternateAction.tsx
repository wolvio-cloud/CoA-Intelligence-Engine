"use client";

import React, { type ReactNode } from "react";

/** Single secondary line (e.g. switch between sign in / register). */
export function AuthAlternateAction({ children }: { children: ReactNode }) {
  return (
    <div className="border-t border-slate-100/90 bg-gradient-to-b from-white to-slate-50/50 px-6 py-4">
      <p className="text-center text-[13px] leading-relaxed tracking-wide text-slate-500">{children}</p>
    </div>
  );
}
