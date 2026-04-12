import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import SectionInfoHint from '@/components/trip-plan/SectionInfoHint';
import { useAppStore } from '@/stores/useAppStore';
import { buildTripDayCalendarModel } from './tripDayCalendarPresentation';

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

  const itineraryCountByDayNumber = useMemo(() => {
    if (!currentTrip) {
      return {};
    }

    return Object.fromEntries(
      days.map((day) => {
        const dayCacheKey = `${currentTrip.tripId}:${day.dayNumber}`;
        const itineraryCount = dayItemsByDayNumber[dayCacheKey]?.length ?? 0;
        return [day.dayNumber, itineraryCount];
      }),
    );
  }, [currentTrip, dayItemsByDayNumber, days]);

  const calendarModel = useMemo(() => {
    return buildTripDayCalendarModel({
      days,
      itineraryCountByDayNumber,
      selectedDayNumber,
    });
  }, [days, itineraryCountByDayNumber, selectedDayNumber]);

  const dayCellSizeClassName = calendarModel.showWeekdayHeader
    ? 'aspect-square w-full min-h-0'
    : 'h-[3.7rem] w-full';

  return (
    <section className="space-y-3">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-700">Days</h2>
          <SectionInfoHint tooltip="Choose a day to view and edit its itinerary and route details." />
        </div>
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

        {daysStatus === 'ready' && days.length > 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            {calendarModel.showWeekdayHeader ? (
              <div className="mb-2 grid grid-cols-7 gap-2">
                {calendarModel.weekdayLetters.map((weekdayLetter, index) => (
                  <div
                    key={`${weekdayLetter}-${index}`}
                    className="text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400"
                  >
                    {weekdayLetter}
                  </div>
                ))}
              </div>
            ) : null}

            <div
              className={`grid ${calendarModel.gridColumnClassName} gap-2`}
              style={
                calendarModel.showWeekdayHeader
                  ? undefined
                  : {
                      gridTemplateColumns: 'repeat(auto-fit, minmax(2.75rem, 1fr))',
                    }
              }
            >
              {calendarModel.cells.map((cell) => {
                if (cell.isPlaceholder) {
                  return (
                    <div
                      key={cell.key}
                      aria-hidden="true"
                      className={`${dayCellSizeClassName} rounded-lg border border-transparent`}
                    />
                  );
                }

                const [itineraryCountValue, itineraryCountUnit = 'stops'] =
                  cell.itineraryCountLabel.split(' ', 2);

                return (
                  <button
                    type="button"
                    key={cell.key}
                    onClick={() => selectDay(cell.dayNumber)}
                    title={cell.dateLabel}
                    aria-label={`Day ${cell.dayNumber}, ${cell.itineraryCountLabel}, ${cell.dateLabel}`}
                    className={`${dayCellSizeClassName} block rounded-md border px-1.5 py-1.5 text-center transition-colors ${
                      cell.isSelected
                        ? 'border-blue-200 bg-blue-50'
                        : 'border-transparent bg-transparent hover:border-slate-200 hover:bg-slate-50'
                    }`}
                    aria-pressed={cell.isSelected}
                  >
                    <div className="flex h-full w-full flex-col items-center justify-center gap-0.5 overflow-hidden">
                      <div
                        className={`text-[8px] font-semibold uppercase tracking-[0.12em] leading-none ${
                          cell.isSelected ? 'text-blue-500' : 'text-gray-400'
                        }`}
                      >
                        Day
                      </div>
                      <div
                        className={`text-sm font-semibold leading-none ${
                          cell.isSelected ? 'text-blue-800' : 'text-gray-700'
                        }`}
                      >
                        {cell.dayNumber}
                      </div>
                      <div
                        className={`text-[9px] font-medium leading-none tracking-tight ${
                          cell.isSelected ? 'text-blue-700' : 'text-slate-500'
                        }`}
                      >
                        <span>{itineraryCountValue}</span>{' '}
                        <span className={cell.isSelected ? 'text-blue-500' : 'text-slate-400'}>
                          {itineraryCountUnit}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
