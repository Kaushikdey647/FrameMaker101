# Hackathon ID card redesign

**Date:** 2026-08-11  
**Status:** Approved; implemented  
**Primary file:** `lib/compose-id.ts`

## Goal

Replace the split boarding-pass ID with a single full-bleed **hackathon badge**: one composition, large centered identity stack, quiet metadata footer.

## Layout

- Canvas stays `1052 × 1552`.
- One section only — no left/right split, no perforation, no ticket/boarding-pass chrome.
- No outer enclosing stroke around the full canvas.

## Background

- Base fill: brand green (`theme.bg`, typically `#0B4D2C` / deep variants).
- Tribal SVG (`/assets/tribal-pattern.svg`) cover-scaled across the upper portion, moderate alpha (~0.35–0.45).
- Vertical fade: pattern dissolves into solid green mid-to-lower card (top → bottom).

## Centered identity stack (top → bottom)

1. **Photo** — large square (~520–560px side), cover-cropped. Thin cream/yellow frame on the photo only (not a card border).
2. **Name** — Archivo Black (or existing display font), huge, cream, centered; wrap to 2 lines when needed.
3. **Role** — DM Sans (or existing UI font), clearly smaller subtitle under the name, cream/muted.
4. **Tag** — whimsical builder title as a compact accent stamp/chip under the role (theme accent).

## Footer metadata

Single quiet full-width row near the bottom (badge-like, not a ticket stub):

- Event dates (`OCT 28–31 2026`)
- Assigned serial (`PASS ID · {serial}` or equivalent short label)
- `#FrameInGoa`

Even spacing; small type; must not compete with the name.

## Explicitly removed

- Right ticket panel (passenger/route fields, wordmark block, barcode band)
- “BOARDING PASS” strip and route (`IATA → GOA`) as primary content
- Circular portrait + ring treatment
- Outer black enclosing rectangle / divider line at the split

## Themes

- Keep existing `IdTheme` colorways.
- Themes tint accent (tag) and footer colors only; layout is shared.

## Out of scope

- Changing canvas ratio, share/download flow, or theme picker UX
- New assets beyond the existing tribal SVG and fonts already loaded for compose
