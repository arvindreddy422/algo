"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { changePasswordAction } from "@/app/actions/users";

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, undefined);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
          {state.error}
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
          New password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            className="w-full pl-4 pr-10 py-2.5 bg-zinc-950/70 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirm" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Confirm password
        </label>
        <input
          id="confirm"
          name="confirm"
          type={showPassword ? "text" : "password"}
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Type it again"
          className="w-full px-4 py-2.5 bg-zinc-950/70 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save password"}
        {!pending && <ArrowRight className="w-4 h-4" />}
      </button>
    </form>
  );
}
