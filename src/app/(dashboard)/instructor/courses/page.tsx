// app/(dashboard)/instructor/courses/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, BookOpen, FileText, ClipboardList, HelpCircle } from "lucide-react";
import { coursesApi, Course } from "@/lib/api/courses";

export default function InstructorCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    coursesApi
      .list()
      .then(setCourses)
      .catch((err: any) => setError(err.message || "Failed to load courses."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">My courses</h1>
        <p className="text-slate-500 mt-1">
          Select a course to manage assignments, projects, and quizzes.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading courses...
        </div>
      ) : error ? (
        <div className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          {error}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-white border border-slate-200 rounded-xl">
          <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p className="font-medium text-slate-500">No courses assigned to you yet.</p>
          <p className="text-sm mt-1">
            Ask an admin to assign you as instructor on a course to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div
  key={course.id}
  onClick={() => router.push(`/instructor/courses/${course.id}`)}
  className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-shadow cursor-pointer"
>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-slate-900 line-clamp-1">{course.title}</h3>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                    course.status === "published"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {course.status === "published" ? "Published" : "Draft"}
                </span>
              </div>
              <p className="text-sm text-slate-500 line-clamp-2 mb-4">{course.description}</p>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
  onClick={(e) => {
    e.stopPropagation();
    router.push(`/instructor/courses/${course.id}/assignments/new`);
  }}
  className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-colors"
>
  <FileText className="w-3.5 h-3.5" />
  Assignment
</button>
<button
  onClick={(e) => {
    e.stopPropagation();
    router.push(`/instructor/courses/${course.id}/projects/new`);
  }}
  className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-colors"
>
  <ClipboardList className="w-3.5 h-3.5" />
  Project
</button>
<button
  onClick={(e) => {
    e.stopPropagation();
    router.push(`/instructor/courses/${course.id}/quizzes/new`);
  }}
  className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-colors"
>
  <HelpCircle className="w-3.5 h-3.5" />
  Quiz
</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}