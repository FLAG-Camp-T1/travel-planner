import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@/stores/useAppStore';
import type { POIDto } from '@/api/poiApi';

export default function POIResultList() {
  const { poiResults, poiStatus, poiError, selectedPOI, selectPOI } = useAppStore(
    useShallow((state) => ({
      poiResults: state.poiResults,
      poiStatus: state.poiStatus,
      poiError: state.poiError,
      selectedPOI: state.selectedPOI,
      selectPOI: state.selectPOI,
    })),
  );

  const handleClick = (poi: POIDto) => {
    selectPOI(poi);
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
      {poiResults.map((poi) => (
        <li
          key={poi.placeId}
          onClick={() => handleClick(poi)}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            selectedPOI?.placeId === poi.placeId
              ? 'bg-blue-50 border-blue-400 shadow-md'
              : 'bg-gray-50 border-gray-100 hover:border-blue-300 hover:shadow-md'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="font-medium text-blue-600 text-sm truncate">{poi.name}</div>
              <div className="text-xs text-gray-500 mt-1 line-clamp-2">{poi.address}</div>
            </div>
            {poi.rating != null && (
              <span className="shrink-0 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                ★ {poi.rating.toFixed(1)}
              </span>
            )}
          </div>
          <div className="mt-2">
            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
              {poi.poiType}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
