import { site } from "./site";

export type StockStatus = "in" | "low" | "request";

export type ProductArt =
  | "mcb"
  | "rcd"
  | "socket"
  | "switch"
  | "cable"
  | "panel"
  | "floodlight"
  | "batten"
  | "exit"
  | "solar"
  | "inverter"
  | "battery"
  | "controller"
  | "dboard"
  | "conduit"
  | "toolbox"
  | "meter"
  | "changer";

export type Product = {
  slug: string;
  name: string;
  brand: string;
  /** GHS. null = quote-only / on request */
  price: number | null;
  /** unit of sale, e.g. "piece", "90 m coil" */
  unit: string;
  stock: StockStatus;
  /** remaining units when stock is low */
  stockLeft?: number;
  sku: string;
  /** catalogue category (spec §05) */
  category: CategoryId;
  /** homepage merchandising collections */
  collections: CollectionId[];
  /** short headline spec shown on cards */
  keySpec: string;
  specs: { label: string; value: string }[];
  description: string;
  /** compatibility / safety notes */
  notes?: string;
  warranty: string;
  art: ProductArt;
  /** drop a real product photo in /public/products/<slug>.webp to override the illustration */
  image?: string;
};

export type CategoryId =
  | "breakers"
  | "cables"
  | "switches"
  | "conduits"
  | "lighting"
  | "solar"
  | "tools"
  | "accessories";

export const categories: { id: CategoryId; label: string; blurb: string }[] = [
  { id: "breakers", label: "Breakers & Protection", blurb: "MCBs, RCCBs, isolators and distribution boards" },
  { id: "cables", label: "Cables & Wires", blurb: "Single-core, twin and armoured cable by the coil" },
  { id: "switches", label: "Switches, Sockets & Plugs", blurb: "Wired accessories for homes and offices" },
  { id: "conduits", label: "Conduits & Fittings", blurb: "PVC conduit, trunking, boxes and clips" },
  { id: "lighting", label: "LED Lighting", blurb: "Panels, battens, floodlights and emergency lights" },
  { id: "solar", label: "Solar, Inverters & Batteries", blurb: "Panels, inverters, batteries and controllers" },
  { id: "tools", label: "Tools & Testing", blurb: "Testers, meters and insulated hand tools" },
  { id: "accessories", label: "Accessories", blurb: "Everyday electrical consumables" },
];

export type CollectionId =
  | "best-sellers"
  | "new-arrivals"
  | "solar"
  | "contractor"
  | "emergency"
  | "deals";

export const collections: {
  id: CollectionId;
  title: string;
  blurb: string;
  icon: "star" | "sparkle" | "sun" | "briefcase" | "shield" | "bolt";
}[] = [
  {
    id: "best-sellers",
    title: "Best Sellers",
    blurb: "The items Accra electricians reorder most",
    icon: "star",
  },
  {
    id: "new-arrivals",
    title: "New Arrivals",
    blurb: "Fresh stock just landed in the shop",
    icon: "sparkle",
  },
  {
    id: "solar",
    title: "Solar Solutions",
    blurb: "Panels, inverters and batteries for backup power",
    icon: "sun",
  },
  {
    id: "contractor",
    title: "Contractor Supplies",
    blurb: "Bulk-buy essentials for site work and fit-outs",
    icon: "briefcase",
  },
  {
    id: "emergency",
    title: "Emergency Essentials",
    blurb: "Be ready for the next outage — kept in stock",
    icon: "shield",
  },
  {
    id: "deals",
    title: "Lighting Deals",
    blurb: "Sharp prices on LED lighting this month",
    icon: "bolt",
  },
];

export const stockLabel: Record<StockStatus, string> = {
  in: "In stock",
  low: "Low stock",
  request: "On request",
};

