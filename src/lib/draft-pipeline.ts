import { randomUUID } from "crypto";
import { db } from "./db";
import type { Job, QuoteDraft, QuoteLineItem } from "./types";

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function totals(items: QuoteLineItem[]) {
  const total_ht = round2(
    items.reduce((sum, i) => sum + i.quantity * i.unit_price_ht, 0)
  );
  const total_tva = round2(
    items.reduce(
      (sum, i) => sum + i.quantity * i.unit_price_ht * (i.tva_rate / 100),
      0
    )
  );
  return { total_ht, total_tva, total_ttc: round2(total_ht + total_tva) };
}

function mockLineItems(job: Job): QuoteLineItem[] {
  const desc = job.description.toLowerCase();
  const items: QuoteLineItem[] = [];

  const push = (
    label: string,
    quantity: number,
    unit: string,
    unit_price_ht: number,
    tva_rate = 10
  ) => {
    items.push({
      id: randomUUID(),
      label,
      quantity,
      unit,
      unit_price_ht,
      tva_rate,
    });
  };

  if (desc.includes("chauffe") || desc.includes("ballon") || desc.includes("eau chaude")) {
    push("Dépose ancien chauffe-eau", 1, "forfait", 85);
    push("Fourniture chauffe-eau électrique 200L", 1, "u", 420);
    push("Pose et raccordements hydrauliques / électriques", 1, "forfait", 280);
    push("Mise en service et essai", 1, "forfait", 65);
    push("Évacuation ancien appareil", 1, "forfait", 45);
  } else if (desc.includes("fuite") || desc.includes("robinet") || desc.includes("wc")) {
    push("Diagnostic et localisation de fuite", 1, "forfait", 75);
    push("Fourniture pièces (joints / robinetterie)", 1, "forfait", 55);
    push("Main d'œuvre réparation", 1.5, "h", 65);
    push("Essai d'étanchéité", 1, "forfait", 35);
  } else if (desc.includes("chaudière") || desc.includes("radiateur") || desc.includes("chauffage")) {
    push("Diagnostic chaudière / circuit chauffage", 1, "forfait", 95);
    push("Fourniture pièces détachées", 1, "forfait", 120);
    push("Intervention technicien chauffage", 2, "h", 75);
    push("Purge et équilibrage", 1, "forfait", 55);
  } else {
    push("Déplacement et diagnostic", 1, "forfait", 69);
    push("Main d'œuvre plomberie", 2, "h", 65);
    push("Fournitures diverses", 1, "forfait", 48);
  }

  return items;
}

async function openaiLineItems(job: Job): Promise<QuoteLineItem[] | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  try {
    const OpenAI = (await import("openai")).default;
    const client = new OpenAI({ apiKey: key });
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Tu es un assistant devis pour artisans plombiers/chauffagistes en France. Réponds en JSON: {\"title\":\"...\",\"intro\":\"...\",\"notes\":\"...\",\"line_items\":[{\"label\":\"...\",\"quantity\":1,\"unit\":\"forfait|h|u\",\"unit_price_ht\":0,\"tva_rate\":10}]}. Prix réalistes HT, TVA 10% rénovation. Jamais envoyer au client.",
        },
        {
          role: "user",
          content: `Client: ${job.client_name}\nAdresse: ${job.client_address || "n/c"}\nDescription chantier: ${job.description}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      title?: string;
      intro?: string;
      notes?: string;
      line_items?: Array<{
        label: string;
        quantity: number;
        unit: string;
        unit_price_ht: number;
        tva_rate?: number;
      }>;
    };
    if (!parsed.line_items?.length) return null;

    // stash meta on globalThis-like return via side channel
    (openaiLineItems as unknown as { _meta?: typeof parsed })._meta = parsed;

    return parsed.line_items.map((li) => ({
      id: randomUUID(),
      label: li.label,
      quantity: Number(li.quantity) || 1,
      unit: li.unit || "forfait",
      unit_price_ht: Number(li.unit_price_ht) || 0,
      tva_rate: Number(li.tva_rate ?? 10),
    }));
  } catch (err) {
    console.error("OpenAI draft failed, falling back to mock", err);
    return null;
  }
}

export async function generateDraftForJob(jobId: string): Promise<{
  draft: QuoteDraft;
  reviewToken: string;
}> {
  const job = await db.getJob(jobId);
  if (!job) throw new Error("Job introuvable");

  await db.updateJobStatus(jobId, "processing");

  let lineItems = await openaiLineItems(job);
  const meta = (openaiLineItems as unknown as { _meta?: { title?: string; intro?: string; notes?: string } })._meta;
  if (!lineItems) {
    lineItems = mockLineItems(job);
  }

  const sums = totals(lineItems);
  const title =
    meta?.title ||
    `Devis — ${job.client_name}${job.description.toLowerCase().includes("chauffe") ? " — Remplacement chauffe-eau" : ""}`;

  const draft = await db.saveDraft({
    job_id: jobId,
    title,
    intro:
      meta?.intro ||
      `Madame, Monsieur,\n\nSuite à votre demande concernant « ${job.description.slice(0, 120)} », voici un brouillon de devis à valider avant envoi au client.`,
    line_items: lineItems,
    notes:
      meta?.notes ||
      "Brouillon généré par jingr. À vérifier et ajuster avant envoi. Ne jamais envoyer automatiquement.",
    total_ht: sums.total_ht,
    total_tva: sums.total_tva,
    total_ttc: sums.total_ttc,
    status: "draft",
  });

  await db.addEvent({
    quote_draft_id: draft.id,
    event_type: "draft_generated",
    payload: { source: process.env.OPENAI_API_KEY ? "openai_or_mock" : "mock" },
  });

  const token = await db.createReviewToken({
    job_id: jobId,
    quote_draft_id: draft.id,
  });

  await db.updateJobStatus(jobId, "draft_ready");

  return { draft, reviewToken: token.token };
}

export function recalcTotals(items: QuoteLineItem[]) {
  return totals(items);
}
