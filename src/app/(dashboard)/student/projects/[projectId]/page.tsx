"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Award, CalendarClock, Loader2 } from "lucide-react";
import { getProject, type Project } from "@/lib/api/projects";

export default function StudentProjectDetailPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const data = await getProject(projectId);
        if (!cancelled) setProject(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load project.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (projectId) load();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

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
            <h2 className="font-medium mb-2">Attachment</h2>
            
              <a href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/${project.attachmentUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary underline"
            >
              Download attachment
            </a>
          </div>
        )}
      </div>

      {/* TODO: submission upload UI — wire to POST /projects/{projectId}/submit */}
    </div>
  );
}