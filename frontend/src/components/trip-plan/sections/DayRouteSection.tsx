import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@/stores/useAppStore';
import DayRouteSummaryCard from '@/components/trip-plan/route/DayRouteSummaryCard';
import RouteSegmentList from '@/components/trip-plan/route/RouteSegmentList';

export default function DayRouteSection() {
  const {
    currentTrip,
    dayItemsByDayNumber,
    dayRouteByDayNumber,
    dayRouteErrorByDayNumber,
    dayRouteSegmentsByDayNumber,
    dayRouteStatusByDayNumber,
    selectedDayNumber,
  } = useAppStore(
    useShallow((state) => ({
      currentTrip: state.currentTrip,
      dayItemsByDayNumber: state.dayItemsByDayNumber,
      dayRouteByDayNumber: state.dayRouteByDayNumber,
      dayRouteErrorByDayNumber: state.dayRouteErrorByDayNumber,
      dayRouteSegmentsByDayNumber: state.dayRouteSegmentsByDayNumber,
      dayRouteStatusByDayNumber: state.dayRouteStatusByDayNumber,
      selectedDayNumber: state.selectedDayNumber,
    })),
  );

  const currentDayRouteStatus =
    selectedDayNumber !== null ? (dayRouteStatusByDayNumber[selectedDayNumber] ?? 'idle') : 'idle';
  const currentDayRouteError =
    selectedDayNumber !== null ? (dayRouteErrorByDayNumber[selectedDayNumber] ?? null) : null;
  const currentDayRouteSummary =
    selectedDayNumber !== null ? (dayRouteByDayNumber[selectedDayNumber] ?? null) : null;
  const currentDaySegments =
    selectedDayNumber !== null ? (dayRouteSegmentsByDayNumber[selectedDayNumber] ?? []) : [];

  const itemsById = useMemo(() => {
    const currentDayItems =
      selectedDayNumber !== null ? (dayItemsByDayNumber[selectedDayNumber] ?? []) : [];

    return Object.fromEntries(currentDayItems.map((item) => [item.itemId, item]));
  }, [dayItemsByDayNumber, selectedDayNumber]);

  return (
    <section className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-700">Selected Day Route</h2>
          <p className="mt-1 text-sm text-gray-500">
            Route results for the selected day appear here after an explicit generation request.
          </p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          Route Output
        </span>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-4 py-3 text-sm text-gray-500">
          {selectedDayNumber !== null
            ? `Showing route state for Day ${selectedDayNumber}.`
            : 'Waiting for planner context before resolving selected-day route state.'}
        </div>

        {!currentTrip || selectedDayNumber === null ? (
          <div className="px-4 py-4 text-sm text-gray-500">
            Planner context is not ready yet. Route output will appear once a trip and selected day
            are available.
          </div>
        ) : null}

        {currentTrip && selectedDayNumber !== null && currentDayRouteStatus === 'loading' ? (
          <div className="px-4 py-4 text-sm text-gray-500">
            Generating route data for Day {selectedDayNumber}.
          </div>
        ) : null}

        {currentTrip && selectedDayNumber !== null && currentDayRouteStatus === 'error' ? (
          <div className="px-4 py-4 text-sm text-red-600">
            {currentDayRouteError ?? `Failed to generate route data for Day ${selectedDayNumber}.`}
          </div>
        ) : null}

        {currentTrip &&
        selectedDayNumber !== null &&
        currentDayRouteSummary === null &&
        currentDayRouteStatus !== 'loading' &&
        currentDayRouteStatus !== 'error' ? (
          <div className="px-4 py-4 text-sm text-gray-500">
            Day {selectedDayNumber} does not have route data yet. Use the itinerary section to
            generate a route.
          </div>
        ) : null}

        {currentTrip && selectedDayNumber !== null && currentDayRouteSummary !== null ? (
          <>
            <DayRouteSummaryCard routeSummary={currentDayRouteSummary} />

            <div className="border-t border-gray-100 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-gray-700">Route Segments</h3>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                  Read-only
                </span>
              </div>
            </div>

            {currentDaySegments.length === 0 ? (
              <div className="px-4 pb-4 text-sm text-gray-500">
                Route summary is ready, but no segment rows were returned for Day{' '}
                {selectedDayNumber}.
              </div>
            ) : (
              <RouteSegmentList itemsById={itemsById} segments={currentDaySegments} />
            )}
          </>
        ) : null}
      </div>
    </section>
  );
}
