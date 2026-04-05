import { useEffect } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { useAppStore } from '@/stores/useAppStore';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '@/stores/slices/mapViewSlice';

const PlannerMapCameraSync = () => {
  const map = useMap();
  const setMapCamera = useAppStore((state) => state.setMapCamera);

  useEffect(() => {
    if (!map) {
      return;
    }

    const syncCamera = () => {
      const center = map.getCenter();
      setMapCamera({
        center: center
          ? {
              lat: center.lat(),
              lng: center.lng(),
            }
          : DEFAULT_MAP_CENTER,
        zoom: map.getZoom() ?? DEFAULT_MAP_ZOOM,
      });
    };

    syncCamera();
    const listener = map.addListener('bounds_changed', syncCamera);

    return () => listener.remove();
  }, [map, setMapCamera]);

  return null;
};

export default PlannerMapCameraSync;
