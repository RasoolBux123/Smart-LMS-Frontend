import { apiFetch, type ApiEnvelope } from "./client";

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: "instructor" | "student";
  status: string;
}

export async function listUsers(role?: "instructor" | "student") {
  const query = role ? `?role=${role}` : "";
  return apiFetch<ApiEnvelope<ManagedUser[]>>(`/users${query}`);
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: "instructor" | "student";
}) {
  return apiFetch<ApiEnvelope<ManagedUser>>("/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
}