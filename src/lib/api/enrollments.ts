const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type Enrollment = {
  id: string;
  userId: string;
  courseId: string;
  status: string;
  enrolledAt?: string;
  student?: {
    id: string;
    name: string;
    email: string;
  };
};

function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

async function handle(res: Response) {
  const body = await res.json().catch(() => null);
  if (!res.ok || body?.success === false) {
    throw new Error(body?.message || body?.detail || `Request failed (${res.status})`);
  }
  return body?.data !== undefined ? body.data : body;
}

export const enrollStudent = (courseId: string, userId: string): Promise<Enrollment> =>
  fetch(`${API_BASE}/enrollments`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ courseId, userId }),
  }).then(handle);

export const listCourseEnrollments = (courseId: string): Promise<Enrollment[]> =>
  fetch(`${API_BASE}/enrollments/course/${courseId}`, { headers: authHeaders() }).then(handle);

export const unenrollStudent = (enrollmentId: string): Promise<void> =>
  fetch(`${API_BASE}/enrollments/${enrollmentId}`, {
    method: "DELETE",
    headers: authHeaders(),
  }).then(handle);