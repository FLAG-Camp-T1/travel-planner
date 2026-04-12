import { useState, useRef, useCallback, useEffect } from 'react';
import { createPoiDetailOverlayFromPoi } from '@/components/place/placeDetailOverlayFactory';
import { useAppStore } from '@/stores/useAppStore';
import { DEFAULT_POI_SEARCH_RADIUS_METERS } from '@/stores/slices/mapViewSlice';

type POISearchPanelProps = {
  layout?: 'sidebar' | 'topbar';
};

export default function POISearchPanel({ layout = 'sidebar' }: POISearchPanelProps) {
  const [keyword, setKeyword] = useState('');

  const searchPOI = useAppStore((state) => state.searchPOI);
  const clearPOIResults = useAppStore((state) => state.clearPOIResults);
  const closePlaceDetail = useAppStore((state) => state.closePlaceDetail);
  const lastPOISearchRequest = useAppStore((state) => state.lastPOISearchRequest);
  const openPlaceDetail = useAppStore((state) => state.openPlaceDetail);
  const poiResults = useAppStore((state) => state.poiResults);
  const setActivePlannerPanel = useAppStore((state) => state.setActivePlannerPanel);
  const poiStatus = useAppStore((state) => state.poiStatus);
  const mapCenter = useAppStore((state) => state.mapCenter);
  const selectPOI = useAppStore((state) => state.selectPOI);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buildSearchRequest = useCallback(
    (kw: string) => ({
      keyword: kw,
      location: `${mapCenter.lat},${mapCenter.lng}`,
      radius: DEFAULT_POI_SEARCH_RADIUS_METERS,
    }),
    [mapCenter],
  );

  const debouncedSearch = useCallback(
    (kw: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const trimmed = kw.trim();
        if (!trimmed) return;
        setActivePlannerPanel('explore');
        void searchPOI(buildSearchRequest(trimmed));
      }, 400);
    },
    [buildSearchRequest, searchPOI, setActivePlannerPanel],
  );

  const handleSearch = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = keyword.trim();
    if (!trimmed) return;

    closePlaceDetail();
    setActivePlannerPanel('explore');
    void searchPOI(buildSearchRequest(trimmed));
  };

  const handleSelectSingleSearchResult = useCallback(() => {
    const trimmed = keyword.trim();
    if (
      poiStatus !== 'ready' ||
      poiResults.length !== 1 ||
      !lastPOISearchRequest ||
      lastPOISearchRequest.keyword.trim() !== trimmed
    ) {
      return false;
    }

    const [poi] = poiResults;
    selectPOI(poi);
    void openPlaceDetail(createPoiDetailOverlayFromPoi(poi));
    return true;
  }, [keyword, lastPOISearchRequest, openPlaceDetail, poiResults, poiStatus, selectPOI]);

  const handleClear = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setKeyword('');
    closePlaceDetail();
    clearPOIResults();
  };

  const handleKeywordChange = (value: string) => {
    setActivePlannerPanel('explore');
    setKeyword(value);
    debouncedSearch(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (handleSelectSingleSearchResult()) {
        return;
      }
      handleSearch();
    }
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  if (layout === 'topbar') {
    return (
      <div className="flex w-full min-w-0 flex-wrap items-center gap-2">
        <input
          type="text"
          className="min-w-0 basis-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:flex-1"
          value={keyword}
          onChange={(e) => handleKeywordChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search places near the current map view..."
        />

        <button
          onClick={handleSearch}
          disabled={poiStatus === 'loading' || !keyword.trim()}
          className="flex-1 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
        >
          {poiStatus === 'loading' ? 'Searching...' : 'Search'}
        </button>

        <button
          onClick={handleClear}
          className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 sm:flex-none"
        >
          Clear
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <input
          type="text"
          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          value={keyword}
          onChange={(e) => handleKeywordChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search places..."
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSearch}
          disabled={poiStatus === 'loading' || !keyword.trim()}
          className="flex-1 bg-blue-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {poiStatus === 'loading' ? 'Searching...' : 'Search'}
        </button>
        <button
          onClick={handleClear}
          className="flex-1 bg-gray-100 text-gray-700 text-sm font-medium py-2 rounded-lg hover:bg-gray-200 border border-gray-300 transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
