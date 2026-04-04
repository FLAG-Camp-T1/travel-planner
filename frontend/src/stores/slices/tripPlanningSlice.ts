import {
  createTrip as createTripApi,
  generateTripDayRoute,
  getTrip,
  getTripDayItems,
  getTripDays,
} from '@/api/tripApi';
import type { AppStoreCreator, TripPlanningSlice } from '../types';

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

export const createTripPlanningSlice: AppStoreCreator<TripPlanningSlice> = (set, get) => {
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
    tripCreationStatus: 'idle',
    tripCreationError: null,
    tripBootstrapStatus: 'idle',
    tripBootstrapError: null,

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
        },
        false,
        'trip/create:start',
      );

      try {
        const createdTrip = await createTripApi(request);

        set(
          {
            ...getEmptyTripPlanningData(),
            lastBootstrapTripId: createdTrip.tripId,
            tripCreationStatus: 'ready',
            tripCreationError: null,
            tripBootstrapStatus: 'loading',
            tripBootstrapError: null,
          },
          false,
          'trip/create:success',
        );

        await completeBootstrap(createdTrip.tripId);
      } catch (error) {
        set(
          {
            tripCreationStatus: 'error',
            tripCreationError: getErrorMessage(error),
          },
          false,
          'trip/create:error',
        );
      }
    },

    bootstrapTrip: async (tripId) => {
      if (get().tripBootstrapStatus === 'loading') {
        return;
      }

      set(
        {
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
      const currentState = get();
      const currentDayStatus = currentState.dayItemsStatusByDayNumber[dayNumber] ?? 'idle';
      const hasCachedItems = Object.prototype.hasOwnProperty.call(
        currentState.dayItemsByDayNumber,
        dayNumber,
      );

      if (currentDayStatus === 'loading' || hasCachedItems) {
        return;
      }

      set(
        (state) => ({
          dayItemsStatusByDayNumber: {
            ...state.dayItemsStatusByDayNumber,
            [dayNumber]: 'loading',
          },
          dayItemsErrorByDayNumber: {
            ...state.dayItemsErrorByDayNumber,
            [dayNumber]: null,
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
              [dayNumber]: response.items,
            },
            dayItemsStatusByDayNumber: {
              ...state.dayItemsStatusByDayNumber,
              [dayNumber]: 'ready',
            },
            dayItemsErrorByDayNumber: {
              ...state.dayItemsErrorByDayNumber,
              [dayNumber]: null,
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
              [dayNumber]: 'error',
            },
            dayItemsErrorByDayNumber: {
              ...state.dayItemsErrorByDayNumber,
              [dayNumber]: getErrorMessage(error),
            },
          }),
          false,
          'trip/day-items:error',
        );
      }
    },

    generateDayRoute: async (tripId, dayNumber) => {
      const currentState = get();
      const currentDayRouteStatus = currentState.dayRouteStatusByDayNumber[dayNumber] ?? 'idle';
      const hasCachedRoute = Object.prototype.hasOwnProperty.call(
        currentState.dayRouteByDayNumber,
        dayNumber,
      );

      if (currentDayRouteStatus === 'loading' || hasCachedRoute) {
        return;
      }

      set(
        (state) => ({
          dayRouteStatusByDayNumber: {
            ...state.dayRouteStatusByDayNumber,
            [dayNumber]: 'loading',
          },
          dayRouteErrorByDayNumber: {
            ...state.dayRouteErrorByDayNumber,
            [dayNumber]: null,
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
              [dayNumber]: response.routeSummary,
            },
            dayRouteSegmentsByDayNumber: {
              ...state.dayRouteSegmentsByDayNumber,
              [dayNumber]: response.segments,
            },
            dayRouteStatusByDayNumber: {
              ...state.dayRouteStatusByDayNumber,
              [dayNumber]: 'ready',
            },
            dayRouteErrorByDayNumber: {
              ...state.dayRouteErrorByDayNumber,
              [dayNumber]: null,
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
              [dayNumber]: 'error',
            },
            dayRouteErrorByDayNumber: {
              ...state.dayRouteErrorByDayNumber,
              [dayNumber]: getErrorMessage(error),
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
          tripCreationStatus: 'idle',
          tripCreationError: null,
          tripBootstrapStatus: 'idle',
          tripBootstrapError: null,
        },
        false,
        'trip/clear',
      );
    },
  };
};
