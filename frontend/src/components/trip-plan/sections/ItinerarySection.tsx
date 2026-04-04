import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@/stores/useAppStore';
import ItineraryList from '@/components/trip-plan/itinerary/ItineraryList';

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
  const hasDisplayableRoute =
    selectedDayNumber !== null &&
    (dayRouteStatusByDayNumber[selectedDayNumber] ?? 'idle') === 'ready';
  const canGenerateRoute =
    currentTrip !== null &&
    selectedDayNumber !== null &&
    currentDayStatus === 'ready' &&
    currentDayItems.length >= 2 &&
    currentDayRouteStatus !== 'loading' &&
    !hasDisplayableRoute;
  const generateRouteButtonLabel = (() => {
    if (currentTrip === null || selectedDayNumber === null) {
      return 'Generate Route';
    }

    if (currentDayStatus === 'error') {
      return 'Route Unavailable';
    }

    if (currentDayRouteStatus === 'loading') {
      return 'Generating Route';
    }

    if (hasDisplayableRoute) {
      return 'Route Ready';
    }

    if (currentDayStatus !== 'ready') {
      return 'Loading Itinerary';
    }

    if (currentDayItems.length === 0) {
      return 'No Itinerary Yet';
    }

    if (currentDayItems.length === 1) {
      return 'Route Not Needed';
    }

    return 'Generate Route';
  })();
  const itineraryStatusMessage = (() => {
    if (selectedDayNumber === null) {
      return 'Waiting for the planner context to determine a selected day.';
    }

    if (currentTrip === null) {
      return 'Route generation will stay disabled until the planner context is ready.';
    }

    if (currentDayStatus === 'idle' || currentDayStatus === 'loading') {
      return `Loading itinerary items for Day ${selectedDayNumber}.`;
    }

    if (currentDayStatus === 'error') {
      return `Itinerary data for Day ${selectedDayNumber} failed to load. Route generation stays unavailable until the request succeeds.`;
    }

    if (currentDayRouteStatus === 'loading') {
      return `Generating route data for Day ${selectedDayNumber}.`;
    }

    if (hasDisplayableRoute) {
      return `Day ${selectedDayNumber} already has generated route data. Route display will appear in a dedicated section.`;
    }

    if (currentDayItems.length === 0) {
      return `Day ${selectedDayNumber} has no itinerary items yet. Route generation becomes available after at least two stops exist.`;
    }

    if (currentDayItems.length === 1) {
      return `Day ${selectedDayNumber} has one itinerary item, so no between-stop route is needed.`;
    }

    return `Showing itinerary data for Day ${selectedDayNumber}. Route generation is available from this section header.`;
  })();

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
          <p className="mt-1 text-sm text-gray-500">
            This section is now the only UI entrypoint that loads or reuses itinerary items for the
            currently selected day.
          </p>
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
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            Selected-Day Data
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-4 py-3 text-sm text-gray-500">
          {itineraryStatusMessage}
        </div>

        {!currentTrip || selectedDayNumber === null ? (
          <div className="px-4 py-4 text-sm text-gray-500">
            Planner context is not ready yet. The itinerary will appear once a trip and selected day
            are available.
          </div>
        ) : null}

        {currentTrip &&
        selectedDayNumber !== null &&
        (currentDayStatus === 'idle' || currentDayStatus === 'loading') ? (
          <div className="px-4 py-4 text-sm text-gray-500">
            Loading itinerary items for Day {selectedDayNumber}.
          </div>
        ) : null}

        {currentTrip && selectedDayNumber !== null && currentDayStatus === 'error' ? (
          <div className="px-4 py-4 text-sm text-red-600">
            {currentDayError ?? `Failed to load itinerary items for Day ${selectedDayNumber}.`}
          </div>
        ) : null}

        {currentTrip &&
        selectedDayNumber !== null &&
        currentDayStatus === 'ready' &&
        currentDayItems.length === 0 ? (
          <div className="px-4 py-4 text-sm text-gray-500">
            Day {selectedDayNumber} does not have any itinerary items yet.
          </div>
        ) : null}

        {currentTrip &&
        selectedDayNumber !== null &&
        currentDayStatus === 'ready' &&
        currentDayItems.length > 0 ? (
          <ItineraryList items={currentDayItems} />
        ) : null}
      </div>
    </section>
  );
}
