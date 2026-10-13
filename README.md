# jingr MVP

Devis et factures pour artisans (plombiers, chauffagistes), dictés sur WhatsApp.
L'artisan envoie un vocal ou un texte → devis chiffré à relire → validation → facture en un clic.
Rien n'est jamais envoyé au client final automatiquement.

## Setup
cp .env.example .env.local
npm install
npm run seed
npm run dev

## Pages
- `/` landing · `/go` envoi web (texte, vocal, photos) · `/review/[token]` relecture, réglages entreprise, facture
- `/mes-devis` historique par téléphone · `/ops` back-office
- `/modele-devis/[slug]`, `/facture-electronique-artisan` pages SEO · `sitemap.xml`, `robots.txt`

## APIs
- `POST /api/whatsapp/webhook` (Meta Cloud API signé, ou JSON en mode test) · `GET` vérification Meta
- `POST /api/jobs` · `POST /api/drafts/[id]` · `GET /api/pdf/[token]`
- `POST /api/invoices` (create / paid) · `GET /api/facture/[token]` · `POST /api/artisan`

## Scripts
- `npm run prospects -- --dep 69,01 --mois 18` liste de prospects (API publique data.gouv)

## Docs
- `docs/GROWTH.md` machine d'acquisition, séquences, routine hebdo
- `docs/DEPLOY.md` Azure + DNS OVH + WhatsApp Meta + Stripe

Local JSON store si pas de Supabase. Schéma dans supabase/migrations.
