import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { SESSION_COOKIE_NAME, verifyToken } from "@/lib/auth";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  mustChangePassword: boolean;
};

export function displayName(name: string | null | undefined, email: string | null | undefined) {
  const trimmed = name?.trim();
  if (trimmed) return trimmed;
  if (email) return email.split("@")[0];
  return "Unknown";
}

export async function getSessionUser(token?: string | null): Promise<SessionUser | null> {
  try {
    const resolved =
      token === undefined ? (await cookies()).get(SESSION_COOKIE_NAME)?.value : token ?? undefined;
    const session = verifyToken(resolved);
    if (!session) return null;

    const found = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        mustChangePassword: users.mustChangePassword,
      })
      .from(users)
      .where(eq(users.email, session.username))
      .limit(1);

    const user = found[0];
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: displayName(user.name, user.email),
      role: user.role === "admin" ? "admin" : "user",
      mustChangePassword: Boolean(user.mustChangePassword) || session.mustChangePassword,
    };
  } catch {
    return null;
  }
}
