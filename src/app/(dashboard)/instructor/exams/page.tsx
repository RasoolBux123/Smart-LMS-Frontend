"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  Send,
  Archive,
  Eye,
  FileX2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

import { EmptyState } from "@/components/shared/empty-state";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";

import { AssignmentStatusBadge } from "@/components/shared/status-badge";
import type { AssignmentStatusMeta } from "@/types";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

type ExamRow = {
  id: string;
  title: string;
  course: { code: string };
  deadline: string;
  totalMarks: number;
  submittedCount: number;
  enrolled: number;
  status: AssignmentStatusMeta;
};

const initialExams: ExamRow[] = [];

export default function InstructorExamsPage() {
  const [rows, setRows] = useState(initialExams);

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("all");

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let out = rows.filter((e) =>
      e.title.toLowerCase().includes(search.toLowerCase()),
    );

    if (status !== "all") out = out.filter((e) => e.status === status);

    return out;
  }, [rows, search, status]);

  function duplicate(id: string) {
    const source = rows.find((e) => e.id === id);

    if (!source) return;

    const copy: ExamRow = {
      ...source,

      id: `${source.id}-copy-${Date.now()}`,

      title: `${source.title} (copy)`,

      status: "draft",
    };

    setRows((prev) => [copy, ...prev]);

    toast.success("Exam duplicated.");
  }

  function setPublishState(id: string, s: "published" | "archived" | "draft") {
    setRows((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              status: s,
            }
          : e,
      ),
    );

    toast.success(
      s === "published"
        ? "Exam published."
        : s === "archived"
          ? "Exam archived."
          : "Moved to draft.",
    );
  }

  function remove(id: string) {
    setRows((prev) => prev.filter((e) => e.id !== id));

    toast.success("Exam deleted.");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Exams</h1>

          <p className="text-sm text-muted-foreground">
            Create, publish, and manage exams across your courses.
          </p>
        </div>

        <Button asChild>
          <Link href="/instructor/exams/create">
            <Plus className="h-4 w-4" />
            Create Exam
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Search exams..."

            className="pl-9"

            value={search}

            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>

            <SelectItem value="published">Published</SelectItem>

            <SelectItem value="draft">Draft</SelectItem>

            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={FileX2}

            title="No exams found"

            description="Try another search or create your first exam."

            action={
              <Button asChild>
                <Link href="/instructor/exams/create">Create Exam</Link>
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>

                <TableHead>Course</TableHead>

                <TableHead>Deadline</TableHead>

                <TableHead>Marks</TableHead>

                <TableHead>Submissions</TableHead>

                <TableHead>Status</TableHead>

                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell className="font-medium">{exam.title}</TableCell>

                  <TableCell>{exam.course.code}</TableCell>

                  <TableCell>{exam.deadline}</TableCell>

                  <TableCell>{exam.totalMarks} pts</TableCell>

                  <TableCell>
                    {exam.submittedCount}/{exam.enrolled}
                  </TableCell>

                  <TableCell>
                    <AssignmentStatusBadge status={exam.status} />
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/instructor/exams/${exam.id}/submissions`}
                          >
                            <Eye className="h-4 w-4" />
                            View submissions
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link href={`/instructor/exams/edit/${exam.id}`}>
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => duplicate(exam.id)}>
                          <Copy className="h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {exam.status !== "published" && (
                          <DropdownMenuItem
                            onClick={() =>
                              setPublishState(exam.id, "published")
                            }
                          >
                            <Send className="h-4 w-4" />
                            Publish
                          </DropdownMenuItem>
                        )}

                        {exam.status !== "archived" && (
                          <DropdownMenuItem
                            onClick={() => setPublishState(exam.id, "archived")}
                          >
                            <Archive className="h-4 w-4" />
                            Archive
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          destructive
                          onClick={() => setDeleteId(exam.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}

        onOpenChange={(v) => !v && setDeleteId(null)}

        title="Delete this exam?"

        description="This will permanently remove the exam."

        confirmLabel="Delete exam"

        onConfirm={() => deleteId && remove(deleteId)}
      />
    </div>
  );
}
