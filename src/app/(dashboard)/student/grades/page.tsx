"use client";

import { useEffect, useState } from "react";
import { listCourses, type Course } from "@/lib/api/courses";
import { getStudentGrading, type StudentGradingReport } from "@/lib/api/grading";
import { GradingAccordion } from "@/components/shared/grading-accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { useCurrentUser } from "@/hooks/use-current-user";
import { GraduationCap } from "lucide-react";
import { toast } from "sonner";

export default function StudentGradingPage() {
  const { user } = useCurrentUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState("");
  const [report, setReport] = useState<StudentGradingReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listCourses()
      .then((res) => {
        setCourses(res.data);
        if (res.data.length) setCourseId(res.data[0].id);
      })
      .catch(() => toast.error("Courses load nahi ho sake"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!courseId || !user?.email) return;
    getStudentGrading(user.email, courseId)
      .then((res) => setReport(res.data))
      .catch(() => toast.error("Grading data load nahi ho saka"));
  }, [courseId, user?.email]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Grading
          </h1>
          {report ? (
            <>
              <p className="mt-1 text-sm text-primary">
                Instructor: {report.instructorName}
              </p>
              <p className="text-sm text-muted-foreground">
                {report.courseTitle}
              </p>
            </>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">
              Apni assignments, quizzes, projects aur exams ki grading yahan dekhein.
            </p>
          )}
        </div>

        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="h-10 rounded-lg border border-border bg-card px-3 text-sm"
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {/* Status legend */}
      <div className="flex flex-wrap items-center gap-6 text-sm">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-success" /> Submitted
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-warning" /> Pending
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-danger" /> Not Submitted
        </span>
      </div>

      {!report ? (
        <EmptyState
          icon={GraduationCap}
          title="Grading data nahi mila"
          description="Is course ke liye abhi tak koi grading record nahi hai."
        />
      ) : (
        <>
          <div className="space-y-4">
            <GradingAccordion title="Assignment" rows={report.assignments} defaultOpen />
            <GradingAccordion title="Quiz" rows={report.quizzes} />
            <GradingAccordion title="Project" rows={report.projects} />
            <GradingAccordion title="Exam" rows={report.exams} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Student Performance Overview</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3">Component</th>
                    <th className="px-4 py-3">Weightage</th>
                    <th className="px-4 py-3">Total Marks</th>
                    <th className="px-4 py-3">Obtained Marks</th>
                    <th className="px-4 py-3">Weighted Score %</th>
                  </tr>
                </thead>
                <tbody>
                  {report.performance.map((p) => (
                    <tr
                      key={p.component}
                      className="border-b border-border/60 last:border-0"
                    >
                      <td className="px-4 py-3 font-medium">{p.component}</td>
                      <td className="px-4 py-3">
                        {p.weightagePercent.toFixed(2)}%
                      </td>
                      <td className="px-4 py-3">{p.totalMarks.toFixed(2)}</td>
                      <td className="px-4 py-3">{p.obtainedMarks.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        {p.weightedScorePercent.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-primary-soft font-semibold">
                    <td className="px-4 py-3">Total</td>
                    <td className="px-4 py-3">
                      {report.totalWeightagePercent.toFixed(2)}%
                    </td>
                    <td className="px-4 py-3">
                      {report.totalMarks.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      {report.totalObtainedMarks.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-primary">
                      {report.overallWeightedScorePercent.toFixed(2)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}


// "use client";

// import { useEffect, useState } from "react";
// import { listCourses, Course } from "@/lib/api/courses";
// import { listAssignmentsForCourse, myGrades, Assignment, Submission } from "@/lib/api/assignments";

// type Row = {
//   assignment: Assignment;
//   submission?: Submission;
// };

// export default function StudentGradesPage() {
//   const [courses, setCourses] = useState<Course[]>([]);
//   const [courseId, setCourseId] = useState("");
//   const [rows, setRows] = useState<Row[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     listCourses().then((res) => {
//       setCourses(res.data);
//       if (res.data[0]) setCourseId(res.data[0].id);
//       setLoading(false);
//     });
//   }, []);

//   useEffect(() => {
//     if (!courseId) return;
//     async function load() {
//       const [aRes, gRes] = await Promise.all([
//         listAssignmentsForCourse(courseId),
//         myGrades(courseId),
//       ]);
//       const byAssignment = new Map<string, Submission>(
//         gRes.data.map((s: Submission) => [s.assignmentId, s])
//       );
//       setRows(
//         aRes.data.map((a: Assignment) => ({
//           assignment: a,
//           submission: byAssignment.get(a.id),
//         }))
//       );
//     }
//     load();
//   }, [courseId]);

//   if (loading) return <p className="text-sm text-slate-400">Loading…</p>;

//   return (
//     <div className="space-y-6">
//       <div>
//         <h2 className="font-display text-2xl font-semibold text-slate-900">My grades</h2>
//         <p className="mt-1 text-sm text-slate-500">Scores and feedback across your enrolled courses.</p>
//       </div>

//       <select
//         value={courseId}
//         onChange={(e) => setCourseId(e.target.value)}
//         className="max-w-md rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
//       >
//         {courses.length === 0 && <option value="">No enrolled courses</option>}
//         {courses.map((c) => (
//           <option key={c.id} value={c.id}>
//             {c.title}
//           </option>
//         ))}
//       </select>

//       <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
//         <table className="w-full text-sm">
//           <thead>
//             <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-xs uppercase tracking-wide text-slate-500">
//               <th className="px-6 py-3">Assessment</th>
//               <th className="px-6 py-3">Type</th>
//               <th className="px-6 py-3">Score</th>
//               <th className="px-6 py-3">Feedback</th>
//             </tr>
//           </thead>
//           <tbody>
//             {rows.length === 0 && (
//               <tr>
//                 <td colSpan={4} className="px-6 py-10 text-center text-slate-400">
//                   No assessments for this course.
//                 </td>
//               </tr>
//             )}
//             {rows.map(({ assignment, submission }) => (
//               <tr key={assignment.id} className="border-b border-slate-50 last:border-0">
//                 <td className="px-6 py-4 font-medium text-slate-900">{assignment.title}</td>
//                 <td className="px-6 py-4 capitalize text-slate-600">{assignment.type}</td>
//                 <td className="px-6 py-4 text-slate-700">
//                   {submission?.score != null
//                     ? `${submission.score} / ${assignment.maxScore}`
//                     : submission
//                       ? "Submitted · pending grade"
//                       : "Not submitted"}
//                 </td>
//                 <td className="px-6 py-4 text-slate-500">{submission?.feedback || "—"}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }
