/* Shared upload limits. This module must stay free of Node-only imports so it
 * can be used from both server code and client components. */

export const MAX_PHOTOS = 5;

/** Per-photo size cap (6 MB). */
export const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;

export const MAX_UPLOAD_MB = Math.round(MAX_UPLOAD_BYTES / (1024 * 1024));

/** Image MIME types accepted by the server upload endpoint. */
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/heic",
  "image/heif",
];
