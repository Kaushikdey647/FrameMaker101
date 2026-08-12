"use client";

import { useEffect, useState } from "react";
import { blobToFrameFile, composeFrame } from "@/lib/compose";
import { blobToPassFile, composeBuilderId } from "@/lib/compose-id";
import { decodePhoto } from "@/lib/decode";
import { downloadBlob, isInAppWebView } from "@/lib/download";
import { canShareFiles, shareNative, shareToX } from "@/lib/share";
import { mintSerial } from "@/lib/serial";
import { pickFrameThemes, pickIdThemes } from "@/lib/style-kit";
import type { IndiaAirport } from "@/lib/india-airports";
import { LandingScreen, type FormatMode } from "./LandingScreen";
import { ShareScreen } from "./ShareScreen";
import { StylePicker } from "./StylePicker";

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

type StyleVariant = {
  id: string;
  name: string;
  blob: Blob;
  file: File;
  previewUrl: string;
  title?: string;
};

type Phase = "landing" | "picking" | "share";

function revokeVariants(variants: StyleVariant[]) {
  for (const v of variants) URL.revokeObjectURL(v.previewUrl);
}

export function FrameStudio() {
  const [mode, setMode] = useState<FormatMode>("frame");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [origin, setOrigin] = useState<IndiaAirport | null>(null);
  const [phase, setPhase] = useState<Phase>("landing");
  const [variants, setVariants] = useState<StyleVariant[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [ready, setReady] = useState<Ready | null>(null);
  const [passMeta, setPassMeta] = useState<{
    serial: string;
    name: string;
    role: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [converting, setConverting] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [webViewSave, setWebViewSave] = useState(false);

  useEffect(() => {
    setWebViewSave(isInAppWebView());
  }, []);

  useEffect(() => {
    return () => {
      revokeVariants(variants);
      if (ready?.previewUrl && !variants.some((v) => v.previewUrl === ready.previewUrl)) {
        URL.revokeObjectURL(ready.previewUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cleanup on unmount only
  }, []);

  async function handleFile(file: File) {
    setError(null);
    setHint(null);
    setBusy(true);
    setConverting(false);
    let bitmap: ImageBitmap | null = null;
    try {
      bitmap = await decodePhoto(file, () => setConverting(true));
      setConverting(false);

      if (mode === "frame") {
        const themes = pickFrameThemes(5);
        const composed = await Promise.all(
          themes.map(async (theme) => {
            const blob = await composeFrame(bitmap!, theme);
            return {
              id: theme.id,
              name: theme.name,
              blob,
              file: blobToFrameFile(blob),
              previewUrl: URL.createObjectURL(blob),
            } satisfies StyleVariant;
          }),
        );
        setVariants((prev) => {
          revokeVariants(prev);
          return composed;
        });
        setSelectedIndex(0);
        setPassMeta(null);
        setReady(null);
        setPhase("picking");
        return;
      }

      if (mode === "pass") {
        if (!origin) throw new Error("Pick the airport you’re flying from");
        const serial = mintSerial();
        const trimmedName = name.trim();
        const trimmedRole = role.trim();
        const themes = pickIdThemes(5);
        const composed = await Promise.all(
          themes.map(async (theme) => {
            const { blob, title } = await composeBuilderId({
              photo: bitmap!,
              name: trimmedName,
              role: trimmedRole,
              serial,
              origin,
              theme,
            });
            return {
              id: theme.id,
              name: theme.name,
              blob,
              file: blobToPassFile(blob, serial),
              previewUrl: URL.createObjectURL(blob),
              title,
            } satisfies StyleVariant;
          }),
        );
        setVariants((prev) => {
          revokeVariants(prev);
          return composed;
        });
        setSelectedIndex(0);
        setPassMeta({ serial, name: trimmedName, role: trimmedRole });
        setReady(null);
        setPhase("picking");
        return;
      }

      const _exhaustive: never = mode;
      void _exhaustive;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create that image");
      setPhase("landing");
    } finally {
      bitmap?.close();
      setBusy(false);
      setConverting(false);
    }
  }

  function onRetake() {
    setVariants((prev) => {
      revokeVariants(prev);
      return [];
    });
    setReady(null);
    setPassMeta(null);
    setSelectedIndex(0);
    setPhase("landing");
    setError(null);
    setHint(null);
    setSharing(false);
  }

  function onConfirmStyle() {
    const v = variants[selectedIndex];
    if (!v) return;
    // Keep all variant URLs alive until retake; share uses selected blob/file.
    setReady({
      blob: v.blob,
      file: v.file,
      previewUrl: v.previewUrl,
      format: mode,
      serial: passMeta?.serial,
      title: v.title,
      name: passMeta?.name,
      role: passMeta?.role,
    });
    setPhase("share");
    setHint(null);
    setError(null);
  }

  function passFilename(readyState: Ready): string {
    return readyState.format === "pass" && readyState.serial
      ? `${readyState.serial}.jpg`
      : "hh-goa-2026.jpg";
  }

  function onDownload() {
    if (!ready || webViewSave) return;
    downloadBlob(ready.blob, passFilename(ready));
  }

  async function onShareNative() {
    if (!ready) return;
    setError(null);
    setHint(null);
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
    setHint(null);
    try {
      const result = await shareToX(ready.file, {
        format: ready.format,
        serial: ready.serial,
      });

      switch (result) {
        case "cancelled":
          break;
        case "shared":
          setHint("Tap X in the list to post with your photo");
          break;
        case "intent-clipboard":
          setHint("X opened — paste your photo (Ctrl+V / ⌘V) to attach it");
          break;
        case "intent":
          if (webViewSave) {
            setHint("Long-press the photo to save, then attach it in X");
          } else {
            downloadBlob(ready.blob, passFilename(ready));
            setHint("Photo saved — open the X tab and attach it");
          }
          break;
        default: {
          const _exhaustive: never = result;
          void _exhaustive;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Share to X failed");
    } finally {
      setSharing(false);
    }
  }

  return (
    <>
      {phase === "share" && ready ? (
        <ShareScreen
          previewUrl={ready.previewUrl}
          format={ready.format}
          serial={ready.serial}
          canNativeShare={canShareFiles(ready.file)}
          webViewSave={webViewSave}
          sharing={sharing}
          error={error}
          hint={hint}
          onDownload={onDownload}
          onShareNative={() => void onShareNative()}
          onShareX={() => void onShareX()}
          onRetake={onRetake}
        />
      ) : phase === "picking" && variants.length > 0 ? (
        <StylePicker
          format={mode}
          variants={variants}
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
          onConfirm={onConfirmStyle}
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
          onPhotoFile={(file) => void handleFile(file)}
        />
      )}
    </>
  );
}
