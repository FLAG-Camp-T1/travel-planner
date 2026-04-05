import POIResultList from '@/components/poi/POIResultList';
import { useAppStore } from '@/stores/useAppStore';

export default function ExplorePanel() {
  const poiStatus = useAppStore((state) => state.poiStatus);

  if (poiStatus !== 'idle') {
    return (
      <section className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-700">Search Results</h2>
            <p className="mt-1 text-sm text-gray-500">
              Review nearby matches from the current map-centered search.
            </p>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
            Places
          </span>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="px-4 py-4">
            <POIResultList />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-gray-700">Explore</h2>
        <p className="mt-1 text-sm text-gray-500">
          Search from the top bar to review nearby places from the current map view.
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-gray-300 bg-slate-50 px-4 py-5 text-sm text-gray-500">
        Search results will appear here as soon as you start exploring places.
      </div>
    </section>
  );
}
