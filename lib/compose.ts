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
  const dx = (size - dw) / 2;
  const dy = (size - dh) / 2;
  ctx.drawImage(source, dx, dy, dw, dh);
}

function canvasToJpegBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("canvas.toBlob failed"));
        else resolve(blob);
      },
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
  opts: {
    font: string;
    fill: string;
    stroke?: string;
    strokeWidth?: number;
    invert?: boolean;
  },
) {
  const chars = [...text];
  if (chars.length === 0) return;

  ctx.save();
  ctx.font = opts.font;
  ctx.fillStyle = opts.fill;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (opts.stroke) {
    ctx.strokeStyle = opts.stroke;
    ctx.lineWidth = opts.strokeWidth ?? 6;
    ctx.lineJoin = "round";
  }

  const total = Math.abs(endAngle - startAngle);
  const dir = endAngle >= startAngle ? 1 : -1;
  const step = total / Math.max(chars.length - 1, 1);

  for (let i = 0; i < chars.length; i++) {
    const angle = startAngle + dir * step * i;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + (opts.invert ? -Math.PI / 2 : Math.PI / 2));
    const ch = chars[i]!;
    if (opts.stroke) ctx.strokeText(ch, 0, 0);
    ctx.fillText(ch, 0, 0);
    ctx.restore();
  }
  ctx.restore();
}

function drawDiamond(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  fill: string = BLACK,
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

function strokeColor(key: FrameTheme["innerStroke"]): string {
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
  ringOuter: number,
  ringInner: number,
) {
  ctx.beginPath();
  ctx.arc(cx, cy, ringOuter, 0, Math.PI * 2);
  ctx.arc(cx, cy, ringInner, 0, Math.PI * 2, true);

  switch (theme.ring) {
    case "conicBrand": {
      const grad = ctx.createConicGradient(-Math.PI / 2, cx, cy);
      grad.addColorStop(0, MAGENTA);
      grad.addColorStop(0.2, "#FF4D6A");
      grad.addColorStop(0.38, "#FF7A3D");
      grad.addColorStop(0.55, YELLOW);
      grad.addColorStop(0.72, "#E8B010");
      grad.addColorStop(0.88, "#C45A2A");
      grad.addColorStop(1, MAGENTA);
      ctx.fillStyle = grad;
      break;
    }
    case "solidMagenta":
      ctx.fillStyle = MAGENTA;
      break;
    case "solidYellow":
      ctx.fillStyle = YELLOW;
      break;
    case "splitGreenMagenta": {
      const grad = ctx.createConicGradient(-Math.PI / 2, cx, cy);
      grad.addColorStop(0, GREEN);
      grad.addColorStop(0.5, GREEN);
      grad.addColorStop(0.5, MAGENTA);
      grad.addColorStop(1, MAGENTA);
      ctx.fillStyle = grad;
      break;
    }
    default: {
      const _e: never = theme.ring;
      void _e;
      ctx.fillStyle = MAGENTA;
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
}

function drawStamp(
  ctx: CanvasRenderingContext2D,
  theme: FrameTheme,
  cx: number,
  cy: number,
) {
  ctx.save();
  ctx.font = `900 96px "Noto Sans Devanagari", "DM Sans", system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";

  switch (theme.stamp) {
    case "outlineMagenta":
      ctx.lineWidth = 16;
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
      const w = 220;
      const h = 88;
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

function drawOuter(
  ctx: CanvasRenderingContext2D,
  theme: FrameTheme,
  size: number,
) {
  switch (theme.outerFrame) {
    case "none":
      break;
    case "hardSquare": {
      const pad = 28;
      ctx.strokeStyle = BLACK;
      ctx.lineWidth = 10;
      ctx.strokeRect(pad, pad, size - pad * 2, size - pad * 2);
      ctx.strokeStyle = YELLOW;
      ctx.lineWidth = 4;
      ctx.strokeRect(pad + 12, pad + 12, size - (pad + 12) * 2, size - (pad + 12) * 2);
      break;
    }
    case "ticketNotch": {
      ctx.fillStyle = theme.bg === "creamHalftone" ? GREEN : DEEP;
      const r = 28;
      for (const [x, y] of [
        [0, size / 2],
        [size, size / 2],
        [size / 2, 0],
        [size / 2, size],
      ] as const) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    default: {
      const _e: never = theme.outerFrame;
      void _e;
    }
  }
}

/**
 * Circular badge frame parameterized by FrameTheme.
 */
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

  const cx = size / 2;
  const cy = size / 2;
  const ringOuter = 520;
  const ringInner = 400;
  const photoR = ringInner - 6;
  const textR = (ringOuter + ringInner) / 2;

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, photoR, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(cx - photoR, cy - photoR, photoR * 2, photoR * 2);
  coverCropDraw(ctx, photo, size);
  ctx.restore();

  fillRing(ctx, theme, cx, cy, ringOuter, ringInner);

  ctx.beginPath();
  ctx.arc(cx, cy, ringInner, 0, Math.PI * 2);
  ctx.strokeStyle = strokeColor(theme.innerStroke);
  ctx.lineWidth = 8;
  ctx.stroke();

  if (theme.diamonds) {
    const dFill = theme.ring === "solidYellow" ? MAGENTA : BLACK;
    drawDiamond(ctx, cx - textR, cy, 16, dFill);
    drawDiamond(ctx, cx + textR, cy, 16, dFill);
  }

  const topFill = theme.arcInk === "cream" ? CREAM : BLACK;
  const bottomFill = theme.arcInk === "black" ? BLACK : CREAM;

  drawArcText(ctx, "HACKER HOUSE GOA", cx, cy, textR, -Math.PI * 0.82, -Math.PI * 0.18, {
    font: `800 44px "DM Sans", system-ui, sans-serif`,
    fill: topFill,
  });

  drawArcText(ctx, "OCT 28-31  •  2026", cx, cy, textR, Math.PI * 0.22, Math.PI * 0.78, {
    font: `800 36px "DM Sans", system-ui, sans-serif`,
    fill: bottomFill,
    invert: true,
  });

  drawStamp(ctx, theme, cx, cy + photoR * 0.48);
  drawOuter(ctx, theme, size);

  return canvasToJpegBlob(canvas);
}

export function blobToFrameFile(blob: Blob): File {
  return new File([blob], "hh-goa-2026.jpg", { type: "image/jpeg" });
}
