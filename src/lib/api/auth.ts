import { apiFetch } from "./client";

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "admin" | "instructor" | "student";
  };
}

export async function loginRequest(
  email: string,
  password: string
): Promise<LoginResponse> {
  const res = await apiFetch<{
    success: boolean;
    data: {
      token: string;
      user: LoginResponse["user"];
    };
    message: string;
  }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  return {
    access_token: res.data.token,
    user: res.data.user,
  };
}

export async function meRequest() {
  return apiFetch("/auth/me");
}