import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { todos, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

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

export async function GET() {
  const userId = await getUserIdFromSession();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userTodos = await db
    .select()
    .from(todos)
    .where(eq(todos.userId, userId))
    .orderBy(desc(todos.createdAt));

  return NextResponse.json(userTodos);
}

export async function POST(req: NextRequest) {
  const userId = await getUserIdFromSession();
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
