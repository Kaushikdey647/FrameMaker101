"use client";

export type FormatMode = "frame" | "pass";

type LandingScreenProps = {
  mode: FormatMode;
  onModeChange: (mode: FormatMode) => void;
  name: string;
  role: string;
  onNameChange: (v: string) => void;
  onRoleChange: (v: string) => void;
  busy: boolean;
  converting: boolean;
  error: string | null;
  onCamera: () => void;
  onGallery: () => void;
  onLookup: (serial: string) => void;
};

export function LandingScreen({
  mode,
  onModeChange,
  name,
  role,
  onNameChange,
  onRoleChange,
  busy,
  converting,
  error,
  onCamera,
  onGallery,
  onLookup,
}: LandingScreenProps) {
  const status = converting
    ? "Converting…"
    : busy
      ? mode === "pass"
        ? "Minting your Builder ID…"
        : "Framing your photo…"
      : null;

  const passReady = name.trim().length >= 2 && role.trim().length >= 1;

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[var(--green)]">
      <header className="land-in relative z-10 flex flex-1 flex-col items-center px-5 pb-6 pt-[max(2.5rem,env(safe-area-inset-top))] text-center">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[var(--yellow)]">
          Frame In Goa
        </p>

        <div className="relative mt-5 max-w-full">
          <h1 className="font-[family-name:var(--font-display)] text-[clamp(2.6rem,11vw,4.25rem)] leading-[0.9] tracking-tight text-[var(--yellow)]">
            HACKER
            <br />
            HOUSE
          </h1>
          <span
            className="absolute -right-1 top-[42%] rotate-[-8deg] rounded-full bg-[var(--magenta)] px-3 py-1 font-[family-name:var(--font-deva)] text-lg font-bold text-white shadow-[0_8px_20px_-8px_rgba(0,0,0,0.45)] sm:text-xl"
            aria-hidden
          >
            गोवा
          </span>
        </div>

        <p className="mt-4 text-sm font-medium tracking-wide text-[var(--yellow)]">
          GOA · #FrameInGoa
        </p>
        <p className="mt-3 max-w-[18rem] text-sm leading-relaxed text-[var(--muted-on-green)]">
          Profile frame or Builder ID — snap, brand, share.
        </p>

        <div className="mt-7 flex w-full max-w-sm rounded-full bg-[var(--green-deep)] p-1 ring-1 ring-white/10">
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
              <span className="mb-1.5 block text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--yellow)]">
                Full name
              </span>
              <input
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                maxLength={48}
                placeholder="e.g. Satoshi"
                disabled={busy}
                className="h-12 w-full rounded-full border-0 bg-[var(--cream)] px-4 text-[var(--ink)] outline-none ring-2 ring-transparent placeholder:text-[var(--ink-soft)]/50 focus:ring-[var(--yellow)]"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--yellow)]">
                Stack / role
              </span>
              <input
                value={role}
                onChange={(e) => onRoleChange(e.target.value)}
                maxLength={48}
                placeholder="e.g. Full-stack / AI"
                disabled={busy}
                className="h-12 w-full rounded-full border-0 bg-[var(--cream)] px-4 text-[var(--ink)] outline-none ring-2 ring-transparent placeholder:text-[var(--ink-soft)]/50 focus:ring-[var(--yellow)]"
              />
            </label>
          </div>
        ) : null}

        <div className="mt-6 flex w-full max-w-sm flex-col gap-3">
          <button
            type="button"
            onClick={onCamera}
            disabled={busy || (mode === "pass" && !passReady)}
            className="flex h-14 items-center justify-center rounded-full bg-[var(--magenta)] text-base font-bold text-white transition enabled:active:scale-[0.98] disabled:opacity-45"
          >
            Take a photo
          </button>
          <button
            type="button"
            onClick={onGallery}
            disabled={busy || (mode === "pass" && !passReady)}
            className="flex h-14 items-center justify-center rounded-full border-2 border-[var(--black)] bg-[var(--yellow)] text-base font-bold text-[var(--black)] transition enabled:active:scale-[0.98] disabled:opacity-45"
          >
            Choose from gallery
          </button>
        </div>

        {status ? (
          <p className="mt-5 text-sm text-[var(--yellow)]" aria-live="polite">
            {status}
          </p>
        ) : null}
        {error ? (
          <p className="mt-4 max-w-sm text-sm text-[var(--danger)]" role="alert">
            {error}
          </p>
        ) : null}

        <LookupForm onLookup={onLookup} disabled={busy} />
      </header>

      <footer className="relative z-10 flex flex-col items-center pb-[max(1rem,env(safe-area-inset-bottom))]">
        <SunPalms />
        <p className="mt-2 text-center text-xs text-[var(--muted-on-green)]">
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
      className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-[var(--yellow)] text-[var(--black)]"
          : "text-[var(--muted-on-green)]"
      }`}
    >
      {label}
    </button>
  );
}

function LookupForm({
  onLookup,
  disabled,
}: {
  onLookup: (serial: string) => void;
  disabled: boolean;
}) {
  return (
    <form
      className="mt-8 w-full max-w-sm"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const serial = String(fd.get("serial") ?? "").trim();
        if (serial) onLookup(serial);
      }}
    >
      <p className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--yellow)]">
        Already have an ID?
      </p>
      <div className="flex gap-2">
        <input
          name="serial"
          placeholder="HH-GOA-XXXXX"
          disabled={disabled}
          className="h-11 min-w-0 flex-1 rounded-full bg-[var(--cream)]/15 px-4 text-sm text-[var(--cream)] outline-none ring-1 ring-white/15 placeholder:text-white/35 focus:ring-[var(--yellow)]"
        />
        <button
          type="submit"
          disabled={disabled}
          className="h-11 shrink-0 rounded-full bg-[var(--cream)] px-4 text-sm font-bold text-[var(--ink)] disabled:opacity-45"
        >
          Open
        </button>
      </div>
    </form>
  );
}

function SunPalms() {
  return (
    <svg
      width="220"
      height="72"
      viewBox="0 0 220 72"
      fill="none"
      aria-hidden
      className="opacity-90"
    >
      <circle cx="110" cy="40" r="14" fill="#F5C518" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const x1 = 110 + Math.cos(a) * 20;
        const y1 = 40 + Math.sin(a) * 20;
        const x2 = 110 + Math.cos(a) * 30;
        const y2 = 40 + Math.sin(a) * 30;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#F5C518"
            strokeWidth="3"
            strokeLinecap="round"
          />
        );
      })}
      <path
        d="M28 68c2-28 8-44 18-52M28 28c-14 6-22 18-24 28M28 28c0-14 10-24 22-28M28 28c12-4 22 2 28 12"
        stroke="#083821"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M192 68c-2-28-8-44-18-52M192 28c14 6 22 18 24 28M192 28c0-14-10-24-22-28M192 28c-12-4-22 2-28 12"
        stroke="#083821"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
