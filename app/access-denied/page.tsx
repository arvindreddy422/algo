import Link from "next/link";
import { ShieldX } from "lucide-react";

export const metadata = {
  title: "Access Denied — DSA Coach",
};

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-zinc-400 mb-8 text-sm leading-relaxed">
          Your Google account is not on the access list. This app is invite-only.
          Please contact the admin to request access.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          ← Back to Sign In
        </Link>
      </div>
    </div>
  );
}
