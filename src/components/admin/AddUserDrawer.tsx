"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createUser } from "@/lib/api/users";
import { listCourses, type Course } from "@/lib/api/courses";
import { enrollStudent } from "@/lib/api/enrollments";
import { toast } from "sonner";

interface AddUserDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: "instructor" | "student";
  onSuccess?: () => void;
}

export function AddUserDrawer({ open, onOpenChange, role, onSuccess }: AddUserDrawerProps) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    courseId: "", // ✅ New field for course selection
  });

  // ✅ Load courses for dropdown
  useEffect(() => {
    if (open && role === "student") {
      setCoursesLoading(true);
      listCourses()
        .then((res) => {
          const courseList = Array.isArray(res) ? res : res?.data || [];
          setCourses(courseList);
        })
        .catch(() => toast.error("Courses load nahi ho sake"))
        .finally(() => setCoursesLoading(false));
    }
  }, [open, role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ 1. Create user
      const userRes = await createUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: role,
      });

      // ✅ 2. If student and course selected, enroll them
      if (role === "student" && formData.courseId) {
        const userData = userRes?.data || userRes;
        const userId = userData?.id;

        if (userId) {
          await enrollStudent(formData.courseId, userId);
          toast.success(`Student created and enrolled in course!`);
        } else {
          toast.success(`Student created but course enrollment failed. Please enroll manually.`);
        }
      } else {
        toast.success(`${role === "instructor" ? "Instructor" : "Student"} created successfully!`);
      }

      // Reset form
      setFormData({ name: "", email: "", password: "", courseId: "" });
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.message || "User creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Add {role === "instructor" ? "Instructor" : "Student"}
          </DialogTitle>
          <DialogDescription>
            Create a new {role === "instructor" ? "instructor" : "student"} account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Temporary Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
              />
            </div>

            {/* ✅ NEW: Course Selection Dropdown for Students */}
            {role === "student" && (
              <div className="space-y-2">
                <Label htmlFor="course">Course (Optional)</Label>
                <Select
                  value={formData.courseId}
                  onValueChange={(value) => setFormData({ ...formData, courseId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={coursesLoading ? "Loading courses..." : "Select a course (optional)"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No course (create later)</SelectItem>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select a course to enroll the student immediately, or leave empty to enroll later.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : `Add ${role === "instructor" ? "Instructor" : "Student"}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
export default AddUserDrawer;  // ✅ At the bottom of file