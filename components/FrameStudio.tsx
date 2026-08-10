"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { blobToFrameFile, composeFrame } from "@/lib/compose";
import { decodePhoto } from "@/lib/decode";
import { downloadBlob, isInAppWebView } from "@/lib/download";
import { shareFramedPhoto } from "@/lib/share";
import { ControlTray } from "./ControlTray";

type Ready = {
  blob: Blob;
  file: File;
  previewUrl: string;
};

export function FrameStudio() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [ready, setReady] = useState<Ready | null>(null);
  const [busy, setBusy] = useState(false);
  const [converting, setConverting] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [webViewSave] = useState(() =>
    typeof navigator === "undefined" ? false : isInAppWebView(),
  );

  useEffect(() => {
    return () => {
      if (ready?.previewUrl) URL.revokeObjectURL(ready.previewUrl);
    };
  }, [ready]);

  async function handleFile(file: File) {
    setError(null);
    setBusy(true);
    setConverting(false);
    let bitmap: ImageBitmap | null = null;
    try {
      bitmap = await decodePhoto(file, () => setConverting(true));
      setConverting(false);
      const blob = await composeFrame(bitmap);
      const previewUrl = URL.createObjectURL(blob);
      setReady((prev) => {
        if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
        return { blob, file: blobToFrameFile(blob), previewUrl };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not frame that photo");
    } finally {
      bitmap?.close();
      setBusy(false);
      setConverting(false);
    }
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) void handleFile(file);
  }

  function onDownload() {
    if (!ready || webViewSave) return;
    downloadBlob(ready.blob);
  }

  async function onShare() {
    if (!ready) return;
    setSharing(true);
    setError(null);
    try {
      await shareFramedPhoto(ready.file, ready.blob);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Share failed");
    } finally {
      setSharing(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-2">
        <p className="font-[family-name:var(--font-display)] text-3xl leading-none tracking-tight text-[var(--ink)] sm:text-4xl">
          HH Goa 2026
        </p>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--muted)]">
          Drop a photo. Get a framed PFP. Share it with #FrameInGoa.
        </p>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-5 py-4">
        <div className="relative aspect-square w-full max-w-[min(100%,600px)] overflow-hidden rounded-2xl bg-[var(--frame-well)] shadow-[0_20px_50px_-28px_rgba(8,40,44,0.55)] ring-1 ring-[var(--line)]">
          {ready ? (
            // eslint-disable-next-line @next/next/no-img-element -- object URL preview
            <img
              src={ready.previewUrl}
              alt="Your HH Goa 2026 framed photo"
              className="h-full w-full object-contain"
              draggable={false}
            />
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="flex h-full w-full flex-col items-center justify-center gap-3 px-8 text-center"
            >
              <span className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
                Your frame awaits
              </span>
              <span className="text-sm text-[var(--muted)]">
                JPG, PNG, or HEIC · processed on your device
              </span>
            </button>
          )}
        </div>
        {error ? (
          <p className="mt-3 max-w-md text-center text-sm text-[var(--danger)]" role="alert">
            {error}
          </p>
        ) : null}
      </main>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,.heic,.heif,image/heic,image/heif"
        className="sr-only"
        onChange={onInputChange}
      />

      <ControlTray
        onPickPhoto={() => inputRef.current?.click()}
        onDownload={onDownload}
        onShare={() => void onShare()}
        hasResult={Boolean(ready)}
        busy={busy}
        converting={converting}
        sharing={sharing}
        webViewSave={webViewSave}
      />
    </div>
  );
}
