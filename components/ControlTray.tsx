"use client";

type ControlTrayProps = {
  onPickPhoto: () => void;
  onDownload: () => void;
  onShare: () => void;
  hasResult: boolean;
  busy: boolean;
  converting: boolean;
  sharing: boolean;
  webViewSave: boolean;
};

export function ControlTray({
  onPickPhoto,
  onDownload,
  onShare,
  hasResult,
  busy,
  converting,
  sharing,
  webViewSave,
}: ControlTrayProps) {
  const status = converting
    ? "Converting…"
    : sharing
      ? "Preparing share…"
      : busy
        ? "Framing…"
        : null;

  return (
    <div className="sticky bottom-0 z-20 border-t border-[var(--line)] bg-[color-mix(in_oklab,var(--surface)_92%,transparent)] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md">
      {status ? (
        <p className="mb-2 text-center text-sm text-[var(--muted)]" aria-live="polite">
          {status}
        </p>
      ) : null}
      <div className="mx-auto flex w-full max-w-md flex-col gap-2">
        <button
          type="button"
          onClick={onPickPhoto}
          disabled={busy || sharing}
          className="flex h-14 w-full items-center justify-center rounded-xl bg-[var(--accent)] text-base font-semibold text-[var(--accent-fg)] transition enabled:active:scale-[0.98] disabled:opacity-50"
        >
          {hasResult ? "Choose another photo" : "Upload photo"}
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onDownload}
            disabled={!hasResult || busy || sharing}
            className="flex h-12 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface)] text-sm font-semibold text-[var(--ink)] transition enabled:active:scale-[0.98] disabled:opacity-40"
          >
            {webViewSave ? "Long-press image to save" : "Download"}
          </button>
          <button
            type="button"
            onClick={onShare}
            disabled={!hasResult || busy || sharing}
            className="flex h-12 items-center justify-center rounded-xl bg-[var(--ink)] text-sm font-semibold text-[var(--surface)] transition enabled:active:scale-[0.98] disabled:opacity-40"
          >
            Share to X
          </button>
        </div>
      </div>
    </div>
  );
}
