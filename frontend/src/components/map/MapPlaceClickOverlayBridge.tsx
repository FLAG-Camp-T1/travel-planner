import { useEffect } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { useAppStore } from '@/stores/useAppStore';
import { createPoiDetailOverlayFromMapPlace } from '@/components/place/placeDetailOverlayFactory';

const MapPlaceClickOverlayBridge = () => {
  const map = useMap();
  const openPlaceDetail = useAppStore((state) => state.openPlaceDetail);

  useEffect(() => {
    if (!map) {
      return;
    }

    const listener = map.addListener(
      'click',
      (event: google.maps.MapMouseEvent | google.maps.IconMouseEvent) => {
        if (!('placeId' in event) || !event.placeId) {
          return;
        }

        event.stop();

        void openPlaceDetail(
          createPoiDetailOverlayFromMapPlace({
            placeId: event.placeId,
            latitude: event.latLng?.lat() ?? null,
            longitude: event.latLng?.lng() ?? null,
          }),
        );
      },
    );

    return () => listener.remove();
  }, [map, openPlaceDetail]);

  return null;
};

export default MapPlaceClickOverlayBridge;
