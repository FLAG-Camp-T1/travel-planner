import { useEffect, useRef } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@/stores/useAppStore';

const RoutePolyline = () => {
  const map = useMap();
  const geometryLib = useMapsLibrary('geometry');
  const markerLib = useMapsLibrary('marker');
  const { destinationId, originId, routeSummary } = useAppStore(
    useShallow((state) => ({
      destinationId: state.destinationId,
      originId: state.originId,
      routeSummary: state.routeSummary,
    })),
  );

  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const startMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const endMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

  useEffect(() => {
    if (!map || !geometryLib || !markerLib || !originId || !destinationId || !routeSummary) {
      return;
    }

    if (!polylineRef.current) {
      polylineRef.current = new google.maps.Polyline({
        strokeColor: '#4285F4',
        strokeOpacity: 0.8,
        strokeWeight: 6,
        map,
      });
    }

    if (!startMarkerRef.current) {
      const pinA = new markerLib.PinElement({
        background: '#EA4335',
        glyphColor: '#FFFFFF',
        borderColor: '#C5221F',
        glyph: 'A',
      });
      startMarkerRef.current = new markerLib.AdvancedMarkerElement({
        map,
        title: 'Origin',
        content: pinA.element,
      });
    }

    if (!endMarkerRef.current) {
      const pinB = new markerLib.PinElement({
        background: '#34A853',
        glyphColor: '#FFFFFF',
        borderColor: '#188038',
        glyph: 'B',
      });
      endMarkerRef.current = new markerLib.AdvancedMarkerElement({
        map,
        title: 'Destination',
        content: pinB.element,
      });
    }

    const decodedPath = geometryLib.encoding.decodePath(routeSummary.encodedPolyline);
    polylineRef.current?.setPath(decodedPath);

    if (decodedPath.length > 0) {
      if (startMarkerRef.current) {
        startMarkerRef.current.position = decodedPath[0];
      }
      if (endMarkerRef.current) {
        endMarkerRef.current.position = decodedPath[decodedPath.length - 1];
      }
    }

    if (routeSummary.viewport) {
      const bounds = new google.maps.LatLngBounds(
        routeSummary.viewport.southwest,
        routeSummary.viewport.northeast,
      );
      map.fitBounds(bounds);
    }

    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
      if (startMarkerRef.current) {
        startMarkerRef.current.map = null;
        startMarkerRef.current = null;
      }
      if (endMarkerRef.current) {
        endMarkerRef.current.map = null;
        endMarkerRef.current = null;
      }
    };
  }, [destinationId, geometryLib, map, markerLib, originId, routeSummary]);

  return null;
};

export default RoutePolyline;
