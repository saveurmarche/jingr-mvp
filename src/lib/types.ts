export type Artisan = {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  trade: string;
  company_name?: string | null;
  /** true = tutoyer le client dans l'intro ; false = vouvoyer (défaut) */
  tutoiement?: boolean;
  /** Marge / uplift % appliquée aux prix unitaires HT (défaut 30) */
  marge_pct?: number;
  /** TVA par défaut sur les lignes : 10 ou 20 (défaut 10) */
  default_tva?: number;
  siret?: string | null;
  city?: string | null;
  /** Adresse complète de l'entreprise (obligatoire sur facture) */
  address?: string | null;
  /** Micro-entrepreneur en franchise de TVA (art. 293 B du CGI) */
  tva_franchise?: boolean;
  /** Délai de paiement des factures, en jours (défaut 30) */
  payment_days?: number;
  /** Acompte demandé à la signature, en % du total TTC (0 = pas d'acompte) */
  acompte_pct?: number;
  /** Durée de validité des devis, en jours (défaut 30) */
  validity_days?: number;
  /** Logiciel de facturation déjà utilisé (null / "jingr" = facture dans jingr) */
  billing_software?: string | null;
  /** Catalogue de prix appris des devis validés (prix de vente HT de l'artisan) */
  price_list?: PriceItem[];
  /** STOP : l'agent ne traite plus ses messages jusqu'à REPRENDRE */
  paused?: boolean;
  /** Date à laquelle on lui a proposé de passer au payant (une seule fois) */
  billing_notified_at?: string | null;
  created_at: string;
};

export type PriceItem = {
  label: string;
  unit: string;
  unit_price_ht: number;
  tva_rate?: number;
  updated_at: string;
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
  /** catalogue = prix de l'artisan ; estimate = proposé par l'IA, à confirmer ; manual = saisi ou confirmé */
  price_source?: "catalogue" | "estimate" | "manual";
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
  /** Acceptation en ligne par le client (« Bon pour accord ») */
  accepted_at?: string | null;
  accepted_by?: string | null;
  /** Lignes telles que proposées par jingr, pour mesurer les corrections de l'artisan */
  generated_line_items?: QuoteLineItem[];
  /** Nombre de lignes ajoutées, supprimées ou modifiées avant validation */
  edit_count?: number;
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

/** Lien envoyé au client final : lecture seule + acceptation. Distinct du jeton d'édition. */
export type ClientLink = {
  id: string;
  quote_draft_id: string;
  token: string;
  created_at: string;
  /** Première consultation par le client */
  viewed_at?: string | null;
};

/** Demande « Rejoindre la bêta » depuis le site */
export type BetaSignup = {
  id: string;
  first_name: string;
  last_name?: string | null;
  email: string;
  trade?: string | null;
  phone?: string | null;
  message?: string | null;
  city?: string | null;
  /** Logiciel de devis/facturation actuel déclaré */
  software?: string | null;
  created_at: string;
};

export type InvoiceStatus = "issued" | "paid";

export type Invoice = {
  id: string;
  artisan_id: string;
  job_id: string;
  quote_draft_id: string;
  /** Numéro séquentiel sans trou, par artisan et par année : F-2026-0001 */
  number: string;
  title: string;
  line_items: QuoteLineItem[];
  total_ht: number;
  total_tva: number;
  total_ttc: number;
  issued_at: string;
  due_at: string;
  status: InvoiceStatus;
  paid_at?: string | null;
  created_at: string;
};

export type Testimonial = {
  id: string;
  artisan_id: string;
  text: string;
  /** Affichage public : prénom + initiale, métier, ville */
  display_name: string;
  trade: string;
  city?: string | null;
  /** pending tant que l'équipe n'a pas relu ; seul approved est publié */
  status: "pending" | "approved" | "rejected";
  /** L'artisan a accepté la publication en répondant AVIS */
  consent: boolean;
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
  invoices: Invoice[];
  testimonials: Testimonial[];
  client_links: ClientLink[];
  beta_signups: BetaSignup[];
};

/** Defaults for artisans loaded from older store.json without new fields */
export function artisanDefaults(a: Artisan): Required<
  Pick<Artisan, "tutoiement" | "marge_pct" | "default_tva" | "tva_franchise" | "payment_days" | "acompte_pct" | "validity_days">
> &
  Pick<Artisan, "siret" | "city" | "address"> {
  return {
    tutoiement: a.tutoiement ?? false,
    marge_pct: a.marge_pct ?? 30,
    default_tva: a.default_tva ?? 10,
    tva_franchise: a.tva_franchise ?? false,
    payment_days: a.payment_days ?? 30,
    acompte_pct: a.acompte_pct ?? 0,
    validity_days: a.validity_days ?? 30,
    siret: a.siret ?? null,
    city: a.city ?? null,
    address: a.address ?? null,
  };
}

export type PageHit = {
  day: string; // AAAA-MM-JJ
  path: string;
  source: string; // utm_source / src, sinon domaine du référent, sinon "direct"
  count: number;
};
