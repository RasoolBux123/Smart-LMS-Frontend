// src/lib/api/courses.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type Instructor = { id: string; name: string };

export type Course = {
  id: string;
  title: string;
  description: string;
  category: string;
  instructorId: string;
  instructorName?: string;
  durationWeeks?: number;
  status: string; // backend uses "active" / "inactive" etc, not just draft/published
};

export type CoursePayload = {
  title: string;
  description: string;
  category: string;
  instructorId: string;
  durationWeeks: number | null;
  status: string;
};

export type Module = {
  id: string;
  courseId: string;
  title: string;
  order: number;
};

export type Material = {
  id: string;
  moduleId: string;
  title: string;
  type: "video" | "document" | "link" | "other";
  url?: string;
  order: number;
};

const coursesUrl = (id?: string) =>
  id ? `${API_BASE}/courses/${id}` : `${API_BASE}/courses`;
const instructorsUrl = `${API_BASE}/users?role=instructor`;
const modulesUrl = (courseId: string) => `${API_BASE}/api/courses/${courseId}/modules`;
const materialsUrl = (moduleId: string) => `${API_BASE}/api/modules/${moduleId}/materials`;

// ---- auth: attaches the logged-in user's token to every request ----
function authHeaders(): HeadersInit {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

// ---- unwraps { success, data, message } envelope your FastAPI backend returns ----
async function handle(res: Response) {
  const body = await res.json().catch(() => null);
  if (!res.ok || body?.success === false) {
    throw new Error(body?.message || body?.detail || `Request failed (${res.status})`);
  }
  // supports both wrapped ({success, data}) and plain responses
  return body?.data !== undefined ? body.data : body;
}

// ---- courses ----
export const listCourses = (): Promise<Course[]> =>
  fetch(coursesUrl(), { headers: authHeaders() }).then(handle);

export const getCourse = (id: string): Promise<Course> =>
  fetch(coursesUrl(id), { headers: authHeaders() }).then(handle);

export const createCourse = (payload: CoursePayload): Promise<Course> =>
  fetch(coursesUrl(), {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  }).then(handle);

export const updateCourse = (id: string, payload: CoursePayload): Promise<Course> =>
  fetch(coursesUrl(id), {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  }).then(handle);

export const deleteCourse = (id: string): Promise<void> =>
  fetch(coursesUrl(id), { method: "DELETE", headers: authHeaders() }).then(handle);

export const listInstructors = (): Promise<Instructor[]> =>
  fetch(instructorsUrl, { headers: authHeaders() }).then(handle);

// ---- modules ----
export const listModules = (courseId: string): Promise<Module[]> =>
  fetch(modulesUrl(courseId), { headers: authHeaders() }).then(handle);

// ---- materials ----
export const listMaterials = (moduleId: string): Promise<Material[]> =>
  fetch(materialsUrl(moduleId), { headers: authHeaders() }).then(handle);

// ---- grouped objects (used by admin courses pages) ----
export const coursesApi = {
  list: listCourses,
  get: getCourse,
  create: createCourse,
  update: updateCourse,
  remove: deleteCourse,
};

export const instructorsApi = {
  list: listInstructors,
};