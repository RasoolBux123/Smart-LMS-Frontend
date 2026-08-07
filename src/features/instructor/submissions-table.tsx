"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Search,
  Download,
  Eye,
  Award,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SubmissionStatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { GradingModal, passFailBadge } from "./grading-modal";
import { initials, formatDateTime } from "@/lib/utils";
import type { Submission, SubmissionStatus, User } from "@/types";

export interface SubmissionRow {
  student: User;
  submission: Submission | null;
  status: SubmissionStatus;
}

const PAGE_SIZE = 6;

export function SubmissionsTable({
  rows: initialRows,
  totalMarks,
}: {
  rows: SubmissionRow[];
  totalMarks: number;
}) {
  const [rows, setRows] = useState(initialRows);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [gradingFor, setGradingFor] = useState<SubmissionRow | null>(null);

  const filtered = useMemo(() => {
    let out = rows.filter((r) =>
      r.student.name.toLowerCase().includes(search.toLowerCase()),
    );
    if (status !== "all") out = out.filter((r) => r.status === status);
    return out;
  }, [rows, search, status]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function saveGrade(
    studentId: string,
    marks: number,
    feedback: string,
    passFail: "pass" | "fail",
  ) {
    setRows((prev) =>
      prev.map((r) =>
        r.student.id === studentId && r.submission
          ? {
              ...r,
              submission: {
                ...r.submission,
                marksAwarded: marks,
                feedback,
                passFail,
              },
              status: "graded",
            }
          : r,
      ),
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search students…"
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="graded">Graded</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="late">Late</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-2xl border border-border bg-card card-shadow overflow-hidden">
        {paged.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No students match"
            description="Try a different search or status filter."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Roll number</TableHead>
                <TableHead>Submitted at</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Marks</TableHead>
                <TableHead>Result</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((r) => (
                <TableRow key={r.student.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback
                          style={{
                            backgroundColor: `${r.student.avatarColor}1A`,
                            color: r.student.avatarColor,
                          }}
                        >
                          {initials(r.student.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{r.student.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {r.student.rollNumber}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {r.submission?.submittedAt
                      ? formatDateTime(r.submission.submittedAt)
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <SubmissionStatusBadge status={r.status} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {r.submission?.marksAwarded !== null &&
                    r.submission?.marksAwarded !== undefined
                      ? `${r.submission.marksAwarded}/${totalMarks}`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {passFailBadge(r.submission?.passFail ?? null)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1.5">
                      {r.submission && r.submission.files.length > 0 && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="View submission"
                            onClick={() =>
                              toast.info(
                                `Previewing ${r.submission!.files[0].name}`,
                              )
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Download"
                            onClick={() =>
                              toast.success(
                                `Downloading ${r.submission!.files[0].name}`,
                              )
                            }
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Feedback"
                        disabled={!r.submission}
                        onClick={() => setGradingFor(r)}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!r.submission}
                        onClick={() => setGradingFor(r)}
                      >
                        <Award className="h-3.5 w-3.5" /> Grade
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {page} of {pageCount}
          </span>
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="icon"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={page === pageCount}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {gradingFor && (
        <GradingModal
          open={!!gradingFor}
          onOpenChange={(v) => !v && setGradingFor(null)}
          student={gradingFor.student}
          totalMarks={totalMarks}
          initialMarks={gradingFor.submission?.marksAwarded ?? null}
          initialFeedback={gradingFor.submission?.feedback ?? null}
          onSave={(marks, feedback, passFail) =>
            saveGrade(gradingFor.student.id, marks, feedback, passFail)
          }
        />
      )}
    </div>
  );
}
