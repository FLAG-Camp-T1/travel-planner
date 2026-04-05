import type { DayRouteSummary } from '@/api/tripApi';
import type { LoadStatus } from '@/stores/types';

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

export const getRouteEmptyStateMessage = ({
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
    return `Loading itinerary context for Day ${selectedDayNumber} before evaluating route state.`;
  }

  if (currentDayItemsStatus === 'error') {
    return `Itinerary data for Day ${selectedDayNumber} is unavailable, so route state cannot be determined yet.`;
  }

  if (currentDayItemCount === 0) {
    return `Day ${selectedDayNumber} does not have any itinerary items yet, so a route cannot be generated.`;
  }

  if (currentDayItemCount === 1) {
    return `Day ${selectedDayNumber} has one itinerary item, so no between-stop route is needed.`;
  }

  return `Day ${selectedDayNumber} does not have route data yet. Use the itinerary section to generate a route.`;
};
