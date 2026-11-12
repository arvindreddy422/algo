import { sql } from "drizzle-orm";
import { db } from "@/db";

export async function ensureProgressSchema() {
  try {
    await db.run(sql`ALTER TABLE user_stats ADD COLUMN user_id TEXT`);
  } catch {
    /* column already exists */
  }

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS problem_progress (
      user_id TEXT NOT NULL,
      problem_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      attempts INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      solve_time INTEGER DEFAULT 0,
      solved_at TEXT,
      review_date TEXT,
      confidence INTEGER,
      PRIMARY KEY (user_id, problem_id)
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS sql_problem_progress (
      user_id TEXT NOT NULL,
      problem_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      attempts INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      solve_time INTEGER DEFAULT 0,
      solved_at TEXT,
      review_date TEXT,
      confidence INTEGER,
      PRIMARY KEY (user_id, problem_id)
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS sql_prerequisite_progress (
      user_id TEXT NOT NULL,
      prerequisite_id INTEGER NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (user_id, prerequisite_id)
    )
  `);
}
