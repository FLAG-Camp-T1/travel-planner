import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@/stores/useAppStore';
import ItineraryList from '@/components/trip-plan/itinerary/ItineraryList';
import {
  getGenerateRouteButtonLabel,
  getItineraryStatusMessage,
} from '@/components/trip-plan/itinerary/itinerarySectionPresentation';

export default function ItinerarySection() {
  const {
    currentTrip,
    dayItemsByDayNumber,
    dayItemsErrorByDayNumber,
    dayItemsStatusByDayNumber,
    dayRouteStatusByDayNumber,
    fetchDayItems,
    generateDayRoute,
    selectedDayNumber,
  } = useAppStore(
    useShallow((state) => ({
      currentTrip: state.currentTrip,
      dayItemsByDayNumber: state.dayItemsByDayNumber,
      dayItemsErrorByDayNumber: state.dayItemsErrorByDayNumber,
      dayItemsStatusByDayNumber: state.dayItemsStatusByDayNumber,
      dayRouteStatusByDayNumber: state.dayRouteStatusByDayNumber,
      fetchDayItems: state.fetchDayItems,
      generateDayRoute: state.generateDayRoute,
      selectedDayNumber: state.selectedDayNumber,
    })),
  );

  useEffect(() => {
    if (!currentTrip || selectedDayNumber === null) {
      return;
    }

    void fetchDayItems(currentTrip.tripId, selectedDayNumber);
  }, [currentTrip, fetchDayItems, selectedDayNumber]);

  const currentDayStatus =
    selectedDayNumber !== null ? (dayItemsStatusByDayNumber[selectedDayNumber] ?? 'idle') : 'idle';
  const currentDayError =
    selectedDayNumber !== null ? (dayItemsErrorByDayNumber[selectedDayNumber] ?? null) : null;
  const currentDayItems =
    selectedDayNumber !== null ? (dayItemsByDayNumber[selectedDayNumber] ?? []) : [];
  const currentDayRouteStatus =
    selectedDayNumber !== null ? (dayRouteStatusByDayNumber[selectedDayNumber] ?? 'idle') : 'idle';
  const tripReady = currentTrip !== null;
  const hasDisplayableRoute =
    selectedDayNumber !== null &&
    (dayRouteStatusByDayNumber[selectedDayNumber] ?? 'idle') === 'ready';
  const canGenerateRoute =
    tripReady &&
    selectedDayNumber !== null &&
    currentDayStatus === 'ready' &&
    currentDayItems.length >= 2 &&
    currentDayRouteStatus !== 'loading' &&
    !hasDisplayableRoute;
  const generateRouteButtonLabel = getGenerateRouteButtonLabel({
    currentDayItemCount: currentDayItems.length,
    currentDayRouteStatus,
    currentDayStatus,
    hasDisplayableRoute,
    selectedDayNumber,
    tripReady,
  });
  const itineraryStatusMessage = getItineraryStatusMessage({
    currentDayItemCount: currentDayItems.length,
    currentDayRouteStatus,
    currentDayStatus,
    hasDisplayableRoute,
    selectedDayNumber,
    tripReady,
  });

  const handleGenerateRoute = () => {
    if (!currentTrip || selectedDayNumber === null || !canGenerateRoute) {
      return;
    }

    void generateDayRoute(currentTrip.tripId, selectedDayNumber);
  };

  return (
    <section className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-700">Selected Day Itinerary</h2>
          <p className="mt-1 text-sm text-gray-500">View the stops planned for the selected day.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={handleGenerateRoute}
            disabled={!canGenerateRoute}
            className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 disabled:shadow-none"
          >
            {generateRouteButtonLabel}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-4 py-3 text-sm text-gray-500">
          {itineraryStatusMessage}
        </div>

        {!tripReady || selectedDayNumber === null ? (
          <div className="px-4 py-4 text-sm text-gray-500">
            Create or load a trip, then choose a day to view its itinerary.
          </div>
        ) : null}

        {tripReady &&
        selectedDayNumber !== null &&
        (currentDayStatus === 'idle' || currentDayStatus === 'loading') ? (
          <div className="px-4 py-4 text-sm text-gray-500">
            Loading itinerary items for Day {selectedDayNumber}.
          </div>
        ) : null}

        {tripReady && selectedDayNumber !== null && currentDayStatus === 'error' ? (
          <div className="px-4 py-4 text-sm text-red-600">
            {currentDayError ?? `Failed to load itinerary items for Day ${selectedDayNumber}.`}
          </div>
        ) : null}

        {tripReady &&
        selectedDayNumber !== null &&
        currentDayStatus === 'ready' &&
        currentDayItems.length === 0 ? (
          <div className="px-4 py-4 text-sm text-gray-500">
            Day {selectedDayNumber} does not have any itinerary items yet.
          </div>
        ) : null}

        {tripReady &&
        selectedDayNumber !== null &&
        currentDayStatus === 'ready' &&
        currentDayItems.length > 0 ? (
          <ItineraryList items={currentDayItems} />
        ) : null}
      </div>
    </section>
  );
}
