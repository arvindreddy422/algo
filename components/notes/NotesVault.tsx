"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  FilePlus,
  FileText,
  Folder,
  FolderPlus,
  Loader2,
  Search,
  Trash2,
} from "lucide-react";
import { NotePreview } from "@/components/notes/NotePreview";
import { cn } from "@/lib/utils";
import { linkedNotes, type NoteKind, type VaultNote } from "@/lib/noteTypes";

type ViewMode = "edit" | "split" | "preview";
type SaveState = "saved" | "saving" | "error";

function sortNotes(notes: VaultNote[]) {
  return [...notes].sort(
    (a, b) => Number(a.kind === "note") - Number(b.kind === "note") || a.title.localeCompare(b.title)
  );
}

function descendantIds(notes: VaultNote[], id: number) {
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

export function NotesVault({ ownerName }: { ownerName: string }) {
  const [notes, setNotes] = useState<VaultNote[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [query, setQuery] = useState("");
  const [openFolders, setOpenFolders] = useState<Set<number>>(new Set());
  const [view, setView] = useState<ViewMode>("split");
  const [pane, setPane] = useState<"tree" | "editor">("tree");
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const skipSave = useRef(true);

  const selected = notes.find((note) => note.id === selectedId) ?? null;
  const live = useRef({ id: null as number | null, kind: "note" as NoteKind, title: "", content: "" });
  live.current = {
    id: selectedId,
    kind: selected?.kind ?? "note",
    title: draftTitle,
    content: draftContent,
  };

  const load = useCallback(async () => {
    const res = await fetch("/api/notes");
    if (!res.ok) {
      setError("Could not load your notes.");
      setLoading(false);
      return;
    }
    const body = await res.json();
    const next = Array.isArray(body.notes) ? (body.notes as VaultNote[]) : [];
    setNotes(next);
    setOpenFolders(new Set(next.filter((note) => note.kind === "folder").map((note) => note.id)));
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const persist = useCallback(async (id: number, body: { title: string; content?: string; parentId?: number | null }) => {
    if (!body.title.trim()) {
      setError("Title is required.");
      setSaveState("error");
      return false;
    }
    setSaveState("saving");
    const res = await fetch(`/api/notes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setSaveState("error");
      setError(data.error || "Could not save.");
      return false;
    }
    setNotes((current) => current.map((note) => (note.id === id ? (data as VaultNote) : note)));
    setSaveState("saved");
    setError("");
    return true;
  }, []);

  const selectedKind = selected?.kind;
  useEffect(() => {
    if (selectedId == null || !selectedKind) return;
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }
    const handle = window.setTimeout(() => {
      void persist(
        selectedId,
        selectedKind === "note" ? { title: draftTitle, content: draftContent } : { title: draftTitle }
      );
    }, 600);
    return () => window.clearTimeout(handle);
  }, [draftContent, draftTitle, persist, selectedId, selectedKind]);

  const openItem = useCallback(
    async (note: VaultNote) => {
      const current = live.current;
      if (current.id != null && current.id !== note.id && current.title.trim()) {
        await persist(
          current.id,
          current.kind === "note" ? { title: current.title, content: current.content } : { title: current.title }
        );
      }
      skipSave.current = true;
      setSelectedId(note.id);
      setDraftTitle(note.title);
      setDraftContent(note.content);
      setConfirmDelete(false);
      setError("");
      setPane("editor");
    },
    [persist]
  );

  const createItem = useCallback(
    async (kind: NoteKind, title?: string, parentId?: number | null) => {
      const parent = parentId === undefined ? (selected?.kind === "folder" ? selected.id : selected?.parentId ?? null) : parentId;
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, parentId: parent, title }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not create that.");
        return;
      }
      const note = data as VaultNote;
      setNotes((current) => sortNotes([...current, note]));
      if (note.parentId != null) {
        setOpenFolders((current) => new Set(current).add(note.parentId as number));
      }
      await openItem(note);
    },
    [openItem, selected]
  );

  const removeSelected = useCallback(async () => {
    if (!selected) return;
    const res = await fetch(`/api/notes/${selected.id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Could not delete that.");
      return;
    }
    const doomed = descendantIds(notes, selected.id);
    setNotes((current) => current.filter((note) => !doomed.has(note.id)));
    setSelectedId(null);
    setConfirmDelete(false);
    setPane("tree");
  }, [notes, selected]);

  const openLink = useCallback(
    async (href: string) => {
      if (href.startsWith("#note:")) {
        const note = notes.find((item) => item.id === Number(href.slice("#note:".length)));
        if (note) await openItem(note);
        return;
      }
      if (href.startsWith("#missing:")) {
        const title = decodeURIComponent(href.slice("#missing:".length));
        await createItem("note", title, null);
      }
    },
    [createItem, notes, openItem]
  );

  const search = query.trim().toLowerCase();
  const visible = useMemo(() => {
    if (!search) return null;
    return sortNotes(
      notes.filter(
        (note) => note.title.toLowerCase().includes(search) || (note.kind === "note" && note.content.toLowerCase().includes(search))
      )
    );
  }, [notes, search]);

  const folderChoices = useMemo(() => {
    if (!selected) return [];
    const blocked = descendantIds(notes, selected.id);
    return sortNotes(notes.filter((note) => note.kind === "folder" && !blocked.has(note.id)));
  }, [notes, selected]);

  const mentions = selected?.kind === "note" ? linkedNotes({ ...selected, title: draftTitle || selected.title }, notes) : [];

  const renderBranch = (parentId: number | null, depth: number) => {
    const children = sortNotes(notes.filter((note) => note.parentId === parentId));
    return children.map((note) => {
      const label = note.id === selectedId ? draftTitle || note.title : note.title;
      const open = openFolders.has(note.id);
      return (
        <div key={note.id}>
          <button
            type="button"
            onClick={() => {
              if (note.kind === "folder") {
                setOpenFolders((current) => {
                  const next = new Set(current);
                  if (note.id === selectedId && next.has(note.id)) next.delete(note.id);
                  else next.add(note.id);
                  return next;
                });
              }
              void openItem(note);
            }}
            className={cn(
              "flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm",
              note.id === selectedId
                ? "bg-zinc-200 text-zinc-950 dark:bg-zinc-800 dark:text-zinc-50"
                : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
            )}
            style={{ paddingLeft: 8 + depth * 14 }}
          >
            {note.kind === "folder" ? (
              <ChevronRight className={cn("h-3.5 w-3.5 shrink-0 text-zinc-400 transition-transform", open && "rotate-90")} />
            ) : (
              <span className="w-3.5 shrink-0" />
            )}
            {note.kind === "folder" ? (
              <Folder className="h-3.5 w-3.5 shrink-0 text-amber-500" />
            ) : (
              <FileText className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
            )}
            <span className="truncate">{label}</span>
          </button>
          {note.kind === "folder" && open && renderBranch(note.id, depth + 1)}
        </div>
      );
    });
  };

  return (
    <div className="flex h-full min-h-0 bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <aside
        className={cn(
          "min-h-0 w-full flex-col border-zinc-200 dark:border-zinc-800 md:flex md:w-72 md:border-r",
          pane === "editor" ? "hidden" : "flex"
        )}
      >
        <div className="flex items-center gap-2 border-b border-zinc-200 px-3 py-2.5 dark:border-zinc-800">
          <div className="min-w-0">
            <span className="block text-sm font-semibold">Notes</span>
            <span className="block truncate text-[11px] text-zinc-400">{ownerName}</span>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() => void createItem("note")}
              title="New note"
              className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              <FilePlus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => void createItem("folder")}
              title="New folder"
              className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              <FolderPlus className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="px-3 py-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search notes"
              className="w-full rounded-md border border-zinc-200 bg-zinc-50 py-1.5 pl-8 pr-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900"
            />
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
            </div>
          ) : notes.length === 0 ? (
            <p className="px-2 py-6 text-sm text-zinc-500">No notes yet. Create one to start a vault.</p>
          ) : visible ? (
            visible.length === 0 ? (
              <p className="px-2 py-6 text-sm text-zinc-500">No notes match that search.</p>
            ) : (
              visible.map((note) => (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => void openItem(note)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  {note.kind === "folder" ? (
                    <Folder className="h-3.5 w-3.5 text-amber-500" />
                  ) : (
                    <FileText className="h-3.5 w-3.5 text-zinc-400" />
                  )}
                  <span className="truncate">{note.title}</span>
                </button>
              ))
            )
          ) : (
            renderBranch(null, 0)
          )}
        </div>
      </aside>

      <section className={cn("min-h-0 min-w-0 flex-1 flex-col", pane === "tree" ? "hidden md:flex" : "flex")}>
        {!selected ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <LibraryMark />
            <h1 className="mt-4 text-xl font-semibold">Your notes</h1>
            <p className="mt-2 max-w-md text-sm text-zinc-500">
              Private to {ownerName}. Other accounts cannot open these notes. Write in Markdown, use folders, and connect notes with [[links]].
            </p>
            <button
              type="button"
              onClick={() => void createItem("note")}
              className="mt-5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              New note
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setPane("tree")}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 md:hidden dark:hover:bg-zinc-800"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Notes
              </button>
              <span className="text-xs text-zinc-400">
                {saveState === "saving" ? "Saving…" : saveState === "error" ? "Not saved" : "Saved"}
              </span>
              {selected.kind === "note" && (
                <div className="ml-auto flex rounded-lg border border-zinc-200 p-0.5 text-xs dark:border-zinc-700">
                  {(["edit", "split", "preview"] as ViewMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setView(mode)}
                      className={cn(
                        "rounded-md px-2.5 py-1 capitalize",
                        view === mode ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "text-zinc-500"
                      )}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <input
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              className="w-full bg-transparent px-5 pt-5 text-2xl font-semibold tracking-tight outline-none"
              aria-label="Title"
            />
            <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
              {(selected.kind === "folder" || view !== "preview") && (
                <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                  {selected.kind === "note" ? (
                    <textarea
                      value={draftContent}
                      onChange={(event) => setDraftContent(event.target.value)}
                      placeholder="Write in Markdown. Link another note with [[Note title]]."
                      className="min-h-0 w-full flex-1 resize-none bg-transparent px-5 py-4 text-sm leading-7 outline-none"
                    />
                  ) : (
                    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                      <p className="text-sm text-zinc-500">Notes in this folder</p>
                      <div className="mt-3 space-y-1">
                        {sortNotes(notes.filter((note) => note.parentId === selected.id)).map((note) => (
                          <button
                            key={note.id}
                            type="button"
                            onClick={() => void openItem(note)}
                            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
                          >
                            {note.kind === "folder" ? (
                              <Folder className="h-3.5 w-3.5 text-amber-500" />
                            ) : (
                              <FileText className="h-3.5 w-3.5 text-zinc-400" />
                            )}
                            {note.title}
                          </button>
                        ))}
                        {notes.every((note) => note.parentId !== selected.id) && (
                          <p className="text-sm text-zinc-400">This folder is empty.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selected.kind === "note" && view !== "edit" && (
                <div className="min-h-0 min-w-0 flex-1 overflow-y-auto border-t border-zinc-200 px-5 py-5 dark:border-zinc-800 lg:border-l lg:border-t-0">
                  <NotePreview markdown={draftContent} notes={notes.map((note) => (note.id === selected.id ? { ...note, title: draftTitle, content: draftContent } : note))} onOpen={(href) => void openLink(href)} />
                  <div className="mt-8 border-t border-zinc-200 pt-4 dark:border-zinc-800">
                    <h2 className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">Backlinks</h2>
                    {mentions.length === 0 ? (
                      <p className="mt-2 text-sm text-zinc-400">No other notes link here yet.</p>
                    ) : (
                      <div className="mt-2 space-y-1">
                        {mentions.map((note) => (
                          <button
                            key={note.id}
                            type="button"
                            onClick={() => void openItem(note)}
                            className="block text-sm text-violet-600 hover:underline dark:text-violet-400"
                          >
                            {note.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-zinc-200 px-3 py-2 dark:border-zinc-800">
              <label className="flex items-center gap-2 text-xs text-zinc-500">
                Folder
                <select
                  value={selected.parentId ?? ""}
                  onChange={(event) => {
                    const parentId = event.target.value ? Number(event.target.value) : null;
                    void persist(selected.id, {
                      title: draftTitle,
                      ...(selected.kind === "note" ? { content: draftContent } : {}),
                      parentId,
                    });
                  }}
                  className="rounded-md border border-zinc-200 bg-transparent px-2 py-1 text-xs dark:border-zinc-700"
                >
                  <option value="">Vault</option>
                  {folderChoices.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.title}
                    </option>
                  ))}
                </select>
              </label>
              <div className="ml-auto">
                {confirmDelete ? (
                  <span className="flex items-center gap-2 text-xs">
                    <span className="text-zinc-500">
                      {selected.kind === "folder" ? "Delete this folder and everything inside?" : "Delete this note?"}
                    </span>
                    <button type="button" onClick={() => void removeSelected()} className="font-medium text-red-600">
                      Delete
                    </button>
                    <button type="button" onClick={() => setConfirmDelete(false)} className="text-zinc-500">
                      Cancel
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                )}
              </div>
            </div>
            {error && <p className="px-3 pb-2 text-xs text-red-500">{error}</p>}
          </>
        )}
      </section>
    </div>
  );
}

function LibraryMark() {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900">
      <FileText className="h-5 w-5 text-zinc-500" />
    </div>
  );
}
