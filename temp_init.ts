import { initDb } from "./db/init";

initDb().then(() => {
  console.log("DB initialized successfully.");
  process.exit(0);
}).catch(err => {
  console.error("Failed:", err);
  process.exit(1);
});
