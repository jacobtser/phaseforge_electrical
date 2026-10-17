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

const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/heic": "heic",
  "image/heif": "heif",
};

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

  const buffer = Buffer.from(await file.arrayBuffer());
  const guessed = MIME_EXT[type] ?? path.extname(label).slice(1).toLowerCase();
  const ext = EXT_MIME[guessed] ? guessed : "jpg";
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
