import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@/stores/useAppStore';
import type { POIDto } from '@/api/poiApi';
import type { ActiveDetailOverlay } from '@/stores/types';

const toPoiDetailOverlay = (poi: POIDto): ActiveDetailOverlay => ({
  kind: 'poi',
  placeId: poi.placeId,
  sourceSummary: {
    placeId: poi.placeId,
    name: poi.name,
    address: poi.address,
    latitude: poi.latitude,
    longitude: poi.longitude,
    categoryLabel: poi.poiType,
    rating: poi.rating,
  },
});

export default function POIResultList() {
  const {
    poiResults,
    poiStatus,
    poiError,
    selectedPOI,
    hoveredPOI,
    selectPOI,
    setHoveredPOI,
    openPlaceDetail,
  } = useAppStore(
    useShallow((state) => ({
      poiResults: state.poiResults,
      poiStatus: state.poiStatus,
      poiError: state.poiError,
      selectedPOI: state.selectedPOI,
      hoveredPOI: state.hoveredPOI,
      selectPOI: state.selectPOI,
      setHoveredPOI: state.setHoveredPOI,
      openPlaceDetail: state.openPlaceDetail,
    })),
  );

  const handleClick = (poi: POIDto) => {
    selectPOI(poi);
    void openPlaceDetail(toPoiDetailOverlay(poi));
  };

  if (poiStatus === 'idle') {
    return null;
  }

  if (poiStatus === 'loading') {
    return <div className="text-sm text-gray-500 py-2">Searching...</div>;
  }

  if (poiStatus === 'error') {
    return <div className="text-sm text-red-500 py-2">{poiError ?? 'Search failed.'}</div>;
  }

  if (poiResults.length === 0) {
    return <div className="text-sm text-gray-500 py-2">No results found.</div>;
  }

  return (
    <ul className="space-y-2">
      {poiResults.map((poi, index) => {
        const poiTypeLabel = poi.poiType?.trim();
        const isSelected = selectedPOI?.placeId === poi.placeId;
        const isHovered = hoveredPOI?.placeId === poi.placeId;

        return (
          <li
            key={poi.placeId}
            onClick={() => handleClick(poi)}
            onMouseEnter={() => setHoveredPOI(poi)}
            onMouseLeave={() => setHoveredPOI(null)}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              isSelected
                ? 'bg-blue-50 border-blue-400 shadow-md'
                : isHovered
                  ? 'bg-blue-50/60 border-blue-300 shadow-sm'
                  : 'bg-gray-50 border-gray-100 hover:border-blue-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : isHovered
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-blue-600 text-sm truncate">{poi.name}</div>
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">{poi.address}</div>
                </div>
              </div>
              {poi.rating != null && (
                <span className="shrink-0 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  ★ {poi.rating.toFixed(1)}
                </span>
              )}
            </div>
            {poiTypeLabel ? (
              <div className="mt-2 ml-9">
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                  {poiTypeLabel}
                </span>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
