import { useEffect, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import type { DayRouteSegment, ItineraryItem, TripTravelMethodCommand } from '@/api/tripApi';
import { emitDayRouteViewportFocus } from '@/components/map/dayRouteViewportFocusBus';
import SectionInfoHint from '@/components/trip-plan/SectionInfoHint';
import ItineraryList from '@/components/trip-plan/itinerary/ItineraryList';
import DayRouteSummaryCard from '@/components/trip-plan/route/DayRouteSummaryCard';
import {
  buildDisplayedRouteSegmentRows,
  getLongRouteWarningMessage,
  getSelectedDayPlanRouteUiState,
} from '@/components/trip-plan/route/routePresentation';
import { useAppStore } from '@/stores/useAppStore';

const EMPTY_DAY_ITEMS: ItineraryItem[] = [];
const EMPTY_DAY_ROUTE_SEGMENTS: DayRouteSegment[] = [];

export default function SelectedDayPlanSection() {
  const {
    activeDayRouteSegmentIndex,
    currentTrip,
    dayItemDeletionError,
    dayItemDeletionStatus,
    dayItemDeletionTargetId,
    dayItemMoveError,
    dayItemMoveStatus,
    dayItemMoveTargetId,
    dayItemReorderError,
    dayItemReorderStatus,
    dayItemUpdateError,
    dayItemUpdateStatus,
    dayItemUpdateTargetId,
    dayItemsByDayNumber,
    dayItemsErrorByDayNumber,
    dayItemsStatusByDayNumber,
    dayRouteByDayNumber,
    dayRouteColorMode,
    dayRouteErrorByDayNumber,
    dayRouteInvalidationReasonByDayNumber,
    dayRouteSegmentsByDayNumber,
    dayRouteStatusByDayNumber,
    days,
    deleteDayItem,
    fetchDayItems,
    generateDayRoute,
    moveDayItem,
    reorderDayItems,
    selectedDayNumber,
    setActiveDayRouteSegmentIndex,
    setDayRouteColorMode,
    updateDayItem,
  } = useAppStore(
    useShallow((state) => ({
      activeDayRouteSegmentIndex: state.activeDayRouteSegmentIndex,
      currentTrip: state.currentTrip,
      dayItemDeletionError: state.dayItemDeletionError,
      dayItemDeletionStatus: state.dayItemDeletionStatus,
      dayItemDeletionTargetId: state.dayItemDeletionTargetId,
      dayItemMoveError: state.dayItemMoveError,
      dayItemMoveStatus: state.dayItemMoveStatus,
      dayItemMoveTargetId: state.dayItemMoveTargetId,
      dayItemReorderError: state.dayItemReorderError,
      dayItemReorderStatus: state.dayItemReorderStatus,
      dayItemUpdateError: state.dayItemUpdateError,
      dayItemUpdateStatus: state.dayItemUpdateStatus,
      dayItemUpdateTargetId: state.dayItemUpdateTargetId,
      dayItemsByDayNumber: state.dayItemsByDayNumber,
      dayItemsErrorByDayNumber: state.dayItemsErrorByDayNumber,
      dayItemsStatusByDayNumber: state.dayItemsStatusByDayNumber,
      dayRouteByDayNumber: state.dayRouteByDayNumber,
      dayRouteColorMode: state.dayRouteColorMode,
      dayRouteErrorByDayNumber: state.dayRouteErrorByDayNumber,
      dayRouteInvalidationReasonByDayNumber: state.dayRouteInvalidationReasonByDayNumber,
      dayRouteSegmentsByDayNumber: state.dayRouteSegmentsByDayNumber,
      dayRouteStatusByDayNumber: state.dayRouteStatusByDayNumber,
      days: state.days,
      deleteDayItem: state.deleteDayItem,
      fetchDayItems: state.fetchDayItems,
      generateDayRoute: state.generateDayRoute,
      moveDayItem: state.moveDayItem,
      reorderDayItems: state.reorderDayItems,
      selectedDayNumber: state.selectedDayNumber,
      setActiveDayRouteSegmentIndex: state.setActiveDayRouteSegmentIndex,
      setDayRouteColorMode: state.setDayRouteColorMode,
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
  const currentDayRouteError =
    dayCacheKey !== null ? (dayRouteErrorByDayNumber[dayCacheKey] ?? null) : null;
  const currentDayRouteSummary =
    dayCacheKey !== null ? (dayRouteByDayNumber[dayCacheKey] ?? null) : null;
  const currentDayRouteInvalidationReason =
    dayCacheKey !== null ? (dayRouteInvalidationReasonByDayNumber[dayCacheKey] ?? null) : null;
  const currentDaySegments =
    dayCacheKey !== null
      ? (dayRouteSegmentsByDayNumber[dayCacheKey] ?? EMPTY_DAY_ROUTE_SEGMENTS)
      : EMPTY_DAY_ROUTE_SEGMENTS;
  const currentDayItemCount = currentDayItems.length;
  const tripReady = currentTrip !== null;
  const routeUiState = getSelectedDayPlanRouteUiState({
    currentDayItemCount,
    currentDayItemsStatus: currentDayStatus,
    currentDayRouteError,
    currentDayRouteInvalidationReason,
    currentDayRouteStatus,
    currentDayRouteSummary,
    hasCurrentTrip: tripReady,
    selectedDayNumber,
  });
  const displayedLegRows = useMemo(() => {
    return buildDisplayedRouteSegmentRows({
      items: currentDayItems,
      segments: currentDaySegments,
      showPlaceholderRouteState: routeUiState.showPlaceholderRouteState,
    });
  }, [currentDayItems, currentDaySegments, routeUiState.showPlaceholderRouteState]);
  const itineraryMutationError =
    dayItemMoveError ?? dayItemReorderError ?? dayItemDeletionError ?? dayItemUpdateError;
  const moveTargetDays =
    selectedDayNumber === null ? [] : days.filter((day) => day.dayNumber !== selectedDayNumber);
  const isContrastMode = dayRouteColorMode === 'contrast';
  const highContrastTooltip =
    'When High Contrast is on, route colors follow each segment timeline dot. When it is off, route colors follow the travel mode colors.';
  const handleGenerateRoute = () => {
    if (!currentTrip || selectedDayNumber === null || !routeUiState.canTriggerRouteAction) {
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

  const handleMoveItemToDay = (itemId: number, targetDayNumber: number) => {
    if (!currentTrip || selectedDayNumber === null) {
      return;
    }

    void moveDayItem(currentTrip.tripId, selectedDayNumber, itemId, { targetDayNumber });
  };

  const handleFocusSegment = (segmentIndex: number) => {
    const segment = displayedLegRows[segmentIndex];
    if (!segment || segment.isInferred) {
      return;
    }

    const isFocused = activeDayRouteSegmentIndex === segmentIndex;
    const nextFocusedIndex = isFocused ? null : segmentIndex;
    setActiveDayRouteSegmentIndex(nextFocusedIndex);

    if (!isFocused && segment.viewport) {
      emitDayRouteViewportFocus(segment.viewport);
    }
  };

  return (
    <section className="space-y-3">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-700">Selected Day Plan</h2>
              <SectionInfoHint tooltip="Manage the selected day's stops and route details here. Click a travel method to edit it, use Up/Down to reorder stops, or click a route leg to focus it on the map." />
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <button
              type="button"
              onClick={() => setDayRouteColorMode(isContrastMode ? 'travelMethod' : 'contrast')}
              title={highContrastTooltip}
              aria-label={`${isContrastMode ? 'High Contrast On' : 'High Contrast Off'}. ${highContrastTooltip}`}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm transition ${
                isContrastMode
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900'
              }`}
              aria-pressed={isContrastMode}
            >
              {isContrastMode ? 'High Contrast On' : 'High Contrast Off'}
            </button>
          </div>
        </div>
        {routeUiState.displayedStatusMessage || routeUiState.showRouteActionButton ? (
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1 pt-1 text-sm text-gray-500">
              {routeUiState.displayedStatusMessage}
            </div>
            {routeUiState.showRouteActionButton ? (
              <div className="flex shrink-0 flex-col items-end gap-2">
                <button
                  type="button"
                  onClick={handleGenerateRoute}
                  disabled={!routeUiState.canTriggerRouteAction}
                  className="whitespace-nowrap rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 disabled:shadow-none"
                >
                  {routeUiState.routeActionLabel}
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        {itineraryMutationError ? (
          <div className="border-b border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {itineraryMutationError}
          </div>
        ) : null}

        {!tripReady || selectedDayNumber === null ? (
          <div className="px-4 py-4 text-sm text-gray-500">
            Create or load a trip, then choose a day to view its itinerary and route details.
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

        {tripReady && selectedDayNumber !== null && currentDayStatus === 'ready' ? (
          <>
            {currentDayItemCount > 0 ? (
              <>
                <DayRouteSummaryCard
                  routeSummary={currentDayRouteSummary}
                  isPlaceholder={routeUiState.showPlaceholderRouteState}
                />

                {routeUiState.showLongRouteWarning && !routeUiState.showPlaceholderRouteState ? (
                  <div className="border-t border-amber-100 bg-amber-50/80 px-4 py-3 text-sm text-amber-800">
                    {getLongRouteWarningMessage()}
                  </div>
                ) : null}
              </>
            ) : null}

            {currentDayItemCount > 0 ? (
              <ItineraryList
                activeSegmentIndex={activeDayRouteSegmentIndex}
                colorMode={dayRouteColorMode}
                deletingTargetItemId={dayItemDeletionTargetId}
                deletionStatus={dayItemDeletionStatus}
                items={currentDayItems}
                legRows={displayedLegRows}
                moveOptions={moveTargetDays}
                moveStatus={dayItemMoveStatus}
                movingTargetItemId={dayItemMoveTargetId}
                onDeleteItem={handleDeleteItem}
                onFocusSegment={(segmentIndex) => handleFocusSegment(segmentIndex)}
                onMoveItemDown={(itemId) => handleMoveItem(itemId, 'down')}
                onMoveItemUp={(itemId) => handleMoveItem(itemId, 'up')}
                onMoveToDay={handleMoveItemToDay}
                onUpdateTravelMethod={handleUpdateTravelMethod}
                reorderStatus={dayItemReorderStatus}
                updatingTargetItemId={dayItemUpdateTargetId}
                updateStatus={dayItemUpdateStatus}
              />
            ) : (
              <div className="px-4 py-4 text-sm text-gray-500">
                Day {selectedDayNumber} does not have any itinerary items yet.
              </div>
            )}

            {currentDayItemCount === 1 ? (
              <div className="border-t border-gray-100 px-4 py-3 text-sm text-gray-500">
                Add another stop to create the first between-stop segment.
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </section>
  );
}
