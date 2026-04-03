import { useEffect, useRef } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@/stores/useAppStore';

const SelectedDayRoutePolyline = () => {
  const map = useMap();
  const geometryLib = useMapsLibrary('geometry');
  const { dayRouteByDayNumber, selectedDayNumber } = useAppStore(
    useShallow((state) => ({
      dayRouteByDayNumber: state.dayRouteByDayNumber,
      selectedDayNumber: state.selectedDayNumber,
    })),
  );

  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const lastRenderedSignatureRef = useRef<string | null>(null);
  const lastFittedSignatureRef = useRef<string | null>(null);

  const currentRouteSummary =
    selectedDayNumber !== null ? (dayRouteByDayNumber[selectedDayNumber] ?? null) : null;
  const encodedPolyline = currentRouteSummary?.encodedPolyline?.trim() ?? '';
  const renderSignature =
    selectedDayNumber !== null && encodedPolyline
      ? `${selectedDayNumber}:${encodedPolyline}`
      : null;

  useEffect(() => {
    if (!map || !geometryLib || !renderSignature || !currentRouteSummary || !encodedPolyline) {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
      lastRenderedSignatureRef.current = null;

      return;
    }

    if (!polylineRef.current) {
      polylineRef.current = new google.maps.Polyline({
        strokeColor: '#059669',
        strokeOpacity: 0.9,
        strokeWeight: 5,
        map,
      });
    } else if (lastRenderedSignatureRef.current !== renderSignature) {
      polylineRef.current.setMap(map);
    }

    const decodedPath = geometryLib.encoding.decodePath(encodedPolyline);
    polylineRef.current.setPath(decodedPath);
    lastRenderedSignatureRef.current = renderSignature;

    if (
      currentRouteSummary.viewport &&
      decodedPath.length > 0 &&
      lastFittedSignatureRef.current !== renderSignature
    ) {
      const bounds = new google.maps.LatLngBounds(
        currentRouteSummary.viewport.southwest,
        currentRouteSummary.viewport.northeast,
      );
      map.fitBounds(bounds);
      lastFittedSignatureRef.current = renderSignature;
    }

    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
      lastRenderedSignatureRef.current = null;
    };
  }, [currentRouteSummary, encodedPolyline, geometryLib, map, renderSignature]);

  return null;
};

export default SelectedDayRoutePolyline;
