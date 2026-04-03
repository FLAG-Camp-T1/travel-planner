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
    fetchDayItems,
    selectedDayNumber,
  } = useAppStore(
    useShallow((state) => ({
      currentTrip: state.currentTrip,
      dayItemsByDayNumber: state.dayItemsByDayNumber,
      dayItemsErrorByDayNumber: state.dayItemsErrorByDayNumber,
      dayItemsStatusByDayNumber: state.dayItemsStatusByDayNumber,
      fetchDayItems: state.fetchDayItems,
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
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          Selected-Day Data
        </span>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-4 py-3 text-sm text-gray-500">
          {selectedDayNumber !== null
            ? `Showing itinerary data for Day ${selectedDayNumber}.`
            : 'Waiting for the planner context to determine a selected day.'}
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
