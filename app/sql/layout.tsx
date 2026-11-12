import { SqlCatalogHydrator } from "@/components/StoreProvider";
import { getSqlProblems, getSqlPrerequisites } from "@/app/actions";

export default async function SqlLayout({ children }: { children: React.ReactNode }) {
  let problems: Awaited<ReturnType<typeof getSqlProblems>> = [];
  let prerequisites: Awaited<ReturnType<typeof getSqlPrerequisites>> = [];
  try {
    [problems, prerequisites] = await Promise.all([getSqlProblems(), getSqlPrerequisites()]);
  } catch (error) {
    console.error("SQL catalog load failed:", error);
  }

  return (
    <>
      <SqlCatalogHydrator problems={problems} prerequisites={prerequisites} />
      {children}
    </>
  );
}
