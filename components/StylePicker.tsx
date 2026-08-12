"use client";

type StylePickerProps = {
  format: "frame" | "pass";
  variants: Array<{
    id: string;
    name: string;
    previewUrl: string;
  }>;
  selectedIndex: number;
  onSelect: (index: number) => void;
  onConfirm: () => void;
  onRetake: () => void;
};

export function StylePicker({
  format,
  variants,
  selectedIndex,
  onSelect,
  onConfirm,
  onRetake,
}: StylePickerProps) {
  const selected = variants[selectedIndex];

  return (
    <div className="flex min-h-dvh flex-col landscape:flex-row text-[var(--cream)]">
      {/* Header — hidden in landscape to save vertical space */}
      <header className="flex shrink-0 items-center justify-between gap-3 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 sm:px-5 landscape:hidden">
        <p className="mecha-title font-[family-name:var(--font-display)] text-base text-[var(--yellow)] sm:text-lg">
          Pick a look
        </p>
        <p className="border-2 border-[var(--magenta)] px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[var(--magenta)]">
          {selected?.name ?? "…"}
        </p>
      </header>

      {/* Main — portrait: image + horizontal thumbnails; landscape: image fills height */}
      <main className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 overflow-y-auto px-3 py-2 landscape:flex-row landscape:gap-0 landscape:overflow-visible landscape:py-0 landscape:px-0">
        {/* Image preview */}
        <div
          className={`mecha-panel relative w-full overflow-hidden bg-[var(--cream)] ${
            format === "pass"
              ? "max-w-[min(100%,min(420px,90dvw))] landscape:max-w-none landscape:h-dvh landscape:w-auto landscape:rounded-none landscape:border-0 landscape:shadow-none"
              : "max-w-[min(100%,min(420px,85dvw))] landscape:max-w-none landscape:h-dvh landscape:w-auto landscape:rounded-none landscape:border-0 landscape:shadow-none"
          }`}
        >
          {selected ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={selected.previewUrl}
              alt={selected.name}
              className={`mx-auto w-full object-contain ${
                format === "pass"
                  ? "aspect-[263/388] max-h-[min(52dvh,560px)] landscape:aspect-auto landscape:max-h-dvh landscape:max-w-none landscape:w-auto landscape:h-dvh"
                  : "aspect-square max-h-[min(48dvh,420px)] landscape:aspect-auto landscape:max-h-dvh landscape:max-w-none landscape:w-auto landscape:h-dvh"
              }`}
              draggable={false}
            />
          ) : null}
        </div>

        {/* Portrait: hint + horizontal thumbnail strip */}
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted-on-green)] landscape:hidden">
          Tap a style — switches instantly
        </p>

        <div className="flex w-full max-w-md gap-2 overflow-x-auto px-1 pb-1 landscape:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ThumbnailStrip
            variants={variants}
            selectedIndex={selectedIndex}
            format={format}
            onSelect={onSelect}
            direction="horizontal"
          />
        </div>
      </main>

      {/* Footer — portrait: confirm + retake; landscape: right sidebar with thumbnails */}
      <footer className="shrink-0 px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-1 sm:px-4 landscape:flex landscape:w-64 landscape:flex-col landscape:justify-between landscape:px-4 landscape:pb-[max(1rem,env(safe-area-inset-bottom))] landscape:pt-[max(0.75rem,env(safe-area-inset-top))]">
        {/* Landscape: compact header + vertical thumbnail strip */}
        <div className="hidden landscape:flex flex-col gap-3 flex-1 min-h-0">
          <div className="flex items-center justify-between">
            <p className="mecha-title font-[family-name:var(--font-display)] text-sm text-[var(--yellow)]">
              Pick a look
            </p>
            <p className="border-2 border-[var(--magenta)] px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-[var(--magenta)]">
              {selected?.name ?? "…"}
            </p>
          </div>

          <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <ThumbnailStrip
              variants={variants}
              selectedIndex={selectedIndex}
              format={format}
              onSelect={onSelect}
              direction="vertical"
            />
          </div>
        </div>

        {/* Confirm + Retake buttons */}
        <div className="landscape:mt-3">
          <button
            type="button"
            onClick={onConfirm}
            className="mecha-panel flex w-full max-w-md mx-auto items-center justify-center border-[3px] border-[var(--black)] bg-[var(--magenta)] py-3.5 text-base font-bold uppercase tracking-[0.14em] text-white shadow-[4px_4px_0_0_#111] transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_0_#111] landscape:max-w-none landscape:py-3"
          >
            Use this look
          </button>
          <button
            type="button"
            onClick={onRetake}
            className="mecha-panel mt-3 flex w-full max-w-md mx-auto items-center justify-center gap-2 bg-transparent py-2.5 text-sm font-bold uppercase tracking-[0.12em] text-[var(--yellow)] landscape:max-w-none landscape:mt-2 landscape:py-2"
          >
            Take again
          </button>
        </div>
      </footer>
    </div>
  );
}

function ThumbnailStrip({
  variants,
  selectedIndex,
  format,
  onSelect,
  direction,
}: {
  variants: StylePickerProps["variants"];
  selectedIndex: number;
  format: "frame" | "pass";
  onSelect: (i: number) => void;
  direction: "horizontal" | "vertical";
}) {
  return (
    <>
      {variants.map((v, i) => {
        const active = i === selectedIndex;
        if (direction === "vertical") {
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onSelect(i)}
              className={`flex items-center gap-2 text-left transition shrink-0 ${active ? "translate-x-0.5 translate-y-0.5" : ""}`}
            >
              <span
                className={`block w-12 shrink-0 overflow-hidden border-[3px] border-[var(--black)] bg-[var(--cream)] ${
                  active
                    ? "shadow-[3px_3px_0_0_#F5C518]"
                    : "shadow-[3px_3px_0_0_#111] opacity-80"
                } ${format === "pass" ? "aspect-[263/388]" : "aspect-square"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={v.previewUrl}
                  alt=""
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              </span>
              <span
                className={`text-[0.65rem] font-bold uppercase tracking-wide ${
                  active ? "text-[var(--yellow)]" : "text-[var(--muted-on-green)]"
                }`}
              >
                {v.name}
              </span>
            </button>
          );
        }
        return (
          <button
            key={v.id}
            type="button"
            onClick={() => onSelect(i)}
            className={`shrink-0 w-[4.75rem] text-left transition ${active ? "translate-x-0.5 translate-y-0.5" : ""}`}
          >
            <span
              className={`block overflow-hidden border-[3px] border-[var(--black)] bg-[var(--cream)] ${
                active
                  ? "shadow-[3px_3px_0_0_#F5C518]"
                  : "shadow-[3px_3px_0_0_#111] opacity-80"
              } ${format === "pass" ? "aspect-[263/388]" : "aspect-square"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={v.previewUrl}
                alt=""
                className="h-full w-full object-cover"
                draggable={false}
              />
            </span>
            <span
              className={`mt-1 block truncate text-center text-[0.58rem] font-bold uppercase tracking-wide ${
                active ? "text-[var(--yellow)]" : "text-[var(--muted-on-green)]"
              }`}
            >
              {v.name}
            </span>
          </button>
        );
      })}
    </>
  );
}
