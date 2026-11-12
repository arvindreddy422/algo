import { NextRequest, NextResponse } from "next/server";
import {
  deleteDailyLog,
  isLogDate,
  normalizeUrl,
  parseDifficulty,
  updateDailyLog,
  type DailyLogInput,
} from "@/lib/dailyLogs";
import { getSessionUser } from "@/lib/sessionUser";

function cleanText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function readPatch(body: Record<string, unknown>): { input?: Partial<DailyLogInput>; error?: string } {
  const input: Partial<DailyLogInput> = {};

  if ("title" in body) {
    const title = cleanText(body.title, 200);
    if (!title) return { error: "Title is required." };
    input.title = title;
  }

  if ("approach" in body) {
    const approach = cleanText(body.approach, 8000);
    if (!approach) return { error: "Approach is required." };
    input.approach = approach;
  }

  if ("url" in body) {
    const rawUrl = typeof body.url === "string" ? body.url : "";
    if (rawUrl.trim()) {
      const url = normalizeUrl(rawUrl);
      if (!url) return { error: "Enter a valid link, or leave it blank." };
      input.url = url;
    } else {
      input.url = null;
    }
  }

  if ("notes" in body) {
    const notes = cleanText(body.notes, 8000);
    input.notes = notes || null;
  }

  if ("topic" in body) {
    const topic = cleanText(body.topic, 80);
    input.topic = topic || null;
  }

  if ("difficulty" in body) {
    const difficulty = parseDifficulty(body.difficulty);
    if (difficulty === undefined) return { error: "Difficulty must be Easy, Medium, or Hard." };
    input.difficulty = difficulty;
  }

  if ("logDate" in body) {
    const logDate = typeof body.logDate === "string" ? body.logDate : "";
    if (!isLogDate(logDate)) return { error: "Pick a valid date." };
    input.logDate = logDate;
  }

  if (Object.keys(input).length === 0) return { error: "Nothing to update." };
  return { input };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const logId = Number(id);
  if (!Number.isInteger(logId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { input, error } = readPatch(body as Record<string, unknown>);
  if (error || !input) {
    return NextResponse.json({ error: error ?? "Invalid request." }, { status: 400 });
  }

  const entry = await updateDailyLog(logId, input, user.id);
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(entry);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const logId = Number(id);
  if (!Number.isInteger(logId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const deleted = await deleteDailyLog(logId);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
