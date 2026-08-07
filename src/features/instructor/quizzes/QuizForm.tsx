// src/components/instructor/QuizForm.tsx
"use client";

import { useEffect, useState } from "react";
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
import { listCourses, Course } from "@/lib/api/courses";
import FileUpload from "@/components/instructor/FileUpload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getCurrentUser(): { id: string; name: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

const fileTypes = [
  { value: "pdf", label: "PDF" },
  { value: "docx", label: "DOCX" },
  { value: "xls", label: "Excel" },
  { value: "ppt", label: "PowerPoint" },
  { value: "txt", label: "TXT" },
  { value: "zip", label: "ZIP" },
  { value: "other", label: "Other" },
];

const schema = z.object({
  title: z.string().min(5),
  courseId: z.string().min(1),
  description: z.string().min(10),
  instructions: z.string().min(5),
  deadline: z.string().min(1),
  totalMarks: z.coerce.number().min(1),
  allowedFileTypes: z.array(z.string()).min(1),
  maxFileSizeMb: z.coerce.number().min(1),
});

type QuizFormValues = z.infer<typeof schema>;

export default function QuizForm({ mode }: { mode: "create" | "edit" }) {
  const router = useRouter();
  const currentUser = getCurrentUser();

  const [quizFile, setQuizFile] = useState<File | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, control, handleSubmit } = useForm<QuizFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      allowedFileTypes: ["pdf"],
      maxFileSizeMb: 25,
      totalMarks: 100,
    },
  });

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    setCoursesLoading(true);
    setCoursesError(null);
    try {
      const all = await listCourses();
      const mine = currentUser
        ? all.filter((c) => c.instructorId === currentUser.id)
        : all;
      setCourses(mine);
    } catch (err: any) {
      setCoursesError(err.message || "Failed to load courses.");
    } finally {
      setCoursesLoading(false);
    }
  }

  async function submit(values: QuizFormValues, publish: boolean) {
    setSubmitting(true);
    try {
      const body = new FormData();
      body.append("title", values.title);
      body.append("courseId", values.courseId);
      body.append("description", values.description);
      body.append("instructions", values.instructions);
      body.append("deadline", new Date(values.deadline).toISOString());
      body.append("totalMarks", String(values.totalMarks));
      body.append("maxFileSizeMb", String(values.maxFileSizeMb));
      body.append("allowedFileTypes", JSON.stringify(values.allowedFileTypes));
      body.append("status", publish ? "published" : "draft");
      if (quizFile) body.append("attachment", quizFile);

      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`${API_BASE}/api/quizzes`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body,
      });
      const responseBody = await res.json().catch(() => null);
      if (!res.ok || responseBody?.success === false) {
        throw new Error(responseBody?.message || responseBody?.detail || "Failed to save quiz.");
      }

      toast.success(publish ? "Quiz published" : "Quiz saved");
      router.push("/instructor/quizzes");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      <Card>
        <CardHeader>
          <CardTitle>Quiz Details</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Label>Quiz Title</Label>
            <Input placeholder="Python Assignment Quiz" {...register("title")} />
          </div>

          <div>
            <Label>Course</Label>
            <Controller
              control={control}
              name="courseId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={coursesLoading}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        coursesLoading
                          ? "Loading courses..."
                          : courses.length === 0
                          ? "No courses available"
                          : "Select Course"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {coursesError && (
                      <p className="px-2.5 py-3 text-sm text-red-500">{coursesError}</p>
                    )}
                    {!coursesLoading && !coursesError && courses.length === 0 && (
                      <p className="px-2.5 py-3 text-sm text-muted-foreground">
                        You don't have any courses yet — create one first.
                      </p>
                    )}
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {coursesError && (
              <button
                type="button"
                onClick={loadCourses}
                className="text-xs text-indigo-600 hover:underline mt-1"
              >
                Retry loading courses
              </button>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submission Rules</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div>
            <Label>Allowed Answer File Types</Label>
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
                              : field.value.filter((item) => item !== type.value)
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
            <FileUpload title="Quiz Attachment" onFileSelect={setQuizFile} />
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
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Draft
        </Button>

        <Button
          type="button"
          disabled={submitting}
          onClick={handleSubmit((values) => submit(values, true))}
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {mode === "create" ? "Publish Quiz" : "Save & Publish"}
        </Button>
      </div>
    </form>
  );
}