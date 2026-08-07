"use client";

import Link from "next/link";
import {
  FileText,
  Send,
  Hourglass,
  AlertTriangle,
  Users,
  ArrowRight,
  Plus,
} from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AssignmentStatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import {
  SubmissionsTrendChart,
  StatusBreakdownChart,
} from "@/features/instructor/charts";
import { instructor } from "@/data/users";
import {
  assignmentsForInstructor,
  instructorStats,
  submissionStatusBreakdown,
  weeklySubmissionTrend,
} from "@/lib/selectors";
import { formatDate } from "@/lib/utils";

export default function InstructorDashboardPage() {
  const stats = instructorStats(instructor.id);
  const rows = assignmentsForInstructor(instructor.id).slice(0, 5);
  const trend = weeklySubmissionTrend();
  const breakdown = submissionStatusBreakdown();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">
            Welcome back, {instructor.name.split(" ").at(-1)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {[instructor.title, instructor.department]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <Button asChild>
          <Link href="/instructor/assignments/create">
            <Plus className="h-4 w-4" /> Create assignment
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Total assignments"
          value={stats.totalAssignments}
          icon={FileText}
          tone="primary"
          index={0}
        />
        <StatCard
          label="Published"
          value={stats.published}
          icon={Send}
          tone="accent"
          index={1}
        />
        <StatCard
          label="Pending review"
          value={stats.pendingReview}
          icon={Hourglass}
          tone="warning"
          index={2}
        />
        <StatCard
          label="Late submissions"
          value={stats.lateSubmissions}
          icon={AlertTriangle}
          tone="danger"
          index={3}
        />
        <StatCard
          label="Total students"
          value={stats.totalStudents}
          icon={Users}
          tone="info"
          index={4}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Submission activity</CardTitle>
          </CardHeader>
          <CardContent>
            <SubmissionsTrendChart data={trend} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Status breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBreakdownChart data={breakdown} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Recent assignments</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/instructor/assignments">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-1">
          {rows.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No assignments yet. Create one to get started.
            </p>
          )}
          {rows.map((a) => (
            <Link
              key={a.id}
              href={`/instructor/submissions?assignment=${a.id}`}
              className="flex flex-col gap-2 rounded-xl border border-transparent p-3 transition-colors hover:border-border hover:bg-secondary/60 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{a.title}</p>
                <p className="text-xs text-muted-foreground">
                  {a.course.code} · Due {formatDate(a.deadline)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {a.submittedCount}/{a.enrolled} submitted
                </Badge>
                <AssignmentStatusBadge status={a.status} />
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
