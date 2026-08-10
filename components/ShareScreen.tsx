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
                ? "aspect-[263/388] max-h-[min(56dvh,580px)]"
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
            Opening share…
          </p>
        ) : (
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted-on-green)] sm:text-sm">
            {canNativeShare
              ? "Tap Share — pick WhatsApp, X, or any app"
              : "Save your photo, then share from your gallery"}
          </p>
        )}
      </main>

      <footer className="shrink-0 px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-1 sm:px-4 sm:pt-2">
        <div className="mecha-panel mx-auto flex w-full max-w-md flex-col gap-3 bg-[var(--cream)] px-3 py-4 text-[var(--ink)] sm:gap-4 sm:px-4 sm:py-5">
          {/* Primary mobile action */}
          {canNativeShare ? (
            <button
              type="button"
              onClick={onShareNative}
              disabled={sharing}
              className="flex w-full items-center justify-center gap-2 border-[3px] border-[var(--black)] bg-[var(--magenta)] py-3.5 text-base font-bold uppercase tracking-[0.14em] text-white shadow-[4px_4px_0_0_#111] transition enabled:active:translate-x-0.5 enabled:active:translate-y-0.5 enabled:active:shadow-[2px_2px_0_0_#111] disabled:opacity-40"
            >
              <ShareIcon />
              Share
            </button>
          ) : (
            <button
              type="button"
              onClick={onDownload}
              disabled={sharing || webViewSave}
              className="flex w-full items-center justify-center gap-2 border-[3px] border-[var(--black)] bg-[var(--yellow)] py-3.5 text-base font-bold uppercase tracking-[0.14em] text-[var(--black)] shadow-[4px_4px_0_0_#111] transition enabled:active:translate-x-0.5 enabled:active:translate-y-0.5 enabled:active:shadow-[2px_2px_0_0_#111] disabled:opacity-40"
            >
              <DownloadIcon />
              {webViewSave ? "Long-press photo" : "Save photo"}
            </button>
          )}

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {canNativeShare ? (
              <SecondaryAction
                label={webViewSave ? "Save" : "Save"}
                onClick={onDownload}
                disabled={sharing || webViewSave}
                title={
                  webViewSave
                    ? "Long-press the photo to save"
                    : "Download JPEG to your phone"
                }
                tone="yellow"
              >
                <DownloadIcon />
              </SecondaryAction>
            ) : null}
            <SecondaryAction
              label="Post to X"
              onClick={onShareX}
              disabled={sharing}
              title={
                canNativeShare
                  ? "Opens share — tap X to post with photo"
                  : "Opens X with caption; save photo to attach"
              }
              tone="green"
              className={canNativeShare ? undefined : "col-span-2"}
            >
              <XIcon />
            </SecondaryAction>
          </div>

          {hint && !error ? (
            <p
              className="text-center text-xs font-semibold text-[var(--ink-soft)]"
              aria-live="polite"
            >
              {hint}
            </p>
          ) : webViewSave ? (
            <p className="text-center text-xs text-[var(--ink-soft)]">
              Long-press the photo to save in this browser
            </p>
          ) : !canNativeShare ? (
            <p className="text-center text-xs text-[var(--ink-soft)]">
              On your phone, open the live HTTPS site for one-tap share
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

function SecondaryAction({
  label,
  children,
  onClick,
  disabled,
  title,
  tone,
  className,
}: {
  label: string;
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  tone: "yellow" | "green";
  className?: string;
}) {
  const fill =
    tone === "yellow"
      ? "bg-[var(--yellow)] text-[var(--black)]"
      : "bg-[var(--green)] text-[var(--yellow)]";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex items-center justify-center gap-2 border-[3px] border-[var(--black)] py-3 text-sm font-bold uppercase tracking-[0.1em] shadow-[3px_3px_0_0_#111] transition enabled:active:translate-x-0.5 enabled:active:translate-y-0.5 enabled:active:shadow-[1px_1px_0_0_#111] disabled:opacity-35 ${fill} ${className ?? ""}`}
    >
      {children}
      {label}
    </button>
  );
}

function ShareIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 5h5v5M19 5l-9 9M10 5H5v14h14v-5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
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

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
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
