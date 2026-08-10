import { drawPalmHorizon } from "./goa-motifs";
import {
  BRAND,
  type FrameTheme,
  FRAME_THEMES,
} from "./style-kit";

export const FRAME_SIZE = 1200;
export const JPEG_QUALITY = 0.92;

const { green: GREEN, deep: DEEP, yellow: YELLOW, magenta: MAGENTA, cream: CREAM, black: BLACK } =
  BRAND;

function coverCropDraw(
  ctx: CanvasRenderingContext2D,
  source: ImageBitmap,
  size: number,
): void {
  const scale = Math.max(size / source.width, size / source.height);
  const dw = source.width * scale;
  const dh = source.height * scale;
  ctx.drawImage(source, (size - dw) / 2, (size - dh) / 2, dw, dh);
}

function canvasToJpegBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("canvas.toBlob failed"))),
      "image/jpeg",
      JPEG_QUALITY,
    );
  });
}

function drawArcText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  opts: { font: string; fill: string; invert?: boolean },
) {
  const chars = [...text];
  if (!chars.length) return;
  ctx.save();
  ctx.font = opts.font;
  ctx.fillStyle = opts.fill;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const total = Math.abs(endAngle - startAngle);
  const dir = endAngle >= startAngle ? 1 : -1;
  const step = total / Math.max(chars.length - 1, 1);
  for (let i = 0; i < chars.length; i++) {
    const angle = startAngle + dir * step * i;
    ctx.save();
    ctx.translate(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
    ctx.rotate(angle + (opts.invert ? -Math.PI / 2 : Math.PI / 2));
    ctx.fillText(chars[i]!, 0, 0);
    ctx.restore();
  }
  ctx.restore();
}

function drawDiamond(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  fill: string,
) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x + size, y);
  ctx.lineTo(x, y + size);
  ctx.lineTo(x - size, y);
  ctx.closePath();
  ctx.fill();
}

function strokeOf(key: FrameTheme["innerStroke"]): string {
  switch (key) {
    case "cream":
      return CREAM;
    case "yellow":
      return YELLOW;
    case "magenta":
      return MAGENTA;
    default: {
      const _e: never = key;
      return _e;
    }
  }
}

function fillRing(
  ctx: CanvasRenderingContext2D,
  theme: FrameTheme,
  cx: number,
  cy: number,
  outer: number,
  inner: number,
) {
  ctx.beginPath();
  ctx.arc(cx, cy, outer, 0, Math.PI * 2);
  ctx.arc(cx, cy, inner, 0, Math.PI * 2, true);
  switch (theme.ring) {
    case "conicBrand": {
      const g = ctx.createConicGradient(-Math.PI / 2, cx, cy);
      g.addColorStop(0, MAGENTA);
      g.addColorStop(0.2, "#FF4D6A");
      g.addColorStop(0.38, "#FF7A3D");
      g.addColorStop(0.55, YELLOW);
      g.addColorStop(0.72, "#E8B010");
      g.addColorStop(0.88, "#C45A2A");
      g.addColorStop(1, MAGENTA);
      ctx.fillStyle = g;
      break;
    }
    case "solidMagenta":
      ctx.fillStyle = MAGENTA;
      break;
    case "solidYellow":
      ctx.fillStyle = YELLOW;
      break;
    case "splitGreenMagenta": {
      const g = ctx.createConicGradient(-Math.PI / 2, cx, cy);
      g.addColorStop(0, GREEN);
      g.addColorStop(0.5, GREEN);
      g.addColorStop(0.5, MAGENTA);
      g.addColorStop(1, MAGENTA);
      ctx.fillStyle = g;
      break;
    }
    default: {
      const _e: never = theme.ring;
      void _e;
    }
  }
  ctx.fill();
}

