import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SignInButton } from "./SignInButton";

export const metadata = {
  title: "Sign In — DSA Coach",
  description: "Sign in with your Google account to access DSA Coach.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await auth();
  if (session) redirect("/");

  const { error } = await searchParams;

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.2),transparent)]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl shadow-black/60">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-zinc-900 font-bold font-mono text-lg">D</span>
            </div>
            <div>
              <div className="font-semibold text-lg text-white leading-none">DSA Coach</div>
              <div className="text-xs text-zinc-500 mt-0.5">Algorithmic preparation</div>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-zinc-400 text-sm mb-8">
            Sign in to continue your DSA journey.
          </p>

          {error && (
            <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error === "AccessDenied"
                ? "Your account is not on the access list. Contact the admin."
                : "An error occurred. Please try again."}
            </div>
          )}

          <SignInButton />

          <p className="text-center text-xs text-zinc-600 mt-6">
            Access is invite-only. Contact the admin if you need access.
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-zinc-600 text-xs mt-6">
          DSA Coach • Built for focused learning
        </p>
      </div>
    </div>
  );
}
