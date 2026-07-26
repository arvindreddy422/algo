import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { todos } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

const DEFAULT_USER_ID = "default_user";

export async function GET() {
  const userTodos = await db
    .select()
    .from(todos)
    .where(eq(todos.userId, DEFAULT_USER_ID))
    .orderBy(desc(todos.createdAt));

  return NextResponse.json(userTodos);
}

export async function POST(req: NextRequest) {
  const { title, description, links } = await req.json();
  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const [todo] = await db
    .insert(todos)
    .values({
      userId: DEFAULT_USER_ID,
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
