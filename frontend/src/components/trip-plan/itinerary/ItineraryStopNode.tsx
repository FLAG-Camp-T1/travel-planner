import type { ItineraryItem } from '@/api/tripApi';
import {
  ITINERARY_CONTENT_START_X,
  ITINERARY_DASHED_TIMELINE_STYLE,
  ITINERARY_TIMELINE_X,
} from './itineraryPresentation';

type ItineraryStopNodeProps = {
  item: ItineraryItem;
  showLineAbove: boolean;
  showLineBelow: boolean;
};

export default function ItineraryStopNode({
  item,
  showLineAbove,
  showLineBelow,
}: ItineraryStopNodeProps) {
  return (
    <div className="relative py-3 pr-4">
      {showLineAbove ? (
        <span
          className="absolute bottom-1/2 top-0 w-0.5 -translate-x-1/2"
          style={{ ...ITINERARY_DASHED_TIMELINE_STYLE, left: ITINERARY_TIMELINE_X }}
        />
      ) : null}
      {showLineBelow ? (
        <span
          className="absolute bottom-0 top-1/2 w-0.5 -translate-x-1/2"
          style={{ ...ITINERARY_DASHED_TIMELINE_STYLE, left: ITINERARY_TIMELINE_X }}
        />
      ) : null}

      <div
        className="absolute top-1/2 z-10 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700 ring-4 ring-white"
        style={{ left: ITINERARY_TIMELINE_X }}
      >
        {item.visitOrder}
      </div>

      <div
        className="flex min-w-0 min-h-8 items-center pb-1"
        style={{ marginLeft: ITINERARY_CONTENT_START_X }}
      >
        <div className="text-sm font-medium text-gray-900">{item.name}</div>
      </div>
    </div>
  );
}
