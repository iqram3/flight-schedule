export function LoadingState() {
  return (
    <div className="grid min-h-screen place-items-center bg-cloud p-6">
      <div className="w-full max-w-sm rounded-md border border-slate-200 bg-white p-6 text-center shadow-soft">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-runway" />
        <p className="mt-4 text-sm font-medium text-slate-700">Loading flight schedules</p>
      </div>
    </div>
  );
}
