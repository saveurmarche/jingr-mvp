/**
 * Briques IA utilisées par les canaux d'entrée (WhatsApp, web) :
 * - transcription d'un vocal en texte
 * - extraction client / adresse / travaux depuis un message libre
 * Chaque fonction a un repli sans clé OpenAI pour que le MVP tourne en local.
 */

export type ExtractedJob = {
  client_name: string;
  client_address?: string;
  client_phone?: string;
  description: string;
};

async function openaiClient() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const OpenAI = (await import("openai")).default;
  return new OpenAI({ apiKey: key });
}

function audioExt(mime: string): string {
  if (mime.includes("ogg") || mime.includes("opus")) return "ogg";
  if (mime.includes("mpeg") || mime.includes("mp3")) return "mp3";
  if (mime.includes("mp4") || mime.includes("m4a") || mime.includes("aac")) return "m4a";
  if (mime.includes("webm")) return "webm";
  if (mime.includes("wav")) return "wav";
  return "ogg";
}

/** Transcrit un vocal (WhatsApp = audio/ogg opus). Retourne null si impossible. */
export async function transcribeAudio(
  buffer: Buffer,
  mime = "audio/ogg"
): Promise<string | null> {
  const client = await openaiClient();
  if (!client) return null;
  try {
    const { toFile } = await import("openai");
    const file = await toFile(buffer, `vocal.${audioExt(mime)}`, { type: mime });
    const res = await client.audio.transcriptions.create({
      file,
      model: process.env.OPENAI_TRANSCRIBE_MODEL || "whisper-1",
      language: "fr",
      prompt:
        "Artisan plombier chauffagiste qui décrit un chantier : client, adresse, chauffe-eau, ballon, cumulus, mitigeur, groupe de sécurité, chaudière, radiateur, PER, cuivre, raccord.",
    });
    return res.text?.trim() || null;
  } catch (err) {
    console.error("Transcription échouée", err);
    return null;
  }
}

/** Repli sans IA : « Client, adresse, description » ou texte brut. */
export function extractJobHeuristic(text: string): ExtractedJob {
  const parts = text.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 3 && parts[0].length < 50) {
    return {
      client_name: parts[0],
      client_address: parts[1],
      description: parts.slice(2).join(", "),
    };
  }
  const nameMatch = /\b(M\.|Mme|Mr|Monsieur|Madame)\s+([A-ZÉÈ][\wéèêëàâîïôöûüç-]+)/.exec(text);
  return {
    client_name: nameMatch ? `${nameMatch[1]} ${nameMatch[2]}` : "Client à préciser",
    description: text,
  };
}

/** Extrait les infos chantier d'un message libre (texte tapé ou vocal transcrit). */
export async function extractJobFromMessage(text: string): Promise<ExtractedJob> {
  const client = await openaiClient();
  if (!client) return extractJobHeuristic(text);
  try {
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            'Un artisan décrit un chantier (souvent dicté, informel). Extrais en JSON : {"client_name":"...","client_address":"... ou null","client_phone":"... ou null","description":"description technique complète des travaux, reformulée proprement"}. Si le nom du client manque, mets "Client à préciser". N\'invente rien.',
        },
        { role: "user", content: text },
      ],
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) return extractJobHeuristic(text);
    const p = JSON.parse(raw) as Partial<Record<keyof ExtractedJob, string | null>>;
    return {
      client_name: p.client_name?.trim() || "Client à préciser",
      client_address: p.client_address?.trim() || undefined,
      client_phone: p.client_phone?.trim() || undefined,
      description: p.description?.trim() || text,
    };
  } catch (err) {
    console.error("Extraction chantier échouée, repli heuristique", err);
    return extractJobHeuristic(text);
  }
}
