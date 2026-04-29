import { memo, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  FixedSizeList as List,
  VariableSizeList as VariableList,
  type ListChildComponentProps,
} from "react-window";
import { ArrowDown, ArrowUp, Check, Edit3, Save, Trash2, X } from "lucide-react";
import { IconButton } from "./IconButton";
import { StatusBadge } from "./StatusBadge";
import { ToggleSwitch } from "./ToggleSwitch";
import type { EditableFlightFields, Flight, FlightStatus } from "../types";
import { formatBodyType, formatDays } from "../utils/format";

const ROW_HEIGHT = 82;
const GRID_COLUMNS =
  "28px minmax(70px,0.6fr) minmax(56px,0.5fr) minmax(48px,0.45fr) minmax(150px,1.2fr) minmax(178px,1.25fr) minmax(226px,1.45fr) minmax(120px,1fr) minmax(86px,0.7fr) minmax(132px,0.9fr) minmax(76px,0.55fr)";
const TABLE_MIN_WIDTH = 1180;

interface FlightTableProps {
  draft: EditableFlightFields | null;
  editingId: string | null;
  flights: Flight[];
  hasMore: boolean;
  loadedCount: number;
  onCancel: () => void;
  onDelete: (flightId: string) => void;
  onDraftChange: <K extends keyof EditableFlightFields>(key: K, value: EditableFlightFields[K]) => void;
  onEdit: (flight: Flight) => void;
  onLoadMore: () => void;
  onSave: (flight: Flight) => void;
  onSelect: (flightId: string) => void;
  onSelectAllVisible: () => void;
  onToggleStatus: (flight: Flight) => void;
  rowFeedback: Record<string, "saving" | "error" | "invalid" | undefined>;
  selectedIds: Set<string>;
  selectedVisibleCount: number;
  totalCount: number;
}

type RowData = FlightTableProps;

function useElementSize<T extends HTMLElement>(fallbackHeight = 480, minWidth = 320) {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ height: fallbackHeight, width: minWidth });

  useEffect(() => {
    const node = ref.current;

    if (!node) {
      return undefined;
    }

    const resizeObserver = new ResizeObserver(([entry]) => {
      setSize({
        height: Math.max(300, Math.floor(entry.contentRect.height)),
        width: Math.max(minWidth, Math.floor(entry.contentRect.width)),
      });
    });

    resizeObserver.observe(node);

    return () => resizeObserver.disconnect();
  }, [minWidth]);

  return { ref, ...size };
}

function useTableSize(fallbackHeight = 480, minWidth = TABLE_MIN_WIDTH) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ height: fallbackHeight, width: minWidth });

  useEffect(() => {
    const container = containerRef.current;
    const viewport = viewportRef.current;

    if (!container || !viewport) {
      return undefined;
    }

    // Initial measurement
    const height = Math.max(300, Math.floor(viewport.getBoundingClientRect().height));
    const width = Math.max(minWidth, Math.floor(container.getBoundingClientRect().width));
    setSize({ height, width });

    // Only observe viewport height changes, not width
    const resizeObserver = new ResizeObserver(() => {
      const newHeight = Math.max(300, Math.floor(viewport.getBoundingClientRect().height));
      setSize(prev => ({ ...prev, height: newHeight }));
    });

    resizeObserver.observe(viewport);

    return () => resizeObserver.disconnect();
  }, [fallbackHeight, minWidth]);

  return { containerRef, viewportRef, ...size };
}

function EditableCell({
  editing,
  field,
  flight,
  onDraftChange,
  type,
  value,
}: {
  editing: boolean;
  field: keyof EditableFlightFields;
  flight: Flight;
  onDraftChange: FlightTableProps["onDraftChange"];
  type: "date" | "time";
  value: string;
}) {
  if (!editing) {
    return <span className="block min-w-0 font-semibold text-slate-800">{flight[field]}</span>;
  }

  return (
    <div className="min-w-0">
      <input
        aria-label={`${field} for ${flight.id}`}
        type={type}
        inputMode={type === "time" ? "numeric" : undefined}
        pattern={type === "time" ? "[0-2][0-9]:[0-5][0-9]" : undefined}
        placeholder={type === "time" ? "HH:mm" : undefined}
        value={value}
        onChange={(event) => onDraftChange(field, event.target.value)}
        className={`h-11 min-w-0 rounded-md border border-slate-300 bg-white text-sm font-bold text-ink shadow-sm ${
          type === "time" ? "w-full px-2 text-xs sm:text-sm" : "w-full px-2 text-xs sm:text-sm"
        }`}
      />
    </div>
  );
}

