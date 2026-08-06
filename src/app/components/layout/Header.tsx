"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_THEME, MobileMenuButton } from "./Sidebar";

const TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/users": "Manage Users",
  "/admin/courses": "All Courses",
  "/admin/analytics": "Analytics",
  "/instructor": "Dashboard",
  "/instructor/courses": "My Courses",
  "/instructor/assignments": "Assignments",
  "/instructor/quizzes": "Quizzes",
  "/instructor/students": "Students & Enrollment",
  "/instructor/gradebook": "Gradebook",
  "/student": "Dashboard",
  "/student/courses": "My Courses",
  "/student/assignments": "Assignments",
  "/student/quizzes": "Quizzes",
  "/student/grades": "My Grades",
  "/student/insights": "Learning Insights",
  "/notifications": "Notifications",
};

function resolveTitle(pathname: string) {
  if (TITLES[pathname]) return TITLES[pathname];
  const match = Object.keys(TITLES)
    .filter((k) => pathname.startsWith(`${k}/`))
    .sort((a, b) => b.length - a.length)[0];
  return match ? TITLES[match] : "SmartLMS";
}

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { user } = useAuth();
  const pathname = usePathname();
  if (!user) return null;

  const title = resolveTitle(pathname);
  const theme = ROLE_THEME[user.role];

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <MobileMenuButton onClick={onMenuClick} />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              SmartLMS
            </p>
            <h1 className="truncate font-display text-lg font-semibold text-slate-900 sm:text-xl">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span
            className="hidden rounded-full px-3 py-1 text-xs font-semibold capitalize sm:inline-flex"
            style={{ backgroundColor: theme.soft, color: theme.accent }}
          >
            {user.role}
          </span>
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white ring-2 ring-white shadow-lg"
            style={{ backgroundColor: theme.accent }}
            title={user.name}
          >
            {user.name.slice(0, 2).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
