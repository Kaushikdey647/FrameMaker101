# HH Goa 2026 — Frame & Builder ID

Zero-login, mobile-first tool for **Format A** (PFP frame) and **Format B** (Builder ID poster-ticket with name, role, witty title, and serial). Images stay on-device until you share or download — nothing is uploaded to our servers.

## Brand

Deep green `#0B4D2C`, yellow `#F5C518`, magenta `#FF2D8A`, cream `#F7F1E6`. Fonts: Archivo Black, DM Sans, Noto Sans Devanagari.

## Setup

```bash
npm install
```

Optional: set `NEXT_PUBLIC_APP_URL` in `.env.local` (see `.env.example`) so share captions use your real origin.

```bash
npm run dev
```

## Formats

| Mode | Inputs | Output | Persistence |
|------|--------|--------|-------------|
| Profile frame | Photo | 1200² framed JPEG | Local until share/download |
| Builder ID | Photo + name + role + origin airport | 1080×1350 (4:5) poster-ticket JPEG | Local until share/download |

Serials are `HH-GOA-` + 5 Crockford chars, minted on-device. Share to X uses the system share sheet with the JPEG when available; otherwise opens X with caption + app link.
