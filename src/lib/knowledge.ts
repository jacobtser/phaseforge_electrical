import { listKnowledgeEntries } from "./db";
import { categories, formatGHS, getProduct, products, type Product } from "./products";
import { paystackConfigured } from "./paystack";
import { site } from "./site";
import type { KnowledgeRecord } from "./types";

const onlinePayments = paystackConfigured();

/**
 * The assistant's grounding layer.
 *
 * Built-in entries cover the business facts and the questions customers ask
 * most often. Learned entries come from the admin knowledge page: when the
 * assistant cannot answer something, the question is queued for the team, and
 * the team's answer becomes searchable context for every future conversation.
 *
 * This is retrieval-augmented generation (RAG), not prompt stuffing: only the
 * most relevant facts are added to each request.
 */

export type KnowledgeEntry = {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  source: "built-in" | "learned";
};

export type ProductMatch = {
  product: Product;
  score: number;
};

/* ------------------------------- Text helpers ----------------------------- */

const STOPWORDS = new Set([
  "the",
  "a",
  "an",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "do",
  "does",
  "did",
  "i",
  "me",
  "my",
  "we",
  "our",
  "us",
  "you",
  "your",
  "he",
  "she",
  "it",
  "its",
  "they",
  "them",
  "their",
  "this",
  "that",
  "these",
  "those",
  "to",
  "of",
  "in",
  "on",
  "at",
  "for",
  "with",
  "and",
  "or",
  "but",
  "please",
  "pls",
  "thanks",
  "thank",
  "hello",
  "hi",
  "hey",
  "good",
  "morning",
  "afternoon",
  "evening",
  "can",
  "could",
  "would",
  "should",
  "will",
  "shall",
  "may",
  "might",
  "must",
  "have",
  "has",
  "had",
  "need",
  "want",
  "know",
  "tell",
  "show",
  "give",
  "what",
  "how",
  "much",
  "which",
  "why",
  "when",
  "policy",
  "policies",
  "about",
  "some",
  "any",
  "more",
  "most",
  "very",
  "there",
  "here",
  "just",
  "also",
  "from",
  "by",
  "as",
  "if",
  "so",
  "not",
  "no",
  "yes",
  "ok",
  "okay",
]);

const SYNONYMS: Record<string, string[]> = {
  mcb: ["breaker", "circuit breaker", "miniature circuit breaker"],
  mcbs: ["mcb", "breaker", "circuit breaker"],
  breaker: ["mcb", "circuit breaker"],
  breakers: ["breaker", "mcb", "circuit breaker"],
  rccb: ["rcd", "residual current", "earth leakage", "elcb"],
  rcd: ["rccb", "earth leakage"],
  rcbo: ["rccb", "mcb", "earth leakage"],
  elcb: ["rccb", "earth leakage"],
  socket: ["outlet", "receptacle", "plug"],
  sockets: ["socket", "outlet"],
  outlet: ["socket"],
  switch: ["light switch"],
  switches: ["switch"],
  cable: ["wire", "twin and earth"],
  cables: ["cable", "wire"],
  wire: ["cable"],
  light: ["lighting", "lamp", "led"],
  lights: ["light", "lighting"],
  lighting: ["light", "led"],
  led: ["light", "lighting"],
  solar: ["pv", "photovoltaic", "panel", "inverter", "battery", "backup"],
  panel: ["solar panel", "distribution board", "led panel"],
  panels: ["panel"],
  inverter: ["solar", "backup power", "ups"],
  battery: ["backup power"],
  batteries: ["battery"],
  dumsor: ["power cut", "outage", "backup"],
  ev: ["electric vehicle", "charger"],
  charger: ["ev charger", "charging"],
  db: ["distribution board", "breaker box", "consumer unit"],
  conduit: ["pipe", "trunking"],
  floodlight: ["flood light", "security light"],
  batten: ["strip light", "fluorescent"],
  generator: ["backup power", "changeover"],
  changeover: ["generator", "transfer switch"],
  momo: ["mobile money"],
  paystack: ["card", "online payment"],
  delivery: ["deliver", "shipping", "ship", "courier"],
  deliver: ["delivery"],
  warranty: ["guarantee"],
  guarantee: ["warranty"],
  return: ["refund", "exchange"],
  refund: ["return"],
  install: ["installation", "electrician"],
  installation: ["install", "electrician"],
  electrician: ["installation", "repair", "electrical"],
  repair: ["electrician", "fault"],
  fault: ["repair", "electrician", "emergency"],
  quote: ["quotation", "estimate"],
  quotation: ["quote", "estimate"],
  price: ["cost", "how much", "rate"],
  cost: ["price", "how much"],
  owner: ["founder", "proprietor", "who owns", "management"],
  founder: ["owner", "founded"],
  company: ["business", "phaseforge"],
};

