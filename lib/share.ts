import { upload } from "@vercel/blob/client";

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

export function buildShareCaption(appUrl: string = getAppUrl()): string {
  return `Just framed myself for HH Goa 2026! #FrameInGoa\n\nMake yours: ${appUrl}`;
}

export type ShareResult =
  | { mode: "native" }
  | { mode: "intent" }
  | { mode: "cancelled" };

/**
 * Gesture-safe share: ready File must already exist (no encode in this call).
 * Native share runs first; fallback opens a blank window sync then uploads.
 */
export async function shareFramedPhoto(
  readyFile: File,
  readyBlob: Blob,
): Promise<ShareResult> {
  const appUrl = getAppUrl();
  const caption = buildShareCaption(appUrl);

  if (
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    navigator.canShare?.({ files: [readyFile] })
  ) {
    try {
      await navigator.share({ files: [readyFile], text: caption });
      return { mode: "native" };
    } catch (err) {
      // User cancel → stop. Other failures fall through to intent.
      if (err instanceof DOMException && err.name === "AbortError") {
        return { mode: "cancelled" };
      }
    }
  }

  // Open synchronously so iOS Safari does not popup-block after await.
  const win = window.open("about:blank", "_blank");

  try {
    const { url: blobUrl } = await upload("frames/hh-goa-2026.jpg", readyBlob, {
      access: "public",
      handleUploadUrl: "/api/blob-upload",
      contentType: "image/jpeg",
    });

    const sharePage = `${appUrl}/share?img=${encodeURIComponent(blobUrl)}`;
    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}&url=${encodeURIComponent(sharePage)}`;

    if (win && !win.closed) {
      win.location.href = intent;
    } else {
      window.location.href = intent;
    }
    return { mode: "intent" };
  } catch (err) {
    if (win && !win.closed) win.close();
    throw err;
  }
}
