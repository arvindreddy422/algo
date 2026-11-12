import crypto from "crypto";

const SESSION_COOKIE_NAME = "auth_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export { SESSION_COOKIE_NAME, SESSION_DURATION_MS };

function getSecretKey(): string {
  return process.env.SESSION_SECRET || process.env.AUTH_PASSWORD || "dsa_companion_default_secret_key";
}

function cleanEnvVal(val: string | undefined): string {
  if (!val) return "";
  return val.replace(/^["']|["']$/g, "").trim().toLowerCase();
}

/** Accounts that should always be able to open the admin page. */
export function bootstrapAdminEmails(): string[] {
  const emails = new Set<string>();
  for (const value of [
    process.env.AUTH_USERNAME,
    process.env.NEXT_PUBLIC_AUTH_USERNAME,
    "kum4r18@gmail.com",
    "kumar422@mail.com",
  ]) {
    const cleaned = cleanEnvVal(value);
    if (cleaned) emails.add(cleaned);
  }
  return [...emails];
}

export function isBootstrapAdmin(email: string): boolean {
  return bootstrapAdminEmails().includes(email.trim().toLowerCase());
}

/**
 * Encodes payload into base64url and attaches HMAC signature:
 * token = <base64url(JSON({username, timestamp, mustChangePassword}))>.<signature>
 */
export function generateToken(username: string, mustChangePassword = false): string {
  const timestamp = Date.now();
  const secret = getSecretKey();
  
  const payloadObj = { username, timestamp, mustChangePassword };
  const payloadStr = JSON.stringify(payloadObj);
  const encodedPayload = Buffer.from(payloadStr, "utf-8").toString("base64url");
  
  const signature = crypto
    .createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("hex");
    
  return `${encodedPayload}.${signature}`;
}

export function verifyToken(token: string | undefined): { username: string; mustChangePassword: boolean } | null {
  if (!token) return null;
  
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  
  const [encodedPayload, signature] = parts;
  
  const secret = getSecretKey();
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("hex");
    
  try {
    const isMatch = crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
    if (!isMatch) return null;
  } catch {
    return null;
  }
  
  try {
    const payloadStr = Buffer.from(encodedPayload, "base64url").toString("utf-8");
    const payload = JSON.parse(payloadStr);
    
    if (!payload || typeof payload.timestamp !== "number" || !payload.username) {
      return null;
    }
    
    // Check expiration (7 days)
    if (Date.now() - payload.timestamp > SESSION_DURATION_MS) {
      return null;
    }
    
    return {
      username: payload.username,
      mustChangePassword: payload.mustChangePassword === true,
    };
  } catch {
    return null;
  }
}
