import { sqliteTable, integer, text, primaryKey } from "drizzle-orm/sqlite-core";

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
  userId: text("user_id"),
  dailyGoal: integer("daily_goal").notNull().default(3),
  streak: integer("streak").notNull().default(0),
  lastActiveDate: text("last_active_date"),
  problemOrder: text("problem_order", { enum: ["EasyFirst", "HardFirst"] }).notNull().default("EasyFirst"),
});

export const problemProgress = sqliteTable("problem_progress", {
  userId: text("user_id").notNull(),
  problemId: integer("problem_id").notNull(),
  status: text("status", { enum: ["pending", "solved", "bookmarked", "review", "skipped"] }).notNull().default("pending"),
  attempts: integer("attempts").notNull().default(0),
  notes: text("notes"),
  solveTime: integer("solve_time").default(0),
  solvedAt: text("solved_at"),
  reviewDate: text("review_date"),
  confidence: integer("confidence"),
}, (table) => [primaryKey({ columns: [table.userId, table.problemId] })]);

export const sqlProblemProgress = sqliteTable("sql_problem_progress", {
  userId: text("user_id").notNull(),
  problemId: integer("problem_id").notNull(),
  status: text("status", { enum: ["pending", "solved", "bookmarked", "review", "skipped"] }).notNull().default("pending"),
  attempts: integer("attempts").notNull().default(0),
  notes: text("notes"),
  solveTime: integer("solve_time").default(0),
  solvedAt: text("solved_at"),
  reviewDate: text("review_date"),
  confidence: integer("confidence"),
}, (table) => [primaryKey({ columns: [table.userId, table.problemId] })]);

export const sqlPrerequisiteProgress = sqliteTable("sql_prerequisite_progress", {
  userId: text("user_id").notNull(),
  prerequisiteId: integer("prerequisite_id").notNull(),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
}, (table) => [primaryKey({ columns: [table.userId, table.prerequisiteId] })]);

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

export const dailyLogs = sqliteTable("daily_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  url: text("url"),
  approach: text("approach").notNull(),
  notes: text("notes"),
  difficulty: text("difficulty", { enum: ["Easy", "Medium", "Hard"] }),
  topic: text("topic"),
  logDate: text("log_date").notNull(),
  addedBy: text("added_by").notNull(),
  updatedBy: text("updated_by"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  name: text("name"),
  image: text("image"),
  role: text("role").notNull().default("user"),
  createdAt: text("created_at").notNull(),
  passwordHash: text("password_hash"),
  mustChangePassword: integer("must_change_password", { mode: "boolean" }).notNull().default(false),
});

export const allowedEmails = sqliteTable("allowed_emails", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull(),
  addedAt: text("added_at").notNull(),
  addedBy: text("added_by"),
});

