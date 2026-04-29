import { CalendarDays, Search, Trash2, X } from "lucide-react";
import { DAYS } from "../constants";
import { DropdownSelect } from "./DropdownSelect";
import type { BodyType, FlightFilters, FlightStatus } from "../types";
import { formatBodyType } from "../utils/format";

interface FlightToolbarProps {
  aocOptions: string[];
  filters: FlightFilters;
  onClear: () => void;
  onDeleteSelected: () => void;
  onFilterChange: <K extends keyof FlightFilters>(key: K, value: FlightFilters[K]) => void;
  onSearchChange: (value: string) => void;
  search: string;
  selectedCount: number;
}

const statusOptions: FlightStatus[] = ["Active", "Inactive"];
const bodyTypeOptions: BodyType[] = ["narrow_body", "wide_body"];

export function FlightToolbar({
  aocOptions,
  filters,
  onClear,
  onDeleteSelected,
  onFilterChange,
  onSearchChange,
  search,
  selectedCount,
}: FlightToolbarProps) {
  const toggleDay = (day: number) => {
    const nextDays = filters.days.includes(day)
      ? filters.days.filter((value) => value !== day)
      : [...filters.days, day].sort((a, b) => a - b);

    onFilterChange("days", nextDays);
  };

  return (
    <section
      className="mx-4 rounded-lg border border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f0fdfa_44%,#f5f3ff_100%)] p-4 shadow-lift md:mx-6"
      aria-label="Flight filters"
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(260px,1fr)_auto] xl:items-start">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(260px,1.3fr)_repeat(4,minmax(150px,1fr))]">
          <div>
            <label className="mb-1.5 block text-xs font-black uppercase text-slate-700" htmlFor="flight-search">
              Search schedule
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-700" />
              <input
                id="flight-search"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Flight, origin, destination"
                className="h-12 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm font-medium text-ink placeholder:text-slate-500"
              />
            </div>
          </div>

          <DropdownSelect
            label="Airline code"
            value={filters.aoc}
            onChange={(value) => onFilterChange("aoc", value)}
            options={[{ label: "All AOC", value: "" }, ...aocOptions.map((aoc) => ({ label: aoc, value: aoc }))]}
          />

          <DropdownSelect<"" | FlightStatus>
            label="Flight status"
            value={filters.status}
            onChange={(value) => onFilterChange("status", value)}
            options={[{ label: "All status", value: "" }, ...statusOptions.map((status) => ({ label: status, value: status }))]}
          />

          <DropdownSelect<"" | BodyType>
            label="Aircraft type"
            value={filters.bodyType}
            onChange={(value) => onFilterChange("bodyType", value)}
            options={[
              { label: "All aircraft", value: "" },
              ...bodyTypeOptions.map((bodyType) => ({ label: formatBodyType(bodyType), value: bodyType })),
            ]}
          />

          <button
            type="button"
            onClick={onClear}
            className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-lagoon hover:bg-cyan-50 hover:text-cyan-800 xl:mt-5"
          >
            <X className="h-4 w-4" />
            Clear All
          </button>
        </div>

        <button
          type="button"
          onClick={onDeleteSelected}
          disabled={selectedCount === 0}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-red-700 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-700 xl:mt-5"
        >
          <Trash2 className="h-4 w-4" />
          Delete selected
          <span className="rounded bg-white/20 px-1.5 py-0.5">{selectedCount}</span>
        </button>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(260px,430px)_1fr] lg:items-center">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-black uppercase text-slate-700" htmlFor="from-date">
              Start date from
            </label>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-700" />
              <input
                id="from-date"
                type="date"
                value={filters.fromDate}
                onChange={(event) => onFilterChange("fromDate", event.target.value)}
                className="h-12 w-full rounded-md border border-slate-300 bg-white pl-9 pr-2 text-sm font-medium text-ink"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-black uppercase text-slate-700" htmlFor="to-date">
              End date to
            </label>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fuchsia-700" />
              <input
                id="to-date"
                type="date"
                value={filters.toDate}
                onChange={(event) => onFilterChange("toDate", event.target.value)}
                className="h-12 w-full rounded-md border border-slate-300 bg-white pl-9 pr-2 text-sm font-medium text-ink"
              />
            </div>
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-xs font-black uppercase text-slate-700">Days of operation</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Days of operation">
          {DAYS.map((day) => {
            const selected = filters.days.includes(day.value);

            return (
              <button
                type="button"
                key={day.value}
                aria-pressed={selected}
                title={day.long}
                onClick={() => toggleDay(day.value)}
                className={`h-10 min-w-12 rounded-md border px-3 text-sm font-bold shadow-sm transition active:scale-[0.98] disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-100 disabled:text-slate-700 ${
                  selected
                    ? "border-cyan-900 bg-cyan-900 text-white ring-2 ring-cyan-200 hover:bg-cyan-800"
                    : "border-slate-300 bg-white text-slate-900 hover:border-lagoon hover:bg-cyan-50 hover:text-cyan-950"
                }`}
              >
                {day.short}
              </button>
            );
          })}
          </div>
        </div>
      </div>
    </section>
  );
}
