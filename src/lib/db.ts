import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import type {
  Artisan,
  ClientLink,
  DbShape,
  Invoice,
  Job,
  Testimonial,
  JobAsset,
  MessageInbox,
  QuoteDraft,
  QuoteEvent,
  ReviewToken,
} from "./types";

// Sur Azure App Service, DATA_DIR=/home/data : /home est persistant, le dossier de l'app ne l'est pas.
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "store.json");

const emptyDb = (): DbShape => ({
  artisans: [],
  jobs: [],
  job_assets: [],
  quote_drafts: [],
  quote_events: [],
  review_tokens: [],
  message_inbox: [],
  invoices: [],
  testimonials: [],
  client_links: [],
});

function hasSupabaseConfig(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

async function readStore(): Promise<DbShape> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    return { ...emptyDb(), ...JSON.parse(raw) } as DbShape;
  } catch {
    return emptyDb();
  }
}

async function writeStore(db: DbShape): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(db, null, 2), "utf8");
}

function nowIso() {
  return new Date().toISOString();
}

/** Format E.164 pour la France : « 06 12 34 56 78 » et « +33612345678 » désignent le même artisan. */
export function normalizePhone(phone: string) {
  let p = phone.replace(/[\s.\-()]/g, "");
  if (p.startsWith("00")) p = `+${p.slice(2)}`;
  if (/^0\d{9}$/.test(p)) p = `+33${p.slice(1)}`;
  if (/^33\d{9}$/.test(p)) p = `+${p}`;
  return p;
}

