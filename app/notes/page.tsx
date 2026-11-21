import { redirect } from "next/navigation";
import { NotesVault } from "@/components/notes/NotesVault";
import { getSessionUser } from "@/lib/sessionUser";

export const metadata = {
  title: "Notes | DSA Coach",
  description: "A personal markdown vault with folders, links, and backlinks.",
};

export default async function NotesPage() {
  const me = await getSessionUser();
  if (!me) redirect("/login");
  return <NotesVault ownerName={me.name} />;
}
