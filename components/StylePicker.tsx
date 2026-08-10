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
    <div className="flex min-h-dvh flex-col text-[var(--cream)]">
      <header className="flex shrink-0 items-center justify-between gap-3 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 sm:px-5">
        <p className="mecha-title font-[family-name:var(--font-display)] text-base text-[var(--yellow)] sm:text-lg">
          Pick a look
        </p>
        <p className="border-2 border-[var(--magenta)] px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[var(--magenta)]">
          {selected?.name ?? "…"}
        </p>
      </header>

      <main className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 overflow-y-auto px-3 py-2">
        <div
          className={`mecha-panel relative w-full overflow-hidden bg-[var(--cream)] ${
            format === "pass"
              ? "max-w-[min(100%,min(420px,90dvw))]"
              : "max-w-[min(100%,min(420px,85dvw))]"
          }`}
        >
          {selected ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={selected.previewUrl}
              alt={selected.name}
              className={`mx-auto w-full object-contain ${
                format === "pass"
                  ? "aspect-[4/5] max-h-[min(48dvh,480px)]"
                  : "aspect-square max-h-[min(48dvh,420px)]"
              }`}
              draggable={false}
            />
          ) : null}
        </div>

        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted-on-green)]">
          Tap a style — switches instantly
        </p>

        <div className="flex w-full max-w-md gap-2 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {variants.map((v, i) => {
            const active = i === selectedIndex;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => onSelect(i)}
                className={`shrink-0 w-[4.75rem] text-left transition ${
                  active ? "translate-x-0.5 translate-y-0.5" : ""
                }`}
              >
                <span
                  className={`block overflow-hidden border-[3px] border-[var(--black)] bg-[var(--cream)] ${
                    active
                      ? "shadow-[3px_3px_0_0_#F5C518]"
                      : "shadow-[3px_3px_0_0_#111] opacity-80"
                  } ${format === "pass" ? "aspect-[4/5]" : "aspect-square"}`}
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
        </div>
      </main>

      <footer className="shrink-0 px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-1 sm:px-4">
        <button
          type="button"
          onClick={onConfirm}
          className="mecha-panel flex w-full max-w-md mx-auto items-center justify-center border-[3px] border-[var(--black)] bg-[var(--magenta)] py-3.5 text-base font-bold uppercase tracking-[0.14em] text-white shadow-[4px_4px_0_0_#111] transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_0_#111]"
        >
          Use this look
        </button>
        <button
          type="button"
          onClick={onRetake}
          className="mecha-panel mt-3 flex w-full max-w-md mx-auto items-center justify-center gap-2 bg-transparent py-2.5 text-sm font-bold uppercase tracking-[0.12em] text-[var(--yellow)]"
        >
          Take again
        </button>
      </footer>
    </div>
  );
}
