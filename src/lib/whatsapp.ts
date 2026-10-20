import { site } from "./site";

export type WhatsAppResult = {
  ok: boolean;
  channel: "meta" | "callmebot" | "manual";
  detail?: string;
  waLink: string;
};

/**
 * Sends a WhatsApp message to the business owner.
 *
 * Provider priority (first configured wins):
 *   1. Meta WhatsApp Cloud API  -> WHATSAPP_TOKEN + WHATSAPP_PHONE_NUMBER_ID
 *   2. CallMeBot (free)         -> CALLMEBOT_PHONE + CALLMEBOT_APIKEY
 *   3. Manual fallback          -> returns a wa.me deep link the UI can offer
 */
export async function sendOwnerWhatsApp(
  text: string,
  toOverride?: string,
): Promise<WhatsAppResult> {
  const to = (toOverride || process.env.WHATSAPP_TO || site.whatsapp).replace(/[^\d]/g, "");
  const waLink = `https://wa.me/${to}?text=${encodeURIComponent(text)}`;

  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const cbPhone = process.env.CALLMEBOT_PHONE;
  const cbKey = process.env.CALLMEBOT_APIKEY;
  const provider = (process.env.WHATSAPP_PROVIDER || "").trim().toLowerCase();

  const metaConfigured = Boolean(token && phoneNumberId);
  const callMeBotConfigured = Boolean(cbPhone && cbKey);
  const tryMeta =
    provider === "meta" ? metaConfigured : provider === "callmebot" ? false : metaConfigured;
  const tryCallMeBot =
    provider === "callmebot"
      ? callMeBotConfigured
      : provider === "meta"
        ? false
        : !metaConfigured && callMeBotConfigured;

  if (tryMeta && token && phoneNumberId) {
    try {
      const res = await fetch(
        `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to,
            type: "text",
            text: { preview_url: false, body: text },
          }),
        },
      );
      if (!res.ok) {
        const detail = await res.text();
        return { ok: false, channel: "meta", detail, waLink };
      }
      return { ok: true, channel: "meta", waLink };
    } catch (err) {
      return { ok: false, channel: "meta", detail: String(err), waLink };
    }
  }

  if (tryCallMeBot && cbPhone && cbKey) {
    try {
      const url =
        `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(cbPhone)}` +
        `&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(cbKey)}`;
      const res = await fetch(url, { method: "GET" });
      const body = await res.text();
      const ok = res.ok && /sent|message/i.test(body) && !/error/i.test(body);
      return { ok, channel: "callmebot", detail: body.slice(0, 200), waLink };
    } catch (err) {
      return { ok: false, channel: "callmebot", detail: String(err), waLink };
    }
  }

  return { ok: false, channel: "manual", detail: "No WhatsApp provider configured", waLink };
}
