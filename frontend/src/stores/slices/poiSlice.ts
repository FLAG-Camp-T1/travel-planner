import { searchPOI } from '@/api/poiApi';
import type { AppStoreCreator, POISlice } from '../types';

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : 'Failed to search POI.';
};

export const createPOISlice: AppStoreCreator<POISlice> = (set) => ({
  poiResults: [],
  poiStatus: 'idle',
  poiError: null,
  selectedPOI: null,

  searchPOI: async (request) => {
    set(
      {
        poiResults: [],
        poiStatus: 'loading',
        poiError: null,
      },
      false,
      'poi/search:start',
    );

    try {
      const results = await searchPOI(request);

      set(
        {
          poiResults: results,
          poiStatus: 'ready',
          poiError: null,
        },
        false,
        'poi/search:success',
      );
    } catch (error) {
      set(
        {
          poiResults: [],
          poiStatus: 'error',
          poiError: getErrorMessage(error),
        },
        false,
        'poi/search:error',
      );
    }
  },

  selectPOI: (poi) => {
    set({ selectedPOI: poi }, false, 'poi/select');
  },

  clearPOIResults: () => {
    set(
      {
        poiResults: [],
        poiStatus: 'idle',
        poiError: null,
        selectedPOI: null,
      },
      false,
      'poi/clear',
    );
  },
});
