"use client";

import { useEffect, useState } from "react";
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
import { getStudentCourses, type Enrollment } from "@/lib/api/enrollments";
import { listAssignments, type Assignment } from "@/lib/api/assignments";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    pending: 0,
    late: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch enrolled courses
        const coursesData = await getStudentCourses();
        setEnrollments(coursesData);

        // Fetch all assignments for enrolled courses
        const allAssignments: Assignment[] = [];
        for (const enrollment of coursesData) {
          try {
            const res = await listAssignments(enrollment.courseId);
            const assignmentList = Array.isArray(res) ? res : res?.data || [];
            allAssignments.push(...assignmentList);
          } catch (e) {
            console.error(`Failed to fetch assignments for course ${enrollment.courseId}`);
          }
        }
        setAssignments(allAssignments);

        // Calculate stats
        const total = allAssignments.length;
        const submitted = allAssignments.filter((a) => a.submitted).length;
        const pending = allAssignments.filter((a) => !a.submitted && new Date(a.dueAt) > new Date()).length;
        const late = allAssignments.filter((a) => !a.submitted && new Date(a.dueAt) < new Date()).length;

        setStats({ total, submitted, pending, late });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast.error("Dashboard data load nahi ho saka");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get upcoming assignments (due within next 7 days)
  const upcoming = assignments
    .filter((a) => !a.submitted && new Date(a.dueAt) > new Date())
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
    .slice(0, 5);

  const recent = assignments.slice(0, 6);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-semibold">
          Welcome back, {user?.name?.split(" ")[0] || "Student"} 👋
        </h1>
        <p className="text-sm text-muted-foreground">
          Here&rsquo;s where things stand across your {enrollments.length} course{enrollments.length > 1 ? "s" : ""}.
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
                  href={`/student/assignments/${a.id}`}
                  className="flex items-center gap-4 rounded-xl border border-transparent p-3 transition-colors hover:border-border hover:bg-secondary/60"
                >
                  <DeadlineRing
                    createdAt={a.createdAt}
                    deadline={a.dueAt}
                    showLabel={false}
                    size={40}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{a.title}</p>
                    <p className="mt-1 text-xs capitalize text-muted-foreground">
                      Assignment · Due {new Date(a.dueAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline">{a.maxScore} pts</Badge>
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
                  <p className="mt-1 text-xs text-muted-foreground">
                    Assignment
                  </p>
                </div>
                <Badge variant={a.submitted ? "success" : "secondary"}>
                  {a.submitted ? "Submitted" : "Pending"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}