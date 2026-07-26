import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { todos } from "@/db/schema";
import { eq, and } from "drizzle-orm";

const DEFAULT_USER_ID = "default_user";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if ("title" in body) updates.title = body.title;
  if ("description" in body) updates.description = body.description;
  if ("links" in body) updates.links = body.links;
  if ("completed" in body) updates.completed = body.completed;

  const [updated] = await db
    .update(todos)
    .set(updates)
    .where(and(eq(todos.id, parseInt(id)), eq(todos.userId, DEFAULT_USER_ID)))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await db
    .delete(todos)
    .where(and(eq(todos.id, parseInt(id)), eq(todos.userId, DEFAULT_USER_ID)));

  return NextResponse.json({ success: true });
}
