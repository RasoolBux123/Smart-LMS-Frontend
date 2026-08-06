"use client";

import { useEffect, useState } from "react";
import { listCourses, Course } from "@/lib/api/courses";
import { listAssignmentsForCourse, myGrades, Assignment, Submission } from "@/lib/api/assignments";

type Row = {
  assignment: Assignment;
  submission?: Submission;
};

export default function StudentGradesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listCourses().then((res) => {
      setCourses(res.data);
      if (res.data[0]) setCourseId(res.data[0].id);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!courseId) return;
    async function load() {
      const [aRes, gRes] = await Promise.all([
        listAssignmentsForCourse(courseId),
        myGrades(courseId),
      ]);
      const byAssignment = new Map<string, Submission>(
        gRes.data.map((s: Submission) => [s.assignmentId, s])
      );
      setRows(
        aRes.data.map((a: Assignment) => ({
          assignment: a,
          submission: byAssignment.get(a.id),
        }))
      );
    }
    load();
  }, [courseId]);

  if (loading) return <p className="text-sm text-slate-400">Loading…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-slate-900">My grades</h2>
        <p className="mt-1 text-sm text-slate-500">Scores and feedback across your enrolled courses.</p>
      </div>

      <select
        value={courseId}
        onChange={(e) => setCourseId(e.target.value)}
        className="max-w-md rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
      >
        {courses.length === 0 && <option value="">No enrolled courses</option>}
        {courses.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}
          </option>
        ))}
      </select>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-6 py-3">Assessment</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Score</th>
              <th className="px-6 py-3">Feedback</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-slate-400">
                  No assessments for this course.
                </td>
              </tr>
            )}
            {rows.map(({ assignment, submission }) => (
              <tr key={assignment.id} className="border-b border-slate-50 last:border-0">
                <td className="px-6 py-4 font-medium text-slate-900">{assignment.title}</td>
                <td className="px-6 py-4 capitalize text-slate-600">{assignment.type}</td>
                <td className="px-6 py-4 text-slate-700">
                  {submission?.score != null
                    ? `${submission.score} / ${assignment.maxScore}`
                    : submission
                      ? "Submitted · pending grade"
                      : "Not submitted"}
                </td>
                <td className="px-6 py-4 text-slate-500">{submission?.feedback || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
