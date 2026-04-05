import type {
  DayRouteSegment,
  DayRouteSummary,
  GenerateDayRouteResponse,
  ItineraryItem,
  RouteViewport,
} from '@/api/tripApi';
import { DEFAULT_TRIP_TRAVEL_METHOD_LABEL } from '@/utils/tripTravelMethod';

type LatLng = {
  lat: number;
  lng: number;
};

type LegDefinition = {
  points: LatLng[];
  distanceMeters: number;
  durationSeconds: number;
};

const DEFAULT_LEG_DISTANCE_METERS = 2400;
const DEFAULT_LEG_DURATION_SECONDS = 840;

const MOCK_PLACE_POINTS: Record<string, LatLng> = {
  'place-georgetown-waterfront': { lat: 38.90331, lng: -77.06794 },
  'place-lincoln-memorial': { lat: 38.88927, lng: -77.05018 },
  'place-smithsonian-castle': { lat: 38.88868, lng: -77.02603 },
};

const LEG_ROUTE_DEFINITIONS: Record<string, LegDefinition> = {
  'place-georgetown-waterfront->place-lincoln-memorial': {
    points: [
      { lat: 38.90331, lng: -77.06794 },
      { lat: 38.8998, lng: -77.05648 },
      { lat: 38.89709, lng: -77.05018 },
      { lat: 38.88927, lng: -77.05018 },
    ],
    distanceMeters: 3600,
    durationSeconds: 1200,
  },
};

const DEFAULT_LEG_KEY = 'place-georgetown-waterfront->place-lincoln-memorial';

const encodeSignedValue = (value: number) => {
  let currentValue = value < 0 ? ~(value << 1) : value << 1;
  let encoded = '';

  while (currentValue >= 0x20) {
    encoded += String.fromCharCode((0x20 | (currentValue & 0x1f)) + 63);
    currentValue >>= 5;
  }

  encoded += String.fromCharCode(currentValue + 63);
  return encoded;
};

const encodePolyline = (points: LatLng[]) => {
  let previousLat = 0;
  let previousLng = 0;

  return points.reduce((encoded, point) => {
    const lat = Math.round(point.lat * 1e5);
    const lng = Math.round(point.lng * 1e5);
    const nextValue = encodeSignedValue(lat - previousLat) + encodeSignedValue(lng - previousLng);

    previousLat = lat;
    previousLng = lng;
    return encoded + nextValue;
  }, '');
};

const getViewportFromPoints = (points: LatLng[]): RouteViewport | undefined => {
  if (points.length === 0) {
    return undefined;
  }

  const lats = points.map((point) => point.lat);
  const lngs = points.map((point) => point.lng);

  return {
    northeast: {
      lat: Math.max(...lats),
      lng: Math.max(...lngs),
    },
    southwest: {
      lat: Math.min(...lats),
      lng: Math.min(...lngs),
    },
  };
};

const getLegKey = (fromPlaceId: string, toPlaceId: string) => `${fromPlaceId}->${toPlaceId}`;

const getFallbackLegDefinition = (fromPoint: LatLng, toPoint: LatLng): LegDefinition => ({
  points: [fromPoint, toPoint],
  distanceMeters: DEFAULT_LEG_DISTANCE_METERS,
  durationSeconds: DEFAULT_LEG_DURATION_SECONDS,
});

const reverseLegDefinition = (definition: LegDefinition): LegDefinition => ({
  points: [...definition.points].reverse(),
  distanceMeters: definition.distanceMeters,
  durationSeconds: definition.durationSeconds,
});

const getLegDefinition = (fromPlaceId: string, toPlaceId: string): LegDefinition => {
  const directKey = getLegKey(fromPlaceId, toPlaceId);
  const directDefinition = LEG_ROUTE_DEFINITIONS[directKey];
  if (directDefinition) {
    return directDefinition;
  }

  const reverseKey = getLegKey(toPlaceId, fromPlaceId);
  const reverseDefinition = LEG_ROUTE_DEFINITIONS[reverseKey];
  if (reverseDefinition) {
    return reverseLegDefinition(reverseDefinition);
  }

  const fromPoint = MOCK_PLACE_POINTS[fromPlaceId];
  const toPoint = MOCK_PLACE_POINTS[toPlaceId];
  if (fromPoint && toPoint) {
    return getFallbackLegDefinition(fromPoint, toPoint);
  }

  return LEG_ROUTE_DEFINITIONS[DEFAULT_LEG_KEY];
};

const buildSummary = (
  totalDistanceMeters: number,
  totalDurationSeconds: number,
): DayRouteSummary => ({
  totalDistanceMeters,
  totalDurationSeconds,
});

const buildSegmentForItems = (
  fromItem: ItineraryItem,
  toItem: ItineraryItem,
  legDefinition: LegDefinition,
): DayRouteSegment => ({
  fromItemId: fromItem.itemId,
  toItemId: toItem.itemId,
  travelMethod: toItem.travelMethod ?? DEFAULT_TRIP_TRAVEL_METHOD_LABEL,
  distanceMeters: legDefinition.distanceMeters,
  durationSeconds: legDefinition.durationSeconds,
  encodedPolyline: encodePolyline(legDefinition.points),
  viewport: getViewportFromPoints(legDefinition.points),
});

export const buildMockTripDayRouteResult = (
  tripId: number,
  dayNumber: number,
  items: ItineraryItem[],
): GenerateDayRouteResponse => {
  if (items.length < 2) {
    return {
      tripId,
      dayNumber,
      routeSummary: null,
      segments: [],
    };
  }

  const segments = items.slice(0, -1).map((item, index) => {
    const nextItem = items[index + 1];
    return buildSegmentForItems(item, nextItem, getLegDefinition(item.placeId, nextItem.placeId));
  });

  const totalDistanceMeters = segments.reduce((sum, segment) => sum + segment.distanceMeters, 0);
  const totalDurationSeconds = segments.reduce((sum, segment) => sum + segment.durationSeconds, 0);

  return {
    tripId,
    dayNumber,
    routeSummary: buildSummary(totalDistanceMeters, totalDurationSeconds),
    segments,
  };
};
