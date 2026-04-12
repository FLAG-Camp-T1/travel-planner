import type { TripPlanningSlice } from '../types';

export const getEmptyTripPlanningData = () => ({
  currentTrip: null,
  lastBootstrapTripId: null,
  days: [],
  selectedDayNumber: null,
  dayItemsByDayNumber: {},
  dayItemsStatusByDayNumber: {},
  dayItemsErrorByDayNumber: {},
  dayRouteByDayNumber: {},
  dayRouteSegmentsByDayNumber: {},
  dayRouteStatusByDayNumber: {},
  dayRouteErrorByDayNumber: {},
  dayRouteInvalidationReasonByDayNumber: {},
  dayRouteColorMode: 'travelMethod' as const,
  activeDayRouteSegmentIndex: null,
  tripStatus: 'idle' as const,
  daysStatus: 'idle' as const,
  tripError: null,
  daysError: null,
});

export const getTripListState = () => ({
  trips: [],
  tripsStatus: 'idle' as const,
  tripsError: null,
  activePlannerPanel: 'trips' as const,
});

export const getTripMutationState = () => ({
  tripUpdateStatus: 'idle' as const,
  tripUpdateError: null,
  tripDeletionStatus: 'idle' as const,
  tripDeletionError: null,
  tripDeletionTargetId: null,
});

export const getDayItemMutationState = () => ({
  dayItemCreationStatus: 'idle' as const,
  dayItemCreationError: null,
  dayItemCreationTargetPlaceId: null,
  dayItemUpdateStatus: 'idle' as const,
  dayItemUpdateError: null,
  dayItemUpdateTargetId: null,
  dayItemDeletionStatus: 'idle' as const,
  dayItemDeletionError: null,
  dayItemDeletionTargetId: null,
  dayItemReorderStatus: 'idle' as const,
  dayItemReorderError: null,
  dayItemReorderTargetId: null,
  dayItemMoveStatus: 'idle' as const,
  dayItemMoveError: null,
  dayItemMoveTargetId: null,
});

export const pickDayItemMutationState = (state: TripPlanningSlice) => ({
  dayItemCreationStatus: state.dayItemCreationStatus,
  dayItemCreationError: state.dayItemCreationError,
  dayItemCreationTargetPlaceId: state.dayItemCreationTargetPlaceId,
  dayItemUpdateStatus: state.dayItemUpdateStatus,
  dayItemUpdateError: state.dayItemUpdateError,
  dayItemUpdateTargetId: state.dayItemUpdateTargetId,
  dayItemDeletionStatus: state.dayItemDeletionStatus,
  dayItemDeletionError: state.dayItemDeletionError,
  dayItemDeletionTargetId: state.dayItemDeletionTargetId,
  dayItemReorderStatus: state.dayItemReorderStatus,
  dayItemReorderError: state.dayItemReorderError,
  dayItemReorderTargetId: state.dayItemReorderTargetId,
  dayItemMoveStatus: state.dayItemMoveStatus,
  dayItemMoveError: state.dayItemMoveError,
  dayItemMoveTargetId: state.dayItemMoveTargetId,
});
