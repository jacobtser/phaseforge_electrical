import type { OrderRecord, SubmissionRecord } from "./types";
import { formatGHS } from "./products";
import { isSolarOrEvRequest, site } from "./site";
import { sendOwnerWhatsApp } from "./whatsapp";
import { ownerEmail, sendMail } from "./email";

export type DispatchResult = {
  whatsapp: { ok: boolean; channel: string; waLink: string };
  ownerEmail: { ok: boolean; skipped?: boolean };
  customerEmail: { ok: boolean; skipped?: boolean };
};

const typeLabel: Record<string, string> = {
  appointment: "Appointment / Site Visit",
  order: "Service Order",
  quote: "Quote Request",
  contact: "General Enquiry",
};

function line(label: string, value?: string | null) {
  return value ? `${label}: ${value}` : null;
}

export function ownerWhatsAppText(r: SubmissionRecord): string {
  const hasGps = r.latitude != null && r.longitude != null;
  const rows = [
    `NEW ${typeLabel[r.type] ?? r.type}`,
    `Ref: ${r.ref}`,
    isSolarOrEvRequest(r.serviceCategory, r.service, r.details)
      ? `Route: Solar & EV specialist (${site.solarEv.label})`
      : null,
    line("Name", r.name),
    line("Phone", r.phone),
    line("Email", r.email),
    line("Service", [r.serviceCategory, r.service].filter(Boolean).join(" / ")),
    line("Property", r.propertyType),
    line("Address", [r.address, r.city].filter(Boolean).join(", ")),
    hasGps ? `Location (GPS): https://maps.google.com/?q=${r.latitude},${r.longitude}` : null,
    line("Preferred", [r.preferredDate, r.preferredTime].filter(Boolean).join(" ")),
    line("Urgency", r.urgency),
    line("Budget", r.budget),
    line("How they heard about us", r.referral),
    r.photos && r.photos.length ? `Photos (${r.photos.length}): ${r.photos.join(" ")}` : null,
    "",
    "Details:",
    r.details,
  ].filter((x): x is string => x !== null);
  return rows.join("\n");
}

function ownerHtml(r: SubmissionRecord): string {
  const gpsHtml =
    r.latitude != null && r.longitude != null
      ? `${r.latitude.toFixed(6)}, ${r.longitude.toFixed(6)} <a href="https://maps.google.com/?q=${r.latitude},${r.longitude}" style="color:#38bdf8">Open in Maps</a>`
      : null;
  const rows: [string, string, boolean?][] = [
    ["Reference", r.ref],
    ["Type", typeLabel[r.type] ?? r.type],
    ["Name", r.name],
    ["Phone", r.phone],
    ["Email", r.email],
    ["Service", [r.serviceCategory, r.service].filter(Boolean).join(" / ") || "—"],
    ["Property", r.propertyType || "—"],
    ["Address", [r.address, r.city].filter(Boolean).join(", ") || "—"],
    [
      "Location",
      gpsHtml ?? "—",
      Boolean(gpsHtml),
    ],
    ["Preferred", [r.preferredDate, r.preferredTime].filter(Boolean).join(" ") || "—"],
    ["Urgency", r.urgency],
    ["Budget", r.budget || "—"],
    ["How they heard about us", r.referral || "—"],
    ["Photos", r.photos && r.photos.length ? `${r.photos.length} attached` : "—"],
  ];
  return `<!doctype html><html><body style="margin:0;background:#0a0f1c;font-family:Arial,Helvetica,sans-serif;color:#e5edff">
  <div style="max-width:600px;margin:0 auto;padding:24px">
    <div style="background:linear-gradient(135deg,#0ea5e9,#2563eb);border-radius:14px;padding:20px 24px">
      <div style="font-size:13px;letter-spacing:2px;text-transform:uppercase;opacity:.85">PhaseForge</div>
      <div style="font-size:22px;font-weight:700;margin-top:4px">New ${typeLabel[r.type] ?? r.type}</div>
    </div>
    <table style="width:100%;border-collapse:collapse;margin-top:18px;background:#0f172a;border-radius:12px;overflow:hidden">
      ${rows
        .map(
          ([k, v, isHtml], i) =>
            `<tr style="background:${i % 2 ? "#0f172a" : "#111c33"}">
              <td style="padding:10px 14px;color:#8ea3c8;font-size:13px;width:38%">${k}</td>
              <td style="padding:10px 14px;color:#eaf1ff;font-size:14px">${isHtml ? v : escapeHtml(v)}</td>
            </tr>`,
        )
        .join("")}
    </table>
    <div style="margin-top:18px;padding:16px;background:#0f172a;border-radius:12px">
      <div style="color:#8ea3c8;font-size:13px;margin-bottom:6px">Details</div>
      <div style="white-space:pre-wrap;font-size:14px;line-height:1.55">${escapeHtml(r.details)}</div>
    </div>
    <p style="color:#8ea3c8;font-size:12px;margin-top:22px">Submitted ${new Date(r.createdAt).toUTCString()}</p>
  </div></body></html>`;
}

