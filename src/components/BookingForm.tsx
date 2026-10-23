"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { serviceGroups, site, waLink } from "@/lib/site";
import { MAX_PHOTOS, MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from "@/lib/upload-limits";
import {
  ArrowRightIcon,
  CalendarIcon,
  CheckIcon,
  ClipboardIcon,
  SearchIcon,
  WhatsAppIcon,
} from "./Icons";

const CATEGORY_OPTIONS = [
  ...serviceGroups.map((group) => ({ value: group.id, label: group.title })),
  { value: "other", label: "Other / not sure yet" },
];

const PROPERTY_TYPES = [
  "House / bungalow",
  "Apartment / flat",
  "Office",
  "Shop / retail",
  "Warehouse / industrial",
  "Hotel / hostel",
  "Other",
];

const URGENCY = [
  { value: "emergency", label: "Emergency — today" },
  { value: "this-week", label: "This week" },
  { value: "flexible", label: "I'm flexible" },
];

const REFERRAL_OPTIONS = [
  "Google search",
  "Facebook",
  "Instagram",
  "TikTok",
  "WhatsApp",
  "Friend or family referral",
  "Returning customer",
  "Saw our van / job site",
  "Walk-in",
  "Other",
];

const TYPE_CARDS = [
  { value: "appointment", label: "Book a visit", hint: "Schedule an on-site assessment", icon: CalendarIcon },
  { value: "order", label: "Order a service", hint: "Request a job to be carried out", icon: ClipboardIcon },
  { value: "quote", label: "Free quote", hint: "Get a price estimate first", icon: SearchIcon },
] as const;

type FormState = {
  type: "appointment" | "order" | "quote" | "contact";
  name: string;
  email: string;
  phone: string;
  serviceCategory: string;
  service: string;
  propertyType: string;
  address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  preferredDate: string;
  preferredTime: string;
  urgency: string;
  budget: string;
  details: string;
  photos: string[];
  referral: string;
  consent: boolean;
  company: string;
};

type Result = {
  ref: string;
  whatsapp: { delivered: boolean; channel: string; waLink: string };
  sms?: { delivered: boolean; channel: string };
  email: { ownerSent: boolean; customerSent: boolean };
};

const inputBase =
  "w-full rounded-xl border border-white/10 bg-ink-900/70 px-3.5 py-2.5 text-sm text-white placeholder:text-mist-500 transition-colors focus:border-volt-400/70 focus:bg-ink-900 focus:outline-none [&>option]:bg-ink-900 [&>option]:text-white";
const labelBase = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-mist-400";

function todayISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export function BookingForm({
  mode = "full",
  defaultCategory = serviceGroups[0].id,
  defaultService = "",
  lockedType,
}: {
  mode?: "full" | "contact";
  defaultCategory?: string;
  defaultService?: string;
  lockedType?: FormState["type"];
}) {
  const isContact = mode === "contact";
  const initialCategory = CATEGORY_OPTIONS.some((option) => option.value === defaultCategory)
    ? defaultCategory
    : serviceGroups[0].id;
  const [form, setForm] = useState<FormState>({
    type: lockedType ?? (isContact ? "contact" : "appointment"),
    name: "",
    email: "",
    phone: "",
    serviceCategory: initialCategory,
    service: defaultService,
    propertyType: "",
    address: "",
    city: "",
    latitude: null,
    longitude: null,
    preferredDate: "",
    preferredTime: "",
    urgency: initialCategory === "emergency" ? "emergency" : "flexible",
    budget: "",
    details: "",
    photos: [],
    referral: "",
    consent: false,
    company: "",
  });
  const [locating, setLocating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [serverError, setServerError] = useState("");

  const serviceOptions = useMemo(
    () => serviceGroups.find((g) => g.id === form.serviceCategory)?.items ?? [],
    [form.serviceCategory],
  );

  const showScheduling = !isContact && form.type === "appointment";

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => {
      if (!e[key as string]) return e;
      const next = { ...e };
      delete next[key as string];
      return next;
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isContact && !form.referral.trim()) {
      setErrors({ referral: "Please tell us how you heard about us." });
      document.getElementById("bf-referral")?.focus();
      return;
    }
    setSubmitting(true);
    setServerError("");
    setErrors({});
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrors(data.errors ?? {});
        setServerError(data.message ?? "Please check the form and try again.");
        return;
      }
      setResult(data.result as Result);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setServerError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function onPickPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const picked = Array.from(input.files ?? []);
    input.value = ""; // allow re-selecting the same file later
    if (picked.length === 0) return;

    setUploadError("");

    const room = MAX_PHOTOS - form.photos.length;
    if (room <= 0) {
      setUploadError(`You can attach up to ${MAX_PHOTOS} photos. Remove one to add another.`);
      return;
    }

    const batch = picked.slice(0, room);
    if (picked.length > room) {
      setUploadError(
        `Only the first ${room} photo${room === 1 ? "" : "s"} could be added — up to ${MAX_PHOTOS} in total.`,
      );
    }

    const tooBig = batch.find((f) => f.size > MAX_UPLOAD_BYTES);
    if (tooBig) {
      setUploadError(`"${tooBig.name}" is larger than ${MAX_UPLOAD_MB} MB.`);
      return;
    }

    setUploading(true);
    try {
      const body = new FormData();
      batch.forEach((f) => body.append("file", f));
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
        files?: { url: string }[];
        failures?: { message: string }[];
      };

      if (res.ok && data.ok && data.files?.length) {
        const urls = data.files.map((f) => f.url);
        setForm((f) => ({ ...f, photos: [...f.photos, ...urls].slice(0, MAX_PHOTOS) }));
        if (data.failures?.length) setUploadError(data.failures[0].message);
      } else {
        setUploadError(
          data.message ?? "Couldn't upload the photo(s). Please try again or send them on WhatsApp.",
        );
      }
    } catch {
      setUploadError("Couldn't upload the photo(s). Check your connection, or send them on WhatsApp.");
    } finally {
      setUploading(false);
    }
  }

  function removePhoto(url: string) {
    setForm((f) => ({ ...f, photos: f.photos.filter((p) => p !== url) }));
    setUploadError("");
  }

  if (result) {
    return <SuccessPanel result={result} isContact={isContact} onReset={() => setResult(null)} />;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      {!isContact && !lockedType && (
        <fieldset>
          <legend className={labelBase}>What do you need?</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {TYPE_CARDS.map((c) => {
              const active = form.type === c.value;
              const Icon = c.icon;
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => set("type", c.value)}
                  className={clsx(
                    "rounded-xl border p-3.5 text-left transition-all",
                    active
                      ? "border-volt-400/70 bg-volt-500/10 shadow-[0_0_24px_-10px_rgba(241,190,41,0.8)]"
                      : "border-white/10 bg-ink-900/60 hover:border-white/20",
                  )}
                  aria-pressed={active}
                >
                  <Icon className={clsx("h-5 w-5", active ? "text-volt-300" : "text-mist-400")} />
                  <div className="mt-2 text-sm font-semibold text-white">{c.label}</div>
                  <div className="text-xs text-mist-400">{c.hint}</div>
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" error={errors.name} htmlFor="bf-name">
          <input
            id="bf-name"
            className={inputBase}
            placeholder="e.g. Ama Mensah"
            autoComplete="name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
          />
        </Field>
        <Field label="Phone / WhatsApp" error={errors.phone} htmlFor="bf-phone">
          <input
            id="bf-phone"
            className={inputBase}
            placeholder="e.g. 055 281 3116"
            inputMode="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            required
          />
        </Field>
        <Field label="Email" error={errors.email} htmlFor="bf-email">
          <input
            id="bf-email"
            type="email"
            className={inputBase}
            placeholder="you@example.com"
            autoComplete="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            required
          />
        </Field>
        <Field label={isContact ? "Subject" : "Service category"} error={errors.serviceCategory} htmlFor="bf-category">
          <select
            id="bf-category"
            className={inputBase}
            value={form.serviceCategory}
            onChange={(e) => {
              set("serviceCategory", e.target.value);
              set("service", "");
            }}
          >
            {CATEGORY_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Specific service" error={errors.service} htmlFor="bf-service" className="sm:col-span-2">
          <input
            id="bf-service"
            className={inputBase}
            list="bf-service-list"
            placeholder="Start typing, or pick from the list"
            value={form.service}
            onChange={(e) => set("service", e.target.value)}
          />
          <datalist id="bf-service-list">
            {serviceOptions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </Field>

        {!isContact && (
          <Field label="Property type" error={errors.propertyType} htmlFor="bf-property">
            <select
              id="bf-property"
              className={inputBase}
              value={form.propertyType}
              onChange={(e) => set("propertyType", e.target.value)}
            >
              <option value="">Select…</option>
              {PROPERTY_TYPES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>
        )}

        <Field label="Urgency" error={errors.urgency} htmlFor="bf-urgency">
          <select
            id="bf-urgency"
            className={inputBase}
            value={form.urgency}
            onChange={(e) => set("urgency", e.target.value)}
          >
            {URGENCY.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </Field>

        {showScheduling && (
          <>
            <Field label="Preferred date" error={errors.preferredDate} htmlFor="bf-date">
              <input
                id="bf-date"
                type="date"
                min={todayISO()}
                className={inputBase}
                value={form.preferredDate}
                onChange={(e) => set("preferredDate", e.target.value)}
              />
            </Field>
            <Field label="Preferred time" error={errors.preferredTime} htmlFor="bf-time">
              <select
                id="bf-time"
                className={inputBase}
                value={form.preferredTime}
                onChange={(e) => set("preferredTime", e.target.value)}
              >
                <option value="">Any time</option>
                <option value="Morning (7:00 – 11:00)">Morning (7:00 – 11:00)</option>
                <option value="Midday (11:00 – 14:00)">Midday (11:00 – 14:00)</option>
                <option value="Afternoon (14:00 – 17:00)">Afternoon (14:00 – 17:00)</option>
                <option value="Evening (17:00 – 19:00)">Evening (17:00 – 19:00)</option>
              </select>
            </Field>
          </>
        )}

        <Field label="Site address" error={errors.address} htmlFor="bf-address">
          <input
            id="bf-address"
            className={inputBase}
            placeholder="Street / area"
            autoComplete="street-address"
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
          />
        </Field>
        <Field label="City / town" error={errors.city} htmlFor="bf-city">
          <input
            id="bf-city"
            className={inputBase}
            placeholder="e.g. Accra, Tema, Spintex…"
            autoComplete="address-level2"
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
          />
        </Field>
        
        <Field label="Location (Accra/Tema GPS)" error={errors.latitude || errors.longitude} htmlFor="bf-gps" className="sm:col-span-2">
          <div className="flex gap-2 flex-wrap items-center">
            <button
              type="button"
              onClick={() => {
                if (!navigator.geolocation) return;
                setLocating(true);
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    setForm((f) => ({ ...f, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
                    setLocating(false);
                  },
                  () => setLocating(false),
                  { enableHighAccuracy: true, timeout: 10000 }
                );
              }}
              disabled={locating}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:border-volt-400/50 disabled:opacity-60"
            >
              {locating ? "Getting location..." : "Use my current GPS location"}
            </button>
            {form.latitude && form.longitude && (
              <span className="text-xs text-mist-400">
                {form.latitude.toFixed(5)}, {form.longitude.toFixed(5)} <a href={`https://maps.google.com/?q=${form.latitude},${form.longitude}`} target="_blank" rel="noopener" className="text-volt-300 ml-1">View on Map</a>
              </span>
            )}
            {(form.latitude || form.longitude) && (
              <button type="button" onClick={() => setForm(f => ({ ...f, latitude: null, longitude: null }))} className="text-xs text-mist-500 hover:text-mist-300">Clear</button>
            )}
          </div>
        </Field>

        {!isContact && (
          <Field label="Budget (optional)" error={errors.budget} htmlFor="bf-budget" className="sm:col-span-2">
            <select
              id="bf-budget"
              className={inputBase}
              value={form.budget}
              onChange={(e) => set("budget", e.target.value)}
            >
              <option value="">Prefer not to say</option>
              <option value="Under GHS 1,000">Under GHS 1,000</option>
              <option value="GHS 1,000 – 5,000">GHS 1,000 – 5,000</option>
              <option value="GHS 5,000 – 20,000">GHS 5,000 – 20,000</option>
              <option value="GHS 20,000+">GHS 20,000+</option>
            </select>
          </Field>
        )}

        <Field
          label={isContact ? "How can we help?" : "Describe the work"}
          error={errors.details}
          htmlFor="bf-details"
          className="sm:col-span-2"
        >
          <textarea
            id="bf-details"
            rows={5}
            className={clsx(inputBase, "resize-y")}
            placeholder="Tell us what's happening, what you need done, and any deadlines…"
            value={form.details}
            onChange={(e) => set("details", e.target.value)}
            required
          />
        </Field>
        <Field label="Photos (optional)" error={uploadError} htmlFor="bf-photos" className="sm:col-span-2">
          <input
            id="bf-photos"
            type="file"
            multiple
            accept="image/*"
            disabled={uploading || form.photos.length >= MAX_PHOTOS}
            onChange={onPickPhotos}
            className={clsx(
              inputBase,
              "file:mr-3 file:rounded-lg file:border-0 file:bg-volt-500/20 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-volt-200 disabled:cursor-not-allowed disabled:opacity-60",
            )}
          />
          <p className="mt-1.5 text-xs text-mist-500">
            JPG, PNG, WebP, GIF, AVIF or HEIC · up to {MAX_UPLOAD_MB} MB each · {form.photos.length}/
            {MAX_PHOTOS} attached.
          </p>
          {uploading && <p className="mt-1 text-xs text-mist-400">Uploading…</p>}
          {form.photos.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-3">
              {form.photos.map((url) => (
                <li key={url} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt="Attached photo"
                    className="h-20 w-20 rounded-lg border border-white/10 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(url)}
                    aria-label="Remove photo"
                    className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-ink-950 text-xs leading-none text-mist-300 ring-1 ring-white/20 transition-colors hover:text-red-300"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Field>
        <Field label="How did you hear about us?" error={errors.referral} htmlFor="bf-referral" className="sm:col-span-2">
          <input
            id="bf-referral"
            className={inputBase}
            list="bf-referral-list"
            autoComplete="off"
            placeholder="Start typing, or pick an option"
            value={form.referral}
            onChange={(e) => set("referral", e.target.value)}
            required={!isContact}
          />
          <datalist id="bf-referral-list">
            {REFERRAL_OPTIONS.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
          <p className="mt-1.5 text-xs text-mist-500">
            {isContact
              ? "Optional — it helps us understand where our customers find us."
              : "This helps us know which channels are reaching customers like you."}
          </p>
        </Field>
      </div>

      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
        value={form.company}
        onChange={(e) => set("company", e.target.value)}
      />

      <label className="flex items-start gap-3 text-sm text-mist-300">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-white/20 bg-ink-900 accent-volt-500"
          checked={form.consent}
          onChange={(e) => set("consent", e.target.checked)}
          required
        />
        <span>
          I agree to be contacted about this request by phone, email or WhatsApp.
          {errors.consent && <span className="mt-1 block text-red-400">{errors.consent}</span>}
        </span>
      </label>

      {serverError && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {serverError}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={submitting}
          className="btn btn-primary"
        >
          {submitting ? "Sending…" : isContact ? "Send message" : "Send request"}
          {!submitting && <ArrowRightIcon className="h-4 w-4" />}
        </button>
        <p className="text-xs text-mist-500">
          We reply fast. Prefer to talk?{" "}
          <a href={`tel:${site.phones[0].tel}`} className="text-volt-300 hover:underline">
            {site.phones[0].label}
          </a>
        </p>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className={labelBase}>
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

function SuccessPanel({
  result,
  isContact,
  onReset,
}: {
  result: Result;
  isContact: boolean;
  onReset: () => void;
}) {
  const smsDelivered = result.sms?.delivered ?? false;
  const waDelivered = result.whatsapp.delivered;
  const channelNote = smsDelivered
    ? "Our team has been alerted by SMS."
    : waDelivered
      ? "Our team has been alerted on WhatsApp."
      : result.email.ownerSent
        ? "Our team has been notified by email."
        : "Your request is logged. Our team will follow up shortly.";
  const emailNote = result.email.customerSent
    ? "A confirmation has been emailed to you."
    : "Your request has been received.";
  const waFallbackText = waLink(
    `Hello PhaseForge, I just submitted a request. My reference is ${result.ref}.`,
  );

  return (
    <div className="rounded-2xl border border-volt-400/30 bg-gradient-to-b from-volt-500/10 to-transparent p-6 sm:p-8">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-volt-400 to-volt-600 text-ink-950 shadow-[0_0_36px_-8px_rgba(241,190,41,0.9)]">
        <CheckIcon className="h-7 w-7" strokeWidth={2.4} />
      </div>
      <h3 className="mt-5 text-2xl font-extrabold text-white">
        {isContact ? "Message sent" : "Request received"}
      </h3>
      <p className="mt-2 text-sm text-mist-300">{emailNote}</p>

      <div className="mt-5 rounded-xl border border-white/10 bg-ink-900/60 p-4">
        <div className="text-xs uppercase tracking-wide text-mist-400">Your reference</div>
        <div className="mt-1 font-mono text-xl font-bold text-volt-300">{result.ref}</div>
      </div>

      <ul className="mt-5 space-y-2.5 text-sm text-mist-300">
        <li className="flex gap-2.5">
          <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-volt-300" />
          {channelNote}
        </li>
        <li className="flex gap-2.5">
          <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-volt-300" />
          We aim to respond within a few hours during working hours.
        </li>
        <li className="flex gap-2.5">
          <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-volt-300" />
          Keep your reference for faster follow-up.
        </li>
      </ul>

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={`${result.whatsapp.waLink || waFallbackText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-wa btn-sm"
        >
          <WhatsAppIcon className="h-5 w-5" />
          {waDelivered
            ? "Open WhatsApp"
            : smsDelivered
              ? "Also send on WhatsApp"
              : "Send details on WhatsApp"}
        </a>
        <button
          type="button"
          onClick={onReset}
          className="btn btn-secondary btn-sm"
        >
          Submit another request
        </button>
      </div>
    </div>
  );
}