export const db = {
  mode(): "supabase" | "file" {
    return hasSupabaseConfig() ? "supabase" : "file";
  },

  async listJobs(): Promise<(Job & { artisan?: Artisan; draft?: QuoteDraft; review_token?: string })[]> {
    if (hasSupabaseConfig()) {
      // Production path: wire Supabase client when env is set.
      // For MVP demo we fall through to file store if not fully configured.
    }
    const store = await readStore();
    return store.jobs
      .slice()
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map((job) => ({
        ...job,
        artisan: store.artisans.find((a) => a.id === job.artisan_id),
        draft: store.quote_drafts.find((d) => d.job_id === job.id),
        review_token: store.review_tokens.find((t) => t.job_id === job.id)?.token,
      }));
  },

  async listJobsByPhone(phone: string): Promise<
    (Job & { artisan?: Artisan; draft?: QuoteDraft; review_token?: string })[]
  > {
    const normalized = normalizePhone(phone);
    const all = await this.listJobs();
    return all.filter(
      (j) => j.artisan && normalizePhone(j.artisan.phone) === normalized
    );
  },

  async getJob(id: string): Promise<(Job & { artisan?: Artisan }) | null> {
    const store = await readStore();
    const job = store.jobs.find((j) => j.id === id);
    if (!job) return null;
    return {
      ...job,
      artisan: store.artisans.find((a) => a.id === job.artisan_id),
    };
  },

  async getAssetsForJob(jobId: string): Promise<JobAsset[]> {
    const store = await readStore();
    return store.job_assets.filter((a) => a.job_id === jobId);
  },

  async findOrCreateArtisan(input: {
    name: string;
    phone: string;
    trade?: string;
    email?: string;
    company_name?: string;
    tutoiement?: boolean;
    marge_pct?: number;
    default_tva?: number;
    siret?: string;
    city?: string;
    address?: string;
    tva_franchise?: boolean;
  }): Promise<Artisan> {
    const store = await readStore();
    const phone = normalizePhone(input.phone);
    let artisan = store.artisans.find((a) => normalizePhone(a.phone) === phone);
    if (!artisan) {
      artisan = {
        id: randomUUID(),
        name: input.name,
        phone: input.phone,
        email: input.email ?? null,
        trade: input.trade ?? "plomberie",
        company_name: input.company_name ?? null,
        tutoiement: input.tutoiement ?? false,
        marge_pct: input.marge_pct ?? 30,
        default_tva: input.default_tva ?? 10,
        siret: input.siret ?? null,
        city: input.city ?? null,
        address: input.address ?? null,
        tva_franchise: input.tva_franchise ?? false,
        created_at: nowIso(),
      };
      store.artisans.push(artisan);
      await writeStore(store);
      return artisan;
    }

    // Update profile / prefs when provided
    let changed = false;
    if (input.name && input.name !== artisan.name) {
      artisan.name = input.name;
      changed = true;
    }
    if (input.trade) {
      artisan.trade = input.trade;
      changed = true;
    }
    if (input.email !== undefined) {
      artisan.email = input.email;
      changed = true;
    }
    if (input.company_name !== undefined) {
      artisan.company_name = input.company_name || null;
      changed = true;
    }
    if (input.tutoiement !== undefined) {
      artisan.tutoiement = input.tutoiement;
      changed = true;
    }
    if (input.marge_pct !== undefined) {
      artisan.marge_pct = input.marge_pct;
      changed = true;
    }
    if (input.default_tva !== undefined) {
      artisan.default_tva = input.default_tva;
      changed = true;
    }
    if (input.siret !== undefined) {
      artisan.siret = input.siret || null;
      changed = true;
    }
    if (input.city !== undefined) {
      artisan.city = input.city || null;
      changed = true;
    }
    if (input.address !== undefined) {
      artisan.address = input.address || null;
      changed = true;
    }
    if (input.tva_franchise !== undefined) {
      artisan.tva_franchise = input.tva_franchise;
      changed = true;
    }
    if (changed) await writeStore(store);
    return artisan;
  },

  async createJob(input: {
    artisan_id: string;
    client_name: string;
    client_address?: string;
    client_phone?: string;
    description: string;
    urgency?: string;
    source?: string;
  }): Promise<Job> {
    const store = await readStore();
    const job: Job = {
      id: randomUUID(),
      artisan_id: input.artisan_id,
      client_name: input.client_name,
      client_address: input.client_address ?? null,
      client_phone: input.client_phone ?? null,
      description: input.description,
      urgency: input.urgency ?? null,
      status: "received",
      source: input.source ?? "web",
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    store.jobs.push(job);
    await writeStore(store);
    return job;
  },

  async updateJobStatus(id: string, status: Job["status"]): Promise<Job | null> {
    const store = await readStore();
    const job = store.jobs.find((j) => j.id === id);
    if (!job) return null;
    job.status = status;
    job.updated_at = nowIso();
    await writeStore(store);
    return job;
  },

  async addAsset(input: {
    job_id: string;
    kind: string;
    url?: string;
    note?: string;
  }): Promise<JobAsset> {
    const store = await readStore();
    const asset: JobAsset = {
      id: randomUUID(),
      job_id: input.job_id,
      kind: input.kind,
      url: input.url ?? null,
      note: input.note ?? null,
      created_at: nowIso(),
    };
    store.job_assets.push(asset);
    await writeStore(store);
    return asset;
  },

  async saveDraft(draft: Omit<QuoteDraft, "id" | "created_at" | "updated_at"> & { id?: string }): Promise<QuoteDraft> {
    const store = await readStore();
    const existing = draft.id
      ? store.quote_drafts.find((d) => d.id === draft.id)
      : store.quote_drafts.find((d) => d.job_id === draft.job_id);

    if (existing) {
      Object.assign(existing, {
        ...draft,
        id: existing.id,
        updated_at: nowIso(),
      });
      await writeStore(store);
      return existing;
    }

    const created: QuoteDraft = {
      id: randomUUID(),
      job_id: draft.job_id,
      title: draft.title,
      intro: draft.intro ?? null,
      line_items: draft.line_items,
      notes: draft.notes ?? null,
      total_ht: draft.total_ht,
      total_tva: draft.total_tva,
      total_ttc: draft.total_ttc,
      status: draft.status,
      validated_at: draft.validated_at ?? null,
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    store.quote_drafts.push(created);
    await writeStore(store);
    return created;
  },

  async getDraft(id: string): Promise<QuoteDraft | null> {
    const store = await readStore();
    return store.quote_drafts.find((d) => d.id === id) ?? null;
  },

  async getDraftByJob(jobId: string): Promise<QuoteDraft | null> {
    const store = await readStore();
    return store.quote_drafts.find((d) => d.job_id === jobId) ?? null;
  },

  async addEvent(input: {
    quote_draft_id: string;
    event_type: string;
    payload?: Record<string, unknown>;
  }): Promise<QuoteEvent> {
    const store = await readStore();
    const event: QuoteEvent = {
      id: randomUUID(),
      quote_draft_id: input.quote_draft_id,
      event_type: input.event_type,
      payload: input.payload ?? null,
      created_at: nowIso(),
    };
    store.quote_events.push(event);
    await writeStore(store);
    return event;
  },

  async createReviewToken(input: {
    job_id: string;
    quote_draft_id: string;
    token?: string;
  }): Promise<ReviewToken> {
    const store = await readStore();
    const existing = store.review_tokens.find(
      (t) => t.quote_draft_id === input.quote_draft_id
    );
    if (existing) return existing;
    const token: ReviewToken = {
      id: randomUUID(),
      job_id: input.job_id,
      quote_draft_id: input.quote_draft_id,
      token: input.token ?? randomUUID().replace(/-/g, "").slice(0, 24),
      expires_at: null,
      created_at: nowIso(),
    };
    store.review_tokens.push(token);
    await writeStore(store);
    return token;
  },

  async getByReviewToken(token: string): Promise<{
    token: ReviewToken;
    draft: QuoteDraft;
    job: Job;
    artisan?: Artisan;
  } | null> {
    const store = await readStore();
    const rt = store.review_tokens.find((t) => t.token === token);
    if (!rt) return null;
    const draft = store.quote_drafts.find((d) => d.id === rt.quote_draft_id);
    const job = store.jobs.find((j) => j.id === rt.job_id);
    if (!draft || !job) return null;
    return {
      token: rt,
      draft,
      job,
      artisan: store.artisans.find((a) => a.id === job.artisan_id),
    };
  },

  async inboxInsert(input: {
    channel: string;
    from_phone?: string;
    body: string;
    raw?: Record<string, unknown>;
    job_id?: string;
  }): Promise<MessageInbox> {
    const store = await readStore();
    const msg: MessageInbox = {
      id: randomUUID(),
      channel: input.channel,
      from_phone: input.from_phone ?? null,
      body: input.body,
      raw: input.raw ?? null,
      processed: Boolean(input.job_id),
      job_id: input.job_id ?? null,
      created_at: nowIso(),
    };
    store.message_inbox.push(msg);
    await writeStore(store);
    return msg;
  },

  async listInboxByKind(kind: string): Promise<MessageInbox[]> {
    const store = await readStore();
    return store.message_inbox
      .filter((m) => m.raw?.kind === kind)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  /** Meta renvoie un webhook tant qu'il n'a pas reçu 200 : on déduplique par id de message. */
  async inboxHasExternalId(externalId: string): Promise<boolean> {
    const store = await readStore();
    return store.message_inbox.some((m) => m.raw?.external_id === externalId);
  },

  async countDraftsForArtisan(artisanId: string): Promise<number> {
    const store = await readStore();
    const jobIds = new Set(
      store.jobs.filter((j) => j.artisan_id === artisanId).map((j) => j.id)
    );
    return store.quote_drafts.filter((d) => jobIds.has(d.job_id)).length;
  },

  async getInvoiceByDraft(draftId: string): Promise<Invoice | null> {
    const store = await readStore();
    return store.invoices.find((i) => i.quote_draft_id === draftId) ?? null;
  },

  /**
   * Crée la facture d'un devis validé. Idempotent : un devis = une facture.
   * Numérotation chronologique continue par artisan et par année (obligation légale).
   */
  async createInvoiceFromDraft(draftId: string, paymentDays = 30): Promise<Invoice> {
    const store = await readStore();
    const existing = store.invoices.find((i) => i.quote_draft_id === draftId);
    if (existing) return existing;

    const draft = store.quote_drafts.find((d) => d.id === draftId);
    if (!draft) throw new Error("Devis introuvable");
    if (draft.status === "draft") throw new Error("Validez le devis avant de facturer");
    const job = store.jobs.find((j) => j.id === draft.job_id);
    if (!job) throw new Error("Chantier introuvable");

    const now = new Date();
    const year = now.getFullYear();
    const prefix = `F-${year}-`;
    const lastSeq = store.invoices
      .filter((i) => i.artisan_id === job.artisan_id && i.number.startsWith(prefix))
      .reduce((max, i) => Math.max(max, Number(i.number.slice(prefix.length)) || 0), 0);

    const due = new Date(now);
    due.setDate(due.getDate() + paymentDays);

    const invoice: Invoice = {
      id: randomUUID(),
      artisan_id: job.artisan_id,
      job_id: job.id,
      quote_draft_id: draft.id,
      number: `${prefix}${String(lastSeq + 1).padStart(4, "0")}`,
      title: draft.title.replace(/^Devis/i, "Facture"),
      line_items: draft.line_items,
      total_ht: draft.total_ht,
      total_tva: draft.total_tva,
      total_ttc: draft.total_ttc,
      issued_at: now.toISOString(),
      due_at: due.toISOString(),
      status: "issued",
      paid_at: null,
      created_at: now.toISOString(),
    };
    store.invoices.push(invoice);
    await writeStore(store);
    return invoice;
  },

  async markInvoicePaid(id: string): Promise<Invoice | null> {
    const store = await readStore();
    const inv = store.invoices.find((i) => i.id === id);
    if (!inv) return null;
    inv.status = "paid";
    inv.paid_at = nowIso();
    await writeStore(store);
    return inv;
  },

  async addTestimonial(input: {
    artisan: Artisan;
    text: string;
  }): Promise<Testimonial> {
    const store = await readStore();
    const first = input.artisan.name.split(" ")[0] || "Artisan";
    const lastInitial = input.artisan.name.split(" ")[1]?.[0];
    const t: Testimonial = {
      id: randomUUID(),
      artisan_id: input.artisan.id,
      text: input.text,
      display_name: lastInitial ? `${first} ${lastInitial}.` : first,
      trade: input.artisan.trade === "chauffage" ? "Chauffagiste" : "Plombier",
      city: input.artisan.city ?? null,
      status: "pending",
      consent: true,
      created_at: nowIso(),
    };
    store.testimonials.push(t);
    await writeStore(store);
    return t;
  },

  async listTestimonials(status?: Testimonial["status"]): Promise<Testimonial[]> {
    const store = await readStore();
    return store.testimonials
      .filter((t) => !status || t.status === status)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  /** Retrait à la demande de l'artisan (RGPD) : plus jamais affiché. */
  async withdrawTestimonials(artisanId: string): Promise<number> {
    const store = await readStore();
    const mine = store.testimonials.filter((t) => t.artisan_id === artisanId);
    store.testimonials = store.testimonials.filter((t) => t.artisan_id !== artisanId);
    await writeStore(store);
    return mine.length;
  },

  async setTestimonialStatus(
    id: string,
    status: Testimonial["status"]
  ): Promise<Testimonial | null> {
    const store = await readStore();
    const t = store.testimonials.find((x) => x.id === id);
    if (!t) return null;
    t.status = status;
    await writeStore(store);
    return t;
  },

  /** Lien client d'un devis validé (créé une fois, réutilisé ensuite). */
  async getOrCreateClientLink(draftId: string): Promise<ClientLink> {
    const store = await readStore();
    const existing = store.client_links.find((l) => l.quote_draft_id === draftId);
    if (existing) return existing;
    const draft = store.quote_drafts.find((d) => d.id === draftId);
    if (!draft) throw new Error("Devis introuvable");
    if (draft.status === "draft") throw new Error("Validez le devis avant de l'envoyer au client");
    const link: ClientLink = {
      id: randomUUID(),
      quote_draft_id: draftId,
      token: randomUUID().replace(/-/g, "").slice(0, 24),
      created_at: nowIso(),
    };
    store.client_links.push(link);
    await writeStore(store);
    return link;
  },

  async getClientLinkByDraft(draftId: string): Promise<ClientLink | null> {
    const store = await readStore();
    return store.client_links.find((l) => l.quote_draft_id === draftId) ?? null;
  },

  async getByClientToken(token: string): Promise<{
    draft: QuoteDraft;
    job: Job;
    artisan?: Artisan;
  } | null> {
    const store = await readStore();
    const link = store.client_links.find((l) => l.token === token);
    if (!link) return null;
    const draft = store.quote_drafts.find((d) => d.id === link.quote_draft_id);
    const job = draft ? store.jobs.find((j) => j.id === draft.job_id) : undefined;
    if (!draft || !job) return null;
    return { draft, job, artisan: store.artisans.find((a) => a.id === job.artisan_id) };
  },

  /** Acceptation par le client. Idempotent : la première acceptation fait foi. */
  async acceptQuote(token: string, name: string): Promise<{ draft: QuoteDraft; already: boolean } | null> {
    const store = await readStore();
    const link = store.client_links.find((l) => l.token === token);
    const draft = link ? store.quote_drafts.find((d) => d.id === link.quote_draft_id) : undefined;
    if (!draft) return null;
    if (draft.accepted_at) return { draft, already: true };
    draft.accepted_at = nowIso();
    draft.accepted_by = name;
    draft.updated_at = nowIso();
    store.quote_events.push({
      id: randomUUID(),
      quote_draft_id: draft.id,
      event_type: "accepted_by_client",
      payload: { name },
      created_at: nowIso(),
    });
    await writeStore(store);
    return { draft, already: false };
  },

  async reset(): Promise<void> {
    await writeStore(emptyDb());
  },
};
