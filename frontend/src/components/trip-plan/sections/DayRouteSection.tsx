import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@/stores/useAppStore';
import type { DayRouteSegment, ItineraryItem } from '@/api/tripApi';
import DayRouteSummaryCard from '@/components/trip-plan/route/DayRouteSummaryCard';
import RouteSegmentList from '@/components/trip-plan/route/RouteSegmentList';
import {
  getLongRouteWarningMessage,
  getRouteEmptyStateMessage,
  shouldShowLongRouteWarning,
} from '@/components/trip-plan/route/routePresentation';

const EMPTY_DAY_ITEMS: ItineraryItem[] = [];
const EMPTY_DAY_ROUTE_SEGMENTS: DayRouteSegment[] = [];

export default function DayRouteSection() {
  const {
    currentTrip,
    dayItemsByDayNumber,
    dayItemsStatusByDayNumber,
    dayRouteByDayNumber,
    dayRouteErrorByDayNumber,
    dayRouteSegmentsByDayNumber,
    dayRouteStatusByDayNumber,
    selectedDayNumber,
  } = useAppStore(
    useShallow((state) => ({
      currentTrip: state.currentTrip,
      dayItemsByDayNumber: state.dayItemsByDayNumber,
      dayItemsStatusByDayNumber: state.dayItemsStatusByDayNumber,
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
    selectedDayNumber !== null
      ? (dayRouteSegmentsByDayNumber[selectedDayNumber] ?? EMPTY_DAY_ROUTE_SEGMENTS)
      : EMPTY_DAY_ROUTE_SEGMENTS;
  const currentDayItems =
    selectedDayNumber !== null
      ? (dayItemsByDayNumber[selectedDayNumber] ?? EMPTY_DAY_ITEMS)
      : EMPTY_DAY_ITEMS;
  const currentDayItemsStatus =
    selectedDayNumber !== null ? (dayItemsStatusByDayNumber[selectedDayNumber] ?? 'idle') : 'idle';
  const currentDayItemCount = currentDayItems.length;
  const routeEmptyStateMessage = getRouteEmptyStateMessage({
    currentDayItemCount,
    currentDayItemsStatus,
    selectedDayNumber,
  });

  const itemsById = useMemo(() => {
    return Object.fromEntries(currentDayItems.map((item) => [item.itemId, item]));
  }, [currentDayItems]);
  const showLongRouteWarning = shouldShowLongRouteWarning(currentDayRouteSummary);

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-gray-700">Selected Day Route</h2>
        <p className="mt-1 text-sm text-gray-500">
          Travel time and route details for the selected day.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-4 py-3 text-sm text-gray-500">
          {selectedDayNumber !== null
            ? `Day ${selectedDayNumber} route`
            : 'Select a day to view route details.'}
        </div>

        {!currentTrip || selectedDayNumber === null ? (
          <div className="px-4 py-4 text-sm text-gray-500">
            Create or load a trip, then choose a day to view route details.
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
          <div className="px-4 py-4 text-sm text-gray-500">{routeEmptyStateMessage}</div>
        ) : null}

        {currentTrip && selectedDayNumber !== null && currentDayRouteSummary !== null ? (
          <>
            <DayRouteSummaryCard routeSummary={currentDayRouteSummary} />

            {showLongRouteWarning ? (
              <div className="border-t border-amber-100 bg-amber-50/80 px-4 py-3 text-sm text-amber-800">
                {getLongRouteWarningMessage()}
              </div>
            ) : null}

            <div className="border-t border-gray-100 px-4 py-3">
              <h3 className="text-sm font-semibold text-gray-700">Route Segments</h3>
            </div>

            {currentDaySegments.length === 0 ? (
              <div className="px-4 pb-4 text-sm text-gray-500">
                {`Route summary is ready, but no segment rows were returned for Day ${selectedDayNumber}.`}
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
