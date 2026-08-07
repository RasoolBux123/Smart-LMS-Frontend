import { apiFetch, type ApiEnvelope } from "./client";

export interface Course {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  status: string;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  orderIndex: number;
}

export interface Material {
  id: string;
  moduleId: string;
  title: string;
  type: "file" | "link" | "text";
  content: string;
  url?: string | null;
}

export async function listCourses() {
  return apiFetch<ApiEnvelope<Course[]>>("/courses");
}

export async function createCourse(title: string, description: string) {
  return apiFetch<ApiEnvelope<Course>>("/courses", {
    method: "POST",
    body: JSON.stringify({ title, description }),
  });
}

export async function getCourse(courseId: string) {
  return apiFetch<ApiEnvelope<Course>>(`/courses/${courseId}`);
}

export async function listModules(courseId: string) {
  return apiFetch<ApiEnvelope<Module[]>>(`/courses/${courseId}/modules`);
}

export async function createModule(courseId: string, title: string, orderIndex = 0) {
  return apiFetch<ApiEnvelope<Module>>(`/courses/${courseId}/modules`, {
    method: "POST",
    body: JSON.stringify({ title, orderIndex }),
  });
}

export async function listMaterials(moduleId: string) {
  return apiFetch<ApiEnvelope<Material[]>>(`/modules/${moduleId}/materials`);
}

export async function createMaterial(
  moduleId: string,
  data: { title: string; type: "file" | "link" | "text"; content?: string; url?: string }
) {
  return apiFetch<ApiEnvelope<Material>>(`/modules/${moduleId}/materials`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
