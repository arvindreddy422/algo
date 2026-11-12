"use server";

import { db } from "@/db";
import {
  problems,
  userStats,
  sqlProblems,
  sqlPrerequisites,
  problemProgress,
  sqlProblemProgress,
  sqlPrerequisiteProgress,
} from "@/db/schema";
import { and, eq, isNotNull, isNull, lte, sql } from "drizzle-orm";
import { ConfidenceLevel, Problem, SqlProblem, SqlPrerequisite } from "@/types";
import { solvedFields, type ProblemOrder } from "@/features/study/schedule";
import { getSessionUser } from "@/lib/sessionUser";
import { ensureProgressSchema } from "@/db/progressSchema";

type ProgressRow = typeof problemProgress.$inferSelect;
type ProgressUpdate = Partial<Pick<ProgressRow, "status" | "attempts" | "notes" | "solveTime" | "solvedAt" | "reviewDate" | "confidence">>;

const EMPTY_STATS = {
  dailyGoal: 3,
  streak: 0,
  lastActiveDate: null as string | null,
  problemOrder: "EasyFirst" as ProblemOrder,
};

let legacyClaimed = false;

async function requireUserId() {
  const user = await getSessionUser();
  return user?.id ?? null;
}

function asConfidence(value: number | null | undefined): Problem["confidence"] {
  if (value === 1 || value === 2 || value === 3 || value === 4 || value === 5) return value;
  return undefined;
}

function toProblem(row: typeof problems.$inferSelect, progress?: ProgressRow): Problem {
  return {
    id: row.id,
    title: row.title,
    difficulty: row.difficulty,
    topics: row.topics,
    companyTags: row.companyTags ?? undefined,
    url: row.url,
    status: progress?.status ?? "pending",
    attempts: progress?.attempts ?? 0,
    notes: progress?.notes ?? undefined,
    solveTime: progress?.solveTime ?? 0,
    solvedAt: progress?.solvedAt ?? undefined,
    reviewDate: progress?.reviewDate ?? undefined,
    confidence: asConfidence(progress?.confidence),
  };
}

function toSqlProblem(row: typeof sqlProblems.$inferSelect, progress?: ProgressRow): SqlProblem {
  return {
    ...toProblem(
      {
        id: row.id,
        title: row.title,
        difficulty: row.difficulty,
        topics: row.topics,
        companyTags: row.companyTags,
        url: row.url,
        status: "pending",
        attempts: 0,
        notes: null,
        solveTime: 0,
        solvedAt: null,
        reviewDate: null,
        confidence: null,
      },
      progress,
    ),
    source: row.source,
    prerequisiteTopics: row.prerequisiteTopics ?? undefined,
  };
}

export async function claimLegacyProgress(userId: string) {
  await ensureProgressSchema();
  if (legacyClaimed) return;

  const [dsaRows, sqlRows, prerequisiteRows] = await Promise.all([
    db.select({ problemId: problemProgress.problemId }).from(problemProgress).limit(1),
    db.select({ problemId: sqlProblemProgress.problemId }).from(sqlProblemProgress).limit(1),
    db.select({ prerequisiteId: sqlPrerequisiteProgress.prerequisiteId }).from(sqlPrerequisiteProgress).limit(1),
  ]);

  if (dsaRows.length === 0) {
    await db.run(sql`
      INSERT OR IGNORE INTO problem_progress (user_id, problem_id, status, attempts, notes, solve_time, solved_at, review_date, confidence)
      SELECT ${userId}, id, status, attempts, notes, solve_time, solved_at, review_date, confidence
      FROM problems
      WHERE status != 'pending'
         OR ifnull(attempts, 0) > 0
         OR notes IS NOT NULL
         OR solved_at IS NOT NULL
         OR review_date IS NOT NULL
    `);
  }

  if (sqlRows.length === 0) {
    await db.run(sql`
      INSERT OR IGNORE INTO sql_problem_progress (user_id, problem_id, status, attempts, notes, solve_time, solved_at, review_date, confidence)
      SELECT ${userId}, id, status, attempts, notes, solve_time, solved_at, review_date, confidence
      FROM sql_problems
      WHERE status != 'pending'
         OR ifnull(attempts, 0) > 0
         OR notes IS NOT NULL
         OR solved_at IS NOT NULL
         OR review_date IS NOT NULL
    `);
  }

  if (prerequisiteRows.length === 0) {
    await db.run(sql`
      INSERT OR IGNORE INTO sql_prerequisite_progress (user_id, prerequisite_id, completed)
      SELECT ${userId}, id, completed
      FROM sql_prerequisites
      WHERE completed = 1
    `);
  }

  legacyClaimed = true;
}

