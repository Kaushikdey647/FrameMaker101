export const FRAME_SIZE = 1200;
export const JPEG_QUALITY = 0.92;
export const OVERLAY_PATH = "/frames/hh-goa-2026-overlay.png";

let overlayPromise: Promise<HTMLImageElement> | null = null;

function loadOverlay(): Promise<HTMLImageElement> {
  if (!overlayPromise) {
    overlayPromise = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load frame overlay"));
      img.src = OVERLAY_PATH;
    });
  }
  return overlayPromise;
}

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

/** Cover-crop photo into 1200², draw overlay on top, export JPEG. */
export async function composeFrame(photo: ImageBitmap): Promise<Blob> {
  const overlay = await loadOverlay();
  const canvas = document.createElement("canvas");
  canvas.width = FRAME_SIZE;
  canvas.height = FRAME_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas unavailable");

  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, FRAME_SIZE, FRAME_SIZE);
  coverCropDraw(ctx, photo, FRAME_SIZE);
  ctx.drawImage(overlay, 0, 0, FRAME_SIZE, FRAME_SIZE);

  return canvasToJpegBlob(canvas);
}

export function blobToFrameFile(blob: Blob): File {
  return new File([blob], "hh-goa-2026.jpg", { type: "image/jpeg" });
}
