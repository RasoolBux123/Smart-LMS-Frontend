"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { loginRequest, type AuthUser } from "@/lib/api/auth";
import type { Role } from "@/types";

export type { Role };
export type User = AuthUser;

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login(email: string, password: string): Promise<void>;
  logout(): void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

const STORAGE_TOKEN = "token";
const STORAGE_USER = "user";

const ROLE_HOME: Record<Role, string> = {
  admin: "/admin",
  instructor: "/instructor",
  student: "/student",
};

function setRoleCookie(role: Role) {
  document.cookie = `role=${role}; path=/; max-age=604800; SameSite=Lax`;
}

function clearRoleCookie() {
  document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /* Page reload par session localStorage se wapas uthao. */
  useEffect(() => {
    try {
      const token = localStorage.getItem(STORAGE_TOKEN);
      const savedUser = localStorage.getItem(STORAGE_USER);

      if (token && savedUser) {
        const parsed = JSON.parse(savedUser) as User;
        setUser(parsed);
        // Middleware cookie par chalta hai — reload ke baad usay bhi bahaal karo.
        setRoleCookie(parsed.role);
      }
    } catch {
      localStorage.removeItem(STORAGE_TOKEN);
      localStorage.removeItem(STORAGE_USER);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await loginRequest(email, password);

      const token = res.access_token;
      const loggedUser = res.user;

      if (!token || !loggedUser) {
        throw new Error("Invalid login response");
      }

      localStorage.setItem(STORAGE_TOKEN, token);
      localStorage.setItem(STORAGE_USER, JSON.stringify(loggedUser));
      setRoleCookie(loggedUser.role);

      setUser(loggedUser);
      router.push(ROLE_HOME[loggedUser.role] ?? "/student");
    },
    [router],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_TOKEN);
    localStorage.removeItem(STORAGE_USER);
    clearRoleCookie();

    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
