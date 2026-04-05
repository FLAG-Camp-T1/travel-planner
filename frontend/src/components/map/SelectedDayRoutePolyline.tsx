import { useEffect, useRef } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useShallow } from 'zustand/react/shallow';
import type { DayRouteSegment } from '@/api/tripApi';
import { useAppStore } from '@/stores/useAppStore';

const EMPTY_SEGMENTS: DayRouteSegment[] = [];

const SelectedDayRoutePolyline = () => {
  const map = useMap();
  const geometryLib = useMapsLibrary('geometry');
  const { dayRouteSegmentsByDayNumber, selectedDayNumber } = useAppStore(
    useShallow((state) => ({
      dayRouteSegmentsByDayNumber: state.dayRouteSegmentsByDayNumber,
      selectedDayNumber: state.selectedDayNumber,
    })),
  );

  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const lastRenderedSignatureRef = useRef<string | null>(null);
  const lastFittedSignatureRef = useRef<string | null>(null);

  const currentDaySegments =
    selectedDayNumber !== null
      ? (dayRouteSegmentsByDayNumber[selectedDayNumber] ?? EMPTY_SEGMENTS)
      : EMPTY_SEGMENTS;
  const drawableSegments = currentDaySegments.filter(
    (segment) => segment.encodedPolyline.trim().length > 0,
  );
  const renderSignature =
    selectedDayNumber !== null && drawableSegments.length > 0
      ? `${selectedDayNumber}:${drawableSegments.map((segment) => segment.encodedPolyline.trim()).join('|')}`
      : null;

  useEffect(() => {
    if (!map || !geometryLib || !renderSignature) {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
      lastRenderedSignatureRef.current = null;
      lastFittedSignatureRef.current = null;

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

    const decodedPath = drawableSegments.flatMap((segment, segmentIndex) => {
      const decodedSegmentPath = geometryLib.encoding.decodePath(segment.encodedPolyline.trim());
      return segmentIndex === 0 ? decodedSegmentPath : decodedSegmentPath.slice(1);
    });

    if (decodedPath.length === 0) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
      lastRenderedSignatureRef.current = null;
      lastFittedSignatureRef.current = null;
      return;
    }

    polylineRef.current.setPath(decodedPath);
    lastRenderedSignatureRef.current = renderSignature;

    if (lastFittedSignatureRef.current !== renderSignature) {
      const bounds = new google.maps.LatLngBounds();
      let hasBounds = false;

      drawableSegments.forEach((segment) => {
        if (!segment.viewport) {
          return;
        }

        bounds.extend(segment.viewport.southwest);
        bounds.extend(segment.viewport.northeast);
        hasBounds = true;
      });

      if (!hasBounds) {
        decodedPath.forEach((point) => bounds.extend(point));
        hasBounds = decodedPath.length > 0;
      }

      if (hasBounds) {
        map.fitBounds(bounds);
        lastFittedSignatureRef.current = renderSignature;
      }
    }

    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
      lastRenderedSignatureRef.current = null;
      lastFittedSignatureRef.current = null;
    };
  }, [drawableSegments, geometryLib, map, renderSignature]);

  return null;
};

export default SelectedDayRoutePolyline;