/** Words that describe what the customer wants, not which product. */
const PRODUCT_INTENT_WORDS = new Set([
  "who",
  "what",
  "where",
  "when",
  "why",
  "how",
  "much",
  "price",
  "prices",
  "cost",
  "costs",
  "buy",
  "sell",
  "selling",
  "stock",
  "available",
  "availability",
  "deliver",
  "delivery",
  "pay",
  "payment",
  "book",
  "booking",
  "electrician",
  "install",
  "installation",
  "repair",
  "service",
  "services",
  "quote",
  "quotation",
  "order",
  "track",
  "warranty",
  "return",
  "refund",
  "open",
  "hours",
  "contact",
  "phone",
  "whatsapp",
  "email",
  "owner",
  "founder",
  "company",
  "phaseforge",
  "forge",
  "about",
  "looking",
  "look",
  "help",
  "work",
]);

function cleanText(value: string): string {
  return value
    .toLowerCase()
    .replace(/²/g, "2")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9.]+/g, " ")
    .replace(/\.(?=\s|$)/g, " ")
    .replace(/\s+/g, " ")
    .replace(
      /\b(\d+(?:\.\d+)?)\s+(a|amp|amps|ampere|amperes|ma|mm|mm2|w|kw|v|ah|kva|ka)\b/g,
      (_match, number: string, unit: string) =>
        `${number}${unit.startsWith("amp") || unit === "a" ? "a" : unit}`,
    )
    .trim();
}

function baseTokens(value: string): string[] {
  const cleaned = cleanText(value);
  if (!cleaned) return [];
  const out = new Set<string>();
  for (const raw of cleaned.split(" ")) {
    if (!raw || STOPWORDS.has(raw)) continue;
    out.add(raw);
    if (raw.length > 3 && raw.endsWith("s") && !raw.endsWith("ss")) {
      out.add(raw.slice(0, -1));
    }
  }
  return [...out];
}

function tokenSet(value: string): Set<string> {
  return new Set(baseTokens(value));
}

function expandTokens(tokens: string[]): Set<string> {
  const out = new Set(tokens);
  for (const token of tokens) {
    for (const alias of SYNONYMS[token] ?? []) {
      for (const part of baseTokens(alias)) out.add(part);
    }
  }
  return out;
}

function norm(value: string): string {
  return cleanText(value);
}

/* ------------------------------ Product search ---------------------------- */

const categoryLabels = new Map(categories.map((category) => [category.id, category.label]));

function scoreProduct(
  product: Product,
  exact: Set<string>,
  expanded: Set<string>,
  queryNorm: string,
): number {
  const name = tokenSet(
    `${product.name} ${product.brand} ${product.sku} ${product.keySpec} ${product.category} ${
      categoryLabels.get(product.category) ?? ""
    }`,
  );
  const brand = tokenSet(product.brand);
  const category = tokenSet(`${product.category} ${categoryLabels.get(product.category) ?? ""}`);
  const description = tokenSet(
    `${product.description} ${product.notes ?? ""} ${product.specs
      .map((spec) => `${spec.label} ${spec.value}`)
      .join(" ")}`,
  );

  let score = 0;
  for (const token of exact) {
    if (name.has(token)) score += 6;
    else if (brand.has(token) || category.has(token)) score += 4;
    else if (description.has(token)) score += 1;
  }
  for (const token of expanded) {
    if (exact.has(token)) continue;
    if (name.has(token)) score += 2;
    else if (brand.has(token) || category.has(token)) score += 2;
    else if (description.has(token)) score += 0.5;
  }

  if (queryNorm.length >= 3 && norm(product.name).includes(queryNorm)) score += 5;
  return score;
}

