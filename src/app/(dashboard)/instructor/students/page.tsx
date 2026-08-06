"use client";

import { useEffect, useState } from "react";
import { listCourses, Course } from "@/lib/api/courses";
import { listUsers, ManagedUser } from "@/lib/api/users";
import {
  enrollStudent,
  listCourseEnrollments,
  unenrollStudent,
  Enrollment,
} from "@/lib/api/enrollments";

export default function InstructorStudentsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<ManagedUser[]>([]);
  const [courseId, setCourseId] = useState("");
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function boot() {
      try {
        const [c, s] = await Promise.all([listCourses(), listUsers("student")]);
        setCourses(c.data);
        setStudents(s.data);
        if (c.data[0]) setCourseId(c.data[0].id);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    boot();
  }, []);

  useEffect(() => {
    if (!courseId) return;
    listCourseEnrollments(courseId)
      .then((res) => setEnrollments(res.data))
      .catch((e) => setError(e.message));
  }, [courseId]);

  const enrolledIds = new Set(enrollments.map((e) => e.userId));
  const available = students.filter((s) => !enrolledIds.has(s.id));

  async function handleEnroll(e: React.FormEvent) {
    e.preventDefault();
    if (!courseId || !studentId) return;
    setBusy(true);
    setError("");
    try {
      const res = await enrollStudent(courseId, studentId);
      setEnrollments((prev) => [res.data, ...prev]);
      setStudentId("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleUnenroll(id: string) {
    setBusy(true);
    try {
      await unenrollStudent(id);
      setEnrollments((prev) => prev.filter((e) => e.id !== id));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p className="text-sm text-slate-400">Loading…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-slate-900">Students & enrollment</h2>
        <p className="mt-1 text-sm text-slate-500">Enroll students into your courses so they can see content and assignments.</p>
      </div>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Course</label>
        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="w-full max-w-md rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
        >
          {courses.length === 0 && <option value="">No courses</option>}
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>

        <form onSubmit={handleEnroll} className="flex flex-col gap-3 sm:flex-row">
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          >
            <option value="">Select student to enroll</option>
            {available.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.email})
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={busy || !courseId || available.length === 0}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            Enroll
          </button>
        </form>
        {students.length === 0 && (
          <p className="text-sm text-amber-600">Ask admin to create student accounts first.</p>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-6 py-3">Student</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {enrollments.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-slate-400">
                  No students enrolled in this course.
                </td>
              </tr>
            )}
            {enrollments.map((e) => (
              <tr key={e.id} className="border-b border-slate-50 last:border-0">
                <td className="px-6 py-4 font-medium text-slate-900">{e.student?.name || e.userId}</td>
                <td className="px-6 py-4 text-slate-600">{e.student?.email || "—"}</td>
                <td className="px-6 py-4 capitalize text-slate-600">{e.status}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleUnenroll(e.id)}
                    disabled={busy}
                    className="text-sm font-medium text-rose-600 hover:underline"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
