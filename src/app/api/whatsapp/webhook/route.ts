import { checkOpsPassword } from "@/lib/ops-auth";
import { NextRequest, NextResponse, after } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { handleIncoming, type IncomingMessage } from "@/lib/intake";
import {
  downloadMedia,
  sendText,
  verifySignature,
  type MetaMessage,
  type MetaWebhook,
} from "@/lib/whatsapp";

/**
 * Webhook WhatsApp.
 *
 * - GET  : vérification Meta (hub.challenge).
 * - POST : payload Meta Cloud API (signé) → vocal/texte/photo → devis → réponse WhatsApp avec le lien.
 * - POST : mode test JSON (WHATSAPP_TEST_MODE !== "false"), pratique en local :
 *   { "from": "+33600000000", "artisan_name": "Dupont Plomberie", "body": "Mme Dupont, 12 rue …, chauffe-eau HS",
 *     "audio": "<base64 ogg optionnel>" }
 *
 * Jamais d'envoi au client final : on ne répond qu'à l'artisan.
 */

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  if (
    p.get("hub.mode") === "subscribe" &&
    p.get("hub.verify_token") &&
    p.get("hub.verify_token") === process.env.WHATSAPP_VERIFY_TOKEN
  ) {
    return new NextResponse(p.get("hub.challenge") ?? "", { status: 200 });
  }
  return NextResponse.json({ ok: false }, { status: 403 });
}

const testSchema = z.object({
  from: z.string().min(6),
  body: z.string().optional().default(""),
  artisan_name: z.string().optional(),
  audio: z.string().optional(),
  audio_mime: z.string().optional(),
});

async function toIncoming(
  m: MetaMessage,
  profileName?: string
): Promise<IncomingMessage> {
  const msg: IncomingMessage = {
    channel: "whatsapp",
    external_id: m.id,
    from: `+${m.from.replace(/^\+/, "")}`,
    profile_name: profileName,
  };
  if (m.type === "text" && m.text) msg.text = m.text.body;
  if (m.type === "audio" && m.audio) {
    const media = await downloadMedia(m.audio.id);
    if (media) msg.audio = media;
  }
  if (m.type === "image" && m.image) {
    const media = await downloadMedia(m.image.id);
    if (media) msg.images = [{ ...media, caption: m.image.caption }];
    else if (m.image.caption) msg.text = m.image.caption;
  }
  return msg;
}

async function processMeta(payload: MetaWebhook) {
  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      for (const m of value?.messages ?? []) {
        if (await db.inboxHasExternalId(m.id)) continue;
        const profile = value?.contacts?.find((c) => c.wa_id === m.from)?.profile?.name;
        try {
          const incoming = await toIncoming(m, profile);
          const result = await handleIncoming(incoming);
          await sendText(incoming.from, result.reply);
        } catch (err) {
          console.error("WhatsApp message en échec", m.id, err);
          await sendText(
            `+${m.from}`,
            "Oups, je n'ai pas réussi à préparer ce devis. Réessayez dans un instant ou envoyez le chantier par écrit."
          );
        }
      }
    }
  }
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: "JSON invalide" }, { status: 400 });
  }

  // Production : payload Meta
  if ((json as MetaWebhook).object === "whatsapp_business_account") {
    if (!verifySignature(raw, req.headers.get("x-hub-signature-256"))) {
      return NextResponse.json({ ok: false, error: "Signature invalide" }, { status: 401 });
    }
    // Meta exige un 200 rapide : le traitement (transcription + IA) se fait après la réponse.
    after(() => processMeta(json as MetaWebhook));
    return NextResponse.json({ ok: true });
  }

  // Mode test JSON. En production il exige le mot de passe ops : sinon n'importe qui pourrait
  // créer des devis (crédit IA) ou envoyer STOP au nom d'un artisan.
  if (process.env.WHATSAPP_TEST_MODE === "false") {
    return NextResponse.json({ ok: false, error: "Mode test désactivé" }, { status: 403 });
  }
  if (process.env.NODE_ENV === "production" && !checkOpsPassword(req.headers.get("x-ops-password"))) {
    return NextResponse.json({ ok: false, error: "Mode test réservé (x-ops-password)" }, { status: 401 });
  }
  try {
    const data = testSchema.parse(json);
    const result = await handleIncoming({
      channel: "whatsapp",
      from: data.from,
      profile_name: data.artisan_name,
      text: data.body,
      audio: data.audio
        ? { buffer: Buffer.from(data.audio, "base64"), mime: data.audio_mime || "audio/ogg" }
        : undefined,
    });
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error, reply: result.reply }, { status: 400 });
    }
    return NextResponse.json({
      ok: true,
      test_mode: true,
      job_id: result.job_id,
      review_token: result.review_token,
      review_url: `/review/${result.review_token}`,
      reply: result.reply,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
