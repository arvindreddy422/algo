"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Users, Mail, Shield, Trash2, Plus, Copy, Check,
  Clock, UserCheck, AlertCircle, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

type User = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
  createdAt: string;
};

type AllowedEmail = {
  id: number;
  email: string;
  addedAt: string;
  addedBy: string | null;
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [allowedEmails, setAllowedEmails] = useState<AllowedEmail[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const isAdmin = (session?.user as any)?.role === "admin";

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.status === 403) { router.push("/"); return; }
      const data = await res.json();
      setUsers(data.users ?? []);
      setAllowedEmails(data.allowedEmails ?? []);
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") {
      if (!isAdmin) { router.push("/"); return; }
      fetchData();
    }
  }, [status, isAdmin, fetchData, router]);

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setAdding(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/allowlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setSuccess(`${newEmail.trim()} added to allowlist`);
      setNewEmail("");
      fetchData();
    } catch {
      setError("Failed to add email");
    } finally {
      setAdding(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleRemoveEmail = async (email: string) => {
    setError(null);
    try {
      const res = await fetch("/api/admin/allowlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      fetchData();
    } catch {
      setError("Failed to remove email");
    }
  };

  const handleCopy = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 1500);
  };

  const registeredEmails = new Set(users.map(u => u.email));

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-3 text-zinc-400">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading admin panel…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <header className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
          <Shield className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">Manage access and users</p>
        </div>
        <button
          id="admin-refresh-btn"
          onClick={fetchData}
          className="ml-auto p-2 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-blue-500">
            <Users className="w-5 h-5" />
            <span className="font-medium text-sm text-zinc-500 dark:text-zinc-400">Registered Users</span>
          </div>
          <div className="text-3xl font-bold">{users.length}</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-emerald-500">
            <UserCheck className="w-5 h-5" />
            <span className="font-medium text-sm text-zinc-500 dark:text-zinc-400">Allowed Emails</span>
          </div>
          <div className="text-3xl font-bold">{allowedEmails.length}</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-amber-500">
            <Mail className="w-5 h-5" />
            <span className="font-medium text-sm text-zinc-500 dark:text-zinc-400">Pending Invites</span>
          </div>
          <div className="text-3xl font-bold">
            {allowedEmails.filter(a => !registeredEmails.has(a.email)).length}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm">
          <Check className="w-4 h-4 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Add email form */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-base font-semibold mb-4">Add to Allowlist</h2>
        <form onSubmit={handleAddEmail} className="flex gap-3">
          <div className="flex-1 relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              id="add-email-input"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter Gmail address…"
              className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
            />
          </div>
          <button
            id="add-email-btn"
            type="submit"
            disabled={adding || !newEmail.trim()}
            className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            {adding ? "Adding…" : "Add"}
          </button>
        </form>
      </div>

      {/* Allowed emails list */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
          <h2 className="font-semibold">Allowlist</h2>
        </div>
        {allowedEmails.length === 0 ? (
          <div className="px-6 py-10 text-center text-zinc-400 text-sm">No emails in allowlist yet.</div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-zinc-800">
            {allowedEmails.map((entry) => {
              const isRegistered = registeredEmails.has(entry.email);
              const isAdmin = entry.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
              return (
                <li key={entry.id} className="px-6 py-4 flex items-center gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium truncate">{entry.email}</span>
                      {isRegistered && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium border border-emerald-200 dark:border-emerald-500/20">
                          Registered
                        </span>
                      )}
                      {!isRegistered && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium border border-amber-200 dark:border-amber-500/20">
                          Pending
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-zinc-400">
                      <Clock className="w-3 h-3" />
                      Added {new Date(entry.addedAt).toLocaleDateString()}
                      {entry.addedBy && ` · by ${entry.addedBy}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(entry.email)}
                      className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                      title="Copy email"
                    >
                      {copiedEmail === entry.email ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      id={`remove-email-${entry.id}`}
                      onClick={() => handleRemoveEmail(entry.email)}
                      disabled={isAdmin}
                      className="p-1.5 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      title={isAdmin ? "Cannot remove admin email" : "Remove from allowlist"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Registered users */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
          <h2 className="font-semibold">Registered Users</h2>
        </div>
        {users.length === 0 ? (
          <div className="px-6 py-10 text-center text-zinc-400 text-sm">No users have signed in yet.</div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-zinc-800">
            {users.map((u) => (
              <li key={u.id} className="px-6 py-4 flex items-center gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                {u.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={u.image} alt={u.name ?? u.email} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                      {(u.name ?? u.email).charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{u.name ?? "—"}</span>
                    {u.role === "admin" && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 font-medium border border-violet-200 dark:border-violet-500/20">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-400 truncate">{u.email}</div>
                </div>
                <div className="text-xs text-zinc-400">
                  Joined {new Date(u.createdAt).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
