import { JPEG_QUALITY } from "./compose";
import { pickBuilderTitle } from "./builder-titles";
import { GOA_DEST_IATA, type IndiaAirport } from "./india-airports";

/** Poster-ticket Builder ID — 4:5 share card. */
export const ID_WIDTH = 1080;
export const ID_HEIGHT = 1350;

const GREEN = "#0B4D2C";
const GREEN_DEEP = "#083821";
const YELLOW = "#F5C518";
const MAGENTA = "#FF2D8A";
const CREAM = "#F7F1E6";
const PAPER = "#F3EDE3";
const INK = "#1A1A1A";

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

function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  baseSize: number,
  minSize: number,
  fontFamily: string,
): number {
  let size = baseSize;
  ctx.font = `700 ${size}px ${fontFamily}`;
  while (size > minSize && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = `700 ${size}px ${fontFamily}`;
  }
  return size;
}

function drawCornerTicks(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const tick = 36;
  ctx.strokeStyle = YELLOW;
  ctx.lineWidth = 6;
  ctx.lineCap = "square";
  for (const [tx, ty, dx, dy] of [
    [x, y, 1, 0],
    [x, y, 0, 1],
    [x + w, y, -1, 0],
    [x + w, y, 0, 1],
    [x, y + h, 1, 0],
    [x, y + h, 0, -1],
    [x + w, y + h, -1, 0],
    [x + w, y + h, 0, -1],
  ] as const) {
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx + dx * tick, ty + dy * tick);
    ctx.stroke();
  }
}

function drawMechaPalm(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale = 1,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = CREAM;
  ctx.strokeStyle = CREAM;
  ctx.lineCap = "square";
  ctx.lineJoin = "miter";

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

  ctx.fillRect(-40, 22, 78, 12);

  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-8, 22);
  ctx.lineTo(-14, -8);
  ctx.lineTo(-6, -40);
  ctx.stroke();

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

/** Compact origin → GOI route for the poster body. */
function drawRouteGraphic(
  ctx: CanvasRenderingContext2D,
  originIata: string,
  x: number,
  y: number,
  w: number,
) {
  const startX = x + 8;
  const endX = x + w - 72;
  const baseY = y + 42;
  const midX = (startX + endX) / 2;
  const peakY = y + 8;

  ctx.fillStyle = CREAM;
  ctx.font = `700 28px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(originIata, startX, baseY);

  ctx.strokeStyle = YELLOW;
  ctx.lineWidth = 3;
  ctx.lineCap = "square";
  ctx.lineJoin = "miter";
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(startX + 58, baseY - 4);
  ctx.lineTo(midX - 24, peakY + 20);
  ctx.lineTo(midX, peakY);
  ctx.lineTo(midX + 24, peakY + 20);
  ctx.lineTo(endX - 8, baseY - 4);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = YELLOW;
  ctx.beginPath();
  ctx.moveTo(midX + 10, peakY + 2);
  ctx.lineTo(midX - 8, peakY - 6);
  ctx.lineTo(midX - 2, peakY + 2);
  ctx.lineTo(midX - 8, peakY + 12);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = CREAM;
  ctx.font = `700 28px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.textAlign = "right";
  ctx.fillText(GOA_DEST_IATA, endX + 64, baseY);

  drawMechaPalm(ctx, endX + 28, y + 8, 0.55);
}

