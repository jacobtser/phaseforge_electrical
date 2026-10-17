import { site } from "./site";

export type MailInput = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
  text?: string;
};

export type MailResult = {
  ok: boolean;
  skipped?: boolean;
  channel: "resend" | "none";
  detail?: string;
};

const FROM =
  process.env.EMAIL_FROM ||
  `PhaseForge Electrical <onboarding@resend.dev>`;

export function ownerEmail(): string {
  return process.env.OWNER_EMAIL || site.email;
}

export async function sendMail(input: MailInput): Promise<MailResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return { ok: false, skipped: true, channel: "none", detail: "RESEND_API_KEY not set" };
  }
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(key);
    const { error } = await resend.emails.send({
      from: FROM,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      replyTo: input.replyTo,
    });
    if (error) return { ok: false, channel: "resend", detail: error.message };
    return { ok: true, channel: "resend" };
  } catch (err) {
    return { ok: false, channel: "resend", detail: String(err) };
  }
}
