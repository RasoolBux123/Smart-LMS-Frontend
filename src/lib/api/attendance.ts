import { apiFetch, type ApiEnvelope } from "./client";

export type AttendanceStatus = "present" | "absent" | "leave";

export interface AttendanceRecord {
    studentEmail: string;
    studentName?: string;
    status: AttendanceStatus;
}

export interface AttendanceSession {
    id: string;
    courseId: string;
    date: string;
    records: AttendanceRecord[];
}

// ✅ Backend ka attendance_to_public() shape (list item)
export interface StudentAttendanceItem {
    id: string;
    courseId: string;
    studentId: string;
    date: string;
    status: AttendanceStatus;
}
export interface AttendanceDoc {
    id: string;
    courseId: string;
    studentId: string;
    date: string;
    status: AttendanceStatus;
}

export async function getMyAttendance() {
    return apiFetch<ApiEnvelope<AttendanceDoc[]>>("/attendance/my");
}
export async function markAttendance(payload: {
    courseId: string;
    date: string;
    attendance: { studentId: string; status: AttendanceStatus }[];
}) {
    return apiFetch<{ success: boolean; message: string }>("/attendance", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function getCourseAttendance(courseId: string) {
    return apiFetch<ApiEnvelope<AttendanceSession[]>>(
        `/attendance/course/${courseId}`,
    );
}

// ✅ /attendance/my se list milegi
export async function getStudentAttendance() {
    return apiFetch<ApiEnvelope<StudentAttendanceItem[]>>(`/attendance/my`);
}