async function ensureStats(userId: string) {
  const mine = await db.select().from(userStats).where(eq(userStats.userId, userId)).limit(1);
  if (mine[0]) return mine[0];

  const legacy = await db.select().from(userStats).where(isNull(userStats.userId)).limit(1);
  if (legacy[0]) {
    await db.update(userStats).set({ userId }).where(eq(userStats.id, legacy[0].id));
    return { ...legacy[0], userId };
  }

  const [created] = await db.insert(userStats).values({ userId, dailyGoal: 3, streak: 0 }).returning();
  return created;
}

function presentStats(row: typeof userStats.$inferSelect) {
  return {
    dailyGoal: row.dailyGoal,
    streak: row.streak,
    lastActiveDate: row.lastActiveDate,
    problemOrder: row.problemOrder,
  };
}

export async function getProblems() {
  const userId = await requireUserId();
  if (!userId) return [];
  await claimLegacyProgress(userId);

  const [catalog, progress] = await Promise.all([
    db.select().from(problems),
    db.select().from(problemProgress).where(eq(problemProgress.userId, userId)),
  ]);
  const byId = new Map(progress.map((row) => [row.problemId, row]));
  return catalog.map((row) => toProblem(row, byId.get(row.id)));
}

export async function getUserStats() {
  await ensureProgressSchema();
  const userId = await requireUserId();
  if (!userId) return EMPTY_STATS;
  const row = await ensureStats(userId);
  return presentStats(row);
}

export async function getDueCounts() {
  const userId = await requireUserId();
  if (!userId) return { dsa: 0, sql: 0 };
  await claimLegacyProgress(userId);

  const now = new Date().toISOString();
  const due = (table: typeof problemProgress | typeof sqlProblemProgress) =>
    db
      .select({ problemId: table.problemId })
      .from(table)
      .where(
        and(
          eq(table.userId, userId),
          eq(table.status, "solved"),
          isNotNull(table.reviewDate),
          lte(table.reviewDate, now),
        ),
      );

  const [dsa, sqlDue] = await Promise.all([due(problemProgress), due(sqlProblemProgress)]);
  return { dsa: dsa.length, sql: sqlDue.length };
}

export async function updateDailyGoal(goal: number) {
  const userId = await requireUserId();
  if (!userId) return;
  const stats = await ensureStats(userId);
  await db.update(userStats).set({ dailyGoal: goal }).where(eq(userStats.id, stats.id));
}

export async function updateProblemOrder(order: ProblemOrder) {
  const userId = await requireUserId();
  if (!userId) return;
  const stats = await ensureStats(userId);
  await db.update(userStats).set({ problemOrder: order }).where(eq(userStats.id, stats.id));
}

export async function updateStreak(streak: number, lastActiveDate: string) {
  const userId = await requireUserId();
  if (!userId) return;
  const stats = await ensureStats(userId);
  await db.update(userStats).set({ streak, lastActiveDate }).where(eq(userStats.id, stats.id));
}

