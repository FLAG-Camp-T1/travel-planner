import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { Search } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@/stores/useAppStore';

const CENTER_CHANGE_THRESHOLD_METERS = 250;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

const getDistanceMeters = (first: google.maps.LatLngLiteral, second: google.maps.LatLngLiteral) => {
  const earthRadiusMeters = 6371000;
  const latDelta = toRadians(second.lat - first.lat);
  const lngDelta = toRadians(second.lng - first.lng);
  const firstLat = toRadians(first.lat);
  const secondLat = toRadians(second.lat);
  const haversine =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(firstLat) * Math.cos(secondLat) * Math.sin(lngDelta / 2) * Math.sin(lngDelta / 2);

  return 2 * earthRadiusMeters * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
};

const SearchAreaPromptOverlay = () => {
  const map = useMap();
  const [promptSearchKey, setPromptSearchKey] = useState<string | null>(null);
  const {
    activePlannerPanel,
    lastPOISearchCenter,
    lastPOISearchRequest,
    mapCenter,
    poiStatus,
    searchPOI,
  } = useAppStore(
    useShallow((state) => ({
      activePlannerPanel: state.activePlannerPanel,
      lastPOISearchCenter: state.lastPOISearchCenter,
      lastPOISearchRequest: state.lastPOISearchRequest,
      mapCenter: state.mapCenter,
      poiStatus: state.poiStatus,
      searchPOI: state.searchPOI,
    })),
  );

  const hasSearchContext =
    activePlannerPanel === 'explore' &&
    lastPOISearchCenter !== null &&
    lastPOISearchRequest !== null &&
    lastPOISearchRequest.keyword.trim().length > 0;

  const currentSearchKey = useMemo(() => {
    if (!hasSearchContext || !lastPOISearchCenter || !lastPOISearchRequest) {
      return null;
    }

    return `${lastPOISearchRequest.keyword}::${lastPOISearchCenter.lat}:${lastPOISearchCenter.lng}`;
  }, [hasSearchContext, lastPOISearchCenter, lastPOISearchRequest]);

  const isCenterMeaningfullyDifferent =
    hasSearchContext &&
    getDistanceMeters(mapCenter, lastPOISearchCenter) >= CENTER_CHANGE_THRESHOLD_METERS;

  useEffect(() => {
    if (!map || !hasSearchContext) {
      return;
    }

    const updatePromptFromMapCenter = () => {
      const center = map.getCenter();
      if (!center || !lastPOISearchCenter) {
        setPromptSearchKey(null);
        return;
      }

      const movedDistance = getDistanceMeters(lastPOISearchCenter, {
        lat: center.lat(),
        lng: center.lng(),
      });
      setPromptSearchKey(
        movedDistance >= CENTER_CHANGE_THRESHOLD_METERS && currentSearchKey
          ? currentSearchKey
          : null,
      );
    };

    updatePromptFromMapCenter();
    const listener = map.addListener('idle', updatePromptFromMapCenter);
    return () => listener.remove();
  }, [currentSearchKey, hasSearchContext, lastPOISearchCenter, map]);

  const handleSearchThisArea = useCallback(() => {
    if (!lastPOISearchRequest) {
      return;
    }

    setPromptSearchKey(null);
    void searchPOI({
      ...lastPOISearchRequest,
      location: `${mapCenter.lat},${mapCenter.lng}`,
    });
  }, [lastPOISearchRequest, mapCenter, searchPOI]);

  const shouldShowPrompt =
    promptSearchKey !== null &&
    currentSearchKey !== null &&
    promptSearchKey === currentSearchKey &&
    hasSearchContext &&
    poiStatus !== 'loading' &&
    isCenterMeaningfullyDifferent;

  if (!shouldShowPrompt) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 top-4 z-[1080] flex justify-center px-4">
      <button
        type="button"
        onPointerDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onMouseDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          handleSearchThisArea();
        }}
        className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/96 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-[0_14px_32px_rgba(15,23,42,0.14)] backdrop-blur-sm"
      >
        <Search className="h-4 w-4" />
        <span>Search in this area</span>
      </button>
    </div>
  );
};

export default SearchAreaPromptOverlay;
