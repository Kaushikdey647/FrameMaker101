"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { blobToFrameFile, composeFrame } from "@/lib/compose";
import { blobToPassFile, composeBuilderId } from "@/lib/compose-id";
import { decodePhoto } from "@/lib/decode";
import { downloadBlob, isInAppWebView } from "@/lib/download";
import { canShareFiles, shareNative, shareToX } from "@/lib/share";
import { mintSerial } from "@/lib/serial";
import type { IndiaAirport } from "@/lib/india-airports";
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
};

export function FrameStudio() {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<FormatMode>("frame");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [origin, setOrigin] = useState<IndiaAirport | null>(null);
  const [ready, setReady] = useState<Ready | null>(null);
  const [busy, setBusy] = useState(false);
  const [converting, setConverting] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [webViewSave, setWebViewSave] = useState(false);

  useEffect(() => {
    setWebViewSave(isInAppWebView());
  }, []);

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

      if (mode === "pass") {
        if (!origin) throw new Error("Pick the airport you’re flying from");
        const serial = mintSerial();
        const { blob, title } = await composeBuilderId({
          photo: bitmap,
          name: name.trim(),
          role: role.trim(),
          serial,
          origin,
        });

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
          };
        });
        return;
      }

      // unreachable — modes are frame | pass
      const _exhaustive: never = mode;
      void _exhaustive;
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
      const result = await shareToX(ready.file, {
        format: ready.format,
        serial: ready.serial,
      });
      if (result === "intent" && !webViewSave) {
        downloadBlob(
          ready.blob,
          ready.format === "pass" && ready.serial
            ? `${ready.serial}.jpg`
            : "hh-goa-2026.jpg",
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Share to X failed");
    } finally {
      setSharing(false);
    }
  }

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
          canNativeShare={canShareFiles(ready.file)}
          webViewSave={webViewSave}
          sharing={sharing}
          error={error}
          onDownload={onDownload}
          onShareNative={() => void onShareNative()}
          onShareX={() => void onShareX()}
          onRetake={onRetake}
        />
      ) : (
        <LandingScreen
          mode={mode}
          onModeChange={setMode}
          name={name}
          role={role}
          origin={origin}
          onNameChange={setName}
          onRoleChange={setRole}
          onOriginChange={setOrigin}
          busy={busy}
          converting={converting}
          error={error}
          onCamera={() => cameraRef.current?.click()}
          onGallery={() => galleryRef.current?.click()}
        />
      )}
    </>
  );
}
