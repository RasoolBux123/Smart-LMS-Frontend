import { apiFetch } from "./client";
import type { Role } from "@/types";

export interface AuthUser {
  id?: string;
  name: string;
  email: string;
  role: Role;
  status?: string;
}

export interface LoginResponse {
  access_token: string;
  user: AuthUser;
}

export async function loginRequest(email: string, password: string) {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function meRequest() {
  return apiFetch<AuthUser>("/auth/me");
}
