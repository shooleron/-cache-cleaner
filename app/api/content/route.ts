import { NextRequest, NextResponse } from "next/server";
import { readContent, writeContent } from "@/lib/content";
import { verifySession } from "@/lib/auth";

// GET /api/content — public, serves site content
export async function GET() {
  return NextResponse.json(readContent());
}

// POST /api/content — protected, saves content
export async function POST(request: NextRequest) {
  if (!verifySession(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const content = await request.json();
  writeContent(content);
  return NextResponse.json({ ok: true });
}
