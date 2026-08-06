"use client";

import { useEffect, useState } from "react";
import { listCourses, Course } from "@/lib/api/courses";
import {
  listAssignmentsForCourse,
  listSubmissions,
  gradeSubmission,
  Assignment,
  Submission,
} from "@/lib/api/assignments";

export default function InstructorGradebookPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState("");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [assignmentId, setAssignmentId] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    listCourses()
      .then((res) => {
        setCourses(res.data);
        if (res.data[0]) setCourseId(res.data[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!courseId) return;
    listAssignmentsForCourse(courseId).then((res) => {
      setAssignments(res.data);
      setAssignmentId(res.data[0]?.id || "");
    });
  }, [courseId]);

  useEffect(() => {
    if (!assignmentId) {
      setSubmissions([]);
      return;
    }
    listSubmissions(assignmentId).then((res) => setSubmissions(res.data));
  }, [assignmentId]);

  async function handleGrade(submissionId: string) {
    const score = Number(scores[submissionId]);
    if (Number.isNaN(score)) {
      setError("Enter a valid score");
      return;
    }
    setError("");
    try {
      const res = await gradeSubmission(submissionId, score, feedbacks[submissionId] || "");
      setSubmissions((prev) => prev.map((s) => (s.id === submissionId ? res.data : s)));
    } catch (e: any) {
      setError(e.message);
    }
  }

  if (loading) return <p className="text-sm text-slate-400">Loading…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-slate-900">Gradebook</h2>
        <p className="mt-1 text-sm text-slate-500">Review submissions and grade student work.</p>
      </div>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
        <select
          value={assignmentId}
          onChange={(e) => setAssignmentId(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
        >
          {assignments.length === 0 && <option value="">No assessments</option>}
          {assignments.map((a) => (
            <option key={a.id} value={a.id}>
              [{a.type}] {a.title}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {submissions.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-400">
            No submissions for this assessment yet.
          </div>
        ) : (
          submissions.map((s) => (
            <div key={s.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-slate-900">Student ID: {s.studentId}</p>
                  <p className="text-xs text-slate-500">
                    Submitted {s.submittedAt ? new Date(s.submittedAt).toLocaleString() : "—"}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    s.score != null ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {s.score != null ? `Score: ${s.score}` : "Ungraded"}
                </span>
              </div>
              {s.content && (
                <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700 whitespace-pre-wrap">
                  {s.content}
                </p>
              )}
              {s.score == null && (
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <input
                    type="number"
                    placeholder="Score"
                    value={scores[s.id] || ""}
                    onChange={(e) => setScores({ ...scores, [s.id]: e.target.value })}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm sm:w-28"
                  />
                  <input
                    placeholder="Feedback (optional)"
                    value={feedbacks[s.id] || ""}
                    onChange={(e) => setFeedbacks({ ...feedbacks, [s.id]: e.target.value })}
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  />
                  <button
                    onClick={() => handleGrade(s.id)}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
                  >
                    Save grade
                  </button>
                </div>
              )}
              {s.feedback && <p className="mt-2 text-xs text-slate-500">Feedback: {s.feedback}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
