import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { users, allowedEmails } from "@/db/schema";
import { eq } from "drizzle-orm";

async function requireAdmin() {
  const session = await auth();
  if (!session) return null;
  if ((session.user as any)?.role !== "admin") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const allUsers = await db.select().from(users).orderBy(users.createdAt);
  const allowed = await db.select().from(allowedEmails).orderBy(allowedEmails.addedAt);

  return NextResponse.json({ users: allUsers, allowedEmails: allowed });
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  await db.delete(users).where(eq(users.id, userId));
  return NextResponse.json({ success: true });
}
