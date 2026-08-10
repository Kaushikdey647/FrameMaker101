"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  formatAirportLabel,
  searchIndiaAirports,
  type IndiaAirport,
} from "@/lib/india-airports";

type AirportPickerProps = {
  value: IndiaAirport | null;
  onChange: (airport: IndiaAirport | null) => void;
  disabled?: boolean;
};

export function AirportPicker({ value, onChange, disabled }: AirportPickerProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(value ? formatAirportLabel(value) : "");
  const [open, setOpen] = useState(false);
  const results = searchIndiaAirports(query, 14);

  useEffect(() => {
    if (value) setQuery(formatAirportLabel(value));
  }, [value]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function select(a: IndiaAirport) {
    onChange(a);
    setQuery(formatAirportLabel(a));
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative block">
      <span className="mb-1.5 block text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--yellow)]">
        Flying from
      </span>
      <input
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        value={query}
        disabled={disabled}
        placeholder="Search city or IATA (e.g. BOM)"
        autoComplete="off"
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (value) onChange(null);
        }}
        className="mecha-input"
      />
      {open && !disabled ? (
        <ul
          id={listId}
          role="listbox"
          className="mecha-panel absolute z-30 mt-2 max-h-56 w-full overflow-auto bg-[var(--cream)] py-1 text-left"
        >
          {results.length === 0 ? (
            <li className="px-4 py-2 text-sm text-[var(--ink-soft)]">No airports match</li>
          ) : (
            results.map((a) => (
              <li key={a.iata} role="option">
                <button
                  type="button"
                  className="flex w-full flex-col border-b border-[var(--green)]/15 px-4 py-2 text-left last:border-0 hover:bg-[var(--yellow)]"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => select(a)}
                >
                  <span className="text-sm font-bold text-[var(--ink)]">
                    <span className="font-mono text-[var(--magenta)]">{a.iata}</span>
                    {" · "}
                    {a.city}
                  </span>
                  <span className="truncate text-xs text-[var(--ink-soft)]">{a.name}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
