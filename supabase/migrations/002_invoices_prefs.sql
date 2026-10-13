-- Préférences artisan (déjà utilisées par le store fichier) + factures
alter table artisans add column if not exists tutoiement boolean not null default false;
alter table artisans add column if not exists marge_pct numeric(5,2) not null default 30;
alter table artisans add column if not exists default_tva numeric(4,1) not null default 10;
alter table artisans add column if not exists siret text;
alter table artisans add column if not exists city text;
alter table artisans add column if not exists address text;
alter table artisans add column if not exists tva_franchise boolean not null default false;
alter table artisans add column if not exists payment_days int not null default 30;

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  artisan_id uuid not null references artisans(id) on delete restrict,
  job_id uuid not null references jobs(id) on delete restrict,
  quote_draft_id uuid not null unique references quote_drafts(id) on delete restrict,
  number text not null,
  title text not null,
  line_items jsonb not null default '[]'::jsonb,
  total_ht numeric(12,2) not null,
  total_tva numeric(12,2) not null,
  total_ttc numeric(12,2) not null,
  issued_at timestamptz not null default now(),
  due_at timestamptz not null,
  status text not null default 'issued' check (status in ('issued','paid')),
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

-- Numérotation continue : unique par artisan
create unique index if not exists invoices_artisan_number_uidx on invoices (artisan_id, number);
