import { ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

interface DropdownOption<T extends string> {
  label: string;
  value: T;
}

interface DropdownSelectProps<T extends string> {
  label: string;
  onChange: (value: T) => void;
  options: DropdownOption<T>[];
  value: T;
}

export function DropdownSelect<T extends string>({
  label,
  onChange,
  options,
  value,
}: DropdownSelectProps<T>) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const selected = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <span id={`${id}-label`} className="mb-1.5 block text-xs font-black uppercase text-slate-700">
        {label}
      </span>
      <button
        type="button"
        aria-labelledby={`${id}-label`}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((current) => !current)}
        className="flex h-12 w-full items-center justify-between gap-3 rounded-md border border-slate-300 bg-white px-3 text-left text-sm font-bold text-ink transition hover:border-cyan-600"
      >
        <span className="truncate">{selected.label}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-cyan-800 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-labelledby={`${id}-label`}
          className="absolute z-30 mt-2 max-h-64 w-full overflow-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lift ring-1 ring-slate-900/5"
        >
          {options.map((option) => {
            const active = option.value === value;

            return (
              <button
                type="button"
                role="option"
                aria-selected={active}
                key={option.value || "all"}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center rounded-md px-3 py-2.5 text-left text-sm font-bold transition ${
                  active
                    ? "bg-gradient-to-r from-cyan-700 to-violet-700 text-white"
                    : "text-slate-800 hover:bg-cyan-50 hover:text-cyan-900"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
