"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Award, CalendarClock, Loader2, Download, Upload } from "lucide-react";
import {
  getProject,
  getMySubmissionsForCourse,
  submitProject,
  getFileUrl,
  type Project,
  type ProjectSubmission,
} from "@/lib/api/projects";
import { toast } from "sonner";

export default function StudentProjectDetailPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [submission, setSubmission] = useState<ProjectSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getProject(projectId);
      setProject(data);

      const subs = await getMySubmissionsForCourse(data.courseId).catch(() => []);
      const mine = subs.find((s) => s.assignmentId === data.id) || null;
      setSubmission(mine);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load project.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) load();
  }, [projectId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !project) return;

    setUploading(true);
    try {
      await submitProject(project.id, file);
      toast.success("Project submit ho gaya");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submit nahi ho saka");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading project...
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="py-16 text-center text-sm text-red-500">
        {error || "Project not found."}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href="/student/projects"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to projects
      </Link>

      <div className="rounded-2xl border bg-card p-7">
        <h1 className="text-xl font-semibold sm:text-2xl">{project.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarClock className="h-3.5 w-3.5" />
            Due {new Date(project.dueAt).toLocaleString()}
          </span>
          <span className="flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5" />
            {project.maxScore} points
          </span>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-7 space-y-4">
        <div>
          <h2 className="font-medium mb-2">Description</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {project.description}
          </p>
        </div>

        {project.instructions && (
          <div>
            <h2 className="font-medium mb-2">Instructions</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {project.instructions}
            </p>
          </div>
        )}

        {project.attachmentUrl && (
          <div>
<<<<<<< HEAD
            <h2 className="font-medium mb-2">Attachment</h2>
            
              <a href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/${project.attachmentUrl}`}
=======
            <h2 className="font-medium mb-2">Project file</h2>

            <a href={getFileUrl(project.attachmentUrl)}
>>>>>>> 37ea9f3 (Update LMS frontend)
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary underline"
            >
              <Download className="h-3.5 w-3.5" />
              Download attachment
            </a>
          </div>
        )}
      </div>

      {/* Submission section */}
      <div className="rounded-2xl border bg-card p-7 space-y-4">
        <h2 className="font-medium">Your submission</h2>

        {submission ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Submitted on{" "}
              {submission.submittedAt
                ? new Date(submission.submittedAt).toLocaleString()
                : "—"}
            </p>
            {submission.content && (

              <a href={getFileUrl(submission.content)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary underline"
              >
                <Download className="h-3.5 w-3.5" />
                Download your submission
              </a>
            )}
            {submission.score !== null && submission.score !== undefined && (
              <p className="text-sm">
                Score: <span className="font-medium">{submission.score} / {project.maxScore}</span>
              </p>
            )}
            {submission.feedback && (
              <p className="text-sm text-muted-foreground">
                Feedback: {submission.feedback}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Aapne abhi tak submit nahi kiya.
            </p>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border bg-secondary px-4 py-2 text-sm hover:bg-secondary/80">
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {uploading ? "Uploading..." : "Upload submission"}
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </label>
          </div>
        )
        }
      </div >
    </div >
  );
}