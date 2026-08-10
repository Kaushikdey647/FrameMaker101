import type { Metadata, Viewport } from "next";
import { Archivo_Black, DM_Sans, Noto_Sans_Devanagari } from "next/font/google";
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

export const metadata: Metadata = {
  title: "HH Goa 2026 — Frame & Builder ID",
  description:
    "Make a branded HH Goa 2026 PFP frame or Builder ID. Share with #FrameInGoa.",
  openGraph: {
    title: "HH Goa 2026 — Frame & Builder ID",
    description: "Make yours with #FrameInGoa",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HH Goa 2026 — Frame & Builder ID",
    description: "Make yours with #FrameInGoa",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B4D2C",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${archivoBlack.variable} ${notoDeva.variable} h-full antialiased`}
    >
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
