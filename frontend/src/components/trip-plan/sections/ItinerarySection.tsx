import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import type { TripTravelMethodCommand } from '@/api/tripApi';
import { useAppStore } from '@/stores/useAppStore';
import ItineraryList from '@/components/trip-plan/itinerary/ItineraryList';
import {
  getGenerateRouteButtonLabel,
  getItineraryStatusMessage,
} from '@/components/trip-plan/itinerary/itinerarySectionPresentation';

const EMPTY_DAY_ITEMS = [];

export default function ItinerarySection() {
  const {
    currentTrip,
    dayItemsByDayNumber,
    dayItemDeletionError,
    dayItemDeletionStatus,
    dayItemDeletionTargetId,
    dayItemReorderError,
    dayItemReorderStatus,
    dayItemUpdateError,
    dayItemUpdateStatus,
    dayItemUpdateTargetId,
    dayItemsErrorByDayNumber,
    dayItemsStatusByDayNumber,
    dayRouteStatusByDayNumber,
    deleteDayItem,
    fetchDayItems,
    generateDayRoute,
    reorderDayItems,
    selectedDayNumber,
    updateDayItem,
  } = useAppStore(
    useShallow((state) => ({
      currentTrip: state.currentTrip,
      dayItemsByDayNumber: state.dayItemsByDayNumber,
      dayItemDeletionError: state.dayItemDeletionError,
      dayItemDeletionStatus: state.dayItemDeletionStatus,
      dayItemDeletionTargetId: state.dayItemDeletionTargetId,
      dayItemReorderError: state.dayItemReorderError,
      dayItemReorderStatus: state.dayItemReorderStatus,
      dayItemUpdateError: state.dayItemUpdateError,
      dayItemUpdateStatus: state.dayItemUpdateStatus,
      dayItemUpdateTargetId: state.dayItemUpdateTargetId,
      dayItemsErrorByDayNumber: state.dayItemsErrorByDayNumber,
      dayItemsStatusByDayNumber: state.dayItemsStatusByDayNumber,
      dayRouteStatusByDayNumber: state.dayRouteStatusByDayNumber,
      deleteDayItem: state.deleteDayItem,
      fetchDayItems: state.fetchDayItems,
      generateDayRoute: state.generateDayRoute,
      reorderDayItems: state.reorderDayItems,
      selectedDayNumber: state.selectedDayNumber,
      updateDayItem: state.updateDayItem,
    })),
  );

  useEffect(() => {
    if (!currentTrip || selectedDayNumber === null) {
      return;
    }

    void fetchDayItems(currentTrip.tripId, selectedDayNumber);
  }, [currentTrip, fetchDayItems, selectedDayNumber]);

  const dayCacheKey =
    currentTrip && selectedDayNumber !== null ? `${currentTrip.tripId}:${selectedDayNumber}` : null;

  const currentDayStatus =
    dayCacheKey !== null ? (dayItemsStatusByDayNumber[dayCacheKey] ?? 'idle') : 'idle';
  const currentDayError =
    dayCacheKey !== null ? (dayItemsErrorByDayNumber[dayCacheKey] ?? null) : null;
  const currentDayItems =
    dayCacheKey !== null ? (dayItemsByDayNumber[dayCacheKey] ?? EMPTY_DAY_ITEMS) : EMPTY_DAY_ITEMS;
  const currentDayRouteStatus =
    dayCacheKey !== null ? (dayRouteStatusByDayNumber[dayCacheKey] ?? 'idle') : 'idle';
  const tripReady = currentTrip !== null;
  const hasDisplayableRoute =
    dayCacheKey !== null && (dayRouteStatusByDayNumber[dayCacheKey] ?? 'idle') === 'ready';
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
  const itineraryMutationError = dayItemReorderError ?? dayItemDeletionError ?? dayItemUpdateError;

  const handleGenerateRoute = () => {
    if (!currentTrip || selectedDayNumber === null || !canGenerateRoute) {
      return;
    }

    void generateDayRoute(currentTrip.tripId, selectedDayNumber);
  };

  const handleDeleteItem = (itemId: number) => {
    if (!currentTrip || selectedDayNumber === null) {
      return;
    }

    void deleteDayItem(currentTrip.tripId, selectedDayNumber, itemId);
  };

  const handleUpdateTravelMethod = (itemId: number, travelMethod: TripTravelMethodCommand) => {
    if (!currentTrip || selectedDayNumber === null) {
      return;
    }

    void updateDayItem(currentTrip.tripId, selectedDayNumber, itemId, { travelMethod });
  };

  const handleMoveItem = (itemId: number, direction: 'up' | 'down') => {
    if (!currentTrip || selectedDayNumber === null) {
      return;
    }

    const currentIndex = currentDayItems.findIndex((item) => item.itemId === itemId);
    if (currentIndex < 0) {
      return;
    }

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= currentDayItems.length) {
      return;
    }

    const reorderedItems = [...currentDayItems];
    const [movedItem] = reorderedItems.splice(currentIndex, 1);
    reorderedItems.splice(targetIndex, 0, movedItem);

    void reorderDayItems(
      currentTrip.tripId,
      selectedDayNumber,
      { itemIds: reorderedItems.map((item) => item.itemId) },
      itemId,
    );
  };

  return (
    <section className="space-y-3">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-700">Selected Day Itinerary</h2>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleGenerateRoute}
              disabled={!canGenerateRoute}
              className="whitespace-nowrap rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 disabled:shadow-none"
            >
              {generateRouteButtonLabel}
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          View the stops planned for the selected day. Click a travel method to edit it, or use
          Up/Down to reorder stops.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-4 py-3 text-sm text-gray-500">
          {itineraryStatusMessage}
        </div>

        {itineraryMutationError ? (
          <div className="border-b border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {itineraryMutationError}
          </div>
        ) : null}

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
        currentDayItems.length > 0 ? (
          <ItineraryList
            deletingTargetItemId={dayItemDeletionTargetId}
            deletionStatus={dayItemDeletionStatus}
            items={currentDayItems}
            onDeleteItem={handleDeleteItem}
            onMoveItemDown={(itemId) => handleMoveItem(itemId, 'down')}
            onMoveItemUp={(itemId) => handleMoveItem(itemId, 'up')}
            onUpdateTravelMethod={handleUpdateTravelMethod}
            reorderStatus={dayItemReorderStatus}
            updatingTargetItemId={dayItemUpdateTargetId}
            updateStatus={dayItemUpdateStatus}
          />
        ) : null}
      </div>
    </section>
  );
}
