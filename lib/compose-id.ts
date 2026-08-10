import { JPEG_QUALITY } from "./compose";
import { pickBuilderTitle } from "./builder-titles";
import { GOA_DEST_IATA, type IndiaAirport } from "./india-airports";

/** Passport-style Builder ID — 2:1 landscape. */
export const ID_WIDTH = 1600;
export const ID_HEIGHT = 800;

const GREEN = "#0B4D2C";
const GREEN_DEEP = "#083821";
const YELLOW = "#F5C518";
const MAGENTA = "#FF2D8A";
const CREAM = "#F7F1E6";
const PAPER = "#F3EDE3";
const INK = "#1A1A1A";
const MUTED = "#5C6B62";

export type ComposeIdInput = {
  photo: ImageBitmap;
  name: string;
  role: string;
  serial: string;
  origin: IndiaAirport;
};

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function coverRect(
  ctx: CanvasRenderingContext2D,
  source: ImageBitmap,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const scale = Math.max(w / source.width, h / source.height);
  const dw = source.width * scale;
  const dh = source.height * scale;
  const dx = x + (w - dw) / 2;
  const dy = y + (h - dh) / 2;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(source, dx, dy, dw, dh);
  ctx.restore();
}

function drawSecurityPattern(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.globalAlpha = 0.06;
  ctx.strokeStyle = GREEN;
  ctx.lineWidth = 1.2;
  for (let i = -h; i < w + h; i += 20) {
    ctx.beginPath();
    ctx.moveTo(x + i, y);
    ctx.bezierCurveTo(
      x + i + 40,
      y + h * 0.33,
      x + i - 40,
      y + h * 0.66,
      x + i,
      y + h,
    );
    ctx.stroke();
  }
  ctx.restore();
}

function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  baseSize: number,
  minSize: number,
): number {
  let size = baseSize;
  ctx.font = `700 ${size}px "DM Sans", system-ui, sans-serif`;
  while (size > minSize && ctx.measureText(text).width > maxWidth) {
    size -= 1;
    ctx.font = `700 ${size}px "DM Sans", system-ui, sans-serif`;
  }
  return size;
}

function fieldLabel(ctx: CanvasRenderingContext2D, label: string, x: number, y: number) {
  ctx.fillStyle = MUTED;
  ctx.font = `600 14px "DM Sans", system-ui, sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(label.toUpperCase(), x, y);
}

function fieldValue(
  ctx: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  maxWidth: number,
  color = INK,
  baseSize = 32,
) {
  ctx.fillStyle = color;
  const size = fitText(ctx, value, maxWidth, baseSize, 16);
  ctx.font = `700 ${size}px "DM Sans", system-ui, sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(value, x, y);
}

function mrzSanitize(raw: string, len: number): string {
  const map: Record<string, string> = {
    " ": "<",
    "-": "<",
    _: "<",
    ".": "<",
    "/": "<",
  };
  let s = raw
    .toUpperCase()
    .replace(/[^A-Z0-9 <]/g, "")
    .replace(/./g, (c) => map[c] ?? c);
  s = s.replace(/ /g, "<");
  if (s.length > len) return s.slice(0, len);
  return s.padEnd(len, "<");
}

function buildMrz(name: string, serial: string, role: string): [string, string] {
  const serialBody = serial.replace(/^HH-GOA-/, "");
  const line1 = mrzSanitize(`P<HHG${name}<<BUILDER`, 44);
  const line2 = mrzSanitize(
    `${serialBody}HHG2603158M2612316${role.replace(/\s+/g, "").slice(0, 12)}`,
    44,
  );
  return [line1, line2];
}

/** Solid dark-green palm + sun + beach silhouette. */
function drawPalmBeach(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale = 1,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = GREEN;
  ctx.strokeStyle = GREEN;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Beach mound
  ctx.beginPath();
  ctx.ellipse(0, 28, 52, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Sun disc
  ctx.beginPath();
  ctx.arc(36, -22, 16, 0, Math.PI * 2);
  ctx.fill();

  // Trunk
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-10, 24);
  ctx.quadraticCurveTo(-18, -8, -8, -48);
  ctx.stroke();

  // Fronds
  ctx.lineWidth = 4.5;
  for (const [cx, cy] of [
    [-52, -36],
    [-34, -62],
    [-4, -68],
    [24, -58],
    [40, -34],
  ] as const) {
    ctx.beginPath();
    ctx.moveTo(-8, -46);
    ctx.quadraticCurveTo((cx - 8) * 0.45 - 4, cy + 10, cx, cy);
    ctx.stroke();
  }

  ctx.restore();
}

