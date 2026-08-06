"use client";

import { Sparkles } from "lucide-react";

export default function ComingSoon({
  title = "Coming soon",
  description = "This module is planned for a later sprint (analytics, AI, or automation).",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="max-w-md rounded-2xl border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <Sparkles size={22} />
        </div>
        <h2 className="font-display text-xl font-semibold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
      </div>
    </div>
  );
}
