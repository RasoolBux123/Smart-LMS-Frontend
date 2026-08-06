"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import { useAuth } from "../../hooks/useAuth";

const ROLE_HOME = {
  admin: "/admin",
  instructor: "/instructor",
  student: "/student",
} as const;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    const home = ROLE_HOME[user.role];
    const allowed =
      pathname === "/notifications" ||
      pathname === home ||
      pathname.startsWith(`${home}/`);
    if (!allowed) router.replace(home);
  }, [loading, user, pathname, router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-[#F7F9FC]">
        <div className="hero-grid absolute inset-0 opacity-30" />
        <div className="relative flex flex-col items-center gap-3 rounded-[2rem] border border-slate-200/80 bg-white/80 px-8 py-7 shadow-[0_24px_70px_-30px_rgba(15,23,42,0.3)] backdrop-blur">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
          <p className="text-sm text-slate-400">Loading workspace…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="relative flex min-h-screen bg-[#F7F9FC]">
      <div className="hero-grid pointer-events-none absolute inset-0 opacity-25" />
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="relative flex min-w-0 flex-1 flex-col">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-6xl animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
