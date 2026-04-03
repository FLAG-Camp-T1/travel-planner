export default function TripOverviewSection() {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-700">Trip Overview</h2>

      <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-base font-semibold text-gray-900">Spring DC Trip</div>
            <div className="mt-1 text-sm text-gray-500">
              Static preview surface for the future trip summary
            </div>
          </div>

          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            Flexible
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-gray-50 px-3 py-2">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Duration
            </div>
            <div className="mt-1 text-sm font-medium text-gray-700">3 days</div>
          </div>

          <div className="rounded-xl bg-gray-50 px-3 py-2">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Start Date
            </div>
            <div className="mt-1 text-sm font-medium text-gray-700">No fixed start date</div>
          </div>
        </div>
      </div>
    </section>
  );
}
