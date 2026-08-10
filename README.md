# HH Goa 2026 — Frame Generator

Zero-login, mobile-first PFP frame tool. Upload a photo → client-side composite → download or share to X with `#FrameInGoa`.

## Stack

- Next.js App Router + TypeScript + Tailwind CSS v4
- Raw Canvas compositing (auto-crop / cover)
- `heic2any` lazy fallback when `createImageBitmap` cannot decode
- Vercel Blob client uploads for the X intent fallback / OG preview

## Setup

```bash
npm install
cp .env.example .env.local
```

Fill in:

- `BLOB_READ_WRITE_TOKEN` — from the Vercel dashboard (Storage → Blob) or `vercel env pull`
- `NEXT_PUBLIC_APP_URL` — `http://localhost:3000` locally; production origin in prod

```bash
npm run dev
```

## Share / OG previews

X link unfurls hit `/share?img=<vercel-blob-url>`. Metadata sets `og:image`, `og:image:width/height`, and `twitter:card=summary_large_image`.

**Important:** Vercel Deployment Protection on preview URLs auth-walls X’s crawler, so OG cards look broken on previews. Test unfurls on the **production** domain with protection off (or crawler allowlisted).

## Privacy

Photos are framed entirely in the browser. Upload to Vercel Blob happens only on the share fallback path (when Web Share API is unavailable or fails)—not on every compose.

## Frame asset

Temporary branded overlay: `public/frames/hh-goa-2026-overlay.png` (1200×1200, transparent center). Replace that file to swap final brand art—no code change required.
