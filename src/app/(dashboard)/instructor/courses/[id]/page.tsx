"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, UserPlus, Trash2, FileText, ClipboardList, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { getCourse, type Course } from "@/lib/api/courses";
import {
  listCourseEnrollments,
  enrollStudent,
  unenrollStudent,
  type Enrollment,
} from "@/lib/api/enrollments";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type StudentOption = { id: string; name: string; email: string };

function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

async function listStudents(): Promise<StudentOption[]> {
  const res = await fetch(`${API_BASE}/users?role=student`, { headers: authHeaders() });
  const body = await res.json().catch(() => null);
  if (!res.ok || body?.success === false) {
    throw new Error(body?.message || body?.detail || "Failed to load students");
  }
  return body?.data !== undefined ? body.data : body;
}

export default function InstructorCourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (id) loadAll();
  }, [id]);

  async function loadAll() {
    try {
      setLoading(true);
      setError(null);
      const [courseData, enrollmentData, studentData] = await Promise.all([
        getCourse(id),
        listCourseEnrollments(id),
        listStudents(),
      ]);
      setCourse(courseData);
      setEnrollments(enrollmentData);
      setStudents(studentData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load course.");
    } finally {
      setLoading(false);
    }
  }

  const enrolledIds = new Set(enrollments.map((e) => e.userId));
  const availableStudents = students.filter((s) => !enrolledIds.has(s.id));

  async function handleEnroll() {
    if (!selectedStudentId) {
      toast.error("Please select a student.");
      return;
    }
    try {
      setEnrolling(true);
      await enrollStudent(id, selectedStudentId);
      toast.success("Student enrolled.");
      setSelectedStudentId("");
      const updated = await listCourseEnrollments(id);
      setEnrollments(updated);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to enroll student.");
    } finally {
      setEnrolling(false);
    }
  }

  async function handleUnenroll(enrollmentId: string) {
    try {
      setRemovingId(enrollmentId);
      await unenrollStudent(enrollmentId);
      setEnrollments((prev) => prev.filter((e) => e.id !== enrollmentId));
      toast.success("Student removed from course.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove student.");
    } finally {
      setRemovingId(null);
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

  if (error || !course) {
    return (
      <div className="text-center py-24">
        <p className="text-slate-500 mb-4">{error || "Course not found."}</p>
        <button
          onClick={() => router.push("/instructor/courses")}
          className="text-indigo-600 hover:underline text-sm font-medium"
        >
          Back to my courses
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => router.push("/instructor/courses")}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to my courses
      </button>

      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
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
            <h1 className="text-2xl font-bold text-slate-900 mt-2">{course.title}</h1>
          </div>
        </div>

        <p className="text-slate-700 leading-relaxed mb-4">{course.description}</p>

        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
          <button
            onClick={() => router.push(`/instructor/courses/${course.id}/assignments/new`)}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            Assignment
          </button>
          <button
            onClick={() => router.push(`/instructor/courses/${course.id}/projects/new`)}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            Project
          </button>
          <button
            onClick={() => router.push(`/instructor/courses/${course.id}/quizzes/new`)}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Quiz
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Enrolled students ({enrollments.length})
        </h2>

        <div className="flex items-center gap-3 mb-5">
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select a student to enroll</option>
            {availableStudents.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.email})
              </option>
            ))}
          </select>
          <button
            onClick={handleEnroll}
            disabled={enrolling || !selectedStudentId}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap"
          >
            {enrolling ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            Enroll
          </button>
        </div>

        {enrollments.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No students enrolled yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {enrollments.map((e) => (
              <li key={e.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{e.student?.name || e.userId}</p>
                  <p className="text-xs text-slate-500">{e.student?.email}</p>
                </div>
                <button
                  onClick={() => handleUnenroll(e.id)}
                  disabled={removingId === e.id}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  aria-label="Remove student"
                >
                  {removingId === e.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}