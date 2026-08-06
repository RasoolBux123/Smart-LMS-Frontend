"use client";

import { useState } from "react";
import { createAssignment } from "../../../lib/api/assignments";
import { Course } from "../../../lib/api/courses";

export default function CreateAssignmentDrawer({
  open, onClose, courses, onCreated,
}: { open: boolean; onClose: () => void; courses: Course[]; onCreated: (a: any) => void }) {
  const [form, setForm] = useState({ courseId: "", title: "", description: "", dueAt: "", maxScore: 100 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await createAssignment({
        courseId: form.courseId,
        title: form.title,
        description: form.description,
        type: "assignment",
        dueAt: new Date(form.dueAt).toISOString(),
        maxScore: Number(form.maxScore),
      });
      onCreated(res.data);
      setForm({ courseId: "", title: "", description: "", dueAt: "", maxScore: 100 });
      onClose();
    } catch (err: any) {
      setError(err.message || "Could not create assignment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`fixed inset-0 z-50 transition-opacity ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className={`absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl transition-transform duration-300 overflow-y-auto ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="px-6 py-5 border-b border-slate-100">
          <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">New assignment</p>
          <h2 className="font-display text-lg font-semibold text-slate-900 mt-1">Create assignment</h2>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          {error && <p className="text-sm rounded-md bg-red-50 text-red-600 px-3 py-2">{error}</p>}
          <div>
            <label className="text-xs font-medium text-slate-600">Course</label>
            <select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} required
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none">
              <option value="">Select course</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Due date</label>
            <input type="date" value={form.dueAt} onChange={(e) => setForm({ ...form, dueAt: e.target.value })} required
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Max score</label>
            <input type="number" value={form.maxScore} onChange={(e) => setForm({ ...form, maxScore: Number(e.target.value) })} required
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white disabled:opacity-60">
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}