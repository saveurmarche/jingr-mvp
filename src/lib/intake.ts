import { db } from "./db";
import { extractJobFromMessage, transcribeAudio } from "./ai";
import { generateDraftForJob } from "./draft-pipeline";
import { saveUploadBuffer } from "./uploads";

/**
 * Point d'entrée unique « un artisan nous envoie un chantier » quel que soit le canal.
 * Inscription implicite : un numéro inconnu crée un compte artisan. Zéro formulaire.
 */

export type IncomingMessage = {
  channel: "whatsapp" | "web";
  external_id?: string;
  from: string;
  profile_name?: string;
  text?: string;
  audio?: { buffer: Buffer; mime: string };
  images?: Array<{ buffer: Buffer; mime: string; caption?: string }>;
};

export type IntakeResult =
  | { ok: true; job_id: string; review_token: string; review_url: string; reply: string }
  | { ok: false; reply: string; error: string };

export function appUrl(): string {
  return (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

const FREE_DRAFTS = Number(process.env.FREE_DRAFTS || 10);
const REFERRAL_AT = 3;

function eur(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
}

export async function handleIncoming(msg: IncomingMessage): Promise<IntakeResult> {
  let text = msg.text?.trim() || "";
  if (msg.audio) {
    const transcript = await transcribeAudio(msg.audio.buffer, msg.audio.mime);
    if (transcript) text = [text, transcript].filter(Boolean).join("\n");
  }
  const captions = (msg.images || []).map((i) => i.caption).filter(Boolean);
  text = [text, ...captions].filter(Boolean).join("\n").trim();

  if (text.length < 5) {
    return {
      ok: false,
      error: "message_vide",
      reply:
        "Bonjour 👋 Je suis jingr. Envoyez-moi un vocal ou un message avec : le client, l'adresse et les travaux. Je vous renvoie un devis prêt à relire en quelques minutes.",
    };
  }

  const isNew = !(await db.listJobsByPhone(msg.from)).length;
  const artisan = await db.findOrCreateArtisan({
    name: msg.profile_name || "Artisan",
    phone: msg.from,
  });

  const extracted = await extractJobFromMessage(text);
  const job = await db.createJob({
    artisan_id: artisan.id,
    client_name: extracted.client_name,
    client_address: extracted.client_address,
    client_phone: extracted.client_phone,
    description: extracted.description,
    source: msg.channel,
  });

  for (const img of msg.images || []) {
    const saved = await saveUploadBuffer(img.buffer, { mime: img.mime });
    await db.addAsset({ job_id: job.id, kind: "photo", url: saved.url, note: img.caption });
  }

  await db.inboxInsert({
    channel: msg.channel,
    from_phone: msg.from,
    body: text,
    raw: { external_id: msg.external_id ?? null, had_audio: Boolean(msg.audio) },
    job_id: job.id,
  });

  const { draft, reviewToken } = await generateDraftForJob(job.id);
  const reviewUrl = `${appUrl()}/review/${reviewToken}`;
  const count = await db.countDraftsForArtisan(artisan.id);

  const lines = [
    `✅ Devis prêt : ${draft.title}`,
    `${draft.line_items.length} lignes · ${eur(draft.total_ttc)} TTC`,
    "",
    `Relisez, corrigez et validez ici : ${reviewUrl}`,
    "Rien n'est envoyé à votre client sans votre validation.",
  ];
  if (isNew) {
    lines.push(
      "",
      "Astuce : réglez votre marge, votre TVA et votre SIRET une fois pour toutes depuis le lien ci-dessus."
    );
  }
  if (count === REFERRAL_AT) {
    lines.push(
      "",
      `🎁 Un collègue artisan perd ses soirées sur ses devis ? Transférez-lui ce numéro : vous gagnez chacun 1 mois offert.`
    );
  }
  const payLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;
  if (count === FREE_DRAFTS && payLink) {
    lines.push(
      "",
      `Vous avez utilisé vos ${FREE_DRAFTS} devis offerts. Pour continuer sans limite : ${payLink}`
    );
  }

  return {
    ok: true,
    job_id: job.id,
    review_token: reviewToken,
    review_url: reviewUrl,
    reply: lines.join("\n"),
  };
}
