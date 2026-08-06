"use client";

import { useEffect, useState } from "react";
import { listCourses, Course } from "@/lib/api/courses";
import {
  listAssignmentsForCourse,
  submitQuiz,
  Assignment,
} from "@/lib/api/assignments";

export default function StudentQuizzesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [quizzes, setQuizzes] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [done, setDone] = useState<Record<string, number>>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const cRes = await listCourses();
      setCourses(cRes.data);
      const all: Assignment[] = [];
      for (const c of cRes.data) {
        const aRes = await listAssignmentsForCourse(c.id);
        all.push(...aRes.data.filter((a: Assignment) => a.type === "quiz"));
      }
      setQuizzes(all);
      setLoading(false);
    }
    load();
  }, []);

  const courseTitle = (id: string) => courses.find((c) => c.id === id)?.title || "—";

  function startQuiz(q: Assignment) {
    setActiveId(q.id);
    setAnswers(new Array(q.questions?.length || 0).fill(-1));
    setError("");
  }

  async function handleSubmit(quizId: string) {
    if (answers.some((a) => a < 0)) {
      setError("Answer all questions before submitting");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await submitQuiz(quizId, answers);
      setDone((prev) => ({ ...prev, [quizId]: res.data.score ?? 0 }));
      setActiveId(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-slate-900">Quizzes</h2>
        <p className="mt-1 text-sm text-slate-500">Take quizzes and get instant auto-graded scores.</p>
      </div>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : quizzes.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-400">
          No quizzes available yet.
        </div>
      ) : (
        <div className="space-y-3">
          {quizzes.map((q) => {
            const scored = done[q.id];
            return (
              <div key={q.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{q.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {courseTitle(q.courseId)} · Due {new Date(q.dueAt).toLocaleDateString()} · Max {q.maxScore}
                    </p>
                  </div>
                  {scored != null ? (
                    <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                      Score: {scored}
                    </span>
                  ) : (
                    <button
                      onClick={() => startQuiz(q)}
                      className="rounded-xl bg-teal-600 px-3 py-1.5 text-sm font-medium text-white"
                    >
                      Take quiz
                    </button>
                  )}
                </div>

                {activeId === q.id && scored == null && (
                  <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
                    {(q.questions || []).map((question, qi) => (
                      <div key={qi} className="rounded-xl bg-slate-50 p-4">
                        <p className="text-sm font-medium text-slate-800">
                          {qi + 1}. {question.question}
                        </p>
                        <div className="mt-3 space-y-2">
                          {question.options.map((opt, oi) => (
                            <label key={oi} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                              <input
                                type="radio"
                                name={`q-${q.id}-${qi}`}
                                checked={answers[qi] === oi}
                                onChange={() => {
                                  const next = [...answers];
                                  next[qi] = oi;
                                  setAnswers(next);
                                }}
                              />
                              {opt}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => handleSubmit(q.id)}
                      disabled={submitting}
                      className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
                    >
                      {submitting ? "Submitting…" : "Submit quiz"}
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
