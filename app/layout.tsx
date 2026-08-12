import type { Metadata, Viewport } from "next";
import { Archivo_Black, DM_Sans, Noto_Sans_Devanagari } from "next/font/google";
import { SITE, siteUrl } from "@/lib/site";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const archivoBlack = Archivo_Black({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: "400",
});

const notoDeva = Noto_Sans_Devanagari({
  variable: "--font-noto-deva",
  subsets: ["devanagari"],
  weight: ["700"],
});

const url = siteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title: {
    default: SITE.title,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [...SITE.keywords],
  authors: [{ name: "Hacker House Goa" }],
  creator: "Hacker House Goa",
  publisher: "Hacker House Goa",
  category: "events",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [{ url: "/icon", type: "image/png" }],
    apple: [{ url: "/apple-icon", type: "image/png" }],
  },
  openGraph: {
    title: SITE.title,
    description: SITE.description,
    url: "/",
    siteName: SITE.name,
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.tagline,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "theme-color": "#0B4D2C",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0B4D2C" },
    { media: "(prefers-color-scheme: dark)", color: "#083821" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE.name,
    alternateName: SITE.shortName,
    url,
    description: SITE.description,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    keywords: SITE.keywords.join(", "),
  };

  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${archivoBlack.variable} ${notoDeva.variable} min-h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
