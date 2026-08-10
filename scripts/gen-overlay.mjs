import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const size = 1200;
const green = "#0B4D2C";
const yellow = "#F5C518";
const magenta = "#FF2D8A";
const cream = "#F7F1E6";

function dots(ox, oy) {
  let s = "";
  for (let i = 0; i < 40; i++) {
    const x = ox + (i % 10) * 36;
    const y = oy + Math.floor(i / 10) * 28;
    const r = 2 + (i % 3);
    s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${yellow}" opacity="0.35"/>`;
  }
  return s;
}

function rails(x) {
  let s = `<rect x="${x}" y="220" width="14" height="360" fill="${yellow}"/>`;
  for (let i = 0; i < 8; i++) {
    const fill = i % 2 ? magenta : cream;
    s += `<rect x="${x}" y="${240 + i * 45}" width="14" height="18" fill="${fill}"/>`;
  }
  return s;
}

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${dots(40, 40)}
  ${dots(size - 400, size - 160)}
  <rect x="18" y="18" width="${size - 36}" height="${size - 36}" fill="none" stroke="${green}" stroke-width="28"/>
  <rect x="36" y="36" width="${size - 72}" height="${size - 72}" fill="none" stroke="#111111" stroke-width="6"/>
  <rect x="48" y="48" width="${size - 96}" height="${size - 96}" fill="none" stroke="${yellow}" stroke-width="4"/>
  <path d="M48 120 L48 48 L120 48" fill="none" stroke="${magenta}" stroke-width="10" stroke-linecap="square"/>
  <path d="M${size - 120} 48 L${size - 48} 48 L${size - 48} 120" fill="none" stroke="${magenta}" stroke-width="10" stroke-linecap="square"/>
  <path d="M48 ${size - 120} L48 ${size - 48} L120 ${size - 48}" fill="none" stroke="${magenta}" stroke-width="10" stroke-linecap="square"/>
  <path d="M${size - 120} ${size - 48} L${size - 48} ${size - 48} L${size - 48} ${size - 120}" fill="none" stroke="${magenta}" stroke-width="10" stroke-linecap="square"/>
  <rect x="48" y="48" width="${size - 96}" height="110" fill="${green}"/>
  <rect x="48" y="158" width="${size - 96}" height="10" fill="${yellow}"/>
  <rect x="48" y="168" width="${size - 96}" height="8" fill="${magenta}"/>
  <text x="72" y="118" font-family="Impact, Arial Black, sans-serif" font-size="64" fill="${yellow}">HACKER HOUSE</text>
  <text x="${size - 72}" y="108" text-anchor="end" font-family="Arial, sans-serif" font-weight="700" font-size="28" fill="${cream}">HH GOA 2026</text>
  <rect x="48" y="${size - 150}" width="${size - 96}" height="102" fill="${green}"/>
  <rect x="48" y="${size - 158}" width="${size - 96}" height="8" fill="${magenta}"/>
  <text x="72" y="${size - 85}" font-family="Impact, Arial Black, sans-serif" font-size="42" fill="${yellow}">#FrameInGoa</text>
  <text x="${size - 72}" y="${size - 88}" text-anchor="end" font-family="Arial, sans-serif" font-weight="700" font-size="26" fill="${cream}">PROFILE FRAME</text>
  ${rails(48)}
  ${rails(size - 62)}
  <polygon points="160,210 172,236 200,236 178,252 190,280 160,262 130,280 142,252 120,236 148,236" fill="${yellow}" stroke="#111111" stroke-width="4"/>
</svg>`;

const out = path.join(__dirname, "../public/frames/hh-goa-2026-overlay.png");
await sharp(Buffer.from(svg)).png().toFile(out);
console.log("wrote", out);
