"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { generateToken, verifyToken, SESSION_COOKIE_NAME, SESSION_DURATION_MS } from "@/lib/auth";

export async function loginAction(
  prevState: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const usernameInput = (formData.get("username") as string)?.trim() || "";
  const passwordInput = (formData.get("password") as string)?.trim() || "";

  const expectedUsername =
    process.env.AUTH_USERNAME ||
    process.env.NEXT_PUBLIC_AUTH_USERNAME ||
    "admin";
  const expectedPassword =
    process.env.AUTH_PASSWORD ||
    process.env.NEXT_PUBLIC_AUTH_PASSWORD ||
    "password123";

  if (!usernameInput || !passwordInput) {
    return { error: "Please provide both username and password." };
  }

  if (usernameInput !== expectedUsername || passwordInput !== expectedPassword) {
    return { error: "Invalid username or password." };
  }

  const token = generateToken(usernameInput);
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

  redirect("/");
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/login");
}

export async function getSession(): Promise<{ username: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return verifyToken(token);
}
