import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { generateDraftForJob } from "@/lib/draft-pipeline";

/**
 * TEST_MODE WhatsApp webhook.
 * Accepts JSON instead of Meta signature verification.
 * Example body:
 * {
 *   "from": "+33600000000",
 *   "artisan_name": "Dupont Plomberie",
 *   "body": "Mme Dupont, 12 rue Victor Hugo Lyon, chauffe-eau HS"
 * }
 */
const schema = z.object({
  from: z.string().min(6),
  body: z.string().min(3),
  artisan_name: z.string().optional(),
  test_mode: z.boolean().optional().default(true),
});

function parseBody(text: string) {
  // naive parse: "Client, adresse, description"
  const parts = text.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 3) {
    return {
      client_name: parts[0],
      client_address: parts[1],
      description: parts.slice(2).join(", "),
    };
  }
  return {
    client_name: "Client WhatsApp",
    client_address: undefined as string | undefined,
    description: text,
  };
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const data = schema.parse(json);

    if (process.env.WHATSAPP_TEST_MODE === "false" && !data.test_mode) {
      return NextResponse.json(
        { ok: false, error: "Production WhatsApp non configuré dans ce MVP" },
        { status: 501 }
      );
    }

    const parsed = parseBody(data.body);
    const artisan = await db.findOrCreateArtisan({
      name: data.artisan_name || "Artisan WhatsApp",
      phone: data.from,
      trade: "plomberie",
    });

    const job = await db.createJob({
      artisan_id: artisan.id,
      client_name: parsed.client_name,
      client_address: parsed.client_address,
      description: parsed.description,
      source: "whatsapp",
    });

    await db.inboxInsert({
      channel: "whatsapp",
      from_phone: data.from,
      body: data.body,
      raw: json,
      job_id: job.id,
    });

    const result = await generateDraftForJob(job.id);

    return NextResponse.json({
      ok: true,
      test_mode: true,
      job_id: job.id,
      draft_id: result.draft.id,
      review_token: result.reviewToken,
      review_url: `/review/${result.reviewToken}`,
      message:
        "Brouillon prêt. Jamais d'envoi auto au client — validation humaine requise.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
