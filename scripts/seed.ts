import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function seed() {
  const { initDb } = await import("../db/init");
  console.log("Seeding catalogs and migrating progress...");
  await initDb();
  console.log("Seeding complete.");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
