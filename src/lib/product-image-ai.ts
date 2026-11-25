import type { Product } from "./products";
import { categories } from "./products";

/* -------------------------------------------------------------------------- */
/* Photorealistic product shots generated with a Gemini image model.          */
/*                                                                            */
/* The model is configurable because Google renames image models often:       */
/*   GEMINI_IMAGE_MODEL           primary model (default below)               */
/*   GEMINI_IMAGE_FALLBACK_MODEL  tried when the primary fails                 */
/* -------------------------------------------------------------------------- */

const DEFAULT_MODEL = "gemini-3.1-flash-image";
const DEFAULT_FALLBACK = "gemini-3-pro-image-preview";

export type GeneratedImage = { bytes: Buffer; mimeType: string; model: string };
export type GenerateResult =
  | { ok: true; image: GeneratedImage }
  | { ok: false; message: string };

export function imageGenerationConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

function cleanModel(value: string | undefined): string | undefined {
  const v = value?.trim().replace(/^models\//, "");
  return v || undefined;
}

export function productImagePrompt(product: Product, extra?: string): string {
  const category = categories.find((c) => c.id === product.category)?.label ?? "Electrical";
  const specs = product.specs
    .slice(0, 5)
    .map((s) => `${s.label}: ${s.value}`)
    .join("; ");
  return [
    "Professional e-commerce product photograph, photorealistic, shot on a DSLR with a 100mm macro lens.",
    `Product: ${product.name}${product.brand ? ` (${product.brand})` : ""}.`,
    `Category: ${category}. Key spec: ${product.keySpec}.`,
    specs ? `Details: ${specs}.` : "",
    `Description: ${product.description.slice(0, 300)}`,
    "Show only the physical product, as it is sold, centred, filling about 70% of the frame,",
    "on a clean seamless light grey studio background with soft diffused lighting, a subtle natural shadow,",
    "accurate real-world materials, colours and proportions, sharp focus, high detail.",
    "Do not add any text, captions, watermarks, price tags, people or hands. Do not invent logos.",
    extra ? `Extra direction from the shop owner: ${extra.slice(0, 300)}` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

type GeminiPart = { inlineData?: { mimeType?: string; data?: string }; text?: string };

async function callModel(model: string, key: string, prompt: string): Promise<GenerateResult> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ["IMAGE"],
          imageConfig: { aspectRatio: "4:3" },
        },
      }),
      signal: AbortSignal.timeout(90_000),
    },
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error(`[product-image-ai] ${model} HTTP ${res.status}: ${detail.slice(0, 300)}`);
    if (res.status === 429) {
      return {
        ok: false,
        message:
          "Gemini says this API key has no image-generation quota left. Image models need billing enabled on the Google AI Studio project (aistudio.google.com → Billing), or wait for the quota to reset.",
      };
    }
    if (res.status === 404) {
      return { ok: false, message: `Image model "${model}" was not found. Set GEMINI_IMAGE_MODEL to a current Gemini image model.` };
    }
    return { ok: false, message: `The image model (${model}) returned HTTP ${res.status}.` };
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: GeminiPart[] }; finishReason?: string }[];
  };
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  const inline = parts.find((p) => p.inlineData?.data)?.inlineData;
  if (!inline?.data) {
    const reason = data.candidates?.[0]?.finishReason ?? "no image returned";
    return { ok: false, message: `The image model (${model}) returned no image (${reason}).` };
  }
  return {
    ok: true,
    image: {
      bytes: Buffer.from(inline.data, "base64"),
      mimeType: inline.mimeType || "image/png",
      model,
    },
  };
}

export async function generateProductImage(
  product: Product,
  extra?: string,
): Promise<GenerateResult> {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) return { ok: false, message: "GEMINI_API_KEY is not set, so AI photos are disabled." };

  const primary = cleanModel(process.env.GEMINI_IMAGE_MODEL) ?? DEFAULT_MODEL;
  const fallback = cleanModel(process.env.GEMINI_IMAGE_FALLBACK_MODEL) ?? DEFAULT_FALLBACK;
  const prompt = productImagePrompt(product, extra);

  let last: GenerateResult = { ok: false, message: "Image generation failed." };
  for (const model of primary === fallback ? [primary] : [primary, fallback]) {
    try {
      last = await callModel(model, key, prompt);
      if (last.ok) return last;
    } catch (err) {
      console.error(`[product-image-ai] ${model} failed`, err);
      last = { ok: false, message: `Couldn't reach the image model (${model}).` };
    }
  }
  return last;
}
