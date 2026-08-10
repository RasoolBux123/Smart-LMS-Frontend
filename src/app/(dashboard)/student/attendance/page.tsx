"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AttendanceRing } from "@/components/shared/attendance-ring";
import { EmptyState } from "@/components/shared/empty-state";
import { getMyAttendance, type AttendanceDoc } from "@/lib/api/attendance";
import { CalendarDays, CheckCircle2, XCircle, MinusCircle } from "lucide-react";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import { toast } from "sonner";

export default function StudentAttendancePage() {
    const [records, setRecords] = useState<AttendanceDoc[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMyAttendance()
            .then((res) => setRecords(res.data))
            .catch((err) => {
                console.error("attendance load failed:", err);
                toast.error("Attendance load nahi ho saki");
            })
            .finally(() => setLoading(false));
    }, []);

    const { presentCount, percentage } = useMemo(() => {
        const total = records.length;
        const present = records.filter((r) => r.status === "present").length;
        return {
            presentCount: present,
            percentage: total ? Math.round((present / total) * 100) : 0,
        };
    }, [records]);

    if (loading) return <LoadingSpinner />;

    if (records.length === 0) {
        return (
            <EmptyState
                icon={CalendarDays}
                title="Abhi tak koi attendance record nahi"
                description="Jab instructor attendance mark karega, wo yahan dikhegi."
            />
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-display text-2xl font-semibold tracking-tight">
                    Attendance
                </h1>
                <p className="text-sm text-muted-foreground">
                   View your overall attendance and session-wise history.

                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="flex flex-col items-center justify-center py-8 lg:col-span-1">
                    <AttendanceRing
                        percentage={percentage}
                        size={140}
                        strokeWidth={10}
                        label="Overall Attendance"
                    />
                    <p className="mt-3 text-sm text-muted-foreground">
                        {presentCount} / {records.length} sessions present
                    </p>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Session History</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {records.map((r) => (
                            <div
                                key={r.id}
                                className="flex items-center justify-between rounded-xl border border-border p-3"
                            >
                                <div className="flex items-center gap-2 text-sm">
                                    {r.status === "present" ? (
                                        <CheckCircle2 className="h-4 w-4 text-success" />
                                    ) : r.status === "absent" ? (
                                        <XCircle className="h-4 w-4 text-danger" />
                                    ) : (
                                        <MinusCircle className="h-4 w-4 text-warning" />
                                    )}
                                    {r.date}
                                </div>
                                <Badge
                                    variant={
                                        r.status === "present"
                                            ? "success"
                                            : r.status === "absent"
                                                ? "danger"
                                                : "warning"
                                    }
                                >
                                    {r.status}
                                </Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}