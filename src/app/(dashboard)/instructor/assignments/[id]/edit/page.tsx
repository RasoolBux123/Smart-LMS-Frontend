import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AssignmentForm } from "../../_components/AssignmentForm";
import { getAssignment } from "@/lib/api/assignments";

export default async function EditAssignmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const assignment = await getAssignment(id).catch(() => null);
  if (!assignment) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/instructor/assignments"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to assignments
      </Link>
      <div>
        <h1 className="font-display text-2xl font-semibold">Edit assignment</h1>
        <p className="text-sm text-muted-foreground">
          Update the details for &ldquo;{assignment.title}&rdquo;.
        </p>
      </div>
      <AssignmentForm
        mode="edit"
        assignmentId={id}
        defaultValues={assignment}
      />
    </div>
  );
}
