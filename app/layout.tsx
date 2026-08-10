import type { Metadata, Viewport } from "next";
import { Figtree, Syne } from "next/font/google";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "HH Goa 2026 — Frame yourself",
  description:
    "Upload a photo, get a branded HH Goa 2026 PFP frame, download or share to X with #FrameInGoa.",
  openGraph: {
    title: "HH Goa 2026 — Frame yourself",
    description: "Make yours with #FrameInGoa",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HH Goa 2026 — Frame yourself",
    description: "Make yours with #FrameInGoa",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Do not set userScalable: false — a11y
  themeColor: "#e8f4f2",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${figtree.variable} ${syne.variable} h-full antialiased`}
    >
      <body className="min-h-dvh font-sans text-[var(--ink)]">{children}</body>
    </html>
  );
}
