import { useEffect } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

const MapFocusGuard = () => {
  const map = useMap();

  useEffect(() => {
    if (!map) {
      return;
    }

    const mapDiv = map.getDiv();
    mapDiv.tabIndex = -1;

    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement) {
        target.blur();
      }
    };

    mapDiv.addEventListener('focusin', handleFocusIn, true);

    return () => {
      mapDiv.removeEventListener('focusin', handleFocusIn, true);
    };
  }, [map]);

  return null;
};

export default MapFocusGuard;
