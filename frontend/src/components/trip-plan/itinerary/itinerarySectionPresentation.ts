import type { LoadStatus } from '@/stores/types';

export const getGenerateRouteButtonLabel = ({
  currentDayItemCount,
  currentDayRouteStatus,
  currentDayStatus,
  hasDisplayableRoute,
  selectedDayNumber,
  tripReady,
}: {
  currentDayItemCount: number;
  currentDayRouteStatus: LoadStatus;
  currentDayStatus: LoadStatus;
  hasDisplayableRoute: boolean;
  selectedDayNumber: number | null;
  tripReady: boolean;
}) => {
  if (!tripReady || selectedDayNumber === null) {
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

  if (currentDayItemCount === 0) {
    return 'No Itinerary Yet';
  }

  if (currentDayItemCount === 1) {
    return 'Route Not Needed';
  }

  return 'Generate Route';
};

export const getItineraryStatusMessage = ({
  currentDayItemCount,
  currentDayRouteStatus,
  currentDayStatus,
  hasDisplayableRoute,
  selectedDayNumber,
  tripReady,
}: {
  currentDayItemCount: number;
  currentDayRouteStatus: LoadStatus;
  currentDayStatus: LoadStatus;
  hasDisplayableRoute: boolean;
  selectedDayNumber: number | null;
  tripReady: boolean;
}) => {
  if (selectedDayNumber === null) {
    return 'Select a day to view its itinerary.';
  }

  if (!tripReady) {
    return 'Create or load a trip to begin planning.';
  }

  if (currentDayStatus === 'idle' || currentDayStatus === 'loading') {
    return `Loading itinerary items for Day ${selectedDayNumber}.`;
  }

  if (currentDayStatus === 'error') {
    return `We couldn't load the itinerary for Day ${selectedDayNumber}.`;
  }

  if (currentDayRouteStatus === 'loading') {
    return `Generating route data for Day ${selectedDayNumber}.`;
  }

  if (hasDisplayableRoute) {
    return 'Route details are ready below.';
  }

  if (currentDayItemCount === 0) {
    return `Day ${selectedDayNumber} does not have any itinerary items yet.`;
  }

  if (currentDayItemCount === 1) {
    return `Day ${selectedDayNumber} has one itinerary item, so no between-stop route is needed.`;
  }

  return `Day ${selectedDayNumber} itinerary is ready.`;
};
