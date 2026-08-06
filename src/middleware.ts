import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const roleRoutes: Record<string, string> = {
  admin: "/admin",
  instructor: "/instructor",
  student: "/student",
};

export function middleware(request: NextRequest) {
  const role = request.cookies.get("role")?.value;
  const path = request.nextUrl.pathname;

  const isProtected =
    path.startsWith("/admin") ||
    path.startsWith("/instructor") ||
    path.startsWith("/student") ||
    path.startsWith("/notifications");

  if (isProtected && !role) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (role && (path.startsWith("/admin") || path.startsWith("/instructor") || path.startsWith("/student"))) {
    const allowedBase = roleRoutes[role];
    if (allowedBase && !path.startsWith(allowedBase)) {
      return NextResponse.redirect(new URL(allowedBase, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/instructor/:path*",
    "/student/:path*",
    "/notifications/:path*",
  ],
};
