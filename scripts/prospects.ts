/**
 * Génère une liste de prospects depuis l'API publique Recherche d'entreprises (data.gouv, gratuite, sans clé).
 * Cible : plombiers / chauffagistes (NAF 43.22A, 43.22B) actifs, créés récemment = pas encore outillés.
 *
 * Usage : npx tsx scripts/prospects.ts --dep 69,01,42 --mois 18 --max 500
 * Sortie : data/prospects-<date>.csv (à enrichir en email/téléphone puis importer dans l'outil d'envoi)
 *
 * RGPD (prospection B2B) : message en lien avec l'activité pro, identité de l'expéditeur, lien de désinscription,
 * respect immédiat des oppositions. Ne jamais prospecter un particulier.
 */
import { promises as fs } from "fs";
import path from "path";

const API = "https://recherche-entreprises.api.gouv.fr/search";

type Result = {
  siren: string;
  nom_complet: string;
  date_creation?: string;
  activite_principale?: string;
  tranche_effectif_salarie?: string | null;
  siege?: { adresse?: string; code_postal?: string; libelle_commune?: string; siret?: string };
  dirigeants?: Array<{ nom?: string; prenoms?: string; type_dirigeant?: string }>;
};

function arg(name: string, def: string): string {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : def;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function csv(v: unknown): string {
  const s = String(v ?? "");
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

async function fetchPage(naf: string, dep: string, page: number): Promise<{ results: Result[]; total_pages: number }> {
  const url = `${API}?activite_principale=${naf}&departement=${dep}&etat_administratif=A&per_page=25&page=${page}`;
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(url);
    if (res.status === 429) {
      await sleep(2000 * (attempt + 1));
      continue;
    }
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    return (await res.json()) as { results: Result[]; total_pages: number };
  }
  throw new Error(`Rate limit persistant: ${url}`);
}

async function main() {
  const deps = arg("dep", "69").split(",").map((d) => d.trim());
  const months = Number(arg("mois", "18"));
  const max = Number(arg("max", "500"));
  const since = new Date();
  since.setMonth(since.getMonth() - months);

  const rows: string[] = [];
  const seen = new Set<string>();

  outer: for (const dep of deps) {
    for (const naf of ["43.22A", "43.22B"]) {
      let page = 1;
      let totalPages = 1;
      do {
        const data = await fetchPage(naf, dep, page);
        totalPages = Math.min(data.total_pages || 1, 400);
        for (const r of data.results) {
          if (seen.has(r.siren)) continue;
          if (r.date_creation && new Date(r.date_creation) < since) continue;
          seen.add(r.siren);
          const d = r.dirigeants?.find((x) => x.type_dirigeant === "personne physique") ?? r.dirigeants?.[0];
          rows.push(
            [
              r.siren,
              r.siege?.siret,
              r.nom_complet,
              d?.prenoms?.split(" ")[0],
              d?.nom,
              r.activite_principale === "43.22B" ? "chauffagiste" : "plombier",
              r.date_creation,
              r.tranche_effectif_salarie ?? "",
              r.siege?.adresse,
              r.siege?.code_postal,
              r.siege?.libelle_commune,
            ]
              .map(csv)
              .join(",")
          );
          if (rows.length >= max) break outer;
        }
        page++;
        await sleep(150); // limite publique ~7 req/s
      } while (page <= totalPages);
    }
  }

  const header = "siren,siret,entreprise,prenom,nom,metier,date_creation,effectif,adresse,code_postal,ville";
  const out = path.join(process.cwd(), "data", `prospects-${new Date().toISOString().slice(0, 10)}.csv`);
  await fs.mkdir(path.dirname(out), { recursive: true });
  await fs.writeFile(out, [header, ...rows].join("\n") + "\n", "utf8");
  console.log(`${rows.length} prospects → ${out}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
