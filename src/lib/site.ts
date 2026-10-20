export const site = {
  name: "PhaseForge Electrical and Power Solutions",
  shortName: "PhaseForge",
  tagline: "Reliable power, expertly forged.",
  description:
    "PhaseForge Electrical and Power Solutions delivers licensed residential, commercial and backup-power electrical work across Accra and Tema. Fast, safe, code-compliant and done right the first time.",
  domain: "phaseforgeelectrical.com",
  url: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://phaseforgeelectrical.com",
  email: "info@phaseforgeelectrical.com",
  phones: [
    { label: "+233 55 281 3116", tel: "+233552813116" },
    { label: "+233 24 590 9523", tel: "+233245909523" },
  ],
  whatsapp: process.env.NEXT_PUBLIC_OWNER_WHATSAPP || "233552813116",
  whatsappAlt: "233245909523",
  /** Solar & EV enquiries have their own WhatsApp line. */
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
    methods: ["Mobile Money", "Bank transfer", "Cash on delivery / pickup"],
  },
  location: "Accra & Tema, Ghana",
  serviceArea: "Accra and Tema environs",
  emergency: "24/7 emergency callouts",
  hours: [
    { day: "Monday – Friday", time: "7:00 AM – 7:00 PM" },
    { day: "Saturday", time: "8:00 AM – 6:00 PM" },
    { day: "Sunday", time: "24/7 emergency callouts" },
  ],
  stats: [
    { value: "10+", label: "Years combined experience" },
    { value: "1,500+", label: "Jobs completed" },
    { value: "24/7", label: "Emergency response" },
  ],
} as const;

export type ServiceGroup = {
  id: string;
  title: string;
  short: string;
  blurb: string;
  icon: "home" | "building" | "battery" | "gauge";
  items: string[];
};

export const serviceGroups: ServiceGroup[] = [
  {
    id: "residential",
    title: "Residential Electrical",
    short: "Homes",
    blurb:
      "Everything a home needs to stay safe and powered — from quick fixes to full rewires and EV charging.",
    icon: "home",
    items: [
      "Electrical repairs and troubleshooting",
      "Panel upgrades and service upgrades",
      "Full home rewiring",
      "Lighting installation and design (indoor & outdoor)",
      "Ceiling fan, outlet and switch installation",
      "Smoke and carbon monoxide detector installation",
      "EV charger installation",
      "Generator installation and transfer switch setup",
      "Whole-home surge protection",
    ],
  },
  {
    id: "commercial",
    title: "Commercial Electrical",
    short: "Business",
    blurb:
      "Reliable, compliant power for shops, offices, warehouses and multi-tenant buildings.",
    icon: "building",
    items: [
      "Tenant improvements and build-outs",
      "Electrical panel and service upgrades",
      "LED lighting upgrades and retrofits",
      "Power distribution and wiring",
      "Emergency lighting and exit signs",
      "Data and low-voltage cabling",
      "Preventive maintenance programs",
    ],
  },
  {
    id: "power",
    title: "Power Solutions",
    short: "Backup",
    blurb:
      "Keep the lights on. We design and install backup systems so outages never stop you.",
    icon: "battery",
    items: [
      "Backup generator systems",
      "Transfer switch installation",
      "Battery backup and UPS systems",
      "Surge protection solutions",
      "Power quality improvements",
      "Energy-efficient system upgrades",
    ],
  },
  {
    id: "specialty",
    title: "Specialty Services",
    short: "Expert",
    blurb:
      "Specialist work that needs a licensed, detail-obsessed electrician.",
    icon: "gauge",
    items: [
      "Electrical safety inspections",
      "Pre-purchase home electrical inspections",
      "Code compliance upgrades",
      "Outdoor and landscape lighting",
      "Hot tub, pool and spa wiring",
      "Dedicated circuits for workshops and heavy equipment",
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
