// dashboard/admin/courses/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Pencil, Trash2, X, Save } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const COURSE_ENDPOINT = (id: string) => `${API_BASE}/api/courses/${id}`;
const INSTRUCTORS_ENDPOINT = `${API_BASE}/api/users?role=instructor`;

const CATEGORIES = [
  "Full Stack Development",
  "Artificial Intelligence",
  "Data Science",
  "Web Development",
  "Mobile Development",
  "Cloud Computing",
  "DevOps",
  "Cybersecurity",
  "UI/UX Design",
];

type Instructor = { id: string; name: string };

type Course = {
  id: string;
  title: string;
  description: string;
  category: string;
  instructor_id: string;
  instructor_name?: string;
  duration_weeks?: number;
  status: "draft" | "published";
};

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<Course | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof Course, string>>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (id) {
      loadCourse();
      loadInstructors();
    }
  }, [id]);

  async function loadCourse() {
    setLoading(true);
    setNotFound(false);
    try {
      const res = await fetch(COURSE_ENDPOINT(id));
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      if (!res.ok) throw new Error("Failed to load course");
      const data = await res.json();
      setCourse(data);
      setForm(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadInstructors() {
    try {
      const res = await fetch(INSTRUCTORS_ENDPOINT);
      if (!res.ok) throw new Error("Failed to load instructors");
      setInstructors(await res.json());
    } catch (err) {
      console.error(err);
    }
  }

  function updateField<K extends keyof Course>(key: K, value: Course[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    if (!form) return false;
    const next: Partial<Record<keyof Course, string>> = {};
    if (!form.title.trim()) next.title = "Course title is required.";
    if (!form.description.trim()) next.description = "Description is required.";
    if (!form.category) next.category = "Select a category.";
    if (!form.instructor_id) next.instructor_id = "Select an instructor.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSave() {
    if (!form || !validate()) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(COURSE_ENDPOINT(id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          category: form.category,
          instructor_id: form.instructor_id,
          duration_weeks: form.duration_weeks || null,
          status: form.status,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail || "Failed to save changes.");
      }
      const updated: Course = await res.json();
      setCourse(updated);
      setForm(updated);
      setIsEditing(false);
    } catch (err: any) {
      setSaveError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(COURSE_ENDPOINT(id), { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete course.");
      router.push("/admin/courses");
    } catch (err: any) {
      setDeleteError(err.message || "Something went wrong. Please try again.");
      setIsDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading course...
      </div>
    );
  }

  if (notFound || !course || !form) {
    return (
      <div className="text-center py-24">
        <p className="text-slate-500 mb-4">Course not found.</p>
        <button
          onClick={() => router.push("/admin/courses")}
          className="text-indigo-600 hover:underline text-sm font-medium"
        >
          Back to all courses
        </button>
      </div>
    );
  }

  const instructorName =
    course.instructor_name || instructors.find((i) => i.id === course.instructor_id)?.name || "—";

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => router.push("/admin/courses")}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to courses
      </button>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                course.status === "published"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {course.status === "published" ? "Published" : "Draft"}
            </span>
            {!isEditing && (
              <h1 className="text-2xl font-bold text-slate-900 mt-2">{course.title}</h1>
            )}
          </div>

          {!isEditing && (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>

        {!isEditing ? (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                Description
              </p>
              <p className="text-slate-700 leading-relaxed">{course.description}</p>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-2">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                  Category
                </p>
                <p className="text-slate-800 text-sm">{course.category}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                  Instructor
                </p>
                <p className="text-slate-800 text-sm">{instructorName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                  Duration
                </p>
                <p className="text-slate-800 text-sm">
                  {course.duration_weeks ? `${course.duration_weeks} weeks` : "—"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Course title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
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
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${
                  errors.description ? "border-red-400" : "border-slate-300"
                }`}
              />
              {errors.description && (
                <p className="text-xs text-red-500 mt-1">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.category ? "border-red-400" : "border-slate-300"
                  }`}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-xs text-red-500 mt-1">{errors.category}</p>
                )}
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
                  value={form.duration_weeks ?? ""}
                  onChange={(e) =>
                    updateField("duration_weeks", e.target.value ? Number(e.target.value) : undefined)
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => updateField("status", e.target.value as Course["status"])}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            {saveError && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {saveError}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setForm(course);
                  setErrors({});
                  setSaveError(null);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-lg transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save changes
              </button>
            </div>
          </div>
        )}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Delete this course?</h2>
            <p className="text-sm text-slate-500 mb-5">
              This will permanently remove "{course.title}". This action can't be undone.
            </p>
            {deleteError && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
                {deleteError}
              </p>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 rounded-lg transition-colors"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}