import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, MoreHorizontal, Trash2 } from 'lucide-react';
import type { ItineraryItem, TripDay } from '@/api/tripApi';
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
  isMoving: boolean;
  item: ItineraryItem;
  moveOptions: TripDay[];
  onDelete: () => void;
  onMoveDown: () => void;
  onMoveUp: () => void;
  onMoveToDay: (targetDayNumber: number) => void;
  showLineAbove: boolean;
  showLineBelow: boolean;
};

export default function ItineraryStopNode({
  canMoveDown,
  canMoveUp,
  isBusy,
  isDeleting,
  isMoving,
  item,
  moveOptions,
  onDelete,
  onMoveDown,
  onMoveUp,
  onMoveToDay,
  showLineAbove,
  showLineBelow,
}: ItineraryStopNodeProps) {
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
  const actionsMenuRef = useRef<HTMLDivElement | null>(null);
  const hasMoveTargets = moveOptions.length > 0;

  useEffect(() => {
    if (!actionsMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!actionsMenuRef.current?.contains(event.target as Node)) {
        setActionsMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActionsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [actionsMenuOpen]);

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
          <div className="inline-flex overflow-hidden rounded-full border border-gray-200 bg-white shadow-sm">
            <button
              type="button"
              onClick={onMoveUp}
              disabled={isBusy || !canMoveUp}
              aria-label="Move stop up"
              className="flex h-8 w-8 items-center justify-center text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <span className="w-px bg-gray-200" aria-hidden="true" />
            <button
              type="button"
              onClick={onMoveDown}
              disabled={isBusy || !canMoveDown}
              aria-label="Move stop down"
              className="flex h-8 w-8 items-center justify-center text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          <div className="relative" ref={actionsMenuRef}>
            <button
              type="button"
              onClick={() => {
                if (!isBusy) {
                  setActionsMenuOpen((open) => !open);
                }
              }}
              disabled={isBusy}
              aria-expanded={actionsMenuOpen}
              aria-haspopup="menu"
              aria-label={isMoving ? 'Moving stop' : isDeleting ? 'Deleting stop' : 'More actions'}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-300"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {actionsMenuOpen ? (
              <div className="absolute right-0 top-[calc(100%+0.5rem)] z-20 min-w-52 rounded-2xl border border-gray-200 bg-white p-2 shadow-xl">
                {hasMoveTargets ? (
                  <>
                    <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400">
                      Move To Another Day
                    </div>
                    <div className="space-y-1">
                      {moveOptions.map((day) => (
                        <button
                          key={day.dayNumber}
                          type="button"
                          onClick={() => {
                            setActionsMenuOpen(false);
                            onMoveToDay(day.dayNumber);
                          }}
                          className="flex w-full items-center justify-between rounded-xl px-2 py-1.5 text-left text-sm text-gray-700 transition hover:bg-gray-50"
                        >
                          <span>Day {day.dayNumber}</span>
                          <span className="text-xs text-gray-400">{day.date ?? 'Flexible'}</span>
                        </button>
                      ))}
                    </div>
                    <div className="my-2 h-px bg-gray-100" />
                  </>
                ) : null}

                <button
                  type="button"
                  onClick={() => {
                    setActionsMenuOpen(false);
                    onDelete();
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-2 py-1.5 text-left text-sm text-rose-600 transition hover:bg-rose-50"
                >
                  <span>Delete Stop</span>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
