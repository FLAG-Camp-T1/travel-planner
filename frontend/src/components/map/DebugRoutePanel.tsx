import { useState } from 'react';
import { useAppStore } from '@/stores/useAppStore';

const DebugRoutePanel = () => {
  // Form text stays local; the shared route request/result lives in Zustand.
  const [origin, setOrigin] = useState('');
  const [dest, setDest] = useState('');
  const clearRoute = useAppStore((state) => state.clearRoute);
  const requestRoute = useAppStore((state) => state.requestRoute);
  const routeStatus = useAppStore((state) => state.routeStatus);

  const handleApply = () => {
    const trimmedOrigin = origin.trim();
    const trimmedDest = dest.trim();

    if (trimmedOrigin && trimmedDest) {
      void requestRoute(trimmedOrigin, trimmedDest);
    }
  };

  const handleClear = () => {
    setOrigin('');
    setDest('');
    clearRoute();
  };

  return (
    <div className="absolute top-4 left-4 z-[5] w-80 rounded-md border border-gray-200 bg-white p-4 shadow-lg">
      <div className="text-sm font-bold text-gray-700 mb-3 border-b pb-2">[DEV] Route Tester</div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Origin Place ID</label>
          <input
            type="text"
            className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="e.g. ChIJVVVVVYx3j4ARP-3NGldc8qQ"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Destination Place ID
          </label>
          <input
            type="text"
            className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
            value={dest}
            onChange={(e) => setDest(e.target.value)}
            placeholder="e.g. ChIJJcSDXXx3j4ARRef7L0P3GpY"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={handleApply}
            disabled={routeStatus === 'loading' || !origin.trim() || !dest.trim()}
            className="flex-1 bg-blue-600 text-white text-sm font-medium py-1.5 rounded hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {routeStatus === 'loading' ? 'Drawing...' : 'Draw Route'}
          </button>
          <button
            onClick={handleClear}
            className="flex-1 bg-gray-100 text-gray-700 text-sm font-medium py-1.5 rounded hover:bg-gray-200 border border-gray-300 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default DebugRoutePanel;
