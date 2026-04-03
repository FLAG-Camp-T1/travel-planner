const previewDays = [
  {
    dayLabel: 'Day 1',
    secondaryText: 'No fixed date',
    summary: '2 planned stops',
    isPreviewSelected: true,
  },
  {
    dayLabel: 'Day 2',
    secondaryText: 'No fixed date',
    summary: 'Route not generated',
    isPreviewSelected: false,
  },
  {
    dayLabel: 'Day 3',
    secondaryText: 'No fixed date',
    summary: 'No places added yet',
    isPreviewSelected: false,
  },
];

export default function TripDayNavigationSection() {
  return (
    <section className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-700">Day Navigation</h2>
          <p className="mt-1 text-sm text-gray-500">
            Preview only. These day entries illustrate the future sidebar structure.
          </p>
        </div>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
          Static Preview
        </span>
      </div>

      <div className="space-y-3">
        {previewDays.map((day) => (
          <div
            key={day.dayLabel}
            className={`rounded-2xl border px-4 py-3 shadow-sm ${
              day.isPreviewSelected ? 'border-blue-200 bg-blue-50/60' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-gray-900">{day.dayLabel}</div>
                <div className="mt-1 text-xs text-gray-500">{day.secondaryText}</div>
              </div>
              {day.isPreviewSelected ? (
                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-medium text-blue-700">
                  Current Preview
                </span>
              ) : null}
            </div>

            <div className="mt-3 text-sm text-gray-600">{day.summary}</div>
          </div>
        ))}

        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
          Day creation controls will be introduced only after real trip data and trip-creation flow
          are added in a later phase.
        </div>
      </div>
    </section>
  );
}
