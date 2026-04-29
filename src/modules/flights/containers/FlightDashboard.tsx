import { AlertTriangle } from "lucide-react";
import { FlightTable } from "../components/FlightTable";
import { FlightToolbar } from "../components/FlightToolbar";
import { LoadingState } from "../components/LoadingState";
import { SummaryStrip } from "../components/SummaryStrip";
import { useFlightSchedule } from "../hooks/useFlightSchedule";

export function FlightDashboard() {
  const schedule = useFlightSchedule();

  if (schedule.isLoading) {
    return <LoadingState />;
  }

  if (schedule.loadError) {
    return (
      <main className="grid min-h-screen place-items-center bg-cloud p-6">
        <div className="w-full max-w-lg rounded-md border border-red-100 bg-white p-6 text-center shadow-soft">
          <AlertTriangle className="mx-auto h-8 w-8 text-red-600" />
          <h1 className="mt-3 text-xl font-bold text-ink">Unable to load schedules</h1>
          <p className="mt-2 text-sm text-slate-600">{schedule.loadError}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-cloud">
      <header className="border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(8,145,178,0.18),_transparent_34%),linear-gradient(135deg,#ffffff_0%,#eef6ff_52%,#f8fafc_100%)] px-4 py-6 md:px-6 lg:py-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-cyan-800">Teleport Ops</p>
            <h1 className="mt-2 max-w-3xl text-3xl font-black text-ink sm:text-4xl">
              Flight Schedule Management
            </h1>
          </div>
          <p className="max-w-xl text-sm font-medium leading-6 text-slate-700">
            Manage operational windows, status changes, schedule edits, and filtered deletion from a virtualized dataset.
          </p>
        </div>
      </header>

      <SummaryStrip
        active={schedule.stats.active}
        filtered={schedule.filteredCount}
        inactive={schedule.stats.inactive}
        total={schedule.stats.total}
        wideBody={schedule.stats.wideBody}
      />

      <FlightToolbar
        aocOptions={schedule.aocOptions}
        filters={schedule.filters}
        onClear={schedule.clearFilters}
        onDeleteSelected={schedule.deleteSelected}
        onFilterChange={schedule.updateFilter}
        onSearchChange={schedule.setSearch}
        search={schedule.search}
        selectedCount={schedule.selectedIds.size}
      />

      <div className="min-h-0 flex-1 py-4">
        <FlightTable
          draft={schedule.draft}
          editingId={schedule.editingId}
          flights={schedule.visibleFlights}
          hasMore={schedule.hasMore}
          loadedCount={schedule.visibleFlights.length}
          onLoadMore={schedule.loadMore}
          onCancel={schedule.cancelEditing}
          onDelete={schedule.deleteFlight}
          onDraftChange={schedule.updateDraft}
          onEdit={schedule.startEditing}
          onSave={schedule.saveDraft}
          onSelect={schedule.toggleSelected}
          onSelectAllVisible={schedule.toggleAllVisible}
          onToggleStatus={schedule.toggleStatus}
          rowFeedback={schedule.rowFeedback}
          selectedIds={schedule.selectedIds}
          selectedVisibleCount={schedule.selectedVisibleCount}
          totalCount={schedule.filteredCount}
        />
      </div>
    </main>
  );
}
