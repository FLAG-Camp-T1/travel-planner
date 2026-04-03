import axiosClient from './axiosClient';

export type DateString = string;

export interface CreateTripRequest {
  title: string;
  durationDays: number;
  startDate?: DateString;
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
  travelMethod: string;
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
  encodedPolyline: string;
  viewport?: RouteViewport;
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
  items: ItineraryItem[];
  routeSummary: DayRouteSummary;
  segments: DayRouteSegment[];
}

export const createTrip = (request: CreateTripRequest): Promise<TripSummary> => {
  return axiosClient.post('/trips/create', request);
};

export const getTrip = (tripId: number): Promise<TripSummary> => {
  return axiosClient.get(`/trips/${tripId}`);
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
