import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@/stores/useAppStore';

const getDaySecondaryText = (date: string | null) => {
  return date ?? 'No fixed date';
};

export default function TripDayNavigationSection() {
  const {
    currentTrip,
    dayItemsByDayNumber,
    days,
    daysError,
    daysStatus,
    selectDay,
    selectedDayNumber,
  } = useAppStore(
    useShallow((state) => ({
      currentTrip: state.currentTrip,
      dayItemsByDayNumber: state.dayItemsByDayNumber,
      days: state.days,
      daysError: state.daysError,
      daysStatus: state.daysStatus,
      selectDay: state.selectDay,
      selectedDayNumber: state.selectedDayNumber,
    })),
  );

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-gray-700">Days</h2>
        <p className="mt-1 text-sm text-gray-500">Choose a day to view its itinerary and route.</p>
      </div>

      <div className="space-y-3">
        {daysStatus === 'loading' ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
            Loading days for this trip.
          </div>
        ) : null}

        {daysStatus === 'error' ? (
          <div className="rounded-xl border border-dashed border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {daysError ?? 'Failed to load days for this trip.'}
          </div>
        ) : null}

        {daysStatus === 'ready' && days.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
            No days are available for this trip yet.
          </div>
        ) : null}

        {days.map((day) => {
          const isSelected = day.dayNumber === selectedDayNumber;
          const dayCacheKey = currentTrip ? `${currentTrip.tripId}:${day.dayNumber}` : null;
          const itineraryCount = dayCacheKey ? (dayItemsByDayNumber[dayCacheKey]?.length ?? 0) : 0;
          const itineraryCountLabel =
            itineraryCount === 1 ? '1 itinerary' : `${itineraryCount} itineraries`;

          return (
            <button
              type="button"
              key={day.dayNumber}
              onClick={() => selectDay(day.dayNumber)}
              className={`w-full rounded-2xl border px-4 py-3 text-left shadow-sm ${
                isSelected
                  ? 'border-blue-200 bg-blue-50/60'
                  : 'border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/30'
              }`}
              aria-pressed={isSelected}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-gray-900">Day {day.dayNumber}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                    <span>{getDaySecondaryText(day.date)}</span>
                    <span className={isSelected ? 'text-blue-700' : 'text-slate-500'}>
                      {itineraryCountLabel}
                    </span>
                  </div>
                </div>
                {isSelected ? (
                  <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-medium text-blue-700">
                    Selected
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
