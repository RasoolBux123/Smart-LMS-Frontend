// app/(dashboard)/admin/courses/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2, BookOpen, Pencil, Trash2 } from "lucide-react";
import { coursesApi, instructorsApi, Course, CoursePayload, Instructor } from "@/lib/api/courses";
import CourseForm from "@/components/admin/CourseForm";

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    coursesApi.list().then(setCourses).catch(console.error).finally(() => setLoading(false));
    instructorsApi.list().then(setInstructors).catch(console.error);
  }, []);

  function openCreateModal() {
    setEditingCourse(null);
    setSubmitError(null);
    setIsModalOpen(true);
  }

  function openEditModal(course: Course) {
    setEditingCourse(course);
    setSubmitError(null);
    setIsModalOpen(true);
  }

  async function handleCreate(payload: CoursePayload) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const created = await coursesApi.create(payload);
      setCourses((prev) => [created, ...prev]);
      setIsModalOpen(false);
    } catch (err: any) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(payload: CoursePayload) {
    if (!editingCourse) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const updated = await coursesApi.update(editingCourse.id, payload);
      setCourses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setIsModalOpen(false);
      setEditingCourse(null);
    } catch (err: any) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(course: Course) {
    if (!window.confirm(`Delete "${course.title}"? This cannot be undone.`)) return;
    setDeletingId(course.id);
    try {
      await coursesApi.remove(course.id);
      setCourses((prev) => prev.filter((c) => c.id !== course.id));
    } catch (err: any) {
      alert(err.message || "Failed to delete course.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">All courses</h1>
          <p className="text-slate-500 mt-1">Platform-wide course catalog.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create course
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Instructor</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                  Loading courses...
                </td>
              </tr>
            ) : courses.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                  <BookOpen className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                  No courses yet.
                </td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr
                  key={course.id}
                  onClick={() => router.push(`/admin/courses/${course.id}`)}
                  className="hover:bg-slate-50 cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{course.title}</div>
                    <div className="text-sm text-slate-500 line-clamp-1">{course.description}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{course.category}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {course.instructorName ||
                      instructors.find((i) => i.id === course.instructorId)?.name ||
                      "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        course.status === "published"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {course.status === "published" ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(course);
                        }}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        aria-label="Edit course"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(course);
                        }}
                        disabled={deletingId === course.id}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        aria-label="Delete course"
                      >
                        {deletingId === course.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingCourse ? "Edit course" : "Create course"}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingCourse(null);
                }}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5">
              <CourseForm
                initial={editingCourse}
                instructors={instructors}
                submitting={submitting}
                submitError={submitError}
                submitLabel={editingCourse ? "Save changes" : "Create course"}
                onCancel={() => {
                  setIsModalOpen(false);
                  setEditingCourse(null);
                }}
                onSubmit={editingCourse ? handleUpdate : handleCreate}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}