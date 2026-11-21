import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { vaultNotes } from "@/db/schema";
import type { NoteKind, VaultNote } from "@/lib/noteTypes";

export type { NoteKind, VaultNote };

const TITLE_MAX = 120;
const CONTENT_MAX = 200_000;

let ready: Promise<void> | null = null;

function ensureNotesTable() {
  ready ??= (async () => {
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS vault_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        parent_id INTEGER,
        title TEXT NOT NULL,
        kind TEXT NOT NULL,
        content TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
    await db.run(sql`
      CREATE INDEX IF NOT EXISTS vault_notes_user_idx ON vault_notes (user_id, parent_id)
    `);
  })();
  return ready;
}

function toNote(row: typeof vaultNotes.$inferSelect): VaultNote {
  return {
    id: row.id,
    parentId: row.parentId,
    title: row.title,
    kind: row.kind,
    content: row.content,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function cleanTitle(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const title = value.replace(/\s+/g, " ").trim().slice(0, TITLE_MAX);
  return title || null;
}

function sameTitle(a: string, b: string) {
  return a.localeCompare(b, undefined, { sensitivity: "accent" }) === 0;
}

function uniqueTitle(notes: VaultNote[], parentId: number | null, base: string) {
  const siblings = notes.filter((note) => note.parentId === parentId);
  const taken = (title: string) => siblings.some((note) => sameTitle(note.title, title));
  if (!taken(base)) return base;
  let index = 2;
  while (taken(`${base} ${index}`)) index += 1;
  return `${base} ${index}`.slice(0, TITLE_MAX);
}

function descendants(notes: VaultNote[], id: number) {
  const ids = new Set<number>();
  const walk = (current: number) => {
    ids.add(current);
    for (const note of notes) {
      if (note.parentId === current) walk(note.id);
    }
  };
  walk(id);
  return ids;
}

export async function listNotes(userId: string): Promise<VaultNote[]> {
  await ensureNotesTable();
  const rows = await db
    .select()
    .from(vaultNotes)
    .where(eq(vaultNotes.userId, userId))
    .orderBy(asc(vaultNotes.kind), asc(vaultNotes.title));
  return rows.map(toNote);
}

export async function createNote(
  userId: string,
  input: { kind: NoteKind; parentId: number | null; title?: string | null }
): Promise<{ note?: VaultNote; error?: string }> {
  const notes = await listNotes(userId);
  if (input.parentId != null) {
    const parent = notes.find((note) => note.id === input.parentId);
    if (!parent || parent.kind !== "folder") return { error: "Pick a folder." };
  }

  const requested = input.title ? cleanTitle(input.title) : null;
  if (input.title && !requested) return { error: "Title is required." };
  const title = uniqueTitle(notes, input.parentId, requested ?? (input.kind === "folder" ? "New folder" : "Untitled"));
  const now = new Date().toISOString();

  const [created] = await db
    .insert(vaultNotes)
    .values({
      userId,
      parentId: input.parentId,
      title,
      kind: input.kind,
      content: "",
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return { note: toNote(created) };
}

export async function updateNote(
  userId: string,
  id: number,
  input: { title?: unknown; content?: unknown; parentId?: unknown }
): Promise<{ note?: VaultNote; error?: string; status?: number }> {
  const notes = await listNotes(userId);
  const current = notes.find((note) => note.id === id);
  if (!current) return { error: "Not found", status: 404 };

  const next: { title?: string; content?: string; parentId?: number | null; updatedAt: string } = {
    updatedAt: new Date().toISOString(),
  };

  let parentId = current.parentId;
  if ("parentId" in input) {
    parentId = input.parentId == null || input.parentId === "" ? null : Number(input.parentId);
    if (parentId != null && !Number.isInteger(parentId)) return { error: "Pick a folder.", status: 400 };
    if (parentId != null) {
      const parent = notes.find((note) => note.id === parentId);
      if (!parent || parent.kind !== "folder") return { error: "Pick a folder.", status: 400 };
      if (descendants(notes, id).has(parentId)) return { error: "A folder can't move inside itself.", status: 400 };
    }
    next.parentId = parentId;
  }

  if ("title" in input) {
    const title = cleanTitle(input.title);
    if (!title) return { error: "Title is required.", status: 400 };
    next.title = title;
  }

  const title = next.title ?? current.title;
  const clash = notes.some((note) => note.id !== id && note.parentId === parentId && sameTitle(note.title, title));
  if (clash) return { error: "Something in this folder already has that name.", status: 409 };

  if ("content" in input) {
    if (current.kind !== "note") return { error: "Folders don't have note text.", status: 400 };
    if (typeof input.content !== "string") return { error: "Note text is invalid.", status: 400 };
    next.content = input.content.slice(0, CONTENT_MAX);
  }

  const [updated] = await db
    .update(vaultNotes)
    .set(next)
    .where(and(eq(vaultNotes.id, id), eq(vaultNotes.userId, userId)))
    .returning();

  if (!updated) return { error: "Not found", status: 404 };
  return { note: toNote(updated) };
}

export async function deleteNote(userId: string, id: number): Promise<boolean> {
  const notes = await listNotes(userId);
  if (!notes.some((note) => note.id === id)) return false;
  const ids = descendants(notes, id);
  for (const noteId of [...ids].reverse()) {
    await db.delete(vaultNotes).where(and(eq(vaultNotes.id, noteId), eq(vaultNotes.userId, userId)));
  }
  return true;
}
