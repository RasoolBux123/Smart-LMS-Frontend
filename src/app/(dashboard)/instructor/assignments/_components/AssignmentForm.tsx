"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, Send } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import FileUpload from "@/components/instructor/FileUpload";

import {
  createAssignment,
  updateAssignment,
  uploadAssignmentAttachment,
  getCourseOptions,
} from "@/lib/api/assignments";
import type {
  Assignment,
  AssignmentPayload,
  FileKind,
} from "@/types/assignment";
import type { CourseOption } from "@/types/course";

const fileKinds: { value: FileKind; label: string }[] = [
  { value: "pdf", label: "PDF" },
  { value: "docx", label: "DOCX" },
  { value: "image", label: "Image" },
  { value: "zip", label: "ZIP" },
];

function buildSchema(mode: "create" | "edit") {
  const deadline =
    mode === "create"
      ? z
          .string()
          .min(1, "Set a deadline")
          .refine((value) => new Date(value) > new Date(), {
            message: "Deadline must be a future date and time",
          })
      : z.string().min(1, "Set a deadline");

  return z.object({
    title: z.string().min(5, "Title should be at least 5 characters"),
    description: z.string().min(10, "Add a short description"),
    courseId: z.string().min(1, "Select a course"),
    deadline,
    totalMarks: z.coerce.number().min(1, "Marks must be greater than 0"),
    instructions: z.string().min(5, "Add submission instructions"),
    objectives: z.string().optional(),
    allowedFileTypes: z
      .array(z.enum(["pdf", "docx", "image", "zip", "other"]))
      .min(1, "Select at least one file type"),
    maxFileSizeMb: z.coerce.number().min(1),
    resubmissionAllowed: z.boolean(),
    maxAttempts: z.coerce.number().min(1),
  });
}

export type AssignmentFormValues = z.infer<ReturnType<typeof buildSchema>>;

