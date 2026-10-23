import type { Metadata } from "next";
import { ShopCatalog } from "@/components/shop/ShopCatalog";
import { SolarEvContact } from "@/components/SolarEvContact";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Shop Electrical Materials",
  description:
    "Genuine electrical materials in Ghana — MCBs, RCCBs, cable, LED lighting, solar panels, inverters and batteries from Schneider, ABB, Legrand, MK and Chint. Prices in GHS, delivery across Greater Accra and nationwide.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{
    collection?: string | string[];
    category?: string | string[];
    brand?: string | string[];
    q?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const one = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value);
  const collection = one(params.collection);
  const category = one(params.category);
  const brand = one(params.brand);
  const q = one(params.q);

  return (
    <>
      <section className="section-alt">
        <div className="shell py-12 sm:py-16">
          <p className="eyebrow">Electrical materials shop</p>
          <h1 className="page-title mt-3">Genuine parts, trade-trusted brands</h1>
          <p className="lead mt-4 max-w-2xl">
            Breakers, cable, lighting, solar and tools from Schneider, ABB, Legrand, MK and Chint.
            All prices in GHS. Order online or on WhatsApp — delivery across Greater Accra and
            nationwide, or pickup from our {site.location} workshop.
          </p>
          <SolarEvContact compact className="mt-7 max-w-4xl" />
        </div>
      </section>

      <section className="shell py-10">
        <ShopCatalog
          key={`${collection ?? ""}|${category ?? ""}|${brand ?? ""}|${q ?? ""}`}
          initialCollection={collection}
          initialCategory={category}
          initialBrand={brand}
          initialQuery={q}
        />
      </section>
    </>
  );
}
