# PhaseForge Electrical and Power Solutions

Marketing website, appointment booking and service-order system for **PhaseForge Electrical** — a licensed electrical contractor serving Accra & Tema, Ghana.

The site collects quote requests, bookings and enquiries, stores them, then notifies the owner via **WhatsApp + email** and sends the customer a confirmation email. A password-protected admin dashboard lets the team triage submissions.

---

## Features

- **Marketing pages** — home, services, about, contact
- **Booking / quote / order forms** with server-side validation (Zod)
- **Photo attachments** — customers can attach up to 5 site photos (stored locally with zero config, or on Cloudinary when configured)
- **Owner notifications** — WhatsApp (Meta Cloud API → CallMeBot → manual `wa.me` fallback) + email via Resend
- **Customer confirmation email** with their reference number
- **Admin dashboard** at `/admin` — filter, search, update status, delete, CSV export
- **Flexible storage** — Postgres (Neon / Vercel Postgres) with a local JSON file fallback
- **Graceful degradation** — every integration is optional; the site runs with zero config

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19 + Tailwind CSS 4 |
| Language | TypeScript |
| Validation | Zod |
| Auth | Signed JWT session cookie (`jose`) |
| Database | `postgres` (Neon / Vercel Postgres) or local JSON fallback |
| Email | Resend |
| Messaging | Meta WhatsApp Cloud API or CallMeBot |

---

## Getting started

**Requirements:** Node.js 20+ (developed on Node 24) and npm.

```powershell
# 1. Install dependencies
npm install

# 2. Configure environment (optional — see below)
Copy-Item .env.example .env.local   # then fill in what you need

# 3. Run the dev server
npm run dev
```

Open <http://localhost:3000>.

> The app runs **without any `.env.local`**. Integrations fall back to safe local behaviour (JSON file storage + a manual WhatsApp button).

---

## Environment variables

Copy `.env.example` to `.env.local`. Everything is optional except `ADMIN_PASSWORD`, which is required for the admin dashboard to accept logins.

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Recommended | Public site URL, used in metadata and emails |
| `NEXT_PUBLIC_OWNER_WHATSAPP` | Optional | Owner number for the floating WhatsApp button |
| `DATABASE_URL` | Optional | Postgres connection string. Omit to use the local JSON store |
| `ADMIN_USERNAME` | For admin | Admin login username (defaults to `admin`) |
| `ADMIN_PASSWORD` | **For admin** | Admin password. Login is rejected if unset |
| `AUTH_SECRET` | Recommended | Long random string that signs the session cookie |
| `RESEND_API_KEY` | Optional | Enables outbound email |
| `EMAIL_FROM` | Optional | Sender address for emails |
| `OWNER_EMAIL` | Optional | Recipient of owner notifications |
| `WHATSAPP_PROVIDER` | Optional | `meta` or `callmebot` (they take priority; otherwise the manual button is used) |
| `WHATSAPP_TO` | Optional | Destination number for accepted messages |
| `CALLMEBOT_PHONE` / `CALLMEBOT_APIKEY` | Optional | CallMeBot credentials |
| `WHATSAPP_TOKEN` / `WHATSAPP_PHONE_NUMBER_ID` | Optional | Meta WhatsApp Cloud API credentials |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_UPLOAD_PRESET` | Optional | Send uploaded photos to your own Cloudinary account. Omit to store them locally |

Generate a strong `AUTH_SECRET`:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server (hot reload) |
| `npm run build` | Create an optimized production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run the TypeScript compiler with no output |

---

## Project structure

```
src/
├─ app/                 # App Router pages + API routes
│  ├─ page.tsx          # Home
│  ├─ services/ about/ contact/ book/
│  ├─ admin/            # Dashboard + login
│  └─ api/              # quote, admin + upload endpoints
├─ components/          # Header, Footer, forms, UI bits
└─ lib/
   ├─ site.ts           # Site config, services, nav
   ├─ validation.ts     # Zod schemas
   ├─ db.ts             # Postgres + JSON fallback store
   ├─ uploads.ts        # Photo uploads (Cloudinary or local disk)
   ├─ upload-limits.ts  # Shared upload limits (client + server)
   ├─ auth.ts           # Session cookie handling
   ├─ email.ts          # Resend integration
   ├─ whatsapp.ts       # WhatsApp providers
   ├─ notify.ts         # Dispatches all notifications
   └─ types.ts          # Shared types
