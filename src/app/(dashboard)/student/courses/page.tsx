"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/shared/empty-state";
// ✅ FIX: Import getStudentCourses instead
import { getStudentCourses, type Enrollment } from "@/lib/api/enrollments";
import { BookOpen, Clock, Users, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function StudentCoursesPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ FIX: Use getStudentCourses instead of listCourseEnrollments
    getStudentCourses()
      .then((data) => {
        setEnrollments(Array.isArray(data) ? data : []);
      })
      .catch(() => toast.error("Courses load nahi ho sake"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <p className="text-muted-foreground">Loading courses...</p>
      </div>
    );
  }

  if (enrollments.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No courses enrolled"
        description="You haven't enrolled in any courses yet. Browse available courses and start learning!"
        action={
          <Link href="/student/courses/available">
            <Button>Browse Courses</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">My Courses</h1>
        <p className="text-sm text-muted-foreground">
          You are enrolled in {enrollments.length} course{enrollments.length > 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {enrollments.map((enrollment) => (
          <Card key={enrollment.id} className="overflow-hidden">
            <CardHeader className="border-b bg-muted/20">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{enrollment.course?.title || "Course"}</CardTitle>
                  <CardDescription className="mt-1 line-clamp-2">
                    {enrollment.course?.description || "No description"}
                  </CardDescription>
                </div>
                <Badge variant={enrollment.status === "active" ? "success" : "secondary"}>
                  {enrollment.status || "Active"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{enrollment.course?.enrollmentCount || 0} students</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{enrollment.course?.durationWeeks || 4} weeks</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">{enrollment.progress || 0}%</span>
                  </div>
                  <Progress value={enrollment.progress || 0} className="h-2" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/10 pt-4">
              <Button asChild className="w-full">
                <Link href={`/student/courses/${enrollment.course?.id || enrollment.courseId}`}>
                  Continue Learning
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}