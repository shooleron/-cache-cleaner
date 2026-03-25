import crypto from "crypto";
import { NextRequest } from "next/server";

export const SESSION_COOKIE = "alt-admin-session";

export function makeToken(password: string): string {
  return crypto
    .createHmac("sha256", password)
    .update("alt-admin-v1")
    .digest("hex");
}

export function verifySession(request: NextRequest): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  const session = request.cookies.get(SESSION_COOKIE)?.value;
  if (!session) return false;
  return session === makeToken(adminPassword);
}
