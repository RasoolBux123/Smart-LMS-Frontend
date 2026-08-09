"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, Send, Loader2 } from "lucide-react";
import FileUpload from "@/components/instructor/FileUpload";
import { listCourses, type Course } from "@/lib/api/courses";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const fileTypes = [
  { value: "pdf", label: "PDF" },
  { value: "docx", label: "DOCX" },
  { value: "zip", label: "ZIP" },
  { value: "image", label: "Image" },
  { value: "ppt", label: "PPT" },
  { value: "other", label: "Other" },
];

const schema = z.object({
  title: z.string().min(5),
  courseId: z.string().min(1, "Please select a course"),
  description: z.string().min(10),
  instructions: z.string().min(5),
  deadline: z.string().min(1),
  totalMarks: z.coerce.number().min(1),
  allowedFileTypes: z.array(z.string()).min(1),
  maxFileSizeMb: z.coerce.number().min(1),
});

type ProjectFormValues = z.infer<typeof schema>;

export default function ProjectForm({ mode }: { mode: "create" | "edit" }) {
  const router = useRouter();

  const [projectFile, setProjectFile] = useState<File | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      allowedFileTypes: ["pdf"],
      maxFileSizeMb: 25,
      totalMarks: 100,
    },
  });

  // Load courses from the real backend via your typed API client
  useEffect(() => {
    let cancelled = false;

    async function loadCourses() {
      try {
        setLoadingCourses(true);
        const data = await listCourses();

        if (cancelled) return;

        // If the logged-in user is an instructor, only show their own courses.
        // Pull the current user id however your auth context stores it —
        // e.g. from a useAuth() hook, a decoded JWT, or localStorage.
        const currentUserId =
          typeof window !== "undefined" ? localStorage.getItem("userId") : null;

        const filtered = currentUserId
          ? data.filter((c) => c.instructorId === currentUserId)
          : data;

        setCourses(filtered);
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          toast.error(err instanceof Error ? err.message : "Could not load courses.");
        }
      } finally {
        if (!cancelled) setLoadingCourses(false);
      }
    }

    loadCourses();
    return () => {
      cancelled = true;
    };
  }, []);

  async function submit(values: ProjectFormValues, publish: boolean) {
  try {
    setSubmitting(true);

    if (!projectFile) {
      toast.error("Please attach a project file before submitting.");
      setSubmitting(false);
      return;
    }

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const formData = new FormData();
    formData.append("courseId", values.courseId);
    formData.append("title", values.title);
    formData.append("description", values.description);
    formData.append("instructions", values.instructions);
    formData.append("dueAt", values.deadline);
    formData.append("maxScore", String(values.totalMarks));
    formData.append("maxFileSizeMb", String(values.maxFileSizeMb));
    formData.append("allowedFileTypes", JSON.stringify(values.allowedFileTypes));
    formData.append("status", publish ? "published" : "draft");
    formData.append("file", projectFile);

    const res = await fetch(`${API_BASE}/projects`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });

    const body = await res.json().catch(() => null);

    if (!res.ok || body?.success === false) {
      const detail = Array.isArray(body?.detail)
        ? body.detail.map((d: any) => `${d.loc?.[d.loc.length - 1]}: ${d.msg}`).join(", ")
        : body?.detail || body?.message;
      throw new Error(detail || `Request failed (${res.status})`);
    }

    toast.success(publish ? "Project published." : "Project saved.");
    router.push("/instructor/projects");
  } catch (err) {
    console.error(err);
    toast.error(err instanceof Error ? err.message : "Something went wrong.");
  } finally {
    setSubmitting(false);
  }
}

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Label>Project Title</Label>
            <Input placeholder="AI Chatbot Development Project" {...register("title")} />
            {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <Label>Course</Label>
            <Controller
              control={control}
              name="courseId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={loadingCourses ? "Loading courses..." : "Select course"}
                    />
                  </SelectTrigger>

                  <SelectContent>
                    {loadingCourses && (
                      <p className="px-2.5 py-3 text-sm text-muted-foreground flex items-center gap-2">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Loading courses...
                      </p>
                    )}

                    {!loadingCourses && courses.length === 0 && (
                      <p className="px-2.5 py-3 text-sm text-muted-foreground">
                        No courses available.
                      </p>
                    )}

                    {!loadingCourses &&
                      courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.courseId && (
              <p className="text-sm text-red-500 mt-1">{errors.courseId.message}</p>
            )}
          </div>

          <div>
            <Label>Description</Label>
            <Textarea rows={3} {...register("description")} />
          </div>

          <div>
            <Label>Instructions</Label>
            <Textarea rows={3} {...register("instructions")} />
          </div>

          <div>
            <Label>Deadline</Label>
            <Input type="datetime-local" {...register("deadline")} />
          </div>

          <div>
            <Label>Total Marks</Label>
            <Input type="number" {...register("totalMarks")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submission Rules</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div>
            <Label>Allowed Submission File Types</Label>
            <Controller
              control={control}
              name="allowedFileTypes"
              render={({ field }) => (
                <div className="flex flex-wrap gap-4 mt-3">
                  {fileTypes.map((type) => (
                    <label key={type.value} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={field.value.includes(type.value)}
                        onCheckedChange={(checked) => {
                          field.onChange(
                            checked
                              ? [...field.value, type.value]
                              : field.value.filter((v) => v !== type.value),
                          );
                        }}
                      />
                      {type.label}
                    </label>
                  ))}
                </div>
              )}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Maximum File Size (MB)</Label>
              <Input type="number" {...register("maxFileSizeMb")} />
            </div>

            <div>
              <Label>Total Marks</Label>
              <Input type="number" {...register("totalMarks")} />
            </div>
          </div>

          <div>
            <FileUpload title="Project Attachment" onFileSelect={setProjectFile} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={submitting}
          onClick={handleSubmit((values) => submit(values, false))}
        >
          <Save className="h-4 w-4" />
          Save Draft
        </Button>

        <Button
          type="button"
          disabled={submitting}
          onClick={handleSubmit((values) => submit(values, true))}
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {mode === "create" ? "Publish Project" : "Save & Publish"}
        </Button>
      </div>
    </form>
  );
}