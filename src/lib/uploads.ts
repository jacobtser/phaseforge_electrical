import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from "./upload-limits";

/* -------------------------------------------------------------------------- */
/* Photo uploads                                                              */
/*                                                                            */
/* Two backends, chosen automatically:                                        */
/*   1. Cloudinary (when CLOUDINARY_CLOUD_NAME + CLOUDINARY_UPLOAD_PRESET)     */
/*   2. Local disk  (zero-config fallback, served via /api/uploads/<file>)     */
/*                                                                            */
/* This replaces the old client code that POSTed straight to a hardcoded      */
/* "demo" Cloudinary cloud and silently swallowed every error.                 */
/* -------------------------------------------------------------------------- */

const UPLOAD_DIR = path.join(process.cwd(), ".data", "uploads");

const EXT_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
  heic: "image/heic",
  heif: "image/heif",
};

/** Filenames are always `<uuid>.<ext>` — never trust the client-supplied name. */
const SAFE_NAME = /^[a-f0-9-]{36}\.(?:jpg|jpeg|png|webp|gif|avif|heic|heif)$/i;

export type UploadSuccess = { ok: true; name: string; url: string };
export type UploadFailure = { ok: false; name: string; message: string };
export type UploadOutcome = UploadSuccess | UploadFailure;

export function isUploadSuccess(o: UploadOutcome): o is UploadSuccess {
  return o.ok;
}

export function cloudinaryConfig(): { cloud: string; preset: string } | null {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const preset = process.env.CLOUDINARY_UPLOAD_PRESET?.trim();
  return cloud && preset ? { cloud, preset } : null;
}

function fail(name: string, message: string): UploadFailure {
  return { ok: false, name, message };
}

async function uploadToCloudinary(
  file: File,
  cloud: string,
  preset: string,
): Promise<string | null> {
  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", preset);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloud)}/image/upload`,
    { method: "POST", body },
  );
  if (!res.ok) return null;
  const data = (await res.json()) as { secure_url?: unknown };
  return typeof data.secure_url === "string" ? data.secure_url : null;
}

/** Identifies an image by its magic bytes; returns the stored extension or null. */
function sniffImageExt(b: Buffer): string | null {
  if (b.length < 12) return null;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  const ascii = (start: number, end: number) => b.toString("latin1", start, end);
  if (ascii(0, 6) === "GIF87a" || ascii(0, 6) === "GIF89a") return "gif";
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "webp";
  if (ascii(4, 8) === "ftyp") {
    const brand = ascii(8, 12);
    if (brand === "avif" || brand === "avis") return "avif";
    if (["heic", "heix", "hevc", "hevx", "mif1", "msf1"].includes(brand)) return "heic";
  }
  return null;
}

/** Validates and stores a single uploaded photo. */
export async function savePhoto(file: File): Promise<UploadOutcome> {
  const label = file.name || "photo";

  if (!file || file.size === 0) {
    return fail(label, "That file is empty.");
  }

  const type = (file.type || "").toLowerCase();
  if (type && !ACCEPTED_IMAGE_TYPES.includes(type)) {
    return fail(label, `"${label}" isn't a supported image — use JPG, PNG, WebP, GIF, AVIF or HEIC.`);
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    const mb = Math.round(MAX_UPLOAD_BYTES / (1024 * 1024));
    return fail(label, `"${label}" is larger than ${mb} MB.`);
  }

  // Trust the bytes, not the client-declared type or filename.
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = sniffImageExt(buffer);
  if (!ext) {
    return fail(label, `"${label}" isn't a supported image — use JPG, PNG, WebP, GIF, AVIF or HEIC.`);
  }

  const cloud = cloudinaryConfig();
  if (cloud) {
    try {
      const url = await uploadToCloudinary(file, cloud.cloud, cloud.preset);
      if (url) return { ok: true, name: label, url };
      return fail(label, `Cloudinary rejected "${label}". Check CLOUDINARY_UPLOAD_PRESET.`);
    } catch {
      return fail(label, `Couldn't reach Cloudinary while uploading "${label}".`);
    }
  }

  const filename = `${crypto.randomUUID()}.${ext}`;

  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer);
  } catch {
    return fail(
      label,
      "Photo storage isn't writable on this host. Set CLOUDINARY_CLOUD_NAME + CLOUDINARY_UPLOAD_PRESET, or send photos over WhatsApp.",
    );
  }

  return { ok: true, name: label, url: `/api/uploads/${filename}` };
}

/** Resolves a stored filename to an absolute path, or null if it's unsafe. */
export function resolveUploadPath(name: string): string | null {
  if (!SAFE_NAME.test(name)) return null;
  return path.join(UPLOAD_DIR, name);
}

export function mimeForUpload(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return EXT_MIME[ext] ?? "application/octet-stream";
}
