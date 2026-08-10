import { JPEG_QUALITY } from "./compose";
import { pickBuilderTitle } from "./builder-titles";

export const ID_WIDTH = 1080;
export const ID_HEIGHT = 1350;

const GREEN = "#0B4D2C";
const GREEN_DEEP = "#083821";
const YELLOW = "#F5C518";
const MAGENTA = "#FF2D8A";
const CREAM = "#F7F1E6";
const BLACK = "#111111";

export type ComposeIdInput = {
  photo: ImageBitmap;
  name: string;
  role: string;
  serial: string;
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

function coverInBox(
  ctx: CanvasRenderingContext2D,
  source: ImageBitmap,
  x: number,
  y: number,
  size: number,
) {
  const scale = Math.max(size / source.width, size / source.height);
  const dw = source.width * scale;
  const dh = source.height * scale;
  const dx = x + (size - dw) / 2;
  const dy = y + (size - dh) / 2;
  ctx.save();
  roundRect(ctx, x, y, size, size, size / 2);
  ctx.clip();
  ctx.drawImage(source, dx, dy, dw, dh);
  ctx.restore();
}

function drawSun(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.fillStyle = YELLOW;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = YELLOW;
  ctx.lineWidth = 6;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * (r + 10), cy + Math.sin(a) * (r + 10));
    ctx.lineTo(cx + Math.cos(a) * (r + 28), cy + Math.sin(a) * (r + 28));
    ctx.stroke();
  }
}

function drawPalm(ctx: CanvasRenderingContext2D, x: number, y: number, flip = false) {
  ctx.save();
  ctx.translate(x, y);
  if (flip) ctx.scale(-1, 1);
  ctx.strokeStyle = GREEN_DEEP;
  ctx.fillStyle = GREEN_DEEP;
  ctx.lineWidth = 10;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-8, -70, 4, -140);
  ctx.stroke();
  for (const [dx, dy] of [
    [-50, -120],
    [-20, -150],
    [30, -145],
    [55, -115],
  ] as const) {
    ctx.beginPath();
    ctx.moveTo(4, -130);
    ctx.quadraticCurveTo(dx / 2, dy + 20, dx, dy);
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
    size -= 2;
    ctx.font = `700 ${size}px "DM Sans", system-ui, sans-serif`;
  }
  return size;
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
  const { photo, name, role, serial } = input;
  const title = pickBuilderTitle(name, serial);

  const canvas = document.createElement("canvas");
  canvas.width = ID_WIDTH;
  canvas.height = ID_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas unavailable");

  // Green field
  ctx.fillStyle = GREEN;
  ctx.fillRect(0, 0, ID_WIDTH, ID_HEIGHT);

  drawPalm(ctx, 120, ID_HEIGHT - 40);
  drawPalm(ctx, ID_WIDTH - 120, ID_HEIGHT - 40, true);
  drawSun(ctx, ID_WIDTH / 2, ID_HEIGHT - 110, 36);

  // Cream card
  const pad = 56;
  const cardX = pad;
  const cardY = 64;
  const cardW = ID_WIDTH - pad * 2;
  const cardH = ID_HEIGHT - 220;
  ctx.fillStyle = CREAM;
  roundRect(ctx, cardX, cardY, cardW, cardH, 36);
  ctx.fill();

  // Magenta ticket stub
  ctx.fillStyle = MAGENTA;
  roundRect(ctx, cardX + cardW / 2 - 130, cardY + 28, 260, 48, 24);
  ctx.fill();
  ctx.fillStyle = CREAM;
  ctx.font = `700 22px "DM Sans", system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("HH GOA 2026", cardX + cardW / 2, cardY + 52);

  // Wordmark
  ctx.fillStyle = GREEN;
  ctx.font = `400 64px "Archivo Black", Impact, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("HACKER HOUSE", cardX + cardW / 2, cardY + 130);

  // Photo
  const photoSize = 360;
  const photoX = cardX + (cardW - photoSize) / 2;
  const photoY = cardY + 170;
  ctx.strokeStyle = YELLOW;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2 + 8, 0, Math.PI * 2);
  ctx.stroke();
  coverInBox(ctx, photo, photoX, photoY, photoSize);

  // Magenta ring accent
  ctx.strokeStyle = MAGENTA;
  ctx.lineWidth = 4;
  ctx.setLineDash([8, 10]);
  ctx.beginPath();
  ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2 + 22, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Name banner
  const nameY = photoY + photoSize + 48;
  ctx.fillStyle = GREEN;
  roundRect(ctx, cardX + 48, nameY, cardW - 96, 72, 16);
  ctx.fill();
  ctx.fillStyle = YELLOW;
  const displayName = name.trim().toUpperCase() || "BUILDER";
  const nameSize = fitText(ctx, displayName, cardW - 140, 36, 20);
  ctx.font = `700 ${nameSize}px "DM Sans", system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(displayName, cardX + cardW / 2, nameY + 36);

  // Role + title
  ctx.fillStyle = MAGENTA;
  ctx.font = `700 22px "DM Sans", system-ui, sans-serif`;
  ctx.fillText(role.trim().toUpperCase() || "BUILDER", cardX + cardW / 2, nameY + 110);

  ctx.fillStyle = GREEN;
  ctx.font = `700 28px "DM Sans", system-ui, sans-serif`;
  ctx.fillText(title, cardX + cardW / 2, nameY + 152);

  // Serial
  ctx.fillStyle = BLACK;
  ctx.font = `700 26px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.fillText(serial, cardX + cardW / 2, nameY + 210);

  ctx.fillStyle = GREEN_DEEP;
  ctx.font = `500 18px "DM Sans", system-ui, sans-serif`;
  ctx.fillText("BUILDER ID", cardX + cardW / 2, nameY + 242);

  // Bottom hashtag strip on card
  ctx.fillStyle = MAGENTA;
  roundRect(ctx, cardX + 48, cardY + cardH - 78, cardW - 96, 46, 14);
  ctx.fill();
  ctx.fillStyle = CREAM;
  ctx.font = `700 22px "DM Sans", system-ui, sans-serif`;
  ctx.fillText("#FrameInGoa", cardX + cardW / 2, cardY + cardH - 55);

  return { blob: await canvasToJpeg(canvas), title };
}

export function blobToPassFile(blob: Blob, serial: string): File {
  return new File([blob], `${serial}.jpg`, { type: "image/jpeg" });
}
