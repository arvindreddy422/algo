"use client";

import Link from "next/link";
import { ShieldX, RefreshCw } from "lucide-react";
import { signIn } from "next-auth/react";

export default function AccessDeniedPage() {
  const trySwitchAccount = () => {
    // Force Google to show the account picker so user can try a different Gmail
    signIn("google", { callbackUrl: "/" }, { prompt: "select_account" });
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-zinc-400 mb-8 text-sm leading-relaxed">
          The Google account you used is not on the access list.
          This app is invite-only — contact the admin to request access,
          or try signing in with a different Google account.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {/* Try a different Google account */}
          <button
            id="try-different-account-btn"
            onClick={trySwitchAccount}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-zinc-100 text-zinc-900 text-sm font-semibold rounded-lg transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Try a different account
          </button>

          {/* Back to sign in */}
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
