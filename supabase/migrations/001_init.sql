-- jingr MVP schema
create extension if not exists "pgcrypto";

create table if not exists artisans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  trade text not null default 'plomberie',
  company_name text,
  created_at timestamptz not null default now()
);

create unique index if not exists artisans_phone_uidx on artisans (phone);

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  artisan_id uuid not null references artisans(id) on delete cascade,
  client_name text not null,
  client_address text,
  client_phone text,
  description text not null,
  urgency text,
  status text not null default 'received'
    check (status in ('received','processing','draft_ready','validated','error')),
  source text not null default 'web',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists job_assets (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  kind text not null,
  url text,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists quote_drafts (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  title text not null,
  intro text,
  line_items jsonb not null default '[]'::jsonb,
  notes text,
  total_ht numeric(12,2) not null default 0,
  total_tva numeric(12,2) not null default 0,
  total_ttc numeric(12,2) not null default 0,
  status text not null default 'draft'
    check (status in ('draft','validated','sent')),
  validated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists quote_events (
  id uuid primary key default gen_random_uuid(),
  quote_draft_id uuid not null references quote_drafts(id) on delete cascade,
  event_type text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);

create table if not exists review_tokens (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  quote_draft_id uuid not null references quote_drafts(id) on delete cascade,
  token text not null unique,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists message_inbox (
  id uuid primary key default gen_random_uuid(),
  channel text not null,
  from_phone text,
  body text not null,
  raw jsonb,
  processed boolean not null default false,
  job_id uuid references jobs(id) on delete set null,
  created_at timestamptz not null default now()
);