function drawPerforation(
  ctx: CanvasRenderingContext2D,
  y: number,
  left: number,
  right: number,
) {
  const r = 7;
  ctx.fillStyle = GREEN_DEEP;
  for (let x = left + 18; x < right - 10; x += 22) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
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
  const serialMark = serial.replace(/^HH-GOA-/, "");

  const canvas = document.createElement("canvas");
  canvas.width = ID_WIDTH;
  canvas.height = ID_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas unavailable");

  const stubH = Math.round(ID_HEIGHT * 0.22);
  const bodyH = ID_HEIGHT - stubH;

  // Full-bleed photo body
  ctx.fillStyle = GREEN_DEEP;
  ctx.fillRect(0, 0, ID_WIDTH, bodyH);
  coverRect(ctx, photo, 0, 0, ID_WIDTH, bodyH);

  // Dark gradient for typography legibility
  const fade = ctx.createLinearGradient(0, bodyH * 0.35, 0, bodyH);
  fade.addColorStop(0, "rgba(8,56,33,0)");
  fade.addColorStop(0.45, "rgba(8,56,33,0.35)");
  fade.addColorStop(1, "rgba(8,56,33,0.88)");
  ctx.fillStyle = fade;
  ctx.fillRect(0, 0, ID_WIDTH, bodyH);

  // Outer frame + corner ticks
  ctx.strokeStyle = GREEN;
  ctx.lineWidth = 16;
  ctx.strokeRect(8, 8, ID_WIDTH - 16, bodyH - 16);
  ctx.strokeStyle = YELLOW;
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, ID_WIDTH - 40, bodyH - 40);
  drawCornerTicks(ctx, 28, 28, ID_WIDTH - 56, bodyH - 56);

  // Hero serial mark (random Crockford body)
  ctx.save();
  ctx.translate(ID_WIDTH * 0.72, bodyH * 0.28);
  ctx.rotate((-12 * Math.PI) / 180);
  ctx.font = `900 160px "Archivo Black", Impact, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.lineWidth = 16;
  ctx.strokeStyle = MAGENTA;
  ctx.strokeText(serialMark, 0, 0);
  ctx.fillStyle = YELLOW;
  ctx.fillText(serialMark, 0, 0);
  ctx.restore();

  // Event chip top-left
  ctx.fillStyle = GREEN;
  ctx.fillRect(40, 40, 280, 44);
  ctx.strokeStyle = "#111111";
  ctx.lineWidth = 3;
  ctx.strokeRect(40, 40, 280, 44);
  ctx.fillStyle = YELLOW;
  ctx.font = `700 18px "DM Sans", system-ui, sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("HH GOA 2026", 56, 62);

  // Route graphic
  drawRouteGraphic(ctx, origin.iata, 40, bodyH * 0.42, 420);

  // Name / role poster type
  const typeMax = ID_WIDTH - 80;
  ctx.fillStyle = CREAM;
  const nameSize = fitText(
    ctx,
    displayName,
    typeMax,
    72,
    36,
    `"Archivo Black", Impact, sans-serif`,
  );
  ctx.font = `700 ${nameSize}px "Archivo Black", Impact, sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(displayName, 40, bodyH - 150);

  ctx.fillStyle = MAGENTA;
  const roleSize = fitText(
    ctx,
    displayRole,
    typeMax,
    36,
    20,
    `"DM Sans", system-ui, sans-serif`,
  );
  ctx.font = `700 ${roleSize}px "DM Sans", system-ui, sans-serif`;
  ctx.fillText(displayRole, 40, bodyH - 108);

  // Witty title stamp
  const stampPadX = 18;
  ctx.font = `700 26px "DM Sans", system-ui, sans-serif`;
  const stampW = Math.min(
    typeMax,
    ctx.measureText(title).width + stampPadX * 2,
  );
  const stampH = 48;
  const stampX = 40;
  const stampY = bodyH - 88;
  ctx.save();
  ctx.translate(stampX + stampW / 2, stampY + stampH / 2);
  ctx.rotate((-3 * Math.PI) / 180);
  ctx.fillStyle = MAGENTA;
  ctx.fillRect(-stampW / 2, -stampH / 2, stampW, stampH);
  ctx.strokeStyle = "#111111";
  ctx.lineWidth = 3;
  ctx.strokeRect(-stampW / 2, -stampH / 2, stampW, stampH);
  ctx.fillStyle = CREAM;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(title, 0, 1);
  ctx.restore();

  // Ticket stub
  const stubY = bodyH;
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, stubY, ID_WIDTH, stubH);
  drawHalftoneDots(ctx, 0, stubY, ID_WIDTH, stubH);

  ctx.fillStyle = MAGENTA;
  ctx.fillRect(0, stubY, ID_WIDTH, 6);

  drawPerforation(ctx, stubY + 2, 0, ID_WIDTH);

  // Stub notch circles (ticket edge)
  ctx.fillStyle = GREEN_DEEP;
  ctx.beginPath();
  ctx.arc(0, stubY + stubH / 2, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(ID_WIDTH, stubY + stubH / 2, 22, 0, Math.PI * 2);
  ctx.fill();

  const stubMid = stubY + stubH / 2;
  ctx.fillStyle = GREEN;
  ctx.font = `700 18px "DM Sans", system-ui, sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("HACKER HOUSE GOA", 48, stubMid - 36);
  ctx.fillStyle = INK;
  ctx.font = `700 15px "DM Sans", system-ui, sans-serif`;
  ctx.fillText("OCT 28–31  ·  2026", 48, stubMid - 12);

  ctx.fillStyle = INK;
  ctx.font = `700 28px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.textAlign = "center";
  ctx.fillText(serial, ID_WIDTH / 2, stubMid + 28);

  ctx.fillStyle = GREEN;
  ctx.font = `900 36px "Archivo Black", Impact, sans-serif`;
  ctx.textAlign = "right";
  ctx.fillText(serialMark, ID_WIDTH - 48, stubMid - 18);

  ctx.fillStyle = MAGENTA;
  ctx.font = `700 16px "DM Sans", system-ui, sans-serif`;
  ctx.fillText("GOI  ·  #FrameInGoa", ID_WIDTH - 48, stubMid + 20);

  // Hard outer stroke
  ctx.strokeStyle = "#111111";
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, ID_WIDTH - 8, ID_HEIGHT - 8);

  return { blob: await canvasToJpeg(canvas), title };
}

function drawHalftoneDots(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  ctx.fillStyle = "rgba(11,77,44,0.1)";
  for (let row = 0; row < h; row += 12) {
    for (let col = 0; col < w; col += 12) {
      const r = (row + col) % 24 === 0 ? 1.5 : 0.9;
      ctx.beginPath();
      ctx.arc(x + col + 2, y + row + 2, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export function blobToPassFile(blob: Blob, serial: string): File {
  return new File([blob], `${serial}.jpg`, { type: "image/jpeg" });
}
