export const MEMBER_HOME = "/notes";

const ADMIN_PREFIXES = ["/bookmarks", "/review", "/completed", "/stats", "/problem", "/sql", "/pdfs"];

export function isAdminOnlyPath(pathname: string) {
  if (pathname === "/") return true;
  return ADMIN_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function homeForRole(role: "admin" | "user" | string | null | undefined) {
  return role === "admin" ? "/" : MEMBER_HOME;
}
