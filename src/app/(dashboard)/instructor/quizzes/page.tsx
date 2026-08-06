"use client";

import { useEffect, useState } from "react";
import { listCourses, Course } from "@/lib/api/courses";
import { listAssignmentsForCourse, createAssignment, Assignment } from "@/lib/api/assignments";

type Q = { question: string; options: string[]; correctIndex: number };

export default function InstructorQuizzesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [quizzes, setQuizzes] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    courseId: "",
    title: "",
    description: "",
    dueAt: "",
    maxScore: 100,
  });
  const [questions, setQuestions] = useState<Q[]>([
    { question: "", options: ["", "", "", ""], correctIndex: 0 },
  ]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
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

  useEffect(() => {
    load();
  }, []);

  const courseTitle = (id: string) => courses.find((c) => c.id === id)?.title || "—";

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const cleaned = questions.filter((q) => q.question.trim() && q.options.every((o) => o.trim()));
      if (cleaned.length === 0) throw new Error("Add at least one complete question");
      const res = await createAssignment({
        ...form,
        type: "quiz",
        dueAt: new Date(form.dueAt).toISOString(),
        maxScore: Number(form.maxScore),
        questions: cleaned,
      });
      setQuizzes((prev) => [res.data, ...prev]);
      setOpen(false);
      setForm({ courseId: "", title: "", description: "", dueAt: "", maxScore: 100 });
      setQuestions([{ question: "", options: ["", "", "", ""], correctIndex: 0 }]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-slate-900">Quizzes</h2>
          <p className="mt-1 text-sm text-slate-500">Build auto-graded quizzes for your courses.</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          disabled={courses.length === 0}
          className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          + Create quiz
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3">Course</th>
              <th className="px-6 py-3">Due</th>
              <th className="px-6 py-3">Max</th>
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
            {!loading && quizzes.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-slate-400">
                  No quizzes yet.
                </td>
              </tr>
            )}
            {quizzes.map((q) => (
              <tr key={q.id} className="border-b border-slate-50 last:border-0">
                <td className="px-6 py-4 font-medium text-slate-900">{q.title}</td>
                <td className="px-6 py-4 text-slate-600">{courseTitle(q.courseId)}</td>
                <td className="px-6 py-4 text-slate-600">{new Date(q.dueAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-slate-600">{q.maxScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-lg overflow-y-auto bg-white shadow-xl">
            <div className="border-b border-slate-100 px-6 py-5">
              <h3 className="font-display text-lg font-semibold text-slate-900">Create quiz</h3>
            </div>
            <form onSubmit={handleCreate} className="space-y-4 px-6 py-6">
              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
              <select
                required
                value={form.courseId}
                onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              >
                <option value="">Select course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
              <input
                required
                placeholder="Quiz title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                rows={2}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  required
                  value={form.dueAt}
                  onChange={(e) => setForm({ ...form, dueAt: e.target.value })}
                  className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                />
                <input
                  type="number"
                  required
                  value={form.maxScore}
                  onChange={(e) => setForm({ ...form, maxScore: Number(e.target.value) })}
                  className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                />
              </div>

              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Questions</p>
                {questions.map((q, qi) => (
                  <div key={qi} className="rounded-xl border border-slate-200 p-4 space-y-2">
                    <input
                      placeholder={`Question ${qi + 1}`}
                      value={q.question}
                      onChange={(e) => {
                        const next = [...questions];
                        next[qi] = { ...q, question: e.target.value };
                        setQuestions(next);
                      }}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${qi}`}
                          checked={q.correctIndex === oi}
                          onChange={() => {
                            const next = [...questions];
                            next[qi] = { ...q, correctIndex: oi };
                            setQuestions(next);
                          }}
                        />
                        <input
                          placeholder={`Option ${oi + 1}`}
                          value={opt}
                          onChange={(e) => {
                            const next = [...questions];
                            const options = [...q.options];
                            options[oi] = e.target.value;
                            next[qi] = { ...q, options };
                            setQuestions(next);
                          }}
                          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setQuestions((prev) => [
                      ...prev,
                      { question: "", options: ["", "", "", ""], correctIndex: 0 },
                    ])
                  }
                  className="text-sm font-medium text-indigo-600"
                >
                  + Add question
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-medium text-white disabled:opacity-60">
                  {saving ? "Saving…" : "Create quiz"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
