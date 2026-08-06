"use client";

import { useEffect, useState } from "react";
import { listCourses, Course } from "@/lib/api/courses";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listCourses()
      .then((res) => setCourses(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-slate-900">All courses</h2>
        <p className="mt-1 text-sm text-slate-500">Platform-wide course catalog.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3">Description</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center text-slate-400">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && courses.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center text-slate-400">
                  No courses yet.
                </td>
              </tr>
            )}
            {courses.map((c) => (
              <tr key={c.id} className="border-b border-slate-50 last:border-0">
                <td className="px-6 py-4 font-medium text-slate-900">{c.title}</td>
                <td className="px-6 py-4 text-slate-600 line-clamp-2">{c.description || "—"}</td>
                <td className="px-6 py-4 capitalize text-slate-600">{c.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
