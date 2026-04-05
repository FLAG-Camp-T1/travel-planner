import type { DayRouteSegment, ItineraryItem } from '@/api/tripApi';
import {
  getDayRouteSegmentColors,
  type DayRouteColorMode,
} from '@/utils/dayRouteColorPresentation';

const GAP_DISTANCE_THRESHOLD_METERS = 20;

export type DecodedRouteSegment = {
  fromItemId: number;
  toItemId: number;
  path: google.maps.LatLng[];
  viewport?: DayRouteSegment['viewport'];
  strokeColor: string;
};

export type GapConnector = {
  start: google.maps.LatLng;
  end: google.maps.LatLng;
};

export type ItineraryMarkerPoint = {
  itemId: number;
  visitOrder: number;
  title: string;
  position: google.maps.LatLng;
};

export type SelectedDayRouteMapModel = {
  routeSignature: string | null;
  markerSignature: string | null;
  decodedSegments: DecodedRouteSegment[];
  gapConnectors: GapConnector[];
  markerPoints: ItineraryMarkerPoint[];
};

export const buildSelectedDayRouteMapModel = ({
  geometryLib,
  items,
  segments,
  selectedDayNumber,
  colorMode,
}: {
  geometryLib: typeof google.maps.geometry | null;
  items: ItineraryItem[];
  segments: DayRouteSegment[];
  selectedDayNumber: number | null;
  colorMode: DayRouteColorMode;
}): SelectedDayRouteMapModel => {
  const drawableSegments = segments.filter((segment) => segment.encodedPolyline.trim().length > 0);

  if (!geometryLib || selectedDayNumber === null || drawableSegments.length === 0) {
    return {
      routeSignature: null,
      markerSignature: null,
      decodedSegments: [],
      gapConnectors: [],
      markerPoints: [],
    };
  }

  const routeSignature = `${selectedDayNumber}:${drawableSegments
    .map((segment) => segment.encodedPolyline.trim())
    .join('|')}`;
  const segmentColors = getDayRouteSegmentColors(segments, colorMode);
  const decodedSegments = segments
    .map((segment, index) => ({
      segment,
      strokeColor: segmentColors[index],
    }))
    .filter(({ segment }) => segment.encodedPolyline.trim().length > 0)
    .map(({ segment, strokeColor }) => {
      return {
        fromItemId: segment.fromItemId,
        toItemId: segment.toItemId,
        path: geometryLib.encoding.decodePath(segment.encodedPolyline.trim()),
        viewport: segment.viewport,
        strokeColor,
      };
    })
    .filter((segment) => segment.path.length > 0);

  if (decodedSegments.length === 0) {
    return {
      routeSignature: null,
      markerSignature: null,
      decodedSegments: [],
      gapConnectors: [],
      markerPoints: [],
    };
  }

  const itemsById = new Map(items.map((item) => [item.itemId, item]));
  const markerPoints: ItineraryMarkerPoint[] = [];
  const firstSegment = decodedSegments[0];
  const firstItem = itemsById.get(firstSegment.fromItemId);

  markerPoints.push({
    itemId: firstSegment.fromItemId,
    visitOrder: firstItem?.visitOrder ?? 1,
    title: firstItem?.name ?? `Stop ${firstItem?.visitOrder ?? 1}`,
    position: firstSegment.path[0],
  });

  decodedSegments.forEach((segment, segmentIndex) => {
    const toItem = itemsById.get(segment.toItemId);
    markerPoints.push({
      itemId: segment.toItemId,
      visitOrder: toItem?.visitOrder ?? segmentIndex + 2,
      title: toItem?.name ?? `Stop ${segmentIndex + 2}`,
      position: segment.path[segment.path.length - 1],
    });
  });

  const gapConnectors: GapConnector[] = [];
  for (let segmentIndex = 0; segmentIndex < decodedSegments.length - 1; segmentIndex += 1) {
    const currentSegment = decodedSegments[segmentIndex];
    const nextSegment = decodedSegments[segmentIndex + 1];
    const currentEnd = currentSegment.path[currentSegment.path.length - 1];
    const nextStart = nextSegment.path[0];

    const gapDistance = geometryLib.spherical.computeDistanceBetween(currentEnd, nextStart);
    if (gapDistance <= GAP_DISTANCE_THRESHOLD_METERS) {
      continue;
    }

    gapConnectors.push({
      start: currentEnd,
      end: nextStart,
    });
  }

  const markerSignature = `${routeSignature}:${markerPoints
    .map((markerPoint) => `${markerPoint.itemId}:${markerPoint.visitOrder}:${markerPoint.title}`)
    .join('|')}`;

  return {
    routeSignature,
    markerSignature,
    decodedSegments,
    gapConnectors,
    markerPoints,
  };
};

export const extendBoundsForSelectedDayRoute = (
  bounds: google.maps.LatLngBounds,
  decodedSegments: DecodedRouteSegment[],
) => {
  let hasBounds = false;

  decodedSegments.forEach((segment) => {
    if (!segment.viewport) {
      return;
    }

    bounds.extend(segment.viewport.southwest);
    bounds.extend(segment.viewport.northeast);
    hasBounds = true;
  });

  if (hasBounds) {
    return true;
  }

  decodedSegments.forEach((segment) => {
    segment.path.forEach((point) => bounds.extend(point));
  });

  return decodedSegments.length > 0;
};