function customerHtml(r: SubmissionRecord): string {
  const dateLine = [r.preferredDate, r.preferredTime].filter(Boolean).join(" ") || "To be confirmed";
  return `<!doctype html><html><body style="margin:0;background:#f4f7fc;font-family:Arial,Helvetica,sans-serif;color:#0b1a33">
  <div style="max-width:600px;margin:0 auto;padding:24px">
    <div style="background:#0a0f1c;border-radius:14px 14px 0 0;padding:22px 24px;color:#fff">
      <div style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#38bdf8">PhaseForge Electrical</div>
      <div style="font-size:22px;font-weight:700;margin-top:4px">Thanks, ${escapeHtml(r.name.split(" ")[0])} — we've got it.</div>
    </div>
    <div style="background:#fff;border-radius:0 0 14px 14px;padding:24px;border:1px solid #e3ebf6;border-top:none">
      <p style="font-size:15px;line-height:1.6;margin-top:0">
        Your request has been received and logged under reference
        <strong style="color:#0284c7">${r.ref}</strong>. A PhaseForge electrician will review it and get back to you
        shortly — usually within a few hours during working hours.
      </p>
      <table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:14px">
        <tr><td style="padding:8px 0;color:#5b6b86;width:40%">Service</td><td>${escapeHtml([r.serviceCategory, r.service].filter(Boolean).join(" / ") || "General")}</td></tr>
        <tr><td style="padding:8px 0;color:#5b6b86">Preferred time</td><td>${escapeHtml(dateLine)}</td></tr>
        <tr><td style="padding:8px 0;color:#5b6b86">Urgency</td><td>${escapeHtml(r.urgency)}</td></tr>
        <tr><td style="padding:8px 0;color:#5b6b86">Contact</td><td>${escapeHtml(r.phone)}</td></tr>
      </table>
      <div style="margin:22px 0;padding:14px 16px;background:#eff6ff;border-radius:10px;font-size:14px">
        Need us sooner, or is this an emergency? Call
        <a href="tel:${site.phones[0].tel}" style="color:#0284c7;font-weight:700">${site.phones[0].label}</a>
        or
        <a href="tel:${site.phones[1].tel}" style="color:#0284c7;font-weight:700">${site.phones[1].label}</a>.
      </div>
      <a href="${site.url}" style="display:inline-block;background:#0ea5e9;color:#03121f;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:10px">Visit our website</a>
      <p style="color:#8595ad;font-size:12px;margin-top:24px">PhaseForge Electrical and Power Solutions · ${site.serviceArea} · ${site.email}</p>
    </div>
  </div></body></html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ------------------------------ Paid orders ------------------------------- */

const fulfilmentLabels: Record<string, string> = {
  "delivery-accra": "Delivery — Greater Accra",
  "delivery-nationwide": "Delivery — Nationwide",
  pickup: "Pickup from workshop",
};

function fulfilmentLabel(value: string): string {
  return fulfilmentLabels[value] ?? value;
}

function orderItemsText(order: OrderRecord): string {
  return order.items
    .map(
      (item) =>
        `• ${item.name} × ${item.qty} — ${formatGHS(item.lineTotalPesewas / 100)}`,
    )
    .join("\n");
}

function orderItemsHtml(order: OrderRecord): string {
  return order.items
    .map(
      (item) => `<tr>
        <td style="padding:8px 10px;border-bottom:1px solid #e3ebf6">${escapeHtml(item.name)}<span style="color:#8595ad"> × ${item.qty}</span></td>
        <td style="padding:8px 10px;border-bottom:1px solid #e3ebf6;text-align:right;white-space:nowrap">${formatGHS(item.lineTotalPesewas / 100)}</td>
      </tr>`,
    )
    .join("");
}

function orderOwnerText(order: OrderRecord): string {
  return [
    "PAYMENT RECEIVED",
    `Order: ${order.reference}`,
    `Amount: ${formatGHS(order.amount / 100)}`,
    `Customer: ${order.name}`,
    `Phone: ${order.phone}`,
    `Email: ${order.email}`,
    `Fulfilment: ${fulfilmentLabel(order.fulfilment)}`,
    order.location ? `Location: ${order.location}` : null,
    "",
    "Items:",
    orderItemsText(order),
  ]
    .filter((x): x is string => x !== null)
    .join("\n");
}

function orderOwnerHtml(order: OrderRecord): string {
  const total = formatGHS(order.amount / 100);
  const rows: [string, string][] = [
    ["Reference", order.reference],
    ["Amount paid", total],
    ["Customer", order.name],
    ["Phone", order.phone],
    ["Email", order.email],
    ["Fulfilment", fulfilmentLabel(order.fulfilment)],
    ["Delivery location", order.location || "—"],
  ];
  return `<!doctype html><html><body style="margin:0;background:#0a0f1c;font-family:Arial,Helvetica,sans-serif;color:#e5edff">
  <div style="max-width:600px;margin:0 auto;padding:24px">
    <div style="background:linear-gradient(135deg,#059669,#0d9488);border-radius:14px;padding:20px 24px">
      <div style="font-size:13px;letter-spacing:2px;text-transform:uppercase;opacity:.85">PhaseForge</div>
      <div style="font-size:22px;font-weight:700;margin-top:4px">Payment received — ${escapeHtml(total)}</div>
    </div>
    <table style="width:100%;border-collapse:collapse;margin-top:18px;background:#0f172a;border-radius:12px;overflow:hidden">
      ${rows
        .map(
          ([k, v], i) =>
            `<tr style="background:${i % 2 ? "#0f172a" : "#111c33"}">
              <td style="padding:10px 14px;color:#8ea3c8;font-size:13px;width:38%">${k}</td>
              <td style="padding:10px 14px;color:#eaf1ff;font-size:14px">${escapeHtml(v)}</td>
            </tr>`,
        )
        .join("")}
    </table>
    <div style="margin-top:18px;padding:16px;background:#0f172a;border-radius:12px">
      <div style="color:#8ea3c8;font-size:13px;margin-bottom:10px">Items</div>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        ${order.items
          .map(
            (item) => `<tr>
              <td style="padding:8px 0;border-bottom:1px solid #25324a">${escapeHtml(item.name)} <span style="color:#8ea3c8">× ${item.qty}</span></td>
              <td style="padding:8px 0;border-bottom:1px solid #25324a;text-align:right;white-space:nowrap">${formatGHS(item.lineTotalPesewas / 100)}</td>
            </tr>`,
          )
          .join("")}
        <tr>
          <td style="padding:10px 0;font-weight:700">Total paid</td>
          <td style="padding:10px 0;text-align:right;font-weight:700;color:#6ee7b7">${escapeHtml(total)}</td>
        </tr>
      </table>
    </div>
    <p style="color:#8ea3c8;font-size:12px;margin-top:22px">Paid ${new Date(order.paidAt ?? order.updatedAt).toUTCString()} · Paystack reference ${escapeHtml(order.reference)}</p>
  </div></body></html>`;
}

function orderCustomerText(order: OrderRecord): string {
  return [
    `Hello ${order.name},`,
    "",
    `We've received your payment of ${formatGHS(order.amount / 100)} for order ${order.reference}.`,
    "",
    "Items:",
    orderItemsText(order),
    "",
    `Fulfilment: ${fulfilmentLabel(order.fulfilment)}`,
    order.location ? `Location: ${order.location}` : null,
    "",
    "We'll contact you shortly to arrange delivery or pickup.",
    `Questions? Call ${site.phones[0].label} or reply to this email.`,
  ]
    .filter((x): x is string => x !== null)
    .join("\n");
}

