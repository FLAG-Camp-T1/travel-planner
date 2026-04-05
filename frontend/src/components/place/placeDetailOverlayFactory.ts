import type { Bookmark } from '@/api/bookmarkApi';
import type { POIDto } from '@/api/poiApi';
import type { ItineraryItem } from '@/api/tripApi';
import type { ActiveDetailOverlay, PlaceDetailSourceSummary } from '@/stores/types';

const createPlaceDetailSourceSummary = ({
  placeId,
  name = null,
  address = null,
  latitude = null,
  longitude = null,
  categoryLabel = null,
  rating = null,
}: {
  placeId: string;
  name?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  categoryLabel?: string | null;
  rating?: number | null;
}): PlaceDetailSourceSummary => ({
  placeId,
  name,
  address,
  latitude,
  longitude,
  categoryLabel,
  rating,
});

export const createPoiDetailOverlayFromPoi = (poi: POIDto): ActiveDetailOverlay => ({
  kind: 'poi',
  placeId: poi.placeId,
  sourceSummary: createPlaceDetailSourceSummary({
    placeId: poi.placeId,
    name: poi.name,
    address: poi.address,
    latitude: poi.latitude,
    longitude: poi.longitude,
    categoryLabel: poi.poiType,
    rating: poi.rating,
  }),
});

export const createPoiDetailOverlayFromMapPlace = ({
  placeId,
  latitude = null,
  longitude = null,
}: {
  placeId: string;
  latitude?: number | null;
  longitude?: number | null;
}): ActiveDetailOverlay => ({
  kind: 'poi',
  placeId,
  sourceSummary: createPlaceDetailSourceSummary({
    placeId,
    latitude,
    longitude,
  }),
});

export const createPoiDetailOverlayFromItineraryItem = ({
  item,
  latitude = null,
  longitude = null,
}: {
  item: ItineraryItem;
  latitude?: number | null;
  longitude?: number | null;
}): ActiveDetailOverlay => ({
  kind: 'poi',
  placeId: item.placeId,
  sourceSummary: createPlaceDetailSourceSummary({
    placeId: item.placeId,
    name: item.name,
    latitude,
    longitude,
  }),
});

export const createBookmarkDetailOverlay = (bookmark: Bookmark): ActiveDetailOverlay => ({
  kind: 'bookmark',
  placeId: bookmark.googlePlaceId,
  sourceSummary: createPlaceDetailSourceSummary({
    placeId: bookmark.googlePlaceId,
    name: bookmark.poiName,
    address: bookmark.poiAddress,
    latitude: bookmark.poiLatitude,
    longitude: bookmark.poiLongitude,
    categoryLabel: bookmark.category ?? null,
  }),
});
