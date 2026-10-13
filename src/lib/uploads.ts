import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

const PUBLIC_UPLOADS = path.join(process.cwd(), "public", "uploads");
const DATA_UPLOADS = path.join(process.env.DATA_DIR || path.join(process.cwd(), "data"), "uploads");

const ALLOWED = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

function extFor(mime: string, filename?: string): string {
  if (filename && /\.[a-z0-9]+$/i.test(filename)) {
    return filename.split(".").pop()!.toLowerCase();
  }
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  if (mime.includes("heic") || mime.includes("heif")) return "heic";
  return "jpg";
}

export async function saveUploadBuffer(
  buffer: Buffer,
  opts: { mime?: string; filename?: string }
): Promise<{ url: string; absolutePath: string }> {
  const mime = (opts.mime || "image/jpeg").toLowerCase();
  if (opts.mime && !ALLOWED.has(mime) && !mime.startsWith("image/")) {
    throw new Error(`Type de fichier non supporté: ${mime}`);
  }
  await fs.mkdir(PUBLIC_UPLOADS, { recursive: true });
  await fs.mkdir(DATA_UPLOADS, { recursive: true });

  const name = `${Date.now()}-${randomUUID().slice(0, 8)}.${extFor(mime, opts.filename)}`;
  const publicPath = path.join(PUBLIC_UPLOADS, name);
  const dataPath = path.join(DATA_UPLOADS, name);
  await fs.writeFile(publicPath, buffer);
  // Mirror into data/uploads for backup on deploys that wipe public
  await fs.writeFile(dataPath, buffer).catch(() => undefined);

  return { url: `/uploads/${name}`, absolutePath: publicPath };
}

export async function saveBase64Photo(
  dataUrlOrB64: string,
  filename?: string
): Promise<{ url: string; absolutePath: string }> {
  let mime = "image/jpeg";
  let b64 = dataUrlOrB64;
  const m = /^data:([^;]+);base64,([\s\S]+)$/.exec(dataUrlOrB64);
  if (m) {
    mime = m[1];
    b64 = m[2];
  }
  const buffer = Buffer.from(b64, "base64");
  if (buffer.length === 0) throw new Error("Photo vide");
  if (buffer.length > 8 * 1024 * 1024) throw new Error("Photo trop lourde (max 8 Mo)");
  return saveUploadBuffer(buffer, { mime, filename });
}

export async function saveFilePhoto(
  file: File
): Promise<{ url: string; absolutePath: string }> {
  if (file.size > 8 * 1024 * 1024) throw new Error("Photo trop lourde (max 8 Mo)");
  const buffer = Buffer.from(await file.arrayBuffer());
  return saveUploadBuffer(buffer, { mime: file.type || "image/jpeg", filename: file.name });
}
