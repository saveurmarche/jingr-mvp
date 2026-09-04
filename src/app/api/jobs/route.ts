import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { generateDraftForJob } from "@/lib/draft-pipeline";

const schema = z.object({
  artisan_name: z.string().min(1),
  artisan_phone: z.string().min(6),
  artisan_trade: z.string().optional(),
  company_name: z.string().optional(),
  client_name: z.string().min(1),
  client_address: z.string().optional(),
  client_phone: z.string().optional(),
  description: z.string().min(5),
  urgency: z.string().optional(),
  source: z.string().optional(),
  auto_draft: z.boolean().optional().default(true),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const artisan = await db.findOrCreateArtisan({
      name: data.artisan_name,
      phone: data.artisan_phone,
      trade: data.artisan_trade,
      company_name: data.company_name,
    });

    const job = await db.createJob({
      artisan_id: artisan.id,
      client_name: data.client_name,
      client_address: data.client_address,
      client_phone: data.client_phone,
      description: data.description,
      urgency: data.urgency,
      source: data.source ?? "web",
    });

    let reviewToken: string | null = null;
    let draftId: string | null = null;

    if (data.auto_draft !== false) {
      const result = await generateDraftForJob(job.id);
      reviewToken = result.reviewToken;
      draftId = result.draft.id;
    }

    return NextResponse.json({
      ok: true,
      job_id: job.id,
      draft_id: draftId,
      review_token: reviewToken,
      review_url: reviewToken ? `/review/${reviewToken}` : null,
      db_mode: db.mode(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}

export async function GET() {
  const jobs = await db.listJobs();
  return NextResponse.json({ ok: true, jobs, db_mode: db.mode() });
}
