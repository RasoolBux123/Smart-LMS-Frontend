"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SubmissionsTable } from "@/features/instructor/submissions-table";
import { instructor } from "@/data/users";
import {
  assignmentsForInstructor,
  submissionRowsForAssignment,
} from "@/lib/selectors";

function SubmissionsPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const assignments = useMemo(
    () => assignmentsForInstructor(instructor.id),
    [],
  );
  const [assignmentId, setAssignmentId] = useState(
    searchParams.get("assignment") ?? assignments[0]?.id ?? "",
  );

  const assignment =
    assignments.find((a) => a.id === assignmentId) ?? assignments[0];
  const rows = assignment ? submissionRowsForAssignment(assignment.id) : [];

  function handleChange(id: string) {
    setAssignmentId(id);
    router.replace(`/instructor/submissions?assignment=${id}`, {
      scroll: false,
    });
  }

  if (!assignment) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Submissions</h1>
          <p className="text-sm text-muted-foreground">
            Review, grade, and give feedback on student work.
          </p>
        </div>
        <Select value={assignmentId} onValueChange={handleChange}>
          <SelectTrigger className="w-full sm:w-80">
            <SelectValue placeholder="Choose an assignment" />
          </SelectTrigger>
          <SelectContent>
            {assignments.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>{assignment.title}</CardTitle>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {assignment.course.code} · {assignment.totalMarks} points
            </p>
          </div>
          <Badge variant="outline">
            {assignment.submittedCount}/{assignment.enrolled} submitted
          </Badge>
        </CardHeader>
        <CardContent>
          <SubmissionsTable rows={rows} totalMarks={assignment.totalMarks} />
        </CardContent>
      </Card>
    </div>
  );
}

export default function InstructorSubmissionsPage() {
  return (
    <Suspense fallback={null}>
      <SubmissionsPageInner />
    </Suspense>
  );
}
