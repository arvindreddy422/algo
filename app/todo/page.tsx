"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus, Trash2, CheckCircle2, Circle, Link as LinkIcon,
  X, Edit3, Save, ExternalLink, ListTodo, Loader2,
  Calendar, Clock, AlertCircle, Sparkles, Filter, ChevronDown, Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isToday, isBefore, parseISO, differenceInDays } from "date-fns";
import { RevisionModal } from "@/components/RevisionModal";

type TodoLink = { label: string; url: string };

type Todo = {
  id: number;
  title: string;
  description: string | null;
  links: TodoLink[] | null;
  completed: boolean;
  status: "pending" | "in_progress" | "review" | "completed";
  priority: "low" | "medium" | "high";
  category: string;
  dueDate: string | null;
  revisionDate: string | null;
  createdAt: string;
  updatedAt: string;
};

const CATEGORIES = ["General", "DSA", "SQL", "System Design", "Projects"];

const emptyForm = {
  title: "",
  description: "",
  category: "General",
  priority: "medium" as "low" | "medium" | "high",
  dueDate: "",
  revisionDate: "",
  links: [{ label: "", url: "" }],
};

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [activeTab, setActiveTab] = useState<"board" | "today" | "pending" | "revisions">("board");

  // Revision modal state
  const [completingTask, setCompletingTask] = useState<Todo | null>(null);

  const fetchTodos = useCallback(async () => {
    try {
      const res = await fetch("/api/todos");
      const data = await res.json();
      setTodos(Array.isArray(data) ? data : []);
    } catch {
      // silently handle error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

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
          category: form.category,
          priority: form.priority,
          dueDate: form.dueDate || null,
          revisionDate: form.revisionDate || null,
          status: "pending",
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

  const handlePatch = async (id: number, updates: Partial<Todo>) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const updated = await res.json();
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    }
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/todos/${id}`, { method: "DELETE" });
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const handleCheckClick = (todo: Todo) => {
    if (todo.completed || todo.status === "completed") {
      // Uncomplete
      handlePatch(todo.id, { completed: false, status: "pending" });
    } else {
      // Open revision modal on complete
      setCompletingTask(todo);
    }
  };

  const handleConfirmRevision = async (revisionDate: string | null) => {
    if (!completingTask) return;
    const updates: Partial<Todo> = {
      completed: true,
      status: revisionDate ? "review" : "completed",
      revisionDate: revisionDate,
    };
    await handlePatch(completingTask.id, updates);
    setCompletingTask(null);
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditForm({
      title: todo.title,
      description: todo.description ?? "",
      category: todo.category || "General",
      priority: todo.priority || "medium",
      dueDate: todo.dueDate || "",
      revisionDate: todo.revisionDate || "",
      links: todo.links?.length ? todo.links : [{ label: "", url: "" }],
    });
  };

  const handleSaveEdit = async (id: number) => {
    await handlePatch(id, {
      title: editForm.title,
      description: editForm.description || null,
      category: editForm.category,
      priority: editForm.priority,
      dueDate: editForm.dueDate || null,
      revisionDate: editForm.revisionDate || null,
      links: cleanLinks(editForm.links),
    });
    setEditingId(null);
  };

  // Helper date metrics
  const todayStr = format(new Date(), "yyyy-MM-dd");

  const todayList = todos.filter(
    (t) =>
      (!t.completed && (t.dueDate === todayStr || t.revisionDate === todayStr)) ||
      (t.revisionDate && isBefore(parseISO(t.revisionDate), new Date()) && !t.completed)
  );

  const pendingList = todos.filter(
    (t) => !t.completed && t.status !== "completed" && !todayList.includes(t)
  );

  const revisionsList = todos.filter(
    (t) => t.revisionDate && t.status === "review"
  );

  const completedList = todos.filter((t) => t.completed || t.status === "completed");

  const totalCount = todos.length;
  const completedTodayCount = todos.filter(
    (t) => (t.completed || t.status === "completed") && t.updatedAt?.startsWith(todayStr)
  ).length;
  const progressPercent = totalCount > 0 ? Math.round((completedList.length / totalCount) * 100) : 0;

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
              placeholder="Label"
              className="w-1/3 px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
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
              className="flex-1 px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            {links.length > 1 && (
              <button
                type="button"
                onClick={() => setLinks(links.filter((_, j) => j !== i))}
                className="p-1 text-zinc-400 hover:text-red-500 transition-colors"
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
          <Plus className="w-3 h-3" /> Add Link
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="py-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/20 text-white">
            <ListTodo className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              Workboard <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-500 border border-violet-500/20">Monday-style</span>
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Manage today&apos;s tasks & scheduled spaced repetition reviews
            </p>
          </div>
        </div>

        <button
          id="new-task-btn"
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold rounded-2xl shadow-lg shadow-violet-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      {/* Monday.com Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            ☀️
          </div>
          <div>
            <span className="text-xs text-zinc-500 font-medium">Today&apos;s Focus</span>
            <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{todayList.length} tasks</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
            ⏳
          </div>
          <div>
            <span className="text-xs text-zinc-500 font-medium">Pending Backlog</span>
            <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{pendingList.length} tasks</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center font-bold">
            📅
          </div>
          <div>
            <span className="text-xs text-zinc-500 font-medium">Scheduled Revisions</span>
            <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{revisionsList.length} reviews</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
            ⚡
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-zinc-500 font-medium">Board Progress</span>
              <span className="font-bold text-emerald-500">{progressPercent}%</span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* New Task Drawer/Form */}
      {showForm && (
        <div className="bg-white dark:bg-zinc-900 border border-violet-500/30 rounded-3xl p-6 shadow-xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <h2 className="font-bold text-sm uppercase tracking-wider text-violet-500 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Create New Board Task
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-zinc-500 mb-1 block">Title *</label>
                <input
                  id="task-title-input"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Task title (e.g. Solve Binary Tree Maximum Path Sum)"
                  required
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1 block">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1 block">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="low">Low (Blue)</option>
                  <option value="medium">Medium (Amber)</option>
                  <option value="high">High (Red)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1 block">Target Due Date</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1 block">Initial Revision Date</label>
                <input
                  type="date"
                  value={form.revisionDate}
                  onChange={(e) => setForm({ ...form, revisionDate: e.target.value })}
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-zinc-500 mb-1 block">Description / Notes</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Task details or problem links…"
                  rows={2}
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-zinc-500 mb-1 block flex items-center gap-1">
                  <LinkIcon className="w-3 h-3" /> Links
                </label>
                <LinkFields
                  links={form.links}
                  setLinks={(links) => setForm({ ...form, links })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setShowForm(false); setForm(emptyForm); }}
                className="px-4 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !form.title.trim()}
                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {submitting ? "Creating…" : "Save Board Task"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Board Group Section Rendering Function */}
      {renderBoardGroup("☀️ Today's Focus List", todayList, "bg-amber-500")}
      {renderBoardGroup("⏳ Pending Backlog Tasks", pendingList, "bg-blue-500")}
      {renderBoardGroup("📅 Scheduled Revisions", revisionsList, "bg-violet-500")}
      {renderBoardGroup("✅ Completed Tasks", completedList, "bg-emerald-500")}

      {/* Revision Modal */}
      {completingTask && (
        <RevisionModal
          isOpen={!!completingTask}
          taskTitle={completingTask.title}
          onClose={() => setCompletingTask(null)}
          onConfirm={handleConfirmRevision}
        />
      )}
    </div>
  );

  function renderBoardGroup(groupTitle: string, groupTodos: Todo[], indicatorColor: string) {
    if (groupTodos.length === 0) return null;

    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden space-y-2">
        {/* Section Header */}
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${indicatorColor}`} />
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50 tracking-tight">
              {groupTitle}
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              {groupTodos.length}
            </span>
          </div>
        </div>

        {/* Monday.com Columns Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-6 w-12 text-center">Status</th>
                <th className="py-3 px-4 min-w-[240px]">Task Name</th>
                <th className="py-3 px-4 w-32">Category</th>
                <th className="py-3 px-4 w-32">Priority</th>
                <th className="py-3 px-4 w-36">Due Date</th>
                <th className="py-3 px-4 w-40">Revision Date</th>
                <th className="py-3 px-4 w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {groupTodos.map((todo) => {
                const isEditing = editingId === todo.id;

                // Priority Badge Styles
                const priorityStyles = {
                  low: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
                  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
                  high: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
                };

                // Status Badge Styles
                const statusStyles = {
                  pending: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
                  in_progress: "bg-amber-500/10 text-amber-500 border-amber-500/20",
                  review: "bg-violet-500/10 text-violet-500 border-violet-500/20",
                  completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                };

                // Revision Days Badge
                let revisionPill = null;
                if (todo.revisionDate) {
                  const revDate = parseISO(todo.revisionDate);
                  const diff = differenceInDays(revDate, new Date());
                  if (isToday(revDate)) {
                    revisionPill = (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 font-bold">
                        Today!
                      </span>
                    );
                  } else if (diff > 0) {
                    revisionPill = (
                      <span className="px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-500 font-semibold">
                        In {diff} {diff === 1 ? "day" : "days"}
                      </span>
                    );
                  } else {
                    revisionPill = (
                      <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-500 font-semibold">
                        Overdue
                      </span>
                    );
                  }
                }

                return (
                  <tr
                    key={todo.id}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors group"
                  >
                    {/* Checkbox Column */}
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleCheckClick(todo)}
                        className="text-zinc-300 dark:text-zinc-600 hover:text-emerald-500 transition-colors inline-block"
                      >
                        {todo.completed || todo.status === "completed" ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>
                    </td>

                    {/* Task Title & Description */}
                    <td className="py-4 px-4">
                      {isEditing ? (
                        <input
                          value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      ) : (
                        <div>
                          <p
                            className={cn(
                              "font-bold text-sm text-zinc-900 dark:text-zinc-100 leading-snug",
                              (todo.completed || todo.status === "completed") && "line-through text-zinc-400 dark:text-zinc-500"
                            )}
                          >
                            {todo.title}
                          </p>
                          {todo.description && (
                            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                              {todo.description}
                            </p>
                          )}
                          {todo.links && todo.links.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              {todo.links.map((link, i) => (
                                <a
                                  key={i}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] text-violet-500 hover:underline"
                                >
                                  <ExternalLink className="w-2.5 h-2.5" />
                                  {link.label || link.url}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Category Column */}
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium border border-zinc-200 dark:border-zinc-700">
                        {todo.category || "General"}
                      </span>
                    </td>

                    {/* Priority Column Dropdown */}
                    <td className="py-4 px-4">
                      <select
                        value={todo.priority}
                        onChange={(e) => handlePatch(todo.id, { priority: e.target.value as any })}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer focus:outline-none",
                          priorityStyles[todo.priority]
                        )}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </td>

                    {/* Due Date Column */}
                    <td className="py-4 px-4">
                      <input
                        type="date"
                        value={todo.dueDate || ""}
                        onChange={(e) => handlePatch(todo.id, { dueDate: e.target.value || null })}
                        className="bg-transparent text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-2 py-1 rounded-lg transition-colors cursor-pointer focus:outline-none"
                      />
                    </td>

                    {/* Revision Date Column */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="date"
                          value={todo.revisionDate || ""}
                          onChange={(e) =>
                            handlePatch(todo.id, {
                              revisionDate: e.target.value || null,
                              status: e.target.value ? "review" : todo.status,
                            })
                          }
                          className="bg-transparent text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-2 py-1 rounded-lg transition-colors cursor-pointer focus:outline-none"
                        />
                        {revisionPill}
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {isEditing ? (
                          <button
                            onClick={() => handleSaveEdit(todo.id)}
                            className="p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => startEdit(todo)}
                            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(todo.id)}
                          className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}
