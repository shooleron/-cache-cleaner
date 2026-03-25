import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "./lib/auth";

// Web Crypto API — works in Edge runtime
async function makeTokenEdge(password: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(password),
    { name: "HMAC", hash: "SHA-256" },
    false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode("alt-admin-v1"));
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") return NextResponse.next();

  if (pathname.startsWith("/admin")) {
    const adminPassword = process.env.ADMIN_PASSWORD;
    const session = request.cookies.get(SESSION_COOKIE)?.value;

    if (!adminPassword || !session) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    const expected = await makeTokenEdge(adminPassword);
    if (session !== expected) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
