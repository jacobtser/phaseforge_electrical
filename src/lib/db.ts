import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type {
  NewSubmission,
  SubmissionRecord,
  SubmissionStatus,
} from "./types";
import { makeRef } from "./types";
import type postgres from "postgres";

/* -------------------------------------------------------------------------- */
/* Storage backend: Postgres (Neon / Vercel Postgres) with a JSON file        */
/* fallback for local development when DATABASE_URL is not configured.        */
/* -------------------------------------------------------------------------- */

type Sql = ReturnType<typeof postgres>;

declare global {
  var __pfSql: Sql | undefined;
  var __pfTableReady: boolean | undefined;
}

async function getSql(): Promise<Sql | null> {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (globalThis.__pfSql) return globalThis.__pfSql;
  const { default: postgres } = await import("postgres");
  const needsSsl = !/localhost|127\.0\.0\.1/.test(url);
  const sql = postgres(url, {
    ssl: needsSsl ? "require" : false,
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  globalThis.__pfSql = sql;
  return sql;
}

async function ensureTable(sql: Sql) {
  if (globalThis.__pfTableReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS submissions (
      id text PRIMARY KEY,
      ref text UNIQUE NOT NULL,
      type text NOT NULL,
      name text NOT NULL,
      email text NOT NULL,
      phone text NOT NULL,
      service_category text NOT NULL,
      service text,
      property_type text,
      address text,
      city text,
      latitude double precision,
      longitude double precision,
      preferred_date text,
      preferred_time text,
      urgency text NOT NULL,
      budget text,
      details text NOT NULL,
      photos jsonb,
      referral text,
      status text NOT NULL DEFAULT 'new',
      source text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  globalThis.__pfTableReady = true;
}

function rowToRecord(r: Record<string, unknown>): SubmissionRecord {
  return {
    id: String(r.id),
    ref: String(r.ref),
    type: String(r.type),
    name: String(r.name),
    email: String(r.email),
    phone: String(r.phone),
    serviceCategory: String(r.service_category ?? r.serviceCategory ?? "other"),
    service: (r.service as string) ?? null,
    propertyType: (r.property_type as string) ?? null,
    address: (r.address as string) ?? null,
    city: (r.city as string) ?? null,
    latitude: r.latitude != null ? Number(r.latitude) : (r.lat != null ? Number(r.lat) : null),
    longitude: r.longitude != null ? Number(r.longitude) : (r.lng != null ? Number(r.lng) : null),
    preferredDate: (r.preferred_date as string) ?? null,
    preferredTime: (r.preferred_time as string) ?? null,
    urgency: String(r.urgency ?? "flexible"),
    budget: (r.budget as string) ?? null,
    details: String(r.details),
    photos: Array.isArray(r.photos) ? (r.photos as string[]) : (r.photos ? String(r.photos).split(',').filter(Boolean) : null),
    referral: (r.referral as string) ?? null,
    status: (r.status as SubmissionStatus) ?? "new",
    source: (r.source as string) ?? null,
    createdAt: new Date(r.created_at as string).toISOString(),
    updatedAt: new Date(r.updated_at as string).toISOString(),
  };
}

/* ------------------------------- JSON fallback ---------------------------- */

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "submissions.json");

async function readFileStore(): Promise<SubmissionRecord[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw) as SubmissionRecord[];
  } catch {
    return [];
  }
}

async function writeFileStore(rows: SubmissionRecord[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(rows, null, 2), "utf8");
}

/* --------------------------------- Public API ----------------------------- */

export async function isPersistent(): Promise<boolean> {
  return Boolean(process.env.DATABASE_URL);
}

export async function createSubmission(
  data: NewSubmission,
): Promise<SubmissionRecord> {
  const id = crypto.randomUUID();
  const ref = makeRef();
  const now = new Date().toISOString();
  const record: SubmissionRecord = {
    ...data,
    id,
    ref,
    status: "new",
    createdAt: now,
    updatedAt: now,
  };

  const sql = await getSql();
  if (sql) {
    await ensureTable(sql);
    await sql`
      INSERT INTO submissions (
        id, ref, type, name, email, phone, service_category, service,
        property_type, address, city, latitude, longitude, preferred_date, preferred_time,
        urgency, budget, details, photos, referral, status, source, created_at, updated_at
      ) VALUES (
        ${record.id}, ${record.ref}, ${record.type}, ${record.name},
        ${record.email}, ${record.phone}, ${record.serviceCategory},
        ${record.service}, ${record.propertyType}, ${record.address},
        ${record.city}, ${record.latitude}, ${record.longitude}, ${record.preferredDate}, ${record.preferredTime},
        ${record.urgency}, ${record.budget}, ${record.details}, ${record.photos ? JSON.stringify(record.photos) : null}, ${record.referral},
        ${record.status}, ${record.source}, ${record.createdAt}, ${record.updatedAt}
      )
    `;
    return record;
  }

  const rows = await readFileStore();
  rows.unshift(record);
  await writeFileStore(rows);
  return record;
}

export async function listSubmissions(opts?: {
  status?: string;
  q?: string;
  limit?: number;
}): Promise<SubmissionRecord[]> {
  const limit = Math.min(Math.max(opts?.limit ?? 200, 1), 1000);
  const sql = await getSql();

  if (sql) {
    await ensureTable(sql);
    const status = opts?.status && opts.status !== "all" ? opts.status : null;
    const q = opts?.q?.trim();
    const rows = await sql`
      SELECT * FROM submissions
      WHERE (${status}::text IS NULL OR status = ${status})
        AND (
          ${q ?? null}::text IS NULL
          OR name ILIKE ${"%" + (q ?? "") + "%"}
          OR email ILIKE ${"%" + (q ?? "") + "%"}
          OR phone ILIKE ${"%" + (q ?? "") + "%"}
          OR ref ILIKE ${"%" + (q ?? "") + "%"}
          OR referral ILIKE ${"%" + (q ?? "") + "%"}
          OR source ILIKE ${"%" + (q ?? "") + "%"}
          OR service ILIKE ${"%" + (q ?? "") + "%"}
          OR city ILIKE ${"%" + (q ?? "") + "%"}
          OR details ILIKE ${"%" + (q ?? "") + "%"}
        )
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return rows.map((r) => rowToRecord(r as Record<string, unknown>));
  }

  let rows = await readFileStore();
  if (opts?.status && opts.status !== "all") {
    rows = rows.filter((r) => r.status === opts.status);
  }
  const q = opts?.q?.trim().toLowerCase();
  if (q) {
    rows = rows.filter((r) =>
      [r.name, r.email, r.phone, r.ref, r.referral, r.source, r.details, r.service, r.city]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }
  return rows.slice(0, limit);
}

export async function getSubmission(id: string): Promise<SubmissionRecord | null> {
  const sql = await getSql();
  if (sql) {
    await ensureTable(sql);
    const rows = await sql`SELECT * FROM submissions WHERE id = ${id} LIMIT 1`;
    return rows[0] ? rowToRecord(rows[0] as Record<string, unknown>) : null;
  }
  const rows = await readFileStore();
  return rows.find((r) => r.id === id) ?? null;
}

export async function updateStatus(
  id: string,
  status: SubmissionStatus,
): Promise<SubmissionRecord | null> {
  const sql = await getSql();
  if (sql) {
    await ensureTable(sql);
    const rows = await sql`
      UPDATE submissions
      SET status = ${status}, updated_at = now()
      WHERE id = ${id}
      RETURNING *
    `;
    return rows[0] ? rowToRecord(rows[0] as Record<string, unknown>) : null;
  }
  const rows = await readFileStore();
  const idx = rows.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  rows[idx] = { ...rows[idx], status, updatedAt: new Date().toISOString() };
  await writeFileStore(rows);
  return rows[idx];
}

export async function deleteSubmission(id: string): Promise<boolean> {
  const sql = await getSql();
  if (sql) {
    await ensureTable(sql);
    const rows = await sql`DELETE FROM submissions WHERE id = ${id} RETURNING id`;
    return rows.length > 0;
  }
  const rows = await readFileStore();
  const next = rows.filter((r) => r.id !== id);
  if (next.length === rows.length) return false;
  await writeFileStore(next);
  return true;
}

export async function getStats(): Promise<Record<string, number>> {
  const rows = await listSubmissions({ limit: 1000 });
  const stats: Record<string, number> = { all: rows.length };
  for (const r of rows) {
    stats[r.status] = (stats[r.status] ?? 0) + 1;
  }
  return stats;
}
