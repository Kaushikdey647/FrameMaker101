"use client";

import type { ReactNode } from "react";
import type { FormatMode } from "./LandingScreen";

type ShareScreenProps = {
  previewUrl: string;
  format: FormatMode;
  serial?: string;
  canNativeShare: boolean;
  webViewSave: boolean;
  sharing: boolean;
  error: string | null;
  hint: string | null;
  onDownload: () => void;
  onShareNative: () => void;
  onShareX: () => void;
  onRetake: () => void;
};

export function ShareScreen({
  previewUrl,
  format,
  serial,
  canNativeShare,
  webViewSave,
  sharing,
  error,
  hint,
  onDownload,
  onShareNative,
  onShareX,
  onRetake,
}: ShareScreenProps) {
  return (
    <div className="flex min-h-dvh flex-col text-[var(--cream)]">
      <header className="flex shrink-0 items-center justify-between gap-3 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 sm:px-5">
        <p className="mecha-title font-[family-name:var(--font-display)] text-base text-[var(--yellow)] sm:text-lg">
          HH GOA
        </p>
        <p className="border-2 border-[var(--magenta)] px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[var(--magenta)] sm:text-xs sm:tracking-[0.18em]">
          #FrameInGoa
        </p>
      </header>

      <main className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 overflow-y-auto px-3 py-2 sm:gap-3 sm:px-5 sm:py-3">
        <div
          className={`share-photo-enter mecha-panel relative w-full overflow-hidden bg-[var(--cream)] ${
            format === "pass"
              ? "max-w-[min(100%,min(420px,90dvw))]"
              : "max-w-[min(100%,min(420px,85dvw))]"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt={
              format === "pass"
                ? "Your HH Goa 2026 Builder ID"
                : "Your HH Goa 2026 framed photo"
            }
            className={`mx-auto w-full object-contain ${
              format === "pass"
                ? "aspect-[4/5] max-h-[min(52dvh,520px)]"
                : "aspect-square max-h-[min(48dvh,420px)]"
            }`}
            draggable={false}
          />
        </div>

        {format === "pass" && serial ? (
          <p className="border-2 border-[var(--yellow)] bg-[var(--green-deep)] px-2.5 py-1 font-mono text-xs font-bold tracking-wider text-[var(--yellow)] sm:px-3 sm:text-sm">
            {serial}
          </p>
        ) : null}

        {error ? (
          <p
            className="max-w-sm px-2 text-center text-sm text-[var(--danger)]"
            role="alert"
          >
            {error}
          </p>
        ) : sharing ? (
          <p className="text-sm font-bold text-[var(--yellow)]" aria-live="polite">
            Preparing share…
          </p>
        ) : (
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted-on-green)] sm:text-sm">
            Looks good — send it out
          </p>
        )}
      </main>

      <footer className="shrink-0 px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-1 sm:px-4 sm:pt-2">
        <div className="mecha-panel mx-auto w-full max-w-md bg-[var(--cream)] px-2 py-3 text-[var(--ink)] sm:px-3 sm:py-5">
          <p className="mb-3 text-center text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[var(--ink-soft)] sm:mb-4 sm:text-[0.68rem] sm:tracking-[0.22em]">
            Share // Control Panel
          </p>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <ShareAction
              label={webViewSave ? "Save" : "Download"}
              onClick={onDownload}
              disabled={sharing || webViewSave}
              title={webViewSave ? "Long-press the photo to save" : "Download JPEG"}
              tone="yellow"
            >
              <DownloadIcon />
            </ShareAction>
            <ShareAction
              label="Apps"
              onClick={onShareNative}
              disabled={sharing || !canNativeShare}
              title={
                canNativeShare
                  ? "Share via WhatsApp, Instagram, Files…"
                  : "System share isn’t available here (needs HTTPS)"
              }
              tone="magenta"
            >
              <AppsIcon />
            </ShareAction>
            <ShareAction
              label="X"
              onClick={onShareX}
              disabled={sharing}
              title={
                canNativeShare
                  ? "Opens share — pick X to attach the image"
                  : "Opens X; image is copied or downloaded to attach"
              }
              tone="green"
            >
              <XIcon />
            </ShareAction>
          </div>
          {hint && !error ? (
            <p
              className="mt-3 text-center text-xs font-semibold text-[var(--ink-soft)]"
              aria-live="polite"
            >
              {hint}
            </p>
          ) : webViewSave ? (
            <p className="mt-3 text-center text-xs text-[var(--ink-soft)]">
              Long-press the photo to save in this browser
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onRetake}
          disabled={sharing}
          className="mecha-panel mt-3 flex w-full max-w-md mx-auto items-center justify-center gap-2 bg-transparent py-2.5 text-sm font-bold uppercase tracking-[0.12em] text-[var(--yellow)] transition enabled:active:translate-x-0.5 enabled:active:translate-y-0.5 disabled:opacity-40 sm:mt-4 sm:py-3"
        >
          <RetakeIcon />
          Take again
        </button>
      </footer>
    </div>
  );
}

function ShareAction({
  label,
  children,
  onClick,
  disabled,
  title,
  tone,
}: {
  label: string;
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  tone: "yellow" | "magenta" | "green";
}) {
  const fill =
    tone === "yellow"
      ? "bg-[var(--yellow)] text-[var(--black)]"
      : tone === "magenta"
        ? "bg-[var(--magenta)] text-white"
        : "bg-[var(--green)] text-[var(--yellow)]";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="flex w-full flex-col items-center gap-2 disabled:opacity-35"
    >
      <span
        className={`flex aspect-square w-full max-w-[3.75rem] items-center justify-center border-[3px] border-[var(--black)] shadow-[4px_4px_0_0_#111] transition enabled:active:translate-x-0.5 enabled:active:translate-y-0.5 enabled:active:shadow-[2px_2px_0_0_#111] sm:max-w-[4rem] ${fill}`}
      >
        {children}
      </span>
      <span className="text-[0.65rem] font-bold uppercase tracking-wide text-[var(--ink-soft)] sm:text-[0.72rem]">
        {label}
      </span>
    </button>
  );
}

function DownloadIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 4v10m0 0 4-4m-4 4-4-4M5 18h14"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

function AppsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="3" width="6" height="6" fill="currentColor" />
      <rect x="9" y="3" width="6" height="6" fill="currentColor" />
      <rect x="15" y="3" width="6" height="6" fill="currentColor" />
      <rect x="3" y="9" width="6" height="6" fill="currentColor" />
      <rect x="9" y="9" width="6" height="6" fill="currentColor" />
      <rect x="15" y="9" width="6" height="6" fill="currentColor" />
      <rect x="3" y="15" width="6" height="6" fill="currentColor" />
      <rect x="9" y="15" width="6" height="6" fill="currentColor" />
      <rect x="15" y="15" width="6" height="6" fill="currentColor" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.527-8.69L1.5 2.25h6.636l4.254 5.622L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

function RetakeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3.5 12a8.5 8.5 0 0 1 14.3-6.2M20.5 12a8.5 8.5 0 0 1-14.3 6.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
      />
      <path
        d="M17 3.5v4.2h-4.2M7 20.5v-4.2h4.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
