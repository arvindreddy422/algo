import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { todos } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSessionUser } from "@/lib/sessionUser";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = (await getSessionUser())?.id;
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
  const userId = (await getSessionUser())?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db
    .delete(todos)
    .where(and(eq(todos.id, parseInt(id)), eq(todos.userId, userId)));

  return NextResponse.json({ success: true });
}
