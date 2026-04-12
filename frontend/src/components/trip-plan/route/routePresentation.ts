import type { DayRouteSegment, DayRouteSummary, ItineraryItem } from '@/api/tripApi';
import type { DayRouteInvalidationReason, LoadStatus } from '@/stores/types';
import { getTripTravelMethodLabel } from '@/utils/tripTravelMethod';

export type RouteSegmentRow = {
  key: string;
  fromItemId: number;
  toItemId: number;
  travelMethod: string;
  distanceLabel: string;
  durationLabel: string;
  viewport?: DayRouteSegment['viewport'];
  isInferred: boolean;
};

export const LONG_ROUTE_WARNING_THRESHOLD_SECONDS = 16 * 60 * 60;

export const formatDistance = (distanceMeters: number) => {
  if (distanceMeters < 1000) {
    return `${distanceMeters} m`;
  }

  return `${(distanceMeters / 1000).toFixed(1)} km`;
};

const formatHourMinuteDuration = (durationSeconds: number) => {
  const totalMinutes = Math.round(durationSeconds / 60);

  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return minutes === 0 ? `${hours} hr` : `${hours} hr ${minutes} min`;
};

export const formatSegmentDuration = (durationSeconds: number) => {
  return formatHourMinuteDuration(durationSeconds);
};

