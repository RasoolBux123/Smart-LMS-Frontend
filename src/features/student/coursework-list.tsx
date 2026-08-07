import { StudentCourseworkTable } from "@/features/student/coursework-table";
import { courseworkLabels } from "@/features/student/coursework-config";
import { currentStudent } from "@/data/users";
import { courseworkForStudent } from "@/lib/selectors";
import type { CourseworkKind } from "@/types";

export function CourseworkList({ kind }: { kind: CourseworkKind }) {
  const labels = courseworkLabels[kind];
  const rows = courseworkForStudent(currentStudent.id, kind);

  return (
    <div className="space-y-7">
      <div className="space-y-1.5">
        <h1 className="font-display text-2xl font-semibold">{labels.plural}</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {labels.subtitle}
        </p>
      </div>

      <StudentCourseworkTable rows={rows} kind={kind} />
    </div>
  );
}


// import { StudentCourseworkTable } from "@/features/student/coursework-table";
// import { courseworkLabels } from "@/features/student/coursework-config";
// import { currentStudent } from "@/data/users";
// import { courseworkForStudent } from "@/lib/selectors";
// import type { CourseworkKind } from "@/types";

// export function CourseworkList({ kind }: { kind: CourseworkKind }) {
//   const labels = courseworkLabels[kind];
//   const rows = courseworkForStudent(currentStudent.id, kind);

//   return (
//     <div className="space-y-7">
//       <div className="space-y-1.5">
//         <h1 className="font-display text-2xl font-semibold">{labels.plural}</h1>
//         <p className="text-sm leading-relaxed text-muted-foreground">
//           {labels.subtitle}
//         </p>
//       </div>

//       <StudentCourseworkTable rows={rows} kind={kind} />
//     </div>
//   );
// }
