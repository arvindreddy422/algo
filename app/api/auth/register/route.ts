import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, allowedEmails } from "@/db/schema";
import { eq } from "drizzle-orm";
import { initDb } from "@/db/init";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    await initDb();

    const { username, email, password } = await req.json();

    // Validate inputs
    if (!username?.trim()) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }
    if (!email?.trim() || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email is on the allowlist
    const [allowed] = await db
      .select()
      .from(allowedEmails)
      .where(eq(allowedEmails.email, normalizedEmail))
      .limit(1);

    if (!allowed) {
      return NextResponse.json(
        { error: "This email is not on the access list. Contact the admin to request access." },
        { status: 403 }
      );
    }

    // Check if already registered
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in." },
        { status: 409 }
      );
    }

    // Determine role
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
    const role = normalizedEmail === adminEmail ? "admin" : "user";

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    await db.insert(users).values({
      id: randomUUID(),
      email: normalizedEmail,
      name: username.trim(),
      image: null,
      role,
      passwordHash,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
