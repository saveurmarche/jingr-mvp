export type Artisan = {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  trade: string;
  company_name?: string | null;
  created_at: string;
};

export type JobStatus =
  | "received"
  | "processing"
  | "draft_ready"
  | "validated"
  | "error";

export type Job = {
  id: string;
  artisan_id: string;
  client_name: string;
  client_address?: string | null;
  client_phone?: string | null;
  description: string;
  urgency?: string | null;
  status: JobStatus;
  source: string;
  created_at: string;
  updated_at: string;
};

export type JobAsset = {
  id: string;
  job_id: string;
  kind: string;
  url?: string | null;
  note?: string | null;
  created_at: string;
};

export type QuoteLineItem = {
  id: string;
  label: string;
  quantity: number;
  unit: string;
  unit_price_ht: number;
  tva_rate: number;
};

export type QuoteDraft = {
  id: string;
  job_id: string;
  title: string;
  intro?: string | null;
  line_items: QuoteLineItem[];
  notes?: string | null;
  total_ht: number;
  total_tva: number;
  total_ttc: number;
  status: "draft" | "validated" | "sent";
  validated_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type QuoteEvent = {
  id: string;
  quote_draft_id: string;
  event_type: string;
  payload?: Record<string, unknown> | null;
  created_at: string;
};

export type ReviewToken = {
  id: string;
  job_id: string;
  quote_draft_id: string;
  token: string;
  expires_at?: string | null;
  created_at: string;
};

export type MessageInbox = {
  id: string;
  channel: string;
  from_phone?: string | null;
  body: string;
  raw?: Record<string, unknown> | null;
  processed: boolean;
  job_id?: string | null;
  created_at: string;
};

export type DbShape = {
  artisans: Artisan[];
  jobs: Job[];
  job_assets: JobAsset[];
  quote_drafts: QuoteDraft[];
  quote_events: QuoteEvent[];
  review_tokens: ReviewToken[];
  message_inbox: MessageInbox[];
};
