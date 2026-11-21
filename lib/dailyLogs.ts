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

function searchPattern(q: string) {
  return `%${q.replace(/[%_]/g, "")}%`;
}

export async function listDailyLogs(filter: {
  q?: string;
  url?: string;
  addedBy?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ entries: DailyLogEntry[]; total: number }> {
  const conditions = [];
  if (filter.url) conditions.push(eq(dailyLogs.url, filter.url));
  if (filter.addedBy) conditions.push(eq(dailyLogs.addedBy, filter.addedBy));
  if (filter.q) {
    const pattern = searchPattern(filter.q);
    conditions.push(or(like(dailyLogs.title, pattern), like(dailyLogs.topic, pattern)));
  }

  const where = conditions.length ? and(...conditions) : undefined;
  const [totalRow] = await db.select({ total: count() }).from(dailyLogs).where(where);
  const total = totalRow?.total ?? 0;

  const page = filter.page != null && filter.pageSize != null ? Math.max(1, filter.page) : null;
  const pageSize = page != null ? Math.min(50, Math.max(1, filter.pageSize!)) : null;

  const rows = await logsQuery()
    .where(where)
    .orderBy(desc(dailyLogs.createdAt), desc(dailyLogs.id))
    .limit(pageSize ?? Math.max(total, 1))
    .offset(page != null && pageSize != null ? (page - 1) * pageSize : 0);

  return { entries: rows.map(toEntry), total };
}

export async function listDailyTopics(): Promise<string[]> {
  const rows = await db.selectDistinct({ topic: dailyLogs.topic }).from(dailyLogs);
  return rows
    .map((row) => row.topic)
    .filter((topic): topic is string => Boolean(topic))
    .sort((a, b) => a.localeCompare(b));
}

export async function listDailyContributors(q?: string): Promise<{ id: string; name: string; count: number }[]> {
  const conditions = [];
  if (q) {
    const pattern = searchPattern(q);
    conditions.push(or(like(dailyLogs.title, pattern), like(dailyLogs.topic, pattern)));
  }

  const rows = await db
    .select({
      id: dailyLogs.addedBy,
      name: adder.name,
      email: adder.email,
      count: count(),
    })
    .from(dailyLogs)
    .leftJoin(adder, eq(dailyLogs.addedBy, adder.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .groupBy(dailyLogs.addedBy, adder.name, adder.email);

  return rows
    .map((row) => ({
      id: row.id,
      name: displayName(row.name, row.email),
      count: row.count,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
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
