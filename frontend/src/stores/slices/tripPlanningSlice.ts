import {
  createTripDayItem as createTripDayItemApi,
  createTrip as createTripApi,
  deleteTripDayItem as deleteTripDayItemApi,
  deleteTrip as deleteTripApi,
  generateTripDayRoute,
  getTrips,
  getTrip,
  getTripDayItems,
  getTripDays,
  moveTripDayItem as moveTripDayItemApi,
  reorderTripDayItems as reorderTripDayItemsApi,
  updateTripDayItem as updateTripDayItemApi,
  updateTrip as updateTripApi,
} from '@/api/tripApi';
import type { AppStoreCreator, TripPlanningSlice } from '../types';
import { toDisplayedTripTravelMethod } from '@/utils/tripTravelMethod';

const getTripDayCacheKey = (tripId: number, dayNumber: number) => `${tripId}:${dayNumber}`;

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : 'Trip planning request failed.';
};

const getEmptyTripPlanningData = () => ({
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
  tripStatus: 'idle' as const,
  daysStatus: 'idle' as const,
  tripError: null,
  daysError: null,
});

const getTripListState = () => ({
  trips: [],
  tripsStatus: 'idle' as const,
  tripsError: null,
  activePlannerPanel: 'trips' as const,
});

const getTripMutationState = () => ({
  tripUpdateStatus: 'idle' as const,
  tripUpdateError: null,
  tripDeletionStatus: 'idle' as const,
  tripDeletionError: null,
  tripDeletionTargetId: null,
});

