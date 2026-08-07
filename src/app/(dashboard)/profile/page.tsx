"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { initials } from "@/lib/utils";
import { studentStats, instructorStats } from "@/lib/selectors";
import { toast } from "sonner";

export default function ProfilePage() {
  const { role, user } = useCurrentUser();
  const stats = role === "student" && user ? studentStats(user.id) : null;
  const iStats =
    role === "instructor" && user ? instructorStats(user.id) : null;

  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Your account details, visible to instructors and classmates.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-4 pt-5 text-center sm:flex-row sm:text-left">
          <Avatar className="h-20 w-20">
            <AvatarFallback
              className="text-xl"
              style={{
                backgroundColor: `${user.avatarColor}1A`,
                color: user.avatarColor,
              }}
            >
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg font-semibold">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
              <Badge variant="outline" className="capitalize">
                {role}
              </Badge>
              {user.rollNumber && (
                <Badge variant="secondary">{user.rollNumber}</Badge>
              )}
              {user.department && (
                <Badge variant="secondary">{user.department}</Badge>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => toast.success("Profile updated.")}
          >
            Edit profile
          </Button>
        </CardContent>
      </Card>

      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Your progress</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Total", value: stats.total },
              { label: "Submitted", value: stats.submitted },
              { label: "Pending", value: stats.pending },
              { label: "Late", value: stats.late },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-border p-4 text-center"
              >
                <p className="font-display text-xl font-semibold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {iStats && (
        <Card>
          <CardHeader>
            <CardTitle>Teaching overview</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Assignments", value: iStats.totalAssignments },
              { label: "Published", value: iStats.published },
              { label: "To review", value: iStats.pendingReview },
              { label: "Students", value: iStats.totalStudents },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-border p-4 text-center"
              >
                <p className="font-display text-xl font-semibold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Contact information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Full name</Label>
            <Input defaultValue={user.name} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input defaultValue={user.email} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
