"use client";

import type { ReactNode } from "react";
import type { FormatMode } from "./LandingScreen";

type ShareScreenProps = {
  previewUrl: string;
  format: FormatMode;
  serial?: string;
  lookupUrl?: string;
  canNativeShare: boolean;
  webViewSave: boolean;
  sharing: boolean;
  error: string | null;
  onDownload: () => void;
  onShareNative: () => void;
  onShareX: () => void;
  onRetake: () => void;
  onCopyLink?: () => void;
};

export function ShareScreen({
  previewUrl,
  format,
  serial,
  lookupUrl,
  canNativeShare,
  webViewSave,
  sharing,
  error,
  onDownload,
  onShareNative,
  onShareX,
  onRetake,
  onCopyLink,
}: ShareScreenProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-[var(--green)] text-[var(--cream)]">
      <header className="flex items-center justify-between px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-2">
        <p className="font-[family-name:var(--font-display)] text-lg tracking-tight text-[var(--yellow)]">
          HH GOA
        </p>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--magenta)]">
          #FrameInGoa
        </p>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-5 py-3">
        <div
          className={`share-photo-enter relative w-full overflow-hidden rounded-[1.35rem] bg-[var(--cream)] shadow-[0_30px_80px_-24px_rgba(0,0,0,0.55)] ring-1 ring-black/10 ${
            format === "pass" ? "max-w-[min(100%,380px)]" : "max-w-[min(100%,420px)]"
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
            className={`w-full object-contain ${format === "pass" ? "aspect-[1080/1350]" : "aspect-square"}`}
            draggable={false}
          />
        </div>

        {format === "pass" && serial ? (
          <div className="mt-4 text-center">
            <p className="font-mono text-sm font-bold tracking-wider text-[var(--yellow)]">
              {serial}
            </p>
            {lookupUrl ? (
              <button
                type="button"
                onClick={onCopyLink}
                className="mt-1 text-xs font-medium text-[var(--muted-on-green)] underline-offset-2 hover:underline"
              >
                Copy ID link
              </button>
            ) : null}
          </div>
        ) : null}

        {error ? (
          <p className="mt-3 max-w-sm text-center text-sm text-[var(--danger)]" role="alert">
            {error}
          </p>
        ) : sharing ? (
          <p className="mt-3 text-sm text-[var(--yellow)]" aria-live="polite">
            Preparing share…
          </p>
        ) : (
          <p className="mt-3 text-sm text-[var(--muted-on-green)]">Looks good — send it out</p>
        )}
      </main>

      <footer className="px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2">
        <div className="mx-auto max-w-md rounded-[1.75rem] bg-[var(--cream)] px-3 py-5 text-[var(--ink)] shadow-[0_16px_40px_-20px_rgba(0,0,0,0.45)]">
          <p className="mb-4 text-center text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">
            Share
          </p>
          <div className="flex items-start justify-evenly gap-1">
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
                  ? "Share to WhatsApp, Instagram, and more"
                  : "System share isn’t available here"
              }
              tone="magenta"
            >
              <AppsIcon />
            </ShareAction>
            <ShareAction
              label="X"
              onClick={onShareX}
              disabled={sharing}
              title="Share to X"
              tone="green"
            >
              <XIcon />
            </ShareAction>
          </div>
          {webViewSave ? (
            <p className="mt-3 text-center text-xs text-[var(--ink-soft)]">
              Long-press the photo to save in this browser
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onRetake}
          disabled={sharing}
          className="mt-4 flex w-full items-center justify-center gap-2 py-3 text-sm font-semibold text-[var(--yellow)] transition enabled:active:opacity-80 disabled:opacity-40"
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
  const ring =
    tone === "yellow"
      ? "bg-[var(--yellow)] text-[var(--black)]"
      : tone === "magenta"
        ? "bg-[var(--magenta)] text-white"
        : "bg-[var(--green)] text-[var(--yellow)] ring-2 ring-[var(--yellow)]";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="flex w-[5.5rem] flex-col items-center gap-2.5 disabled:opacity-35"
    >
      <span
        className={`flex h-[3.6rem] w-[3.6rem] items-center justify-center rounded-full shadow-[0_10px_24px_-10px_rgba(0,0,0,0.45)] transition enabled:active:scale-95 ${ring}`}
      >
        {children}
      </span>
      <span className="text-[0.72rem] font-semibold tracking-wide text-[var(--ink-soft)]">
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
        strokeWidth="1.85"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AppsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="6" cy="6" r="2.1" fill="currentColor" />
      <circle cx="12" cy="6" r="2.1" fill="currentColor" />
      <circle cx="18" cy="6" r="2.1" fill="currentColor" />
      <circle cx="6" cy="12" r="2.1" fill="currentColor" />
      <circle cx="12" cy="12" r="2.1" fill="currentColor" />
      <circle cx="18" cy="12" r="2.1" fill="currentColor" />
      <circle cx="6" cy="18" r="2.1" fill="currentColor" />
      <circle cx="12" cy="18" r="2.1" fill="currentColor" />
      <circle cx="18" cy="18" r="2.1" fill="currentColor" />
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
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M17 3.5v4.2h-4.2M7 20.5v-4.2h4.2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
