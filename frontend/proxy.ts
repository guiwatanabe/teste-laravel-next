import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard", "/admin", "/standings", "/matches"];
const publicRoutes = ["/login", "/register", "/"];

export default function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((r) => path.startsWith(r));
  const isPublicRoute = publicRoutes.includes(path);

  const isAuthenticated = req.cookies.has("refresh_token");

  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isPublicRoute && isAuthenticated && !path.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
