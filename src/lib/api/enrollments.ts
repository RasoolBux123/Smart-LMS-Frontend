import { getCourse } from "./courses";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type Enrollment = {
  id: string;
  userId: string;
  courseId: string;
  status: string;
  enrolledAt?: string;
  progress?: number;
  course?: {
    id: string;
    title: string;
    description: string;
    instructorId: string;
    category: string;
    level: string;
    durationWeeks: number;
    thumbnail: string;
    enrollmentCount: number;
    status: string;
  };
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

// ✅ FIX: /enrollments -> /enrollments/me (GET "" route exist hi nahi karta backend mein)
export const getStudentCourses = async (): Promise<Enrollment[]> => {
  try {
    const response = await fetch(`${API_BASE}/enrollments/me`, {
      headers: authHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Request failed (${response.status})`);
    }

    const data = await response.json();
    const enrollments: Enrollment[] = Array.isArray(data?.data) ? data.data : [];

    // ✅ /enrollments/me course details join nahi karta backend mein,
    // isliye har enrollment ke liye course alag se fetch karke enrich kar rahe hain
    const enriched = await Promise.all(
      enrollments.map(async (e) => {
        try {
          const course = await getCourse(e.courseId);
          return { ...e, course: course as any };
        } catch {
          return e; // course fetch fail ho to bhi enrollment dikha do, bas course details khali
        }
      }),
    );

    return enriched;
  } catch (error) {
    console.error("Failed to fetch student courses:", error);
    return [];
  }
};