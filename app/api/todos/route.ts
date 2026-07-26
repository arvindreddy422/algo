import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { todos } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

async function getCurrentUserId() {
  const session = await auth();
  if (!session) return null;
  return (session.user as any)?.dbId as string | undefined;
}

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userTodos = await db
    .select()
    .from(todos)
    .where(eq(todos.userId, userId))
    .orderBy(desc(todos.createdAt));

  return NextResponse.json(userTodos);
}

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description, links } = await req.json();
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
      completed: false,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return NextResponse.json(todo, { status: 201 });
}
