import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { todos } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSessionUser } from "@/lib/sessionUser";

export async function GET() {
  const userId = (await getSessionUser())?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userTodos = await db
    .select()
    .from(todos)
    .where(eq(todos.userId, userId))
    .orderBy(desc(todos.createdAt));

  return NextResponse.json(userTodos);
}

export async function POST(req: NextRequest) {
  const userId = (await getSessionUser())?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description, links, priority, category, dueDate, revisionDate, status } = await req.json();
  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const [todo] = await db
    .insert(todos)
    .values({
      userId,
      title: title.trim(),
      description: description?.trim() ?? null,
      links: links ?? null,
      completed: status === "completed",
      status: status || "pending",
      priority: priority || "medium",
      category: category || "General",
      dueDate: dueDate || null,
      revisionDate: revisionDate || null,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return NextResponse.json(todo, { status: 201 });
}
