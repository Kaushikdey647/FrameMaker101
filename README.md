# HH Goa 2026 — Frame & Builder ID

Zero-login, mobile-first tool for **Format A** (PFP frame) and **Format B** (Builder ID with name, role, witty title, and serial).

## Brand

Deep green `#0B4D2C`, yellow `#F5C518`, magenta `#FF2D8A`, cream `#F7F1E6`. Fonts: Archivo Black, DM Sans, Noto Sans Devanagari.

## Setup

```bash
npm install
npx vercel link   # if needed
npx vercel env pull
```

Required Blob env (OIDC — connect a Blob store with **Development** included):

- `BLOB_STORE_ID`
- `VERCEL_OIDC_TOKEN` (short-lived; re-pull when it expires)
- `BLOB_WEBHOOK_PUBLIC_KEY`

Also set `NEXT_PUBLIC_APP_URL` (e.g. `http://localhost:3000`).

Remove any empty `BLOB_READ_WRITE_TOKEN=""` line — an empty value can confuse local setup. Browser uploads use OIDC + presigned URLs.

```bash
npm run dev
```

## Formats

| Mode | Inputs | Output | Persistence |
|------|--------|--------|-------------|
| Profile frame | Photo | 1200² framed JPEG | Local until X share fallback |
| Builder ID | Photo + name + role | 1080×1350 badge JPEG | Vercel Blob `passes/{serial}.*` |

Serials are `HH-GOA-` + 5 Crockford chars. Lookup at `/id/HH-GOA-XXXXX`.

## OG / X previews

Test unfurls on **production** with Deployment Protection off.
