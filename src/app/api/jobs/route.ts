import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { generateDraftForJob } from "@/lib/draft-pipeline";
import { saveBase64Photo, saveFilePhoto } from "@/lib/uploads";
import { transcribeAudio } from "@/lib/ai";
import { checkOpsPassword } from "@/lib/ops-auth";

const schema = z.object({
  artisan_name: z.string().min(1),
  artisan_phone: z.string().min(6),
  artisan_trade: z.string().optional(),
  company_name: z.string().optional(),
  client_name: z.string().min(1),
  client_address: z.string().optional(),
  client_phone: z.string().optional(),
  description: z.string().default(""),
  urgency: z.string().optional(),
  source: z.string().optional(),
  auto_draft: z.boolean().optional().default(true),
  // Prefs
  tutoiement: z.boolean().optional(),
  marge_pct: z.number().min(0).max(200).optional(),
  default_tva: z.union([z.literal(10), z.literal(20), z.number()]).optional(),
  siret: z.string().optional(),
  city: z.string().optional(),
  photo_note: z.string().optional(),
  // JSON clients may send base64 photos
  photos: z
    .array(
      z.object({
        data: z.string().min(1),
        filename: z.string().optional(),
        note: z.string().optional(),
      })
    )
    .max(3)
    .optional(),
});

function parseBool(v: FormDataEntryValue | null | undefined): boolean | undefined {
  if (v === null || v === undefined || v === "") return undefined;
  const s = String(v).toLowerCase();
  if (s === "true" || s === "1" || s === "on" || s === "tu") return true;
  if (s === "false" || s === "0" || s === "off" || s === "vous") return false;
  return undefined;
}

function parseNum(v: FormDataEntryValue | null | undefined): number | undefined {
  if (v === null || v === undefined || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

async function parseRequest(req: NextRequest): Promise<{
  data: z.infer<typeof schema>;
  files: File[];
  audio?: File;
}> {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const fd = await req.formData();
    const files: File[] = [];
    for (const key of ["photos", "photo", "images"]) {
      for (const entry of fd.getAll(key)) {
        if (entry instanceof File && entry.size > 0) files.push(entry);
      }
    }
    // Also accept photos[] style
    for (const [key, entry] of fd.entries()) {
      if (key.startsWith("photos") && entry instanceof File && entry.size > 0) {
        if (!files.includes(entry)) files.push(entry);
      }
    }

    const raw = {
      artisan_name: String(fd.get("artisan_name") || ""),
      artisan_phone: String(fd.get("artisan_phone") || ""),
      artisan_trade: String(fd.get("artisan_trade") || "") || undefined,
      company_name: String(fd.get("company_name") || "") || undefined,
      client_name: String(fd.get("client_name") || ""),
      client_address: String(fd.get("client_address") || "") || undefined,
      client_phone: String(fd.get("client_phone") || "") || undefined,
      description: String(fd.get("description") || ""),
      urgency: String(fd.get("urgency") || "") || undefined,
      source: String(fd.get("source") || "") || "web",
      auto_draft: parseBool(fd.get("auto_draft")) ?? true,
      tutoiement: parseBool(fd.get("tutoiement")),
      marge_pct: parseNum(fd.get("marge_pct")),
      default_tva: parseNum(fd.get("default_tva")),
      siret: String(fd.get("siret") || "") || undefined,
      city: String(fd.get("city") || "") || undefined,
      photo_note: String(fd.get("photo_note") || "") || undefined,
    };
    const audioEntry = fd.get("audio");
    const audio =
      audioEntry instanceof File && audioEntry.size > 0 ? audioEntry : undefined;
    return { data: schema.parse(raw), files: files.slice(0, 3), audio };
  }

  const body = await req.json();
  return { data: schema.parse(body), files: [] };
}

export async function POST(req: NextRequest) {
  try {
    const { data, files, audio } = await parseRequest(req);

    let description = data.description.trim();
    if (audio) {
      if (audio.size > 20 * 1024 * 1024) throw new Error("Vocal trop lourd (max 20 Mo)");
      const transcript = await transcribeAudio(
        Buffer.from(await audio.arrayBuffer()),
        audio.type || "audio/webm"
      );
      if (!transcript && !description) {
        throw new Error("Impossible de transcrire le vocal. Décrivez le chantier par écrit.");
      }
      if (transcript) description = [description, `[Vocal] ${transcript}`].filter(Boolean).join("\n\n");
    }
    if (description.length < 5) throw new Error("Décrivez le chantier (texte ou vocal).");

    const defaultTva =
      data.default_tva === 20 || data.default_tva === 10
        ? data.default_tva
        : data.default_tva !== undefined
          ? data.default_tva >= 15
            ? 20
            : 10
          : undefined;

    const artisan = await db.findOrCreateArtisan({
      name: data.artisan_name,
      phone: data.artisan_phone,
      trade: data.artisan_trade,
      company_name: data.company_name,
      tutoiement: data.tutoiement,
      marge_pct: data.marge_pct,
      default_tva: defaultTva,
      siret: data.siret,
      city: data.city,
    });

    if (data.photo_note) {
      description = `${description}\n\n[Note photos] ${data.photo_note}`;
    }

    const job = await db.createJob({
      artisan_id: artisan.id,
      client_name: data.client_name,
      client_address: data.client_address,
      client_phone: data.client_phone,
      description,
      urgency: data.urgency,
      source: data.source ?? "web",
    });

    // Multipart files
    for (const file of files) {
      const saved = await saveFilePhoto(file);
      await db.addAsset({
        job_id: job.id,
        kind: "photo",
        url: saved.url,
        note: data.photo_note || file.name,
      });
    }

    // JSON base64 photos
    if (data.photos?.length) {
      for (const photo of data.photos.slice(0, 3)) {
        const saved = await saveBase64Photo(photo.data, photo.filename);
        await db.addAsset({
          job_id: job.id,
          kind: "photo",
          url: saved.url,
          note: photo.note || data.photo_note || photo.filename || "photo chantier",
        });
      }
    }

    // Standalone photo note without files
    if (data.photo_note && files.length === 0 && !data.photos?.length) {
      await db.addAsset({
        job_id: job.id,
        kind: "note",
        note: data.photo_note,
      });
    }

    let reviewToken: string | null = null;
    let draftId: string | null = null;

    if (data.auto_draft !== false) {
      const result = await generateDraftForJob(job.id);
      reviewToken = result.reviewToken;
      draftId = result.draft.id;
    }

    return NextResponse.json({
      ok: true,
      job_id: job.id,
      draft_id: draftId,
      review_token: reviewToken,
      review_url: reviewToken ? `/review/${reviewToken}` : null,
      db_mode: db.mode(),
    });
  } catch (err) {
    console.error("POST /api/jobs", err);
    const message = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}

/** Liste complète (back-office uniquement) : contient données clients et jetons de revue. */
export async function GET(req: NextRequest) {
  if (!checkOpsPassword(req.headers.get("x-ops-password"))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const jobs = await db.listJobs();
  return NextResponse.json({ ok: true, jobs, db_mode: db.mode() });
}
