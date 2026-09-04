import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import type {
  Artisan,
  DbShape,
  Job,
  JobAsset,
  MessageInbox,
  QuoteDraft,
  QuoteEvent,
  ReviewToken,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "store.json");

const emptyDb = (): DbShape => ({
  artisans: [],
  jobs: [],
  job_assets: [],
  quote_drafts: [],
  quote_events: [],
  review_tokens: [],
  message_inbox: [],
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

export const db = {
  mode(): "supabase" | "file" {
    return hasSupabaseConfig() ? "supabase" : "file";
  },

  async listJobs(): Promise<(Job & { artisan?: Artisan; draft?: QuoteDraft })[]> {
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
      }));
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

  async findOrCreateArtisan(input: {
    name: string;
    phone: string;
    trade?: string;
    email?: string;
    company_name?: string;
  }): Promise<Artisan> {
    const store = await readStore();
    const phone = input.phone.replace(/\s+/g, "");
    let artisan = store.artisans.find((a) => a.phone.replace(/\s+/g, "") === phone);
    if (!artisan) {
      artisan = {
        id: randomUUID(),
        name: input.name,
        phone: input.phone,
        email: input.email ?? null,
        trade: input.trade ?? "plomberie",
        company_name: input.company_name ?? null,
        created_at: nowIso(),
      };
      store.artisans.push(artisan);
      await writeStore(store);
    }
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

  async reset(): Promise<void> {
    await writeStore(emptyDb());
  },
};
