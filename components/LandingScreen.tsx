"use client";

import { useEffect, useRef, type ChangeEvent } from "react";
import { AirportPicker } from "./AirportPicker";
import type { IndiaAirport } from "@/lib/india-airports";

export type FormatMode = "frame" | "pass";

type LandingScreenProps = {
  mode: FormatMode;
  onModeChange: (mode: FormatMode) => void;
  name: string;
  role: string;
  origin: IndiaAirport | null;
  onNameChange: (v: string) => void;
  onRoleChange: (v: string) => void;
  onOriginChange: (v: IndiaAirport | null) => void;
  busy: boolean;
  converting: boolean;
  error: string | null;
  onPhotoFile: (file: File) => void;
};

export function LandingScreen({
  mode,
  onModeChange,
  name,
  role,
  origin,
  onNameChange,
  onRoleChange,
  onOriginChange,
  busy,
  converting,
  error,
  onPhotoFile,
}: LandingScreenProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const changeHandledRef = useRef(false);
  const onPhotoFileRef = useRef(onPhotoFile);
  onPhotoFileRef.current = onPhotoFile;

  const status = converting
    ? "Converting…"
    : busy
      ? "Cooking 5 looks…"
      : null;

  const passReady =
    name.trim().length >= 2 && role.trim().length >= 1 && origin !== null;
  const pickDisabled = busy || (mode === "pass" && !passReady);

  function takeFile(input: HTMLInputElement) {
    const file = input.files?.[0];
    // Allow re-picking the same file on next open (iOS keeps last path).
    input.value = "";
    if (file) onPhotoFileRef.current(file);
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    changeHandledRef.current = true;
    takeFile(e.target);
  }

  // Chrome iOS: after Capture, focus returns but `change` sometimes never fires.
  useEffect(() => {
    function flushIfNeeded() {
      if (document.visibilityState && document.visibilityState !== "visible") return;
      window.setTimeout(() => {
        if (changeHandledRef.current) {
          changeHandledRef.current = false;
          return;
        }
        for (const input of [cameraInputRef.current, galleryInputRef.current]) {
          if (input?.files?.length) {
            takeFile(input);
            break;
          }
        }
      }, 400);
    }
    window.addEventListener("focus", flushIfNeeded);
    document.addEventListener("visibilitychange", flushIfNeeded);
    return () => {
      window.removeEventListener("focus", flushIfNeeded);
      document.removeEventListener("visibilitychange", flushIfNeeded);
    };
  }, []);

  return (
    <div className="relative flex min-h-dvh flex-col">
      <header className="land-in relative z-10 flex flex-1 flex-col items-center overflow-y-auto px-4 pb-4 pt-[max(1.5rem,env(safe-area-inset-top))] text-center sm:px-5 sm:pb-6 sm:pt-[max(2.5rem,env(safe-area-inset-top))]">
        <p className="border-2 border-[var(--yellow)] bg-[var(--green-deep)] px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.28em] text-[var(--yellow)]">
          Frame In Goa
        </p>

        <div className="relative mt-4 w-full max-w-[min(17.5rem,82vw)] sm:mt-6 sm:max-w-[18.5rem]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/title-transparent.svg"
            alt="Hacker House Goa"
            className="mx-auto h-auto w-full"
            width={291}
            height={255}
            draggable={false}
          />
        </div>

        <p className="mt-4 text-sm font-bold tracking-[0.2em] text-[var(--yellow)]">
          #FrameInGoa
        </p>
        <p className="mt-3 max-w-[18rem] text-sm leading-relaxed text-[var(--muted-on-green)]">
          Profile frame or Builder ID — snap, brand, share.
        </p>

        <div className="mecha-panel mt-7 flex w-full max-w-sm bg-[var(--green-deep)] p-1">
          <ModeChip
            active={mode === "frame"}
            onClick={() => onModeChange("frame")}
            label="Profile frame"
          />
          <ModeChip
            active={mode === "pass"}
            onClick={() => onModeChange("pass")}
            label="Builder ID"
          />
        </div>

        {mode === "pass" ? (
          <div className="mt-5 flex w-full max-w-sm flex-col gap-3 text-left">
            <label className="block">
              <span className="mb-1.5 block text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--yellow)]">
                Full name
              </span>
              <input
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                maxLength={48}
                placeholder="e.g. Satoshi"
                disabled={busy}
                className="mecha-input"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--yellow)]">
                Stack / role
              </span>
              <input
                value={role}
                onChange={(e) => onRoleChange(e.target.value)}
                maxLength={48}
                placeholder="e.g. Full-stack / AI"
                disabled={busy}
                className="mecha-input"
              />
            </label>
            <AirportPicker value={origin} onChange={onOriginChange} disabled={busy} />
          </div>
        ) : null}

        <div className="mt-6 flex w-full max-w-sm flex-col gap-3">
          {/*
            iOS Chrome/Safari: programmatic input.click() on clipped/hidden
            file inputs often no-ops. Overlay a real file input so the tap
            hits the control directly.
          */}
          <label
            className={`mecha-btn relative overflow-hidden bg-[var(--magenta)] text-white ${
              pickDisabled ? "pointer-events-none opacity-45" : ""
            }`}
            aria-disabled={pickDisabled}
          >
            Take a photo
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              disabled={pickDisabled}
              className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              onChange={onFileChange}
            />
          </label>
          <label
            className={`mecha-btn relative overflow-hidden bg-[var(--yellow)] text-[var(--black)] ${
              pickDisabled ? "pointer-events-none opacity-45" : ""
            }`}
            aria-disabled={pickDisabled}
          >
            Choose from gallery
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*,.heic,.heif,image/heic,image/heif"
              disabled={pickDisabled}
              className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              onChange={onFileChange}
            />
          </label>
        </div>

        {status ? (
          <p className="mt-5 border-2 border-[var(--yellow)] px-3 py-1 text-sm font-bold text-[var(--yellow)]" aria-live="polite">
            {status}
          </p>
        ) : null}
        {error ? (
          <p className="mt-4 max-w-sm text-sm text-[var(--danger)]" role="alert">
            {error}
          </p>
        ) : null}
      </header>

      <footer className="relative z-10 flex flex-col items-center pb-[max(1rem,env(safe-area-inset-bottom))]">
        <MechaPosterMark />
        <p className="mt-2 text-center text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-on-green)]">
          Stays on your device until you share
        </p>
      </footer>
    </div>
  );
}

function ModeChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-2.5 text-sm font-bold transition ${
        active
          ? "bg-[var(--yellow)] text-[var(--black)]"
          : "text-[var(--muted-on-green)]"
      }`}
    >
      {label}
    </button>
  );
}

/** Angular sun + palm silhouettes — static paths for hydration safety. */
function MechaPosterMark() {
  return (
    <svg
      width="240"
      height="88"
      viewBox="0 0 240 88"
      fill="none"
      aria-hidden
    >
      {/* Halftone band */}
      {Array.from({ length: 18 }).map((_, i) => (
        <circle
          key={i}
          cx={20 + i * 12}
          cy={78}
          r={i % 2 === 0 ? 2.2 : 1.4}
          fill="#F5C518"
          opacity={0.55}
        />
      ))}
      {/* Angular sun */}
      <polygon
        points="120,18 126,34 144,34 130,44 136,60 120,50 104,60 110,44 96,34 114,34"
        fill="#F5C518"
        stroke="#083821"
        strokeWidth="3"
        strokeLinejoin="miter"
      />
      {/* Left palm — angular */}
      <path
        d="M42 78 L38 42 L28 18 M38 42 L18 28 M38 42 L22 48 M38 42 L48 22 M38 42 L56 36"
        stroke="#F7F1E6"
        strokeWidth="4"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      {/* Right palm */}
      <path
        d="M198 78 L202 42 L212 18 M202 42 L222 28 M202 42 L218 48 M202 42 L192 22 M202 42 L184 36"
        stroke="#F7F1E6"
        strokeWidth="4"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <rect x="70" y="70" width="100" height="6" fill="#FF2D8A" />
    </svg>
  );
}
