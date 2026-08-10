# HH Goa 2026 — Frame & Builder ID

Zero-login, mobile-first tool for **Format A** (PFP frame) and **Format B** (Builder ID with name, role, witty title, and serial).

## Brand

Deep green `#0B4D2C`, yellow `#F5C518`, magenta `#FF2D8A`, cream `#F7F1E6`. Fonts: Archivo Black, DM Sans, Noto Sans Devanagari.

## Setup

```bash
npm install
cp .env.example .env.local
```

Set:

- `BLOB_READ_WRITE_TOKEN` — required for Builder ID create/lookup and Share-to-X fallback
- `NEXT_PUBLIC_APP_URL` — e.g. `http://localhost:3000`

```bash
npm run dev
```

## Formats

| Mode | Inputs | Output | Persistence |
|------|--------|--------|-------------|
| Profile frame | Photo | 1200² framed JPEG | Local until X share fallback |
| Builder ID | Photo + name + role | 1080×1350 badge JPEG | Vercel Blob `passes/{serial}.*` |

Serials are `HH-GOA-` + 5 Crockford chars (crypto-random, put-if-absent). Lookup anytime at `/id/HH-GOA-XXXXX`.

## OG / X previews

Test unfurls on **production** with Deployment Protection off — preview URLs auth-wall X’s crawler.
