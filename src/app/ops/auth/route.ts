import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const password = String(body.password || "");
  const expected = process.env.OPS_PASSWORD || "jingr-ops";
  if (password !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
