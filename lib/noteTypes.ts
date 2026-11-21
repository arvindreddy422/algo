export type NoteKind = "note" | "folder";

export type VaultNote = {
  id: number;
  parentId: number | null;
  title: string;
  kind: NoteKind;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export function linkedNotes(note: VaultNote, notes: VaultNote[]) {
  const pattern = new RegExp(
    `\\[\\[\\s*${note.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*(?:#[^\\]|]*)?(?:\\|[^\\]]*)?\\]\\]`,
    "i"
  );
  return notes.filter((other) => other.id !== note.id && other.kind === "note" && pattern.test(other.content));
}
