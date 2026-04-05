import { useEffect, useMemo, useRef } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useShallow } from 'zustand/react/shallow';
import type { DayRouteSegment, ItineraryItem } from '@/api/tripApi';
import { useAppStore } from '@/stores/useAppStore';
import {
  buildSelectedDayRouteMapModel,
  extendBoundsForSelectedDayRoute,
} from './selectedDayRouteMapModel';

const GAP_CONNECTOR_REPEAT = '10px';
const GAP_CONNECTOR_STROKE_WEIGHT = 3;
const GAP_CONNECTOR_STROKE_OPACITY = 0;
const GAP_CONNECTOR_SYMBOL_SCALE = 3;
const GAP_CONNECTOR_STROKE_OPACITY_ICON = 0.9;
const GAP_CONNECTOR_COLOR = '#64748B';
const SEGMENT_STROKE_OPACITY = 0.9;
const SEGMENT_STROKE_WEIGHT = 5;
const MARKER_BACKGROUND = '#111827';
const MARKER_BORDER = '#F8FAFC';
const MARKER_GLYPH_COLOR = '#F8FAFC';

const EMPTY_SEGMENTS: DayRouteSegment[] = [];
const EMPTY_ITEMS: ItineraryItem[] = [];

const cleanupPolylines = (polylines: google.maps.Polyline[]) => {
  polylines.forEach((polyline) => polyline.setMap(null));
  polylines.length = 0;
};

const cleanupMarkers = (markers: google.maps.marker.AdvancedMarkerElement[]) => {
  markers.forEach((marker) => {
    marker.map = null;
  });
  markers.length = 0;
};

