import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@/stores/useAppStore';

const getDaySecondaryText = (date: string | null) => {
  return date ?? 'No fixed date';
};

export default function TripDayNavigationSection() {
  const { days, daysError, daysStatus, selectedDayNumber } = useAppStore(
    useShallow((state) => ({
      days: state.days,
      daysError: state.daysError,
      daysStatus: state.daysStatus,
      selectedDayNumber: state.selectedDayNumber,
    })),
  );

  return (
    <section className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-700">Day Navigation</h2>
          <p className="mt-1 text-sm text-gray-500">
            Read-only day entries from the current mock trip bootstrap. Day switching is not enabled
            yet.
          </p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          Read-Only Data
        </span>
      </div>

      <div className="space-y-3">
        {daysStatus === 'loading' ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
            Loading day structure from the current trip.
          </div>
        ) : null}

        {daysStatus === 'error' ? (
          <div className="rounded-xl border border-dashed border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {daysError ?? 'Failed to load day structure.'}
          </div>
        ) : null}

        {daysStatus === 'ready' && days.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
            No days are available for the current trip yet.
          </div>
        ) : null}

        {days.map((day) => {
          const isSelected = day.dayNumber === selectedDayNumber;

          return (
            <div
              key={day.dayNumber}
              className={`rounded-2xl border px-4 py-3 shadow-sm ${
                isSelected ? 'border-blue-200 bg-blue-50/60' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-gray-900">Day {day.dayNumber}</div>
                  <div className="mt-1 text-xs text-gray-500">{getDaySecondaryText(day.date)}</div>
                </div>
                {isSelected ? (
                  <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-medium text-blue-700">
                    Current Read-Only Day
                  </span>
                ) : null}
              </div>

              <div className="mt-3 text-sm text-gray-600">
                {isSelected
                  ? 'This is the default selected day from trip bootstrap. Interactive day switching will arrive in a later phase.'
                  : 'Additional day-level itinerary and route details will be connected in later phases.'}
              </div>
            </div>
          );
        })}

        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
          Day creation controls will be introduced only after real trip data and trip-creation flow
          are added in a later phase.
        </div>
      </div>
    </section>
  );
}