export const products: Product[] = [
  {
    slug: "schneider-20a-mcb",
    name: "Schneider 20A MCB (Acti9 iC60N)",
    brand: "Schneider Electric",
    price: 65,
    unit: "piece",
    stock: "in",
    sku: "PF-MCB-SCH-20",
    category: "breakers",
    collections: ["best-sellers", "contractor"],
    keySpec: "20A · 6kA · C-curve",
    specs: [
      { label: "Rated current", value: "20A" },
      { label: "Breaking capacity", value: "6kA" },
      { label: "Curve", value: "Type C (general purpose)" },
      { label: "Poles", value: "1P" },
      { label: "Standard", value: "IEC/EN 60898-1" },
      { label: "Terminals", value: "Up to 25 mm²" },
    ],
    description:
      "Single-pole miniature circuit breaker for lighting and socket circuits. DIN-rail mount, fits standard distribution boards. The go-to breaker for residential and light commercial work.",
    notes: "Pairs with the PhaseForge 12-way distribution board. Compatible with all standard 35 mm DIN rails.",
    warranty: "24 months, manufacturer defect",
    art: "mcb",
  },
  {
    slug: "schneider-32a-mcb",
    name: "Schneider 32A MCB (Acti9 iC60N)",
    brand: "Schneider Electric",
    price: 78,
    unit: "piece",
    stock: "in",
    sku: "PF-MCB-SCH-32",
    category: "breakers",
    collections: ["best-sellers"],
    keySpec: "32A · 6kA · C-curve",
    specs: [
      { label: "Rated current", value: "32A" },
      { label: "Breaking capacity", value: "6kA" },
      { label: "Curve", value: "Type C" },
      { label: "Poles", value: "1P" },
      { label: "Standard", value: "IEC/EN 60898-1" },
    ],
    description:
      "32A single-pole MCB for cooker circuits, water heaters and heavy socket rings. Same Acti9 form factor as the rest of the range.",
    warranty: "24 months, manufacturer defect",
    art: "mcb",
  },
  {
    slug: "abb-63a-mcb",
    name: "ABB 63A MCB (SH200)",
    brand: "ABB",
    price: 96,
    unit: "piece",
    stock: "low",
    stockLeft: 4,
    sku: "PF-MCB-ABB-63",
    category: "breakers",
    collections: ["contractor"],
    keySpec: "63A · 10kA · C-curve",
    specs: [
      { label: "Rated current", value: "63A" },
      { label: "Breaking capacity", value: "10kA" },
      { label: "Curve", value: "Type C" },
      { label: "Poles", value: "1P" },
      { label: "Standard", value: "IEC/EN 60898-1" },
    ],
    description:
      "High breaking-capacity MCB for sub-main and heavy-duty circuits. Ideal for workshop feeders and small commercial distribution.",
    warranty: "24 months, manufacturer defect",
    art: "mcb",
  },
  {
    slug: "chint-63a-mcb",
    name: "Chint 63A MCB (NXB-63)",
    brand: "Chint",
    price: 48,
    unit: "piece",
    stock: "in",
    sku: "PF-MCB-CHN-63",
    category: "breakers",
    collections: ["contractor"],
    keySpec: "63A · 6kA · C-curve",
    specs: [
      { label: "Rated current", value: "63A" },
      { label: "Breaking capacity", value: "6kA" },
      { label: "Curve", value: "Type C" },
      { label: "Poles", value: "1P" },
      { label: "Standard", value: "IEC/EN 60898-1" },
    ],
    description:
      "Budget-friendly 63A MCB that still meets standards. Popular with contractors for tenant fit-outs where quantity matters.",
    warranty: "12 months, manufacturer defect",
    art: "mcb",
  },
  {
    slug: "schneider-40a-rccb",
    name: "Schneider 40A RCCB 30mA (Acti9)",
    brand: "Schneider Electric",
    price: 295,
    unit: "piece",
    stock: "in",
    sku: "PF-RCCB-SCH-40",
    category: "breakers",
    collections: ["best-sellers", "emergency"],
    keySpec: "40A · 30mA · 2-pole",
    specs: [
      { label: "Rated current", value: "40A" },
      { label: "Sensitivity", value: "30mA (shock protection)" },
      { label: "Poles", value: "2P" },
      { label: "Standard", value: "IEC/EN 61008-1" },
      { label: "Type", value: "AC" },
    ],
    description:
      "Residual current circuit breaker — the lifesaver of any distribution board. Detects earth leakage and cuts power fast enough to prevent a fatal shock.",
    notes: "Required by regulation on socket circuits and wet-area circuits. Our electricians recommend one per board at minimum.",
    warranty: "24 months, manufacturer defect",
    art: "rcd",
  },
  {
    slug: "schneider-63a-isolator",
    name: "Schneider 63A Switch Disconnector",
    brand: "Schneider Electric",
    price: 145,
    unit: "piece",
    stock: "in",
    sku: "PF-ISO-SCH-63",
    category: "breakers",
    collections: ["contractor"],
    keySpec: "63A · 4-pole · lockable",
    specs: [
      { label: "Rated current", value: "63A" },
      { label: "Poles", value: "4P" },
      { label: "Mounting", value: "DIN rail / panel" },
      { label: "Lock", value: "Padlockable in OFF position" },
    ],
    description:
      "Main switch disconnector for distribution boards and generator changeover panels. Padlockable for safe maintenance.",
    warranty: "24 months, manufacturer defect",
    art: "changer",
  },
  {
    slug: "12-way-distribution-board",
    name: "PhaseForge 12-Way Distribution Board",
    brand: "PhaseForge",
    price: 240,
    unit: "unit",
    stock: "in",
    sku: "PF-DB-12W",
    category: "breakers",
    collections: ["best-sellers", "contractor"],
    keySpec: "12-way · IP40 · with cover",
    specs: [
      { label: "Ways", value: "12 modules (DIN)" },
      { label: "Enclosure rating", value: "IP40" },
      { label: "Busbar", value: "Pre-fitted, tinned copper" },
      { label: "Incomer", value: "Space for 63A isolator" },
      { label: "Finish", value: "Powder-coated steel, RAL 9003" },
    ],
    description:
      "Fully assembled 12-way board — cut-outs, busbar and neutral links fitted. Saves hours on site versus building a board from scratch.",
    notes: "Breakers sold separately. Our team can pre-fit your chosen MCBs and RCCB before delivery.",
    warranty: "12 months",
    art: "dboard",
  },
  {
    slug: "mk-13a-double-socket",
    name: "MK 13A Double Socket (Metal Clad)",
    brand: "MK Electric",
    price: 88,
    unit: "piece",
    stock: "in",
    sku: "PF-SOCK-MK-13D",
    category: "switches",
    collections: ["best-sellers", "contractor"],
    keySpec: "13A · twin switched · metal clad",
    specs: [
      { label: "Rating", value: "13A, 230V" },
      { label: "Outlets", value: "2 × switched" },
      { label: "Finish", value: "Grey metal clad" },
      { label: "Mounting", value: "Surface" },
      { label: "Standard", value: "BS 1363" },
    ],
    description:
      "Twin switched socket in a tough metal-clad enclosure — the workhorse for workshops, shops and garages where surface wiring is used.",
    warranty: "12 months",
    art: "socket",
  },
  {
    slug: "legrand-13a-socket",
    name: "Legrand 13A Switched Socket (Flush)",
    brand: "Legrand",
    price: 68,
    unit: "piece",
    stock: "in",
    sku: "PF-SOCK-LG-13",
    category: "switches",
    collections: ["contractor"],
    keySpec: "13A · single switched · white",
    specs: [
      { label: "Rating", value: "13A, 230V" },
      { label: "Outlets", value: "1 × switched" },
      { label: "Finish", value: "White moulded" },
      { label: "Mounting", value: "Flush back box required" },
      { label: "Standard", value: "BS 1363" },
    ],
    description:
      "Clean white moulded flush socket for bedrooms, offices and living spaces. Screwless-look faceplate that stays tidy after cleaning.",
    warranty: "12 months",
    art: "socket",
  },
  {
    slug: "mk-2gang-switch",
    name: "MK 2-Gang 2-Way Light Switch",
    brand: "MK Electric",
    price: 45,
    unit: "piece",
    stock: "in",
    sku: "PF-SW-MK-2G",
    category: "switches",
    collections: ["contractor"],
    keySpec: "2-gang · 2-way · 10AX",
    specs: [
      { label: "Rating", value: "10AX, 230V" },
      { label: "Gangs", value: "2, each 2-way" },
      { label: "Finish", value: "White moulded" },
      { label: "Standard", value: "BS EN 60669" },
    ],
    description:
      "Two-gang two-way switch for controlling separate lighting circuits from one plate — halls, open-plan rooms and staircases.",
    warranty: "12 months",
    art: "switch",
  },
  {
    slug: "2-5mm-twin-cable",
    name: "2.5mm² Twin & Earth Cable — 90m Coil",
    brand: "Coleman Cable",
    price: 540,
    unit: "90 m coil",
    stock: "in",
    sku: "PF-CBL-25-90",
    category: "cables",
    collections: ["best-sellers", "contractor"],
    keySpec: "2.5mm² · 90m · 300/500V",
    specs: [
      { label: "Conductor size", value: "2.5 mm²" },
      { label: "Length", value: "90 m coil" },
      { label: "Voltage rating", value: "300/500V" },
      { label: "Cores", value: "Twin + earth (flat)" },
      { label: "Standard", value: "BS 6004" },
    ],
    description:
      "Standard ring-final and socket circuit cable. PVC insulated, easy to pull and terminate. Also used for 32A cooker circuits over short runs.",
    warranty: "Manufacturer defect cover",
    art: "cable",
  },
  {
    slug: "1-5mm-twin-cable",
    name: "1.5mm² Twin & Earth Cable — 90m Coil",
    brand: "Coleman Cable",
    price: 335,
    unit: "90 m coil",
    stock: "in",
    sku: "PF-CBL-15-90",
    category: "cables",
    collections: ["contractor"],
    keySpec: "1.5mm² · 90m · 300/500V",
    specs: [
      { label: "Conductor size", value: "1.5 mm²" },
      { label: "Length", value: "90 m coil" },
      { label: "Voltage rating", value: "300/500V" },
      { label: "Standard", value: "BS 6004" },
    ],
    description:
      "Lighting circuit cable — the standard 6A/10A lighting ring wire for homes and offices.",
    warranty: "Manufacturer defect cover",
    art: "cable",
  },
  {
    slug: "4mm-twin-cable",
    name: "4.0mm² Twin & Earth Cable — 90m Coil",
    brand: "Coleman Cable",
    price: 815,
    unit: "90 m coil",
    stock: "request",
    sku: "PF-CBL-40-90",
    category: "cables",
    collections: ["contractor"],
    keySpec: "4.0mm² · 90m · heavy duty",
    specs: [
      { label: "Conductor size", value: "4.0 mm²" },
      { label: "Length", value: "90 m coil" },
      { label: "Voltage rating", value: "300/500V" },
      { label: "Standard", value: "BS 6004" },
    ],
    description:
      "Heavy radial and water-heater circuit cable. Held on request — usually available within 2–3 working days.",
    warranty: "Manufacturer defect cover",
    art: "cable",
  },
  {
    slug: "schneider-40w-led-panel",
    name: "Schneider-Partner 40W LED Panel 600×600",
    brand: "Schneider Electric",
    price: 155,
    unit: "piece",
    stock: "in",
    sku: "PF-LED-PNL-40",
    category: "lighting",
    collections: ["deals", "best-sellers"],
    keySpec: "40W · 4000K · 3600lm",
    specs: [
      { label: "Power", value: "40W" },
      { label: "Colour temperature", value: "4000K neutral white" },
      { label: "Luminous flux", value: "3,600 lm" },
      { label: "Size", value: "600 × 600 mm (grid ceiling)" },
      { label: "Driver", value: "Included, flicker-free" },
      { label: "Lifespan", value: "30,000 hrs" },
    ],
    description:
      "Slim recessed panel for office and shop grid ceilings. Even light distribution, no flicker on camera or video calls.",
    warranty: "24 months",
    art: "panel",
  },
  {
    slug: "4ft-led-batten",
    name: "4ft LED Batten 40W (Twin Pack)",
    brand: "Nova",
    price: 98,
    unit: "twin pack",
    stock: "in",
    sku: "PF-LED-BAT-40",
    category: "lighting",
    collections: ["deals", "contractor"],
    keySpec: "40W · 4000K · IP20",
    specs: [
      { label: "Power", value: "40W per batten" },
      { label: "Colour temperature", value: "4000K" },
      { label: "Length", value: "1.2 m (4 ft)" },
      { label: "Rated life", value: "35,000 hrs" },
      { label: "Pack", value: "2 battens + fixes" },
    ],
    description:
      "Surface LED battens for corridors, shops, kitchens and workshops. Direct replacement for twin fluorescent fittings — no ballast to fail.",
    warranty: "24 months",
    art: "batten",
  },
  {
    slug: "100w-led-floodlight",
    name: "100W LED Floodlight (IP66)",
    brand: "Nova",
    price: 175,
    unit: "piece",
    stock: "in",
    sku: "PF-LED-FLD-100",
    category: "lighting",
    collections: ["deals", "emergency"],
    keySpec: "100W · IP66 · 6000K",
    specs: [
      { label: "Power", value: "100W" },
      { label: "Colour temperature", value: "6000K cool daylight" },
      { label: "Luminous flux", value: "9,000 lm" },
      { label: "Ingress protection", value: "IP66 (rain and dust proof)" },
      { label: "Beam angle", value: "120°" },
    ],
    description:
      "Weatherproof floodlight for compounds, gates, billboards and site security. Aluminium housing, adjustable wall bracket.",
    warranty: "24 months",
    art: "floodlight",
  },
  {
    slug: "led-emergency-bulkhead",
    name: "LED Emergency Bulkhead (3-Hr Backup)",
    brand: "Evolution",
    price: 130,
    unit: "piece",
    stock: "low",
    stockLeft: 6,
    sku: "PF-EM-BLK-3H",
    category: "lighting",
    collections: ["emergency"],
    keySpec: "3W · 3-hour battery backup",
    specs: [
      { label: "Mode", value: "Maintained / non-maintained (switchable)" },
      { label: "Backup duration", value: "3 hours" },
      { label: "Battery", value: "LiFePO4, replaceable" },
      { label: "Ingress protection", value: "IP65" },
      { label: "Standard", value: "BS 5266" },
    ],
    description:
      "Self-contained emergency bulkhead that lights up automatically when mains power fails. Essential for stairs, corridors and exits.",
    notes: "Annual discharge test recommended. We offer a testing and battery-replacement service.",
    warranty: "12 months (battery excluded)",
    art: "exit",
  },
  {
    slug: "led-exit-sign",
    name: "LED Exit Sign (Running Man)",
    brand: "Evolution",
    price: 145,
    unit: "piece",
    stock: "in",
    sku: "PF-EM-EXT-01",
    category: "lighting",
    collections: ["emergency"],
    keySpec: "IP40 · 3-hr backup · 3 formats",
    specs: [
      { label: "Legend", value: "Running man, 3 mounting formats" },
      { label: "Backup duration", value: "3 hours" },
      { label: "Power", value: "2W (LED)" },
      { label: "Standard", value: "BS 5266 / EN 60598-2-22" },
    ],
    description:
      "Illuminated emergency exit sign for offices, shops and multi-storey buildings. Wall, ceiling or suspended mounting from one unit.",
    warranty: "12 months (battery excluded)",
    art: "exit",
  },
  {
    slug: "450w-solar-panel",
    name: "450W Monocrystalline Solar Panel",
    brand: "JA Solar",
    price: 1250,
    unit: "piece",
    stock: "in",
    sku: "PF-SOL-PV-450",
    category: "solar",
    collections: ["solar", "best-sellers"],
    keySpec: "450W · 21.3% efficiency · 25-yr",
    specs: [
      { label: "Peak power", value: "450W (STC)" },
      { label: "Cell technology", value: "Monocrystalline PERC, half-cut" },
      { label: "Efficiency", value: "21.3%" },
      { label: "Dimensions", value: "2094 × 1038 × 35 mm" },
      { label: "Warranty", value: "25-year performance, 12-year product" },
    ],
    description:
      "High-output mono panel sized for Ghanaian sunshine. The core of most PhaseForge rooftop and hybrid backup installations.",
    notes: "Mounting rails and clamps sold separately. Ask us for a free system sizing.",
    warranty: "12-year product / 25-year performance",
    art: "solar",
  },
  {
    slug: "1kva-inverter",
    name: "1kVA / 12V Pure Sine Wave Inverter",
    brand: "Luminous",
    price: 1150,
    unit: "unit",
    stock: "in",
    sku: "PF-SOL-INV-1K",
    category: "solar",
    collections: ["solar", "emergency", "best-sellers"],
    keySpec: "1000VA · pure sine · 12V",
    specs: [
      { label: "Capacity", value: "1000VA / 600W" },
      { label: "Waveform", value: "Pure sine wave" },
      { label: "Battery voltage", value: "12V DC" },
      { label: "Output", value: "230V / 50Hz" },
      { label: "Transfer time", value: "< 20 ms (UPS mode)" },
      { label: "Protection", value: "Overload, short circuit, deep discharge" },
    ],
    description:
      "Compact pure sine inverter for fridges, TVs, fans and lighting during outages. Pure sine output keeps compressors and electronics safe.",
    notes: "Battery sold separately. Sizing: 1kVA comfortably carries a fridge, 2 fans, TV and lights.",
    warranty: "24 months",
    art: "inverter",
  },
  {
    slug: "12v-100ah-battery",
    name: "12V 100Ah Tubular Inverter Battery",
    brand: "Luminous",
    price: 1750,
    unit: "unit",
    stock: "low",
    stockLeft: 3,
    sku: "PF-SOL-BAT-100",
    category: "solar",
    collections: ["solar", "emergency", "best-sellers"],
    keySpec: "100Ah · tubular · 1500 cycles",
    specs: [
      { label: "Voltage / capacity", value: "12V, 100Ah" },
      { label: "Type", value: "Tubular deep-cycle" },
      { label: "Cycle life", value: "~1,500 cycles @ 50% DoD" },
      { label: "Weight", value: "52 kg" },
      { label: "Warranty", value: "24 months" },
    ],
    description:
      "Deep-cycle tubular battery built for daily Ghanaian outage duty. Handles repeated discharge far better than a standard car battery.",
    notes: "Carries 3–5 hours of light load on a 1kVA inverter. Delivery within Greater Accra arranged at checkout.",
    warranty: "24 months pro-rata",
    art: "battery",
  },
  {
    slug: "30a-mppt-controller",
    name: "30A MPPT Solar Charge Controller",
    brand: "Victron Energy",
    price: 480,
    unit: "unit",
    stock: "in",
    sku: "PF-SOL-CTRL-30",
    category: "solar",
    collections: ["solar", "new-arrivals"],
    keySpec: "30A · MPPT · 12/24V auto",
    specs: [
      { label: "Rated current", value: "30A" },
      { label: "System voltage", value: "12V / 24V auto-detect" },
      { label: "Tracking efficiency", value: "Up to 98%" },
      { label: "Bluetooth", value: "Built-in (VictronConnect app)" },
      { label: "Protection", value: "Over-charge, over-discharge, over-temp" },
    ],
    description:
      "MPPT controller squeezes up to 30% more from your panels than a basic PWM unit, and logs performance to your phone over Bluetooth.",
    warranty: "24 months",
    art: "controller",
  },
  {
    slug: "63a-changeover-switch",
    name: "63A Manual Changeover Switch (3-Pole)",
    brand: "Chint",
    price: 195,
    unit: "piece",
    stock: "in",
    sku: "PF-CHG-CHN-63",
    category: "accessories",
    collections: ["emergency", "contractor", "best-sellers"],
    keySpec: "63A · 3-pole · generator transfer",
    specs: [
      { label: "Rated current", value: "63A" },
      { label: "Poles", value: "3P" },
      { label: "Positions", value: "Mains – Off – Generator" },
      { label: "Mounting", value: "Panel / surface" },
      { label: "Standard", value: "IEC 60947-3" },
    ],
    description:
      "Manual changeover switch for safely transferring a building between PHCN/mains and generator supply. Lockable in any position.",
    notes: "Must be installed by a licensed electrician — interlock with the neutral to prevent back-feeding.",
    warranty: "12 months",
    art: "changer",
  },
  {
    slug: "20mm-pvc-conduit",
    name: "20mm PVC Conduit — 3m Length",
    brand: "TCL",
    price: 22,
    unit: "3 m length",
    stock: "in",
    sku: "PF-CND-20-3M",
    category: "conduits",
    collections: ["contractor"],
    keySpec: "20mm · heavy gauge · 3m",
    specs: [
      { label: "Diameter", value: "20 mm" },
      { label: "Length", value: "3 m" },
      { label: "Gauge", value: "Heavy duty" },
      { label: "Material", value: "UV-stabilised PVC" },
      { label: "Standard", value: "BS EN 61386" },
    ],
    description:
      "Heavy-gauge surface conduit for external and industrial wiring. Takes bends, clips and junction boxes from the same system.",
    warranty: "Manufacturer defect cover",
    art: "conduit",
  },
  {
    slug: "digital-clamp-meter",
    name: "Digital Clamp Meter 600A AC/DC",
    brand: "UNI-T",
    price: 520,
    unit: "unit",
    stock: "in",
    sku: "PF-TLS-CLP-600",
    category: "tools",
    collections: ["new-arrivals", "contractor"],
    keySpec: "600A · True RMS · continuity",
    specs: [
      { label: "Current", value: "600A AC/DC via clamp" },
      { label: "Voltage", value: "600V AC/DC" },
      { label: "Measurement", value: "True RMS" },
      { label: "Extra functions", value: "Continuity, resistance, capacitance, Hz" },
      { label: "Safety", value: "CAT III 600V" },
    ],
    description:
      "True-RMS clamp meter for fault finding and load checks without breaking the circuit. Backlit display for dark DB cupboards.",
    notes: "Ships with test leads, temperature probe and carry case.",
    warranty: "12 months",
    art: "meter",
  },
  {
    slug: "insulated-pliers-set",
    name: "VDE Insulated Plier Set (3-Piece)",
    brand: "Knipex",
    price: 395,
    unit: "set",
    stock: "in",
    sku: "PF-TLS-VDE-3",
    category: "tools",
    collections: ["new-arrivals"],
    keySpec: "1000V rated · cutter + combination + long nose",
    specs: [
      { label: "Pieces", value: "Combination, long nose, diagonal cutter" },
      { label: "Insulation", value: "VDE tested to 1000V AC" },
      { label: "Jaws", value: "Chrome-vanadium, induction hardened" },
      { label: "Handles", value: "Multi-component, ergonomic" },
    ],
    description:
      "The three pliers every electrician actually uses, VDE-insulated to 1000V. Induction-hardened cutters slice through solid core all day.",
    warranty: "Lifetime against manufacturing defect",
    art: "toolbox",
  },
];

