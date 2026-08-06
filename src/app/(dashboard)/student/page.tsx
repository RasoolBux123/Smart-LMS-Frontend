"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listCourses, Course } from "@/lib/api/courses";
import { listAssignmentsForCourse } from "@/lib/api/assignments";
import { BookOpen, FileText, ListChecks, ClipboardCheck, ArrowUpRight } from "lucide-react";

export default function StudentOverviewPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [quizCount, setQuizCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const cRes = await listCourses();
        setCourses(cRes.data);
        let pending = 0;
        let quizzes = 0;
        for (const c of cRes.data) {
          const aRes = await listAssignmentsForCourse(c.id);
          pending += aRes.data.filter((a: { type: string }) => a.type === "assignment").length;
          quizzes += aRes.data.filter((a: { type: string }) => a.type === "quiz").length;
        }
        setPendingCount(pending);
        setQuizCount(quizzes);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const stats = [
    {
      label: "Enrolled courses",
      value: courses.length,
      icon: BookOpen,
      href: "/student/courses",
      tint: "bg-teal-50 text-teal-700",
    },
    {
      label: "Assignments",
      value: pendingCount,
      icon: FileText,
      href: "/student/assignments",
      tint: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Quizzes",
      value: quizCount,
      icon: ListChecks,
      href: "/student/quizzes",
      tint: "bg-cyan-50 text-cyan-700",
    },
    {
      label: "Grades",
      value: "Open",
      icon: ClipboardCheck,
      href: "/student/grades",
      tint: "bg-slate-100 text-slate-700",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-slate-200/80 bg-white/80 p-6 shadow-[0_24px_70px_-30px_rgba(15,23,42,0.25)] backdrop-blur">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600">Student workspace</p>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-slate-900">
              Your learning hub
            </h2>
          </div>
          <p className="text-sm text-slate-500">
            Courses, deadlines, quizzes, and grades in one place.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.label}
              href={s.href}
              className="group rounded-[1.5rem] border border-slate-200/80 bg-white/90 p-5 shadow-[0_16px_35px_-20px_rgba(15,23,42,0.2)] transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-[0_24px_50px_-20px_rgba(20,184,166,0.3)]"
            >
              <div className="flex items-start justify-between">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${s.tint}`}>
                  <Icon size={20} />
                </div>
                <ArrowUpRight size={16} className="text-slate-300 group-hover:text-teal-600" />
              </div>
              <p className="mt-5 font-display text-2xl font-semibold text-slate-900">
                {loading ? "—" : s.value}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-500">{s.label}</p>
            </Link>
          );
        })}
      </section>

      <section className="rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-5 shadow-[0_20px_45px_-25px_rgba(15,23,42,0.2)] sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-slate-900">Enrolled courses</h3>
          <Link href="/student/courses" className="text-sm font-semibold text-teal-700 hover:underline">
            Open all
          </Link>
        </div>
        {loading ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : courses.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
            Not enrolled yet — ask your instructor to add you to a course.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {courses.slice(0, 6).map((c) => (
              <Link
                key={c.id}
                href="/student/courses"
                className="rounded-2xl border border-slate-100 bg-teal-50/40 p-4 transition hover:border-teal-200 hover:bg-white"
              >
                <p className="font-semibold text-slate-900">{c.title}</p>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
                  {c.description || "No description"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
