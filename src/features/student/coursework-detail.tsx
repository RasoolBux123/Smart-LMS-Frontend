import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Target,
  ListChecks,
  Paperclip,
  Award,
  User,
  CalendarClock,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeadlineRing } from "@/components/shared/deadline-ring";
import { SubmissionStatusBadge } from "@/components/shared/status-badge";
import { FileTypeIcon } from "@/components/shared/file-icon";
import { SubmissionPanel } from "@/features/student/submission-panel";
import { courseworkLabels } from "@/features/student/coursework-config";
import { currentStudent } from "@/data/users";
import { studentCourseworkDetail } from "@/lib/selectors";
import { formatBytes, formatDate } from "@/lib/utils";
import type { CourseworkKind } from "@/types";

export function CourseworkDetail({
  kind,
  id,
}: {
  kind: CourseworkKind;
  id: string;
}) {
  const labels = courseworkLabels[kind];
  const row = studentCourseworkDetail(currentStudent.id, kind, id);

  if (!row) notFound();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href={labels.basePath}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to{" "}
        {labels.plural.toLowerCase()}
      </Link>

      <div className="card-shadow flex flex-col gap-5 rounded-2xl border border-border bg-card p-7 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{row.courseCode}</Badge>
            <SubmissionStatusBadge status={row.studentStatus} />
          </div>

          <h1 className="mt-3 font-display text-xl font-semibold leading-snug sm:text-2xl">
            {row.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> {row.instructorName}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarClock className="h-3.5 w-3.5" /> Due{" "}
              {formatDate(row.deadline)}
            </span>
            <span className="flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5" /> {row.totalMarks} points
            </span>
          </div>
        </div>

        <DeadlineRing
          createdAt={row.createdAt}
          deadline={row.deadline}
          size={64}
          strokeWidth={5}
          submitted={
            row.studentStatus === "submitted" || row.studentStatus === "graded"
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {row.description}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center gap-2 space-y-0">
              <Target className="h-4 w-4 text-primary" />
              <CardTitle>Objectives</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {row.objectives.map((o, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {o}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center gap-2 space-y-0">
              <ListChecks className="h-4 w-4 text-primary" />
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {row.instructions}
              </p>
            </CardContent>
          </Card>

          {row.attachments.length > 0 && (
            <Card>
              <CardHeader className="flex-row items-center gap-2 space-y-0">
                <Paperclip className="h-4 w-4 text-primary" />
                <CardTitle>Attachments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {row.attachments.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-4 rounded-xl border border-border p-4"
                  >
                    <FileTypeIcon kind={a.kind} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{a.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatBytes(a.size)}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1">
          <SubmissionPanel row={row} />
        </div>
      </div>
    </div>
  );
}


// import { notFound } from "next/navigation";
// import Link from "next/link";
// import {
//   ArrowLeft,
//   Target,
//   ListChecks,
//   Paperclip,
//   Award,
//   User,
//   CalendarClock,
// } from "lucide-react";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { DeadlineRing } from "@/components/shared/deadline-ring";
// import { SubmissionStatusBadge } from "@/components/shared/status-badge";
// import { FileTypeIcon } from "@/components/shared/file-icon";
// import { SubmissionPanel } from "@/features/student/submission-panel";
// import { courseworkLabels } from "@/features/student/coursework-config";
// import { currentStudent } from "@/data/users";
// import { studentCourseworkDetail } from "@/lib/selectors";
// import { formatBytes, formatDate } from "@/lib/utils";
// import type { CourseworkKind } from "@/types";

// export function CourseworkDetail({
//   kind,
//   id,
// }: {
//   kind: CourseworkKind;
//   id: string;
// }) {
//   const labels = courseworkLabels[kind];
//   const row = studentCourseworkDetail(currentStudent.id, kind, id);

//   if (!row) notFound();

//   return (
//     <div className="mx-auto max-w-5xl space-y-6">
//       <Link
//         href={labels.basePath}
//         className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
//       >
//         <ArrowLeft className="h-3.5 w-3.5" /> Back to{" "}
//         {labels.plural.toLowerCase()}
//       </Link>

//       <div className="card-shadow flex flex-col gap-5 rounded-2xl border border-border bg-card p-7 sm:flex-row sm:items-center sm:justify-between">
//         <div className="min-w-0">
//           <div className="flex flex-wrap items-center gap-2">
//             <Badge variant="outline">{row.courseCode}</Badge>
//             <SubmissionStatusBadge status={row.studentStatus} />
//           </div>

//           <h1 className="mt-3 font-display text-xl font-semibold leading-snug sm:text-2xl">
//             {row.title}
//           </h1>

//           <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
//             <span className="flex items-center gap-1.5">
//               <User className="h-3.5 w-3.5" /> {row.instructorName}
//             </span>
//             <span className="flex items-center gap-1.5">
//               <CalendarClock className="h-3.5 w-3.5" /> Due{" "}
//               {formatDate(row.deadline)}
//             </span>
//             <span className="flex items-center gap-1.5">
//               <Award className="h-3.5 w-3.5" /> {row.totalMarks} points
//             </span>
//           </div>
//         </div>

//         <DeadlineRing
//           createdAt={row.createdAt}
//           deadline={row.deadline}
//           size={64}
//           strokeWidth={5}
//           submitted={
//             row.studentStatus === "submitted" || row.studentStatus === "graded"
//           }
//         />
//       </div>

//       <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
//         <div className="space-y-6 lg:col-span-2">
//           <Card>
//             <CardHeader>
//               <CardTitle>Description</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <p className="text-sm leading-relaxed text-muted-foreground">
//                 {row.description}
//               </p>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex-row items-center gap-2 space-y-0">
//               <Target className="h-4 w-4 text-primary" />
//               <CardTitle>Objectives</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <ul className="space-y-3">
//                 {row.objectives.map((o, i) => (
//                   <li
//                     key={i}
//                     className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground"
//                   >
//                     <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
//                     {o}
//                   </li>
//                 ))}
//               </ul>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex-row items-center gap-2 space-y-0">
//               <ListChecks className="h-4 w-4 text-primary" />
//               <CardTitle>Instructions</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <p className="text-sm leading-relaxed text-muted-foreground">
//                 {row.instructions}
//               </p>
//             </CardContent>
//           </Card>

//           {row.attachments.length > 0 && (
//             <Card>
//               <CardHeader className="flex-row items-center gap-2 space-y-0">
//                 <Paperclip className="h-4 w-4 text-primary" />
//                 <CardTitle>Attachments</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 {row.attachments.map((a) => (
//                   <div
//                     key={a.id}
//                     className="flex items-center gap-4 rounded-xl border border-border p-4"
//                   >
//                     <FileTypeIcon kind={a.kind} />
//                     <div className="min-w-0 flex-1">
//                       <p className="truncate text-sm font-medium">{a.name}</p>
//                       <p className="mt-0.5 text-xs text-muted-foreground">
//                         {formatBytes(a.size)}
//                       </p>
//                     </div>
//                     <Button variant="outline" size="sm">
//                       Download
//                     </Button>
//                   </div>
//                 ))}
//               </CardContent>
//             </Card>
//           )}
//         </div>

//         <div className="lg:col-span-1">
//           <SubmissionPanel row={row} />
//         </div>
//       </div>
//     </div>
//   );
// }
