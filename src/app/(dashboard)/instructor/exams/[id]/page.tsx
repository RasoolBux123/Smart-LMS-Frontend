"use client";

import Link from "next/link";

import { ArrowLeft, Eye } from "lucide-react";

type SubmissionRow = {
  id: string;
  student: string;
  file: string;
  submitted: string;
  status: string;
  marks: string;
};

const submissions: SubmissionRow[] = [];

export default function ExamDetailPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/instructor/exams"

        className="inline-flex items-center gap-2 text-sm text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Exams
      </Link>

      <div className="rounded-xl border p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Exam</h1>

          <p className="text-sm text-muted-foreground">—</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Deadline</p>

            <p>—</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Total Marks</p>

            <p>—</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Attempts</p>

            <p>—</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <div className="p-5 border-b">
          <h2 className="font-semibold">Student Submissions</h2>
        </div>

        <div className="divide-y">
          {submissions.length === 0 && (
            <p className="p-10 text-center text-sm text-muted-foreground">
              No submissions yet.
            </p>
          )}
          {submissions.map((item) => (
            <div
              key={item.id}

              className="flex items-center justify-between p-5"
            >
              <div>
                <h3 className="font-medium">{item.student}</h3>

                <p className="text-sm text-muted-foreground">
                  {item.file || "No file uploaded"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`

rounded-full
px-3
py-1
text-xs

${
  item.status === "Submitted"
    ? "bg-green-500/10 text-green-500"
    : item.status === "Pending"
      ? "bg-yellow-500/10 text-yellow-500"
      : "bg-red-500/10 text-red-500"
}

`}
                >
                  {item.status}
                </span>

                {item.status === "Submitted" && (
                  <button className="rounded-lg border p-2">
                    <Eye className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