export function AssignmentForm({
  mode,
  assignmentId,
  defaultValues,
}: {
  mode: "create" | "edit";
  assignmentId?: string;
  defaultValues?: Partial<Assignment>;
}) {
  const router = useRouter();

  const [deadlineDate, setDeadlineDate] = useState<Date | null>(
    defaultValues?.deadline ? new Date(defaultValues.deadline) : null,
  );
  const [attachment, setAttachment] = useState<File | null>(null);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AssignmentFormValues>({
    resolver: zodResolver(buildSchema(mode)),
    defaultValues: {
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      courseId: defaultValues?.courseId ?? "",
      deadline: defaultValues?.deadline ?? "",
      totalMarks: defaultValues?.totalMarks ?? 100,
      instructions: defaultValues?.instructions ?? "",
      objectives: (defaultValues?.objectives ?? []).join("\n"),
      allowedFileTypes: defaultValues?.allowedFileTypes ?? ["pdf"],
      maxFileSizeMb: defaultValues?.maxFileSizeMb ?? 25,
      resubmissionAllowed: defaultValues?.resubmissionAllowed ?? false,
      maxAttempts: defaultValues?.maxAttempts ?? 1,
    },
  });

  const resubmissionAllowed = watch("resubmissionAllowed");
  const maxFileSizeMb = watch("maxFileSizeMb");
  const allowedFileTypes = watch("allowedFileTypes");

  useEffect(() => {
    let cancelled = false;

    getCourseOptions()
      .then((data) => {
        if (!cancelled) setCourses(data);
      })
      .catch(() => {
        if (!cancelled) toast.error("Couldn't load courses.");
      })
      .finally(() => {
        if (!cancelled) setCoursesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(values: AssignmentFormValues, publish: boolean) {
    const payload: AssignmentPayload = {
      title: values.title,
      description: values.description,
      courseId: values.courseId,
      deadline: values.deadline,
      totalMarks: values.totalMarks,
      instructions: values.instructions,
      objectives: (values.objectives ?? "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      allowedFileTypes: values.allowedFileTypes,
      maxFileSizeMb: values.maxFileSizeMb,
      resubmissionAllowed: values.resubmissionAllowed,
      maxAttempts: values.resubmissionAllowed ? values.maxAttempts : 1,
      status: publish ? "published" : "draft",
    };

    try {
      const response =
        mode === "edit" && assignmentId
          ? await updateAssignment(assignmentId, payload)
          : await createAssignment(payload);

      // Backend envelope handle: { success, data, message }
      const saved = (response as any)?.data ?? response;
      const finalId = saved?.id || saved?._id;

      if (!finalId) {
        console.error("No ID received. Full response:", response);
        toast.error("Assignment saved, but ID not received from server.");
        return;
      }

      if (attachment) {
        try {
          await uploadAssignmentAttachment(finalId, attachment);
        } catch (err) {
          console.error("Attachment upload failed:", err);
          toast.error("Assignment saved, but the attachment failed to upload.");
        }
      }

      toast.success(publish ? "Assignment published." : "Draft saved.");
      router.push("/instructor/assignments");
      router.refresh();
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    }
  }

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      <Card>
        <CardHeader>
          <CardTitle>Assignment details</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              placeholder="e.g. Binary Search Trees — Implementation"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-danger">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Course</Label>
              <Controller
                control={control}
                name="courseId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          coursesLoading ? "Loading courses…" : "Select a course"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {!coursesLoading && courses.length === 0 && (
                        <p className="px-2.5 py-3 text-sm text-muted-foreground">
                          No courses available.
                        </p>
                      )}
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.code} — {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.courseId && (
                <p className="text-xs text-danger">{errors.courseId.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Total Marks</Label>
              <Input type="number" {...register("totalMarks")} />
              {errors.totalMarks && (
                <p className="text-xs text-danger">
                  {errors.totalMarks.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Assignment Deadline</Label>
            <Controller
              control={control}
              name="deadline"
              render={({ field }) => (
                <DatePicker
                  selected={deadlineDate}
                  onChange={(date: Date | null) => {
                    setDeadlineDate(date);
                    field.onChange(date ? date.toISOString() : "");
                  }}
                  onBlur={field.onBlur}
                  showTimeSelect
                  timeIntervals={15}
                  dateFormat="MMMM d, yyyy h:mm aa"
                  minDate={mode === "create" ? new Date() : undefined}
                  isClearable
                  placeholderText="Select deadline date and time"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none"
                />
              )}
            />
            <p className="text-xs text-muted-foreground">
              Select exact date and time when submission closes.
            </p>
            {errors.deadline && (
              <p className="text-xs text-danger">{errors.deadline.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              rows={3}
              placeholder="What is this assignment about?"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-danger">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Learning objectives</Label>
            <Textarea
              rows={3}
              placeholder="Har objective nayi line par likhein"
              {...register("objectives")}
            />
            <p className="text-xs text-muted-foreground">
              Ek line = ek objective. Student detail page par bullet list ban
              kar dikhenge.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Instructions</Label>
            <Textarea
              rows={3}
              placeholder="Submission format, grading notes, etc."
              {...register("instructions")}
            />
            {errors.instructions && (
              <p className="text-xs text-danger">
                {errors.instructions.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submission rules</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Allowed file types</Label>
            <Controller
              control={control}
              name="allowedFileTypes"
              render={({ field }) => (
                <div className="flex flex-wrap gap-4">
                  {fileKinds.map((kind) => (
                    <label
                      key={kind.value}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Checkbox
                        checked={field.value.includes(kind.value)}
                        onCheckedChange={(checked) => {
                          field.onChange(
                            checked
                              ? [...field.value, kind.value]
                              : field.value.filter((v) => v !== kind.value),
                          );
                        }}
                      />
                      {kind.label}
                    </label>
                  ))}
                </div>
              )}
            />
            {errors.allowedFileTypes && (
              <p className="text-xs text-danger">
                {errors.allowedFileTypes.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Maximum file size (MB)</Label>
              <Input type="number" {...register("maxFileSizeMb")} />
            </div>

            <div className="space-y-1.5">
              <Label>Maximum attempts</Label>
              <Input
                type="number"
                disabled={!resubmissionAllowed}
                {...register("maxAttempts")}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border p-4">
            <div>
              <p className="text-sm font-medium">Allow resubmission</p>
              <p className="text-xs text-muted-foreground">
                Students can replace submission before deadline.
              </p>
            </div>
            <Controller
              control={control}
              name="resubmissionAllowed"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Assignment attachment</Label>
            <FileUpload
              title="Assignment Attachment"
              onFileSelect={setAttachment}
              maxSizeMb={maxFileSizeMb || 25}
              allowedKinds={allowedFileTypes}
            />
            <p className="text-xs text-muted-foreground">
              Optional — brief, rubric ya starter code. Assignment save hone ke
              baad upload hoti hai.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={handleSubmit((values) => onSubmit(values, false))}
        >
          <Save className="h-4 w-4" />
          Save as draft
        </Button>

        <Button
          type="button"
          disabled={isSubmitting}
          onClick={handleSubmit((values) => onSubmit(values, true))}
        >
          <Send className="h-4 w-4" />
          {mode === "create" ? "Publish assignment" : "Save & publish"}
        </Button>
      </div>
    </form>
  );
}