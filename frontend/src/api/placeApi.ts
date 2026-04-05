import axiosClient from './axiosClient';

export interface PlaceDetailDto {
  placeId: string;
  name: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  categoryLabel: string | null;
  rating: number | null;
  userRatingCount: number | null;
  websiteUri: string | null;
  googleMapsUri: string | null;
  openingWeekdayDescriptions: string[];
}

export const getPlaceDetails = (placeId: string): Promise<PlaceDetailDto> => {
  return axiosClient.get(`/places/${placeId}`);
};
