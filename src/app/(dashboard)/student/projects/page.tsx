"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, FileX2 } from "lucide-react";
import { listStudentProjects, type Project } from "@/lib/api/projects";

export default function StudentProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const data = await listStudentProjects();
        if (!cancelled) setProjects(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load projects.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const sorted = useMemo(
    () =>
      [...projects].sort(
        (a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime(),
      ),
    [projects],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Projects</h1>
        <p className="text-sm text-muted-foreground">
          All projects across your enrolled courses.
        </p>
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading projects...
          </div>
        ) : error ? (
          <div className="py-16 text-center text-sm text-red-500">{error}</div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
            <FileX2 className="h-6 w-6" />
            <p className="font-medium text-foreground">No projects found</p>
            <p className="text-sm">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {sorted.map((project) => (
              <li key={project.id}>
                <Link
                  href={`/student/projects/${project.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{project.title}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {project.courseTitle || "—"}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground whitespace-nowrap ml-4">
                    Due {new Date(project.dueAt).toLocaleDateString()}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}