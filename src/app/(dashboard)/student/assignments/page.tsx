"use client";

import { useEffect, useState } from "react";
import { listCourses, Course } from "@/lib/api/courses";
import { listAssignmentsForCourse, submitAssignment, Assignment } from "@/lib/api/assignments";

export default function StudentAssignmentsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedIds, setSubmittedIds] = useState<string[]>([]);

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

  async function handleSubmit(assignmentId: string) {
    setSubmitting(true);
    try {
      await submitAssignment(assignmentId, content);
      setSubmittedIds((prev) => [...prev, assignmentId]);
      setOpenId(null);
      setContent("");
    } catch (err: any) {
      alert(err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-slate-900">Assignments</h2>
        <p className="mt-1 text-sm text-slate-500">Submit your work before the due date.</p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : assignments.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-400">
          No assignments yet.
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => {
            const done = submittedIds.includes(a.id);
            return (
              <div key={a.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{a.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {courseTitle(a.courseId)} · Due {new Date(a.dueAt).toLocaleDateString()}
                    </p>
                    {a.description && <p className="mt-2 text-sm text-slate-600">{a.description}</p>}
                  </div>
                  {done ? (
                    <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
                      Submitted
                    </span>
                  ) : (
                    <button
                      onClick={() => setOpenId(openId === a.id ? null : a.id)}
                      className="rounded-xl bg-teal-600 px-3 py-1.5 text-sm font-medium text-white"
                    >
                      Submit
                    </button>
                  )}
                </div>
                {openId === a.id && !done && (
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={4}
                      placeholder="Write your submission or paste a link…"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none"
                    />
                    <button
                      onClick={() => handleSubmit(a.id)}
                      disabled={submitting}
                      className="mt-3 rounded-xl bg-teal-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                    >
                      {submitting ? "Submitting…" : "Confirm submission"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
