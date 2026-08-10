import { uploadPresigned } from "@vercel/blob/client";
import { passJpgPath } from "@/lib/pass";

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
    return `My HH Goa 2026 Builder ID ${opts.serial} #FrameInGoa\n\nFind it anytime: ${appUrl}/id/${opts.serial}\nMake yours: ${appUrl}`;
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

export async function shareToX(
  readyBlob: Blob,
  opts?: { serial?: string; format?: "frame" | "pass"; existingImageUrl?: string },
): Promise<"intent"> {
  const appUrl = getAppUrl();
  const caption = buildShareCaption({
    appUrl,
    serial: opts?.serial,
    format: opts?.format,
  });
  const win = window.open("about:blank", "_blank");

  try {
    let sharePage: string;
    if (opts?.format === "pass" && opts.serial) {
      // Pass already stored — point X unfurl at lookup page
      if (!opts.existingImageUrl) {
        // Still upload if needed? Prefer lookup URL directly.
      }
      sharePage = `${appUrl}/id/${opts.serial}`;
    } else {
      let blobUrl: string;
      try {
        const uploaded = await uploadPresigned(
          "frames/hh-goa-2026.jpg",
          readyBlob,
          {
            access: "public",
            handleUploadUrl: "/api/blob-upload",
            contentType: "image/jpeg",
          },
        );
        blobUrl = uploaded.url;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        if (/client token|presigned|BLOB_|503|OIDC/i.test(msg)) {
          throw new Error(
            "Share to X needs Blob OIDC env (BLOB_STORE_ID, VERCEL_OIDC_TOKEN, BLOB_WEBHOOK_PUBLIC_KEY). Run npx vercel env pull, then restart the dev server.",
          );
        }
        throw err;
      }
      sharePage = `${appUrl}/share?img=${encodeURIComponent(blobUrl)}`;
    }

    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}&url=${encodeURIComponent(sharePage)}`;

    if (win && !win.closed) {
      win.location.href = intent;
    } else {
      window.location.href = intent;
    }
    return "intent";
  } catch (err) {
    if (win && !win.closed) win.close();
    throw err;
  }
}

export async function uploadPassJpeg(serial: string, blob: Blob): Promise<string> {
  const { url } = await uploadPresigned(passJpgPath(serial), blob, {
    access: "public",
    handleUploadUrl: "/api/blob-upload",
    contentType: "image/jpeg",
  });
  return url;
}
