"use client";

import { useEffect, useState } from "react";
import { listCourses, Course } from "@/lib/api/courses";
import { listAssignmentsForCourse, Assignment } from "@/lib/api/assignments";
import CreateAssignmentDrawer from "@/app/components/instructor/CreateAssignmentDrawer";

export default function InstructorAssignmentsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  async function loadAll() {
    setLoading(true);
    const cRes = await listCourses();
    setCourses(cRes.data);
    const all: Assignment[] = [];
    for (const c of cRes.data) {
      const aRes = await listAssignmentsForCourse(c.id);
      all.push(...aRes.data.filter((a: Assignment) => a.type === "assignment"));
    }
    setAssignments(all);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  const courseTitle = (id: string) => courses.find((c) => c.id === id)?.title || "—";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-slate-900">Assignments</h2>
          <p className="mt-1 text-sm text-slate-500">Create and track assignments across your courses.</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          disabled={courses.length === 0}
          className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          + Create assignment
        </button>
      </div>

      {courses.length === 0 && !loading && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Create a course first before adding assignments.
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3">Course</th>
              <th className="px-6 py-3">Due</th>
              <th className="px-6 py-3">Max score</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-slate-400">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && assignments.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-slate-400">
                  No assignments yet.
                </td>
              </tr>
            )}
            {assignments.map((a) => (
              <tr key={a.id} className="border-b border-slate-50 last:border-0">
                <td className="px-6 py-4 font-medium text-slate-900">{a.title}</td>
                <td className="px-6 py-4 text-slate-600">{courseTitle(a.courseId)}</td>
                <td className="px-6 py-4 text-slate-600">{new Date(a.dueAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-slate-600">{a.maxScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CreateAssignmentDrawer
        open={open}
        onClose={() => setOpen(false)}
        courses={courses}
        onCreated={(a) => setAssignments((prev) => [a, ...prev])}
      />
    </div>
  );
}
