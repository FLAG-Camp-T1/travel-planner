import { useEffect, useRef, useState } from 'react';
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
  const [moveMenuOpen, setMoveMenuOpen] = useState(false);
  const moveMenuRef = useRef<HTMLDivElement | null>(null);
  const hasMoveTargets = moveOptions.length > 0;

  useEffect(() => {
    if (!moveMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!moveMenuRef.current?.contains(event.target as Node)) {
        setMoveMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMoveMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [moveMenuOpen]);

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
          {hasMoveTargets ? (
            <div className="relative" ref={moveMenuRef}>
              <button
                type="button"
                onClick={() => {
                  if (!isBusy) {
                    setMoveMenuOpen((open) => !open);
                  }
                }}
                disabled={isBusy}
                className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400"
              >
                {isMoving ? 'Moving...' : 'Move'}
              </button>
              {moveMenuOpen ? (
                <div className="absolute right-0 top-[calc(100%+0.5rem)] z-20 min-w-40 rounded-2xl border border-gray-200 bg-white p-2 shadow-xl">
                  <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400">
                    Move To Day
                  </div>
                  <div className="space-y-1">
                    {moveOptions.map((day) => (
                      <button
                        key={day.dayNumber}
                        type="button"
                        onClick={() => {
                          setMoveMenuOpen(false);
                          onMoveToDay(day.dayNumber);
                        }}
                        className="flex w-full items-center justify-between rounded-xl px-2 py-1.5 text-left text-sm text-gray-700 transition hover:bg-gray-50"
                      >
                        <span>Day {day.dayNumber}</span>
                        <span className="text-xs text-gray-400">{day.date ?? 'Flexible'}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
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
