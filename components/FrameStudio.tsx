"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { blobToFrameFile, composeFrame } from "@/lib/compose";
import { blobToPassFile, composeBuilderId } from "@/lib/compose-id";
import { decodePhoto } from "@/lib/decode";
import { downloadBlob, isInAppWebView } from "@/lib/download";
import { getAppUrl, canShareFiles, shareNative, shareToX, uploadPassJpeg } from "@/lib/share";
import { normalizeSerial } from "@/lib/serial";
import { LandingScreen, type FormatMode } from "./LandingScreen";
import { ShareScreen } from "./ShareScreen";

type Ready = {
  blob: Blob;
  file: File;
  previewUrl: string;
  format: FormatMode;
  serial?: string;
  title?: string;
  name?: string;
  role?: string;
  imageUrl?: string;
};

export function FrameStudio() {
  const router = useRouter();
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<FormatMode>("frame");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
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

      if (mode === "frame") {
        const blob = await composeFrame(bitmap);
        const previewUrl = URL.createObjectURL(blob);
        setReady((prev) => {
          if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
          return {
            blob,
            file: blobToFrameFile(blob),
            previewUrl,
            format: "frame",
          };
        });
        return;
      }

      const createRes = await fetch("/api/pass/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), role: role.trim() }),
      });
      const createJson = (await createRes.json()) as {
        serial?: string;
        title?: string;
        error?: string;
      };
      if (!createRes.ok || !createJson.serial || !createJson.title) {
        throw new Error(createJson.error || "Could not reserve Builder ID");
      }

      const { serial, title } = createJson;
      const { blob } = await composeBuilderId({
        photo: bitmap,
        name: name.trim(),
        role: role.trim(),
        serial,
      });

      const imageUrl = await uploadPassJpeg(serial, blob);
      const finalizeRes = await fetch("/api/pass/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serial,
          name: name.trim(),
          role: role.trim(),
          title,
          imageUrl,
          createdAt: new Date().toISOString(),
        }),
      });
      if (!finalizeRes.ok) {
        const fj = (await finalizeRes.json()) as { error?: string };
        throw new Error(fj.error || "Could not save Builder ID");
      }

      const previewUrl = URL.createObjectURL(blob);
      setReady((prev) => {
        if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
        return {
          blob,
          file: blobToPassFile(blob, serial),
          previewUrl,
          format: "pass",
          serial,
          title,
          name: name.trim(),
          role: role.trim(),
          imageUrl,
        };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create that image");
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

  function onRetake() {
    setReady((prev) => {
      if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return null;
    });
    setError(null);
    setSharing(false);
  }

  function onDownload() {
    if (!ready || webViewSave) return;
    downloadBlob(
      ready.blob,
      ready.format === "pass" && ready.serial
        ? `${ready.serial}.jpg`
        : "hh-goa-2026.jpg",
    );
  }

  async function onShareNative() {
    if (!ready) return;
    setError(null);
    try {
      await shareNative(ready.file, {
        format: ready.format,
        serial: ready.serial,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Share failed");
    }
  }

  async function onShareX() {
    if (!ready) return;
    setSharing(true);
    setError(null);
    try {
      await shareToX(ready.blob, {
        format: ready.format,
        serial: ready.serial,
        existingImageUrl: ready.imageUrl,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Share to X failed");
    } finally {
      setSharing(false);
    }
  }

  async function onCopyLink() {
    if (!ready?.serial) return;
    const url = `${getAppUrl()}/id/${ready.serial}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      setError("Could not copy link");
    }
  }

  function onLookup(serial: string) {
    router.push(`/id/${normalizeSerial(serial)}`);
  }

  const lookupUrl =
    ready?.format === "pass" && ready.serial
      ? `${getAppUrl()}/id/${ready.serial}`
      : undefined;

  return (
    <>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={onInputChange}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*,.heic,.heif,image/heic,image/heif"
        className="sr-only"
        onChange={onInputChange}
      />

      {ready ? (
        <ShareScreen
          previewUrl={ready.previewUrl}
          format={ready.format}
          serial={ready.serial}
          lookupUrl={lookupUrl}
          canNativeShare={canShareFiles(ready.file)}
          webViewSave={webViewSave}
          sharing={sharing}
          error={error}
          onDownload={onDownload}
          onShareNative={() => void onShareNative()}
          onShareX={() => void onShareX()}
          onRetake={onRetake}
          onCopyLink={() => void onCopyLink()}
        />
      ) : (
        <LandingScreen
          mode={mode}
          onModeChange={setMode}
          name={name}
          role={role}
          onNameChange={setName}
          onRoleChange={setRole}
          busy={busy}
          converting={converting}
          error={error}
          onCamera={() => cameraRef.current?.click()}
          onGallery={() => galleryRef.current?.click()}
          onLookup={onLookup}
        />
      )}
    </>
  );
}
