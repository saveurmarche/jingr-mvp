import { createHmac, timingSafeEqual } from "crypto";

/**
 * Client minimal WhatsApp Cloud API (Meta).
 * Env : WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_APP_SECRET, WHATSAPP_VERIFY_TOKEN.
 */

const GRAPH = "https://graph.facebook.com/v21.0";

export function whatsappConfigured(): boolean {
  return Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

/** Vérifie l'en-tête X-Hub-Signature-256. Sans secret configuré, on refuse. */
export function verifySignature(rawBody: string, header: string | null): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret || !header?.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const given = header.slice("sha256=".length);
  if (given.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}

export async function sendText(to: string, body: string): Promise<void> {
  if (!whatsappConfigured()) {
    console.log(`[whatsapp:dry-run] → ${to}\n${body}`);
    return;
  }
  const res = await fetch(`${GRAPH}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body, preview_url: true },
    }),
  });
  if (!res.ok) {
    console.error("WhatsApp sendText", res.status, await res.text());
  }
}

/** Télécharge un média (vocal, photo) reçu par webhook. */
export async function downloadMedia(
  mediaId: string
): Promise<{ buffer: Buffer; mime: string } | null> {
  if (!whatsappConfigured()) return null;
  const auth = { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` };
  const meta = await fetch(`${GRAPH}/${mediaId}`, { headers: auth });
  if (!meta.ok) return null;
  const { url, mime_type } = (await meta.json()) as { url?: string; mime_type?: string };
  if (!url) return null;
  const file = await fetch(url, { headers: auth });
  if (!file.ok) return null;
  return {
    buffer: Buffer.from(await file.arrayBuffer()),
    mime: mime_type || file.headers.get("content-type") || "application/octet-stream",
  };
}

export type MetaMessage = {
  id: string;
  from: string;
  type: string;
  text?: { body: string };
  audio?: { id: string; mime_type?: string };
  image?: { id: string; mime_type?: string; caption?: string };
};

/** Sous-ensemble du payload webhook Meta qui nous intéresse. */
export type MetaWebhook = {
  object?: string;
  entry?: Array<{
    changes?: Array<{
      value?: {
        contacts?: Array<{ wa_id: string; profile?: { name?: string } }>;
        messages?: MetaMessage[];
      };
    }>;
  }>;
};
