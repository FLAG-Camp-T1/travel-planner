import { useEffect } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { subscribeToDayRouteViewportFocus } from '@/components/map/dayRouteViewportFocusBus';

const FOCUS_PADDING = 56;
const PAN_THEN_FIT_FALLBACK_MS = 260;
const MIN_FOCUS_BOUNDS_WIDTH_PX = 180;
const MIN_FOCUS_BOUNDS_HEIGHT_PX = 140;
const WORLD_TILE_SIZE = 256;
const DEFAULT_MAX_ZOOM = 21;

const projectLatLngToWorld = (latLng: google.maps.LatLng) => {
  const siny = Math.min(Math.max(Math.sin((latLng.lat() * Math.PI) / 180), -0.9999), 0.9999);

  return {
    x: (latLng.lng() + 180) / 360,
    y: 0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI),
  };
};

const getBoundsPixelSize = (bounds: google.maps.LatLngBounds, zoom: number) => {
  const northEast = projectLatLngToWorld(bounds.getNorthEast());
  const southWest = projectLatLngToWorld(bounds.getSouthWest());
  const scale = WORLD_TILE_SIZE * Math.pow(2, zoom);
  const wrappedWidth = Math.abs(northEast.x - southWest.x);

  return {
    width: Math.min(wrappedWidth, 1 - wrappedWidth) * scale,
    height: Math.abs(northEast.y - southWest.y) * scale,
  };
};

const getRequiredZoom = (
  bounds: google.maps.LatLngBounds,
  currentZoom: number,
  maxZoom: number,
) => {
  let targetZoom = currentZoom;

  while (targetZoom < maxZoom) {
    const pixelSize = getBoundsPixelSize(bounds, targetZoom);
    if (
      pixelSize.width >= MIN_FOCUS_BOUNDS_WIDTH_PX &&
      pixelSize.height >= MIN_FOCUS_BOUNDS_HEIGHT_PX
    ) {
      break;
    }

    targetZoom += 1;
  }

  return targetZoom;
};

const DayRouteViewportFocusBridge = () => {
  const map = useMap();

  useEffect(() => {
    if (!map) {
      return;
    }

    const unsubscribe = subscribeToDayRouteViewportFocus((viewport) => {
      const bounds = new google.maps.LatLngBounds(viewport.southwest, viewport.northeast);
      const center = bounds.getCenter();
      const isFullyVisible = () => {
        const currentBounds = map.getBounds();

        return Boolean(
          currentBounds?.contains(bounds.getNorthEast()) &&
          currentBounds.contains(bounds.getSouthWest()),
        );
      };
      const maxZoom = Number(map.get('maxZoom')) || DEFAULT_MAX_ZOOM;
      const ensureReadableZoom = () => {
        const currentZoom = map.getZoom();
        if (currentZoom == null) {
          return;
        }

        const requiredZoom = getRequiredZoom(bounds, currentZoom, maxZoom);
        if (requiredZoom > currentZoom) {
          map.setZoom(requiredZoom);
        }
      };

      const alreadyVisible = isFullyVisible();

      if (alreadyVisible) {
        const idleListener = google.maps.event.addListenerOnce(map, 'idle', () => {
          clearTimeout(fallbackTimer);
          ensureReadableZoom();
        });

        const fallbackTimer = window.setTimeout(() => {
          idleListener.remove();
          ensureReadableZoom();
        }, PAN_THEN_FIT_FALLBACK_MS);

        map.panTo(center);
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
          const zoomIdleListener = google.maps.event.addListenerOnce(map, 'idle', () => {
            ensureReadableZoom();
          });

          window.setTimeout(() => {
            zoomIdleListener.remove();
            ensureReadableZoom();
          }, PAN_THEN_FIT_FALLBACK_MS);
          return;
        }

        ensureReadableZoom();
      };

      const idleListener = google.maps.event.addListenerOnce(map, 'idle', () => {
        clearTimeout(fallbackTimer);
        completeFocus();
      });

      const fallbackTimer = window.setTimeout(() => {
        idleListener.remove();
        completeFocus();
      }, PAN_THEN_FIT_FALLBACK_MS);

      map.panTo(center);
    });

    return unsubscribe;
  }, [map]);

  return null;
};

export default DayRouteViewportFocusBridge;
