import { NextResponse } from "next/server";
import { listDailyDates } from "@/lib/dailyLogs";
import { getSessionUser } from "@/lib/sessionUser";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dates = await listDailyDates();
  return NextResponse.json({ dates });
}
