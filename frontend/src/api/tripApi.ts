import axiosClient from './axiosClient';

export type DateString = string;

export interface CreateTripRequest {
  title: string;
  durationDays: number;
  startDate?: DateString;
}

export interface UpdateTripRequest {
  title: string;
  startDate?: DateString | null;
}

export interface CreateTripDayItemRequest {
  placeId: string;
}

export type TripTravelMethodCommand =
  | 'DRIVE'
  | 'BICYCLE'
  | 'WALK'
  | 'TWO_WHEELER'
  | 'TRANSIT'
  | 'TRAVEL_MODE_UNSPECIFIED';

export interface UpdateTripDayItemRequest {
  travelMethod: TripTravelMethodCommand;
}

export interface ReorderTripDayItemsRequest {
  itemIds: number[];
}

export interface MoveTripDayItemRequest {
  targetDayNumber: number;
}

export interface TripSummary {
  tripId: number;
  title: string;
  durationDays: number;
  startDate?: DateString | null;
}

export interface TripDay {
  dayNumber: number;
  date: DateString | null;
}

export interface TripDaysResponse {
  tripId: number;
  days: TripDay[];
}

export interface ItineraryItem {
  itemId: number;
  placeId: string;
  name: string;
  visitOrder: number;
  travelMethod: string | null;
}

export interface TripDayItemsResponse {
  tripId: number;
  dayNumber: number;
  items: ItineraryItem[];
}

export interface RouteViewport {
  northeast: {
    lat: number;
    lng: number;
  };
  southwest: {
    lat: number;
    lng: number;
  };
}

export interface DayRouteSummary {
  totalDistanceMeters: number;
  totalDurationSeconds: number;
}

export interface DayRouteSegment {
  fromItemId: number;
  toItemId: number;
  travelMethod: string;
  distanceMeters: number;
  durationSeconds: number;
  encodedPolyline: string;
  viewport?: RouteViewport;
}

export interface GenerateDayRouteResponse {
  tripId: number;
  dayNumber: number;
  routeSummary: DayRouteSummary | null;
  segments: DayRouteSegment[];
}

export const createTrip = (request: CreateTripRequest): Promise<TripSummary> => {
  return axiosClient.post('/trips/create', request);
};

export const getTrips = (): Promise<TripSummary[]> => {
  return axiosClient.get('/trips');
};

export const getTrip = (tripId: number): Promise<TripSummary> => {
  return axiosClient.get(`/trips/${tripId}`);
};

export const updateTrip = (tripId: number, request: UpdateTripRequest): Promise<TripSummary> => {
  return axiosClient.patch(`/trips/${tripId}`, request);
};

export const deleteTrip = (tripId: number): Promise<void> => {
  return axiosClient.delete(`/trips/${tripId}`);
};

export const createTripDayItem = (
  tripId: number,
  dayNumber: number,
  request: CreateTripDayItemRequest,
): Promise<void> => {
  return axiosClient.post(`/trips/${tripId}/days/${dayNumber}/items`, request);
};

export const updateTripDayItem = (
  tripId: number,
  dayNumber: number,
  itemId: number,
  request: UpdateTripDayItemRequest,
): Promise<void> => {
  return axiosClient.patch(`/trips/${tripId}/days/${dayNumber}/items/${itemId}`, request);
};

export const deleteTripDayItem = (
  tripId: number,
  dayNumber: number,
  itemId: number,
): Promise<void> => {
  return axiosClient.delete(`/trips/${tripId}/days/${dayNumber}/items/${itemId}`);
};

export const reorderTripDayItems = (
  tripId: number,
  dayNumber: number,
  request: ReorderTripDayItemsRequest,
): Promise<void> => {
  return axiosClient.patch(`/trips/${tripId}/days/${dayNumber}/items/reorder`, request);
};

export const moveTripDayItem = (
  tripId: number,
  dayNumber: number,
  itemId: number,
  request: MoveTripDayItemRequest,
): Promise<void> => {
  return axiosClient.post(`/trips/${tripId}/days/${dayNumber}/items/${itemId}/move`, request);
};

export const getTripDays = (tripId: number): Promise<TripDaysResponse> => {
  return axiosClient.get(`/trips/${tripId}/days`);
};

export const getTripDayItems = (
  tripId: number,
  dayNumber: number,
): Promise<TripDayItemsResponse> => {
  return axiosClient.get(`/trips/${tripId}/days/${dayNumber}/items`);
};

export const generateTripDayRoute = (
  tripId: number,
  dayNumber: number,
): Promise<GenerateDayRouteResponse> => {
  return axiosClient.post(`/trips/${tripId}/days/${dayNumber}/route/generate`);
};
