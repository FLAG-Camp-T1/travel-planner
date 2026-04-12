import { useEffect, useRef, useState } from 'react';
import type { TripTravelMethodCommand } from '@/api/tripApi';
import useBoundedMenuPosition from '@/components/trip-plan/useBoundedMenuPosition';
import type { DayRouteColorMode } from '@/utils/dayRouteColorPresentation';
import {
  ITINERARY_CONTENT_START_X,
  getTravelMethodPalette,
  ITINERARY_DASHED_TIMELINE_STYLE,
  ITINERARY_LEG_DOT_SIZE,
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
  toLabel?: string;
  distanceLabel?: string | null;
  durationLabel?: string | null;
  isFocused?: boolean;
  isInferred?: boolean;
  colorMode?: DayRouteColorMode;
  contrastColor?: string | null;
  onFocus?: () => void;
  onUpdateTravelMethod?: (travelMethod: TripTravelMethodCommand) => void;
};

export default function ItineraryLegNode({
  travelMethod,
  disabled = false,
  toLabel,
  distanceLabel,
  durationLabel,
  isFocused = false,
  isInferred = false,
  colorMode = 'travelMethod',
  contrastColor = null,
  onFocus,
  onUpdateTravelMethod,
}: ItineraryLegNodeProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuPanelRef = useRef<HTMLDivElement | null>(null);
  const displayLabel = getTripTravelMethodLabel(travelMethod);
  const palette = getTravelMethodPalette(displayLabel);
  const dotColor = colorMode === 'contrast' && contrastColor ? contrastColor : palette.dotColor;
  const isInteractive = Boolean(onUpdateTravelMethod) && !disabled;
  const isFocusable = Boolean(onFocus) && !isInferred;
  const selectedCommandValue = getTripTravelMethodCommandValue(travelMethod);
  const { placement: menuPlacement, menuStyle } = useBoundedMenuPosition({
    open: menuOpen,
    anchorRef: menuRef,
    menuRef: menuPanelRef,
    preferredSide: 'right',
  });

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

  const handleRowInteraction = () => {
    if (!isFocusable || disabled) {
      return;
    }

    onFocus?.();
  };

  return (
    <div
      className={`relative rounded-xl py-2 pr-4 transition-all duration-200 ease-out ${menuOpen ? 'z-40' : ''} ${
        isFocused
          ? 'bg-slate-100/90'
          : isFocusable
            ? 'cursor-pointer hover:bg-slate-50/80'
            : 'bg-transparent'
      }`}
      onClick={handleRowInteraction}
      role={isFocusable ? 'button' : undefined}
      tabIndex={isFocusable ? 0 : undefined}
      onKeyDown={(event) => {
        if (!isFocusable) {
          return;
        }

        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleRowInteraction();
        }
      }}
      aria-label={
        isFocusable
          ? `Highlight route segment${toLabel ? ` leading to ${toLabel}` : ''}`
          : undefined
      }
      aria-pressed={isFocusable ? isFocused : undefined}
    >
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

      <span
        className="absolute top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white transition-colors duration-200 ease-out"
        style={{
          left: ITINERARY_TIMELINE_X,
          width: ITINERARY_LEG_DOT_SIZE,
          height: ITINERARY_LEG_DOT_SIZE,
        }}
      >
        <span
          className="block h-full w-full rounded-full transition-[background-color,transform] duration-200 ease-out"
          style={{
            backgroundColor: dotColor,
            transform: colorMode === 'contrast' ? 'scale(1.08)' : 'scale(1)',
          }}
          aria-hidden="true"
        />
      </span>

      <div
        className="flex min-h-[2.5rem] min-w-0 items-center justify-between gap-3"
        style={{ marginLeft: ITINERARY_CONTENT_START_X }}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div ref={menuRef} className="relative" onClick={(event) => event.stopPropagation()}>
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
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition ${
                  disabled
                    ? 'cursor-not-allowed'
                    : isInteractive
                      ? 'cursor-pointer hover:brightness-95'
                      : 'cursor-default'
                } ${palette.capsuleClassName} ${palette.textClassName}`}
              >
                {displayLabel}
              </button>

              {menuOpen && isInteractive ? (
                <div
                  ref={menuPanelRef}
                  className={`absolute z-50 min-w-44 rounded-2xl border border-gray-200 bg-white p-2 shadow-xl ${
                    menuPlacement === 'right'
                      ? 'left-[calc(100%+0.5rem)]'
                      : menuPlacement === 'left'
                        ? 'right-[calc(100%+0.5rem)]'
                        : 'left-0 top-[calc(100%+0.5rem)]'
                  }`}
                  style={menuStyle}
                >
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
                          className={`flex w-full items-center justify-between rounded-xl px-2 py-1.5 text-left transition ${
                            isSelected ? 'bg-gray-100' : 'hover:bg-gray-50'
                          }`}
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

            {distanceLabel ? (
              <span className="rounded-full bg-gray-50 px-3 py-1 text-[11px] text-gray-600">
                {distanceLabel}
              </span>
            ) : null}
            {durationLabel ? (
              <span className="rounded-full bg-gray-50 px-3 py-1 text-[11px] text-gray-600">
                {durationLabel}
              </span>
            ) : null}
            {isInferred ? (
              <span className="rounded-full border border-dashed border-gray-200 bg-white px-3 py-1 text-[11px] text-gray-500">
                Needs regeneration
              </span>
            ) : null}
          </div>
        </div>

        {isFocusable ? (
          <span className="self-center text-[11px] font-medium text-gray-400">
            {isFocused ? 'Focused' : 'Focus'}
          </span>
        ) : null}
      </div>
    </div>
  );
}
