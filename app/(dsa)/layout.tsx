import { DsaCatalogHydrator } from "@/components/StoreProvider";
import { getProblems } from "@/app/actions";

export default async function DsaLayout({ children }: { children: React.ReactNode }) {
  let problems: Awaited<ReturnType<typeof getProblems>> = [];
  try {
    problems = await getProblems();
  } catch (error) {
    console.error("DSA catalog load failed:", error);
  }

  return (
    <>
      <DsaCatalogHydrator problems={problems} />
      {children}
    </>
  );
}
