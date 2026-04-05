import axiosClient from './axiosClient';

export interface POISearchRequest {
  keyword: string;
  location?: string;
  radius?: number;
  poiType?: string;
}

export interface POIDto {
  placeId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  poiType: string;
  rating: number | null;
}

// POI backend uses /api/poi (without /v1), so override the baseURL
const POI_BASE_URL = 'http://localhost:8080/api';

export const searchPOI = (request: POISearchRequest): Promise<POIDto[]> => {
  return axiosClient.post('/poi/search', request, { baseURL: POI_BASE_URL });
};
