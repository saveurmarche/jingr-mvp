/**
 * Seed démo: chantier Mme Dupont — remplacement chauffe-eau.
  * Usage: npm run seed
  */
import { db } from "../src/lib/db";
import { generateDraftForJob } from "../src/lib/draft-pipeline";

async function main() {
  await db.reset();

  const artisan = await db.findOrCreateArtisan({
    name: "Jean Martin",
    phone: "0612345678",
    trade: "plomberie",
    company_name: "Martin Plomberie Chauffage",
  });

  const job = await db.createJob({
    artisan_id: artisan.id,
    client_name: "Mme Dupont",
    client_address: "12 rue Victor Hugo, 69003 Lyon",
    client_phone: "0698765432",
    description:
      "Chauffe-eau electrique HS depuis 2 jours. Remplacement par un ballon 200L vertical. Accès salle de bain étage, évacuation ancien appareil demandée.",
    urgency: "haute",
    source: "seed",
  });

  await db.addAsset({
    job_id: job.id,
    kind: "note",
    note: "Photo tableau electrique + plaque signalétique à prévoir sur place",
  });

  const { draft, reviewToken } = await generateDraftForJob(job.id);

  console.log("Seed OK -- Mme Dupont chauffe-eau");
  console.log("Job:", job.id);
  console.log("Draft:", draft.id, "TTC:", draft.total_ttc);
  console.log("Review URL: /review/" + reviewToken);
  console.log("DB mode:", db.mode());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