const getDayItemMutationState = () => ({
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

const pickDayItemMutationState = (state: TripPlanningSlice) => ({
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

export const createTripPlanningSlice: AppStoreCreator<TripPlanningSlice> = (set, get) => {
  let activeTripsRequestId = 0;

  const setDayItemCreationState = (
    patch: Partial<
      Pick<
        TripPlanningSlice,
        | 'dayItemCreationStatus'
        | 'dayItemCreationError'
        | 'dayItemCreationTargetPlaceId'
        | 'dayItemUpdateError'
        | 'dayItemDeletionError'
        | 'dayItemReorderError'
        | 'dayItemMoveError'
      >
    >,
    action: string,
  ) => {
    set(patch, false, action);
  };

  const setDayItemUpdateState = (
    patch: Partial<
      Pick<
        TripPlanningSlice,
        | 'dayItemCreationError'
        | 'dayItemUpdateStatus'
        | 'dayItemUpdateError'
        | 'dayItemUpdateTargetId'
        | 'dayItemDeletionError'
        | 'dayItemReorderError'
        | 'dayItemMoveError'
      >
    >,
    action: string,
  ) => {
    set(patch, false, action);
  };

  const setDayItemDeletionState = (
    patch: Partial<
      Pick<
        TripPlanningSlice,
        | 'dayItemCreationError'
        | 'dayItemDeletionStatus'
        | 'dayItemDeletionError'
        | 'dayItemDeletionTargetId'
        | 'dayItemUpdateError'
        | 'dayItemReorderError'
        | 'dayItemMoveError'
      >
    >,
    action: string,
  ) => {
    set(patch, false, action);
  };

  const setDayItemReorderState = (
    patch: Partial<
      Pick<
        TripPlanningSlice,
        | 'dayItemCreationError'
        | 'dayItemUpdateError'
        | 'dayItemDeletionError'
        | 'dayItemReorderStatus'
        | 'dayItemReorderError'
        | 'dayItemReorderTargetId'
        | 'dayItemMoveError'
      >
    >,
    action: string,
  ) => {
    set(patch, false, action);
  };

  const setDayItemMoveState = (
    patch: Partial<
      Pick<
        TripPlanningSlice,
        | 'dayItemCreationError'
        | 'dayItemUpdateError'
        | 'dayItemDeletionError'
        | 'dayItemReorderError'
        | 'dayItemMoveStatus'
        | 'dayItemMoveError'
        | 'dayItemMoveTargetId'
      >
    >,
    action: string,
  ) => {
    set(patch, false, action);
  };

  const invalidateDayRoute = (tripId: number, dayNumber: number) => {
    const cacheKey = getTripDayCacheKey(tripId, dayNumber);

    set(
      (state) => ({
        dayRouteByDayNumber: {
          ...state.dayRouteByDayNumber,
          [cacheKey]: null,
        },
        dayRouteSegmentsByDayNumber: {
          ...state.dayRouteSegmentsByDayNumber,
          [cacheKey]: [],
        },
        dayRouteStatusByDayNumber: {
          ...state.dayRouteStatusByDayNumber,
          [cacheKey]: 'idle',
        },
        dayRouteErrorByDayNumber: {
          ...state.dayRouteErrorByDayNumber,
          [cacheKey]: null,
        },
      }),
      false,
      'trip/day-route:invalidate',
    );
  };

  const pruneTripDayCaches = (tripId: number, validDayNumbers: number[]) => {
    const validCacheKeys = new Set(
      validDayNumbers.map((dayNumber) => getTripDayCacheKey(tripId, dayNumber)),
    );

    set(
      (state) => ({
        dayItemsByDayNumber: Object.fromEntries(
          Object.entries(state.dayItemsByDayNumber).filter(
            ([cacheKey]) => !cacheKey.startsWith(`${tripId}:`) || validCacheKeys.has(cacheKey),
          ),
        ),
        dayItemsStatusByDayNumber: Object.fromEntries(
          Object.entries(state.dayItemsStatusByDayNumber).filter(
            ([cacheKey]) => !cacheKey.startsWith(`${tripId}:`) || validCacheKeys.has(cacheKey),
          ),
        ),
        dayItemsErrorByDayNumber: Object.fromEntries(
          Object.entries(state.dayItemsErrorByDayNumber).filter(
            ([cacheKey]) => !cacheKey.startsWith(`${tripId}:`) || validCacheKeys.has(cacheKey),
          ),
        ),
        dayRouteByDayNumber: Object.fromEntries(
          Object.entries(state.dayRouteByDayNumber).filter(
            ([cacheKey]) => !cacheKey.startsWith(`${tripId}:`) || validCacheKeys.has(cacheKey),
          ),
        ),
        dayRouteSegmentsByDayNumber: Object.fromEntries(
          Object.entries(state.dayRouteSegmentsByDayNumber).filter(
            ([cacheKey]) => !cacheKey.startsWith(`${tripId}:`) || validCacheKeys.has(cacheKey),
          ),
        ),
        dayRouteStatusByDayNumber: Object.fromEntries(
          Object.entries(state.dayRouteStatusByDayNumber).filter(
            ([cacheKey]) => !cacheKey.startsWith(`${tripId}:`) || validCacheKeys.has(cacheKey),
          ),
        ),
        dayRouteErrorByDayNumber: Object.fromEntries(
          Object.entries(state.dayRouteErrorByDayNumber).filter(
            ([cacheKey]) => !cacheKey.startsWith(`${tripId}:`) || validCacheKeys.has(cacheKey),
          ),
        ),
      }),
      false,
      'trip/day-caches:prune',
    );
  };

  const loadDayItems = async (tripId: number, dayNumber: number, options?: { force?: boolean }) => {
    const cacheKey = getTripDayCacheKey(tripId, dayNumber);
    const currentState = get();
    const currentDayStatus = currentState.dayItemsStatusByDayNumber[cacheKey] ?? 'idle';
    const hasCachedItems = Object.prototype.hasOwnProperty.call(
      currentState.dayItemsByDayNumber,
      cacheKey,
    );

    if (!options?.force && (currentDayStatus === 'loading' || hasCachedItems)) {
      return;
    }

    set(
      (state) => ({
        dayItemsStatusByDayNumber: {
          ...state.dayItemsStatusByDayNumber,
          [cacheKey]: 'loading',
        },
        dayItemsErrorByDayNumber: {
          ...state.dayItemsErrorByDayNumber,
          [cacheKey]: null,
        },
      }),
      false,
      'trip/day-items:start',
    );

    try {
      const response = await getTripDayItems(tripId, dayNumber);

      set(
        (state) => ({
          dayItemsByDayNumber: {
            ...state.dayItemsByDayNumber,
            [cacheKey]: response.items,
          },
          dayItemsStatusByDayNumber: {
            ...state.dayItemsStatusByDayNumber,
            [cacheKey]: 'ready',
          },
          dayItemsErrorByDayNumber: {
            ...state.dayItemsErrorByDayNumber,
            [cacheKey]: null,
          },
        }),
        false,
        'trip/day-items:success',
      );
    } catch (error) {
      const errorMessage = getErrorMessage(error);

      set(
        (state) => ({
          dayItemsStatusByDayNumber: {
            ...state.dayItemsStatusByDayNumber,
            [cacheKey]: 'error',
          },
          dayItemsErrorByDayNumber: {
            ...state.dayItemsErrorByDayNumber,
            [cacheKey]: errorMessage,
          },
        }),
        false,
        'trip/day-items:error',
      );

      throw error instanceof Error ? error : new Error(errorMessage);
    }
  };

  const setCachedDayItemTravelMethod = (
    tripId: number,
    dayNumber: number,
    itemId: number,
    travelMethod: string | null,
  ) => {
    const cacheKey = getTripDayCacheKey(tripId, dayNumber);

    set(
      (state) => ({
        dayItemsByDayNumber: {
          ...state.dayItemsByDayNumber,
          [cacheKey]: (state.dayItemsByDayNumber[cacheKey] ?? []).map((item) =>
            item.itemId === itemId
              ? {
                  ...item,
                  travelMethod,
                }
              : item,
          ),
        },
      }),
      false,
      'trip/day-items:update-cache',
    );
  };

  const removeCachedDayItem = (tripId: number, dayNumber: number, itemId: number) => {
    const cacheKey = getTripDayCacheKey(tripId, dayNumber);

    set(
      (state) => ({
        dayItemsByDayNumber: {
          ...state.dayItemsByDayNumber,
          [cacheKey]: (state.dayItemsByDayNumber[cacheKey] ?? [])
            .filter((item) => item.itemId !== itemId)
            .map((item, index) => ({
              ...item,
              visitOrder: index + 1,
            })),
        },
      }),
      false,
      'trip/day-items:remove-cache',
    );
  };

  const reorderCachedDayItems = (tripId: number, dayNumber: number, itemIds: number[]) => {
    const cacheKey = getTripDayCacheKey(tripId, dayNumber);

    set(
      (state) => {
        const currentItems = state.dayItemsByDayNumber[cacheKey] ?? [];
        const itemsById = new Map(currentItems.map((item) => [item.itemId, item]));

        return {
          dayItemsByDayNumber: {
            ...state.dayItemsByDayNumber,
            [cacheKey]: itemIds
              .map((itemId) => itemsById.get(itemId))
              .filter((item): item is (typeof currentItems)[number] => item !== undefined)
              .map((item, index) => ({
                ...item,
                visitOrder: index + 1,
              })),
          },
        };
      },
      false,
      'trip/day-items:reorder-cache',
    );
  };

  const moveCachedDayItem = (
    tripId: number,
    sourceDayNumber: number,
    targetDayNumber: number,
    itemId: number,
  ) => {
    const sourceCacheKey = getTripDayCacheKey(tripId, sourceDayNumber);
    const targetCacheKey = getTripDayCacheKey(tripId, targetDayNumber);

    set(
      (state) => {
        const sourceItems = state.dayItemsByDayNumber[sourceCacheKey] ?? [];
        const movedItem = sourceItems.find((item) => item.itemId === itemId);
        if (!movedItem) {
          return {};
        }

        const nextDayItems = {
          ...state.dayItemsByDayNumber,
          [sourceCacheKey]: sourceItems
            .filter((item) => item.itemId !== itemId)
            .map((item, index) => ({
              ...item,
              visitOrder: index + 1,
            })),
        };

        if (Object.prototype.hasOwnProperty.call(state.dayItemsByDayNumber, targetCacheKey)) {
          const targetItems = state.dayItemsByDayNumber[targetCacheKey] ?? [];
          nextDayItems[targetCacheKey] = [
            ...targetItems,
            {
              ...movedItem,
              visitOrder: targetItems.length + 1,
            },
          ];
        }

        return {
          dayItemsByDayNumber: nextDayItems,
        };
      },
      false,
      'trip/day-items:move-cache',
    );
  };

  const completeBootstrap = async (tripId: number) => {
    try {
      await get().fetchTrip(tripId);
      await get().fetchTripDays(tripId);

      const firstDayNumber = get().days[0]?.dayNumber ?? null;
      if (firstDayNumber !== null) {
        get().selectDay(firstDayNumber);
      }

      set(
        {
          tripBootstrapStatus: 'ready',
          tripBootstrapError: null,
          lastBootstrapTripId: tripId,
        },
        false,
        'trip/bootstrap:success',
      );
    } catch (error) {
      set(
        {
          ...getEmptyTripPlanningData(),
          trips: get().trips,
          tripsStatus: get().tripsStatus,
          tripsError: get().tripsError,
          activePlannerPanel: 'trips',
          lastBootstrapTripId: tripId,
          tripBootstrapStatus: 'error',
          tripBootstrapError: getErrorMessage(error),
        },
        false,
        'trip/bootstrap:error',
      );
    }
  };

  return {
    ...getEmptyTripPlanningData(),
    ...getTripListState(),
    tripCreationStatus: 'idle',
    tripCreationError: null,
    ...getTripMutationState(),
    ...getDayItemMutationState(),
    tripBootstrapStatus: 'idle',
    tripBootstrapError: null,

    fetchTrips: async () => {
      activeTripsRequestId += 1;
      const requestId = activeTripsRequestId;

      set(
        {
          tripsStatus: 'loading',
          tripsError: null,
        },
        false,
        'trip/list:start',
      );

      try {
        const trips = await getTrips();
        if (requestId !== activeTripsRequestId) {
          return;
        }

        set(
          {
            trips,
            tripsStatus: 'ready',
            tripsError: null,
          },
          false,
          'trip/list:success',
        );
      } catch (error) {
        if (requestId !== activeTripsRequestId) {
          return;
        }

        set(
          {
            tripsStatus: 'error',
            tripsError: getErrorMessage(error),
          },
          false,
          'trip/list:error',
        );
      }
    },

    setActivePlannerPanel: (panel) => {
      if (get().activePlannerPanel === panel) {
        return;
      }

      get().closePlaceDetail();

      set(
        {
          activePlannerPanel: panel,
        },
        false,
        'planner/panel:set',
      );
    },

    createTrip: async (request) => {
      const currentState = get();
      if (
        currentState.tripCreationStatus === 'loading' ||
        currentState.tripBootstrapStatus === 'loading'
      ) {
        return;
      }

      set(
        {
          tripCreationStatus: 'loading',
          tripCreationError: null,
          tripUpdateStatus: 'idle',
          tripUpdateError: null,
          tripDeletionStatus: 'idle',
          tripDeletionError: null,
          tripDeletionTargetId: null,
          ...getDayItemMutationState(),
        },
        false,
        'trip/create:start',
      );

      try {
        const createdTrip = await createTripApi(request);
        const refreshTripsPromise = get()
          .fetchTrips()
          .catch(() => undefined);

        set(
          {
            ...getEmptyTripPlanningData(),
            activePlannerPanel: 'trips',
            lastBootstrapTripId: createdTrip.tripId,
            tripCreationStatus: 'ready',
            tripCreationError: null,
            ...getTripMutationState(),
            ...getDayItemMutationState(),
            tripBootstrapStatus: 'loading',
            tripBootstrapError: null,
          },
          false,
          'trip/create:success',
        );

        await completeBootstrap(createdTrip.tripId);
        await refreshTripsPromise;
      } catch (error) {
        set(
          {
            tripCreationStatus: 'error',
            tripCreationError: getErrorMessage(error),
            tripUpdateStatus: 'idle',
            tripUpdateError: null,
            tripDeletionStatus: 'idle',
            tripDeletionError: null,
            tripDeletionTargetId: null,
            ...getDayItemMutationState(),
          },
          false,
          'trip/create:error',
        );
      }
    },

    updateTrip: async (tripId, request) => {
      set(
        {
          tripUpdateStatus: 'loading',
          tripUpdateError: null,
        },
        false,
        'trip/update:start',
      );

      try {
        const updatedTrip = await updateTripApi(tripId, request);
        const shouldRefreshDays = get().currentTrip?.tripId === tripId;

        set(
          (state) => ({
            trips: state.trips.map((trip) => (trip.tripId === tripId ? updatedTrip : trip)),
            currentTrip: state.currentTrip?.tripId === tripId ? updatedTrip : state.currentTrip,
            tripStatus: state.currentTrip?.tripId === tripId ? 'ready' : state.tripStatus,
            tripError: state.currentTrip?.tripId === tripId ? null : state.tripError,
            tripUpdateStatus: 'ready',
            tripUpdateError: null,
          }),
          false,
          'trip/update:success',
        );

        void get().fetchTrips();
        if (shouldRefreshDays) {
          await get().fetchTripDays(tripId);
        }
      } catch (error) {
        set(
          {
            tripUpdateStatus: 'error',
            tripUpdateError: getErrorMessage(error),
          },
          false,
          'trip/update:error',
        );
      }
    },

    deleteTrip: async (tripId) => {
      set(
        {
          tripDeletionStatus: 'loading',
          tripDeletionError: null,
          tripDeletionTargetId: tripId,
        },
        false,
        'trip/delete:start',
      );

      try {
        await deleteTripApi(tripId);
        const isDeletingCurrentTrip = get().currentTrip?.tripId === tripId;

        if (isDeletingCurrentTrip) {
          set(
            {
              ...getEmptyTripPlanningData(),
              trips: get().trips.filter((trip) => trip.tripId !== tripId),
              tripsStatus: get().tripsStatus,
              tripsError: get().tripsError,
              activePlannerPanel: 'trips',
              tripCreationStatus: get().tripCreationStatus,
              tripCreationError: get().tripCreationError,
              tripUpdateStatus: get().tripUpdateStatus,
              tripUpdateError: get().tripUpdateError,
              tripDeletionStatus: 'ready',
              tripDeletionError: null,
              tripDeletionTargetId: null,
              ...pickDayItemMutationState(get()),
              tripBootstrapStatus: 'idle',
              tripBootstrapError: null,
            },
            false,
            'trip/delete:success-current',
          );
        } else {
          set(
            (state) => ({
              trips: state.trips.filter((trip) => trip.tripId !== tripId),
              tripDeletionStatus: 'ready',
              tripDeletionError: null,
              tripDeletionTargetId: null,
            }),
            false,
            'trip/delete:success',
          );
        }

        void get().fetchTrips();
      } catch (error) {
        set(
          {
            tripDeletionStatus: 'error',
            tripDeletionError: getErrorMessage(error),
            tripDeletionTargetId: null,
          },
          false,
          'trip/delete:error',
        );
      }
    },

    bootstrapTrip: async (tripId) => {
      if (get().tripBootstrapStatus === 'loading') {
        return;
      }

      set(
        {
          activePlannerPanel: 'trips',
          lastBootstrapTripId: tripId,
          tripBootstrapStatus: 'loading',
          tripBootstrapError: null,
        },
        false,
        'trip/bootstrap:start',
      );

      await completeBootstrap(tripId);
    },

    fetchTrip: async (tripId) => {
      set(
        {
          tripStatus: 'loading',
          tripError: null,
        },
        false,
        'trip/fetch:start',
      );

      try {
        const currentTrip = await getTrip(tripId);

        set(
          {
            currentTrip,
            tripStatus: 'ready',
            tripError: null,
          },
          false,
          'trip/fetch:success',
        );
      } catch (error) {
        const errorMessage = getErrorMessage(error);

        set(
          {
            currentTrip: null,
            tripStatus: 'error',
            tripError: errorMessage,
          },
          false,
          'trip/fetch:error',
        );

        throw error instanceof Error ? error : new Error(errorMessage);
      }
    },

    fetchTripDays: async (tripId) => {
      set(
        {
          daysStatus: 'loading',
          daysError: null,
        },
        false,
        'trip/days:start',
      );

      try {
        const response = await getTripDays(tripId);
        pruneTripDayCaches(
          tripId,
          response.days.map((day) => day.dayNumber),
        );

        set(
          (state) => ({
            days: response.days,
            daysStatus: 'ready',
            daysError: null,
            selectedDayNumber:
              state.selectedDayNumber &&
              response.days.some((day) => day.dayNumber === state.selectedDayNumber)
                ? state.selectedDayNumber
                : (response.days[0]?.dayNumber ?? null),
          }),
          false,
          'trip/days:success',
        );
      } catch (error) {
        const errorMessage = getErrorMessage(error);

        set(
          {
            days: [],
            daysStatus: 'error',
            daysError: errorMessage,
          },
          false,
          'trip/days:error',
        );

        throw error instanceof Error ? error : new Error(errorMessage);
      }
    },

    selectDay: (dayNumber) => {
      set(
        {
          selectedDayNumber: dayNumber,
        },
        false,
        'trip/day:select',
      );
    },

    fetchDayItems: async (tripId, dayNumber) => {
      try {
        await loadDayItems(tripId, dayNumber);
      } catch {
        return;
      }
    },

    createDayItem: async (tripId, dayNumber, request) => {
      setDayItemCreationState(
        {
          dayItemCreationStatus: 'loading',
          dayItemCreationError: null,
          dayItemCreationTargetPlaceId: request.placeId,
          dayItemUpdateError: null,
          dayItemDeletionError: null,
          dayItemReorderError: null,
          dayItemMoveError: null,
        },
        'trip/day-item:create:start',
      );

      try {
        await createTripDayItemApi(tripId, dayNumber, request);
        invalidateDayRoute(tripId, dayNumber);
        await loadDayItems(tripId, dayNumber, { force: true });

        setDayItemCreationState(
          {
            dayItemCreationStatus: 'ready',
            dayItemCreationError: null,
            dayItemCreationTargetPlaceId: request.placeId,
          },
          'trip/day-item:create:success',
        );
      } catch (error) {
        setDayItemCreationState(
          {
            dayItemCreationStatus: 'error',
            dayItemCreationError: getErrorMessage(error),
            dayItemCreationTargetPlaceId: request.placeId,
          },
          'trip/day-item:create:error',
        );

        throw error instanceof Error ? error : new Error(getErrorMessage(error));
      }
    },

    updateDayItem: async (tripId, dayNumber, itemId, request) => {
      setDayItemUpdateState(
        {
          dayItemUpdateStatus: 'loading',
          dayItemUpdateError: null,
          dayItemUpdateTargetId: itemId,
          dayItemCreationError: null,
          dayItemDeletionError: null,
          dayItemReorderError: null,
          dayItemMoveError: null,
        },
        'trip/day-item:update:start',
      );

      try {
        await updateTripDayItemApi(tripId, dayNumber, itemId, request);
        invalidateDayRoute(tripId, dayNumber);
        setCachedDayItemTravelMethod(
          tripId,
          dayNumber,
          itemId,
          toDisplayedTripTravelMethod(request.travelMethod),
        );
        setDayItemUpdateState(
          {
            dayItemUpdateStatus: 'ready',
            dayItemUpdateError: null,
            dayItemUpdateTargetId: null,
          },
          'trip/day-item:update:success',
        );
      } catch (error) {
        setDayItemUpdateState(
          {
            dayItemUpdateStatus: 'error',
            dayItemUpdateError: getErrorMessage(error),
            dayItemUpdateTargetId: null,
          },
          'trip/day-item:update:error',
        );
      }
    },

    deleteDayItem: async (tripId, dayNumber, itemId) => {
      setDayItemDeletionState(
        {
          dayItemDeletionStatus: 'loading',
          dayItemDeletionError: null,
          dayItemDeletionTargetId: itemId,
          dayItemCreationError: null,
          dayItemUpdateError: null,
          dayItemReorderError: null,
          dayItemMoveError: null,
        },
        'trip/day-item:delete:start',
      );

      try {
        await deleteTripDayItemApi(tripId, dayNumber, itemId);
        invalidateDayRoute(tripId, dayNumber);
        removeCachedDayItem(tripId, dayNumber, itemId);

        setDayItemDeletionState(
          {
            dayItemDeletionStatus: 'ready',
            dayItemDeletionError: null,
            dayItemDeletionTargetId: null,
          },
          'trip/day-item:delete:success',
        );
      } catch (error) {
        setDayItemDeletionState(
          {
            dayItemDeletionStatus: 'error',
            dayItemDeletionError: getErrorMessage(error),
            dayItemDeletionTargetId: null,
          },
          'trip/day-item:delete:error',
        );
      }
    },

    moveDayItem: async (tripId, dayNumber, itemId, request) => {
      setDayItemMoveState(
        {
          dayItemCreationError: null,
          dayItemUpdateError: null,
          dayItemDeletionError: null,
          dayItemReorderError: null,
          dayItemMoveStatus: 'loading',
          dayItemMoveError: null,
          dayItemMoveTargetId: itemId,
        },
        'trip/day-item:move:start',
      );

      try {
        await moveTripDayItemApi(tripId, dayNumber, itemId, request);
        invalidateDayRoute(tripId, dayNumber);
        invalidateDayRoute(tripId, request.targetDayNumber);
        moveCachedDayItem(tripId, dayNumber, request.targetDayNumber, itemId);

        setDayItemMoveState(
          {
            dayItemMoveStatus: 'ready',
            dayItemMoveError: null,
            dayItemMoveTargetId: null,
          },
          'trip/day-item:move:success',
        );
      } catch (error) {
        setDayItemMoveState(
          {
            dayItemMoveStatus: 'error',
            dayItemMoveError: getErrorMessage(error),
            dayItemMoveTargetId: null,
          },
          'trip/day-item:move:error',
        );
      }
    },

    reorderDayItems: async (tripId, dayNumber, request, targetItemId) => {
      setDayItemReorderState(
        {
          dayItemCreationError: null,
          dayItemUpdateError: null,
          dayItemDeletionError: null,
          dayItemMoveError: null,
          dayItemReorderStatus: 'loading',
          dayItemReorderError: null,
          dayItemReorderTargetId: targetItemId,
        },
        'trip/day-item:reorder:start',
      );

      try {
        await reorderTripDayItemsApi(tripId, dayNumber, request);
        invalidateDayRoute(tripId, dayNumber);
        reorderCachedDayItems(tripId, dayNumber, request.itemIds);

        setDayItemReorderState(
          {
            dayItemReorderStatus: 'ready',
            dayItemReorderError: null,
            dayItemReorderTargetId: null,
          },
          'trip/day-item:reorder:success',
        );
      } catch (error) {
        setDayItemReorderState(
          {
            dayItemReorderStatus: 'error',
            dayItemReorderError: getErrorMessage(error),
            dayItemReorderTargetId: null,
          },
          'trip/day-item:reorder:error',
        );
      }
    },

    generateDayRoute: async (tripId, dayNumber) => {
      const cacheKey = getTripDayCacheKey(tripId, dayNumber);
      const currentState = get();
      const currentDayRouteStatus = currentState.dayRouteStatusByDayNumber[cacheKey] ?? 'idle';

      if (currentDayRouteStatus === 'loading' || currentDayRouteStatus === 'ready') {
        return;
      }

      set(
        (state) => ({
          dayRouteStatusByDayNumber: {
            ...state.dayRouteStatusByDayNumber,
            [cacheKey]: 'loading',
          },
          dayRouteErrorByDayNumber: {
            ...state.dayRouteErrorByDayNumber,
            [cacheKey]: null,
          },
        }),
        false,
        'trip/day-route:start',
      );

      try {
        const response = await generateTripDayRoute(tripId, dayNumber);

        set(
          (state) => ({
            dayRouteByDayNumber: {
              ...state.dayRouteByDayNumber,
              [cacheKey]: response.routeSummary,
            },
            dayRouteSegmentsByDayNumber: {
              ...state.dayRouteSegmentsByDayNumber,
              [cacheKey]: response.segments,
            },
            dayRouteStatusByDayNumber: {
              ...state.dayRouteStatusByDayNumber,
              [cacheKey]: response.routeSummary !== null ? 'ready' : 'idle',
            },
            dayRouteErrorByDayNumber: {
              ...state.dayRouteErrorByDayNumber,
              [cacheKey]: null,
            },
          }),
          false,
          'trip/day-route:success',
        );
      } catch (error) {
        set(
          (state) => ({
            dayRouteStatusByDayNumber: {
              ...state.dayRouteStatusByDayNumber,
              [cacheKey]: 'error',
            },
            dayRouteErrorByDayNumber: {
              ...state.dayRouteErrorByDayNumber,
              [cacheKey]: getErrorMessage(error),
            },
          }),
          false,
          'trip/day-route:error',
        );
      }
    },

    clearTripPlanning: () => {
      set(
        {
          ...getEmptyTripPlanningData(),
          trips: get().trips,
          tripsStatus: get().tripsStatus,
          tripsError: get().tripsError,
          activePlannerPanel: 'trips',
          tripCreationStatus: 'idle',
          tripCreationError: null,
          ...getTripMutationState(),
          ...getDayItemMutationState(),
          tripBootstrapStatus: 'idle',
          tripBootstrapError: null,
        },
        false,
        'trip/clear',
      );
    },
  };
};
