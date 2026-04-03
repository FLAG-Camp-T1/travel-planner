import type { DayRouteSegment, ItineraryItem } from '@/api/tripApi';

type RouteSegmentListProps = {
  itemsById: Record<number, ItineraryItem>;
  segments: DayRouteSegment[];
};

const formatDistance = (distanceMeters: number) => {
  if (distanceMeters < 1000) {
    return `${distanceMeters} m`;
  }

  return `${(distanceMeters / 1000).toFixed(1)} km`;
};

const formatDuration = (durationSeconds: number) => {
  const totalMinutes = Math.round(durationSeconds / 60);

  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return minutes === 0 ? `${hours} hr` : `${hours} hr ${minutes} min`;
};

const getItemLabel = (itemsById: Record<number, ItineraryItem>, itemId: number) => {
  return itemsById[itemId]?.name ?? `Item ${itemId}`;
};

export default function RouteSegmentList({ itemsById, segments }: RouteSegmentListProps) {
  return (
    <div className="divide-y divide-gray-100">
      {segments.map((segment, index) => (
        <div key={`${segment.fromItemId}-${segment.toItemId}-${index}`} className="px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {getItemLabel(itemsById, segment.fromItemId)}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                to {getItemLabel(itemsById, segment.toItemId)}
              </p>
            </div>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
              {segment.travelMethod}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
            <span className="rounded-full bg-gray-50 px-3 py-1">
              {formatDistance(segment.distanceMeters)}
            </span>
            <span className="rounded-full bg-gray-50 px-3 py-1">
              {formatDuration(segment.durationSeconds)}
            </span>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
              Read-only segment
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
