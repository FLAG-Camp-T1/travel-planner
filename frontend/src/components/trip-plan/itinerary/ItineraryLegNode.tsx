import {
  ITINERARY_CONTENT_START_X,
  getTravelMethodPalette,
  ITINERARY_DASHED_TIMELINE_STYLE,
  ITINERARY_LEG_DOT_SIZE,
  ITINERARY_LEG_PILL_LEFT,
  ITINERARY_LEG_PILL_MIN_HEIGHT,
  ITINERARY_TIMELINE_X,
} from './itineraryPresentation';

type ItineraryLegNodeProps = {
  travelMethod: string | null;
};

export default function ItineraryLegNode({ travelMethod }: ItineraryLegNodeProps) {
  const palette = travelMethod ? getTravelMethodPalette(travelMethod) : null;
  const textStartPadding = `calc(${ITINERARY_CONTENT_START_X} - ${ITINERARY_LEG_PILL_LEFT})`;

  return (
    <div className="relative min-h-7 py-1.5 pr-4">
      <span
        className="absolute bottom-0 top-0 z-10 w-0.5 -translate-x-1/2"
        style={{ ...ITINERARY_DASHED_TIMELINE_STYLE, left: ITINERARY_TIMELINE_X }}
      />

      {travelMethod ? (
        <>
          <div
            className="absolute left-0 top-1/2 z-0"
            style={{
              left: ITINERARY_LEG_PILL_LEFT,
              transform: 'translateY(-50%)',
            }}
          >
            <span
              className={`relative inline-flex min-w-0 items-center rounded-full py-0.5 pr-3 ring-1 ring-inset ${palette?.capsuleClassName ?? ''}`}
              style={{
                minHeight: ITINERARY_LEG_PILL_MIN_HEIGHT,
              }}
            >
              <span
                className="invisible whitespace-nowrap text-[11px] font-medium"
                style={{ paddingLeft: textStartPadding }}
              >
                {travelMethod}
              </span>
            </span>
          </div>

          <span
            className={`absolute top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white/80 ${palette?.dotClassName ?? 'bg-slate-400'}`}
            style={{
              left: ITINERARY_TIMELINE_X,
              width: ITINERARY_LEG_DOT_SIZE,
              height: ITINERARY_LEG_DOT_SIZE,
            }}
          />

          <span
            className={`absolute top-1/2 z-20 -translate-y-1/2 text-[11px] font-medium ${palette?.textClassName ?? 'text-slate-700'}`}
            style={{
              left: ITINERARY_CONTENT_START_X,
            }}
          >
            {travelMethod}
          </span>
        </>
      ) : null}
    </div>
  );
}
