"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/shared/empty-state";
import { getStudentCourses } from "@/lib/api/enrollments";
import { getStudentGrading, type GradeRow, type StudentGradingReport } from "@/lib/api/grading";
import { useCurrentUser } from "@/hooks/use-current-user";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, { dot: string; label: string }> = {
  submitted: { dot: "bg-success", label: "Submitted" },
  pending: { dot: "bg-warning", label: "Pending" },
  not_submitted: { dot: "bg-danger", label: "Not Submitted" },
};

function StatusDot({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.not_submitted;
  return (
    <span className="flex items-center gap-1.5 text-sm">
      <span className={cn("h-2 w-2 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

function CollapsibleSection({
  title,
  rows,
}: {
  title: string;
  rows: GradeRow[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <button
        className="flex w-full items-center justify-between px-5 py-4 text-left font-semibold"
        onClick={() => setOpen((o) => !o)}
      >
        {title}
        <ChevronDown
          className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="border-t border-border">
          {rows.length === 0 ? (
            <p className="px-5 py-4 text-sm text-muted-foreground">
              Nothing here yet.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {rows.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-4 px-5 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{r.name}</p>
                    {r.remarks && (
                      <p className="truncate text-xs text-muted-foreground">
                        {r.remarks}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-sm text-muted-foreground">
                      {r.obtainedMarks != null ? `${r.obtainedMarks}/${r.totalMarks}` : `—/${r.totalMarks}`}
                    </span>
                    <StatusDot status={r.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function StudentGradesPage() {
  const { user } = useCurrentUser();

  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [courseId, setCourseId] = useState<string>("");
  const [report, setReport] = useState<StudentGradingReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudentCourses()
      .then((enrollments) => {
        const list = enrollments
          .filter((e) => e.course)
          .map((e) => ({ id: e.courseId, title: e.course!.title }));
        setCourses(list);
        if (list.length) setCourseId(list[0].id);
      })
      .catch(() => toast.error("Courses load nahi ho sake"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!courseId || !user?.email) return;
    setLoading(true);
    getStudentGrading(user.email, courseId)
      .then((res) => setReport((res as any)?.data ?? null))
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Grading report load nahi ho saka");
        setReport(null);
      })
      .finally(() => setLoading(false));
  }, [courseId, user?.email]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Grading</h1>
        {report && (
          <p className="text-sm text-muted-foreground">{report.courseTitle}</p>
        )}
      </div>

      {courses.length > 1 && (
        <div className="w-64">
          <Label>Select Course</Label>
          <Select value={courseId} onValueChange={setCourseId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Status Summary</span>
        <StatusDot status="submitted" />
        <StatusDot status="pending" />
        <StatusDot status="not_submitted" />
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>
      ) : !report ? (
        <EmptyState
          icon={FileText}
          title="No grading data"
          description="Grades will appear here once available."
        />
      ) : (
        <>
          <div className="space-y-3">
            <CollapsibleSection title="Assignment" rows={report.assignments} />
            <CollapsibleSection title="Quiz" rows={report.quizzes} />
            <CollapsibleSection title="Project" rows={report.projects} />
            <CollapsibleSection title="Exam" rows={report.exams} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Student Performance Overview</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pr-4">Component</th>
                    <th className="py-2 pr-4">Weightage</th>
                    <th className="py-2 pr-4">Total Marks</th>
                    <th className="py-2 pr-4">Obtained Marks</th>
                    <th className="py-2">Weighted Score %</th>
                  </tr>
                </thead>
                <tbody>
                  {report.performance.map((p) => (
                    <tr key={p.component} className="border-b border-border/60">
                      <td className="py-2.5 pr-4 font-medium capitalize">{p.component}</td>
                      <td className="py-2.5 pr-4">{p.weightagePercent.toFixed(2)}%</td>
                      <td className="py-2.5 pr-4">{p.totalMarks.toFixed(2)}</td>
                      <td className="py-2.5 pr-4">{p.obtainedMarks.toFixed(2)}</td>
                      <td className="py-2.5">{p.weightedScorePercent.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="font-semibold">
                    <td className="py-2.5 pr-4">Total</td>
                    <td className="py-2.5 pr-4">{report.totalWeightagePercent.toFixed(2)}%</td>
                    <td className="py-2.5 pr-4">{report.totalMarks.toFixed(2)}</td>
                    <td className="py-2.5 pr-4">{report.totalObtainedMarks.toFixed(2)}</td>
                    <td className="py-2.5">{report.overallWeightedScorePercent.toFixed(2)}%</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}