function orderCustomerHtml(order: OrderRecord): string {
  const total = formatGHS(order.amount / 100);
  const firstName = order.name.split(" ")[0] || order.name;
  const fulfilment =
    order.fulfilment === "pickup"
      ? `Pickup from our workshop in ${site.location}`
      : fulfilmentLabel(order.fulfilment);
  return `<!doctype html><html><body style="margin:0;background:#f4f7fc;font-family:Arial,Helvetica,sans-serif;color:#0b1a33">
  <div style="max-width:600px;margin:0 auto;padding:24px">
    <div style="background:#0a0f1c;border-radius:14px 14px 0 0;padding:22px 24px;color:#fff">
      <div style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#6ee7b7">PhaseForge Electrical</div>
      <div style="font-size:22px;font-weight:700;margin-top:4px">Payment received, ${escapeHtml(firstName)}.</div>
    </div>
    <div style="background:#fff;border-radius:0 0 14px 14px;padding:24px;border:1px solid #e3ebf6;border-top:none">
      <p style="font-size:15px;line-height:1.6;margin-top:0">
        Thank you — we've received <strong>${escapeHtml(total)}</strong> for order
        <strong style="color:#0284c7">${escapeHtml(order.reference)}</strong>.
      </p>
      <table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:14px">
        ${orderItemsHtml(order)}
        <tr>
          <td style="padding:10px 10px;font-weight:700">Total paid</td>
          <td style="padding:10px 10px;text-align:right;font-weight:700">${escapeHtml(total)}</td>
        </tr>
      </table>
      <table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:14px">
        <tr><td style="padding:8px 0;color:#5b6b86;width:40%">Fulfilment</td><td>${escapeHtml(fulfilment)}</td></tr>
        <tr><td style="padding:8px 0;color:#5b6b86">Contact</td><td>${escapeHtml(order.phone)}</td></tr>
        <tr><td style="padding:8px 0;color:#5b6b86">Email</td><td>${escapeHtml(order.email)}</td></tr>
      </table>
      <div style="margin:22px 0;padding:14px 16px;background:#ecfdf5;border-radius:10px;font-size:14px">
        We'll contact you shortly to arrange delivery or pickup. Keep this email as your receipt.
      </div>
      <div style="margin:22px 0;padding:14px 16px;background:#eff6ff;border-radius:10px;font-size:14px">
        Need help? Call
        <a href="tel:${site.phones[0].tel}" style="color:#0284c7;font-weight:700">${site.phones[0].label}</a>
        or
        <a href="tel:${site.phones[1].tel}" style="color:#0284c7;font-weight:700">${site.phones[1].label}</a>.
      </div>
      <a href="${site.url}" style="display:inline-block;background:#0ea5e9;color:#03121f;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:10px">Visit our website</a>
      <p style="color:#8595ad;font-size:12px;margin-top:24px">PhaseForge Electrical and Power Solutions · ${site.serviceArea} · ${site.email}</p>
    </div>
  </div></body></html>`;
}