const SelectedDayRoutePolyline = () => {
  const map = useMap();
  const geometryLib = useMapsLibrary('geometry');
  const markerLib = useMapsLibrary('marker');
  const {
    currentTrip,
    dayItemsByDayNumber,
    dayRouteColorMode,
    dayRouteSegmentsByDayNumber,
    selectedDayNumber,
  } = useAppStore(
    useShallow((state) => ({
      currentTrip: state.currentTrip,
      dayItemsByDayNumber: state.dayItemsByDayNumber,
      dayRouteColorMode: state.dayRouteColorMode,
      dayRouteSegmentsByDayNumber: state.dayRouteSegmentsByDayNumber,
      selectedDayNumber: state.selectedDayNumber,
    })),
  );

  const polylineRefs = useRef<google.maps.Polyline[]>([]);
  const gapConnectorRefs = useRef<google.maps.Polyline[]>([]);
  const markerRefs = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const lastFittedSignatureRef = useRef<string | null>(null);
  const dayCacheKey =
    currentTrip && selectedDayNumber !== null ? `${currentTrip.tripId}:${selectedDayNumber}` : null;

  const currentDaySegments =
    dayCacheKey !== null
      ? (dayRouteSegmentsByDayNumber[dayCacheKey] ?? EMPTY_SEGMENTS)
      : EMPTY_SEGMENTS;
  const currentDayItems =
    dayCacheKey !== null ? (dayItemsByDayNumber[dayCacheKey] ?? EMPTY_ITEMS) : EMPTY_ITEMS;
  const mapModel = useMemo(
    () =>
      buildSelectedDayRouteMapModel({
        geometryLib,
        items: currentDayItems,
        segments: currentDaySegments,
        selectedDayNumber,
        colorMode: dayRouteColorMode,
      }),
    [currentDayItems, currentDaySegments, dayRouteColorMode, geometryLib, selectedDayNumber],
  );

  useEffect(() => {
    if (!map || !geometryLib || !mapModel.routeSignature) {
      cleanupPolylines(polylineRefs.current);
      lastFittedSignatureRef.current = null;
      return;
    }

    if (mapModel.decodedSegments.length === 0) {
      cleanupPolylines(polylineRefs.current);
      lastFittedSignatureRef.current = null;
      return;
    }

    mapModel.decodedSegments.forEach((segment, segmentIndex) => {
      if (!polylineRefs.current[segmentIndex]) {
        polylineRefs.current[segmentIndex] = new google.maps.Polyline({
          map,
          strokeOpacity: SEGMENT_STROKE_OPACITY,
          strokeWeight: SEGMENT_STROKE_WEIGHT,
        });
      }

      polylineRefs.current[segmentIndex].setMap(map);
      polylineRefs.current[segmentIndex].setOptions({
        strokeColor: segment.strokeColor,
        strokeOpacity: SEGMENT_STROKE_OPACITY,
        strokeWeight: SEGMENT_STROKE_WEIGHT,
      });
      polylineRefs.current[segmentIndex].setPath(segment.path);
    });

    polylineRefs.current
      .slice(mapModel.decodedSegments.length)
      .forEach((polyline) => polyline.setMap(null));
    polylineRefs.current.length = mapModel.decodedSegments.length;

    if (lastFittedSignatureRef.current !== mapModel.routeSignature) {
      const bounds = new google.maps.LatLngBounds();
      const hasBounds = extendBoundsForSelectedDayRoute(bounds, mapModel.decodedSegments);

      if (hasBounds) {
        map.fitBounds(bounds);
        lastFittedSignatureRef.current = mapModel.routeSignature;
      }
    }
  }, [geometryLib, map, mapModel]);

  useEffect(() => {
    if (!map || !mapModel.routeSignature) {
      cleanupPolylines(gapConnectorRefs.current);
      return;
    }
    const dashedLineSymbol: google.maps.Symbol = {
      path: 'M 0,-1 0,1',
      strokeOpacity: GAP_CONNECTOR_STROKE_OPACITY_ICON,
      scale: GAP_CONNECTOR_SYMBOL_SCALE,
    };

    mapModel.gapConnectors.forEach((connector, connectorIndex) => {
      if (!gapConnectorRefs.current[connectorIndex]) {
        gapConnectorRefs.current[connectorIndex] = new google.maps.Polyline({
          map,
          geodesic: true,
        });
      }

      gapConnectorRefs.current[connectorIndex].setMap(map);
      gapConnectorRefs.current[connectorIndex].setOptions({
        strokeColor: GAP_CONNECTOR_COLOR,
        strokeOpacity: GAP_CONNECTOR_STROKE_OPACITY,
        strokeWeight: GAP_CONNECTOR_STROKE_WEIGHT,
        icons: [
          {
            icon: dashedLineSymbol,
            offset: '0',
            repeat: GAP_CONNECTOR_REPEAT,
          },
        ],
      });
      gapConnectorRefs.current[connectorIndex].setPath([connector.start, connector.end]);
    });

    gapConnectorRefs.current
      .slice(mapModel.gapConnectors.length)
      .forEach((connector) => connector.setMap(null));
    gapConnectorRefs.current.length = mapModel.gapConnectors.length;
  }, [map, mapModel]);

  useEffect(() => {
    if (!map || !markerLib || !mapModel.markerSignature) {
      cleanupMarkers(markerRefs.current);
      return;
    }
    if (mapModel.markerPoints.length === 0) {
      cleanupMarkers(markerRefs.current);
      return;
    }

    mapModel.markerPoints.forEach((markerPoint, markerIndex) => {
      if (!markerRefs.current[markerIndex]) {
        markerRefs.current[markerIndex] = new markerLib.AdvancedMarkerElement({
          map,
        });
      }

      const pinElement = new markerLib.PinElement({
        background: MARKER_BACKGROUND,
        borderColor: MARKER_BORDER,
        glyphColor: MARKER_GLYPH_COLOR,
        glyph: String(markerPoint.visitOrder),
        scale: 0.9,
      });

      markerRefs.current[markerIndex].map = map;
      markerRefs.current[markerIndex].position = markerPoint.position;
      markerRefs.current[markerIndex].title = markerPoint.title;
      markerRefs.current[markerIndex].content = pinElement.element;
    });

    markerRefs.current.slice(mapModel.markerPoints.length).forEach((marker) => {
      marker.map = null;
    });
    markerRefs.current.length = mapModel.markerPoints.length;
  }, [map, mapModel, markerLib]);

  useEffect(() => {
    const polylines = polylineRefs.current;
    const gapConnectors = gapConnectorRefs.current;
    const markers = markerRefs.current;

    return () => {
      cleanupPolylines(polylines);
      cleanupPolylines(gapConnectors);
      cleanupMarkers(markers);
      lastFittedSignatureRef.current = null;
    };
  }, []);

  return null;
};

export default SelectedDayRoutePolyline;
