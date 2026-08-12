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

  const status = converting ? "Converting…" : busy ? "Cooking 5 looks…" : null;
  const passReady = name.trim().length >= 2 && role.trim().length >= 1 && origin !== null;
  const pickDisabled = busy || (mode === "pass" && !passReady);

  function takeFile(input: HTMLInputElement) {
    const file = input.files?.[0];
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
    // Two-column in landscape (mobile + desktop) via flex-row
    <div className="relative flex min-h-dvh flex-col overflow-y-auto landscape:flex-row landscape:overflow-visible">

      {/* ── BRANDING column (left in landscape / top in portrait) ─────────── */}
      <section className="land-in relative z-10 flex flex-col items-center px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-2 text-center sm:px-5 landscape:sticky landscape:top-0 landscape:h-dvh landscape:w-1/2 landscape:justify-center landscape:border-r landscape:border-[rgba(247,241,230,0.08)] landscape:pb-[max(1rem,env(safe-area-inset-bottom))] landscape:pt-[max(1rem,env(safe-area-inset-top))] md:pt-[max(2rem,env(safe-area-inset-top))]">

        <p className="border-2 border-[var(--yellow)] bg-[var(--green-deep)] px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.28em] text-[var(--yellow)]">
          Frame In Goa
        </p>

        {/* Logo — always visible in 2-col layout; size adapts to column width */}
        <div className="relative mt-4 w-full max-w-[min(17.5rem,82vw)] sm:mt-6 sm:max-w-[18.5rem] landscape:mt-3 landscape:max-w-[min(13rem,42vw)] md:max-w-[26rem]">
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

        <p className="mt-4 landscape:mt-2 text-sm font-bold tracking-[0.2em] text-[var(--yellow)]">
          #FrameInGoa
        </p>
        {/* Subtitle: hide on tight mobile landscape; always show on desktop */}
        <p className="mt-3 max-w-[18rem] text-sm leading-relaxed text-[var(--muted-on-green)] [@media(orientation:landscape)_and_(max-height:600px)]:hidden">
          Profile frame or Builder ID — snap, brand, share.
        </p>

        {/* Poster mark at bottom of branding column — desktop only (mobile landscape too tight) */}
        <div className="hidden md:flex flex-col items-center mt-auto pt-10">
          <MechaPosterMark />
          <p className="mt-2 text-center text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-on-green)]">
            Stays on your device until you share
          </p>
        </div>
      </section>

      {/* ── CONTROLS column (right in landscape / below branding in portrait) */}
      <section className="relative z-10 flex flex-col items-center px-4 pb-4 pt-2 sm:px-5 landscape:w-1/2 landscape:min-h-dvh landscape:justify-center landscape:overflow-y-auto landscape:py-[max(1rem,env(safe-area-inset-top))] landscape:pb-[max(1rem,env(safe-area-inset-bottom))] md:py-12">

        <div className="mecha-panel flex w-full max-w-sm bg-[var(--green-deep)] p-1">
          <ModeChip active={mode === "frame"} onClick={() => onModeChange("frame")} label="Profile frame" />
          <ModeChip active={mode === "pass"} onClick={() => onModeChange("pass")} label="Builder ID" />
        </div>

        {mode === "pass" ? (
          <div className="mt-5 landscape:mt-3 flex w-full max-w-sm flex-col gap-3 text-left">
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

        <div className="mt-6 landscape:mt-3 flex w-full max-w-sm flex-col gap-3">
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
      </section>

      {/* Poster mark footer — portrait only (2-col shows it inside branding column) */}
      <footer className="relative z-10 flex flex-col items-center pb-[max(1rem,env(safe-area-inset-bottom))] landscape:hidden">
        <MechaPosterMark />
        <p className="mt-2 text-center text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-on-green)]">
          Stays on your device until you share
        </p>
      </footer>
    </div>
  );
}

function ModeChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-2.5 text-sm font-bold transition ${
        active ? "bg-[var(--yellow)] text-[var(--black)]" : "text-[var(--muted-on-green)]"
      }`}
    >
      {label}
    </button>
  );
}

function MechaPosterMark() {
  return (
    <svg width="240" height="88" viewBox="0 0 240 88" fill="none" aria-hidden>
      <path d="M94 66 A26 26 0 0 1 146 66 Z" fill="var(--yellow)" />
      <rect x="92" y="53" width="56" height="3" fill="var(--green)" />
      <rect x="92" y="58.5" width="56" height="3.5" fill="var(--green)" />
      <rect x="92" y="63.5" width="56" height="3" fill="var(--green)" />
      <path d="M88 24 q5 -4 10 0 M142 18 q5 -4 10 0" stroke="var(--cream)" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <PosterPalm />
      <g transform="translate(240,0) scale(-1,1)"><PosterPalm /></g>
      <rect x="16" y="66" width="208" height="4" fill="var(--magenta)" />
      <path d="M74 77 q9 -4 18 0 t18 0 t18 0 t18 0 M84 83 q9 -4 18 0 t18 0 t18 0" stroke="var(--cream)" strokeWidth="2" strokeLinecap="round" opacity="0.45" />
    </svg>
  );
}

function PosterPalm() {
  return (
    <g fill="var(--cream)">
      <path d="M40 66 Q44 50 51 30 L56 31 Q47 50 45 66 Z" />
      <path d="M54 30 Q40 18 24 20 Q40 24 54 34 Z" />
      <path d="M54 30 Q42 27 29 36 Q42 31 54 35 Z" />
      <path d="M54 30 Q51 16 60 6 Q57 19 57 31 Z" />
      <path d="M54 30 Q68 18 83 22 Q68 24 55 34 Z" />
      <path d="M54 30 Q69 29 80 39 Q66 33 54 35 Z" />
      <circle cx="51" cy="34" r="2" />
      <circle cx="58" cy="34.5" r="2" />
    </g>
  );
}
