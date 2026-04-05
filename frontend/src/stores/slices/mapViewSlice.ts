import type { AppStoreCreator, MapViewSlice } from '../types';

export const DEFAULT_MAP_CENTER: google.maps.LatLngLiteral = {
  lat: 38.8977,
  lng: -77.0365,
};
export const DEFAULT_MAP_ZOOM = 13;
export const DEFAULT_POI_SEARCH_RADIUS_METERS = 5000;

export const createMapViewSlice: AppStoreCreator<MapViewSlice> = (set) => ({
  mapCenter: DEFAULT_MAP_CENTER,
  mapZoom: DEFAULT_MAP_ZOOM,

  setMapCamera: (camera) => {
    set(
      (state) => {
        if (
          state.mapCenter.lat === camera.center.lat &&
          state.mapCenter.lng === camera.center.lng &&
          state.mapZoom === camera.zoom
        ) {
          return state;
        }

        return {
          mapCenter: camera.center,
          mapZoom: camera.zoom,
        };
      },
      false,
      'map/camera:set',
    );
  },
});
