"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AttendanceRing } from "@/components/shared/attendance-ring";
import { EmptyState } from "@/components/shared/empty-state";
import { markAttendance ,getCourseAttendance  } from "@/lib/api/attendance";
import { listCourses, type Course } from "@/lib/api/courses";
import { listCourseEnrollments, enrollStudent } from "@/lib/api/enrollments";

import { listUsers } from "@/lib/api/users";
import { CalendarCheck2, Save, Users, UserPlus } from "lucide-react";
import { toast } from "sonner";

type LocalStatus = "present" | "absent" | "leave";

interface StudentRow {
    id: string;
    email: string;
    name: string;
    status: LocalStatus;
}

interface StudentOption {
    id: string;
    name: string;
    email: string;
}

export default function InstructorAttendancePage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [courseId, setCourseId] = useState<string>("");
    const [sessionDate, setSessionDate] = useState(
        new Date().toISOString().slice(0, 10),
    );
    const [students, setStudents] = useState<StudentRow[]>([]);
    const [allStudents, setAllStudents] = useState<StudentOption[]>([]);
    const [selectedToAdd, setSelectedToAdd] = useState("");
    const [saving, setSaving] = useState(false);

    // courses.ts apna handle() use karta hai -> already unwrapped array
    useEffect(() => {
        listCourses()
            .then((data) => {
                setCourses(data);
                if (data.length) setCourseId(data[0].id);
            })
            .catch(() => toast.error("Courses load nahi ho sake"));
    }, []);

    // users.ts apiFetch use karta hai -> envelope milta hai, isliye .data
    useEffect(() => {
        listUsers("student")
            .then((res) => setAllStudents(res.data))
            .catch(() => toast.error("Students list load nahi ho saki"));
    }, []);

    // backend date "2026-08-10" ya ISO datetime — dono se YYYY-MM-DD nikaal lo
const toDateKey = (d: string) => String(d).slice(0, 10);

const loadEnrolledStudents = async (id: string, date: string) => {
    try {
        const [enrollments, attendanceRes] = await Promise.all([
            listCourseEnrollments(id),
            getCourseAttendance(id),
        ]);

        const docs = attendanceRes?.data ?? [];
        console.log("attendance docs:", docs); // shape confirm karne ke liye

        const savedByStudent = new Map<string, LocalStatus>(
            docs
                .filter((a: any) => toDateKey(a.date) === toDateKey(date))
                .map((a: any) => [
                    String(a.studentId ?? a.student_id ?? a.student?.id),
                    a.status as LocalStatus,
                ]),
        );

        setStudents(
            enrollments
                .filter((e) => e.student)
                .map((e) => ({
                    id: e.student!.id,
                    email: e.student!.email,
                    name: e.student!.name,
                    status: savedByStudent.get(String(e.student!.id)) ?? "present",
                })),
        );
    } catch (err) {
        console.error("load enrolled failed:", err);
        toast.error("Enrolled students load nahi ho sake");
    }
};

    useEffect(() => {
        if (!courseId) return;
        loadEnrolledStudents(courseId, sessionDate);
    }, [courseId, sessionDate]);

    const setStatus = (id: string, status: LocalStatus) => {
        setStudents((prev) =>
            prev.map((s) => (s.id === id ? { ...s, status } : s)),
        );
    };

    const presentCount = students.filter((s) => s.status === "present").length;
    const percentage = students.length
        ? Math.round((presentCount / students.length) * 100)
        : 0;

    const handleEnroll = async () => {
        if (!selectedToAdd || !courseId) return;
        try {
            await enrollStudent(courseId, selectedToAdd);
            toast.success("Student enroll ho gaya");
            setSelectedToAdd("");
            await loadEnrolledStudents(courseId);
        } catch {
            toast.error("Enroll nahi ho saka (shayad pehle se enrolled hai)");
        }
    };

    const handleSave = async () => {
        if (!courseId) return;
        setSaving(true);
        try {
            await markAttendance({
                courseId,
                date: sessionDate,
                attendance: students.map((s) => ({
                    studentId: s.id,
                    status: s.status,
                })),
            });
            toast.success("Attendance save ho gayi");
        } catch {
            toast.error("Attendance save nahi ho saki");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-2xl font-semibold tracking-tight">
                        Attendance
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        View your overall attendance and session-wise history.

                    </p>
                </div>
                <Button onClick={handleSave} disabled={saving || !students.length}>
                    <Save className="h-4 w-4" />
                    {saving ? "Saving..." : "Save Attendance"}
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            Students
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-2">
                            <select
                                value={courseId}
                                onChange={(e) => setCourseId(e.target.value)}
                                className="h-9 rounded-lg border border-border bg-card px-3 text-sm"
                            >
                                {courses.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.title}
                                    </option>
                                ))}
                            </select>

                            <input
                                type="date"
                                value={sessionDate}
                                onChange={(e) => setSessionDate(e.target.value)}
                                className="h-9 rounded-lg border border-border bg-card px-3 text-sm"
                            />

                            <select
                                value={selectedToAdd}
                                onChange={(e) => setSelectedToAdd(e.target.value)}
                                className="h-9 rounded-lg border border-border bg-card px-3 text-sm"
                            >
                                <option value="">Students</option>
                                {allStudents
                                    .filter((s) => !students.some((st) => st.id === s.id))
                                    .map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} ({s.email})
                                        </option>
                                    ))}
                            </select>

                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleEnroll}
                                disabled={!selectedToAdd}
                            >
                                <UserPlus className="h-4 w-4" />
                                Add
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-2">
                        {students.length === 0 ? (
                            <EmptyState
                                icon={CalendarCheck2}
                                title="Koi student nahi mila"
                                description="Upar se student select kar ke 'Add' dabayein, ya is course mein filhaal koi enrolled student nahi hai."
                            />
                        ) : (
                            students.map((s) => (
                                <div
                                    key={s.id}
                                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-3"
                                >
                                    <div>
                                        <p className="text-sm font-medium">{s.name}</p>
                                        <p className="text-xs text-muted-foreground">{s.email}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        {(["present", "absent", "leave"] as LocalStatus[]).map(
                                            (opt) => (
                                                <button
                                                    key={opt}
                                                    onClick={() => setStatus(s.id, opt)}
                                                    className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${s.status === opt
                                                        ? opt === "present"
                                                            ? "bg-success text-white"
                                                            : opt === "absent"
                                                                ? "bg-danger text-white"
                                                                : "bg-warning text-white"
                                                        : "bg-secondary text-secondary-foreground hover:opacity-80"
                                                        }`}
                                                >
                                                    {opt}
                                                </button>
                                            ),
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Session Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-4">
                        <AttendanceRing percentage={percentage} label="Present Today" />
                        <div className="flex w-full justify-around text-center text-sm">
                            <div>
                                <p className="font-display text-lg font-semibold text-success">
                                    {presentCount}
                                </p>
                                <Badge variant="success" className="mt-1">
                                    Present
                                </Badge>
                            </div>
                            <div>
                                <p className="font-display text-lg font-semibold text-danger">
                                    {students.length - presentCount}
                                </p>
                                <Badge variant="danger" className="mt-1">
                                    Absent
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}