import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const problems = sqliteTable("problems", {
  id: integer("id").primaryKey(),
  title: text("title").notNull(),
  difficulty: text("difficulty", { enum: ["Easy", "Medium", "Hard"] }).notNull(),
  topics: text("topics", { mode: 'json' }).$type<string[]>().notNull(),
  companyTags: text("company_tags", { mode: 'json' }).$type<string[]>(),
  url: text("url").notNull(),
  
  status: text("status", { enum: ["pending", "solved", "bookmarked", "review", "skipped"] }).notNull().default("pending"),
  attempts: integer("attempts").notNull().default(0),
  notes: text("notes"),
  solveTime: integer("solve_time").default(0),
  solvedAt: text("solved_at"),
  reviewDate: text("review_date"),
  confidence: integer("confidence"),
});

export const userStats = sqliteTable("user_stats", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  dailyGoal: integer("daily_goal").notNull().default(3),
  streak: integer("streak").notNull().default(0),
  lastActiveDate: text("last_active_date"),
  problemOrder: text("problem_order", { enum: ["EasyFirst", "HardFirst"] }).notNull().default("EasyFirst"),
});

export const sqlProblems = sqliteTable("sql_problems", {
  id: integer("id").primaryKey(),
  title: text("title").notNull(),
  difficulty: text("difficulty", { enum: ["Easy", "Medium", "Hard"] }).notNull(),
  topics: text("topics", { mode: 'json' }).$type<string[]>().notNull(),
  companyTags: text("company_tags", { mode: 'json' }).$type<string[]>(),
  url: text("url").notNull(),
  source: text("source", { enum: ["LeetCode", "DataLemur", "StratasScratch", "Conceptual"] }).notNull().default("LeetCode"),
  prerequisiteTopics: text("prerequisite_topics", { mode: 'json' }).$type<string[]>(),

  status: text("status", { enum: ["pending", "solved", "bookmarked", "review", "skipped"] }).notNull().default("pending"),
  attempts: integer("attempts").notNull().default(0),
  notes: text("notes"),
  solveTime: integer("solve_time").default(0),
  solvedAt: text("solved_at"),
  reviewDate: text("review_date"),
  confidence: integer("confidence"),
});

export const sqlPrerequisites = sqliteTable("sql_prerequisites", {
  id: integer("id").primaryKey(),
  topic: text("topic").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  docUrl: text("doc_url"),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
});

