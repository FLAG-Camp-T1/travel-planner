import { getTravelMethodStrokeColor } from '@/components/trip-plan/travelMethodPresentation';

export type DayRouteColorMode = 'travelMethod' | 'contrast';

const GOLDEN_ANGLE_DEGREES = 137.508;
const CONTRAST_BASE_HUE = 208;
const CONTRAST_SATURATION = 78;
const CONTRAST_LIGHTNESS_SEQUENCE = [44, 56, 38, 50];

export const getDayRouteSegmentColors = <TSegment extends { travelMethod: string }>(
  segments: TSegment[],
  colorMode: DayRouteColorMode,
) => {
  if (colorMode === 'contrast') {
    return segments.map((_, index) => {
      const hue = (CONTRAST_BASE_HUE + index * GOLDEN_ANGLE_DEGREES) % 360;
      const lightness =
        CONTRAST_LIGHTNESS_SEQUENCE[
          ((index % CONTRAST_LIGHTNESS_SEQUENCE.length) + CONTRAST_LIGHTNESS_SEQUENCE.length) %
            CONTRAST_LIGHTNESS_SEQUENCE.length
        ];

      return `hsl(${hue.toFixed(1)} ${CONTRAST_SATURATION}% ${lightness}%)`;
    });
  }

  let previousTravelMethod: string | null = null;
  let methodVariantIndex = 0;

  return segments.map((segment) => {
    if (segment.travelMethod === previousTravelMethod) {
      methodVariantIndex += 1;
    } else {
      previousTravelMethod = segment.travelMethod;
      methodVariantIndex = 0;
    }

    return getTravelMethodStrokeColor(segment.travelMethod, methodVariantIndex);
  });
};