function drawBg(ctx: CanvasRenderingContext2D, theme: FrameTheme, size: number) {
  switch (theme.bg) {
    case "green":
      ctx.fillStyle = GREEN;
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = "rgba(247,241,230,0.08)";
      for (let y = 0; y < size; y += 14) {
        for (let x = 0; x < size; x += 14) {
          ctx.beginPath();
          ctx.arc(x + 2, y + 2, 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    case "deep":
      ctx.fillStyle = DEEP;
      ctx.fillRect(0, 0, size, size);
      break;
    case "creamHalftone":
      ctx.fillStyle = CREAM;
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = "rgba(11,77,44,0.14)";
      for (let y = 0; y < size; y += 12) {
        for (let x = 0; x < size; x += 12) {
          ctx.beginPath();
          ctx.arc(x + 2, y + 2, (x + y) % 24 === 0 ? 1.6 : 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    default: {
      const _e: never = theme.bg;
      void _e;
    }
  }

  const palmFill =
    theme.bg === "creamHalftone" ? "rgba(11,77,44,0.12)" : "rgba(8,56,33,0.4)";
  drawPalmHorizon(ctx, 40, size - 30, size - 80, palmFill, 0.035);
}

function clipPhotoCircle(
  ctx: CanvasRenderingContext2D,
  photo: ImageBitmap,
  cx: number,
  cy: number,
  r: number,
  size: number,
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  // Cover-crop into full canvas then only circle shows
  coverCropDraw(ctx, photo, size);
  ctx.restore();
}

function drawStamp(
  ctx: CanvasRenderingContext2D,
  theme: FrameTheme,
  cx: number,
  cy: number,
  size = 96,
) {
  ctx.save();
  ctx.font = `900 ${size}px "Noto Sans Devanagari", "DM Sans", system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  switch (theme.stamp) {
    case "outlineMagenta":
      ctx.lineWidth = size * 0.16;
      ctx.strokeStyle = MAGENTA;
      ctx.strokeText("गोवा", cx, cy);
      ctx.fillStyle = YELLOW;
      ctx.fillText("गोवा", cx, cy);
      break;
    case "flatYellow":
      ctx.fillStyle = YELLOW;
      ctx.fillText("गोवा", cx, cy);
      break;
    case "boxed": {
      const w = size * 2.3;
      const h = size * 0.95;
      ctx.fillStyle = MAGENTA;
      ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
      ctx.strokeStyle = BLACK;
      ctx.lineWidth = 4;
      ctx.strokeRect(cx - w / 2, cy - h / 2, w, h);
      ctx.fillStyle = YELLOW;
      ctx.fillText("गोवा", cx, cy + 4);
      break;
    }
    default: {
      const _e: never = theme.stamp;
      void _e;
    }
  }
  ctx.restore();
}

function drawClassic(ctx: CanvasRenderingContext2D, photo: ImageBitmap, theme: FrameTheme, size: number) {
  const cx = size / 2;
  const cy = size / 2;
  const ringOuter = 520;
  const ringInner = 400;
  const photoR = ringInner - 6;
  const textR = (ringOuter + ringInner) / 2;

  clipPhotoCircle(ctx, photo, cx, cy, photoR, size);
  fillRing(ctx, theme, cx, cy, ringOuter, ringInner);
  ctx.beginPath();
  ctx.arc(cx, cy, ringInner, 0, Math.PI * 2);
  ctx.strokeStyle = strokeOf(theme.innerStroke);
  ctx.lineWidth = 8;
  ctx.stroke();

  if (theme.diamonds) {
    const d = theme.ring === "solidYellow" ? MAGENTA : BLACK;
    drawDiamond(ctx, cx - textR, cy, 16, d);
    drawDiamond(ctx, cx + textR, cy, 16, d);
  }

  const top = theme.arcInk === "cream" ? CREAM : BLACK;
  const bot = theme.arcInk === "black" ? BLACK : CREAM;
  drawArcText(ctx, "HACKER HOUSE GOA", cx, cy, textR, -Math.PI * 0.82, -Math.PI * 0.18, {
    font: `800 44px "DM Sans", system-ui, sans-serif`,
    fill: top,
  });
  drawArcText(ctx, "OCT 28-31  •  2026", cx, cy, textR, Math.PI * 0.22, Math.PI * 0.78, {
    font: `800 36px "DM Sans", system-ui, sans-serif`,
    fill: bot,
    invert: true,
  });
  drawStamp(ctx, theme, cx, cy + photoR * 0.48);
}

function drawSunburst(ctx: CanvasRenderingContext2D, photo: ImageBitmap, theme: FrameTheme, size: number) {
  const cx = size / 2;
  const cy = size / 2;
  const ringOuter = 500;
  const ringInner = 390;
  const photoR = ringInner - 6;

  clipPhotoCircle(ctx, photo, cx, cy, photoR, size);
  fillRing(ctx, theme, cx, cy, ringOuter, ringInner);
  ctx.beginPath();
  ctx.arc(cx, cy, ringInner, 0, Math.PI * 2);
  ctx.strokeStyle = strokeOf(theme.innerStroke);
  ctx.lineWidth = 8;
  ctx.stroke();

  // Radial ticks
  ctx.strokeStyle = YELLOW;
  ctx.lineWidth = 5;
  ctx.lineCap = "square";
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2 - Math.PI / 2;
    const len = i % 3 === 0 ? 36 : 18;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * (ringOuter + 6), cy + Math.sin(a) * (ringOuter + 6));
    ctx.lineTo(cx + Math.cos(a) * (ringOuter + 6 + len), cy + Math.sin(a) * (ringOuter + 6 + len));
    ctx.stroke();
  }

  ctx.fillStyle = CREAM;
  ctx.font = `800 28px "DM Sans", system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("HACKER HOUSE GOA", cx, 70);
  ctx.fillText("OCT 28–31 · 2026", cx, size - 56);
  drawStamp(ctx, theme, cx, cy + photoR * 0.5);
}

function drawStadium(ctx: CanvasRenderingContext2D, photo: ImageBitmap, theme: FrameTheme, size: number) {
  const cx = size / 2;
  const cy = size / 2;
  const ringOuter = 510;
  const ringInner = 400;
  const photoR = ringInner - 6;

  clipPhotoCircle(ctx, photo, cx, cy, photoR, size);
  fillRing(ctx, theme, cx, cy, ringOuter, ringInner);
  ctx.beginPath();
  ctx.arc(cx, cy, ringInner, 0, Math.PI * 2);
  ctx.strokeStyle = strokeOf(theme.innerStroke);
  ctx.lineWidth = 8;
  ctx.stroke();

  // Ribbon bands cutting across ring
  const bandH = 70;
  ctx.fillStyle = MAGENTA;
  ctx.fillRect(40, 120, size - 80, bandH);
  ctx.strokeStyle = BLACK;
  ctx.lineWidth = 4;
  ctx.strokeRect(40, 120, size - 80, bandH);
  ctx.fillStyle = CREAM;
  ctx.font = `900 34px "Archivo Black", Impact, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("HACKER HOUSE GOA", cx, 120 + bandH / 2);

  ctx.fillStyle = YELLOW;
  ctx.fillRect(80, size - 190, size - 160, bandH - 10);
  ctx.strokeStyle = BLACK;
  ctx.strokeRect(80, size - 190, size - 160, bandH - 10);
  ctx.fillStyle = BLACK;
  ctx.font = `800 28px "DM Sans", system-ui, sans-serif`;
  ctx.fillText("OCT 28–31  ·  2026", cx, size - 190 + (bandH - 10) / 2);

  drawStamp(ctx, theme, cx, cy + photoR * 0.42, 84);
}

function drawInset(ctx: CanvasRenderingContext2D, photo: ImageBitmap, theme: FrameTheme, size: number) {
  const pad = 48;
  ctx.fillStyle = CREAM;
  ctx.fillRect(pad, pad, size - pad * 2, size - pad * 2);
  ctx.strokeStyle = BLACK;
  ctx.lineWidth = 10;
  ctx.strokeRect(pad, pad, size - pad * 2, size - pad * 2);
  ctx.strokeStyle = YELLOW;
  ctx.lineWidth = 4;
  ctx.strokeRect(pad + 14, pad + 14, size - (pad + 14) * 2, size - (pad + 14) * 2);

  // Corner chips
  const chip = (tx: number, ty: number, label: string, bg: string) => {
    ctx.fillStyle = bg;
    ctx.fillRect(tx, ty, 120, 36);
    ctx.strokeStyle = BLACK;
    ctx.lineWidth = 3;
    ctx.strokeRect(tx, ty, 120, 36);
    ctx.fillStyle = bg === YELLOW ? BLACK : CREAM;
    ctx.font = `700 14px "DM Sans", system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, tx + 60, ty + 18);
  };
  chip(pad + 28, pad + 28, "HH GOA", MAGENTA);
  chip(size - pad - 148, pad + 28, "2026", YELLOW);
  chip(pad + 28, size - pad - 64, "OCT 28–31", GREEN);
  chip(size - pad - 148, size - pad - 64, "#FrameInGoa", MAGENTA);

  const cx = size / 2;
  const cy = size / 2;
  const ringOuter = 380;
  const ringInner = 300;
  const photoR = ringInner - 4;
  clipPhotoCircle(ctx, photo, cx, cy, photoR, size);
  fillRing(ctx, theme, cx, cy, ringOuter, ringInner);
  ctx.beginPath();
  ctx.arc(cx, cy, ringInner, 0, Math.PI * 2);
  ctx.strokeStyle = strokeOf(theme.innerStroke);
  ctx.lineWidth = 6;
  ctx.stroke();
  if (theme.diamonds) {
    drawDiamond(ctx, cx - (ringOuter + ringInner) / 2, cy, 12, BLACK);
    drawDiamond(ctx, cx + (ringOuter + ringInner) / 2, cy, 12, BLACK);
  }
  drawStamp(ctx, theme, cx, cy + photoR * 0.5, 72);
}

function drawOrbit(ctx: CanvasRenderingContext2D, photo: ImageBitmap, theme: FrameTheme, size: number) {
  const cx = size / 2;
  const cy = size / 2;
  const outer = 530;
  const mid = 470;
  const inner = 390;
  const photoR = inner - 6;

  clipPhotoCircle(ctx, photo, cx, cy, photoR, size);

  // Outer thin magenta ring
  ctx.beginPath();
  ctx.arc(cx, cy, outer, 0, Math.PI * 2);
  ctx.arc(cx, cy, mid, 0, Math.PI * 2, true);
  ctx.fillStyle = MAGENTA;
  ctx.fill();

  // Inner thick yellow
  ctx.beginPath();
  ctx.arc(cx, cy, mid - 4, 0, Math.PI * 2);
  ctx.arc(cx, cy, inner, 0, Math.PI * 2, true);
  ctx.fillStyle = YELLOW;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy, inner, 0, Math.PI * 2);
  ctx.strokeStyle = strokeOf(theme.innerStroke);
  ctx.lineWidth = 6;
  ctx.stroke();

  // Orbit nodes
  const r = (outer + mid) / 2;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    drawDiamond(ctx, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 10, BLACK);
  }

  drawArcText(ctx, "OCT 28-31  •  2026", cx, cy, (mid + inner) / 2, Math.PI * 0.25, Math.PI * 0.75, {
    font: `800 32px "DM Sans", system-ui, sans-serif`,
    fill: BLACK,
    invert: true,
  });
  ctx.fillStyle = CREAM;
  ctx.font = `800 26px "DM Sans", system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("HACKER HOUSE GOA", cx, 64);
  drawStamp(ctx, theme, cx, cy + photoR * 0.48);
}

function drawSeal(ctx: CanvasRenderingContext2D, photo: ImageBitmap, theme: FrameTheme, size: number) {
  const pad = 36;
  ctx.strokeStyle = BLACK;
  ctx.lineWidth = 14;
  ctx.strokeRect(pad, pad, size - pad * 2, size - pad * 2);
  ctx.strokeStyle = YELLOW;
  ctx.lineWidth = 5;
  ctx.strokeRect(pad + 16, pad + 16, size - (pad + 16) * 2, size - (pad + 16) * 2);

  const cx = size / 2;
  const cy = size / 2 - 40;
  const ringOuter = 430;
  const ringInner = 340;
  const photoR = ringInner - 6;

  clipPhotoCircle(ctx, photo, cx, cy, photoR, size);
  fillRing(ctx, theme, cx, cy, ringOuter, ringInner);
  ctx.beginPath();
  ctx.arc(cx, cy, ringInner, 0, Math.PI * 2);
  ctx.strokeStyle = strokeOf(theme.innerStroke);
  ctx.lineWidth = 7;
  ctx.stroke();

  // Lockup under circle
  ctx.fillStyle = MAGENTA;
  ctx.fillRect(size / 2 - 160, size - 200, 320, 56);
  ctx.strokeStyle = BLACK;
  ctx.lineWidth = 4;
  ctx.strokeRect(size / 2 - 160, size - 200, 320, 56);
  ctx.fillStyle = YELLOW;
  ctx.font = `900 32px "Archivo Black", Impact, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("GOA 2026", cx, size - 172);

  ctx.fillStyle = CREAM;
  ctx.font = `700 18px "DM Sans", system-ui, sans-serif`;
  ctx.fillText("HACKER HOUSE  ·  OCT 28–31", cx, size - 120);

  drawStamp(ctx, theme, cx, cy + photoR * 0.55, 110);
}

export async function composeFrame(
  photo: ImageBitmap,
  theme: FrameTheme = FRAME_THEMES[0]!,
): Promise<Blob> {
  const size = FRAME_SIZE;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas unavailable");

  drawBg(ctx, theme, size);

  switch (theme.frameLayout) {
    case "classic":
      drawClassic(ctx, photo, theme, size);
      break;
    case "sunburst":
      drawSunburst(ctx, photo, theme, size);
      break;
    case "stadium":
      drawStadium(ctx, photo, theme, size);
      break;
    case "inset":
      drawInset(ctx, photo, theme, size);
      break;
    case "orbit":
      drawOrbit(ctx, photo, theme, size);
      break;
    case "seal":
      drawSeal(ctx, photo, theme, size);
      break;
    default: {
      const _e: never = theme.frameLayout;
      void _e;
    }
  }

  return canvasToJpegBlob(canvas);
}

export function blobToFrameFile(blob: Blob): File {
  return new File([blob], "hh-goa-2026.jpg", { type: "image/jpeg" });
}
