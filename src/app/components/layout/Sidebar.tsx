"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, type Role } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  ListChecks,
  GraduationCap,
  ClipboardList,
  Sparkles,
  Bell,
  LogOut,
  Menu,
  X,
  UserPlus,
} from "lucide-react";

type NavItem = {
  name: string;
  path: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
};

const MENUS: Record<Role, NavItem[]> = {
  admin: [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Courses", path: "/admin/courses", icon: BookOpen },
    { name: "Analytics", path: "/admin/analytics", icon: Sparkles },
  ],
  instructor: [
    { name: "Dashboard", path: "/instructor", icon: LayoutDashboard },
    { name: "Courses", path: "/instructor/courses", icon: BookOpen },
    { name: "Assignments", path: "/instructor/assignments", icon: FileText },
    { name: "Quizzes", path: "/instructor/quizzes", icon: ListChecks },
    { name: "Students", path: "/instructor/students", icon: UserPlus },
    { name: "Gradebook", path: "/instructor/gradebook", icon: ClipboardList },
  ],
  student: [
    { name: "Dashboard", path: "/student", icon: LayoutDashboard },
    { name: "My Courses", path: "/student/courses", icon: BookOpen },
    { name: "Assignments", path: "/student/assignments", icon: FileText },
    { name: "Quizzes", path: "/student/quizzes", icon: ListChecks },
    { name: "Grades", path: "/student/grades", icon: GraduationCap },
    { name: "Insights", path: "/student/insights", icon: Sparkles },
  ],
};

export const ROLE_THEME: Record<
  Role,
  { accent: string; soft: string; ring: string; label: string }
> = {
  admin: { accent: "#B45309", soft: "#FFFBEB", ring: "#F59E0B", label: "Administrator" },
  instructor: { accent: "#4338CA", soft: "#EEF2FF", ring: "#6366F1", label: "Instructor" },
  student: { accent: "#0F766E", soft: "#F0FDFA", ring: "#14B8A6", label: "Student" },
};

function isActive(pathname: string, path: string) {
  if (path === "/admin" || path === "/instructor" || path === "/student") {
    return pathname === path;
  }
  return pathname === path || pathname.startsWith(`${path}/`);
}

function SidebarNav({
  onNavigate,
  className = "",
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  if (!user) return null;

  const theme = ROLE_THEME[user.role];
  const items = MENUS[user.role];

  return (
    <aside className={`flex h-full w-64 flex-col border-r border-slate-200/80 bg-white/90 ${className}`}>
      <div className="flex items-center gap-3 px-5 py-5">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-bold text-white shadow-lg"
          style={{ backgroundColor: theme.accent }}
        >
          SL
        </div>
        <div className="min-w-0">
          <p className="font-display text-[17px] font-semibold tracking-tight text-slate-900">
            SmartLMS
          </p>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
            {theme.label}
          </p>
        </div>
      </div>

      <div className="mx-4 mb-3 rounded-2xl border border-slate-100 px-3 py-3" style={{ backgroundColor: theme.soft }}>
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: theme.accent }}
          >
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        <p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Navigation
        </p>
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
              style={active ? { backgroundColor: theme.accent } : undefined}
            >
              <Icon size={18} strokeWidth={2} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-slate-100 px-3 py-4">
        <Link
          href="/notifications"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <Bell size={18} />
          Notifications
        </Link>
        <button
          type="button"
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default function Sidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {/* Desktop sidebar — in document flow, no overlap */}
      <div className="hidden h-screen w-64 shrink-0 border-r border-slate-200 md:block">
        <div className="sticky top-0 h-screen">
          <SidebarNav />
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            aria-label="Close menu"
            onClick={onClose}
          />
          <div className="absolute inset-y-0 left-0 flex shadow-2xl">
            <SidebarNav onNavigate={onClose} className="border-r border-slate-200" />
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm md:hidden"
      aria-label="Open menu"
    >
      <Menu size={18} />
    </button>
  );
}