/**
 * Finds catalogue products relevant to a free-text question. Short terms such
 * as "mcb", "db", "ev" and misspellings/plurals are expanded through aliases.
 */
export function searchProducts(query: string, limit = 4): ProductMatch[] {
  const exact = new Set(baseTokens(query).filter((token) => !PRODUCT_INTENT_WORDS.has(token)));
  if (exact.size === 0) return [];
  const expanded = expandTokens([...exact]);
  const queryNorm = norm(query);

  return products
    .map((product) => ({
      product,
      score: scoreProduct(product, exact, expanded, queryNorm),
    }))
    .filter((match) => match.score >= 2)
    .sort(
      (a, b) =>
        b.score - a.score ||
        (a.product.price ?? Number.MAX_SAFE_INTEGER) -
          (b.product.price ?? Number.MAX_SAFE_INTEGER),
    )
    .slice(0, limit);
}

/* ---------------------------- Knowledge retrieval ------------------------- */

function scoreKnowledge(
  entry: KnowledgeEntry,
  exact: Set<string>,
  expanded: Set<string>,
): number {
  const question = tokenSet(entry.question);
  const keywords = tokenSet(entry.keywords.join(" "));
  const answer = tokenSet(entry.answer);

  let score = 0;
  for (const token of exact) {
    // The brand name appears in almost every fact. It must not drown out the
    // actual subject of the question.
    const brand = token === "phaseforge" || token === "forge";
    if (question.has(token) || keywords.has(token)) score += brand ? 1 : 4;
    else if (answer.has(token)) score += brand ? 0.25 : 1;
  }
  for (const token of expanded) {
    if (exact.has(token)) continue;
    const brand = token === "phaseforge" || token === "forge";
    if (question.has(token) || keywords.has(token)) score += brand ? 0.5 : 2;
    else if (answer.has(token)) score += brand ? 0.125 : 0.5;
  }
  return score;
}

