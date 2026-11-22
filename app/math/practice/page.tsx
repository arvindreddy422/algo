import { Practice } from "@/components/math/Practice";
import { parseDrill, parseTable } from "@/lib/math/drills";

export const metadata = {
  title: "Practice | Math",
  description: "Timed drills for the 9 table, tables 2 to 9, fast two-digit products, addition, and subtraction.",
};

export default async function MathPracticePage({
  searchParams,
}: {
  searchParams: Promise<{ drill?: string; table?: string }>;
}) {
  const { drill, table } = await searchParams;
  const initialDrill = parseDrill(drill);
  const initialTable = parseTable(table, initialDrill);
  return <Practice key={`${initialDrill}:${initialTable}`} initialDrill={initialDrill} initialTable={initialTable} />;
}
