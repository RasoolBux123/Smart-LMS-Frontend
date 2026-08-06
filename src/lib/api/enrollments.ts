import { apiFetch } from "./client";

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: string;
  enrolledAt?: string;
  student?: { id: string; name: string; email: string };
}

export async function enrollStudent(courseId: string, userId: string) {
  return apiFetch("/enrollments", {
    method: "POST",
    body: JSON.stringify({ courseId, userId }),
  });
}

export async function listCourseEnrollments(courseId: string) {
  return apiFetch(`/enrollments/course/${courseId}`);
}

export async function unenrollStudent(enrollmentId: string) {
  return apiFetch(`/enrollments/${enrollmentId}`, { method: "DELETE" });
}
