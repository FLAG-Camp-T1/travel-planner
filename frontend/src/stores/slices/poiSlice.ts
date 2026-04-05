import { searchPOI } from '@/api/poiApi';
import type { AppStoreCreator, POISlice } from '../types';

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : 'Failed to search POI.';
};

export const createPOISlice: AppStoreCreator<POISlice> = (set) => {
  let activeRequestId = 0;

  return {
    poiResults: [],
    poiStatus: 'idle',
    poiError: null,
    selectedPOI: null,
    hoveredPOI: null,

    searchPOI: async (request) => {
      activeRequestId += 1;
      const requestId = activeRequestId;

      set(
        {
          poiResults: [],
          poiStatus: 'loading',
          poiError: null,
          selectedPOI: null,
          hoveredPOI: null,
        },
        false,
        'poi/search:start',
      );

      try {
        const results = await searchPOI(request);
        if (requestId !== activeRequestId) {
          return;
        }

        set(
          {
            poiResults: results,
            poiStatus: 'ready',
            poiError: null,
            selectedPOI: null,
            hoveredPOI: null,
          },
          false,
          'poi/search:success',
        );
      } catch (error) {
        if (requestId !== activeRequestId) {
          return;
        }

        set(
          {
            poiResults: [],
            poiStatus: 'error',
            poiError: getErrorMessage(error),
            selectedPOI: null,
            hoveredPOI: null,
          },
          false,
          'poi/search:error',
        );
      }
    },

    selectPOI: (poi) => {
      set({ selectedPOI: poi }, false, 'poi/select');
    },

    setHoveredPOI: (poi) => {
      set({ hoveredPOI: poi }, false, 'poi/hover');
    },

    clearPOIResults: () => {
      activeRequestId += 1;

      set(
        {
          poiResults: [],
          poiStatus: 'idle',
          poiError: null,
          selectedPOI: null,
          hoveredPOI: null,
        },
        false,
        'poi/clear',
      );
    },
  };
};
