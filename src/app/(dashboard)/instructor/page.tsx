"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listCourses, Course } from "@/lib/api/courses";
import { listAssignmentsForCourse } from "@/lib/api/assignments";
import { BookOpen, FileText, ListChecks, ArrowUpRight } from "lucide-react";

export default function InstructorOverviewPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignmentCount, setAssignmentCount] = useState(0);
  const [quizCount, setQuizCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const cRes = await listCourses();
        setCourses(cRes.data);
        let assignments = 0;
        let quizzes = 0;
        for (const c of cRes.data) {
          const aRes = await listAssignmentsForCourse(c.id);
          assignments += aRes.data.filter((a: { type: string }) => a.type === "assignment").length;
          quizzes += aRes.data.filter((a: { type: string }) => a.type === "quiz").length;
        }
        setAssignmentCount(assignments);
        setQuizCount(quizzes);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const stats = [
    {
      label: "Courses",
      value: courses.length,
      icon: BookOpen,
      href: "/instructor/courses",
      tint: "bg-indigo-50 text-indigo-700",
    },
    {
      label: "Assignments",
      value: assignmentCount,
      icon: FileText,
      href: "/instructor/assignments",
      tint: "bg-violet-50 text-violet-700",
    },
    {
      label: "Quizzes",
      value: quizCount,
      icon: ListChecks,
      href: "/instructor/quizzes",
      tint: "bg-sky-50 text-sky-700",
    },
  ];

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-display text-2xl font-semibold tracking-tight text-slate-900">
          Welcome back
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">
          Manage courses, assessments, enrollments, and grades from one workspace.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.label}
              href={s.href}
              className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${s.tint}`}>
                  <Icon size={20} />
                </div>
                <ArrowUpRight
                  size={16}
                  className="text-slate-300 transition group-hover:text-indigo-500"
                />
              </div>
              <p className="mt-5 font-display text-3xl font-semibold text-slate-900">
                {loading ? "—" : s.value}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-500">{s.label}</p>
            </Link>
          );
        })}
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h3 className="font-display text-lg font-semibold text-slate-900">Your courses</h3>
          <Link
            href="/instructor/courses"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Manage
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : courses.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 px-6 py-12 text-center">
            <p className="mb-4 text-sm text-slate-500">No courses yet.</p>
            <Link
              href="/instructor/courses"
              className="inline-flex rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              Create your first course
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {courses.slice(0, 6).map((c) => (
              <Link
                key={c.id}
                href="/instructor/courses"
                className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-indigo-200 hover:bg-white"
              >
                <p className="font-semibold text-slate-900">{c.title}</p>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
                  {c.description || "No description"}
                </p>
                <span className="mt-4 inline-flex rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold capitalize text-indigo-700">
                  {c.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
