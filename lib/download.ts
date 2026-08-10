export function isInAppWebView(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return (
    /\bFBAN\b|\bFBAV\b/i.test(ua) ||
    /\bInstagram\b/i.test(ua) ||
    /\bLine\//i.test(ua) ||
    /\bWhatsApp\b/i.test(ua) ||
    /\bTelegram/i.test(ua) ||
    // X / Twitter in-app
    /\bTwitter\b/i.test(ua) ||
    /\bX\/\d/i.test(ua)
  );
}

/** Force-download a ready blob. Caller should skip this in in-app WebViews. */
export function downloadBlob(blob: Blob, filename = "hh-goa-2026.jpg"): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke after the click has a chance to start the download.
  window.setTimeout(() => URL.revokeObjectURL(url), 2_000);
}
