# PhaseForge production setup

Live site: <https://phaseforge-electrical.vercel.app>

The site works without the optional integrations below, but online payments and
automatic owner alerts stay disabled until their keys are added.

## 1. Paystack (online payments)

Paystack must be created under the business owner's identity. The site uses
Paystack hosted checkout, so only the **secret key** is needed.

1. Create a Ghana account at <https://paystack.com/gh>.
2. Complete the business profile and compliance details.
   - **Starter Business:** government ID, TIN, and a personal bank account or
     mobile money number in the same name.
   - **Registered Business:** certificate of registration/incorporation, the
     relevant registration form, and TIN.
3. Add a settlement bank account or mobile money account.
4. In Paystack, open **Settings → API Keys & Webhooks**.
5. Copy the **test secret key** (`sk_test_...`).
6. Set the **test webhook URL** to:
   `https://phaseforge-electrical.vercel.app/api/paystack/webhook`
7. In Vercel, open **Project → Settings → Environment Variables** and add:
   - `PAYSTACK_SECRET_KEY` = the test secret key
   - Environments: Production, Preview, Development
8. Redeploy the project after adding the key.
9. Run a test checkout. When Paystack activates the account, repeat steps 5–8
   with the **live secret key** (`sk_live_...`) and the live webhook URL.

Never commit the secret key. Checkout stays hidden while the key is absent, and
WhatsApp/manual ordering continues to work.

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
- **Custom domain:** point `phaseforgeelectrical.com` at the Vercel project and
  set `NEXT_PUBLIC_SITE_URL` to the custom domain, then redeploy.

## Environment variable checklist

Required for production:

- `DATABASE_URL`
- `AUTH_SECRET`
- `ADMIN_USERNAME`, `ADMIN_PASSWORD`
- `NEXT_PUBLIC_SITE_URL`
- `GEMINI_API_KEY`

Payments:

- `PAYSTACK_SECRET_KEY`

Owner alerts:

- `ARKESEL_API_KEY`
- `ARKESEL_SENDER_ID`
- `SMS_TO`

Optional:

- `RESEND_API_KEY`, `EMAIL_FROM`, `OWNER_EMAIL`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_UPLOAD_PRESET`
- `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_TEMPLATE_NAME`
- `BUSINESS_OWNER_NAME` (leave blank to keep ownership private)
