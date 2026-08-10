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

export async function getAssignments(
  params: AssignmentListParams = {},
) {
  const qs = new URLSearchParams();

  if (params.search) {
    qs.set("search", params.search);
  }

  if (params.status && params.status !== "all") {
    qs.set("status", params.status);
  }

  const suffix = qs.toString() ? `?${qs.toString()}` : "";

  const response = await apiFetch<
    AssignmentListItem[] | ApiEnvelope<AssignmentListItem[]>
  >(`/assignments${suffix}`);

  return Array.isArray(response) ? response : response.data ?? [];
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

export function updateAssignmentStatus(
  id: string,
  status: AssignmentStatus,
) {
  return apiFetch<AssignmentEntity>(`/assignments/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function duplicateAssignment(id: string) {
  return apiFetch<AssignmentListItem>(
    `/assignments/${id}/duplicate`,
    {
      method: "POST",
    },
  );
}

export function deleteAssignment(id: string) {
  return apiFetch<void>(`/assignments/${id}`, {
    method: "DELETE",
  });
}

export function uploadAssignmentAttachment(
  id: string,
  file: File,
) {
  const form = new FormData();
  form.append("file", file);

  return apiFetch<AssignmentAttachment>(
    `/assignments/${id}/attachments`,
    {
      method: "POST",
      body: form,
    },
  );
}

export function deleteAssignmentAttachment(
  id: string,
  attachmentId: string,
) {
  return apiFetch<void>(
    `/assignments/${id}/attachments/${attachmentId}`,
    {
      method: "DELETE",
    },
  );
}

export async function getCourseOptions() {
  const res = await apiFetch<{ data: CourseOption[] }>("/courses");
  return res.data;
}

// Backend route path parameter leta hai, query parameter nahi
export async function listAssignments(courseId?: string) {
  if (!courseId) return [];

  const res = await apiFetch<any>(
    `/assignments/course/${encodeURIComponent(courseId)}`,
  );

  return res?.data || res || [];
}

/* ================================================================
   Legacy API
   ================================================================ */

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

// Backend route path parameter leta hai, query parameter nahi
export function listAssignmentsForCourse(courseId: string) {
  return apiFetch<ApiEnvelope<AssignmentModel[]>>(
    `/assignments/course/${encodeURIComponent(courseId)}`,
  );
}

export function listSubmissions(assignmentId: string) {
  return apiFetch<ApiEnvelope<SubmissionModel[]>>(
    `/assignments/${assignmentId}/submissions`,
  );
}

export function gradeSubmission(
  submissionId: string,
  score: number,
  feedback = "",
) {
  // Backend route: /assignments/submissions/{id}/grade
  return apiFetch<ApiEnvelope<SubmissionModel>>(
    `/assignments/submissions/${submissionId}/grade`,
    {
      method: "PATCH",
      body: JSON.stringify({ score, feedback }),
    },
  );
}

// Correct backend route
export function myGrades(courseId: string) {
  if (!courseId) {
    return Promise.resolve({
      success: true,
      data: [],
      message: "no course selected",
    } as ApiEnvelope<SubmissionModel[]>);
  }

  return apiFetch<ApiEnvelope<SubmissionModel[]>>(
    `/assignments/course/${encodeURIComponent(courseId)}/my-grades`,
  );
}

export function submitAssignment(
  assignmentId: string,
  form: FormData,
) {
  return apiFetch<ApiEnvelope<SubmissionModel>>(
    `/assignments/${assignmentId}/submissions`,
    {
      method: "POST",
      body: form,
    },
  );
}

/* ================================================================
   NEW: Grades ko assignment details ke saath enrich karna

   Backend ki submission_to_public() mein title/maxScore/percentage
   nahi aata, isliye frontend mein assignment list se merge kar rahe hain.
   ================================================================ */

export interface EnrichedGrade {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  courseId: string;
  courseName: string;
  score: number;
  maxScore: number;
  percentage: number;
  feedback?: string | null;
  gradedAt?: string | null;
}

export async function getMyGradesForCourse(
  courseId: string,
  courseName: string = "",
): Promise<EnrichedGrade[]> {
  const [gradesRes, assignmentsRes] = await Promise.all([
    myGrades(courseId),
    listAssignmentsForCourse(courseId),
  ]);

  const submissions = (gradesRes as any)?.data || [];
  const assignments = (assignmentsRes as any)?.data || [];

  const assignmentMap = new Map(
    assignments.map((a: any) => [a.id, a]),
  );

  return submissions
    .filter(
      (s: any) =>
        s.score !== null && s.score !== undefined,
    )
    .map((s: any) => {
      const assignment: any =
        assignmentMap.get(s.assignmentId) || {};

      const maxScore = assignment.maxScore || 100;

      const percentage =
        maxScore > 0
          ? Math.round((s.score / maxScore) * 100)
          : 0;

      return {
        id: s.id,
        assignmentId: s.assignmentId,
        assignmentTitle:
          assignment.title || "Untitled",
        courseId,
        courseName,
        score: s.score,
        maxScore,
        percentage,
        feedback: s.feedback,
        gradedAt: s.gradedAt,
      };
    });
}