/** Large origin → GOI arc in dark green on cream (no labels, no box). */
function drawFlightPath(
  ctx: CanvasRenderingContext2D,
  originIata: string,
  leftX: number,
  topY: number,
  width: number,
) {
  const startX = leftX + 40;
  const endX = leftX + width - 110;
  const baseY = topY + 118;
  const peakY = topY + 12;

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = GREEN;
  ctx.font = `700 44px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.fillText(originIata, startX, baseY);
  ctx.fillText(GOA_DEST_IATA, endX, baseY);

  const pathStart = startX + 48;
  const pathEnd = endX - 48;
  const cpx = (pathStart + pathEnd) / 2;
  ctx.strokeStyle = GREEN;
  ctx.lineWidth = 3.25;
  ctx.lineCap = "round";
  ctx.setLineDash([9, 9]);
  ctx.beginPath();
  ctx.moveTo(pathStart, baseY - 8);
  ctx.quadraticCurveTo(cpx, peakY, pathEnd, baseY - 8);
  ctx.stroke();
  ctx.setLineDash([]);

  const t = 0.5;
  const mx =
    (1 - t) * (1 - t) * pathStart + 2 * (1 - t) * t * cpx + t * t * pathEnd;
  const my =
    (1 - t) * (1 - t) * (baseY - 8) +
    2 * (1 - t) * t * peakY +
    t * t * (baseY - 8);
  ctx.fillStyle = GREEN;
  ctx.beginPath();
  ctx.moveTo(mx + 12, my);
  ctx.lineTo(mx - 9, my - 8);
  ctx.lineTo(mx - 4, my);
  ctx.lineTo(mx - 9, my + 8);
  ctx.closePath();
  ctx.fill();

  drawPalmBeach(ctx, endX + 58, baseY - 4, 1.15);
}

function canvasToJpeg(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
      "image/jpeg",
      JPEG_QUALITY,
    );
  });
}

export async function composeBuilderId(input: ComposeIdInput): Promise<{
  blob: Blob;
  title: string;
}> {
  const { photo, name, role, serial, origin } = input;
  const title = pickBuilderTitle(name, serial);
  const displayName = name.trim().toUpperCase() || "BUILDER";
  const displayRole = role.trim().toUpperCase() || "BUILDER";

  const canvas = document.createElement("canvas");
  canvas.width = ID_WIDTH;
  canvas.height = ID_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas unavailable");

  ctx.fillStyle = GREEN;
  ctx.fillRect(0, 0, ID_WIDTH, ID_HEIGHT);

  const margin = 24;
  const pageX = margin;
  const pageY = margin;
  const pageW = ID_WIDTH - margin * 2;
  const pageH = ID_HEIGHT - margin * 2;

  ctx.fillStyle = PAPER;
  roundRect(ctx, pageX, pageY, pageW, pageH, 16);
  ctx.fill();
  drawSecurityPattern(ctx, pageX, pageY, pageW, pageH);

  // Header
  const stripH = 58;
  ctx.fillStyle = GREEN;
  roundRect(ctx, pageX, pageY, pageW, stripH + 14, 16);
  ctx.fill();
  ctx.fillRect(pageX, pageY + 20, pageW, stripH - 6);

  ctx.fillStyle = YELLOW;
  ctx.font = `400 30px "Archivo Black", Impact, sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("HACKER HOUSE", pageX + 32, pageY + stripH / 2 + 2);

  ctx.fillStyle = CREAM;
  ctx.font = `700 16px "DM Sans", system-ui, sans-serif`;
  ctx.textAlign = "right";
  ctx.fillText(
    "HH GOA 2026  ·  BUILDER PASSPORT",
    pageX + pageW - 32,
    pageY + stripH / 2 + 2,
  );

  ctx.fillStyle = YELLOW;
  ctx.fillRect(pageX, pageY + stripH + 10, pageW, 3);
  ctx.fillStyle = MAGENTA;
  ctx.fillRect(pageX, pageY + stripH + 13, pageW, 3);

  const mrzH = 84;
  const mrzY = pageY + pageH - mrzH;
  const bodyTop = pageY + stripH + 28;
  const bodyBottom = mrzY - 18;
  const bodyH = bodyBottom - bodyTop;

  // Full-height photo column (left)
  const photoX = pageX + 28;
  const photoY = bodyTop;
  const photoH = bodyH;
  const photoW = Math.round(photoH * 0.72);
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(photoX - 4, photoY - 4, photoW + 8, photoH + 8);
  ctx.strokeStyle = GREEN;
  ctx.lineWidth = 3;
  ctx.strokeRect(photoX - 4, photoY - 4, photoW + 8, photoH + 8);
  coverRect(ctx, photo, photoX, photoY, photoW, photoH);

  ctx.strokeStyle = YELLOW;
  ctx.lineWidth = 4;
  const tick = 22;
  for (const [tx, ty, dx, dy] of [
    [photoX, photoY, 1, 0],
    [photoX, photoY, 0, 1],
    [photoX + photoW, photoY, -1, 0],
    [photoX + photoW, photoY, 0, 1],
    [photoX, photoY + photoH, 1, 0],
    [photoX, photoY + photoH, 0, -1],
    [photoX + photoW, photoY + photoH, -1, 0],
    [photoX + photoW, photoY + photoH, 0, -1],
  ] as const) {
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx + dx * tick, ty + dy * tick);
    ctx.stroke();
  }

  const contentLeft = photoX + photoW + 40;
  const contentRight = pageX + pageW - 36;
  const contentW = contentRight - contentLeft;

  // Biodata (upper-left of content) + flight path (upper-right)
  const flightW = Math.min(420, Math.floor(contentW * 0.48));
  const flightLeft = contentRight - flightW;
  const dataW = flightLeft - contentLeft - 24;

  drawFlightPath(ctx, origin.iata, flightLeft, bodyTop + 8, flightW);

  let row = bodyTop + 12;
  fieldLabel(ctx, "Type / Code", contentLeft, row);
  fieldValue(ctx, "P / HHG · BUILDER ID", contentLeft, row + 30, dataW, GREEN, 24);
  row += 72;

  fieldLabel(ctx, "Full name", contentLeft, row);
  fieldValue(ctx, displayName, contentLeft, row + 34, dataW, INK, 40);
  row += 84;

  fieldLabel(ctx, "Stack / role", contentLeft, row);
  fieldValue(ctx, displayRole, contentLeft, row + 30, dataW, MAGENTA, 26);
  row += 72;

  fieldLabel(ctx, "Assigned title", contentLeft, row);
  fieldValue(ctx, title, contentLeft, row + 30, dataW, GREEN, 26);
  row += 78;

  // Document banner
  const boxH = 70;
  const boxY = Math.min(bodyBottom - boxH, Math.max(row + 12, bodyTop + 280));
  ctx.fillStyle = GREEN;
  roundRect(ctx, contentLeft, boxY, contentW, boxH, 12);
  ctx.fill();

  ctx.fillStyle = YELLOW;
  ctx.font = `700 13px "DM Sans", system-ui, sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("DOCUMENT NO.", contentLeft + 22, boxY + 24);
  ctx.font = `700 26px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.fillText(serial, contentLeft + 22, boxY + 52);

  ctx.fillStyle = CREAM;
  ctx.font = `700 13px "DM Sans", system-ui, sans-serif`;
  ctx.textAlign = "right";
  ctx.fillText("VALID", contentRight - 22, boxY + 24);
  ctx.font = `700 22px "DM Sans", system-ui, sans-serif`;
  ctx.fillText("GOA 2026", contentRight - 22, boxY + 52);

  // MRZ
  ctx.fillStyle = CREAM;
  ctx.fillRect(pageX, mrzY, pageW, mrzH);
  ctx.fillStyle = GREEN_DEEP;
  ctx.globalAlpha = 0.07;
  for (let i = 0; i < pageW; i += 6) {
    ctx.fillRect(pageX + i, mrzY, 2, mrzH);
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = MAGENTA;
  ctx.fillRect(pageX, mrzY, pageW, 4);

  const [mrz1, mrz2] = buildMrz(displayName, serial, displayRole);
  ctx.fillStyle = INK;
  ctx.font = `600 19px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(mrz1, pageX + 32, mrzY + 34);
  ctx.fillText(mrz2, pageX + 32, mrzY + 62);

  ctx.fillStyle = MUTED;
  ctx.font = `600 12px "DM Sans", system-ui, sans-serif`;
  ctx.textAlign = "right";
  ctx.fillText("#FrameInGoa", pageX + pageW - 28, mrzY + 18);

  return { blob: await canvasToJpeg(canvas), title };
}

export function blobToPassFile(blob: Blob, serial: string): File {
  return new File([blob], `${serial}.jpg`, { type: "image/jpeg" });
}
