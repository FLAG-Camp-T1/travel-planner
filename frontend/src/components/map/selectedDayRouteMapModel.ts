import type { DayRouteSegment, ItineraryItem } from '@/api/tripApi';
import {
  getDayRouteSegmentColors,
  type DayRouteColorMode,
} from '@/utils/dayRouteColorPresentation';

const GAP_DISTANCE_THRESHOLD_METERS = 20;

export type DecodedRouteSegment = {
  segmentIndex: number;
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
  placeId: string;
  name: string | null;
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
  const markerPoints: ItineraryMarkerPoint[] = items
    .filter((item) => item.latitude != null && item.longitude != null)
    .map((item) => ({
      itemId: item.itemId,
      placeId: item.placeId,
      name: item.name ?? null,
      visitOrder: item.visitOrder,
      title: item.name ?? `Stop ${item.visitOrder}`,
      position: new google.maps.LatLng(item.latitude as number, item.longitude as number),
    }));

  const markerSignature =
    selectedDayNumber === null
      ? null
      : `${selectedDayNumber}:${markerPoints
          .map(
            (markerPoint) =>
              `${markerPoint.itemId}:${markerPoint.visitOrder}:${markerPoint.position.lat()}:${markerPoint.position.lng()}`,
          )
          .join('|')}`;
  const drawableSegments = segments.filter((segment) => segment.encodedPolyline.trim().length > 0);

  if (selectedDayNumber === null) {
    return {
      routeSignature: null,
      markerSignature: null,
      decodedSegments: [],
      gapConnectors: [],
      markerPoints: [],
    };
  }

  if (!geometryLib || drawableSegments.length === 0) {
    return {
      routeSignature: null,
      markerSignature,
      decodedSegments: [],
      gapConnectors: [],
      markerPoints,
    };
  }

  const routeSignature = `${selectedDayNumber}:${drawableSegments
    .map((segment) => segment.encodedPolyline.trim())
    .join('|')}`;
  const segmentColors = getDayRouteSegmentColors(segments, colorMode);
  const decodedSegments = segments
    .map((segment, index) => ({
      segment,
      segmentIndex: index,
      strokeColor: segmentColors[index],
    }))
    .filter(({ segment }) => segment.encodedPolyline.trim().length > 0)
    .map(({ segment, segmentIndex, strokeColor }) => {
      return {
        segmentIndex,
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
      markerSignature,
      decodedSegments: [],
      gapConnectors: [],
      markerPoints,
    };
  }

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
