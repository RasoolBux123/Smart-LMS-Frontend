import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  UserCircle,
  GraduationCap,
  ClipboardList,
  ClipboardCheck,
  FolderKanban,
  BookOpen,
  BarChart3,
  Bell,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/types";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}
import { CalendarCheck2 } from "lucide-react";

/**
 * Routes (dashboard) group ke hisaab se hain:
 * dashboard home `/student` aur `/instructor` hai, `/xyz/dashboard` nahi.
 */
export const studentNav: NavItem[] = [
  { label: "Dashboard", href: "/student", icon: LayoutDashboard },
  { label: "My Courses", href: "/student/courses", icon: BookOpen },
  { label: "Assignments", href: "/student/assignments", icon: FileText },
  { label: "Exams", href: "/student/exams", icon: ClipboardCheck },
  { label: "Quizzes", href: "/student/quizzes", icon: ClipboardList },
  { label: "Projects", href: "/student/projects", icon: FolderKanban },
  { label: "Grades", href: "/student/grades", icon: GraduationCap },
  { label: "Attendance", href: "/student/attendance", icon: CalendarCheck2 },
  { label: "Insights", href: "/student/insights", icon: BarChart3 },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Profile", href: "/profile", icon: UserCircle },
  { label: "Settings", href: "/settings", icon: Settings },
];

export const instructorNav: NavItem[] = [
  { label: "Dashboard", href: "/instructor", icon: LayoutDashboard },
  { label: "Courses", href: "/instructor/courses", icon: BookOpen },
  { label: "Assignments", href: "/instructor/assignments", icon: FileText },
  { label: "Exams", href: "/instructor/exams", icon: ClipboardCheck },
  { label: "Quizzes", href: "/instructor/quizzes", icon: ClipboardList },
  { label: "Projects", href: "/instructor/projects", icon: FolderKanban },
  { label: "Submissions", href: "/instructor/submissions", icon: GraduationCap },
  { label: "Gradebook", href: "/instructor/gradebook", icon: BarChart3 },
  { label: "Attendance", href: "/instructor/attendance", icon: CalendarCheck2 },
  { label: "Students", href: "/instructor/students", icon: Users },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Profile", href: "/profile", icon: UserCircle },
  { label: "Settings", href: "/settings", icon: Settings },
];

export const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Courses", href: "/admin/courses", icon: BookOpen },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Profile", href: "/profile", icon: UserCircle },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function navFor(role: Role): NavItem[] {
  if (role === "admin") return adminNav;
  if (role === "instructor") return instructorNav;
  return studentNav;
}
