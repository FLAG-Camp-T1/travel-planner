import type { DayRouteSegment, ItineraryItem } from '@/api/tripApi';
import { emitDayRouteViewportFocus } from '@/components/map/dayRouteViewportFocusBus';
import { getTravelMethodPalette } from '../travelMethodPresentation';
import { formatDistance, formatSegmentDuration } from './routePresentation';
import {
  getDayRouteSegmentColors,
  type DayRouteColorMode,
} from '@/utils/dayRouteColorPresentation';

type RouteSegmentListProps = {
  itemsById: Record<number, ItineraryItem>;
  segments: DayRouteSegment[];
  colorMode: DayRouteColorMode;
};

const getItemLabel = (itemsById: Record<number, ItineraryItem>, itemId: number) => {
  return itemsById[itemId]?.name ?? `Stop ${itemsById[itemId]?.visitOrder ?? itemId}`;
};

export default function RouteSegmentList({
  itemsById,
  segments,
  colorMode,
}: RouteSegmentListProps) {
  const segmentColors = getDayRouteSegmentColors(segments, colorMode);

  return (
    <div className="divide-y divide-gray-100">
      {segments.map((segment, index) => {
        const palette = getTravelMethodPalette(segment.travelMethod);
        const segmentColor = segmentColors[index];
        const isViewportClickable = Boolean(segment.viewport);

        return (
          <div
            key={`${segment.fromItemId}-${segment.toItemId}-${index}`}
            className={`px-4 py-4 transition ${
              isViewportClickable ? 'cursor-pointer hover:bg-slate-50/80' : ''
            }`}
            onClick={() => {
              if (segment.viewport) {
                emitDayRouteViewportFocus(segment.viewport);
              }
            }}
            role={isViewportClickable ? 'button' : undefined}
            tabIndex={isViewportClickable ? 0 : undefined}
            onKeyDown={(event) => {
              if (!segment.viewport) {
                return;
              }

              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                emitDayRouteViewportFocus(segment.viewport);
              }
            }}
            aria-label={
              isViewportClickable
                ? `Focus map on route from ${getItemLabel(itemsById, segment.fromItemId)} to ${getItemLabel(itemsById, segment.toItemId)}`
                : undefined
            }
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {getItemLabel(itemsById, segment.fromItemId)}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  to {getItemLabel(itemsById, segment.toItemId)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${palette.capsuleClassName} ${palette.textClassName}`}
                >
                  {segment.travelMethod}
                </span>
                {colorMode === 'contrast' ? (
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-gray-200"
                    style={{ backgroundColor: segmentColor }}
                    aria-hidden="true"
                  />
                ) : null}
              </div>
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
