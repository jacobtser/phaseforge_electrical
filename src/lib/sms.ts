import { site } from "./site";

export type SmsResult = {
  ok: boolean;
  channel: "arkesel" | "none";
  detail?: string;
  to: string;
};

export function smsConfigured(): boolean {
  return Boolean(process.env.ARKESEL_API_KEY?.trim());
}

/**
 * Keep owner alerts short enough to stay inexpensive. Arkesel bills per
 * 160-character part, so cap the message at roughly three parts.
 */
export function ownerSmsText(text: string): string {
  return text.replace(/\s+/g, " ").trim().slice(0, 450);
}

/**
 * Sends an owner alert by SMS through Arkesel (Ghana).
 * Docs: https://arkesel.com/developer-api/
 */
export async function sendOwnerSms(
  text: string,
  toOverride?: string,
): Promise<SmsResult> {
  const to = (toOverride || process.env.SMS_TO || process.env.WHATSAPP_TO || site.whatsapp)
    .replace(/[^\d]/g, "");

  const key = process.env.ARKESEL_API_KEY?.trim();
  if (!key) {
    return { ok: false, channel: "none", detail: "ARKESEL_API_KEY not set", to };
  }

  const sender = (process.env.ARKESEL_SENDER_ID || "PhaseForge").trim().slice(0, 11);

  try {
    const res = await fetch("https://sms.arkesel.com/api/v2/sms/send", {
      method: "POST",
      headers: {
        "api-key": key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender,
        message: ownerSmsText(text),
        recipients: [`+${to}`],
      }),
      cache: "no-store",
    });

    const body = await res.text();
    let ok = res.ok;
    try {
      const payload = JSON.parse(body) as { status?: string; message?: string };
      ok = ok && payload.status === "success";
    } catch {
      // Keep the HTTP status as the result if Arkesel returns non-JSON.
    }

    return { ok, channel: "arkesel", detail: body.slice(0, 300), to };
  } catch (err) {
    return { ok: false, channel: "arkesel", detail: String(err), to };
  }
}
