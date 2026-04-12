import { useEffect } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { subscribeToDayRouteViewportFocus } from '@/components/map/dayRouteViewportFocusBus';

const FOCUS_PADDING = 56;

const DayRouteViewportFocusBridge = () => {
  const map = useMap();

  useEffect(() => {
    if (!map) {
      return;
    }

    const unsubscribe = subscribeToDayRouteViewportFocus((viewport) => {
      const bounds = new google.maps.LatLngBounds(viewport.southwest, viewport.northeast);
      map.fitBounds(bounds, FOCUS_PADDING);
    });

    return unsubscribe;
  }, [map]);

  return null;
};

export default DayRouteViewportFocusBridge;
