import type { FlightStatus } from "../types";

interface StatusBadgeProps {
  status: FlightStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const isActive = status === "Active";

  return (
    <span
      className={`inline-flex min-w-20 items-center justify-center rounded-full px-2.5 py-1 text-xs font-bold ${
        isActive ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
      }`}
    >
      {status}
    </span>
  );
}