const FlightRow = memo(function FlightRow({ index, style, data }: ListChildComponentProps<RowData>) {
  const flight = data.flights[index];
  const editing = data.editingId === flight.id;
  const draft = editing ? data.draft : null;
  const feedback = data.rowFeedback[flight.id];
  const saving = feedback === "saving";
  const error = feedback === "error";
  const invalid = feedback === "invalid";
  const selected = data.selectedIds.has(flight.id);

  return (
    <div style={style}>
      <div
        style={{ gridTemplateColumns: GRID_COLUMNS }}
        className={`grid h-[76px] items-center gap-2 border-b border-slate-100 px-3 text-sm transition ${
          selected ? "bg-cyan-50" : "bg-white hover:bg-slate-50"
        }`}
      >
        <input
          type="checkbox"
          aria-label={`Select ${flight.id}`}
          checked={selected}
          onChange={() => data.onSelect(flight.id)}
          className="h-4 w-4 rounded border-slate-400"
        />

        <div>
          <p className="font-semibold text-ink">{flight.id}</p>
          {error && <p className="mt-1 text-xs font-semibold text-red-600">Save failed</p>}
          {invalid && <p className="mt-1 text-xs font-semibold text-amber-700">Invalid dates</p>}
          {saving && <p className="mt-1 text-xs font-semibold text-runway">Saving...</p>}
        </div>

        <span className="rounded-md bg-cyan-100 px-2 py-1 text-center font-black text-cyan-900">{flight.aoc}</span>
        <span className="font-semibold text-ink">{flight.flightNumber}</span>

        <div className="flex min-w-0 items-center gap-1.5">
          <span className="min-w-0 flex-1 truncate rounded-md bg-indigo-50 px-2 py-1 text-center font-black text-indigo-800">{flight.origin}</span>
          <span className="text-xs font-black text-slate-400">to</span>
          <span className="min-w-0 flex-1 truncate rounded-md bg-fuchsia-50 px-2 py-1 text-center font-black text-fuchsia-800">{flight.destination}</span>
        </div>

        <div className="grid min-w-0 grid-cols-2 gap-1.5">
          <EditableCell
            editing={editing}
            field="std"
            flight={flight}
            onDraftChange={data.onDraftChange}
            type="time"
            value={draft?.std ?? flight.std}
          />

          <EditableCell
            editing={editing}
            field="sta"
            flight={flight}
            onDraftChange={data.onDraftChange}
            type="time"
            value={draft?.sta ?? flight.sta}
          />
        </div>

        <div className="grid min-w-0 grid-cols-2 gap-1.5">
          <EditableCell
            editing={editing}
            field="startDate"
            flight={flight}
            onDraftChange={data.onDraftChange}
            type="date"
            value={draft?.startDate ?? flight.startDate}
          />

          <EditableCell
            editing={editing}
            field="endDate"
            flight={flight}
            onDraftChange={data.onDraftChange}
            type="date"
            value={draft?.endDate ?? flight.endDate}
          />
        </div>

        <span className="min-w-0 truncate text-slate-600" title={formatDays(flight.daysOfOperation)}>
          {formatDays(flight.daysOfOperation)}
        </span>

        <span className="truncate text-slate-700" title={formatBodyType(flight.bodyType)}>{formatBodyType(flight.bodyType)}</span>

        <div className="flex min-w-0 items-center gap-1.5 overflow-visible">
          {editing ? (
            <StatusPicker
              label={`Status for ${flight.id}`}
              value={draft?.status ?? flight.status}
              onChange={(value) => data.onDraftChange("status", value)}
            />
          ) : (
            <>
              <StatusBadge status={flight.status} />
              <ToggleSwitch
                label={`Toggle status for ${flight.id}`}
                status={flight.status}
                onToggle={() => data.onToggleStatus(flight)}
              />
            </>
          )}
        </div>

        <div className="flex min-w-0 items-center justify-end gap-1.5">
          {editing ? (
            <>
              <IconButton label={`Save ${flight.id}`} tone="success" onClick={() => data.onSave(flight)} disabled={saving}>
                {saving ? <Check className="h-4 w-4 animate-pulse" /> : <Save className="h-4 w-4" />}
              </IconButton>
              <IconButton label={`Cancel ${flight.id}`} onClick={data.onCancel} disabled={saving}>
                <X className="h-4 w-4" />
              </IconButton>
            </>
          ) : (
            <>
              <IconButton label={`Edit ${flight.id}`} onClick={() => data.onEdit(flight)}>
                <Edit3 className="h-4 w-4" />
              </IconButton>
              <IconButton label={`Delete ${flight.id}`} tone="danger" onClick={() => data.onDelete(flight.id)}>
                <Trash2 className="h-4 w-4" />
              </IconButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

export function FlightTable(props: FlightTableProps) {
  const { containerRef, viewportRef, height, width } = useTableSize(480, TABLE_MIN_WIDTH);
  const listRef = useRef<List>(null);
  const allVisibleSelected = props.flights.length > 0 && props.selectedVisibleCount === props.flights.length;
  const itemData = useMemo(() => props, [props]);
  const moveToTop = () => listRef.current?.scrollToItem(0, "start");
  const moveToBottom = () => {
    if (props.hasMore) {
      props.onLoadMore();
    }
    listRef.current?.scrollToItem(props.flights.length - 1, "end");
  };

  if (props.flights.length === 0) {
    return (
      <section className="mx-4 flex min-h-80 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center shadow-lift md:mx-6">
        <div>
          <p className="text-lg font-semibold text-ink">No matching flights</p>
          <p className="mt-2 text-sm text-slate-500">Adjust the filters or clear the current search.</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <FlightCards {...props} />
      <section className="relative mx-4 hidden min-h-0 flex-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lift xl:flex xl:flex-col md:mx-6">
        <div
          style={{ gridTemplateColumns: GRID_COLUMNS, minWidth: "max-content" }}
          className="grid gap-2 border-b border-slate-200 bg-slate-900 px-3 py-3 text-xs font-black uppercase text-white shrink-0"
        >
          <input
            type="checkbox"
            aria-label="Select all visible flights"
            checked={allVisibleSelected}
            onChange={props.onSelectAllVisible}
            className="h-4 w-4 rounded border-slate-400"
          />
          <span>ID</span>
          <span>AOC</span>
          <span>Flight</span>
          <span>Route</span>
          <span>Times</span>
          <span>Dates</span>
          <span>Days</span>
          <span>Body</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>

        <div ref={containerRef} className="flex-1 overflow-auto min-h-0" style={{ scrollbarGutter: "stable" }}>
          <div ref={viewportRef} style={{ width: "max-content", minWidth: "100%" }}>
            <List
              ref={listRef}
              height={height}
              itemCount={props.flights.length}
              itemData={itemData}
              itemKey={(index, data) => data.flights[index].id}
              itemSize={ROW_HEIGHT}
              onItemsRendered={({ visibleStopIndex }) => {
                if (props.hasMore && visibleStopIndex >= props.flights.length - 8) {
                  props.onLoadMore();
                }
              }}
              width={width}
            >
              {FlightRow}
            </List>
          </div>
        </div>
        <div className="flex flex-col gap-3 border-t border-slate-200 bg-gradient-to-r from-cyan-50 via-white to-violet-50 px-4 py-3 text-sm font-black text-slate-700 md:flex-row md:items-center md:justify-between shrink-0">
          <span className="text-center md:flex-1">
            <LoadedMessage hasMore={props.hasMore} loadedCount={props.loadedCount} totalCount={props.totalCount} />
          </span>
          <div className="grid grid-cols-2 gap-2 md:flex md:shrink-0">
            <ScrollButton label="Top" onClick={moveToTop} icon={<ArrowUp className="h-4 w-4" />} />
            <ScrollButton label="Bottom" onClick={moveToBottom} icon={<ArrowDown className="h-4 w-4" />} />
          </div>
        </div>
      </section>
    </>
  );
}

function FlightCards(props: FlightTableProps) {
  const { ref, height, width } = useElementSize<HTMLDivElement>(620, 280);
  const listRef = useRef<VariableList>(null);
  const itemData = useMemo(() => props, [props]);
  const compactCards = width >= 420;
  const getCardRowHeight = (index: number) => {
    const editing = props.editingId === props.flights[index]?.id;

    if (editing) {
      return compactCards ? 490 : 690;
    }

    return compactCards ? 392 : 560;
  };
  const moveToTop = () => listRef.current?.scrollToItem(0, "start");
  const moveToBottom = () => {
    if (props.hasMore) {
      props.onLoadMore();
    }
    listRef.current?.scrollToItem(props.flights.length - 1, "end");
  };

  useEffect(() => {
    listRef.current?.resetAfterIndex(0, true);
  }, [props.editingId, width]);

  return (
    <section className="relative mx-3 xl:hidden sm:mx-4" aria-label="Flight cards">
      <div ref={ref} className="h-[calc(100vh-320px)] min-h-[420px]">
        <VariableList
          ref={listRef}
          height={height}
          itemCount={props.flights.length}
          itemData={itemData}
          itemKey={(index, data) => data.flights[index].id}
          itemSize={getCardRowHeight}
          onItemsRendered={({ visibleStopIndex }) => {
            if (props.hasMore && visibleStopIndex >= props.flights.length - 4) {
              props.onLoadMore();
            }
          }}
          width={width}
        >
          {FlightCardRow}
        </VariableList>
      </div>
      <div className="mt-3 grid gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-center text-sm font-black text-slate-700 shadow-soft">
        <LoadedMessage hasMore={props.hasMore} loadedCount={props.loadedCount} totalCount={props.totalCount} />
        <div className="grid grid-cols-2 gap-2">
          <ScrollButton label="Top" onClick={moveToTop} icon={<ArrowUp className="h-4 w-4" />} />
          <ScrollButton label="Bottom" onClick={moveToBottom} icon={<ArrowDown className="h-4 w-4" />} />
        </div>
      </div>
    </section>
  );
}

const FlightCardRow = memo(function FlightCardRow({ index, style, data }: ListChildComponentProps<RowData>) {
  const flight = data.flights[index];
  const editing = data.editingId === flight.id;
  const draft = editing ? data.draft : null;
  const feedback = data.rowFeedback[flight.id];
  const saving = feedback === "saving";
  const invalid = feedback === "invalid";
  const selected = data.selectedIds.has(flight.id);

  return (
    <div style={style} className="px-4 pb-0">
      <article
        className={`rounded-lg border p-4 shadow-lift ${
          selected
            ? "border-cyan-500 bg-cyan-50 ring-2 ring-cyan-100"
            : flight.status === "Inactive"
              ? "border-red-200 bg-red-50"
              : "border-slate-200 bg-white"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <input
              type="checkbox"
              aria-label={`Select ${flight.id}`}
              checked={selected}
              onChange={() => data.onSelect(flight.id)}
              className="mt-1 h-4 w-4"
            />
            <div className="min-w-0">
              <p className="text-sm font-black text-ink">{flight.id}</p>
              <p className="mt-1 break-words text-lg font-black leading-6 text-slate-900">
                {flight.aoc} {flight.flightNumber}
              </p>
              <p className="break-words text-sm font-bold text-slate-600">
                {flight.origin} to {flight.destination}
              </p>
            </div>
          </div>
          <StatusBadge status={flight.status} />
        </div>

        <div className="mt-4 grid gap-3 text-sm min-[420px]:grid-cols-2">
          <MobileField label="Departure time">
            <EditableCell editing={editing} field="std" flight={flight} onDraftChange={data.onDraftChange} type="time" value={draft?.std ?? flight.std} />
          </MobileField>
          <MobileField label="Arrival time">
            <EditableCell editing={editing} field="sta" flight={flight} onDraftChange={data.onDraftChange} type="time" value={draft?.sta ?? flight.sta} />
          </MobileField>
          <MobileField label="Start date">
            <EditableCell editing={editing} field="startDate" flight={flight} onDraftChange={data.onDraftChange} type="date" value={draft?.startDate ?? flight.startDate} />
          </MobileField>
          <MobileField label="End date">
            <EditableCell editing={editing} field="endDate" flight={flight} onDraftChange={data.onDraftChange} type="date" value={draft?.endDate ?? flight.endDate} />
          </MobileField>
        </div>

        <div className="mt-3 grid gap-1 text-sm text-slate-700">
          <p className="break-words">
            <span className="font-bold text-slate-900">Days:</span> {formatDays(flight.daysOfOperation)}
          </p>
          <p>
            <span className="font-bold text-slate-900">Aircraft:</span> {formatBodyType(flight.bodyType)}
          </p>
          {feedback === "error" && <p className="font-bold text-red-700">Save failed. Previous value restored.</p>}
          {invalid && <p className="font-bold text-amber-700">Start date must be before or equal to end date.</p>}
          {saving && <p className="font-bold text-cyan-800">Saving changes...</p>}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
          {editing ? (
            <StatusPicker
              label={`Status for ${flight.id}`}
              value={draft?.status ?? flight.status}
              onChange={(value) => data.onDraftChange("status", value)}
            />
          ) : (
            <ToggleSwitch label={`Toggle status for ${flight.id}`} status={flight.status} onToggle={() => data.onToggleStatus(flight)} />
          )}

          <div className="flex gap-2">
            {editing ? (
              <>
                <IconButton label={`Save ${flight.id}`} tone="success" onClick={() => data.onSave(flight)} disabled={saving}>
                  {saving ? <Check className="h-4 w-4 animate-pulse" /> : <Save className="h-4 w-4" />}
                </IconButton>
                <IconButton label={`Cancel ${flight.id}`} onClick={data.onCancel} disabled={saving}>
                  <X className="h-4 w-4" />
                </IconButton>
              </>
            ) : (
              <>
                <IconButton label={`Edit ${flight.id}`} onClick={() => data.onEdit(flight)}>
                  <Edit3 className="h-4 w-4" />
                </IconButton>
                <IconButton label={`Delete ${flight.id}`} tone="danger" onClick={() => data.onDelete(flight.id)}>
                  <Trash2 className="h-4 w-4" />
                </IconButton>
              </>
            )}
          </div>
        </div>
      </article>
    </div>
  );
});

function MobileField({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="min-w-0 rounded-md bg-slate-50 p-3">
      <p className="text-xs font-black uppercase text-slate-500">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function ScrollButton({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-950 bg-slate-950 px-4 text-sm font-black text-white shadow-sm transition hover:bg-cyan-900"
    >
      {icon}
      {label}
    </button>
  );
}

function StatusPicker({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: FlightStatus) => void;
  value: FlightStatus;
}) {
  return (
    <div className="grid w-full min-w-0 grid-cols-2 rounded-md border border-slate-300 bg-white p-1 shadow-sm" role="group" aria-label={label}>
      {(["Active", "Inactive"] as FlightStatus[]).map((status) => {
        const selected = value === status;

        return (
          <button
            key={status}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(status)}
            className={`h-8 min-w-0 rounded px-1.5 text-[11px] font-black transition ${
              selected
                ? status === "Active"
                  ? "bg-emerald-700 text-white"
                  : "bg-rose-700 text-white"
                : "bg-white text-slate-800 hover:bg-cyan-50 hover:text-cyan-900"
            }`}
          >
            {status}
          </button>
        );
      })}
    </div>
  );
}

function LoadedMessage({
  hasMore,
  loadedCount,
  totalCount,
}: {
  hasMore: boolean;
  loadedCount: number;
  totalCount: number;
}) {
  if (hasMore) {
    return <span>{loadedCount} of {totalCount} matching records loaded</span>;
  }

  if (totalCount <= loadedCount) {
    return <span>Showing all {totalCount} matching records</span>;
  }

  return <span>No more records to load.</span>;
}
