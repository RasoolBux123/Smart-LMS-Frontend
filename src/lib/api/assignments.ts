import { apiFetch, type ApiEnvelope } from "./client";
import type {
  Assignment as AssignmentEntity,
  AssignmentAttachment,
  AssignmentListItem,
  AssignmentPayload,
  AssignmentStatus,
} from "@/types/assignment";
import type { CourseOption } from "@/types/course";

export interface AssignmentListParams {
  search?: string;
  status?: AssignmentStatus | "all";
}

export function getAssignments(params: AssignmentListParams = {}) {
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.status && params.status !== "all") qs.set("status", params.status);

  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return apiFetch<AssignmentListItem[]>(`/assignments${suffix}`);
}

export function getAssignment(id: string) {
  return apiFetch<AssignmentEntity>(`/assignments/${id}`);
}

export function createAssignment(payload: AssignmentPayload) {
  return apiFetch<AssignmentEntity>("/assignments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAssignment(
  id: string,
  payload: Partial<AssignmentPayload>,
) {
  return apiFetch<AssignmentEntity>(`/assignments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function updateAssignmentStatus(id: string, status: AssignmentStatus) {
  return apiFetch<AssignmentEntity>(`/assignments/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function duplicateAssignment(id: string) {
  return apiFetch<AssignmentListItem>(`/assignments/${id}/duplicate`, {
    method: "POST",
  });
}

export function deleteAssignment(id: string) {
  return apiFetch<void>(`/assignments/${id}`, { method: "DELETE" });
}

/**
 * Attachment alag request me jata hai (assignment ban jane ke baad).
 * Agar backend poora form ek hi multipart request me chahta hai, to
 * create/update ko FormData par shift karna hoga — abhi JSON par hai.
 */
export function uploadAssignmentAttachment(id: string, file: File) {
  const form = new FormData();
  form.append("file", file);

  return apiFetch<AssignmentAttachment>(`/assignments/${id}/attachments`, {
    method: "POST",
    body: form,
  });
}

export function deleteAssignmentAttachment(id: string, attachmentId: string) {
  return apiFetch<void>(`/assignments/${id}/attachments/${attachmentId}`, {
    method: "DELETE",
  });
}

/** Form ke course dropdown ke liye. Alag file chahiye ho to `lib/api/courses.ts` bana lena. */
export function getCourseOptions() {
  return apiFetch<CourseOption[]>("/courses");
}


/* ================================================================
   Legacy API (zip 1) — gradebook aur grades pages inhi par chalte
   hain. Ye `{ data }` envelope return karte hain, upar wale naye
   endpoints raw object dete hain. Dono saath chal sakte hain.
   ================================================================ */

/**
 * Legacy shapes — gradebook aur grades pages inhi fields par likhe hain
 * (`type`, `maxScore`, `score`, `content`). Naye modules `@/types/assignment`
 * wale canonical types use karte hain.
 */
export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  type?: "assignment" | "quiz" | "exam" | "project";
  dueAt?: string | null;
  maxScore: number;
  createdAt?: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName?: string;
  content?: string | null;
  fileUrl?: string | null;
  score?: number | null;
  feedback?: string | null;
  submittedAt?: string | null;
  status?: string;
}

type AssignmentModel = Assignment;
type SubmissionModel = Submission;

/** Ek course ke saare assignments. */
export function listAssignmentsForCourse(courseId: string) {
  return apiFetch<ApiEnvelope<AssignmentModel[]>>(
    `/assignments?courseId=${encodeURIComponent(courseId)}`,
  );
}

/** Ek assignment par aayi hui saari submissions (instructor view). */
export function listSubmissions(assignmentId: string) {
  return apiFetch<ApiEnvelope<SubmissionModel[]>>(
    `/assignments/${assignmentId}/submissions`,
  );
}

/** Submission ko marks aur feedback dena. */
export function gradeSubmission(
  submissionId: string,
  score: number,
  feedback = "",
) {
  return apiFetch<ApiEnvelope<SubmissionModel>>(
    `/submissions/${submissionId}/grade`,
    {
      method: "PATCH",
      body: JSON.stringify({ marksAwarded: score, feedback }),
    },
  );
}

/** Logged-in student ke apne grades, ek course ke liye. */
export function myGrades(courseId: string) {
  return apiFetch<ApiEnvelope<SubmissionModel[]>>(
    `/submissions/me?courseId=${encodeURIComponent(courseId)}`,
  );
}

/** Student ki submission upload karna (file ya text). */
export function submitAssignment(assignmentId: string, form: FormData) {
  return apiFetch<ApiEnvelope<SubmissionModel>>(
    `/assignments/${assignmentId}/submissions`,
    { method: "POST", body: form },
  );
}
