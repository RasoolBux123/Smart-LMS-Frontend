"use client";

import Link from "next/link";
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { DeadlineRing } from "@/components/shared/deadline-ring";
import { SubmissionStatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { courseworkLabels } from "@/features/student/coursework-config";
import { currentStudent } from "@/data/users";
import { allCourseworkForStudent, studentStats } from "@/lib/selectors";
import { formatDate } from "@/lib/utils";

export default function StudentDashboardPage() {
  const stats = studentStats(currentStudent.id);
  const rows = allCourseworkForStudent(currentStudent.id);
  const upcoming = rows
    .filter((r) => r.studentStatus === "pending")
    .slice(0, 5);
  const recent = rows.slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-semibold">
          Welcome back, {currentStudent.name.split(" ")[0]}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here&rsquo;s where things stand across your courses.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total tasks"
          value={stats.total}
          icon={FileText}
          tone="primary"
          index={0}
        />
        <StatCard
          label="Submitted"
          value={stats.submitted}
          icon={CheckCircle2}
          tone="success"
          index={1}
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          icon={Clock}
          tone="warning"
          index={2}
        />
        <StatCard
          label="Late"
          value={stats.late}
          icon={AlertTriangle}
          tone="danger"
          index={3}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Upcoming deadlines</CardTitle>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Assignments, quizzes, exams and projects due soon.
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/student/assignments">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {upcoming.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="You're all caught up"
                description="No pending deadlines in the next week."
              />
            ) : (
              upcoming.map((a) => (
                <Link
                  key={a.id}
                  href={`${courseworkLabels[a.kind].basePath}/${a.id}`}
                  className="flex items-center gap-4 rounded-xl border border-transparent p-3 transition-colors hover:border-border hover:bg-secondary/60"
                >
                  <DeadlineRing
                    createdAt={a.createdAt}
                    deadline={a.deadline}
                    showLabel={false}
                    size={40}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{a.title}</p>
                    <p className="mt-1 text-xs capitalize text-muted-foreground">
                      {a.kind} · {a.courseCode} · Due {formatDate(a.deadline)}
                    </p>
                  </div>
                  <Badge variant="outline">{a.totalMarks} pts</Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recent.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nothing here yet.
              </p>
            )}
            {recent.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{a.title}</p>
                  <p className="mt-1 text-xs capitalize text-muted-foreground">
                    {a.kind} · {a.courseCode}
                  </p>
                </div>
                <SubmissionStatusBadge status={a.studentStatus} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
