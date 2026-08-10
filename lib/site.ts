/** Canonical public origin (no trailing slash). */
export function siteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/$/, "")}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "http://localhost:3000";
}

export const SITE = {
  name: "Frame In Goa",
  shortName: "HH Goa 2026",
  title: "Frame In Goa — HH Goa 2026 PFP Frame & Builder ID",
  description:
    "Zero-login, mobile-first tool that turns your photo into a branded Hacker House Goa 2026 PFP frame or Builder ID. Download and share to X with #FrameInGoa — no signup, photos stay on your device until you share.",
  tagline: "Snap a photo. Walk out with a branded HH Goa 2026 graphic.",
  hashtag: "#FrameInGoa",
  keywords: [
    "Hacker House Goa",
    "HH Goa 2026",
    "Frame In Goa",
    "FrameInGoa",
    "PFP frame",
    "Builder ID",
    "profile picture frame",
    "Goa hackathon",
  ],
} as const;
