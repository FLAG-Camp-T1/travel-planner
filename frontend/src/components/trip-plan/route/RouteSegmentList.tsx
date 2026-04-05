import type { DayRouteSegment, ItineraryItem } from '@/api/tripApi';
import { getTravelMethodPalette } from '../travelMethodPresentation';
import { formatDistance, formatSegmentDuration } from './routePresentation';

type RouteSegmentListProps = {
  itemsById: Record<number, ItineraryItem>;
  segments: DayRouteSegment[];
};

const getItemLabel = (itemsById: Record<number, ItineraryItem>, itemId: number) => {
  return itemsById[itemId]?.name ?? `Item ${itemId}`;
};

export default function RouteSegmentList({ itemsById, segments }: RouteSegmentListProps) {
  return (
    <div className="divide-y divide-gray-100">
      {segments.map((segment, index) => {
        const palette = getTravelMethodPalette(segment.travelMethod);

        return (
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
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${palette.capsuleClassName} ${palette.textClassName}`}
              >
                {segment.travelMethod}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
              <span className="rounded-full bg-gray-50 px-3 py-1">
                {formatDistance(segment.distanceMeters)}
              </span>
              <span className="rounded-full bg-gray-50 px-3 py-1">
                {formatSegmentDuration(segment.durationSeconds)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
