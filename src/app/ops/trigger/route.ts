import { NextRequest, NextResponse } from "next/server";
import { generateDraftForJob } from "@/lib/draft-pipeline";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const password = String(body.password || "");
  const expected = process.env.OPS_PASSWORD || "jingr-ops";
  if (password !== expected) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const jobId = String(body.job_id || "");
  if (!jobId) {
    return NextResponse.json({ ok: false, error: "job_id requis" }, { status: 400 });
  }
  try {
    const result = await generateDraftForJob(jobId);
    return NextResponse.json({
      ok: true,
      draft_id: result.draft.id,
      review_token: result.reviewToken,
      review_url: `/review/${result.reviewToken}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
