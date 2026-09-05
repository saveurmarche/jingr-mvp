import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get("phone")?.trim();
  if (!phone || phone.replace(/\s+/g, "").length < 6) {
    return NextResponse.json(
      { ok: false, error: "Indiquez un numéro de téléphone artisan" },
      { status: 400 }
    );
  }

  const jobs = await db.listJobsByPhone(phone);
  return NextResponse.json({
    ok: true,
    phone,
    count: jobs.length,
    jobs: jobs.map((j) => ({
      id: j.id,
      client_name: j.client_name,
      client_address: j.client_address,
      description: j.description,
      status: j.status,
      source: j.source,
      created_at: j.created_at,
      updated_at: j.updated_at,
      draft: j.draft
        ? {
            id: j.draft.id,
            title: j.draft.title,
            status: j.draft.status,
            total_ht: j.draft.total_ht,
            total_ttc: j.draft.total_ttc,
          }
        : null,
      review_token: j.review_token ?? null,
      review_url: j.review_token ? `/review/${j.review_token}` : null,
    })),
  });
}