export async function notifyOrderPaid(order: OrderRecord): Promise<void> {
  const hasSolar = order.items.some((item) => item.category === "solar");
  const ownerText = orderOwnerText(order);

  const [whatsapp, ownerMail, customerMail] = await Promise.all([
    sendOwnerWhatsApp(ownerText, hasSolar ? site.solarEv.whatsapp : undefined),
    sendMail({
      to: ownerEmail(),
      replyTo: order.email,
      subject: `Paid order ${order.reference} — ${order.name} (${formatGHS(order.amount / 100)})`,
      html: orderOwnerHtml(order),
      text: ownerText,
    }),
    sendMail({
      to: order.email,
      replyTo: ownerEmail(),
      subject: `Payment received — ${order.reference}`,
      html: orderCustomerHtml(order),
      text: orderCustomerText(order),
    }),
  ]);

  if (!whatsapp.ok && whatsapp.channel !== "manual") {
    console.warn("[notify] paid-order WhatsApp failed", whatsapp.detail);
  }
  if (!ownerMail.ok && !ownerMail.skipped) {
    console.warn("[notify] paid-order owner email failed", ownerMail.detail);
  }
  if (!customerMail.ok && !customerMail.skipped) {
    console.warn("[notify] paid-order customer email failed", customerMail.detail);
  }
}

export async function dispatchNotifications(r: SubmissionRecord): Promise<DispatchResult> {
  const text = ownerWhatsAppText(r);
  const solarOrEv = isSolarOrEvRequest(r.serviceCategory, r.service, r.details);

  const [whatsapp, ownerMail, customerMail] = await Promise.all([
    sendOwnerWhatsApp(text, solarOrEv ? site.solarEv.whatsapp : undefined),
    sendMail({
      to: ownerEmail(),
      replyTo: r.email,
      subject: `New ${typeLabel[r.type] ?? r.type} — ${r.name} (${r.ref})`,
      html: ownerHtml(r),
      text,
    }),
    sendMail({
      to: r.email,
      replyTo: ownerEmail(),
      subject: `We received your request — ${r.ref}`,
      html: customerHtml(r),
    }),
  ]);

  return {
    whatsapp: { ok: whatsapp.ok, channel: whatsapp.channel, waLink: whatsapp.waLink },
    ownerEmail: { ok: ownerMail.ok, skipped: ownerMail.skipped },
    customerEmail: { ok: customerMail.ok, skipped: customerMail.skipped },
  };
}
