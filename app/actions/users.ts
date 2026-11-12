"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { and, eq, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { initDb } from "@/db/init";
import { users } from "@/db/schema";
import { isBootstrapAdmin } from "@/lib/auth";
import { getSessionUser } from "@/lib/sessionUser";
import { setSessionCookie } from "@/lib/sessionCookie";

export type ManagedUser = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  mustChangePassword: boolean;
  createdAt: string;
  lockedAdmin: boolean;
};

type ActionResult = {
  error?: string;
  ok?: string;
  email?: string;
  temporaryPassword?: string;
};

function clean(value: FormDataEntryValue | string | null | undefined, max: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function requireAdmin() {
  await initDb();
  const me = await getSessionUser();
  if (!me || me.role !== "admin") return null;
  return me;
}

export async function listManagedUsers(): Promise<ManagedUser[]> {
  const me = await requireAdmin();
  if (!me) return [];

  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      mustChangePassword: users.mustChangePassword,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(users.createdAt);

  return rows.map((row) => ({
    id: row.id,
    email: row.email,
    name: row.name?.trim() || row.email.split("@")[0],
    role: row.role === "admin" ? "admin" : "user",
    mustChangePassword: Boolean(row.mustChangePassword),
    createdAt: row.createdAt,
    lockedAdmin: isBootstrapAdmin(row.email),
  }));
}

export async function createUserAction(
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const me = await requireAdmin();
  if (!me) return { error: "Only an admin can add people." };

  const name = clean(formData.get("name"), 80);
  const email = clean(formData.get("email"), 120).toLowerCase();
  const temporaryPassword = typeof formData.get("temporaryPassword") === "string"
    ? String(formData.get("temporaryPassword")).trim()
    : "";
  const role = formData.get("role") === "admin" ? "admin" : "user";

  if (!name) return { error: "Enter a name." };
  if (!isEmail(email)) return { error: "Enter a valid email." };
  if (temporaryPassword.length < 6) return { error: "Temporary password needs at least 6 characters." };
  if (temporaryPassword.length > 72) return { error: "Use 72 characters or fewer." };

  try {
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(sql`lower(${users.email}) = ${email}`)
      .limit(1);

    if (existing.length > 0) return { error: "Someone already uses that email." };

    await db.insert(users).values({
      id: crypto.randomUUID(),
      email,
      name,
      role,
      createdAt: new Date().toISOString(),
      passwordHash: bcrypt.hashSync(temporaryPassword, 10),
      mustChangePassword: true,
    });
  } catch (err) {
    console.error("Create user failed:", err);
    return { error: "Could not add that person. Try again." };
  }

  revalidatePath("/admin");
  return {
    ok: `${name} can sign in with ${email}. The first sign-in asks them to choose their own password.`,
    email,
    temporaryPassword,
  };
}

export async function setUserRoleAction(userId: string, role: "admin" | "user"): Promise<ActionResult> {
  const me = await requireAdmin();
  if (!me) return { error: "Only an admin can change roles." };
  if (role !== "admin" && role !== "user") return { error: "Unknown role." };
  if (userId === me.id) return { error: "Ask another admin to change your role." };

  try {
    const found = await db
      .select({ id: users.id, email: users.email, role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    const person = found[0];
    if (!person) return { error: "That person is no longer here." };
    if (role === "user" && isBootstrapAdmin(person.email)) {
      return { error: "This account stays an admin so the app always has an owner." };
    }

    if (role === "user" && person.role === "admin") {
      const others = await db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.role, "admin"), ne(users.id, person.id)))
        .limit(1);
      if (others.length === 0) return { error: "Keep at least one admin." };
    }

    await db.update(users).set({ role }).where(eq(users.id, person.id));
  } catch (err) {
    console.error("Role update failed:", err);
    return { error: "Could not update that role. Try again." };
  }

  revalidatePath("/admin");
  return { ok: role === "admin" ? "They can now open Admin." : "They are a regular member again." };
}

export async function resetPasswordAction(userId: string, temporaryPassword: string): Promise<ActionResult> {
  const me = await requireAdmin();
  if (!me) return { error: "Only an admin can reset a password." };

  const nextPassword = temporaryPassword.trim();
  if (nextPassword.length < 6) return { error: "Temporary password needs at least 6 characters." };
  if (nextPassword.length > 72) return { error: "Use 72 characters or fewer." };

  let email = "";
  try {
    const found = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    const person = found[0];
    if (!person) return { error: "That person is no longer here." };
    email = person.email;

    await db
      .update(users)
      .set({
        passwordHash: bcrypt.hashSync(nextPassword, 10),
        mustChangePassword: true,
      })
      .where(eq(users.id, person.id));
  } catch (err) {
    console.error("Password reset failed:", err);
    return { error: "Could not reset that password. Try again." };
  }

  revalidatePath("/admin");
  return {
    ok: `${email} will choose a new password the next time they sign in.`,
    email,
    temporaryPassword: nextPassword,
  };
}

export async function deleteUserAction(userId: string): Promise<ActionResult> {
  const me = await requireAdmin();
  if (!me) return { error: "Only an admin can remove people." };
  if (userId === me.id) return { error: "You cannot remove your own account." };

  try {
    const found = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    const person = found[0];
    if (!person) return { error: "That person is no longer here." };
    if (isBootstrapAdmin(person.email)) return { error: "The owner account cannot be removed." };

    await db.delete(users).where(eq(users.id, person.id));
  } catch (err) {
    console.error("Delete user failed:", err);
    return { error: "Could not remove that person. Try again." };
  }

  revalidatePath("/admin");
  return { ok: "Account removed. They can no longer sign in." };
}

export async function changePasswordAction(
  _prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  await initDb();
  const me = await getSessionUser();
  if (!me) return { error: "Sign in again to set your password." };

  const nextPassword = String(formData.get("password") ?? "").trim();
  const confirm = String(formData.get("confirm") ?? "").trim();

  if (nextPassword.length < 8) return { error: "Use at least 8 characters." };
  if (nextPassword.length > 72 || confirm.length > 72) return { error: "Use 72 characters or fewer." };
  if (nextPassword !== confirm) return { error: "Those passwords do not match." };

  try {
    const found = await db
      .select({ id: users.id, passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.id, me.id))
      .limit(1);
    const person = found[0];
    if (!person?.passwordHash) return { error: "This account has no password yet." };
    if (bcrypt.compareSync(nextPassword, person.passwordHash)) {
      return { error: "Choose a password that is different from the temporary one." };
    }

    await db
      .update(users)
      .set({
        passwordHash: bcrypt.hashSync(nextPassword, 10),
        mustChangePassword: false,
      })
      .where(eq(users.id, me.id));
  } catch (err) {
    console.error("Password change failed:", err);
    return { error: "Could not save that password. Try again." };
  }

  await setSessionCookie(me.email, false);
  redirect("/");
}
