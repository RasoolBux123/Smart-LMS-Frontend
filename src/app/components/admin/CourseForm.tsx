// components/CourseForm.tsx
"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Course, CoursePayload, Instructor } from "@/lib/courses-api";

type Props = {
  initial: Course | null; // null = create mode
  instructors: Instructor[];
  submitting: boolean;
  submitError: string | null;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (payload: CoursePayload) => void;
};

export default function CourseForm({
  initial,
  instructors,
  submitting,
  submitError,
  submitLabel,
  onCancel,
  onSubmit,
}: Props) {
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    category: initial?.category ?? "",
    instructor_id: initial?.instructor_id ?? "",
    duration_weeks: initial?.duration_weeks?.toString() ?? "",
    status: initial?.status ?? ("draft" as "draft" | "published"),
  });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.title.trim()) next.title = "Course title is required.";
    if (!form.description.trim()) next.description = "Description is required.";
    if (!form.category.trim()) next.category = "Course category is required.";
    if (!form.instructor_id) next.instructor_id = "Select an instructor.";
    if (form.duration_weeks && Number(form.duration_weeks) <= 0)
      next.duration_weeks = "Duration must be a positive number.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      instructor_id: form.instructor_id,
      duration_weeks: form.duration_weeks ? Number(form.duration_weeks) : null,
      status: form.status,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Course title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder="e.g. Full Stack Web Development"
          className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.title ? "border-red-400" : "border-slate-300"
          }`}
        />
        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          rows={3}
          placeholder="What will students learn in this course?"
          className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${
            errors.description ? "border-red-400" : "border-slate-300"
          }`}
        />
        {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.category}
            onChange={(e) => updateField("category", e.target.value)}
            placeholder="e.g. Full Stack Development, AI, Cybersecurity"
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.category ? "border-red-400" : "border-slate-300"
            }`}
          />
          {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Instructor <span className="text-red-500">*</span>
          </label>
          <select
            value={form.instructor_id}
            onChange={(e) => updateField("instructor_id", e.target.value)}
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.instructor_id ? "border-red-400" : "border-slate-300"
            }`}
          >
            <option value="">Select instructor</option>
            {instructors.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
          {errors.instructor_id && (
            <p className="text-xs text-red-500 mt-1">{errors.instructor_id}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Duration (weeks)
          </label>
          <input
            type="number"
            min={1}
            value={form.duration_weeks}
            onChange={(e) => updateField("duration_weeks", e.target.value)}
            placeholder="e.g. 12"
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.duration_weeks ? "border-red-400" : "border-slate-300"
            }`}
          />
          {errors.duration_weeks && (
            <p className="text-xs text-red-500 mt-1">{errors.duration_weeks}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <select
            value={form.status}
            onChange={(e) => updateField("status", e.target.value as "draft" | "published")}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      {submitError && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {submitError}
        </p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-lg transition-colors"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}