"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Check, Copy, KeyRound, RefreshCw, Trash2, UserPlus } from "lucide-react";
import {
  createUserAction,
  deleteUserAction,
  resetPasswordAction,
  setUserRoleAction,
  type ManagedUser,
} from "@/app/actions/users";

function generatePassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

function formatJoined(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, "MMM d, yyyy");
}

export function UserAdmin({
  people,
  currentUserId,
}: {
  people: ManagedUser[];
  currentUserId: string;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(createUserAction, undefined);
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [showTemporary, setShowTemporary] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [resetFor, setResetFor] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    if (!state?.ok) return;
    formRef.current?.reset();
    setTemporaryPassword("");
    router.refresh();
  }, [state, router]);

  async function copyText(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
    } catch {
      setCopied("");
    }
  }

  async function changeRole(person: ManagedUser) {
    setError("");
    setNotice("");
    setBusyId(person.id);
    const nextRole = person.role === "admin" ? "user" : "admin";
    const result = await setUserRoleAction(person.id, nextRole);
    setBusyId(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    setNotice(result.ok || "Role updated.");
    router.refresh();
  }

  async function reset(person: ManagedUser) {
    setError("");
    setNotice("");
    setBusyId(person.id);
    const result = await resetPasswordAction(person.id, resetPassword);
    setBusyId(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    setResetFor(null);
    setResetPassword("");
    setNotice(
      result.temporaryPassword
        ? `${result.ok} Temporary password: ${result.temporaryPassword}`
        : result.ok || "Password reset."
    );
    router.refresh();
  }

  async function remove(person: ManagedUser) {
    setError("");
    setNotice("");
    setBusyId(person.id);
    const result = await deleteUserAction(person.id);
    setBusyId(null);
    setConfirmRemove(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    setNotice(result.ok || "Account removed.");
    router.refresh();
  }

  const sharedPassword = state?.temporaryPassword;

  return (
    <div className="space-y-6">
      <form
        ref={formRef}
        action={formAction}
        className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 space-y-4"
      >
        <div className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-semibold">Add a person</h2>
        </div>

        {state?.error && (
          <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
        )}
        {state?.ok && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 space-y-2">
            <p>{state.ok}</p>
            {sharedPassword && (
              <div className="flex flex-wrap items-center gap-2">
                <code className="rounded bg-white/80 dark:bg-zinc-900 px-2 py-1 font-mono text-xs">
                  {sharedPassword}
                </code>
                <button
                  type="button"
                  onClick={() => copyText(sharedPassword)}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                >
                  {copied === sharedPassword ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied === sharedPassword ? "Copied" : "Copy password"}
                </button>
              </div>
            )}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">Name</span>
            <input
              name="name"
              required
              placeholder="Ada Lovelace"
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            />
          </label>
          <label className="space-y-1.5 text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">Email</span>
            <input
              name="email"
              type="email"
              required
              placeholder="ada@example.com"
              autoComplete="off"
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            />
          </label>
        </div>

        <label className="space-y-1.5 text-sm block">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Temporary password</span>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              name="temporaryPassword"
              required
              minLength={6}
              value={temporaryPassword}
              onChange={(event) => setTemporaryPassword(event.target.value)}
              type={showTemporary ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 6 characters"
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowTemporary((value) => !value)}
                className="flex-1 sm:flex-none rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-300"
              >
                {showTemporary ? "Hide" : "Show"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTemporaryPassword(generatePassword());
                  setShowTemporary(true);
                }}
                className="flex-1 sm:flex-none rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-300"
              >
                Generate
              </button>
            </div>
          </div>
        </label>

        <label className="space-y-1.5 text-sm block">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Role</span>
          <select
            name="role"
            defaultValue="user"
            className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="user">Member</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {pending ? "Adding..." : "Add person"}
        </button>
      </form>

      {(error || notice) && (
        <p className={error ? "text-sm text-red-600 dark:text-red-400" : "text-sm text-emerald-700 dark:text-emerald-400"}>
          {error || notice}
        </p>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          People ({people.length})
        </h2>
        {people.map((person) => {
          const mine = person.id === currentUserId;
          const busy = busyId === person.id;
          return (
            <article
              key={person.id}
              className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 space-y-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold truncate">{person.name}</h3>
                    {mine && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">You</span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-500 break-all">{person.email}</p>
                  <p className="text-xs text-zinc-400 mt-1">Joined {formatJoined(person.createdAt)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 text-xs font-medium">
                    {person.role === "admin" ? "Admin" : "Member"}
                  </span>
                  <span
                    className={
                      person.mustChangePassword
                        ? "rounded-full bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 px-2.5 py-1 text-xs font-medium"
                        : "rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300 px-2.5 py-1 text-xs font-medium"
                    }
                  >
                    {person.mustChangePassword ? "Needs a password" : "Password set"}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {!mine && !person.lockedAdmin && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => changeRole(person)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    {person.role === "admin" ? "Make member" : "Make admin"}
                  </button>
                )}
                {person.lockedAdmin && (
                  <span className="text-xs text-zinc-500 py-2">Owner account stays an admin.</span>
                )}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setResetFor(resetFor === person.id ? null : person.id);
                    setResetPassword("");
                    setConfirmRemove(null);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  New temporary password
                </button>
                {!mine && !person.lockedAdmin && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setConfirmRemove(person.id);
                      setResetFor(null);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 dark:border-red-900/60 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                )}
              </div>

              {resetFor === person.id && (
                <form
                  className="flex flex-col sm:flex-row gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void reset(person);
                  }}
                >
                  <input
                    value={resetPassword}
                    onChange={(event) => setResetPassword(event.target.value)}
                    minLength={6}
                    required
                    placeholder="New temporary password"
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={busy}
                    className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-zinc-900"
                  >
                    Save
                  </button>
                </form>
              )}

              {confirmRemove === person.id && (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span>Remove {person.email}?</span>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void remove(person)}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                  >
                    Confirm remove
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmRemove(null)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-500"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}