```

### Routes

| Path | Type | Notes |
|---|---|---|
| `/` | Static | Landing page |
| `/services` `/about` `/contact` `/book` | Static | Marketing + booking |
| `/admin` `/admin/login` | Dynamic | Protected dashboard |
| `/api/quote` | Dynamic | Accepts all form submissions |
| `/api/upload` | Dynamic | Validates and stores uploaded photos |
| `/api/uploads/[name]` | Dynamic | Serves locally-stored photos (fallback backend) |
| `/api/admin/*` | Dynamic | Login, logout, submissions, CSV export |

---

## Storage & notifications

**Storage** — `src/lib/db.ts` chooses a backend automatically:

- If `DATABASE_URL` is set, records go to a `submissions` table (created on first use) in Postgres.
- Otherwise, records are written to `.data/submissions.json` (git-ignored, **local development only**).

**Notifications** — `src/lib/notify.ts` fans out to three channels on every submission:

1. **Owner WhatsApp** — tries Meta → CallMeBot in order; if neither is configured it returns a `wa.me` deep link so the dashboard can offer a manual "send" button.
2. **Owner email** — HTML summary via Resend.
3. **Customer email** — confirmation with their reference number.

Missing credentials simply skip the corresponding channel.

**Photo uploads** — `src/lib/uploads.ts` validates every attached image (image type, max 6 MB, max 5 photos) and stores it with one of two backends:

- If `CLOUDINARY_CLOUD_NAME` + `CLOUDINARY_UPLOAD_PRESET` are set, photos go to your Cloudinary account (unsigned upload preset) and the returned `secure_url` is stored.
- Otherwise photos are written to `.data/uploads/` and served from `/api/uploads/<uuid>.<ext>` (git-ignored, **local development only** — configure Cloudinary before deploying, or the serverless filesystem will reject writes and the form will say so).

The stored photo URLs are shown as thumbnails in the admin dashboard and included in the owner's WhatsApp/email notification.

---

## Admin dashboard

1. Set `ADMIN_PASSWORD` (and ideally `ADMIN_USERNAME` + `AUTH_SECRET`) in `.env.local`.
2. Visit `/admin` — you'll be redirected to `/admin/login`.
3. Sign in to view, search, filter by status, update, delete, and export submissions as CSV.

Sessions are stored in an `httpOnly` cookie and expire after 7 days.

---

## Sharing a live demo with a client

To let someone see the site from their own device without deploying, run a production build behind a **Cloudflare quick tunnel**. Use **two terminals**.

**Terminal 1 — serve the site**

```powershell
cd "C:\Users\jacob\OneDrive\Desktop\WEBSITES\Jose"
npm run build
npm start
```

`npm run build` compiles the production build (only needed when code has changed). `npm start` runs `next start` and listens on `http://localhost:3000`. Leave this terminal open — it logs requests as the client browses.

**Terminal 2 — open the tunnel**

```powershell
npx --yes cloudflared tunnel --url http://localhost:3000
```

`--yes` just auto-confirms downloading the `cloudflared` binary the first time. After ~10 seconds it prints a URL such as:

```
|  Your quick Tunnel has been created! Visit it at:  |
|  https://random-words-here.trycloudflare.com      |
```

Send that `https://….trycloudflare.com` link to the client. It's a **new random URL on every launch**.

### Verify before you share

From a new terminal, confirm the public URL responds:

```powershell
Invoke-WebRequest https://YOUR-URL.trycloudflare.com -UseBasicParsing | Select-Object StatusCode
```

You want `StatusCode: 200`.

### Stopping everything

Press **Ctrl+C** in each terminal. Or, to kill the server and tunnel at once:

```powershell
Get-Process cloudflared,node -ErrorAction SilentlyContinue | Stop-Process
```

### Things to know

- **Start the server before the tunnel.** It's fine if the tunnel comes up first — it just returns `502` until `npm start` is ready.
- **The URL dies when Terminal 2 closes.** Quick tunnels have no account, no uptime guarantee, and are meant for tests/demos — not hosting.
- **UI edits need a rebuild.** `npm start` serves the compiled build; re-run `npm run build` after changing code.
- **No `.env.local` = fallback mode.** That's why it works with no config. For admin login, email, or a real database, add `.env.local` *before* running `npm run build`.

---

## Deploying for real

Any Node host works (Vercel is a natural fit for Next.js). Before going live:

1. Set a real `DATABASE_URL` so submissions persist off the local machine.
2. Set `ADMIN_PASSWORD`, `ADMIN_USERNAME` and a strong `AUTH_SECRET`.
3. Set `NEXT_PUBLIC_SITE_URL` to the production domain.
4. Add `RESEND_API_KEY` and WhatsApp credentials to enable notifications.

---

## Notes

- The `.data/` JSON store is **not** suitable for production — use Postgres.
- Default admin password is intentionally absent; without `ADMIN_PASSWORD` set, admin login always fails. This is by design.
