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
const PIONEER_TRIAL_DAYS = 90;
const REFERRAL_AT = 3;
const TESTIMONIAL_AT = 5;
const TESTIMONIAL_RE = /^\s*avis\s*[:：-]?\s*/i;

function eur(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
}

export async function handleIncoming(msg: IncomingMessage): Promise<IntakeResult> {
  let text = msg.text?.trim() || "";
  let audioFailed = false;
  if (msg.audio) {
    const transcript = await transcribeAudio(msg.audio.buffer, msg.audio.mime);
    if (transcript) text = [text, transcript].filter(Boolean).join("\n");
    else audioFailed = true;
  }
  const captions = (msg.images || []).map((i) => i.caption).filter(Boolean);
  text = [text, ...captions].filter(Boolean).join("\n").trim();

  if (/^\s*supprimer\s+mon\s+compte/i.test(text)) {
    await db.inboxInsert({
      channel: msg.channel,
      from_phone: msg.from,
      body: text,
      raw: { kind: "deletion_request", external_id: msg.external_id ?? null },
    });
    return {
      ok: false,
      error: "suppression_demandee",
      reply:
        "Demande de suppression bien reçue. Votre compte et vos chantiers seront supprimés sous 30 jours maximum. Pensez à télécharger vos factures avant : la loi vous impose de les conserver 10 ans.",
    };
  }

  // STOP / REPRENDRE : l'artisan met l'agent en pause pour lui seul.
  if (/^\s*(stop|pause)\s*$/i.test(text) || /^\s*reprendre\s*$/i.test(text)) {
    const resume = /reprendre/i.test(text);
    const known = await db.findArtisanByPhone(msg.from);
    if (known) await db.updateArtisan(known.id, { paused: !resume });
    return {
      ok: false,
      error: resume ? "agent_repris" : "agent_en_pause",
      reply: resume
        ? "C'est reparti 👍 Envoyez-moi un vocal pour votre prochain devis."
        : "jingr est en pause pour vous : je ne traiterai plus vos messages. Écrivez « REPRENDRE » quand vous voulez.",
    };
  }

  // Interrupteur global : AGENT_ENABLED=false coupe l'IA pour tout le monde, le message est gardé.
  const paused = (await db.findArtisanByPhone(msg.from))?.paused;
  if (process.env.AGENT_ENABLED === "false" || paused) {
    if (text) {
      await db.inboxInsert({
        channel: msg.channel,
        from_phone: msg.from,
        body: text,
        raw: { kind: paused ? "artisan_paused" : "agent_disabled", external_id: msg.external_id ?? null },
      });
    }
    return {
      ok: false,
      error: paused ? "agent_en_pause" : "agent_desactive",
      reply: paused
        ? "jingr est en pause pour vous. Écrivez « REPRENDRE » pour le réactiver."
        : `L'assistant jingr est momentanément en pause. Votre message est bien reçu ; vous pouvez aussi faire votre devis sur ${appUrl()}/go.`,
    };
  }

  if (/^\s*retirer\s+avis/i.test(text)) {
    const known = (await db.listJobsByPhone(msg.from))[0]?.artisan;
    if (known) await db.withdrawTestimonials(known.id);
    return { ok: false, error: "avis_retire", reply: "C'est fait : votre avis est supprimé de jingr.ai." };
  }

  // « AVIS : … » = témoignage, pas un chantier
  if (TESTIMONIAL_RE.test(text)) {
    const body = text.replace(TESTIMONIAL_RE, "").trim();
    const known = (await db.listJobsByPhone(msg.from))[0]?.artisan;
    if (!known || body.length < 10) {
      return {
        ok: false,
        error: "avis_invalide",
        reply: "Merci ! Pour laisser un avis, écrivez « AVIS : » suivi de votre phrase, après avoir fait au moins un devis.",
      };
    }
    await db.addTestimonial({ artisan: known, text: body.slice(0, 400) });
    return {
      ok: false,
      error: "avis_enregistre",
      reply: "Merci beaucoup 🙏 Votre avis sera relu puis publié sur jingr.ai (prénom, initiale du nom et métier uniquement). Répondez « RETIRER AVIS » à tout moment pour le supprimer.",
    };
  }

  if (text.length < 5 && audioFailed) {
    return {
      ok: false,
      error: "vocal_illisible",
      reply:
        "Désolé, je n'ai pas réussi à écouter votre vocal 🙏 Pouvez-vous le renvoyer, ou écrire en quelques mots : le client, l'adresse et les travaux ?",
    };
  }

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
    ...(() => {
      const n = draft.line_items.filter((i) => i.price_source === "estimate").length;
      return n ? [`⚠️ ${n} prix proposé${n > 1 ? "s" : ""} par jingr, à confirmer (en orange).`] : [];
    })(),
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
  if (count === TESTIMONIAL_AT) {
    lines.push(
      "",
      "Déjà 5 devis 💪 Une phrase sur jingr pour aider d'autres artisans ? Répondez « AVIS : » suivi de votre avis (publié avec votre prénom et votre métier)."
    );
  }
  // Passage au payant, proposé une seule fois :
  // - pionniers (les PIONEER_SPOTS premiers inscrits) : à la fin des 3 mois offerts, au prix pionnier ;
  // - autres artisans : après FREE_DRAFTS devis, au prix normal.
  // Un pionnier ne reçoit jamais le lien au prix normal.
  const pioneerSpots = Number(process.env.PIONEER_SPOTS || 10);
  const isPioneer = (await db.artisanRank(artisan.id)) <= pioneerSpots;
  const trialOver = isPioneer
    ? Date.now() - new Date(artisan.created_at).getTime() >= PIONEER_TRIAL_DAYS * 86_400_000
    : count >= FREE_DRAFTS;
  if (trialOver && !artisan.billing_notified_at) {
    const payLink = isPioneer
      ? process.env.NEXT_PUBLIC_STRIPE_PIONEER_LINK
      : process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;
    const pioneerPrice = process.env.NEXT_PUBLIC_PIONEER_PRICE || "39";
    const intro = isPioneer
      ? `Vos 3 mois offerts sont terminés : merci d'avoir testé jingr avec nous 🙏 En tant que pionnier, vous gardez ${pioneerPrice} € HT / mois à vie.`
      : `Vous avez utilisé vos ${FREE_DRAFTS} devis offerts.`;
    if (payLink) {
      lines.push("", `${intro} Pour continuer : ${payLink}`);
      await db.updateArtisan(artisan.id, { billing_notified_at: new Date().toISOString() });
    } else if (isPioneer) {
      lines.push("", `${intro} On vous envoie votre lien sous 24 h ; continuez vos devis en attendant.`);
      await db.updateArtisan(artisan.id, { billing_notified_at: new Date().toISOString() });
      await db.inboxInsert({
        channel: msg.channel,
        from_phone: msg.from,
        body: "Pionnier en fin de période offerte : lui envoyer le lien de paiement pionnier.",
        raw: { kind: "pioneer_payment_pending", artisan_id: artisan.id },
      });
    }
  }

  return {
    ok: true,
    job_id: job.id,
    review_token: reviewToken,
    review_url: reviewUrl,
    reply: lines.join("\n"),
  };
}
