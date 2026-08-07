"use client";

import { useState } from "react";

import { useForm, Controller } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { z } from "zod";

import { useRouter } from "next/navigation";

import { toast } from "sonner";

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

import { Checkbox } from "@/components/ui/checkbox";

import { Save, Send } from "lucide-react";

import { courses } from "@/data/courses";

import FileUpload from "@/components/instructor/FileUpload";

const examTypes = [
  {
    value: "pdf",
    label: "PDF",
  },

  {
    value: "docx",
    label: "DOCX",
  },

  {
    value: "zip",
    label: "ZIP",
  },

  {
    value: "image",
    label: "Image",
  },
];

const schema = z.object({
  title: z.string().min(5, "Exam title required"),

  courseId: z.string().min(1, "Select course"),

  description: z.string().min(10, "Add description"),

  instructions: z.string().min(5, "Add instructions"),

  deadline: z
    .string()
    .min(1, "Select deadline")
    .refine(
      (value) => new Date(value) > new Date(),

      {
        message: "Deadline must be future date",
      },
    ),

  totalMarks: z.coerce.number().min(1),

  maxAttempts: z.coerce.number().min(1),

  allowedFileTypes: z.array(z.string()).min(1),

  maxFileSizeMb: z.coerce.number().min(1),

  examAttachment: z.any().optional(),
});

type ExamFormValues = z.infer<typeof schema>;

export function ExamForm({ mode }: { mode: "create" | "edit" }) {
  const router = useRouter();

  const [deadline, setDeadline] = useState<Date | null>(null);

  const [examFile, setExamFile] = useState<File | null>(null);

  const {
    register,

    handleSubmit,

    control,

    formState: { errors, isSubmitting },
  } = useForm<ExamFormValues>({
    resolver: zodResolver(schema),

    defaultValues: {
      allowedFileTypes: ["pdf"],

      maxAttempts: 1,

      maxFileSizeMb: 25,

      totalMarks: 100,
    },
  });

  function submit(
    values: ExamFormValues,

    publish: boolean,
  ) {
    console.log({
      ...values,

      attachment: examFile
        ? {
            name: examFile.name,

            size: (examFile.size / 1024 / 1024).toFixed(2) + " MB",

            type: examFile.type,

            url: "#",
          }
        : null,

      status: publish ? "published" : "draft",
    });

    toast.success(publish ? "Exam published" : "Exam saved");

    router.push("/instructor/exams");
  }
  return (
    <form
      className="space-y-6"

      onSubmit={(e) => e.preventDefault()}
    >
      <Card>
        <CardHeader>
          <CardTitle>Exam Details</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Label>Exam Title</Label>

            <Input
              placeholder="Python Mid Term Exam"

              {...register("title")}
            />

            {errors.title && (
              <p className="text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label>Course</Label>

            <Controller
              control={control}

              name="courseId"

              render={({ field }) => (
                <Select
                  value={field.value}

                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>

                  <SelectContent>
                    {courses.length === 0 && (
                      <p className="px-2.5 py-3 text-sm text-muted-foreground">
                        No courses available.
                      </p>
                    )}
                    {courses.map((course) => (
                      <SelectItem
                        key={course.id}

                        value={course.id}
                      >
                        {course.code} - {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div>
            <Label>Exam Deadline</Label>

            <Controller
              control={control}

              name="deadline"

              render={({ field }) => (
                <DatePicker
                  selected={deadline}

                  onChange={(date: Date | null) => {
                    setDeadline(date);

                    if (date) {
                      field.onChange(date.toISOString());
                    }
                  }}

                  showTimeSelect

                  timeIntervals={15}

                  dateFormat="MMMM d, yyyy h:mm aa"

                  minDate={new Date()}

                  placeholderText="Select exam deadline"

                  className="w-full rounded-xl border px-4 py-3 bg-background"
                />
              )}
            />
          </div>

          <div>
            <Label>Description</Label>

            <Textarea
              rows={3}

              {...register("description")}
            />
          </div>

          <div>
            <Label>Instructions</Label>

            <Textarea
              rows={3}

              {...register("instructions")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submission Rules</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div>
            <Label>Allowed Answer Files</Label>

            <Controller
              control={control}

              name="allowedFileTypes"

              render={({ field }) => (
                <div className="flex flex-wrap gap-5">
                  {examTypes.map((type) => (
                    <label
                      key={type.value}

                      className="flex items-center gap-2 text-sm"
                    >
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
              <Label>Total Marks</Label>

              <Input
                type="number"

                {...register("totalMarks")}
              />
            </div>

            <div>
              <Label>Maximum Attempts</Label>

              <Input
                type="number"

                {...register("maxAttempts")}
              />
            </div>
          </div>

          <div>
            <Label>Maximum File Size MB</Label>

            <Input
              type="number"

              {...register("maxFileSizeMb")}
            />
          </div>

          {/* EXAM ATTACHMENT UPLOAD */}

          <div className="space-y-3">
            <Label>Exam Attachment</Label>

            <div className="rounded-xl border border-dashed p-5">
              {/* <FileUpload /> */}
              <FileUpload
                title="Exam Attachment"

                onFileSelect={setExamFile}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Upload exam paper, instructions or reference material. Supported
              files: PDF, DOCX, ZIP
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          variant="outline"

          type="button"

          disabled={isSubmitting}

          onClick={handleSubmit((values) => submit(values, false))}
        >
          <Save className="h-4 w-4" />
          Save Draft
        </Button>

        <Button
          type="button"

          disabled={isSubmitting}

          onClick={handleSubmit((values) => submit(values, true))}
        >
          <Send className="h-4 w-4" />
          {mode === "create" ? "Publish Exam" : "Save & Publish"}
        </Button>
      </div>
    </form>
  );
}
