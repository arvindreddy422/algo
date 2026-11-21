import { NextRequest, NextResponse } from "next/server";
import { deleteNote, updateNote } from "@/lib/notes";
import { getSessionUser } from "@/lib/sessionUser";

function noteId(id: string) {
  const value = Number(id);
  return Number.isInteger(value) ? value : null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = noteId((await params).id);
  if (id == null) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const result = await updateNote(user.id, id, body as Record<string, unknown>);
  if (result.error || !result.note) {
    return NextResponse.json({ error: result.error ?? "Could not save." }, { status: result.status ?? 400 });
  }
  return NextResponse.json(result.note);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = noteId((await params).id);
  if (id == null) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const deleted = await deleteNote(user.id, id);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
