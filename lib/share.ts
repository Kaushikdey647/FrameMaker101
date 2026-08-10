export function getAppUrl(): string {
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}

export function buildShareCaption(opts?: {
  appUrl?: string;
  serial?: string;
  format?: "frame" | "pass";
}): string {
  const appUrl = opts?.appUrl ?? getAppUrl();
  if (opts?.format === "pass" && opts.serial) {
    return `My HH Goa 2026 Builder ID ${opts.serial} #FrameInGoa\n\nMake yours: ${appUrl}`;
  }
  return `Just framed myself for HH Goa 2026! #FrameInGoa\n\nMake yours: ${appUrl}`;
}

export function canShareFiles(file: File): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    !!navigator.canShare?.({ files: [file] })
  );
}

export async function shareNative(
  readyFile: File,
  opts?: { serial?: string; format?: "frame" | "pass" },
): Promise<"shared" | "cancelled"> {
  if (!canShareFiles(readyFile)) {
    throw new Error(
      "System share isn’t available here. Try Share to X, or download the image.",
    );
  }

  const caption = buildShareCaption(opts);
  try {
    await navigator.share({
      files: [readyFile],
      text: caption,
      title: "HH Goa 2026",
    });
    return "shared";
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return "cancelled";
    }
    throw err;
  }
}

function openXIntent(caption: string): void {
  const intent = `https://x.com/intent/post?text=${encodeURIComponent(caption)}`;
  window.open(intent, "_blank", "noopener,noreferrer");
}

/** Convert JPEG/other image File to PNG for clipboard paste into X web compose. */
async function fileToPngBlob(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas unavailable");
    ctx.drawImage(bitmap, 0, 0);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("PNG encode failed"))),
        "image/png",
      );
    });
  } finally {
    bitmap.close();
  }
}

async function copyImageToClipboard(file: File): Promise<boolean> {
  if (
    typeof navigator === "undefined" ||
    !navigator.clipboard?.write ||
    typeof ClipboardItem === "undefined"
  ) {
    return false;
  }
  try {
    const png = await fileToPngBlob(file);
    await navigator.clipboard.write([
      new ClipboardItem({ "image/png": png }),
    ]);
    return true;
  } catch {
    return false;
  }
}

export type ShareToXResult =
  | "shared"
  | "cancelled"
  | "clipboard-intent"
  | "intent";

/**
 * Get the JPEG into an X post when the platform allows it.
 * - Secure mobile: Web Share with file (user must pick X — only way browsers can hand media to X).
 * - Desktop: copy image to clipboard + open X compose (paste with Cmd/Ctrl+V).
 * - Else: open intent only (caller should download the file for manual attach).
 */
export async function shareToX(
  readyFile: File,
  opts?: { serial?: string; format?: "frame" | "pass" },
): Promise<ShareToXResult> {
  const caption = buildShareCaption(opts);

  // Only path that can auto-attach the JPEG into the X mobile app.
  if (canShareFiles(readyFile)) {
    try {
      await navigator.share({
        files: [readyFile],
        text: caption,
        title: "Post to X — HH Goa 2026",
      });
      return "shared";
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return "cancelled";
      }
      // Fall through to clipboard / intent.
    }
  }

  const copied = await copyImageToClipboard(readyFile);
  openXIntent(caption);
  return copied ? "clipboard-intent" : "intent";
}
