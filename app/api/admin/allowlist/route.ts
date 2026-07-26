import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { allowedEmails } from "@/db/schema";
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

  const list = await db.select().from(allowedEmails).orderBy(allowedEmails.addedAt);
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { email } = await req.json();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const normalized = email.toLowerCase().trim();
  try {
    await db.insert(allowedEmails).values({
      email: normalized,
      addedAt: new Date().toISOString(),
      addedBy: session.user?.email ?? "admin",
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Email already in allowlist" }, { status: 409 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  // Prevent removing admin's own email
  if (email.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase()) {
    return NextResponse.json({ error: "Cannot remove admin email" }, { status: 400 });
  }

  await db.delete(allowedEmails).where(eq(allowedEmails.email, email.toLowerCase()));
  return NextResponse.json({ success: true });
}
