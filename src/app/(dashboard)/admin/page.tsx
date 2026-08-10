"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listUsers, ManagedUser } from "@/lib/api/users";
import { listCourses, Course } from "@/lib/api/courses";
import {
  Users,
  BookOpen,
  GraduationCap,
  ArrowUpRight,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [instructors, setInstructors] = useState<ManagedUser[]>([]);
  const [students, setStudents] = useState<ManagedUser[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [i, s, c] = await Promise.all([
          listUsers("instructor"),
          listUsers("student"),
          listCourses(),
        ]);

        setInstructors(Array.isArray(i) ? i : []);
        setStudents(Array.isArray(s) ? s : []);
        setCourses(Array.isArray(c) ? c : []);
      } catch (e) {
        console.error("Failed to load admin data:", e);
        setInstructors([]);
        setStudents([]);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const stats = [
    {
      label: "Instructors",
      value: instructors?.length ?? 0,
      href: "/admin/users",
      icon: GraduationCap,
      tint: "bg-indigo-50 text-indigo-700",
    },
    {
      label: "Students",
      value: students?.length ?? 0,
      href: "/admin/users",
      icon: Users,
      tint: "bg-teal-50 text-teal-700",
    },
    {
      label: "Courses",
      value: courses?.length ?? 0,
      href: "/admin/courses",
      icon: BookOpen,
      tint: "bg-amber-50 text-amber-700",
    },
  ];

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
          Admin control center
        </p>

        <h1 className="mt-1 font-display text-3xl font-semibold text-slate-900">
          Platform overview
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Manage users, monitor courses, and keep SmartLMS running smoothly.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;

          return (
            <Link
              key={s.label}
              href={s.href}
              className="group rounded-[1.5rem] border border-slate-200/80 bg-white/90 p-5 shadow-[0_16px_35px_-20px_rgba(15,23,42,0.2)] transition hover:-translate-y-1 hover:border-amber-200 hover:shadow-[0_24px_50px_-20px_rgba(245,158,11,0.35)]"
            >
              <div className="flex items-start justify-between">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl ${s.tint}`}
                >
                  <Icon size={20} />
                </div>

                <ArrowUpRight
                  size={16}
                  className="text-slate-300 group-hover:text-amber-600"
                />
              </div>

              <p className="mt-5 font-display text-3xl font-semibold text-slate-900">
                {loading ? "—" : s.value}
              </p>

              <p className="mt-1 text-sm font-medium text-slate-500">
                {s.label}
              </p>
            </Link>
          );
        })}
      </section>

      <section className="rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-5 shadow-[0_20px_45px_-25px_rgba(15,23,42,0.2)] sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-slate-900">
            Recent courses
          </h3>

          <Link
            href="/admin/courses"
            className="text-sm font-semibold text-amber-700 hover:underline"
          >
            View all
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : courses.length === 0 ? (
          <p className="text-sm text-slate-400">No courses yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {courses.slice(0, 5).map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-4 py-3.5"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">
                    {c.title}
                  </p>

                  <p className="truncate text-xs text-slate-500">
                    {c.description || "No description"}
                  </p>
                </div>

                <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold capitalize text-amber-700">
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}