import type { ItineraryItem } from '@/api/tripApi';
import {
  ITINERARY_CONTENT_START_X,
  ITINERARY_DASHED_TIMELINE_STYLE,
  ITINERARY_TIMELINE_X,
} from './itineraryPresentation';

type ItineraryStopNodeProps = {
  canMoveDown: boolean;
  canMoveUp: boolean;
  isBusy: boolean;
  isDeleting: boolean;
  item: ItineraryItem;
  onDelete: () => void;
  onMoveDown: () => void;
  onMoveUp: () => void;
  showLineAbove: boolean;
  showLineBelow: boolean;
};

export default function ItineraryStopNode({
  canMoveDown,
  canMoveUp,
  isBusy,
  isDeleting,
  item,
  onDelete,
  onMoveDown,
  onMoveUp,
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
        className="flex min-h-8 min-w-0 items-center justify-between gap-3 pb-1"
        style={{ marginLeft: ITINERARY_CONTENT_START_X }}
      >
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-gray-900">{item.name}</div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {canMoveUp ? (
            <button
              type="button"
              onClick={onMoveUp}
              disabled={isBusy}
              className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400"
            >
              Up
            </button>
          ) : null}
          {canMoveDown ? (
            <button
              type="button"
              onClick={onMoveDown}
              disabled={isBusy}
              className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400"
            >
              Down
            </button>
          ) : null}
          <button
            type="button"
            onClick={onDelete}
            disabled={isBusy}
            className="rounded-full border border-rose-200 px-3 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
