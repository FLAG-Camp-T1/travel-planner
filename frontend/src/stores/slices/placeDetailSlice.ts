import { getPlaceDetails } from '@/api/placeApi';
import type { AppStoreCreator, PlaceDetailSlice } from '../types';

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : 'Failed to load place details.';
};

export const createPlaceDetailSlice: AppStoreCreator<PlaceDetailSlice> = (set) => {
  let activeRequestId = 0;

  return {
    activeDetailOverlay: null,
    placeDetail: null,
    placeDetailStatus: 'idle',
    placeDetailError: null,

    openPlaceDetail: async (overlay) => {
      activeRequestId += 1;
      const requestId = activeRequestId;

      set(
        {
          activeDetailOverlay: overlay,
          placeDetail: null,
          placeDetailStatus: 'loading',
          placeDetailError: null,
        },
        false,
        'placeDetail/open:start',
      );

      try {
        const placeDetail = await getPlaceDetails(overlay.placeId);
        if (requestId !== activeRequestId) {
          return;
        }

        set(
          {
            activeDetailOverlay: overlay,
            placeDetail,
            placeDetailStatus: 'ready',
            placeDetailError: null,
          },
          false,
          'placeDetail/open:success',
        );
      } catch (error) {
        if (requestId !== activeRequestId) {
          return;
        }

        set(
          {
            activeDetailOverlay: overlay,
            placeDetail: null,
            placeDetailStatus: 'error',
            placeDetailError: getErrorMessage(error),
          },
          false,
          'placeDetail/open:error',
        );
      }
    },

    closePlaceDetail: () => {
      activeRequestId += 1;

      set(
        {
          activeDetailOverlay: null,
          placeDetail: null,
          placeDetailStatus: 'idle',
          placeDetailError: null,
        },
        false,
        'placeDetail/close',
      );
    },
  };
};
