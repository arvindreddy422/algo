import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow API routes to pass through — they are self-contained
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("auth_session")?.value;

  let isAuthenticated = false;
  if (sessionCookie) {
    const parts = sessionCookie.split(".");
    if (parts.length === 2) {
      try {
        // Use base64url decoding (handles email usernames with special chars)
        const payloadStr = Buffer.from(parts[0], "base64url").toString("utf-8");
        const payload = JSON.parse(payloadStr);
        const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
        if (payload && typeof payload.timestamp === "number" && Date.now() - payload.timestamp <= SESSION_DURATION_MS) {
          isAuthenticated = true;
        }
      } catch {
        isAuthenticated = false;
      }
    }
  }

  const isLoginPage = pathname === "/login";

  // Redirect unauthenticated requests to /login
  if (!isAuthenticated && !isLoginPage) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated requests from /login to /
  if (isAuthenticated && isLoginPage) {
    const homeUrl = new URL("/", request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
