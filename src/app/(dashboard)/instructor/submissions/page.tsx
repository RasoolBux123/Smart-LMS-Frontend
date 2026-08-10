"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Download } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GradingModal, passFailBadge } from "@/features/instructor/grading-modal";
import { instructor } from "@/data/users";
import {
  assignmentsForInstructor,
  courseworkForInstructor,
  submissionRowsForAssignment,
  submissionRowsForCoursework,
} from "@/lib/selectors";
import {
  listMyProjects,
  listProjectSubmissions,
  gradeSubmission,
  toFrontendSubmission,
} from "@/lib/api/projects";
import { formatDateTime, initials } from "@/lib/utils";
import type { CourseworkKind, User } from "@/types";

type UnifiedRow = {
  id: string;
  kind: CourseworkKind;
  courseworkId: string;
  courseworkTitle: string;
  student: User;
  submittedAt: string | null;
  marksAwarded: number | null;
  feedback: string | null;
  passFail: "pass" | "fail" | null;
  fileName?: string;
  fileUrl?: string;
  totalMarks: number;
  isMock: boolean;
};

export default function InstructorSubmissions() {
  const searchParams = useSearchParams();
  const initialKind = (searchParams.get("kind") as CourseworkKind | null) ?? "all";

  const [filter, setFilter] = useState<CourseworkKind | "all">(initialKind);
  const [courseworkFilter, setCourseworkFilter] = useState<string>("all");
  const [rows, setRows] = useState<UnifiedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [gradingRow, setGradingRow] = useState<UnifiedRow | null>(null);

  async function load() {
    setLoading(true);
    try {
      const unified: UnifiedRow[] = [];

      for (const a of assignmentsForInstructor(instructor.id)) {
        for (const r of submissionRowsForAssignment(a.id)) {
          if (!r.submission) continue;
          unified.push({
            id: r.submission.id,
            kind: "assignment",
            courseworkId: a.id,
            courseworkTitle: a.title,
            student: r.student,
            submittedAt: r.submission.submittedAt,
            marksAwarded: r.submission.marksAwarded,
            feedback: r.submission.feedback,
            passFail: r.submission.passFail,
            fileName: r.submission.files[0]?.name,
            fileUrl: r.submission.files[0]?.url,
            totalMarks: a.totalMarks,
            isMock: true,
          });
        }
      }

      for (const q of courseworkForInstructor(instructor.id, "quiz")) {
        for (const r of submissionRowsForCoursework(q.id, "quiz")) {
          if (!r.submission) continue;
          unified.push({
            id: r.submission.id,
            kind: "quiz",
            courseworkId: q.id,
            courseworkTitle: q.title,
            student: r.student,
            submittedAt: r.submission.submittedAt,
            marksAwarded: r.submission.marksAwarded,
            feedback: r.submission.feedback,
            passFail: r.submission.passFail,
            fileName: r.submission.files[0]?.name,
            fileUrl: r.submission.files[0]?.url,
            totalMarks: q.totalMarks,
            isMock: true,
          });
        }
      }

      const projects = await listMyProjects();
      for (const p of projects) {
        const raw = await listProjectSubmissions(p.id);
        for (const s of raw) {
          const sub = toFrontendSubmission(s, p.maxScore);
          unified.push({
            id: sub.id,
            kind: "project",
            courseworkId: p.id,
            courseworkTitle: p.title,
            student: {
              id: sub.studentId,
              name: (s as any).studentName || sub.studentId,
              email: (s as any).studentEmail || "",
              role: "student",
              avatarColor: "#6366f1",
            },
            submittedAt: sub.submittedAt,
            marksAwarded: sub.marksAwarded,
            feedback: sub.feedback,
            passFail: sub.passFail,
            fileName: sub.files[0]?.name,
            fileUrl: sub.files[0]?.url,
            totalMarks: p.maxScore,
            isMock: false,
          });
        }
      }

      unified.sort(
        (a, b) =>
          new Date(b.submittedAt ?? 0).getTime() - new Date(a.submittedAt ?? 0).getTime(),
      );

      setRows(unified);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load submissions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFilterChange(v: string) {
    setFilter(v as CourseworkKind | "all");
    setCourseworkFilter("all");
  }

  const courseworkOptions = useMemo(() => {
    if (filter === "all") return [];
    const map = new Map<string, string>();
    rows
      .filter((r) => r.kind === filter)
      .forEach((r) => map.set(r.courseworkId, r.courseworkTitle));
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [rows, filter]);

  const filtered = useMemo(() => {
    let out = rows;
    if (filter !== "all") out = out.filter((r) => r.kind === filter);
    if (courseworkFilter !== "all") out = out.filter((r) => r.courseworkId === courseworkFilter);
    return out;
  }, [rows, filter, courseworkFilter]);

  async function handleGradeSave(marks: number, feedback: string, passFail: "pass" | "fail") {
    if (!gradingRow) return;

    if (gradingRow.isMock) {
      setRows((prev) =>
        prev.map((r) =>
          r.id === gradingRow.id ? { ...r, marksAwarded: marks, feedback, passFail } : r,
        ),
      );
      toast.success("Grade saved (local only — abhi assignments/quizzes backend se connected nahi)");
      setGradingRow(null);
      return;
    }

    try {
      await gradeSubmission(gradingRow.id, { score: marks, feedback });
      toast.success("Grade saved");
      setGradingRow(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save grade");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Submissions</h1>
          <p className="text-sm text-muted-foreground">
            Review and grade student submissions across assignments, quizzes, and projects.
          </p>
        </div>

        <div className="flex gap-2">
          <Select value={filter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="assignment">Assignments</SelectItem>
              <SelectItem value="quiz">Quizzes</SelectItem>
              <SelectItem value="project">Projects</SelectItem>
            </SelectContent>
          </Select>

          {filter !== "all" && courseworkOptions.length > 0 && (
            <Select value={courseworkFilter} onValueChange={setCourseworkFilter}>
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue placeholder={`Select ${filter}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All {filter}s</SelectItem>
                {courseworkOptions.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>
                    {opt.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {loading && (
        <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>
      )}

      {!loading && filtered.length === 0 && (
        <p className="rounded-2xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
          No submissions found.
        </p>
      )}

      {!loading && filtered.length > 0 && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Submitted at</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Marks</TableHead>
                <TableHead>Result</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => (
                <TableRow key={`${row.kind}-${row.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback
                          style={{
                            backgroundColor: `${row.student.avatarColor}1A`,
                            color: row.student.avatarColor,
                          }}
                        >
                          {initials(row.student.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{row.student.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize text-muted-foreground">
                    {row.kind}
                  </TableCell>
                  <TableCell>{row.courseworkTitle}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {row.submittedAt ? formatDateTime(row.submittedAt) : "—"}
                  </TableCell>
                  <TableCell>
                    {row.fileUrl ? (

                      <a href={row.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                      >
                        <Download className="h-3.5 w-3.5" /> View
                      </a>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {row.marksAwarded != null ? `${row.marksAwarded}/${row.totalMarks}` : "—"}
                  </TableCell>
                  <TableCell>{passFailBadge(row.passFail)}</TableCell>
                  <TableCell className="text-right">
                    <button
                      className="rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground"
                      onClick={() => setGradingRow(row)}
                    >
                      {row.marksAwarded != null ? "Re-grade" : "Grade"}
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )
      }

      {
        gradingRow && (
          <GradingModal
            open={!!gradingRow}
            onOpenChange={(v) => !v && setGradingRow(null)}
            student={gradingRow.student}
            totalMarks={gradingRow.totalMarks}
            initialMarks={gradingRow.marksAwarded}
            initialFeedback={gradingRow.feedback}
            onSave={handleGradeSave}
          />
        )
      }
    </div >
  );
}