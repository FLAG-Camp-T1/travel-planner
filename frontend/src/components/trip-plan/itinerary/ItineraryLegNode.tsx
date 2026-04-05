import { useEffect, useRef, useState } from 'react';
import type { TripTravelMethodCommand } from '@/api/tripApi';
import {
  ITINERARY_CONTENT_START_X,
  getTravelMethodPalette,
  ITINERARY_DASHED_TIMELINE_STYLE,
  ITINERARY_LEG_DOT_SIZE,
  ITINERARY_LEG_PILL_LEFT,
  ITINERARY_LEG_PILL_MIN_HEIGHT,
  ITINERARY_TIMELINE_X,
} from './itineraryPresentation';
import {
  getTripTravelMethodCommandValue,
  getTripTravelMethodLabel,
  TRIP_TRAVEL_METHOD_OPTIONS,
} from '@/utils/tripTravelMethod';

const ITINERARY_LEG_TIMELINE_GAP = '0.5rem';

type ItineraryLegNodeProps = {
  travelMethod: string | null;
  disabled?: boolean;
  onUpdateTravelMethod?: (travelMethod: TripTravelMethodCommand) => void;
};

export default function ItineraryLegNode({
  travelMethod,
  disabled = false,
  onUpdateTravelMethod,
}: ItineraryLegNodeProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const displayLabel = getTripTravelMethodLabel(travelMethod);
  const palette = getTravelMethodPalette(displayLabel);
  const isInteractive = Boolean(onUpdateTravelMethod) && !disabled;
  const selectedCommandValue = getTripTravelMethodCommandValue(travelMethod);
  const textStartPadding = `calc(${ITINERARY_CONTENT_START_X} - ${ITINERARY_LEG_PILL_LEFT})`;

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [menuOpen]);

  const handleSelect = (travelMethodCommand: TripTravelMethodCommand) => {
    if (!onUpdateTravelMethod || disabled) {
      return;
    }

    setMenuOpen(false);
    if (travelMethodCommand === selectedCommandValue) {
      return;
    }

    onUpdateTravelMethod(travelMethodCommand);
  };

  return (
    <div className={`relative min-h-7 py-1.5 pr-4 ${menuOpen ? 'z-40' : ''}`}>
      <span
        className="absolute top-0 z-10 w-0.5 -translate-x-1/2"
        style={{
          ...ITINERARY_DASHED_TIMELINE_STYLE,
          left: ITINERARY_TIMELINE_X,
          bottom: `calc(50% + ${ITINERARY_LEG_TIMELINE_GAP})`,
        }}
      />
      <span
        className="absolute bottom-0 z-10 w-0.5 -translate-x-1/2"
        style={{
          ...ITINERARY_DASHED_TIMELINE_STYLE,
          left: ITINERARY_TIMELINE_X,
          top: `calc(50% + ${ITINERARY_LEG_TIMELINE_GAP})`,
        }}
      />

      <div
        ref={menuRef}
        className="absolute left-0 top-1/2"
        style={{
          left: ITINERARY_LEG_PILL_LEFT,
          transform: 'translateY(-50%)',
          zIndex: 0,
        }}
      >
        <button
          type="button"
          onClick={() => {
            if (!isInteractive) {
              return;
            }
            setMenuOpen((open) => !open);
          }}
          disabled={disabled}
          aria-expanded={menuOpen}
          aria-haspopup={isInteractive ? 'menu' : undefined}
          className={`peer relative block rounded-full ${disabled ? 'cursor-not-allowed opacity-60' : isInteractive ? 'cursor-pointer' : 'cursor-default'} ${isInteractive ? 'group outline-none' : ''}`}
        >
          <span
            className={`relative inline-flex min-w-0 items-center rounded-full py-0.5 pr-3 ring-1 ring-inset transition-colors duration-200 ease-out ${palette.capsuleClassName} ${isInteractive ? palette.capsuleHoverClassName : ''}`}
            style={{
              minHeight: ITINERARY_LEG_PILL_MIN_HEIGHT,
            }}
          >
            <span
              className="invisible whitespace-nowrap text-[11px] font-medium"
              style={{ paddingLeft: textStartPadding }}
            >
              {displayLabel}
            </span>
          </span>
        </button>

        <span
          className={`pointer-events-none absolute top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white transition-colors duration-200 ease-out ${palette.dotClassName} ${isInteractive ? palette.dotHoverClassName : ''}`}
          style={{
            left: `calc(${ITINERARY_TIMELINE_X} - ${ITINERARY_LEG_PILL_LEFT})`,
            width: ITINERARY_LEG_DOT_SIZE,
            height: ITINERARY_LEG_DOT_SIZE,
          }}
        />

        <span
          className={`pointer-events-none absolute top-1/2 z-20 -translate-y-1/2 text-[11px] font-medium transition-colors duration-200 ease-out ${palette.textClassName} ${isInteractive ? palette.textHoverClassName : ''}`}
          style={{
            left: `calc(${ITINERARY_CONTENT_START_X} - ${ITINERARY_LEG_PILL_LEFT})`,
          }}
        >
          {displayLabel}
        </span>

        {menuOpen && isInteractive ? (
          <div className="absolute left-0 top-[calc(100%+0.5rem)] z-50 min-w-44 rounded-2xl border border-gray-200 bg-white p-2 shadow-xl">
            <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400">
              Travel Method
            </div>
            <div className="space-y-1">
              {TRIP_TRAVEL_METHOD_OPTIONS.map((option) => {
                const optionPalette = getTravelMethodPalette(option.label);
                const isSelected = option.value === selectedCommandValue;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`flex w-full items-center justify-between rounded-xl px-2 py-1.5 text-left transition ${isSelected ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                  >
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset ${optionPalette.capsuleClassName} ${optionPalette.textClassName}`}
                    >
                      {option.label}
                    </span>
                    {isSelected ? (
                      <span className="text-[11px] font-semibold text-gray-500">Current</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
