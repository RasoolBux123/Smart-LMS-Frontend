"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Eye, Upload, Download, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { FolderKanban } from "lucide-react";
import {
  listStudentProjects,
  getMySubmissionsForCourse,
  submitProject,
  getFileUrl,
  type Project,
  type ProjectSubmission,
} from "@/lib/api/projects";
import { toast } from "sonner";

type Row = Project & { submission?: ProjectSubmission };

export default function StudentProjectsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const loadData = async () => {
    try {
      const projects = await listStudentProjects();

      // ek-ek course ke liye submissions fetch karo (duplicate course ids skip karke)
      const courseIds = Array.from(new Set(projects.map((p) => p.courseId)));
      const submissionLists = await Promise.all(
        courseIds.map((cid) =>
          getMySubmissionsForCourse(cid).catch(() => [] as ProjectSubmission[]),
        ),
      );
      const submissionByProjectId = new Map<string, ProjectSubmission>();
      submissionLists.flat().forEach((s) => submissionByProjectId.set(s.assignmentId, s));

      const merged: Row[] = projects.map((p) => ({
        ...p,
        submission: submissionByProjectId.get(p.id),
      }));

      setRows(merged);
    } catch (e) {
      toast.error("Projects load nahi ho sake");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStatus = (row: Row) => {
    if (row.submission) return "submitted";
    if (new Date(row.dueAt) < new Date()) return "not_submitted";
    return "pending";
  };

  const statusBadge = (status: string) => {
    if (status === "submitted") return <Badge variant="success">Submitted</Badge>;
    if (status === "not_submitted") return <Badge variant="danger">Not Submitted</Badge>;
    return <Badge variant="warning">Pending</Badge>;
  };

  const handleUploadClick = (projectId: string) => {
    fileInputs.current[projectId]?.click();
  };

  const handleFileChange = async (projectId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId(projectId);
    try {
      await submitProject(projectId, file);
      toast.success("Project submit ho gaya");
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submit nahi ho saka");
    } finally {
      setUploadingId(null);
      e.target.value = "";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <p className="text-muted-foreground">Loading projects...</p>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={FolderKanban}
        title="No projects yet"
        description="Jab instructor koi project publish karega, wo yahan dikhega."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Projects</h1>
        <p className="text-sm text-muted-foreground">
          All projects across your enrolled courses.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Total Marks</TableHead>
                <TableHead>Submission Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const status = getStatus(row);
                return (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {row.courseTitle || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(row.dueAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{row.maxScore}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {row.submission?.submittedAt
                        ? new Date(row.submission.submittedAt).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell>{statusBadge(status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        {/* View */}
                        <Link
                          href={`/student/projects/${row.id}`}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        {/* Download — instructor's project file */}
                        {row.attachmentUrl && (

                          <a href={getFileUrl(row.attachmentUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                            title="Download project file"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        )}

                        {/* Upload — sirf jab abhi submit nahi hua */}
                        {!row.submission && (
                          <>
                            <input
                              type="file"
                              className="hidden"
                              ref={(el) => {
                                fileInputs.current[row.id] = el;
                              }}
                              onChange={(e) => handleFileChange(row.id, e)}
                            />
                            <button
                              onClick={() => handleUploadClick(row.id)}
                              disabled={uploadingId === row.id}
                              className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-50"
                              title="Upload submission"
                            >
                              {uploadingId === row.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Upload className="h-4 w-4" />
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div >
  );
}