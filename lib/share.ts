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

/** Mobile system share sheet with JPEG + caption (WhatsApp, X, IG, Files…). */
export async function shareNative(
  readyFile: File,
  opts?: { serial?: string; format?: "frame" | "pass" },
): Promise<"shared" | "cancelled"> {
  if (!canShareFiles(readyFile)) {
    throw new Error(
      "Sharing needs HTTPS on your phone. Save the photo instead, or open the live site.",
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

export type ShareToXResult = "shared" | "cancelled" | "intent";

/**
 * Mobile-first X: same Web Share path so the JPEG can attach when the user picks X.
 * Fallback (no file share): open X compose with caption only — caller should save the photo.
 */
export async function shareToX(
  readyFile: File,
  opts?: { serial?: string; format?: "frame" | "pass" },
): Promise<ShareToXResult> {
  const caption = buildShareCaption(opts);

  if (canShareFiles(readyFile)) {
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
    }
  }

  const intent = `https://x.com/intent/post?text=${encodeURIComponent(caption)}`;
  window.open(intent, "_blank", "noopener,noreferrer");
  return "intent";
}
