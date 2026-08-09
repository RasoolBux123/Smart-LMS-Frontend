const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type Project = {
  id: string;
  courseId: string;
  courseTitle?: string;
  title: string;
  description: string;
  instructions?: string;
  dueAt: string;
  maxScore: number;
  maxFileSizeMb?: number;
  allowedFileTypes?: string[];
  status: string;
  attachmentUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
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

export const listMyProjects = (): Promise<Project[]> =>
  fetch(`${API_BASE}/projects/instructor/my-projects`, { headers: authHeaders() }).then(handle);

export const listStudentProjects = (): Promise<Project[]> =>
  fetch(`${API_BASE}/projects/student/my-projects`, { headers: authHeaders() }).then(handle);

export const listProjectsByCourse = (courseId: string): Promise<Project[]> =>
  fetch(`${API_BASE}/projects/course/${courseId}`, { headers: authHeaders() }).then(handle);

export const getProject = (id: string): Promise<Project> =>
  fetch(`${API_BASE}/projects/${id}`, { headers: authHeaders() }).then(handle);

export const deleteProject = (id: string): Promise<void> =>
  fetch(`${API_BASE}/projects/${id}`, { method: "DELETE", headers: authHeaders() }).then(handle);