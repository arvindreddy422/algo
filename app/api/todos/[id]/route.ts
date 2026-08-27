import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { todos, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";

async function getUserIdFromSession(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("auth_session")?.value;
    if (!sessionCookie) return null;
    const parts = sessionCookie.split(".");
    if (parts.length !== 2) return null;
    const payloadStr = Buffer.from(parts[0], "base64url").toString("utf-8");
    const payload = JSON.parse(payloadStr);
    const email: string = payload?.username;
    if (!email) return null;

    // Look up the user UUID by email
    const found = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    return found[0]?.id ?? null;
  } catch {
    return null;
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = await getUserIdFromSession();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if ("title" in body) updates.title = body.title;
  if ("description" in body) updates.description = body.description;
  if ("links" in body) updates.links = body.links;
  if ("completed" in body) updates.completed = body.completed;
  if ("status" in body) {
    updates.status = body.status;
    updates.completed = body.status === "completed";
  }
  if ("priority" in body) updates.priority = body.priority;
  if ("category" in body) updates.category = body.category;
  if ("dueDate" in body) updates.dueDate = body.dueDate;
  if ("revisionDate" in body) updates.revisionDate = body.revisionDate;

  const [updated] = await db
    .update(todos)
    .set(updates)
    .where(and(eq(todos.id, parseInt(id)), eq(todos.userId, userId)))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = await getUserIdFromSession();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db
    .delete(todos)
    .where(and(eq(todos.id, parseInt(id)), eq(todos.userId, userId)));

  return NextResponse.json({ success: true });
}
