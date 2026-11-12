import { getSessionUser } from "@/lib/sessionUser";
import { logoutAction } from "@/app/actions/auth";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";

export const dynamic = "force-dynamic";

export default async function ChangePasswordPage() {
  const me = await getSessionUser();
  if (!me) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 text-slate-100 p-4">
        <form action={logoutAction} className="text-center space-y-4">
          <p className="text-sm text-zinc-400">We could not load this account. Sign in again.</p>
          <button type="submit" className="text-sm text-white underline">
            Sign out
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-8 shadow-2xl shadow-purple-950/20">
          <h1 className="text-2xl font-bold tracking-tight text-white">Choose your password</h1>
          <p className="text-sm text-zinc-400 mt-2">
            Hi {me.name}. This replaces the temporary password for {me.email}. You will use this one the next time you sign in.
          </p>
          <div className="mt-6">
            <ChangePasswordForm />
          </div>
        </div>
        <form action={logoutAction} className="mt-4 text-center">
          <button type="submit" className="text-xs text-zinc-500 hover:text-zinc-300">
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
