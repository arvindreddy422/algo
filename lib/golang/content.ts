import fs from "fs";
import path from "path";
import { goLevelBySlug } from "@/lib/golang/catalog";

export function readLevelBody(slug: string) {
  const level = goLevelBySlug(slug);
  if (!level) return null;
  const file = path.join(process.cwd(), "golang", `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const body = raw.replace(/^#\s+.+\r?\n+/, "");
  return { level, body };
}
