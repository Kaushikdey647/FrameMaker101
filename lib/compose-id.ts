import { JPEG_QUALITY } from "./compose";
import { pickBuilderTitle } from "./builder-titles";
import { GOA_DEST_IATA, type IndiaAirport } from "./india-airports";

/** Passport-style Builder ID — 2:1 landscape, mecha-poster graphic language. */
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

function drawHalftoneGrid(
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

  ctx.strokeStyle = "rgba(11,77,44,0.08)";
  ctx.lineWidth = 1;
  for (let gx = x; gx < x + w; gx += 24) {
    ctx.beginPath();
    ctx.moveTo(gx, y);
    ctx.lineTo(gx, y + h);
    ctx.stroke();
  }
  for (let gy = y; gy < y + h; gy += 24) {
    ctx.beginPath();
    ctx.moveTo(x, gy);
    ctx.lineTo(x + w, gy);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(11,77,44,0.12)";
  for (let row = 0; row < h; row += 10) {
    for (let col = 0; col < w; col += 10) {
      const r = ((row + col) % 20 === 0 ? 1.6 : 1.0);
      ctx.beginPath();
      ctx.arc(x + col + 2, y + row + 2, r, 0, Math.PI * 2);
      ctx.fill();
    }
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

function fieldLabel(ctx: CanvasRenderingContext2D, label: string, x: number, y: number, w: number) {
  ctx.fillStyle = MUTED;
  ctx.font = `700 13px "DM Sans", system-ui, sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(label.toUpperCase(), x, y);
  ctx.strokeStyle = GREEN;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y + 6);
  ctx.lineTo(x + Math.min(w, 120), y + 6);
  ctx.stroke();
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

/** Solid dark-green angular palm + sun (mecha silhouette). */
function drawMechaPalm(
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
  ctx.lineCap = "square";
  ctx.lineJoin = "miter";

  // Angular sun (star)
  ctx.beginPath();
  const pts = [
    [0, -28],
    [6, -10],
    [24, -10],
    [10, 2],
    [16, 20],
    [0, 10],
    [-16, 20],
    [-10, 2],
    [-24, -10],
    [-6, -10],
  ];
  for (let i = 0; i < pts.length; i++) {
    const [px, py] = pts[i]!;
    if (i === 0) ctx.moveTo(px + 34, py - 8);
    else ctx.lineTo(px + 34, py - 8);
  }
  ctx.closePath();
  ctx.fill();

  // Beach slab
  ctx.fillRect(-40, 22, 78, 12);

  // Trunk
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-8, 22);
  ctx.lineTo(-14, -8);
  ctx.lineTo(-6, -40);
  ctx.stroke();

  // Angular fronds
  ctx.lineWidth = 5;
  for (const [ax, ay] of [
    [-48, -28],
    [-30, -52],
    [2, -56],
    [28, -44],
    [40, -22],
  ] as const) {
    ctx.beginPath();
    ctx.moveTo(-6, -38);
    ctx.lineTo(ax, ay);
    ctx.stroke();
  }

  ctx.restore();
}

/** Angular dashed polyline origin → GOI. */
function drawFlightPath(
  ctx: CanvasRenderingContext2D,
  originIata: string,
  leftX: number,
  topY: number,
  width: number,
) {
  // Mini grid behind path
  ctx.save();
  ctx.strokeStyle = "rgba(11,77,44,0.15)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(leftX + i * 70, topY);
    ctx.lineTo(leftX + i * 70, topY + 150);
    ctx.stroke();
  }
  ctx.restore();

  const startX = leftX + 36;
  const endX = leftX + width - 120;
  const baseY = topY + 120;
  const midX = (startX + endX) / 2;
  const peakY = topY + 18;

  ctx.fillStyle = GREEN;
  ctx.font = `700 46px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(originIata, startX, baseY);
  ctx.fillText(GOA_DEST_IATA, endX, baseY);

  const pathStart = startX + 52;
  const pathEnd = endX - 52;
  ctx.strokeStyle = GREEN;
  ctx.lineWidth = 3.5;
  ctx.lineCap = "square";
  ctx.lineJoin = "miter";
  ctx.setLineDash([10, 8]);
  ctx.beginPath();
  ctx.moveTo(pathStart, baseY - 10);
  ctx.lineTo(midX - 40, peakY + 36);
  ctx.lineTo(midX, peakY);
  ctx.lineTo(midX + 40, peakY + 36);
  ctx.lineTo(pathEnd, baseY - 10);
  ctx.stroke();
  ctx.setLineDash([]);

  // Angular plane chevron at peak
  ctx.fillStyle = GREEN;
  ctx.beginPath();
  ctx.moveTo(midX + 14, peakY + 4);
  ctx.lineTo(midX - 10, peakY - 8);
  ctx.lineTo(midX - 4, peakY + 4);
  ctx.lineTo(midX - 10, peakY + 16);
  ctx.closePath();
  ctx.fill();

  drawMechaPalm(ctx, endX + 62, baseY - 2, 1.2);
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

  // Thick green outer frame
  ctx.fillStyle = GREEN;
  ctx.fillRect(0, 0, ID_WIDTH, ID_HEIGHT);

  const margin = 18;
  const pageX = margin;
  const pageY = margin;
  const pageW = ID_WIDTH - margin * 2;
  const pageH = ID_HEIGHT - margin * 2;

  ctx.fillStyle = PAPER;
  ctx.fillRect(pageX, pageY, pageW, pageH);
  drawHalftoneGrid(ctx, pageX, pageY, pageW, pageH);

  // Hard black inner stroke
  ctx.strokeStyle = "#111111";
  ctx.lineWidth = 4;
  ctx.strokeRect(pageX + 2, pageY + 2, pageW - 4, pageH - 4);

  // Header bar
  const stripH = 56;
  ctx.fillStyle = GREEN;
  ctx.fillRect(pageX, pageY, pageW, stripH);

  ctx.fillStyle = YELLOW;
  ctx.font = `400 30px "Archivo Black", Impact, sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("HACKER HOUSE", pageX + 28, pageY + stripH / 2);

  ctx.fillStyle = CREAM;
  ctx.font = `700 15px "DM Sans", system-ui, sans-serif`;
  ctx.textAlign = "right";
  ctx.fillText(
    "HH GOA 2026  //  BUILDER PASSPORT",
    pageX + pageW - 28,
    pageY + stripH / 2,
  );

  ctx.fillStyle = YELLOW;
  ctx.fillRect(pageX, pageY + stripH, pageW, 5);
  ctx.fillStyle = MAGENTA;
  ctx.fillRect(pageX, pageY + stripH + 5, pageW, 5);

  const mrzH = 80;
  const mrzY = pageY + pageH - mrzH;
  const bodyTop = pageY + stripH + 22;
  const bodyBottom = mrzY - 14;
  const bodyH = bodyBottom - bodyTop;

  // Full-height photo
  const photoX = pageX + 22;
  const photoY = bodyTop;
  const photoH = bodyH;
  const photoW = Math.round(photoH * 0.72);
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(photoX, photoY, photoW, photoH);
  coverRect(ctx, photo, photoX, photoY, photoW, photoH);
  ctx.strokeStyle = GREEN;
  ctx.lineWidth = 5;
  ctx.strokeRect(photoX, photoY, photoW, photoH);
  ctx.strokeStyle = "#111111";
  ctx.lineWidth = 2;
  ctx.strokeRect(photoX + 4, photoY + 4, photoW - 8, photoH - 8);

  ctx.strokeStyle = YELLOW;
  ctx.lineWidth = 5;
  const tick = 24;
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

  const contentLeft = photoX + photoW + 36;
  const contentRight = pageX + pageW - 28;
  const contentW = contentRight - contentLeft;
  const flightW = Math.min(440, Math.floor(contentW * 0.5));
  const flightLeft = contentRight - flightW;
  const dataW = flightLeft - contentLeft - 20;

  drawFlightPath(ctx, origin.iata, flightLeft, bodyTop + 4, flightW);

  let row = bodyTop + 10;
  fieldLabel(ctx, "Type / Code", contentLeft, row, dataW);
  fieldValue(ctx, "P / HHG · BUILDER ID", contentLeft, row + 32, dataW, GREEN, 24);
  row += 74;

  fieldLabel(ctx, "Full name", contentLeft, row, dataW);
  fieldValue(ctx, displayName, contentLeft, row + 36, dataW, INK, 40);
  row += 86;

  fieldLabel(ctx, "Stack / role", contentLeft, row, dataW);
  fieldValue(ctx, displayRole, contentLeft, row + 32, dataW, MAGENTA, 26);
  row += 74;

  fieldLabel(ctx, "Assigned title", contentLeft, row, dataW);
  fieldValue(ctx, title, contentLeft, row + 32, dataW, GREEN, 26);
  row += 80;

  const boxH = 68;
  const boxY = Math.min(bodyBottom - boxH, Math.max(row + 8, bodyTop + 290));
  ctx.fillStyle = GREEN;
  ctx.fillRect(contentLeft, boxY, contentW, boxH);
  ctx.strokeStyle = "#111111";
  ctx.lineWidth = 3;
  ctx.strokeRect(contentLeft, boxY, contentW, boxH);
  ctx.fillStyle = YELLOW;
  ctx.fillRect(contentLeft, boxY, 8, boxH);

  ctx.fillStyle = YELLOW;
  ctx.font = `700 12px "DM Sans", system-ui, sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("DOCUMENT NO.", contentLeft + 22, boxY + 22);
  ctx.font = `700 26px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.fillText(serial, contentLeft + 22, boxY + 50);

  ctx.fillStyle = CREAM;
  ctx.font = `700 12px "DM Sans", system-ui, sans-serif`;
  ctx.textAlign = "right";
  ctx.fillText("VALID", contentRight - 18, boxY + 22);
  ctx.font = `700 22px "DM Sans", system-ui, sans-serif`;
  ctx.fillText("GOA 2026", contentRight - 18, boxY + 50);

  // MRZ + hatch
  ctx.fillStyle = CREAM;
  ctx.fillRect(pageX, mrzY, pageW, mrzH);
  ctx.fillStyle = GREEN_DEEP;
  for (let i = 0; i < pageW; i += 4) {
    ctx.globalAlpha = i % 8 === 0 ? 0.14 : 0.06;
    ctx.fillRect(pageX + i, mrzY, 2, mrzH);
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = MAGENTA;
  ctx.fillRect(pageX, mrzY, pageW, 5);

  const [mrz1, mrz2] = buildMrz(displayName, serial, displayRole);
  ctx.fillStyle = INK;
  ctx.font = `700 18px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(mrz1, pageX + 28, mrzY + 32);
  ctx.fillText(mrz2, pageX + 28, mrzY + 58);

  ctx.fillStyle = MUTED;
  ctx.font = `700 11px "DM Sans", system-ui, sans-serif`;
  ctx.textAlign = "right";
  ctx.fillText("#FrameInGoa", pageX + pageW - 24, mrzY + 16);

  return { blob: await canvasToJpeg(canvas), title };
}

export function blobToPassFile(blob: Blob, serial: string): File {
  return new File([blob], `${serial}.jpg`, { type: "image/jpeg" });
}
