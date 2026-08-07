"use client";

import { useState } from "react";

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

import { Save, Send } from "lucide-react";

import { courses } from "@/data/courses";

import FileUpload from "@/components/instructor/FileUpload";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const fileTypes = [
  {
    value: "pdf",
    label: "PDF",
  },

  {
    value: "docx",
    label: "DOCX",
  },

  {
    value: "xls",
    label: "Excel",
  },

  {
    value: "ppt",
    label: "PowerPoint",
  },

  {
    value: "txt",
    label: "TXT",
  },

  {
    value: "zip",
    label: "ZIP",
  },

  {
    value: "other",
    label: "Other",
  },
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

  const [quizFile, setQuizFile] = useState<File | null>(null);

  const {
    register,

    control,

    handleSubmit,
  } = useForm<QuizFormValues>({
    resolver: zodResolver(schema),

    defaultValues: {
      allowedFileTypes: ["pdf"],

      maxFileSizeMb: 25,

      totalMarks: 100,
    },
  });

  function submit(
    values: QuizFormValues,

    publish: boolean,
  ) {
    console.log({
      ...values,

      attachment: quizFile,

      status: publish ? "published" : "draft",
    });

    toast.success(publish ? "Quiz published" : "Quiz saved");

    router.push("/instructor/quizzes");
  }

  return (
    <form
      className="space-y-6"

      onSubmit={(e) => e.preventDefault()}
    >
      <Card>
        <CardHeader>
          <CardTitle>Quiz Details</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Label>Quiz Title</Label>

            <Input
              placeholder="Python Assignment Quiz"

              {...register("title")}
            />
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
                    <SelectValue placeholder="Select Course" />
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

          <div>
            <Label>Deadline</Label>

            <Input
              type="datetime-local"

              {...register("deadline")}
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
            <Label>Allowed Answer File Types</Label>

            <Controller
              control={control}

              name="allowedFileTypes"

              render={({ field }) => (
                <div className="flex flex-wrap gap-4 mt-3">
                  {fileTypes.map((type) => (
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
                              : field.value.filter(
                                  (item) => item !== type.value,
                                ),
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

              <Input
                type="number"

                {...register("maxFileSizeMb")}
              />
            </div>

            <div>
              <Label>Total Marks</Label>

              <Input
                type="number"

                {...register("totalMarks")}
              />
            </div>
          </div>

          <div>
            <FileUpload
              title="Quiz Attachment"

              onFileSelect={setQuizFile}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          type="button"

          variant="outline"

          onClick={handleSubmit((values) => submit(values, false))}
        >
          <Save className="h-4 w-4" />
          Save Draft
        </Button>

        <Button
          type="button"

          onClick={handleSubmit((values) => submit(values, true))}
        >
          <Send className="h-4 w-4" />
          {mode === "create" ? "Publish Quiz" : "Save & Publish"}
        </Button>
      </div>
    </form>
  );
}
