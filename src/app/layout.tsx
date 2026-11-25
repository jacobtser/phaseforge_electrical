import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { SupportChat } from "@/components/SupportChat";
import { AppInstall } from "@/components/AppInstall";
import { CartProvider } from "@/lib/cart";
import { ProductImagesProvider } from "@/components/shop/ProductImages";
import { site } from "@/lib/site";
import { jsonLdString } from "@/lib/security";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Electrical Services in Greater Accra`,
    template: `%s · ${site.shortName}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "electrician Accra",
    "electrician Tema",
    "electrical contractor Ghana",
    "distribution board Ghana",
    "generator installation Accra",
    "solar and inverter installation Ghana",
    "emergency electrician",
    "PhaseForge Electrical",
  ],
  authors: [{ name: site.name }],
  openGraph: {
    type: "website",
    url: site.url,
    siteName: site.name,
    title: `${site.name} — Electrical Services in Greater Accra`,
    description: site.description,
    locale: "en_GH",
    images: [{ url: "/logo.jpg", width: 1280, height: 1280, alt: site.name }],
  },
  twitter: {
    card: "summary",
    title: `${site.name} — Electrical Services in Greater Accra`,
    description: site.description,
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  // Installed-app behaviour on iPhone/iPad (home-screen icon comes from app/apple-icon.png).
  appleWebApp: {
    capable: true,
    title: site.shortName,
    statusBarStyle: "black",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#040a14",
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
    ...(site.email ? { email: site.email } : {}),
    telephone: site.phones.map((p) => p.tel),
    areaServed: ["Kasoa", "Tema", "Kpone", "East Legon", "Greater Accra"],
    address: { "@type": "PostalAddress", addressLocality: "Accra", addressCountry: "GH" },
    openingHours: ["Mo-Fr 07:00-19:00", "Sa 08:00-18:00"],
    priceRange: "GHS",
  };

  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <head>
        {/* Catch the browser's install prompt before React loads, so the
            install popup can always offer one-tap install. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__pfInstallPrompt=e;});",
          }}
        />
      </head>
      <body className="min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-volt-500 focus:px-4 focus:py-2 focus:font-semibold focus:text-ink-950"
        >
          Skip to content
        </a>
        <CartProvider>
          <ProductImagesProvider>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          </ProductImagesProvider>
        </CartProvider>
        <WhatsAppFloat />
        <SupportChat />
        <AppInstall />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
        />
      </body>
    </html>
  );
}
