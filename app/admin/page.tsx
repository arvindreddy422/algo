import { Shield } from "lucide-react";
import { listManagedUsers } from "@/app/actions/users";
import { getSessionUser } from "@/lib/sessionUser";
import { UserAdmin } from "@/components/admin/UserAdmin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const me = await getSessionUser();

  if (!me || me.role !== "admin") {
    return (
      <div className="py-6 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Admin</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Only an admin can add people and change who can manage this app.
        </p>
      </div>
    );
  }

  const people = await listManagedUsers();

  return (
    <div className="py-6 max-w-3xl">
      <header className="mb-8 flex items-center gap-3">
        <Shield className="w-8 h-8 text-zinc-800 dark:text-zinc-200" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Admin</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Add someone with a temporary password. Their first sign-in asks them to choose their own.
          </p>
        </div>
      </header>
      <UserAdmin people={people} currentUserId={me.id} />
    </div>
  );
}