async function upsertProgress(
  table: typeof problemProgress | typeof sqlProblemProgress,
  userId: string,
  problemId: number,
  updates: ProgressUpdate,
) {
  const existing = await db
    .select()
    .from(table)
    .where(and(eq(table.userId, userId), eq(table.problemId, problemId)))
    .limit(1);

  if (!existing[0]) {
    await db.insert(table).values({
      userId,
      problemId,
      status: updates.status ?? "pending",
      attempts: updates.attempts ?? 0,
      notes: updates.notes ?? null,
      solveTime: updates.solveTime ?? 0,
      solvedAt: updates.solvedAt ?? null,
      reviewDate: updates.reviewDate ?? null,
      confidence: updates.confidence ?? null,
    });
    return;
  }

  await db
    .update(table)
    .set(updates)
    .where(and(eq(table.userId, userId), eq(table.problemId, problemId)));
}

export async function updateProblemStatus(id: number, updates: ProgressUpdate) {
  const userId = await requireUserId();
  if (!userId) return;
  await upsertProgress(problemProgress, userId, id, updates);
}

export async function markSolvedAction(
  id: number,
  timeSpent: number,
  confidence: ConfidenceLevel,
  notes?: string,
) {
  const userId = await requireUserId();
  if (!userId) return;
  const existing = await db
    .select()
    .from(problemProgress)
    .where(and(eq(problemProgress.userId, userId), eq(problemProgress.problemId, id)))
    .limit(1);
  const current = existing[0] ?? { attempts: 0, solveTime: 0, notes: null };
  await upsertProgress(problemProgress, userId, id, solvedFields(current, timeSpent, confidence, notes));
}

export async function getSqlProblems() {
  const userId = await requireUserId();
  if (!userId) return [];
  await claimLegacyProgress(userId);

  const [catalog, progress] = await Promise.all([
    db.select().from(sqlProblems),
    db.select().from(sqlProblemProgress).where(eq(sqlProblemProgress.userId, userId)),
  ]);
  const byId = new Map(progress.map((row) => [row.problemId, row]));
  return catalog.map((row) => toSqlProblem(row, byId.get(row.id)));
}

export async function getSqlPrerequisites() {
  const userId = await requireUserId();
  if (!userId) return [];
  await claimLegacyProgress(userId);

  const [catalog, progress] = await Promise.all([
    db.select().from(sqlPrerequisites),
    db.select().from(sqlPrerequisiteProgress).where(eq(sqlPrerequisiteProgress.userId, userId)),
  ]);
  const done = new Set(progress.filter((row) => row.completed).map((row) => row.prerequisiteId));
  return catalog.map((row): SqlPrerequisite => ({
    id: row.id,
    topic: row.topic,
    title: row.title,
    description: row.description,
    docUrl: row.docUrl ?? undefined,
    completed: done.has(row.id),
  }));
}

export async function updateSqlProblemStatus(id: number, updates: ProgressUpdate) {
  const userId = await requireUserId();
  if (!userId) return;
  await upsertProgress(sqlProblemProgress, userId, id, updates);
}

export async function markSqlSolvedAction(
  id: number,
  timeSpent: number,
  confidence: ConfidenceLevel,
  notes?: string,
) {
  const userId = await requireUserId();
  if (!userId) return;
  const existing = await db
    .select()
    .from(sqlProblemProgress)
    .where(and(eq(sqlProblemProgress.userId, userId), eq(sqlProblemProgress.problemId, id)))
    .limit(1);
  const current = existing[0] ?? { attempts: 0, solveTime: 0, notes: null };
  await upsertProgress(sqlProblemProgress, userId, id, solvedFields(current, timeSpent, confidence, notes));
}

export async function togglePrerequisite(id: number, completed: boolean) {
  const userId = await requireUserId();
  if (!userId) return;
  const existing = await db
    .select()
    .from(sqlPrerequisiteProgress)
    .where(and(eq(sqlPrerequisiteProgress.userId, userId), eq(sqlPrerequisiteProgress.prerequisiteId, id)))
    .limit(1);

  if (!existing[0]) {
    await db.insert(sqlPrerequisiteProgress).values({ userId, prerequisiteId: id, completed });
    return;
  }

  await db
    .update(sqlPrerequisiteProgress)
    .set({ completed })
    .where(and(eq(sqlPrerequisiteProgress.userId, userId), eq(sqlPrerequisiteProgress.prerequisiteId, id)));
}
