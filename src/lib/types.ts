export type SubmissionStatus =
  | "new"
  | "contacted"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";

export const submissionStatuses: SubmissionStatus[] = [
  "new",
  "contacted",
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
];

export type SubmissionRecord = {
  id: string;
  ref: string;
  type: string;
  name: string;
  email: string;
  phone: string;
  serviceCategory: string;
  service: string | null;
  propertyType: string | null;
  address: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  preferredDate: string | null;
  preferredTime: string | null;
  urgency: string;
  budget: string | null;
  details: string;
  photos: string[] | null;
  referral: string | null;
  status: SubmissionStatus;
  source: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NewSubmission = Omit<
  SubmissionRecord,
  "id" | "ref" | "status" | "createdAt" | "updatedAt"
>;

/* --------------------------------- Orders --------------------------------- */

export type OrderStatus = "pending" | "paid" | "failed";

export type OrderItem = {
  slug: string;
  name: string;
  brand: string;
  category: string;
  unit: string;
  qty: number;
  /** Unit price in pesewas (GHS × 100). */
  unitPricePesewas: number;
  /** Line total in pesewas. */
  lineTotalPesewas: number;
};

export type OrderRecord = {
  id: string;
  reference: string;
  status: OrderStatus;
  /** Total charged, in pesewas. */
  amount: number;
  currency: "GHS";
  email: string;
  name: string;
  phone: string;
  location: string | null;
  fulfilment: string;
  items: OrderItem[];
  paystackReference: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NewOrder = Omit<
  OrderRecord,
  "id" | "status" | "paystackReference" | "paidAt" | "createdAt" | "updatedAt"
>;

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function makeRef(): string {
  const now = new Date();
  const y = String(now.getFullYear()).slice(2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  let rand = "";
  for (let i = 0; i < 4; i++) {
    rand += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `PF-${y}${m}${d}-${rand}`;
}
