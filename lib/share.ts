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

/**
 * Prefer Web Share with the JPEG (user picks X). Intent cannot attach images —
 * fallback is text + app URL only.
 */
export async function shareToX(
  readyFile: File,
  opts?: { serial?: string; format?: "frame" | "pass" },
): Promise<"shared" | "cancelled" | "intent"> {
  const appUrl = getAppUrl();
  const caption = buildShareCaption({
    appUrl,
    serial: opts?.serial,
    format: opts?.format,
  });

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
      // Fall through to intent if the sheet fails for another reason.
    }
  }

  const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}&url=${encodeURIComponent(appUrl)}`;
  window.open(intent, "_blank", "noopener,noreferrer");
  return "intent";
}
