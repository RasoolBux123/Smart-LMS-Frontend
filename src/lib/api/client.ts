/**
 * Shared fetch wrapper. Token localStorage me rakha jata hai (AuthContext),
 * is liye har request par Authorization header khud lagti hai.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

function authHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = window.localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const isFormData =
    typeof FormData !== "undefined" && init.body instanceof FormData;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      // FormData par Content-Type set NAHI karna — browser boundary khud lagata hai
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...authHeader(),
      ...init.headers,
    },
  });

  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      // body JSON nahi thi — ignore
    }

    const parsed = body as { message?: string; detail?: string } | null;
    const message =
      parsed?.detail ?? // FastAPI HTTPException isi key me bhejta hai
      parsed?.message ??
      `Request failed (${res.status})`;

    throw new ApiError(message, res.status, body);
  }

  if (res.status === 204) return undefined as T;

  return (await res.json()) as T;
}

/**
 * Backend jo responses `{ data: ... }` envelope me deta hai un ke liye.
 * Legacy pages (admin, gradebook, grades, courses) isi shape par likhe hain.
 */
export interface ApiEnvelope<T> {
  data: T;
  message?: string;
}
