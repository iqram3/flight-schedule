import type { FlightStatus } from "../types";

interface ToggleSwitchProps {
  status: FlightStatus;
  onToggle: () => void;
  label: string;
}

export function ToggleSwitch({ status, onToggle, label }: ToggleSwitchProps) {
  const checked = status === "Active";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onToggle}
      className={`relative h-7 w-12 rounded-full border transition ${
        checked ? "border-emerald-700 bg-emerald-700" : "border-slate-300 bg-slate-300"
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}
