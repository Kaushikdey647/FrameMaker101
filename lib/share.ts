async function blobToPng(source: Blob): Promise<Blob> {
  const bmp = await createImageBitmap(source);
  const canvas = Object.assign(document.createElement("canvas"), {
    width: bmp.width,
    height: bmp.height,
  });
  canvas.getContext("2d")!.drawImage(bmp, 0, 0);
  bmp.close();
  return new Promise<Blob>((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error("png conversion failed"))), "image/png"),
  );
}

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

export type ShareToXResult = "shared" | "cancelled" | "intent" | "intent-clipboard";

/**
 * Mobile-first X: native Web Share attaches the JPEG when user picks X.
 * Desktop/fallback: opens X compose (text pre-filled) + copies PNG to clipboard so
 * the user can Ctrl+V / ⌘V to attach the image in the X compose window.
 */
export async function shareToX(
  readyFile: File,
  opts?: { serial?: string; format?: "frame" | "pass" },
): Promise<ShareToXResult> {
  const caption = buildShareCaption(opts);

  // 1. Best path: OS share sheet with image attached (mobile)
  if (canShareFiles(readyFile)) {
    try {
      await navigator.share({ files: [readyFile], text: caption, title: "HH Goa 2026" });
      return "shared";
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return "cancelled";
    }
  }

  // 2. Desktop/fallback: start clipboard write synchronously (preserves user-gesture
  //    permission for clipboard API), then open X intent window (also synchronous).
  const intent = `https://x.com/intent/post?text=${encodeURIComponent(caption)}`;

  let clipboardPromise: Promise<boolean> | null = null;
  if (
    typeof navigator !== "undefined" &&
    navigator.clipboard?.write &&
    typeof ClipboardItem !== "undefined"
  ) {
    try {
      // Pass Promise<Blob> directly — browser holds permission granted here, resolves blob async.
      clipboardPromise = navigator.clipboard
        .write([new ClipboardItem({ "image/png": blobToPng(readyFile) })])
        .then(() => true)
        .catch(() => false);
    } catch {
      // ClipboardItem not supported in this browser
    }
  }

  window.open(intent, "_blank", "noopener,noreferrer");

  if (clipboardPromise) {
    const copied = await clipboardPromise;
    if (copied) return "intent-clipboard";
  }

  return "intent";
}
