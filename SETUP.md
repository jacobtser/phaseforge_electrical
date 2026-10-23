# PhaseForge production setup

Live site: <https://phaseforge-electrical.vercel.app>

The site works without the optional integrations below, but online payments and
automatic owner alerts stay disabled until their keys are added.

## 1. Paystack (online payments)

Paystack must be created under the business owner's identity. The site uses
Paystack **hosted checkout**, so only the secret key is needed — card and Mobile
Money details are entered on Paystack's page and never touch this site.

### Create and activate the account

1. Create a Ghana account at <https://paystack.com/gh>.
2. Complete the business profile and compliance details.
   - **Starter Business:** government ID, TIN, and a personal bank account or
     mobile money number in the same name.
   - **Registered Business:** certificate of registration/incorporation, the
     relevant registration form, and TIN.
3. Add a settlement bank account or mobile money account.
4. Wait for Paystack to approve the account for **live** payments. Test mode
   works before approval; live mode does not.

### Add the keys

1. In Paystack, open **Settings → API Keys & Webhooks**.
2. Copy the **secret key**. Test keys start `sk_test_`; live keys start
   `sk_live_`. Never use a public key here and never commit the secret.
3. In Vercel, open **Project → Settings → Environment Variables** and add:
   - `PAYSTACK_SECRET_KEY` = the secret key
   - Environments: Production, Preview, Development
4. Set the webhook URL to:
   `https://phaseforge-electrical.vercel.app/api/paystack/webhook`
   (or `https://phaseforgeelectrical.com/api/paystack/webhook` once the custom
   domain works).
5. Redeploy the project after adding or changing the key.

The payment return URL is built automatically from `NEXT_PUBLIC_SITE_URL`, so
customers always come back to the canonical domain. On localhost it returns to
the local dev server.

### Test, then go live

1. With a test key, add a product to the cart, complete the checkout form and
   pay with a Paystack test card or test Mobile Money number.
2. Confirm the order shows as **paid** in `/admin/orders`, and that the return
   page shows the same reference and amount.
3. When Paystack activates the account, replace the test key with the live key
   and redeploy. Run one small live transaction and refund it from the Paystack
   dashboard.

A test key is intentionally ignored on the live site. If you need to test on
Vercel before activation, add `PAYSTACK_ALLOW_TEST_MODE=true`; remove it when
the live key is in place.

Checkout stays hidden while no valid key is configured, and WhatsApp/manual
ordering continues to work.

Paid orders are always recorded in `/admin/orders`. Owner SMS/email alerts also
need the Arkesel and Resend keys in sections 2 and 5; without them the payment
still succeeds but nobody is notified automatically.

## 2. Arkesel SMS (owner alerts)

Arkesel sends a text message to the owner whenever a quote, booking, contact
message, or paid order arrives.

1. Create an account at <https://account.arkesel.com/signup> and verify your
   email and phone number.
2. Register the sender ID `PhaseForge` (1–11 characters, at least one letter).
3. Open the SMS API section and generate an API key.
4. Buy a small credit pack. GHS 20 is roughly 645–696 SMS credits; each alert is
   capped at about three SMS parts.
5. In Vercel, add:
   - `ARKESEL_API_KEY` = the API key
   - `ARKESEL_SENDER_ID` = `PhaseForge` (already set)
   - `SMS_TO` = `233552813116` (already set; change if alerts should go elsewhere)
6. Redeploy the project.

The API key is server-side only. Do not paste it into chat or commit it.

## 3. Database and admin

Neon Postgres and the admin login are already configured in Vercel. The admin
dashboard is at `/admin/knowledge`; the username is `admin`. To reset the
password, change `ADMIN_PASSWORD` in Vercel and redeploy.

## 4. AI assistant

Gemini is configured with `gemini-3.5-flash` and a `gemini-3.5-flash-lite`
fallback. Free-tier keys have low daily limits; enable billing on the Google AI
Studio key if the assistant falls back too often.

## 5. Optional integrations

- **Resend email:** add `RESEND_API_KEY`, `EMAIL_FROM`, and `OWNER_EMAIL`, then
  verify the sending domain in Resend.
- **Cloudinary uploads:** add `CLOUDINARY_CLOUD_NAME` and
  `CLOUDINARY_UPLOAD_PRESET` so quote photos persist on Vercel.
- **Meta WhatsApp:** add `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, and an
  approved `WHATSAPP_TEMPLATE_NAME` (`phaseforge_owner_alert`, body
  `PhaseForge alert: {{1}}`). SMS remains the primary owner alert channel.
- **Custom domain:** point `phaseforge-electrical.com` at the Vercel project and
  set `NEXT_PUBLIC_SITE_URL` to the custom domain, then redeploy.

## 6. Owner verification before launch

The public site was aligned with
`PhaseForge_Complete_Developer_Implementation_and_Testing_Specification.pdf`.
The following details come from that document and **must be confirmed by the
owner before launch** (spec section 5, "Business identity" / "Credentials and
claims"):

- **Business name:** "PhaseForge Electrical & Power".
- **Slogan:** "POWER DONE RIGHT, every single time."
- **Email:** `info@phaseforge-electrical.com` (note the hyphen). Confirm the
  mailbox exists and is monitored.
- **Emergency line:** `+233 24 722 7789`. The site labels it "call to check
  availability" rather than promising 24/7 cover. If a genuine 24/7 rota is
  staffed, the wording in `src/lib/site.ts` (`emergency`, `hours`) can be
  upgraded.
- **Service areas:** Kasoa, Tema, Kpone, East Legon and wider Greater Accra.
  Confirm dispatch capacity before advertising any area.
- **Service categories:** the six approved categories in
  `src/lib/site.ts` (`serviceGroups`).
- **Credentials and claims:** the site deliberately avoids claims that cannot be
  verified — no "licensed/insured", no job counts, no years of experience, no
  customer testimonials. If the business holds a verified licence, insurance
  policy, or documented review set, add it to `src/lib/site.ts` and the pages.

## Environment variable checklist

Required for production:

- `DATABASE_URL`
- `AUTH_SECRET`
- `ADMIN_USERNAME`, `ADMIN_PASSWORD`
- `NEXT_PUBLIC_SITE_URL`
- `GEMINI_API_KEY`

Payments:

- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_ALLOW_TEST_MODE` (only while intentionally testing on Vercel; leave unset/false in normal use)

Owner alerts:

- `ARKESEL_API_KEY`
- `ARKESEL_SENDER_ID`
- `SMS_TO`

Optional:

- `RESEND_API_KEY`, `EMAIL_FROM`, `OWNER_EMAIL`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_UPLOAD_PRESET`
- `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_TEMPLATE_NAME`
- `BUSINESS_OWNER_NAME` (leave blank to keep ownership private)
