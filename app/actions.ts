"use server";

import { db } from "@/db";
import { problems, userStats } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ConfidenceLevel, Problem } from "@/types";

export async function getProblems() {
  const result = await db.select().from(problems);
  return result;
}

export async function getUserStats() {
  const result = await db.select().from(userStats).limit(1);
  return result[0];
}

export async function updateDailyGoal(goal: number) {
  const stats = await getUserStats();
  if (stats) {
    await db.update(userStats).set({ dailyGoal: goal }).where(eq(userStats.id, stats.id));
  }
}

export async function updateStreak(streak: number, lastActiveDate: string) {
  const stats = await getUserStats();
  if (stats) {
    await db.update(userStats).set({ streak, lastActiveDate }).where(eq(userStats.id, stats.id));
  }
}

export async function updateProblemStatus(id: number, updates: Partial<Problem>) {
  await db.update(problems).set(updates).where(eq(problems.id, id));
}

export async function markSolvedAction(id: number, timeSpent: number, confidence: ConfidenceLevel, notes?: string, nextReview?: string) {
  const pList = await db.select().from(problems).where(eq(problems.id, id));
  if (pList.length === 0) return;
  const p = pList[0];
  
  await db.update(problems).set({
    status: 'solved',
    attempts: p.attempts + 1,
    solveTime: (p.solveTime || 0) + timeSpent,
    solvedAt: new Date().toISOString(),
    reviewDate: nextReview,
    confidence,
    notes: notes ?? p.notes
  }).where(eq(problems.id, id));
}
