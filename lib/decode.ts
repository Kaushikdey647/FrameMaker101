const MAX_LONG_EDGE = 1600;

export function isHeicLike(file: File): boolean {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return (
    name.endsWith(".heic") ||
    name.endsWith(".heif") ||
    type === "image/heic" ||
    type === "image/heif"
  );
}

/** Decode with EXIF orientation; long edge capped without a full-res intermediate. */
async function bitmapFromBlob(blob: Blob): Promise<ImageBitmap> {
  const first = await createImageBitmap(blob, {
    imageOrientation: "from-image",
    resizeWidth: MAX_LONG_EDGE,
    resizeQuality: "high",
  });

  if (first.height <= MAX_LONG_EDGE) return first;

  // Portrait (or tall) after width-cap — re-decode capped by height.
  first.close();
  return createImageBitmap(blob, {
    imageOrientation: "from-image",
    resizeHeight: MAX_LONG_EDGE,
    resizeQuality: "high",
  });
}

async function heicToJpegBlob(file: File): Promise<Blob> {
  const heic2any = (await import("heic2any")).default;
  const result = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.92,
  });
  return Array.isArray(result) ? result[0] : result;
}

/**
 * Decode an uploaded photo with EXIF orientation applied and long edge capped.
 * Tries createImageBitmap first; lazy-loads heic2any only if that throws.
 */
export async function decodePhoto(
  file: File,
  onConverting?: () => void,
): Promise<ImageBitmap> {
  try {
    return await bitmapFromBlob(file);
  } catch (first) {
    onConverting?.();
    try {
      const jpeg = await heicToJpegBlob(file);
      return await bitmapFromBlob(jpeg);
    } catch {
      throw first instanceof Error ? first : new Error("Unsupported image");
    }
  }
}
