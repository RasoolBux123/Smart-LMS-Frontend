"use client";

import { useState } from "react";
import { CheckCircle2, History, Send } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UploadDropzone, type StagedFile } from "./upload-dropzone";
import { SubmissionSuccessModal } from "./success-modal";
import { courseworkLabels } from "./coursework-config";
import { FileTypeIcon } from "@/components/shared/file-icon";
import { formatBytes, formatDateTime } from "@/lib/utils";
import type { DerivedCourseworkRow } from "@/types";

export function SubmissionPanel({ row }: { row: DerivedCourseworkRow }) {
  const labels = courseworkLabels[row.kind];

  const [staged, setStaged] = useState<StagedFile[]>([]);
  const [submitted, setSubmitted] = useState(
    row.studentStatus === "submitted" || row.studentStatus === "graded",
  );
  const [showSuccess, setShowSuccess] = useState(false);

  const allUploaded =
    staged.length > 0 && staged.every((f) => f.status === "done");
  const attemptsUsed = row.submission?.attemptNumber ?? 0;
  const canResubmit = row.resubmissionAllowed
    ? attemptsUsed < row.maxAttempts
    : attemptsUsed === 0;

  function handleSubmit() {
    setSubmitted(true);
    setShowSuccess(true);
    toast.success(`Your ${labels.singular} was submitted successfully.`);
  }

  return (
    <>
      <SubmissionSuccessModal
        open={showSuccess}
        onOpenChange={setShowSuccess}
        title={row.title}
        backHref={labels.basePath}
      />

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Your submission</CardTitle>
          {row.resubmissionAllowed && (
            <Badge variant="outline">
              Attempt{" "}
              {Math.min(attemptsUsed + (submitted ? 0 : 1), row.maxAttempts)} of{" "}
              {row.maxAttempts}
            </Badge>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {submitted && row.submission ? (
            <div className="rounded-xl border border-success/30 bg-success-soft p-5">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 className="h-4 w-4" />
                <p className="text-sm font-medium">
                  Submitted{" "}
                  {formatDateTime(row.submission.submittedAt ?? row.createdAt)}
                </p>
              </div>

              <div className="mt-4 space-y-2.5">
                {row.submission.files.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center gap-3 rounded-lg bg-card p-3"
                  >
                    <FileTypeIcon kind={f.kind} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{f.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatBytes(f.size)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {row.submission.marksAwarded !== null && (
                <p className="mt-4 text-sm">
                  Grade:{" "}
                  <span className="font-semibold">
                    {row.submission.marksAwarded}/{row.totalMarks}
                  </span>
                </p>
              )}

              {row.submission.feedback && (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {row.submission.feedback}
                </p>
              )}

              {canResubmit && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setSubmitted(false)}
                >
                  Submit a new attempt
                </Button>
              )}
            </div>
          ) : (
            <>
              <UploadDropzone
                allowedExt={row.allowedFileTypes}
                maxSizeMb={row.maxFileSizeMb}
                staged={staged}
                onChange={setStaged}
              />
              <Button
                className="w-full"
                disabled={!allUploaded}
                onClick={handleSubmit}
              >
                <Send className="h-4 w-4" /> Submit {labels.singular}
              </Button>
              {!row.resubmissionAllowed && (
                <p className="text-center text-xs leading-relaxed text-muted-foreground">
                  Resubmission is not allowed for this {labels.singular}.
                </p>
              )}
            </>
          )}

          <div className="border-t border-border pt-5">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <History className="h-3.5 w-3.5" /> Submission history
            </p>
            {row.submission ? (
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-muted-foreground">
                  Attempt {row.submission.attemptNumber} ·{" "}
                  {row.submission.submittedAt
                    ? formatDateTime(row.submission.submittedAt)
                    : "Not submitted"}
                </span>
                <Badge
                  variant={
                    row.submission.status === "late" ? "danger" : "success"
                  }
                >
                  {row.submission.status}
                </Badge>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No previous attempts.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}


// "use client";

// import { useState } from "react";
// import { CheckCircle2, History, Send } from "lucide-react";
// import { toast } from "sonner";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { UploadDropzone, type StagedFile } from "./upload-dropzone";
// import { SubmissionSuccessModal } from "./success-modal";
// import { courseworkLabels } from "./coursework-config";
// import { FileTypeIcon } from "@/components/shared/file-icon";
// import { formatBytes, formatDateTime } from "@/lib/utils";
// import type { DerivedCourseworkRow } from "@/types";

// export function SubmissionPanel({ row }: { row: DerivedCourseworkRow }) {
//   const labels = courseworkLabels[row.kind];

//   const [staged, setStaged] = useState<StagedFile[]>([]);
//   const [submitted, setSubmitted] = useState(
//     row.studentStatus === "submitted" || row.studentStatus === "graded",
//   );
//   const [showSuccess, setShowSuccess] = useState(false);

//   const allUploaded =
//     staged.length > 0 && staged.every((f) => f.status === "done");
//   const attemptsUsed = row.submission?.attemptNumber ?? 0;
//   const canResubmit = row.resubmissionAllowed
//     ? attemptsUsed < row.maxAttempts
//     : attemptsUsed === 0;

//   function handleSubmit() {
//     setSubmitted(true);
//     setShowSuccess(true);
//     toast.success(`Your ${labels.singular} was submitted successfully.`);
//   }

//   return (
//     <>
//       <SubmissionSuccessModal
//         open={showSuccess}
//         onOpenChange={setShowSuccess}
//         title={row.title}
//         backHref={labels.basePath}
//       />

//       <Card>
//         <CardHeader className="flex-row items-center justify-between space-y-0">
//           <CardTitle>Your submission</CardTitle>
//           {row.resubmissionAllowed && (
//             <Badge variant="outline">
//               Attempt{" "}
//               {Math.min(attemptsUsed + (submitted ? 0 : 1), row.maxAttempts)} of{" "}
//               {row.maxAttempts}
//             </Badge>
//           )}
//         </CardHeader>

//         <CardContent className="space-y-6">
//           {submitted && row.submission ? (
//             <div className="rounded-xl border border-success/30 bg-success-soft p-5">
//               <div className="flex items-center gap-2 text-success">
//                 <CheckCircle2 className="h-4 w-4" />
//                 <p className="text-sm font-medium">
//                   Submitted{" "}
//                   {formatDateTime(row.submission.submittedAt ?? row.createdAt)}
//                 </p>
//               </div>

//               <div className="mt-4 space-y-2.5">
//                 {row.submission.files.map((f) => (
//                   <div
//                     key={f.id}
//                     className="flex items-center gap-3 rounded-lg bg-card p-3"
//                   >
//                     <FileTypeIcon kind={f.kind} />
//                     <div className="min-w-0 flex-1">
//                       <p className="truncate text-sm font-medium">{f.name}</p>
//                       <p className="mt-0.5 text-xs text-muted-foreground">
//                         {formatBytes(f.size)}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {row.submission.marksAwarded !== null && (
//                 <p className="mt-4 text-sm">
//                   Grade:{" "}
//                   <span className="font-semibold">
//                     {row.submission.marksAwarded}/{row.totalMarks}
//                   </span>
//                 </p>
//               )}

//               {row.submission.feedback && (
//                 <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
//                   {row.submission.feedback}
//                 </p>
//               )}

//               {canResubmit && (
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   className="mt-4"
//                   onClick={() => setSubmitted(false)}
//                 >
//                   Submit a new attempt
//                 </Button>
//               )}
//             </div>
//           ) : (
//             <>
//               <UploadDropzone
//                 allowedExt={row.allowedFileTypes}
//                 maxSizeMb={row.maxFileSizeMb}
//                 staged={staged}
//                 onChange={setStaged}
//               />
//               <Button
//                 className="w-full"
//                 disabled={!allUploaded}
//                 onClick={handleSubmit}
//               >
//                 <Send className="h-4 w-4" /> Submit {labels.singular}
//               </Button>
//               {!row.resubmissionAllowed && (
//                 <p className="text-center text-xs leading-relaxed text-muted-foreground">
//                   Resubmission is not allowed for this {labels.singular}.
//                 </p>
//               )}
//             </>
//           )}

//           <div className="border-t border-border pt-5">
//             <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
//               <History className="h-3.5 w-3.5" /> Submission history
//             </p>
//             {row.submission ? (
//               <div className="flex items-center justify-between gap-3 text-sm">
//                 <span className="text-muted-foreground">
//                   Attempt {row.submission.attemptNumber} ·{" "}
//                   {row.submission.submittedAt
//                     ? formatDateTime(row.submission.submittedAt)
//                     : "Not submitted"}
//                 </span>
//                 <Badge
//                   variant={
//                     row.submission.status === "late" ? "danger" : "success"
//                   }
//                 >
//                   {row.submission.status}
//                 </Badge>
//               </div>
//             ) : (
//               <p className="text-sm text-muted-foreground">
//                 No previous attempts.
//               </p>
//             )}
//           </div>
//         </CardContent>
//       </Card>
//     </>
//   );
// }
