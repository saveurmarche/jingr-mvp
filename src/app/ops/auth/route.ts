import { NextRequest, NextResponse } from "next/server";
import { checkOpsPassword } from "@/lib/ops-auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const password = String(body.password || "");
  if (!checkOpsPassword(password)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
