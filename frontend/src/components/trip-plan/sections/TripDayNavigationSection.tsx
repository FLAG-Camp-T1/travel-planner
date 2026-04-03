export default function TripDayNavigationSection() {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-700">Day Navigation</h2>

      <div className="space-y-3">
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
          Day navigation entries will appear here once trip days are available in a later phase.
        </div>

        <div className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-3 text-sm text-gray-500">
          Day creation controls will be added after the Trip Plan flow starts managing real day
          data.
        </div>
      </div>
    </section>
  );
}
