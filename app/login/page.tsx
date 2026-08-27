"use client";

import { useActionState, useState } from "react";
import { loginAction } from "@/app/actions/auth";
import { User, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Code2, Database } from "lucide-react";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, undefined);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-slate-100 p-4 relative overflow-hidden">
      {/* Background Glow Accents */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/20 via-transparent to-transparent pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-8 shadow-2xl shadow-purple-950/20">
          
          {/* Header & Logo */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 p-0.5 shadow-lg shadow-purple-500/30 mb-4">
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                <Code2 className="w-7 h-7 text-purple-400" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              DSA Companion
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Sign in to access your spaced-repetition platform
            </p>
          </div>

          {/* Error Message */}
          {state?.error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-2.5 animate-in fade-in slide-in-from-top-1">
              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse flex-shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          {/* Form */}
          <form action={formAction} className="space-y-5">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label htmlFor="username" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  placeholder="Enter username"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/70 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter password"
                  className="w-full pl-10 pr-10 py-2.5 bg-zinc-950/70 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-purple-600/40 active:scale-[0.99]"
            >
              {isPending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>

        {/* Outer Features Preview Bar */}
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-purple-400" /> Grind75 Algorithms
          </span>
          <span className="w-1 h-1 rounded-full bg-zinc-800" />
          <span className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-indigo-400" /> SQL Practice
          </span>
        </div>
      </div>
    </div>
  );
}
