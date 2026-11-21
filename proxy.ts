import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { homeForRole, isAdminOnlyPath } from "@/lib/access";
import { SESSION_COOKIE_NAME } from "@/lib/auth";
import { getSessionUser } from "@/lib/sessionUser";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const user = await getSessionUser(request.cookies.get(SESSION_COOKIE_NAME)?.value ?? null);

  if (pathname.startsWith("/api/")) {
    if (user?.mustChangePassword) {
      return NextResponse.json(
        { error: "Set your password before continuing." },
        { status: 403 }
      );
    }
    return NextResponse.next();
  }

  const isLoginPage = pathname === "/login";
  const isPasswordPage = pathname === "/change-password";

  if (!user && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user?.mustChangePassword && !isPasswordPage) {
    return NextResponse.redirect(new URL("/change-password", request.url));
  }

  if (user && !user.mustChangePassword && user.role !== "admin" && isAdminOnlyPath(pathname)) {
    return NextResponse.redirect(new URL(homeForRole(user.role), request.url));
  }

  if (user && !user.mustChangePassword && (isLoginPage || isPasswordPage)) {
    return NextResponse.redirect(new URL(homeForRole(user.role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
