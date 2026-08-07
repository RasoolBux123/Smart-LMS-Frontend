"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { errorMessage } from "@/lib/utils";

type Role = "admin" | "instructor" | "student";

const ROLES: { key: Role; label: string; accent: string; soft: string }[] = [
  { key: "student", label: "Student", accent: "#0D9488", soft: "#F0FDFA" },
  { key: "instructor", label: "Instructor", accent: "#4F46E5", soft: "#EEF2FF" },
  { key: "admin", label: "Admin", accent: "#D97706", soft: "#FFFBEB" },
];

export default function LoginPage() {
  const { login } = useAuth();
  const [role, setRole] = useState<Role>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const active = ROLES.find((r) => r.key === role)!;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      setError(errorMessage(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center px-4 py-10 sm:px-6"
      style={{
        background: `radial-gradient(circle at top left, ${active.soft} 0%, rgba(255,255,255,0.92) 45%, #f8fafc 100%)`,
      }}
    >
      <div className="hero-grid absolute inset-0 opacity-40" />
      <div className="glass-card relative w-full max-w-md overflow-hidden rounded-[2rem]">
        <div className="border-b border-slate-100 px-8 py-7" style={{ backgroundColor: active.soft }}>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold text-white shadow-lg animate-float" style={{ backgroundColor: active.accent }}>
            SL
          </div>
          <h1 className="font-display text-2xl font-semibold text-slate-900">Welcome to SmartLMS</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in and continue your learning journey.</p>
        </div>

        <div className="px-8 py-7">
          <div className="mb-6 flex rounded-2xl border border-slate-200 bg-slate-50/90 p-1">
            {ROLES.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRole(r.key)}
                className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${
                  role === r.key ? "text-white shadow-sm" : "text-slate-500"
                }`}
                style={role === r.key ? { backgroundColor: r.accent } : undefined}
              >
                {r.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200/80 transition disabled:opacity-60"
              style={{ backgroundColor: active.accent }}
            >
              {loading ? "Signing in…" : `Sign in as ${active.label}`}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            Instructor and student accounts are created by an admin.
          </p>
        </div>
      </div>
    </div>
  );
}
