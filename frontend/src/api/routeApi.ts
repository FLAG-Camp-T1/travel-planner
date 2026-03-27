import axiosClient from './axiosClient';

export interface RouteRequest {
  originPlaceId: string;
  destinationPlaceId: string;
  travelMode?: string;
}

export interface RouteSummary {
  distanceMeters: number;
  duration: string;
  encodedPolyline: string;
  viewport?: {
    northeast: {
      lat: number;
      lng: number;
    };
    southwest: {
      lat: number;
      lng: number;
    };
  };
}

export const fetchRoute = (request: RouteRequest): Promise<RouteSummary> => {
  return axiosClient.post('/routes/request', request);
};
