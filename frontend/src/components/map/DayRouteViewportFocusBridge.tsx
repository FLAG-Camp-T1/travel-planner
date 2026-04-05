import { useEffect } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { subscribeToDayRouteViewportFocus } from '@/components/map/dayRouteViewportFocusBus';

const FOCUS_PADDING = 56;
const PAN_THEN_FIT_FALLBACK_MS = 260;

const DayRouteViewportFocusBridge = () => {
  const map = useMap();

  useEffect(() => {
    if (!map) {
      return;
    }

    const unsubscribe = subscribeToDayRouteViewportFocus((viewport) => {
      const bounds = new google.maps.LatLngBounds(viewport.southwest, viewport.northeast);
      const isFullyVisible = () => {
        const currentBounds = map.getBounds();

        return Boolean(
          currentBounds?.contains(bounds.getNorthEast()) &&
          currentBounds.contains(bounds.getSouthWest()),
        );
      };

      const alreadyVisible = isFullyVisible();

      if (alreadyVisible) {
        map.panToBounds(bounds, FOCUS_PADDING);
        return;
      }
      let hasFocused = false;
      const completeFocus = () => {
        if (hasFocused) {
          return;
        }

        hasFocused = true;
        if (!isFullyVisible()) {
          map.fitBounds(bounds, FOCUS_PADDING);
        }
      };

      const idleListener = google.maps.event.addListenerOnce(map, 'idle', () => {
        clearTimeout(fallbackTimer);
        completeFocus();
      });

      const fallbackTimer = window.setTimeout(() => {
        idleListener.remove();
        completeFocus();
      }, PAN_THEN_FIT_FALLBACK_MS);

      map.panToBounds(bounds, FOCUS_PADDING);
    });

    return unsubscribe;
  }, [map]);

  return null;
};

export default DayRouteViewportFocusBridge;
