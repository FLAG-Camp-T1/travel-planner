import { generateTripDayRoute, getTrip, getTripDayItems, getTripDays } from '@/api/tripApi';
import type { AppStoreCreator, TripPlanningSlice } from '../types';

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : 'Trip planning request failed.';
};

export const createTripPlanningSlice: AppStoreCreator<TripPlanningSlice> = (set, get) => ({
  currentTrip: null,
  days: [],
  selectedDayNumber: null,
  dayItemsByDayNumber: {},
  dayItemsStatusByDayNumber: {},
  dayItemsErrorByDayNumber: {},
  dayRouteByDayNumber: {},
  dayRouteSegmentsByDayNumber: {},
  dayRouteStatusByDayNumber: {},
  dayRouteErrorByDayNumber: {},
  tripStatus: 'idle',
  daysStatus: 'idle',
  tripError: null,
  daysError: null,

  bootstrapTrip: async (tripId) => {
    await get().fetchTrip(tripId);
    await get().fetchTripDays(tripId);

    const firstDayNumber = get().days[0]?.dayNumber ?? null;
    if (firstDayNumber !== null) {
      get().selectDay(firstDayNumber);
    }
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
      set(
        {
          currentTrip: null,
          tripStatus: 'error',
          tripError: getErrorMessage(error),
        },
        false,
        'trip/fetch:error',
      );
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
      set(
        {
          days: [],
          daysStatus: 'error',
          daysError: getErrorMessage(error),
        },
        false,
        'trip/days:error',
      );
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
        currentTrip: null,
        days: [],
        selectedDayNumber: null,
        dayItemsByDayNumber: {},
        dayItemsStatusByDayNumber: {},
        dayItemsErrorByDayNumber: {},
        dayRouteByDayNumber: {},
        dayRouteSegmentsByDayNumber: {},
        dayRouteStatusByDayNumber: {},
        dayRouteErrorByDayNumber: {},
        tripStatus: 'idle',
        daysStatus: 'idle',
        tripError: null,
        daysError: null,
      },
      false,
      'trip/clear',
    );
  },
});
