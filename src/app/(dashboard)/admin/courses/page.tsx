// app/(dashboard)/admin/courses/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2, BookOpen } from "lucide-react";
// src/app/(dashboard)/admin/courses/page.tsx
import { coursesApi, instructorsApi, Course, CoursePayload, Instructor } from "@/lib/api/courses";
import CourseForm from "@/components/admin/CourseForm";

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    coursesApi.list().then(setCourses).catch(console.error).finally(() => setLoading(false));
    instructorsApi.list().then(setInstructors).catch(console.error);
  }, []);

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

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">All courses</h1>
          <p className="text-slate-500 mt-1">Platform-wide course catalog.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
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
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                  Loading courses...
                </td>
              </tr>
            ) : courses.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center text-slate-400">
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
                    {course.instructor_name ||
                      instructors.find((i) => i.id === course.instructor_id)?.name ||
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
              <h2 className="text-lg font-semibold text-slate-900">Create course</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5">
              <CourseForm
                initial={null}
                instructors={instructors}
                submitting={submitting}
                submitError={submitError}
                submitLabel="Create course"
                onCancel={() => setIsModalOpen(false)}
                onSubmit={handleCreate}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}