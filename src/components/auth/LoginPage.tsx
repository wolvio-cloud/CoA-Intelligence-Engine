"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { brand } from "@/config/brand";

export function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    await signIn(email, password);
    setLoading(false);
  };

  return (
    <div className="flex h-full min-h-screen items-center justify-center bg-[#f0f2f5] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-white text-sm font-bold tracking-tight shadow-lg"
            style={{ backgroundColor: "#1a2332" }}
          >
            CoA
          </div>
          <h1 className="text-xl font-semibold text-slate-900">{brand.productName}</h1>
          <p className="mt-1 text-sm text-slate-500">{brand.tagline}</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-sm font-semibold text-slate-900">Sign in to your account</h2>
            <p className="mt-0.5 text-xs text-slate-400">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="text"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-red-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150"
            >
              {loading && (
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              )}
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-slate-400">
          Secure QA Platform
        </p>
      </div>
    </div>
  );
}
