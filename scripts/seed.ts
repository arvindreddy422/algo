import { db } from "../db";
import { problems, userStats } from "../db/schema";
import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function seed() {
  console.log("Seeding database...");
  
  // Read JSON
  const dataPath = path.join(__dirname, "../data/grind169.json");
  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  
  // Insert problems
  console.log(`Inserting ${data.length} problems...`);
  await db.insert(problems).values(data).onConflictDoNothing();
  
  // Initialize user settings
  const existingStats = await db.select().from(userStats).limit(1);
  if (existingStats.length === 0) {
    console.log("Initializing user stats...");
    await db.insert(userStats).values({
      dailyGoal: 3,
      streak: 0,
    });
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((e) => {
  console.error("Seeding failed:", e);
  process.exit(1);
});
