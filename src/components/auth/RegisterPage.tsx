"use client";

import React, { type FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AuthAlternateAction } from "./AuthAlternateAction";
import { AuthPageShell } from "./AuthPageShell";

const inputClass =
  "w-full rounded-lg border border-slate-200/90 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-900/[0.06]";

export function RegisterPage() {
  const { user, loading: authLoading, register } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("analyst");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) router.replace("/");
  }, [authLoading, user, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await register(email.trim(), password, fullName.trim() || undefined, role);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        {authLoading ? "Loading…" : "Redirecting…"}
      </div>
    );
  }

  return (
    <AuthPageShell title="Create account" subtitle="Set up access for your organization in a minute.">
      <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500" htmlFor="reg-fullName">
            Full name <span className="font-normal normal-case text-slate-400">(optional)</span>
          </label>
          <input
            id="reg-fullName"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
            placeholder="Jane Smith"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500" htmlFor="reg-email">
            Email
          </label>
          <input
            id="reg-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="name@company.com"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500" htmlFor="reg-password">
            Password
          </label>
          <div className="relative">
            <input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputClass} pr-10`}
              placeholder="At least 8 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500" htmlFor="reg-role">
            Organization Role
          </label>
          <div className="relative">
            <select
              id="reg-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={`${inputClass} appearance-none pr-10`}
            >
              <option value="analyst">QC Analyst</option>
              <option value="manager">QC Manager</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Managers perform final release sign-offs. Analysts verify and acknowledge extraction.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 rounded-lg border border-red-200/80 bg-red-50/90 px-3.5 py-3">
            <svg
              className="mt-0.5 h-4 w-4 shrink-0 text-red-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-xs leading-relaxed text-red-800">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition enabled:hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/25 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55"
          style={{ backgroundColor: "#1a2332" }}
        >
          {loading && (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          )}
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <AuthAlternateAction>
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-slate-800 transition hover:text-blue-700">
          Log in
        </Link>
      </AuthAlternateAction>
    </AuthPageShell>
  );
}
