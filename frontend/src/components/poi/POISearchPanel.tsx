import { useState, useRef, useCallback } from 'react';
import { useAppStore } from '@/stores/useAppStore';

const POI_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'museum', label: 'Museum' },
  { value: 'lodging', label: 'Hotel' },
  { value: 'tourist_attraction', label: 'Attraction' },
  { value: 'park', label: 'Park' },
];

export default function POISearchPanel() {
  const [keyword, setKeyword] = useState('');
  const [poiType, setPoiType] = useState('');

  const searchPOI = useAppStore((state) => state.searchPOI);
  const clearPOIResults = useAppStore((state) => state.clearPOIResults);
  const poiStatus = useAppStore((state) => state.poiStatus);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedSearch = useCallback(
    (kw: string, type: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const trimmed = kw.trim();
        if (!trimmed) return;
        void searchPOI({ keyword: trimmed, poiType: type || undefined });
      }, 400);
    },
    [searchPOI],
  );

  const handleSearch = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = keyword.trim();
    if (!trimmed) return;

    void searchPOI({
      keyword: trimmed,
      poiType: poiType || undefined,
    });
  };

  const handleClear = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setKeyword('');
    setPoiType('');
    clearPOIResults();
  };

  const handleKeywordChange = (value: string) => {
    setKeyword(value);
    debouncedSearch(value, poiType);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

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

      <div>
        <select
          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
          value={poiType}
          onChange={(e) => setPoiType(e.target.value)}
        >
          {POI_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
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
