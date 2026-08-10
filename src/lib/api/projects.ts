const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

import type { Submission, SubmissionStatus } from "@/types";

// ---- Backend se aane wala raw submission shape ----

type RawSubmission = {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName?: string;   // ✅ NEW
  studentEmail?: string;  // ✅ NEW
  content?: string | null;
  score?: number | null;
  feedback?: string | null;
  submittedAt?: string | null;
  gradedAt?: string | null;
};

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

export type ProjectSubmission = {
  id: string;
  assignmentId: string; // project ki id yahan store hoti hai
  studentId: string;
  content?: string | null; // uploaded file ka path
  score?: number | null;
  feedback?: string | null;
  submittedAt?: string | null;
  gradedAt?: string | null;
};

function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

function authHeadersNoContentType(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
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

// ✅ NEW: student submission upload
export const submitProject = (projectId: string, file: File): Promise<ProjectSubmission> => {
  const form = new FormData();
  form.append("file", file);
  return fetch(`${API_BASE}/projects/${projectId}/submit`, {
    method: "POST",
    headers: authHeadersNoContentType(), // Content-Type multipart boundary browser khud set karega
    body: form,
  }).then(handle);
};

// ✅ NEW: student ke apne ek course ke saare submissions
export const getMySubmissionsForCourse = (courseId: string): Promise<ProjectSubmission[]> =>
  fetch(`${API_BASE}/projects/course/${courseId}/my-submissions`, { headers: authHeaders() }).then(handle);

// ✅ NEW: file path ko full downloadable URL mein badalna
export const getFileUrl = (path?: string | null) => (path ? `${API_BASE}/${path}` : "");





// ✅ NEW: instructor — kisi project ki sab submissions
export const listProjectSubmissions = (projectId: string): Promise<RawSubmission[]> =>
  fetch(`${API_BASE}/projects/${projectId}/submissions`, { headers: authHeaders() }).then(handle);

// ✅ NEW: instructor — grade dena
export const gradeSubmission = (
  submissionId: string,
  payload: { score: number; feedback: string },
): Promise<RawSubmission> =>
  fetch(`${API_BASE}/projects/submissions/${submissionId}/grade`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  }).then(handle);

// ✅ NEW: adapter — backend ka RawSubmission ko frontend ke Submission type mein convert karta hai
export function toFrontendSubmission(raw: RawSubmission, totalMarks: number): Submission {
  const status: SubmissionStatus = raw.score != null ? "graded" : "submitted";

  return {
    id: raw.id,
    assignmentId: raw.assignmentId,
    studentId: raw.studentId,
    status,
    submittedAt: raw.submittedAt ?? null,
    files: raw.content
      ? [
        {
          id: raw.id,
          name: raw.content.split("/").pop() ?? "submission",
          kind: "other",
          size: 0,
          url: getFileUrl(raw.content),
        },
      ]
      : [],
    attemptNumber: 1,
    marksAwarded: raw.score ?? null,
    feedback: raw.feedback ?? null,
    passFail:
      raw.score != null ? (raw.score >= totalMarks * 0.5 ? "pass" : "fail") : null,
  };
}