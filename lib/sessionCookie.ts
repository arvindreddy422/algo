import { cookies, headers } from "next/headers";
import { generateToken, SESSION_COOKIE_NAME, SESSION_DURATION_MS } from "@/lib/auth";

export async function setSessionCookie(email: string, mustChangePassword: boolean) {
  const token = generateToken(email, mustChangePassword);
  const cookieStore = await cookies();
  const headerList = await headers();

  const proto = headerList.get("x-forwarded-proto") || "";
  const referer = headerList.get("referer") || "";
  const isHttps = proto === "https" || referer.startsWith("https://");

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isHttps,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });
}