export function retrieveKnowledge(
  query: string,
  entries: KnowledgeEntry[],
  limit = 3,
): KnowledgeEntry[] {
  const exact = new Set(baseTokens(query));
  if (exact.size === 0) return [];
  const expanded = expandTokens([...exact]);

  return entries
    .map((entry) => ({ entry, score: scoreKnowledge(entry, exact, expanded) }))
    .filter((match) => match.score >= 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((match) => match.entry);
}

export function toKnowledgeEntry(record: KnowledgeRecord): KnowledgeEntry {
  return {
    id: record.id,
    question: record.question,
    answer: record.answer,
    keywords: record.keywords,
    source: "learned",
  };
}

/* ------------------------------- Built-in facts --------------------------- */

function priceOf(slug: string): string {
  const product = getProduct(slug);
  if (!product) return "price on request";
  return product.price === null
    ? "price on request"
    : `${formatGHS(product.price)} per ${product.unit}`;
}

function ownerAnswer(): string {
  const owner = process.env.BUSINESS_OWNER_NAME?.trim();
  if (owner) {
    return `${site.name} is owned and run by ${owner}. The business is based in Accra and serves Accra, Tema and surrounding areas, with nationwide delivery for online shop orders. For formal company or ownership information, contact ${site.email} or ${site.phones[0].label}.`;
  }
  return `${site.name} is a locally owned and operated Ghanaian electrical contractor. It was founded in Accra and is run by its founding electrical team. We don't publish individual owner details on the website, so I don't want to guess a name. For formal ownership or company-registration information, contact ${site.email} or ${site.phones[0].label} and the team will help.`;
}

const companyAnswer = `${site.name} is an electrical contractor and electrical supplies shop based in ${site.location}. We serve homeowners, landlords, restaurants, offices, warehouses and facilities across ${site.serviceArea}, with nationwide delivery for shop orders. We handle home electrical work, commercial and industrial work, solar and backup power, testing and safety, emergency assistance and projects and contracts. You can read more at /about.`;

const locationAnswer = `We are based in ${site.location} and work across ${site.serviceArea}. Shop orders can be delivered nationwide or collected from our workshop. The exact workshop pickup address is confirmed by the team when your order is ready — we do not publish a walk-in shop address. For directions or to check whether we cover your area, message ${site.phones[0].label}.`;

const hoursAnswer = `Our normal hours are Monday–Friday 7:00 AM–7:00 PM and Saturday 8:00 AM–6:00 PM. Sunday is for the emergency line only. For urgent faults, shocks, burning smells or power failures, call the emergency line on ${site.emergencyPhone.label} to check availability.`;

const deliveryAnswer = `We deliver across Ghana. Checkout offers Greater Accra delivery (same or next day), nationwide delivery (2–4 working days) and workshop pickup. The delivery fee is confirmed by our team after the order — we don't invent a fee online. For a specific address or a large/bulky item, message ${site.phones[0].label} and the team will confirm the best option.`;

const paymentAnswer = onlinePayments
  ? `You can pay online by card or Mobile Money through Paystack at /cart. For a manual order, send Mobile Money to ${site.payments.mobileMoney.label}, use a bank transfer, or pay cash on delivery/pickup after the team confirms your order on WhatsApp. Always use your order reference and send the receipt to ${site.phones[0].label}. Never send card numbers, CVV, PINs or OTPs to anyone.`
  : `We confirm every order on WhatsApp first. Then you can pay by Mobile Money to ${site.payments.mobileMoney.label}, bank transfer, or cash on delivery/pickup. Online card checkout is not available right now. Always use your order reference and send the receipt to ${site.phones[0].label} on WhatsApp.`;

const returnsAnswer = `Sealed-box returns are accepted within 7 days. Installed, cut-to-length or special-order items are excluded. Product warranties depend on the item — typically 12–24 months, while some solar panels carry a 12-year product and 25-year performance warranty. Manufacturer terms apply after inspection. If something is faulty or damaged, message ${site.phones[0].label} with your order reference and photos, and the team will advise on the next step.`;

const mcbAnswer = `An MCB (Miniature Circuit Breaker) automatically switches off a circuit when it is overloaded or short-circuited, protecting the cable and appliances. The rating should match the circuit and cable: lighting is usually 6A/10A, socket circuits 16A/20A, cookers and water heaters 32A, and sub-mains 63A. The breaking capacity also needs to suit the board. We stock the Schneider 20A (${priceOf("schneider-20a-mcb")} — /shop/schneider-20a-mcb), Schneider 32A (${priceOf("schneider-32a-mcb")} — /shop/schneider-32a-mcb), ABB 63A (${priceOf("abb-63a-mcb")} — /shop/abb-63a-mcb) and Chint 63A (${priceOf("chint-63a-mcb")} — /shop/chint-63a-mcb). Tell me what the circuit supplies and I can narrow it down, or book an electrician at /book.`;

const rccbAnswer = `An RCCB (often called an RCD or earth-leakage breaker) protects people from electric shock by detecting current leaking to earth. It does not replace an MCB: a safe board normally has an RCCB/RCD for shock protection plus MCBs on the individual circuits for overload and short-circuit protection. We stock the Schneider 40A RCCB 30mA (${priceOf("schneider-40a-rccb")} — /shop/schneider-40a-rccb). If your board keeps tripping, don't keep resetting it — book an inspection at /book or call ${site.phones[0].label}.`;

const cableAnswer = `We stock twin & earth cable by the 90 m coil: 1.5mm² (${priceOf("1-5mm-twin-cable")} — /shop/1-5mm-twin-cable) for lighting, 2.5mm² (${priceOf("2-5mm-twin-cable")} — /shop/2-5mm-twin-cable) for socket rings, and 4.0mm² (${priceOf("4mm-twin-cable")} — /shop/4mm-twin-cable) for heavy circuits, which is on request. Cable size must match the breaker and the installation method, so don't guess for a new circuit — our electricians can confirm the correct size.`;

const lightingAnswer = `We stock LED panels, battens, floodlights, emergency bulkheads and exit signs for homes, offices, shops and compounds. Popular options include the 40W LED panel (${priceOf("schneider-40w-led-panel")} — /shop/schneider-40w-led-panel), 4ft LED batten twin pack (${priceOf("4ft-led-batten")} — /shop/4ft-led-batten), 100W IP66 floodlight (${priceOf("100w-led-floodlight")} — /shop/100w-led-floodlight) and 3-hour emergency bulkhead (${priceOf("led-emergency-bulkhead")} — /shop/led-emergency-bulkhead). Tell me the room, ceiling type or area you need to light and I can narrow it down.`;

const solarAnswer = `We supply and install solar panels, inverters, batteries and MPPT controllers. Correct sizing depends on your load and how many hours of backup you need — our solar specialist can size it free on ${site.solarEv.label} or through /book. Catalogue examples: 450W panel (${priceOf("450w-solar-panel")} — /shop/450w-solar-panel), 1kVA pure sine inverter (${priceOf("1kva-inverter")} — /shop/1kva-inverter), 12V 100Ah tubular battery (${priceOf("12v-100ah-battery")} — /shop/12v-100ah-battery) and 30A MPPT controller (${priceOf("30a-mppt-controller")} — /shop/30a-mppt-controller).`;

const evAnswer = `We install EV chargers for homes and businesses, including the dedicated circuit, protective devices and a supply/load check. We don't list EV charger hardware prices online because the right unit depends on your vehicle and supply. Book a site assessment at /book, or call the solar and EV specialist line on ${site.solarEv.label} for a quote.`;

const installationAnswer = `We handle electrical repairs, fault finding, rewiring, distribution-board work, lighting, generator and changeover installation, solar, backup power and testing and safety checks across ${site.serviceArea}. Book a visit at /book or request a free, no-obligation quote at /contact. Labour is quoted after we understand the scope, so we don't publish a fixed callout fee. For an urgent fault, call the emergency line on ${site.emergencyPhone.label} to check availability.`;

const bulkAnswer = `Yes — we supply contractors, landlords, facilities teams, developers and businesses. For bulk or project pricing, send the item list and quantities to ${site.phones[0].label} or use /contact. We'll confirm stock, lead time and the best price before you pay.`;

const stockAnswer = `Catalogue items are labelled In stock, Low stock or On request. "On request" means we can usually source it but cannot promise immediate dispatch. "Low stock" shows the remaining catalogue quantity. These are catalogue labels, not a live warehouse count, so confirm current stock on WhatsApp at ${site.phones[0].label} before paying — especially for low-stock, on-request or bulk orders.`;

const orderAnswer = `For an order or payment issue, send your order reference and payment receipt to ${site.phones[0].label} on WhatsApp.${onlinePayments ? " If you paid online, the reference is on the payment confirmation page." : ""} The team can check the payment and update you. I can't change, cancel, refund or track an order from chat, and you should never send card numbers, CVV, PINs or OTPs.`;

const securityAnswer = onlinePayments
  ? `Online card and Mobile Money payments are handled by Paystack, so we never see or store your card number, CVV or PIN. Only pay to the payment details confirmed by our team. If anyone sends you a different number or asks for an OTP, stop and verify with ${site.phones[0].label} first.`
  : `We don't take card details on this website. Only pay to the Mobile Money number or bank details confirmed by our team. If anyone sends you a different number or asks for an OTP, stop and verify with ${site.phones[0].label} first.`;

const emergencyAnswer = `That sounds urgent. Keep everyone away from the electrical equipment. If it is safe to do so, switch off the main breaker; do not touch damaged wiring or wet equipment. Call the emergency services if there is fire or someone has been injured, then call our emergency line on ${site.emergencyPhone.label} to check availability. Do not attempt live electrical work yourself.`;

const contactAnswer = `You can reach the team on WhatsApp or phone at ${site.phones[0].label}, or the alternative line ${site.phones[1].label}. Email is ${site.email}. For solar, inverter, battery, EV or payment questions, use ${site.solarEv.label}. You can also use /contact or /book. I'm the AI assistant, so for anything I can't resolve I'll hand you to a person.`;

const assistantAnswer = `I'm the ${site.shortName} AI assistant. I can help with product prices and stock labels, delivery, payments, bookings, order questions and general electrical guidance. I learn from the questions customers ask: when I can't answer, the team reviews the question and adds the answer so I can help the next customer. For anything urgent or account-specific, a person is available on ${site.phones[0].label}.`;

const pricingAnswer = `Catalogue prices are shown in GHS on each product at /shop and in the product list I can see here. The unit (piece, coil, set, etc.) is shown with each price. Delivery and installation are quoted separately. Tell me the exact product or model and I'll give you the catalogue price; for a bulk or project quote, send the list to ${site.phones[0].label} or use /contact.`;

const brandsAnswer = `We stock genuine products from brands including Schneider Electric, ABB, Legrand, MK Electric, Chint, JA Solar, Victron Energy, Luminous, UNI-T and Knipex. Product warranties are manufacturer-backed; keep your receipt or order reference. If you're comparing a cheaper alternative, tell me the model and I'll help you check the specification rather than guessing from the brand alone.`;

const bookingAnswer = `You can book an electrician at /book or request a quote at /contact. Tell us what the job is, where you are, and whether it is urgent. The team confirms the visit by phone or WhatsApp. For an urgent fault, call the emergency line on ${site.emergencyPhone.label} to check availability instead of waiting for a booking confirmation.`;

const quoteAnswer = `Quotes are free and no-obligation. Use /contact or /book with a short description, your location and any photos, and the team will follow up. We don't publish fixed labour or callout prices because the scope, access and materials vary. For an urgent fault, call the emergency line on ${site.emergencyPhone.label}.`;

const warrantyAnswer = `Product warranties are manufacturer-backed and the exact cover depends on the item — typically 12–24 months for hardware, with longer performance warranties on some solar panels. Keep your order reference and receipt. If something fails, message ${site.phones[0].label} with photos and the team will inspect it and explain the manufacturer process. Any workmanship cover for a job is confirmed with you when the work is quoted.`;

const paymentMethodsAnswer = onlinePayments
  ? `We accept card and Mobile Money through Paystack online, manual Mobile Money to ${site.payments.mobileMoney.label}, bank transfer, and cash on delivery/pickup after the team confirms the order. For manual payments, use your order reference and send the receipt on WhatsApp to ${site.phones[0].label}.`
  : `We accept Mobile Money to ${site.payments.mobileMoney.label}, bank transfer, and cash on delivery/pickup after the team confirms the order. Online card checkout is not available right now. Use your order reference and send the receipt on WhatsApp to ${site.phones[0].label}.`;

export const builtInKnowledge: KnowledgeEntry[] = [
  {
    id: "owner",
    question: "Who owns PhaseForge?",
    answer: ownerAnswer(),
    keywords: [
      "owner",
      "owns",
      "founder",
      "founded",
      "proprietor",
      "ceo",
      "director",
      "management",
      "company",
      "business",
      "who owns phaseforge",
    ],
    source: "built-in",
  },
  {
    id: "company",
    question: "Tell me about PhaseForge",
    answer: companyAnswer,
    keywords: [
      "about",
      "company",
      "business",
      "who are you",
      "history",
      "experience",
      "licensed",
      "contractor",
      "phaseforge",
      "trust",
      "reviews",
      "guarantee",
      "team",
    ],
    source: "built-in",
  },
  {
    id: "location",
    question: "Where are you located?",
    answer: locationAnswer,
    keywords: [
      "where",
      "location",
      "located",
      "address",
      "based",
      "workshop",
      "shop",
      "office",
      "accra",
      "tema",
      "service area",
      "cover",
      "near me",
      "pickup",
      "directions",
    ],
    source: "built-in",
  },
  {
    id: "hours",
    question: "What are your opening hours?",
    answer: hoursAnswer,
    keywords: [
      "hours",
      "open",
      "opening",
      "closing",
      "weekend",
      "saturday",
      "sunday",
      "holiday",
      "available",
      "emergency",
      "what time",
    ],
    source: "built-in",
  },
  {
    id: "delivery",
    question: "Do you deliver?",
    answer: deliveryAnswer,
    keywords: [
      "delivery",
      "deliver",
      "shipping",
      "ship",
      "nationwide",
      "pickup",
      "collection",
      "courier",
      "how long",
      "lead time",
      "delivery fee",
      "cost of delivery",
      "tema",
      "accra",
      "ghana",
    ],
    source: "built-in",
  },
  {
    id: "payments",
    question: "How do I pay?",
    answer: paymentAnswer,
    keywords: [
      "pay",
      "payment",
      "momo",
      "mobile money",
      "card",
      "paystack",
      "bank transfer",
      "cash",
      "invoice",
      "receipt",
      "how do i pay",
      "payment method",
    ],
    source: "built-in",
  },
  {
    id: "payment-methods",
    question: "What payment methods do you accept?",
    answer: paymentMethodsAnswer,
    keywords: [
      "payment methods",
      "accept",
      "card",
      "momo",
      "mobile money",
      "bank transfer",
      "cash",
      "paystack",
    ],
    source: "built-in",
  },
  {
    id: "returns",
    question: "What is your return and warranty policy?",
    answer: returnsAnswer,
    keywords: [
      "return",
      "refund",
      "exchange",
      "warranty",
      "faulty",
      "damaged",
      "broken",
      "guarantee",
      "sealed",
      "7 days",
      "return policy",
      "refund policy",
      "warranty policy",
    ],
    source: "built-in",
  },
  {
    id: "mcb",
    question: "What is an MCB and which one do I need?",
    answer: mcbAnswer,
    keywords: [
      "mcb",
      "mcbs",
      "miniature circuit breaker",
      "breaker",
      "circuit breaker",
      "trip",
      "tripping",
      "overload",
      "amp",
      "amperage",
      "rating",
      "20a",
      "32a",
      "63a",
      "which breaker",
    ],
    source: "built-in",
  },
  {
    id: "rccb",
    question: "What is an RCCB or RCD?",
    answer: rccbAnswer,
    keywords: [
      "rccb",
      "rcd",
      "rcbo",
      "earth leakage",
      "elcb",
      "shock",
      "residual current",
      "30ma",
      "trip switch",
    ],
    source: "built-in",
  },
  {
    id: "cable",
    question: "What cable do I need?",
    answer: cableAnswer,
    keywords: [
      "cable",
      "wire",
      "twin and earth",
      "coil",
      "1.5mm",
      "2.5mm",
      "4mm",
      "wiring",
      "conductor",
    ],
    source: "built-in",
  },
  {
    id: "lighting",
    question: "What lighting do you stock?",
    answer: lightingAnswer,
    keywords: [
      "light",
      "lights",
      "lighting",
      "led",
      "panel",
      "batten",
      "floodlight",
      "emergency light",
      "exit sign",
      "bulb",
      "lamp",
      "security light",
    ],
    source: "built-in",
  },
  {
    id: "solar",
    question: "Do you supply and install solar and backup power?",
    answer: solarAnswer,
    keywords: [
      "solar",
      "panel",
      "inverter",
      "battery",
      "backup",
      "power cut",
      "dumsor",
      "load shedding",
      "mppt",
      "controller",
      "off grid",
      "ups",
    ],
    source: "built-in",
  },
  {
    id: "ev",
    question: "Do you install EV chargers?",
    answer: evAnswer,
    keywords: [
      "ev",
      "electric vehicle",
      "car charger",
      "charging",
      "charger",
      "wallbox",
    ],
    source: "built-in",
  },
  {
    id: "installation",
    question: "Can you install, repair or inspect electrical work?",
    answer: installationAnswer,
    keywords: [
      "electrician",
      "installation",
      "install",
      "repair",
      "fault",
      "wiring",
      "rewire",
      "panel upgrade",
      "inspection",
      "quote",
      "book",
      "booking",
      "appointment",
      "service",
      "labour",
      "labor",
      "emergency",
    ],
    source: "built-in",
  },
  {
    id: "bulk",
    question: "Do you offer bulk or contractor pricing?",
    answer: bulkAnswer,
    keywords: [
      "bulk",
      "wholesale",
      "contractor",
      "trade",
      "quantity",
      "discount",
      "project",
      "supply",
      "developer",
      "landlord",
    ],
    source: "built-in",
  },
  {
    id: "stock",
    question: "Is this product in stock?",
    answer: stockAnswer,
    keywords: [
      "stock",
      "available",
      "availability",
      "in stock",
      "out of stock",
      "low stock",
      "on request",
      "lead time",
      "dispatch",
    ],
    source: "built-in",
  },
  {
    id: "order",
    question: "How do I track or change my order?",
    answer: orderAnswer,
    keywords: [
      "order",
      "reference",
      "track",
      "tracking",
      "status",
      "cancel",
      "change",
      "refund",
      "paid",
      "payment issue",
      "receipt",
    ],
    source: "built-in",
  },
  {
    id: "security",
    question: "Is online payment safe?",
    answer: securityAnswer,
    keywords: [
      "safe",
      "secure",
      "scam",
      "fraud",
      "card details",
      "cvv",
      "otp",
      "pin",
      "trust",
      "payment security",
    ],
    source: "built-in",
  },
  {
    id: "emergency",
    question: "What should I do in an electrical emergency?",
    answer: emergencyAnswer,
    keywords: [
      "emergency",
      "shock",
      "shocked",
      "sparks",
      "sparking",
      "smoke",
      "smoking",
      "fire",
      "burning",
      "urgent",
      "danger",
      "electrocuted",
    ],
    source: "built-in",
  },
  {
    id: "contact",
    question: "How do I contact a person?",
    answer: contactAnswer,
    keywords: [
      "contact",
      "phone",
      "whatsapp",
      "email",
      "human",
      "person",
      "speak to",
      "call",
      "support",
      "help",
      "manager",
    ],
    source: "built-in",
  },
  {
    id: "assistant",
    question: "Who are you and what can you do?",
    answer: assistantAnswer,
    keywords: [
      "who are you",
      "are you human",
      "ai",
      "bot",
      "assistant",
      "robot",
      "chatbot",
      "what can you do",
      "learn",
    ],
    source: "built-in",
  },
  {
    id: "pricing",
    question: "How much does it cost?",
    answer: pricingAnswer,
    keywords: [
      "price",
      "prices",
      "cost",
      "how much",
      "quote",
      "quotation",
      "rate",
      "fee",
      "charge",
    ],
    source: "built-in",
  },
  {
    id: "brands",
    question: "Which brands do you stock?",
    answer: brandsAnswer,
    keywords: [
      "brand",
      "brands",
      "genuine",
      "original",
      "fake",
      "schneider",
      "abb",
      "legrand",
      "mk",
      "chint",
      "victron",
      "luminous",
      "knipex",
      "uni-t",
    ],
    source: "built-in",
  },
  {
    id: "booking",
    question: "How do I book an electrician?",
    answer: bookingAnswer,
    keywords: [
      "book",
      "booking",
      "appointment",
      "visit",
      "schedule",
      "electrician",
      "site visit",
    ],
    source: "built-in",
  },
  {
    id: "quote",
    question: "Do you charge for quotes?",
    answer: quoteAnswer,
    keywords: [
      "quote",
      "quotation",
      "estimate",
      "callout fee",
      "inspection fee",
      "labour cost",
      "installation cost",
      "free quote",
    ],
    source: "built-in",
  },
  {
    id: "warranty",
    question: "What warranty do you offer?",
    answer: warrantyAnswer,
    keywords: [
      "warranty",
      "guarantee",
      "workmanship",
      "cover",
      "faulty",
      "manufacturer",
      "after sales",
    ],
    source: "built-in",
  },
];

/**
 * Built-in facts plus every answer the team has added from the admin learning
 * page. A database failure must never take the assistant offline, so it falls
 * back to the built-in knowledge.
 */
export async function loadKnowledge(): Promise<KnowledgeEntry[]> {
  try {
    const records = await listKnowledgeEntries();
    return [...builtInKnowledge, ...records.map(toKnowledgeEntry)];
  } catch (error) {
    console.error("[assistant] could not load learned knowledge", error);
    return builtInKnowledge;
  }
}
