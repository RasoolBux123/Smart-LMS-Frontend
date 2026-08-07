import type { CourseOption } from "./course";

export type AssignmentStatus = "draft" | "published" | "archived";

export type FileKind = "pdf" | "docx" | "image" | "zip" | "other";

export interface AssignmentAttachment {
  id: string;
  name: string;
  kind: FileKind;
  size: number;
  /** API se aata hai — download link. */
  url?: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  instructions: string;
  courseId: string;
  instructorId: string;
  createdAt: string;
  /** ISO string */
  deadline: string;
  totalMarks: number;
  allowedFileTypes: FileKind[];
  maxFileSizeMb: number;
  resubmissionAllowed: boolean;
  maxAttempts: number;
  attachments: AssignmentAttachment[];
  status: AssignmentStatus;
}

/** List page ka row — backend course aur counts pehle se join kar ke bheje. */
export interface AssignmentListItem extends Assignment {
  course: CourseOption;
  enrolled: number;
  submittedCount: number;
  gradedCount: number;
}

/** Create/update par jo body bhejni hai. */
export type AssignmentPayload = Omit<
  Assignment,
  "id" | "createdAt" | "instructorId" | "attachments"
>;

export type SubmissionStatus =
  | "submitted"
  | "pending"
  | "late"
  | "draft"
  | "graded";

export type SubmissionFile = AssignmentAttachment;

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  status: SubmissionStatus;
  submittedAt: string | null;
  files: SubmissionFile[];
  attemptNumber: number;
  marksAwarded: number | null;
  feedback: string | null;
  passFail: "pass" | "fail" | null;
}
