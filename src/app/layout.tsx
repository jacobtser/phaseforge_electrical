import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { site } from "@/lib/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Trusted Electricians in Accra & Tema`,
    template: `%s · ${site.shortName}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "electrician Accra",
    "electrician Tema",
    "electrical contractor Ghana",
    "panel upgrade Ghana",
    "generator installation Accra",
    "EV charger installation Ghana",
    "emergency electrician",
    "PhaseForge Electrical",
  ],
  authors: [{ name: site.name }],
  openGraph: {
    type: "website",
    url: site.url,
    siteName: site.name,
    title: `${site.name} — Trusted Electricians in Accra & Tema`,
    description: site.description,
    locale: "en_GH",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — Trusted Electricians in Accra & Tema`,
    description: site.description,
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo-mark.svg",
    apple: "/logo-mark.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#04070e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Electrician",
    name: site.name,
    description: site.description,
    url: site.url,
    email: site.email,
    telephone: site.phones.map((p) => p.tel),
    areaServed: ["Accra", "Tema", "Greater Accra"],
    address: { "@type": "PostalAddress", addressLocality: "Accra", addressCountry: "GH" },
    openingHours: ["Mo-Fr 07:00-19:00", "Sa 08:00-18:00"],
    priceRange: "GHS",
  };

  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body className="min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-volt-500 focus:px-4 focus:py-2 focus:font-semibold focus:text-ink-950"
        >
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <WhatsAppFloat />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
