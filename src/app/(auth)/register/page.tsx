"use client";

import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#f4f7ff] px-6 py-10">
      <div className="hero-grid absolute inset-0 opacity-40" />
      <div className="glass-card relative w-full max-w-md rounded-[2rem] border border-slate-200/80 p-8 text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-sm font-bold text-white shadow-lg">
          SL
        </div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">Registration is invite-only</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">
          Instructor and student accounts are created by an Admin from the Users panel.
          Use the login page once you have credentials.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200/80 transition hover:opacity-95"
        >
          Go to login
        </Link>
      </div>
    </div>
  );
}