/* ---------- helpers ---------- */

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function byCollection(id: CollectionId): Product[] {
  return products.filter((p) => p.collections.includes(id));
}

export function byCategory(id: CategoryId): Product[] {
  return products.filter((p) => p.category === id);
}

export const brands: string[] = [...new Set(products.map((p) => p.brand))].sort();

export function formatGHS(amount: number): string {
  return `GHS ${amount.toLocaleString("en-GH")}`;
}

export function searchProducts(params: {
  q?: string;
  category?: string;
  brand?: string;
  collection?: string;
}): Product[] {
  const q = params.q?.trim().toLowerCase();
  return products.filter((p) => {
    if (params.category && p.category !== params.category) return false;
    if (params.brand && p.brand !== params.brand) return false;
    if (params.collection && !p.collections.includes(params.collection as CollectionId))
      return false;
    if (q) {
      const haystack = `${p.name} ${p.brand} ${p.keySpec} ${p.sku} ${p.description}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

/** Message for a WhatsApp order with a single line item */
export function productOrderMessage(p: Product, qty: number): string {
  const lines = [
    `Hello ${site.shortName}, I'd like to order:`,
    ``,
    `• ${p.name} (${p.brand})`,
    `  SKU: ${p.sku}`,
    `  Quantity: ${qty} ${p.unit}${qty > 1 ? "s" : ""}`,
    p.price !== null
      ? `  Price: ${formatGHS(p.price)} each — ${formatGHS(p.price * qty)} total`
      : `  Price: please confirm availability and price`,
    ``,
    `Delivery/Pickup: `,
    `Location: `,
    `My name: `,
  ];
  return lines.join("\n");
}
