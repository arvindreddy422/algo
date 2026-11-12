import { and, count, desc, eq, like, or } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { db } from "@/db";
import { dailyLogs, users } from "@/db/schema";
import { displayName } from "@/lib/sessionUser";

export const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export type DailyLogEntry = {
  id: number;
  title: string;
  url: string | null;
  approach: string;
  notes: string | null;
  difficulty: Difficulty | null;
  topic: string | null;
  logDate: string;
  addedBy: string;
  addedByName: string;
  updatedBy: string | null;
  updatedByName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DailyLogInput = {
  title: string;
  url: string | null;
  approach: string;
  notes: string | null;
  difficulty: Difficulty | null;
  topic: string | null;
  logDate: string;
};

const adder = alias(users, "adder");
const editor = alias(users, "editor");

const logColumns = {
  id: dailyLogs.id,
  title: dailyLogs.title,
  url: dailyLogs.url,
  approach: dailyLogs.approach,
  notes: dailyLogs.notes,
  difficulty: dailyLogs.difficulty,
  topic: dailyLogs.topic,
  logDate: dailyLogs.logDate,
  addedBy: dailyLogs.addedBy,
  updatedBy: dailyLogs.updatedBy,
  createdAt: dailyLogs.createdAt,
  updatedAt: dailyLogs.updatedAt,
  adderName: adder.name,
  adderEmail: adder.email,
  editorName: editor.name,
  editorEmail: editor.email,
};

type LogRow = {
  id: number;
  title: string;
  url: string | null;
  approach: string;
  notes: string | null;
  difficulty: Difficulty | null;
  topic: string | null;
  logDate: string;
  addedBy: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
  adderName: string | null;
  adderEmail: string | null;
  editorName: string | null;
  editorEmail: string | null;
};

function toEntry(row: LogRow): DailyLogEntry {
  return {
    id: row.id,
    title: row.title,
    url: row.url,
    approach: row.approach,
    notes: row.notes,
    difficulty: row.difficulty,
    topic: row.topic,
    logDate: row.logDate,
    addedBy: row.addedBy,
    addedByName: displayName(row.adderName, row.adderEmail),
    updatedBy: row.updatedBy,
    updatedByName: row.updatedBy ? displayName(row.editorName, row.editorEmail) : null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function logsQuery() {
  return db
    .select(logColumns)
    .from(dailyLogs)
    .leftJoin(adder, eq(dailyLogs.addedBy, adder.id))
    .leftJoin(editor, eq(dailyLogs.updatedBy, editor.id));
}

export function isLogDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function normalizeUrl(raw: string | null | undefined): string | null {
  const value = raw?.trim() ?? "";
  if (!value) return null;
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(withProtocol);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    url.hash = "";
    let href = url.toString();
    if (href.endsWith("/") && url.pathname !== "/") href = href.slice(0, -1);
    return href;
  } catch {
    return null;
  }
}

export function parseDifficulty(value: unknown): Difficulty | null | undefined {
  if (value == null || value === "") return null;
  if (typeof value === "string" && DIFFICULTIES.includes(value as Difficulty)) {
    return value as Difficulty;
  }
  return undefined;
}

export async function listDailyLogs(filter: {
  date?: string;
  q?: string;
  url?: string;
}): Promise<DailyLogEntry[]> {
  const conditions = [];
  if (filter.url) conditions.push(eq(dailyLogs.url, filter.url));
  if (filter.date) conditions.push(eq(dailyLogs.logDate, filter.date));
  if (filter.q) {
    const pattern = `%${filter.q.replace(/[%_]/g, "")}%`;
    conditions.push(or(like(dailyLogs.title, pattern), like(dailyLogs.topic, pattern)));
  }

  const rows = await logsQuery()
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(dailyLogs.createdAt));

  return rows.map(toEntry);
}

export async function listDailyDates(): Promise<{ date: string; count: number }[]> {
  const rows = await db
    .select({ date: dailyLogs.logDate, count: count() })
    .from(dailyLogs)
    .groupBy(dailyLogs.logDate)
    .orderBy(desc(dailyLogs.logDate));

  return rows.map((row) => ({ date: row.date, count: row.count }));
}

export async function createDailyLog(input: DailyLogInput, userId: string): Promise<DailyLogEntry> {
  const now = new Date().toISOString();
  const [created] = await db
    .insert(dailyLogs)
    .values({
      title: input.title,
      url: input.url,
      approach: input.approach,
      notes: input.notes,
      difficulty: input.difficulty,
      topic: input.topic,
      logDate: input.logDate,
      addedBy: userId,
      createdAt: now,
      updatedAt: now,
    })
    .returning({ id: dailyLogs.id });

  const [row] = await logsQuery().where(eq(dailyLogs.id, created.id)).limit(1);
  return toEntry(row);
}

export async function updateDailyLog(
  id: number,
  input: Partial<DailyLogInput>,
  userId: string
): Promise<DailyLogEntry | null> {
  const updates: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
    updatedBy: userId,
  };
  if (input.title !== undefined) updates.title = input.title;
  if (input.url !== undefined) updates.url = input.url;
  if (input.approach !== undefined) updates.approach = input.approach;
  if (input.notes !== undefined) updates.notes = input.notes;
  if (input.difficulty !== undefined) updates.difficulty = input.difficulty;
  if (input.topic !== undefined) updates.topic = input.topic;
  if (input.logDate !== undefined) updates.logDate = input.logDate;

  const [updated] = await db
    .update(dailyLogs)
    .set(updates)
    .where(eq(dailyLogs.id, id))
    .returning({ id: dailyLogs.id });

  if (!updated) return null;

  const [row] = await logsQuery().where(eq(dailyLogs.id, id)).limit(1);
  return toEntry(row);
}

export async function deleteDailyLog(id: number): Promise<boolean> {
  const deleted = await db.delete(dailyLogs).where(eq(dailyLogs.id, id)).returning({ id: dailyLogs.id });
  return deleted.length > 0;
}