export const formatTotalDuration = (durationSeconds: number) => {
  const totalMinutes = Math.round(durationSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  if (days === 0) {
    return formatHourMinuteDuration(durationSeconds);
  }

  if (hours === 0 && minutes === 0) {
    return days === 1 ? '1 day' : `${days} days`;
  }

  if (minutes === 0) {
    return `${days} day${days === 1 ? '' : 's'} ${hours} hr`;
  }

  return `${days} day${days === 1 ? '' : 's'} ${hours} hr ${minutes} min`;
};

export const shouldShowLongRouteWarning = (routeSummary: DayRouteSummary | null) => {
  return (
    routeSummary !== null &&
    routeSummary.totalDurationSeconds > LONG_ROUTE_WARNING_THRESHOLD_SECONDS
  );
};

export const getLongRouteWarningMessage = () => {
  return 'This route spends more than 16 hours in transit. Consider reducing stops or splitting the itinerary across multiple days.';
};

const getRouteEmptyStateMessage = ({
  currentDayItemCount,
  currentDayItemsStatus,
  selectedDayNumber,
}: {
  currentDayItemCount: number;
  currentDayItemsStatus: LoadStatus;
  selectedDayNumber: number | null;
}) => {
  if (selectedDayNumber === null) {
    return null;
  }

  if (currentDayItemsStatus === 'idle' || currentDayItemsStatus === 'loading') {
    return `Loading route details for Day ${selectedDayNumber}.`;
  }

  if (currentDayItemsStatus === 'error') {
    return `We couldn't load the itinerary for Day ${selectedDayNumber}, so route details are unavailable right now.`;
  }

  if (currentDayItemCount === 0) {
    return `Day ${selectedDayNumber} does not have any itinerary items yet, so a route cannot be generated.`;
  }

  if (currentDayItemCount === 1) {
    return `Day ${selectedDayNumber} has one itinerary item, so no between-stop route is needed.`;
  }

  return `Generate a route after adding at least two stops to Day ${selectedDayNumber}.`;
};

const getRouteStatusMessage = ({
  hasCurrentTrip,
  currentDayRouteError,
  currentDayRouteSummary,
  currentDayRouteStatus,
  routeEmptyStateMessage,
  selectedDayNumber,
}: {
  hasCurrentTrip: boolean;
  currentDayRouteError: string | null;
  currentDayRouteSummary: DayRouteSummary | null;
  currentDayRouteStatus: LoadStatus;
  routeEmptyStateMessage: string | null;
  selectedDayNumber: number | null;
}) => {
  if (selectedDayNumber === null) {
    return 'Select a day to view route details.';
  }

  if (currentDayRouteStatus === 'loading') {
    return `Generating route data for Day ${selectedDayNumber}.`;
  }

  if (currentDayRouteStatus === 'error') {
    return currentDayRouteError ?? `Failed to generate route data for Day ${selectedDayNumber}.`;
  }

  if (hasCurrentTrip && currentDayRouteSummary === null && routeEmptyStateMessage) {
    return routeEmptyStateMessage;
  }

  return `Day ${selectedDayNumber} route`;
};

export type SelectedDayPlanRouteUiState = {
  canTriggerRouteAction: boolean;
  displayedStatusMessage: string | null;
  routeActionLabel: 'Generate Route' | 'Regenerate Route' | 'Generating...';
  showLongRouteWarning: boolean;
  showPlaceholderRouteState: boolean;
  showRouteActionButton: boolean;
};

export const getSelectedDayPlanRouteUiState = ({
  currentDayItemCount,
  currentDayItemsStatus,
  currentDayRouteError,
  currentDayRouteInvalidationReason,
  currentDayRouteStatus,
  currentDayRouteSummary,
  hasCurrentTrip,
  selectedDayNumber,
}: {
  currentDayItemCount: number;
  currentDayItemsStatus: LoadStatus;
  currentDayRouteError: string | null;
  currentDayRouteInvalidationReason: DayRouteInvalidationReason | null;
  currentDayRouteStatus: LoadStatus;
  currentDayRouteSummary: DayRouteSummary | null;
  hasCurrentTrip: boolean;
  selectedDayNumber: number | null;
}): SelectedDayPlanRouteUiState => {
  const routeEmptyStateMessage = getRouteEmptyStateMessage({
    currentDayItemCount,
    currentDayItemsStatus,
    selectedDayNumber,
  });
  const routeStatusMessage = getRouteStatusMessage({
    hasCurrentTrip,
    currentDayRouteError,
    currentDayRouteSummary,
    currentDayRouteStatus,
    routeEmptyStateMessage,
    selectedDayNumber,
  });
  const showPlaceholderRouteState =
    currentDayRouteSummary === null && currentDayItemsStatus === 'ready' && currentDayItemCount > 0;
  const displayedStatusMessage =
    currentDayRouteStatus === 'loading' || currentDayRouteStatus === 'error'
      ? routeStatusMessage
      : currentDayRouteInvalidationReason === 'reorder'
        ? `Day ${selectedDayNumber ?? 0} route needs regeneration.`
        : currentDayRouteInvalidationReason === 'stale'
          ? 'Route details need regeneration.'
          : currentDayRouteSummary === null
            ? routeEmptyStateMessage
            : null;
  const showRouteActionButton =
    hasCurrentTrip &&
    selectedDayNumber !== null &&
    currentDayItemsStatus === 'ready' &&
    currentDayItemCount >= 2 &&
    (currentDayRouteStatus === 'loading' ||
      currentDayRouteInvalidationReason !== null ||
      currentDayRouteSummary === null);

  return {
    canTriggerRouteAction:
      hasCurrentTrip &&
      selectedDayNumber !== null &&
      currentDayItemsStatus === 'ready' &&
      currentDayItemCount >= 2 &&
      currentDayRouteStatus !== 'loading' &&
      currentDayRouteSummary === null,
    displayedStatusMessage,
    routeActionLabel:
      currentDayRouteStatus === 'loading'
        ? 'Generating...'
        : currentDayRouteInvalidationReason !== null
          ? 'Regenerate Route'
          : 'Generate Route',
    showLongRouteWarning: shouldShowLongRouteWarning(currentDayRouteSummary),
    showPlaceholderRouteState,
    showRouteActionButton,
  };
};

export const buildRouteSegmentRows = (segments: DayRouteSegment[]): RouteSegmentRow[] => {
  return segments.map((segment, index) => ({
    key: `${segment.fromItemId}-${segment.toItemId}-${index}`,
    fromItemId: segment.fromItemId,
    toItemId: segment.toItemId,
    travelMethod: segment.travelMethod,
    distanceLabel: formatDistance(segment.distanceMeters),
    durationLabel: formatSegmentDuration(segment.durationSeconds),
    viewport: segment.viewport,
    isInferred: false,
  }));
};

export const buildInferredRouteSegmentRows = (items: ItineraryItem[]): RouteSegmentRow[] => {
  return items.slice(1).map((item, index) => ({
    key: `inferred-${items[index]?.itemId ?? index}-${item.itemId}`,
    fromItemId: items[index].itemId,
    toItemId: item.itemId,
    travelMethod: getTripTravelMethodLabel(item.travelMethod),
    distanceLabel: '--',
    durationLabel: '--',
    isInferred: true,
  }));
};

export const buildDisplayedRouteSegmentRows = ({
  items,
  segments,
  showPlaceholderRouteState,
}: {
  items: ItineraryItem[];
  segments: DayRouteSegment[];
  showPlaceholderRouteState: boolean;
}) => {
  if (items.length < 2) {
    return [];
  }

  const inferredRows = buildInferredRouteSegmentRows(items);
  if (showPlaceholderRouteState) {
    return inferredRows;
  }

  const realRows = buildRouteSegmentRows(segments);
  return items.slice(1).map((_, index) => realRows[index] ?? inferredRows[index]);
};
