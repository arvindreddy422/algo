import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/sessionUser";
import {
  createDailyLog,
  isLogDate,
  listDailyContributors,
  listDailyLogs,
  listDailyTopics,
  normalizeUrl,
  parseDifficulty,
  type DailyLogInput,
} from "@/lib/dailyLogs";

const PAGE_SIZE = 15;

function cleanText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function readInput(body: Record<string, unknown>, partial: boolean): { input?: Partial<DailyLogInput>; error?: string } {
  const input: Partial<DailyLogInput> = {};

  if (!partial || "title" in body) {
    const title = cleanText(body.title, 200);
    if (!title) return { error: "Title is required." };
    input.title = title;
  }

  if (!partial || "approach" in body) {
    const approach = cleanText(body.approach, 8000);
    if (!approach) return { error: "Approach is required." };
    input.approach = approach;
  }

  if (!partial || "url" in body) {
    const rawUrl = typeof body.url === "string" ? body.url : "";
    if (rawUrl.trim()) {
      const url = normalizeUrl(rawUrl);
      if (!url) return { error: "Enter a valid link, or leave it blank." };
      input.url = url;
    } else {
      input.url = null;
    }
  }

  if (!partial || "notes" in body) {
    const notes = cleanText(body.notes, 8000);
    input.notes = notes || null;
  }

  if (!partial || "topic" in body) {
    const topic = cleanText(body.topic, 80);
    input.topic = topic || null;
  }

  if (!partial || "difficulty" in body) {
    const difficulty = parseDifficulty(body.difficulty);
    if (difficulty === undefined) return { error: "Difficulty must be Easy, Medium, or Hard." };
    input.difficulty = difficulty;
  }

  if (!partial || "logDate" in body) {
    const logDate = typeof body.logDate === "string" ? body.logDate : "";
    if (!isLogDate(logDate)) return { error: "Pick a valid date." };
    input.logDate = logDate;
  }

  return { input };
}

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = req.nextUrl.searchParams;
  const checkUrl = params.get("checkUrl");
  const q = params.get("q")?.trim() ?? "";

  if (checkUrl != null) {
    const url = normalizeUrl(checkUrl);
    const { entries } = url ? await listDailyLogs({ url }) : { entries: [] };
    return NextResponse.json({
      matches: entries.map((entry) => ({
        id: entry.id,
        title: entry.title,
        addedByName: entry.addedByName,
      })),
    });
  }

  const requested = Number(params.get("page") ?? "1");
  const page = Number.isInteger(requested) && requested > 0 ? requested : 1;
  const addedBy = params.get("addedBy")?.trim() || undefined;

  const [{ entries, total }, people, topics] = await Promise.all([
    listDailyLogs({ q: q || undefined, addedBy, page, pageSize: PAGE_SIZE }),
    listDailyContributors(q || undefined),
    listDailyTopics(),
  ]);

  return NextResponse.json({ me: user, entries, total, page, pageSize: PAGE_SIZE, people, topics });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { input, error } = readInput(body as Record<string, unknown>, false);
  if (error || !input?.title || !input.approach || !input.logDate) {
    return NextResponse.json({ error: error ?? "Invalid request." }, { status: 400 });
  }

  const entry = await createDailyLog(
    {
      title: input.title,
      url: input.url ?? null,
      approach: input.approach,
      notes: input.notes ?? null,
      difficulty: input.difficulty ?? null,
      topic: input.topic ?? null,
      logDate: input.logDate,
    },
    user.id
  );

  return NextResponse.json(entry, { status: 201 });
}
