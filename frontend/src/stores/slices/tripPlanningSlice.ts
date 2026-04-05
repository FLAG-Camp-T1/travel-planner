import {
  createTrip as createTripApi,
  deleteTrip as deleteTripApi,
  generateTripDayRoute,
  getTrips,
  getTrip,
  getTripDayItems,
  getTripDays,
  updateTrip as updateTripApi,
} from '@/api/tripApi';
import type { AppStoreCreator, TripPlanningSlice } from '../types';

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

export const createTripPlanningSlice: AppStoreCreator<TripPlanningSlice> = (set, get) => {
  let activeTripsRequestId = 0;

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
      const cacheKey = getTripDayCacheKey(tripId, dayNumber);
      const currentState = get();
      const currentDayStatus = currentState.dayItemsStatusByDayNumber[cacheKey] ?? 'idle';
      const hasCachedItems = Object.prototype.hasOwnProperty.call(
        currentState.dayItemsByDayNumber,
        cacheKey,
      );

      if (currentDayStatus === 'loading' || hasCachedItems) {
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
        set(
          (state) => ({
            dayItemsStatusByDayNumber: {
              ...state.dayItemsStatusByDayNumber,
              [cacheKey]: 'error',
            },
            dayItemsErrorByDayNumber: {
              ...state.dayItemsErrorByDayNumber,
              [cacheKey]: getErrorMessage(error),
            },
          }),
          false,
          'trip/day-items:error',
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
          tripBootstrapStatus: 'idle',
          tripBootstrapError: null,
        },
        false,
        'trip/clear',
      );
    },
  };
};
