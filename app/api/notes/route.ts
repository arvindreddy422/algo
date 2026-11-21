import { NextRequest, NextResponse } from "next/server";
import { createNote, listNotes, type NoteKind } from "@/lib/notes";
import { getSessionUser } from "@/lib/sessionUser";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notes = await listNotes(user.id);
  return NextResponse.json({ notes });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const kind = (body as { kind?: unknown }).kind;
  if (kind !== "note" && kind !== "folder") {
    return NextResponse.json({ error: "Pick a note or a folder." }, { status: 400 });
  }

  const rawParent = (body as { parentId?: unknown }).parentId;
  const parentId = rawParent == null || rawParent === "" ? null : Number(rawParent);
  if (parentId != null && !Number.isInteger(parentId)) {
    return NextResponse.json({ error: "Pick a folder." }, { status: 400 });
  }

  const title = (body as { title?: unknown }).title;
  const result = await createNote(user.id, {
    kind: kind as NoteKind,
    parentId,
    title: typeof title === "string" ? title : null,
  });
  if (result.error || !result.note) {
    return NextResponse.json({ error: result.error ?? "Could not create that." }, { status: 400 });
  }
  return NextResponse.json(result.note, { status: 201 });
}
