import { apiFetch } from "./client";

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex?: number;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  type: "assignment" | "quiz";
  dueAt: string;
  maxScore: number;
  questions?: QuizQuestion[];
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  content?: string;
  answers?: number[];
  score?: number | null;
  feedback?: string | null;
  gradedAt?: string | null;
  submittedAt?: string;
}

export async function listAssignmentsForCourse(courseId: string) {
  return apiFetch(`/assignments/course/${courseId}`);
}

export async function getAssignment(assignmentId: string) {
  return apiFetch(`/assignments/${assignmentId}`);
}

export async function createAssignment(data: {
  courseId: string;
  title: string;
  description: string;
  type: "assignment" | "quiz";
  dueAt: string;
  maxScore: number;
  questions?: { question: string; options: string[]; correctIndex: number }[];
}) {
  return apiFetch("/assignments", { method: "POST", body: JSON.stringify(data) });
}

export async function submitAssignment(assignmentId: string, content: string) {
  return apiFetch(`/assignments/${assignmentId}/submit/assignment`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export async function submitQuiz(assignmentId: string, answers: number[]) {
  return apiFetch(`/assignments/${assignmentId}/submit/quiz`, {
    method: "POST",
    body: JSON.stringify({ answers }),
  });
}

export async function listSubmissions(assignmentId: string) {
  return apiFetch(`/assignments/${assignmentId}/submissions`);
}

export async function gradeSubmission(submissionId: string, score: number, feedback?: string) {
  return apiFetch(`/assignments/submissions/${submissionId}/grade`, {
    method: "PATCH",
    body: JSON.stringify({ score, feedback }),
  });
}

export async function myGrades(courseId: string) {
  return apiFetch(`/assignments/course/${courseId}/my-grades`);
}
