import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_FILTERS, VISIBLE_BATCH_SIZE } from "../constants";
import { getFlights } from "../services/flightRepository";
import { saveFlightChanges } from "../services/saveFlight";
import type { EditableFlightFields, Flight, FlightFilters, FlightStatus } from "../types";
import { filterFlights } from "../utils/filterFlights";

type RowFeedback = "saving" | "error" | "invalid";

const toEditableFields = (flight: Flight): EditableFlightFields => ({
  startDate: flight.startDate,
  endDate: flight.endDate,
  std: flight.std,
  sta: flight.sta,
  status: flight.status,
});

export function useFlightSchedule() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filters, setFilters] = useState<FlightFilters>({ ...DEFAULT_FILTERS });
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditableFlightFields | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [rowFeedback, setRowFeedback] = useState<Record<string, RowFeedback | undefined>>({});
  const [visibleLimit, setVisibleLimit] = useState(VISIBLE_BATCH_SIZE);
  const deferredSearch = useDeferredValue(search);
  const saveRequestIds = useRef<Record<string, number>>({});
  const editingIdRef = useRef<string | null>(null);

  useEffect(() => {
    editingIdRef.current = editingId;
  }, [editingId]);

  useEffect(() => {
    let isMounted = true;

    getFlights()
      .then((dataset) => {
        if (isMounted) {
          setFlights(dataset.flights);
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setLoadError(error instanceof Error ? error.message : "Flight data failed to load.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredFlights = useMemo(
    () => filterFlights(flights, filters, deferredSearch),
    [flights, filters, deferredSearch],
  );

  useEffect(() => {
    setVisibleLimit(VISIBLE_BATCH_SIZE);
  }, [deferredSearch, filters]);

  const visibleFlights = useMemo(
    () => filteredFlights.slice(0, visibleLimit),
    [filteredFlights, visibleLimit],
  );

  const hasMore = visibleLimit < filteredFlights.length;

  const loadMore = useCallback(() => {
    setVisibleLimit((current) => Math.min(current + VISIBLE_BATCH_SIZE, filteredFlights.length));
  }, [filteredFlights.length]);

  const aocOptions = useMemo(
    () => Array.from(new Set(flights.map((flight) => flight.aoc))).sort(),
    [flights],
  );

  const stats = useMemo(() => {
    const active = flights.filter((flight) => flight.status === "Active").length;
    const wideBody = flights.filter((flight) => flight.bodyType === "wide_body").length;

    return {
      total: flights.length,
      active,
      inactive: flights.length - active,
      wideBody,
    };
  }, [flights]);

  const selectedVisibleCount = useMemo(
    () => visibleFlights.filter((flight) => selectedIds.has(flight.id)).length,
    [visibleFlights, selectedIds],
  );

  const updateFilter = useCallback(<K extends keyof FlightFilters>(key: K, value: FlightFilters[K]) => {
    setFilters((current) => ({ ...current, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS });
    setSearch("");
  }, []);

  const startEditing = useCallback((flight: Flight) => {
    if (rowFeedback[flight.id] === "saving") {
      return;
    }

    setEditingId(flight.id);
    setDraft(toEditableFields(flight));
    setRowFeedback((current) => ({ ...current, [flight.id]: undefined }));
  }, [rowFeedback]);

  const cancelEditing = useCallback(() => {
    setEditingId(null);
    setDraft(null);
  }, []);

  const updateDraft = useCallback(<K extends keyof EditableFlightFields>(
    key: K,
    value: EditableFlightFields[K],
  ) => {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  }, []);

  const saveDraft = useCallback(
    async (flight: Flight) => {
      if (!draft) {
        return;
      }

      if (draft.startDate > draft.endDate) {
        setRowFeedback((current) => ({ ...current, [flight.id]: "invalid" }));
        return;
      }

      const previous = flight;
      const requestId = (saveRequestIds.current[flight.id] ?? 0) + 1;
      saveRequestIds.current[flight.id] = requestId;
      setRowFeedback((current) => ({ ...current, [flight.id]: "saving" }));

      try {
        const saved = await saveFlightChanges(flight, draft);
        if (saveRequestIds.current[flight.id] !== requestId) {
          return;
        }

        setFlights((current) => current.map((item) => (item.id === flight.id ? saved : item)));
        setEditingId((current) => (current === flight.id ? null : current));
        setDraft((current) => (editingIdRef.current === flight.id ? null : current));
        setRowFeedback((current) => ({ ...current, [flight.id]: undefined }));
      } catch {
        if (saveRequestIds.current[flight.id] !== requestId) {
          return;
        }

        setFlights((current) => current.map((item) => (item.id === flight.id ? previous : item)));
        setRowFeedback((current) => ({ ...current, [flight.id]: "error" }));
      }
    },
    [draft],
  );

  const toggleStatus = useCallback((flight: Flight) => {
    const nextStatus: FlightStatus = flight.status === "Active" ? "Inactive" : "Active";
    setFlights((current) =>
      current.map((item) => (item.id === flight.id ? { ...item, status: nextStatus } : item)),
    );
  }, []);

  const deleteFlight = useCallback((flightId: string) => {
    saveRequestIds.current[flightId] = (saveRequestIds.current[flightId] ?? 0) + 1;
    setFlights((current) => current.filter((flight) => flight.id !== flightId));
    setEditingId((current) => (current === flightId ? null : current));
    setDraft((current) => (editingIdRef.current === flightId ? null : current));
    setSelectedIds((current) => {
      const next = new Set(current);
      next.delete(flightId);
      return next;
    });
    setRowFeedback((current) => ({ ...current, [flightId]: undefined }));
  }, []);

  const toggleSelected = useCallback((flightId: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(flightId)) {
        next.delete(flightId);
      } else {
        next.add(flightId);
      }
      return next;
    });
  }, []);

  const toggleAllVisible = useCallback(() => {
    setSelectedIds((current) => {
      const next = new Set(current);
      const allVisibleSelected = visibleFlights.every((flight) => next.has(flight.id));

      visibleFlights.forEach((flight) => {
        if (allVisibleSelected) {
          next.delete(flight.id);
        } else {
          next.add(flight.id);
        }
      });

      return next;
    });
  }, [visibleFlights]);

  const deleteSelected = useCallback(() => {
    selectedIds.forEach((id) => {
      saveRequestIds.current[id] = (saveRequestIds.current[id] ?? 0) + 1;
    });
    setFlights((current) => current.filter((flight) => !selectedIds.has(flight.id)));
    setEditingId((current) => (current && selectedIds.has(current) ? null : current));
    setDraft((current) => (editingIdRef.current && selectedIds.has(editingIdRef.current) ? null : current));
    setRowFeedback((current) => {
      const next = { ...current };
      selectedIds.forEach((id) => {
        next[id] = undefined;
      });
      return next;
    });
    setSelectedIds(new Set());
  }, [selectedIds]);

  return {
    aocOptions,
    clearFilters,
    deleteFlight,
    deleteSelected,
    draft,
    editingId,
    filteredFlights,
    filters,
    filteredCount: filteredFlights.length,
    hasMore,
    isLoading,
    loadMore,
    loadError,
    rowFeedback,
    saveDraft,
    search,
    selectedIds,
    selectedVisibleCount,
    setSearch,
    startEditing,
    cancelEditing,
    stats,
    toggleAllVisible,
    toggleSelected,
    toggleStatus,
    updateDraft,
    updateFilter,
    visibleFlights,
  };
}
