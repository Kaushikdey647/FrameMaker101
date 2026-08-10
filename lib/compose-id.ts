import { JPEG_QUALITY } from "./compose";
import { pickBuilderTitle } from "./builder-titles";
import { drawPalmHorizon, drawPlane } from "./goa-motifs";
import { GOA_DEST_IATA, type IndiaAirport } from "./india-airports";
import { BRAND, ID_THEMES, type IdTheme } from "./style-kit";

/** Standard credential ratio 2.63 × 3.88. */
export const ID_WIDTH = 1052;
export const ID_HEIGHT = 1552;

const FONT_DISPLAY = `"Archivo Black", Impact, sans-serif`;
const FONT_UI = `"DM Sans", system-ui, sans-serif`;
const FONT_MONO = `ui-monospace, SFMono-Regular, Menlo, monospace`;

const PAD = 40;
const FOOTER_H = 72;
const PHOTO_SIZE = 580;
const FRAME = 10;
const CREAM = BRAND.cream;

export type ComposeIdInput = {
  photo: ImageBitmap;
  name: string;
  role: string;
  serial: string;
  origin: IndiaAirport;
  theme?: IdTheme;
};

let tribalPromise: Promise<HTMLImageElement> | null = null;
let wordmarkPromise: Promise<HTMLImageElement> | null = null;

