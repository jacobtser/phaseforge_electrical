export const site = {
  name: "PhaseForge Electrical & Power",
  shortName: "PhaseForge",
  tagline: "Power done right, every single time.",
  description:
    "PhaseForge Electrical & Power delivers residential, commercial and backup-power electrical work across Greater Accra. Safety-first, code-compliant and done right the first time.",
  domain: "phaseforge-electrical.com",
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://phaseforge-electrical.com",
  email: "info@phaseforge-electrical.com",
  phones: [
    { label: "+233 55 281 3116", tel: "+233552813116" },
    { label: "+233 24 590 9523", tel: "+233245909523" },
  ],
  /** Emergency line — publish as "call to check availability" unless 24/7 is genuinely staffed. */
  emergencyPhone: { label: "+233 24 722 7789", tel: "+233247227789" },
  whatsapp: process.env.NEXT_PUBLIC_OWNER_WHATSAPP || "233552813116",
  whatsappAlt: "233245909523",
  /** Solar & backup-power enquiries have their own WhatsApp line. */
  solarEv: {
    whatsapp: process.env.NEXT_PUBLIC_SOLAR_WHATSAPP || "233592760553",
    label: "+233 59 276 0553",
  },
  /** Payment details shown after an order/quote is confirmed. */
  payments: {
    mobileMoney: {
      label: "+233 59 276 0553",
      tel: "+233592760553",
      whatsapp: process.env.NEXT_PUBLIC_PAYMENT_WHATSAPP || "233592760553",
    },
    methods: [
      "Card / Mobile Money via Paystack",
      "Mobile Money",
      "Bank transfer",
      "Cash on delivery / pickup",
    ],
  },
  location: "Greater Accra, Ghana",
  serviceArea: "Kasoa, Tema, Kpone, East Legon and wider Greater Accra",
  /** Emergency availability wording — not a 24/7 guarantee. */
  emergency: "Emergency line — call to check availability",
  hours: [
    { day: "Monday – Friday", time: "7:00 AM – 7:00 PM" },
    { day: "Saturday", time: "8:00 AM – 6:00 PM" },
    { day: "Sunday", time: "Closed — emergency line only" },
  ],
} as const;

export type ServiceGroup = {
  id: string;
  title: string;
  short: string;
  blurb: string;
  icon: "home" | "building" | "battery" | "gauge" | "bolt" | "briefcase";
  items: string[];
};

/** The six approved PhaseForge service categories from the specification. */
export const serviceGroups: ServiceGroup[] = [
  {
    id: "home-electrical",
    title: "Home Electrical Services",
    short: "Homes",
    blurb:
      "House wiring and rewiring, fault diagnosis, socket, switch and lighting work, distribution boards, repairs, inspections and maintenance.",
    icon: "home",
    items: [
      "House wiring and rewiring",
      "Fault diagnosis and repairs",
      "Sockets, switches and lighting",
      "Distribution board work",
      "Periodic inspection and maintenance",
      "New build and renovation wiring",
    ],
  },
  {
    id: "commercial-industrial",
    title: "Commercial & Industrial",
    short: "Business",
    blurb:
      "Shops, offices and commercial premises — distribution and wiring, maintenance and three-phase work where qualified.",
    icon: "building",
    items: [
      "Shops, offices and commercial premises",
      "Distribution and wiring",
      "Planned maintenance",
      "Three-phase work (where qualified)",
      "Control panels and industrial faults",
      "Tenant fit-outs and alterations",
    ],
  },
  {
    id: "solar-backup",
    title: "Solar & Backup Power",
    short: "Solar & backup",
    blurb:
      "Solar, inverter, battery and generator systems — planned, installed and maintained so outages never stop you.",
    icon: "battery",
    items: [
      "Site assessment and system planning",
      "Solar / inverter / battery installation",
      "Generator and changeover systems",
      "Backup-power troubleshooting",
      "Battery and inverter maintenance",
      "Load and consumption review",
    ],
  },
  {
    id: "testing-safety",
    title: "Testing & Safety",
    short: "Testing",
    blurb:
      "Electrical condition assessments, protective-device checks, earthing and bonding checks, with written findings.",
    icon: "gauge",
    items: [
      "Electrical condition assessments",
      "Protective-device checks",
      "Earthing and bonding checks",
      "Insulation resistance testing",
      "Written findings report",
      "Remedial recommendations",
    ],
  },
  {
    id: "emergency",
    title: "Emergency Assistance",
    short: "Emergency",
    blurb:
      "Urgent electrical-fault enquiries, safe isolation guidance and dispatch subject to availability.",
    icon: "bolt",
    items: [
      "Urgent fault enquiries",
      "Safe isolation guidance",
      "Dispatch subject to availability",
      "Suspected network or upstream faults",
      "Water ingress and fire damage",
      "Keep away from sparking or live equipment",
    ],
  },
  {
    id: "projects-contracts",
    title: "Projects & Contracts",
    short: "Projects",
    blurb:
      "New builds, renovations, multi-unit properties, bulk materials supply, contractor coordination and maintenance agreements.",
    icon: "briefcase",
    items: [
      "New builds and renovations",
      "Multi-unit and estate properties",
      "Bulk materials supply",
      "Contractor coordination",
      "Scheduled maintenance agreements",
      "Phased project wiring",
    ],
  },
];

export const nav = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

/** Header navigation — includes the Projects section called for in the specification. */
export const headerNav = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/services#projects-contracts", label: "Projects" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function waLink(message: string, number: string = site.whatsapp) {
  const to = number.replace(/\D/g, "");
  return `https://wa.me/${to}?text=${encodeURIComponent(message)}`;
}

/** WhatsApp link for solar, inverter, battery and EV-charging enquiries. */
export function solarEvWaLink(message: string) {
  return waLink(message, site.solarEv.whatsapp);
}

/** True when a request relates to solar/backup power or EV charging. */
export function isSolarOrEvRequest(...values: Array<string | null | undefined>) {
  const text = values.filter(Boolean).join(" ").toLowerCase();
  return /solar|photovoltaic|inverter|battery|backup power|ev\b|electric vehicle|ev charger|ev charging/.test(
    text,
  );
}
