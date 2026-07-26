import { db } from "./db";
import { allowedEmails } from "./db/schema";
import { eq } from "drizzle-orm";
import { initDb } from "./db/init";

async function main() {
  await initDb();
  const normalizedEmail = "imgofakr@gmail.com".toLowerCase().trim();
  const allowed = await db
    .select()
    .from(allowedEmails)
    .where(eq(allowedEmails.email, normalizedEmail))
    .limit(1);
    
  console.log("Allowed:", allowed);
}

main().catch(console.error);
