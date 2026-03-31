import { fetchRoute } from '@/api/routeApi';
import type { AppStoreCreator, RouteSlice } from '../types';

const DEFAULT_TRAVEL_MODE = 'DRIVE';

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : 'Failed to request route.';
};

export const createRouteSlice: AppStoreCreator<RouteSlice> = (set) => ({
  originId: null,
  destinationId: null,
  routeSummary: null,
  routeStatus: 'idle',
  routeError: null,

  requestRoute: async (originId, destinationId) => {
    set(
      {
        originId,
        destinationId,
        routeSummary: null,
        routeStatus: 'loading',
        routeError: null,
      },
      false,
      'route/request:start',
    );

    try {
      const routeSummary = await fetchRoute({
        originPlaceId: originId,
        destinationPlaceId: destinationId,
        travelMode: DEFAULT_TRAVEL_MODE,
      });

      set(
        {
          originId,
          destinationId,
          routeSummary,
          routeStatus: 'ready',
          routeError: null,
        },
        false,
        'route/request:success',
      );
    } catch (error) {
      set(
        {
          originId,
          destinationId,
          routeSummary: null,
          routeStatus: 'error',
          routeError: getErrorMessage(error),
        },
        false,
        'route/request:error',
      );
    }
  },

  clearRoute: () => {
    set(
      {
        originId: null,
        destinationId: null,
        routeSummary: null,
        routeStatus: 'idle',
        routeError: null,
      },
      false,
      'route/clear',
    );
  },
});
