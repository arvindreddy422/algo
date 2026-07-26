"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus, Trash2, CheckCircle2, Circle, Link as LinkIcon,
  X, Edit3, Save, ExternalLink, ListTodo, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

type TodoLink = { label: string; url: string };

type Todo = {
  id: number;
  title: string;
  description: string | null;
  links: TodoLink[] | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

// ── Empty form state ─────────────────────────────────────────────────────────
const emptyForm = { title: "", description: "", links: [{ label: "", url: "" }] };

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");

  const fetchTodos = useCallback(async () => {
    try {
      const res = await fetch("/api/todos");
      const data = await res.json();
      setTodos(Array.isArray(data) ? data : []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const cleanLinks = (links: TodoLink[]) =>
    links.filter((l) => l.url.trim()).map((l) => ({ label: l.label || l.url, url: l.url.trim() }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description || null,
          links: cleanLinks(form.links),
        }),
      });
      if (res.ok) {
        setForm(emptyForm);
        setShowForm(false);
        fetchTodos();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (todo: Todo) => {
    await fetch(`/api/todos/${todo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !todo.completed }),
    });
    setTodos((prev) =>
      prev.map((t) => (t.id === todo.id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/todos/${id}`, { method: "DELETE" });
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditForm({
      title: todo.title,
      description: todo.description ?? "",
      links: todo.links?.length ? todo.links : [{ label: "", url: "" }],
    });
  };

  const handleSaveEdit = async (id: number) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editForm.title,
        description: editForm.description || null,
        links: cleanLinks(editForm.links),
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setEditingId(null);
    }
  };

  // ── Link fields helper ─────────────────────────────────────────────────────
  function LinkFields({
    links,
    setLinks,
  }: {
    links: TodoLink[];
    setLinks: (l: TodoLink[]) => void;
  }) {
    return (
      <div className="space-y-2">
        {links.map((link, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={link.label}
              onChange={(e) => {
                const next = [...links];
                next[i] = { ...next[i], label: e.target.value };
                setLinks(next);
              }}
              placeholder="Label (optional)"
              className="w-1/3 px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
            />
            <input
              value={link.url}
              onChange={(e) => {
                const next = [...links];
                next[i] = { ...next[i], url: e.target.value };
                setLinks(next);
              }}
              placeholder="https://…"
              type="url"
              className="flex-1 px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
            />
            {links.length > 1 && (
              <button
                type="button"
                onClick={() => setLinks(links.filter((_, j) => j !== i))}
                className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => setLinks([...links, { label: "", url: "" }])}
          className="text-xs text-violet-500 hover:text-violet-400 flex items-center gap-1 transition-colors"
        >
          <Plus className="w-3 h-3" /> Add link
        </button>
      </div>
    );
  }

  const filtered = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "done") return t.completed;
    return true;
  });

  const activeCount = todos.filter((t) => !t.completed).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <ListTodo className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Todo</h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              {activeCount} task{activeCount !== 1 ? "s" : ""} remaining
            </p>
          </div>
        </div>

        <button
          id="new-todo-btn"
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white dark:bg-zinc-900 border border-violet-500/30 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <h2 className="font-semibold mb-4 text-sm uppercase tracking-wider text-zinc-500">New Task</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Title *</label>
              <input
                id="todo-title-input"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="What needs to be done?"
                required
                className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Description</label>
              <textarea
                id="todo-description-input"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Add details, context, or notes…"
                rows={3}
                className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-500 mb-1.5 block flex items-center gap-1">
                <LinkIcon className="w-3 h-3" /> Links
              </label>
              <LinkFields
                links={form.links}
                setLinks={(links) => setForm({ ...form, links })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setShowForm(false); setForm(emptyForm); }}
                className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              >
                Cancel
              </button>
              <button
                id="todo-submit-btn"
                type="submit"
                disabled={submitting || !form.title.trim()}
                className="flex items-center gap-2 px-5 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {submitting ? "Creating…" : "Create Task"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl w-fit">
        {(["all", "active", "done"] as const).map((f) => (
          <button
            key={f}
            id={`filter-${f}-btn`}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize",
              filter === f
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Todo list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-zinc-400">
          <ListTodo className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            {filter === "all" ? "No tasks yet. Create your first one!" :
             filter === "active" ? "No active tasks — great job! 🎉" : "No completed tasks yet."}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((todo) => (
            <li
              key={todo.id}
              className={cn(
                "bg-white dark:bg-zinc-900 border rounded-2xl shadow-sm overflow-hidden transition-all",
                todo.completed
                  ? "border-gray-100 dark:border-zinc-800/50 opacity-70"
                  : "border-gray-200 dark:border-zinc-800"
              )}
            >
              {editingId === todo.id ? (
                // ── Edit mode ──────────────────────────────────────────────
                <div className="p-5 space-y-4">
                  <input
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 font-medium transition-all"
                  />
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                  />
                  <LinkFields
                    links={editForm.links}
                    setLinks={(links) => setEditForm({ ...editForm, links })}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEdit(todo.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      <Save className="w-3 h-3" /> Save
                    </button>
                  </div>
                </div>
              ) : (
                // ── View mode ──────────────────────────────────────────────
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <button
                      id={`toggle-todo-${todo.id}`}
                      onClick={() => handleToggle(todo)}
                      className="mt-0.5 flex-shrink-0 text-zinc-300 dark:text-zinc-600 hover:text-violet-500 dark:hover:text-violet-400 transition-colors"
                    >
                      {todo.completed
                        ? <CheckCircle2 className="w-5 h-5 text-violet-500" />
                        : <Circle className="w-5 h-5" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "font-medium text-sm leading-snug",
                        todo.completed && "line-through text-zinc-400 dark:text-zinc-500"
                      )}>
                        {todo.title}
                      </p>

                      {todo.description && (
                        <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
                          {todo.description}
                        </p>
                      )}

                      {todo.links && todo.links.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          {todo.links.map((link, i) => (
                            <a
                              key={i}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400 hover:text-violet-500 bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 px-2.5 py-1 rounded-full transition-colors"
                            >
                              <ExternalLink className="w-2.5 h-2.5" />
                              {link.label || link.url}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        id={`edit-todo-${todo.id}`}
                        onClick={() => startEdit(todo)}
                        className="p-1.5 rounded-md text-zinc-300 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        id={`delete-todo-${todo.id}`}
                        onClick={() => handleDelete(todo.id)}
                        className="p-1.5 rounded-md text-zinc-300 dark:text-zinc-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 text-[10px] text-zinc-400 dark:text-zinc-600">
                    {new Date(todo.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
