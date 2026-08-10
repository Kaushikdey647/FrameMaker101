export const FRAME_SIZE = 1200;
export const JPEG_QUALITY = 0.92;

const GREEN = "#0B4D2C";
const YELLOW = "#F5C518";
const MAGENTA = "#FF2D8A";
const CREAM = "#F7F1E6";
const BLACK = "#111111";

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

/** Draw text along a circular arc (angles in radians from +x, CCW). */
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

function drawDiamond(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.fillStyle = BLACK;
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x + size, y);
  ctx.lineTo(x, y + size);
  ctx.lineTo(x - size, y);
  ctx.closePath();
  ctx.fill();
}

/**
 * Circular badge frame: photo clipped to circle, gradient ring,
 * curved HACKER HOUSE GOA / OCT 28-31 • 2026, गोवा stamp.
 */
export async function composeFrame(photo: ImageBitmap): Promise<Blob> {
  const size = FRAME_SIZE;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas unavailable");

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

  const cx = size / 2;
  const cy = size / 2;
  // Thick badge ring like the reference mock
  const ringOuter = 520;
  const ringInner = 400;
  const photoR = ringInner - 6;
  const textR = (ringOuter + ringInner) / 2;

  // Photo clipped to circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, photoR, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(cx - photoR, cy - photoR, photoR * 2, photoR * 2);
  coverCropDraw(ctx, photo, size);
  ctx.restore();

  // Conic gradient ring (magenta top → orange → yellow bottom)
  const grad = ctx.createConicGradient(-Math.PI / 2, cx, cy);
  grad.addColorStop(0, MAGENTA);
  grad.addColorStop(0.2, "#FF4D6A");
  grad.addColorStop(0.38, "#FF7A3D");
  grad.addColorStop(0.55, YELLOW);
  grad.addColorStop(0.72, "#E8B010");
  grad.addColorStop(0.88, "#C45A2A");
  grad.addColorStop(1, MAGENTA);

  ctx.beginPath();
  ctx.arc(cx, cy, ringOuter, 0, Math.PI * 2);
  ctx.arc(cx, cy, ringInner, 0, Math.PI * 2, true);
  ctx.fillStyle = grad;
  ctx.fill();

  // Crisp cream inner stroke
  ctx.beginPath();
  ctx.arc(cx, cy, ringInner, 0, Math.PI * 2);
  ctx.strokeStyle = CREAM;
  ctx.lineWidth = 8;
  ctx.stroke();

  drawDiamond(ctx, cx - textR, cy, 16);
  drawDiamond(ctx, cx + textR, cy, 16);

  // Top arc — white on magenta
  drawArcText(ctx, "HACKER HOUSE GOA", cx, cy, textR, -Math.PI * 0.82, -Math.PI * 0.18, {
    font: `800 44px "DM Sans", system-ui, sans-serif`,
    fill: CREAM,
  });

  // Bottom arc — black on yellow, upright
  drawArcText(ctx, "OCT 28-31  •  2026", cx, cy, textR, Math.PI * 0.22, Math.PI * 0.78, {
    font: `800 36px "DM Sans", system-ui, sans-serif`,
    fill: BLACK,
    invert: true,
  });

  // गोवा stamp over lower photo
  ctx.save();
  ctx.font = `900 96px "Noto Sans Devanagari", "DM Sans", system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.lineWidth = 16;
  ctx.strokeStyle = MAGENTA;
  ctx.strokeText("गोवा", cx, cy + photoR * 0.48);
  ctx.fillStyle = YELLOW;
  ctx.fillText("गोवा", cx, cy + photoR * 0.48);
  ctx.restore();

  return canvasToJpegBlob(canvas);
}

export function blobToFrameFile(blob: Blob): File {
  return new File([blob], "hh-goa-2026.jpg", { type: "image/jpeg" });
}