function loadImage(src: string, label: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${label}`));
    img.src = src;
  });
}

function loadTribal(): Promise<HTMLImageElement> {
  if (!tribalPromise) {
    tribalPromise = loadImage("/assets/tribal-pattern.svg", "tribal pattern");
  }
  return tribalPromise;
}

function loadWordmark(): Promise<HTMLImageElement> {
  if (!wordmarkPromise) {
    wordmarkPromise = loadImage(
      "/assets/title-transparent.svg",
      "title wordmark",
    );
  }
  return wordmarkPromise;
}

function hexToRgba(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = parseInt(full, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

function coverSquare(
  ctx: CanvasRenderingContext2D,
  source: ImageBitmap,
  x: number,
  y: number,
  size: number,
) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, size, size);
  ctx.clip();
  const scale = Math.max(size / source.width, size / source.height);
  const dw = source.width * scale;
  const dh = source.height * scale;
  ctx.drawImage(source, x + (size - dw) / 2, y + (size - dh) / 2, dw, dh);
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

function nameLines(name: string, maxChars = 12): [string, string | null] {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1 || name.length <= maxChars) return [name, null];
  const mid = Math.ceil(parts.length / 2);
  return [parts.slice(0, mid).join(" "), parts.slice(mid).join(" ")];
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

function drawFadeBackground(
  ctx: CanvasRenderingContext2D,
  tribal: HTMLImageElement,
  bg: string,
) {
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, ID_WIDTH, ID_HEIGHT);

  const tw = tribal.naturalWidth || 1000;
  const th = tribal.naturalHeight || 500;
  const scale = Math.max(ID_WIDTH / tw, ID_HEIGHT / th);
  const dw = tw * scale;
  const dh = th * scale;

  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.drawImage(tribal, (ID_WIDTH - dw) / 2, (ID_HEIGHT - dh) / 2, dw, dh);
  ctx.restore();

  const fade = ctx.createLinearGradient(0, 0, 0, ID_HEIGHT);
  fade.addColorStop(0, hexToRgba(bg, 0));
  fade.addColorStop(0.35, hexToRgba(bg, 0));
  fade.addColorStop(0.75, hexToRgba(bg, 1));
  fade.addColorStop(1, bg);
  ctx.fillStyle = fade;
  ctx.fillRect(0, 0, ID_WIDTH, ID_HEIGHT);
}

function drawFramedSquarePhoto(
  ctx: CanvasRenderingContext2D,
  photo: ImageBitmap,
  x: number,
  y: number,
  size: number,
) {
  const outer = size + FRAME * 2;
  ctx.fillStyle = BRAND.deep;
  ctx.fillRect(x - FRAME, y - FRAME, outer, outer);
  ctx.strokeStyle = BRAND.black;
  ctx.lineWidth = 2;
  ctx.strokeRect(x - FRAME, y - FRAME, outer, outer);
  coverSquare(ctx, photo, x, y, size);
}

/** Centered multi-line name; returns total block height. */
function drawCenteredName(
  ctx: CanvasRenderingContext2D,
  name: string,
  cx: number,
  y: number,
  maxW: number,
  fill: string,
  baseSize = 88,
): number {
  const [l1, l2] = nameLines(name, 10);
  ctx.fillStyle = fill;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  const s1 = fitText(ctx, l1, maxW, baseSize, 36, FONT_DISPLAY);
  ctx.font = `700 ${s1}px ${FONT_DISPLAY}`;
  ctx.fillText(l1, cx, y);
  if (!l2) return s1;
  const s2 = fitText(ctx, l2, maxW, s1, 32, FONT_DISPLAY);
  ctx.font = `700 ${s2}px ${FONT_DISPLAY}`;
  ctx.fillText(l2, cx, y + s1 * 0.95);
  return s1 + s2 * 0.95;
}

function drawRouteStrip(
  ctx: CanvasRenderingContext2D,
  origin: IndiaAirport,
  cx: number,
  y: number,
  maxW: number,
  theme: IdTheme,
) {
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  if (origin.iata === GOA_DEST_IATA) {
    ctx.fillStyle = CREAM;
    ctx.font = `700 44px ${FONT_DISPLAY}`;
    ctx.fillText("LOCAL · GOA", cx, y);
    return;
  }

  const codeX = maxW / 2 - 78;
  ctx.fillStyle = CREAM;
  ctx.font = `700 44px ${FONT_DISPLAY}`;
  ctx.fillText(origin.iata, cx - codeX, y);
  ctx.fillText(GOA_DEST_IATA, cx + codeX, y);

  ctx.fillStyle = "rgba(247,241,230,0.7)";
  ctx.font = `700 20px ${FONT_UI}`;
  ctx.fillText(origin.city.slice(0, 14), cx - codeX, y + 30);
  ctx.fillText("Goa", cx + codeX, y + 30);

  const arcFrom = cx - codeX + 74;
  const arcTo = cx + codeX - 74;
  const apexY = y - 60;
  ctx.save();
  ctx.setLineDash([10, 10]);
  ctx.lineWidth = 3;
  ctx.strokeStyle = hexToRgba(BRAND.cream, 0.55);
  ctx.beginPath();
  ctx.moveTo(arcFrom, y - 14);
  ctx.quadraticCurveTo((arcFrom + arcTo) / 2, apexY - 32, arcTo, y - 14);
  ctx.stroke();
  ctx.restore();

  drawPlane(ctx, (arcFrom + arcTo) / 2, apexY - 9, 46, 0, theme.accent);
}

function drawBuilderId(
  ctx: CanvasRenderingContext2D,
  input: ComposeIdInput,
  theme: IdTheme,
  title: string,
  displayName: string,
  displayRole: string,
  tribal: HTMLImageElement,
  wordmark: HTMLImageElement,
) {
  const cx = ID_WIDTH / 2;
  const maxW = ID_WIDTH - PAD * 2;

  drawFadeBackground(ctx, tribal, theme.bg);

  const markW = 170;
  const markH =
    (markW * (wordmark.naturalHeight || 255)) / (wordmark.naturalWidth || 291);
  ctx.drawImage(wordmark, cx - markW / 2, 48, markW, markH);

  const photoX = cx - PHOTO_SIZE / 2;
  const photoY = 48 + markH + 56;
  drawFramedSquarePhoto(ctx, input.photo, photoX, photoY, PHOTO_SIZE);

  let ly = photoY + PHOTO_SIZE + FRAME + 110;
  const nameH = drawCenteredName(ctx, displayName, cx, ly, maxW, CREAM, 96);
  ly += nameH + 46;

  const roleLabel = displayRole.slice(0, 36);
  const roleSize = fitText(ctx, roleLabel, maxW, 38, 24, FONT_UI);
  ctx.fillStyle = "rgba(247,241,230,0.82)";
  ctx.font = `700 ${roleSize}px ${FONT_UI}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(roleLabel, cx, ly);
  ly += roleSize + 56;

  ctx.font = `700 24px ${FONT_UI}`;
  const tagLabel = title.slice(0, 28);
  const tagW = Math.min(maxW, ctx.measureText(tagLabel).width + 48);
  const tagH = 52;
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 3;
  ctx.strokeRect(cx - tagW / 2, ly, tagW, tagH);
  ctx.fillStyle = theme.accent;
  ctx.textBaseline = "middle";
  ctx.fillText(tagLabel, cx, ly + tagH / 2 + 1);

  const footerY = ID_HEIGHT - FOOTER_H / 2;
  const ruleY = footerY - FOOTER_H / 2 - 28;

  drawPalmHorizon(ctx, PAD, ruleY, maxW, hexToRgba(BRAND.deep, 0.55));
  drawRouteStrip(ctx, input.origin, cx, ruleY - 97, maxW, theme);

  ctx.fillStyle = "rgba(247,241,230,0.28)";
  ctx.fillRect(PAD, ruleY, maxW, 2);

  ctx.fillStyle = CREAM;
  ctx.font = `700 24px ${FONT_UI}`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillText("OCT 28–31 2026", PAD, footerY);
  ctx.textAlign = "center";
  ctx.font = `700 24px ${FONT_MONO}`;
  ctx.fillText(`ID · ${input.serial}`, cx, footerY);
  ctx.textAlign = "right";
  ctx.font = `700 24px ${FONT_UI}`;
  ctx.fillText("#FrameInGoa", ID_WIDTH - PAD, footerY);
}

export async function composeBuilderId(input: ComposeIdInput): Promise<{
  blob: Blob;
  title: string;
}> {
  const theme = input.theme ?? ID_THEMES[0]!;
  const title = pickBuilderTitle(input.name, input.serial);
  const displayName = input.name.trim().toUpperCase() || "BUILDER";
  const displayRole = input.role.trim().toUpperCase() || "BUILDER";

  const [tribal, wordmark] = await Promise.all([loadTribal(), loadWordmark()]);

  const canvas = document.createElement("canvas");
  canvas.width = ID_WIDTH;
  canvas.height = ID_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas unavailable");

  drawBuilderId(
    ctx,
    input,
    theme,
    title,
    displayName,
    displayRole,
    tribal,
    wordmark,
  );

  return { blob: await canvasToJpeg(canvas), title };
}

export function blobToPassFile(blob: Blob, serial: string): File {
  return new File([blob], `${serial}.jpg`, { type: "image/jpeg" });
}
