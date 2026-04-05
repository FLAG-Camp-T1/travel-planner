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
  latitude: number | null;
  longitude: number | null;
  poiType: string;
  rating: number | null;
}

export const searchPOI = (request: POISearchRequest): Promise<POIDto[]> => {
  return axiosClient.post('/poi/search', request);
};
