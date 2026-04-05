import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useShallow } from 'zustand/react/shallow';
import type { DayRouteSegment, ItineraryItem } from '@/api/tripApi';
import { useAppStore } from '@/stores/useAppStore';

const EMPTY_SEGMENTS: DayRouteSegment[] = [];
const EMPTY_ITEMS: ItineraryItem[] = [];
const GOLDEN_ANGLE_DEGREES = 137.508;
const GAP_DISTANCE_THRESHOLD_METERS = 20;
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

type DecodedSegment = {
  fromItemId: number;
  toItemId: number;
  path: google.maps.LatLng[];
  viewport?: DayRouteSegment['viewport'];
  strokeColor: string;
};

type ItineraryMarkerPoint = {
  itemId: number;
  visitOrder: number;
  title: string;
  position: google.maps.LatLng;
};

type GapConnector = {
  start: google.maps.LatLng;
  end: google.maps.LatLng;
};

const hashString = (value: string) => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 360;
  }

  return hash;
};

const normalizeHue = (value: number) => {
  return ((value % 360) + 360) % 360;
};

const createSegmentColor = (baseHue: number, segmentIndex: number) => {
  const hue = normalizeHue(baseHue + segmentIndex * GOLDEN_ANGLE_DEGREES);
  return `hsl(${hue} 82% 46%)`;
};

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
  const { dayItemsByDayNumber, dayRouteSegmentsByDayNumber, selectedDayNumber } = useAppStore(
    useShallow((state) => ({
      dayItemsByDayNumber: state.dayItemsByDayNumber,
      dayRouteSegmentsByDayNumber: state.dayRouteSegmentsByDayNumber,
      selectedDayNumber: state.selectedDayNumber,
    })),
  );

  const polylineRefs = useRef<google.maps.Polyline[]>([]);
  const gapConnectorRefs = useRef<google.maps.Polyline[]>([]);
  const markerRefs = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const decodedSegmentsRef = useRef<{
    signature: string | null;
    segments: DecodedSegment[];
  }>({
    signature: null,
    segments: [],
  });
  const gapConnectorsRef = useRef<{
    signature: string | null;
    connectors: GapConnector[];
  }>({
    signature: null,
    connectors: [],
  });
  const lastMarkerSignatureRef = useRef<string | null>(null);
  const lastGapConnectorSignatureRef = useRef<string | null>(null);
  const lastFittedSignatureRef = useRef<string | null>(null);

  const currentDaySegments =
    selectedDayNumber !== null
      ? (dayRouteSegmentsByDayNumber[selectedDayNumber] ?? EMPTY_SEGMENTS)
      : EMPTY_SEGMENTS;
  const currentDayItems =
    selectedDayNumber !== null
      ? (dayItemsByDayNumber[selectedDayNumber] ?? EMPTY_ITEMS)
      : EMPTY_ITEMS;
  const drawableSegments = currentDaySegments.filter(
    (segment) => segment.encodedPolyline.trim().length > 0,
  );
  const colorSeed =
    selectedDayNumber !== null && drawableSegments.length > 0
      ? `${selectedDayNumber}:${drawableSegments.map((segment) => `${segment.fromItemId}-${segment.toItemId}`).join('|')}`
      : null;
  const renderSignature =
    selectedDayNumber !== null && drawableSegments.length > 0
      ? `${selectedDayNumber}:${drawableSegments.map((segment) => segment.encodedPolyline.trim()).join('|')}`
      : null;
  const markerSignature =
    renderSignature !== null
      ? `${renderSignature}:${currentDayItems.map((item) => `${item.itemId}:${item.visitOrder}:${item.name}`).join('|')}`
      : null;
  const itemsById = useMemo(() => {
    return new Map(currentDayItems.map((item) => [item.itemId, item]));
  }, [currentDayItems]);

  const getDecodedSegments = useCallback(() => {
    if (!geometryLib || !renderSignature || !colorSeed) {
      decodedSegmentsRef.current = {
        signature: null,
        segments: [],
      };
      return [];
    }

    if (decodedSegmentsRef.current.signature === renderSignature) {
      return decodedSegmentsRef.current.segments;
    }

    const baseHue = hashString(colorSeed);
    const decodedSegments = drawableSegments
      .map((segment, segmentIndex) => ({
        fromItemId: segment.fromItemId,
        toItemId: segment.toItemId,
        path: geometryLib.encoding.decodePath(segment.encodedPolyline.trim()),
        viewport: segment.viewport,
        strokeColor: createSegmentColor(baseHue, segmentIndex),
      }))
      .filter((segment) => segment.path.length > 0);

    decodedSegmentsRef.current = {
      signature: renderSignature,
      segments: decodedSegments,
    };

    return decodedSegments;
  }, [colorSeed, drawableSegments, geometryLib, renderSignature]);

  const getGapConnectors = useCallback(() => {
    if (!geometryLib || !renderSignature) {
      gapConnectorsRef.current = {
        signature: null,
        connectors: [],
      };
      return [];
    }

    if (gapConnectorsRef.current.signature === renderSignature) {
      return gapConnectorsRef.current.connectors;
    }

    const decodedSegments = getDecodedSegments();
    const connectors: GapConnector[] = [];

    for (let segmentIndex = 0; segmentIndex < decodedSegments.length - 1; segmentIndex += 1) {
      const currentSegment = decodedSegments[segmentIndex];
      const nextSegment = decodedSegments[segmentIndex + 1];
      const currentEnd = currentSegment.path[currentSegment.path.length - 1];
      const nextStart = nextSegment.path[0];

      const gapDistance = geometryLib.spherical.computeDistanceBetween(currentEnd, nextStart);
      if (gapDistance <= GAP_DISTANCE_THRESHOLD_METERS) {
        continue;
      }

      connectors.push({
        start: currentEnd,
        end: nextStart,
      });
    }

    gapConnectorsRef.current = {
      signature: renderSignature,
      connectors,
    };

    return connectors;
  }, [geometryLib, getDecodedSegments, renderSignature]);

  useEffect(() => {
    if (!map || !geometryLib || !renderSignature) {
      cleanupPolylines(polylineRefs.current);
      lastFittedSignatureRef.current = null;
      return;
    }

    const decodedSegments = getDecodedSegments();
    if (decodedSegments.length === 0) {
      cleanupPolylines(polylineRefs.current);
      lastFittedSignatureRef.current = null;
      return;
    }

    decodedSegments.forEach((segment, segmentIndex) => {
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

    polylineRefs.current.slice(decodedSegments.length).forEach((polyline) => polyline.setMap(null));
    polylineRefs.current.length = decodedSegments.length;

    if (lastFittedSignatureRef.current !== renderSignature) {
      const bounds = new google.maps.LatLngBounds();
      let hasBounds = false;

      decodedSegments.forEach((segment) => {
        if (!segment.viewport) {
          return;
        }

        bounds.extend(segment.viewport.southwest);
        bounds.extend(segment.viewport.northeast);
        hasBounds = true;
      });

      if (!hasBounds) {
        decodedSegments.forEach((segment) => {
          segment.path.forEach((point) => bounds.extend(point));
        });
        hasBounds = decodedSegments.length > 0;
      }

      if (hasBounds) {
        map.fitBounds(bounds);
        lastFittedSignatureRef.current = renderSignature;
      }
    }
  }, [geometryLib, getDecodedSegments, map, renderSignature]);

  useEffect(() => {
    if (!map || !geometryLib || !renderSignature) {
      cleanupPolylines(gapConnectorRefs.current);
      lastGapConnectorSignatureRef.current = null;
      return;
    }

    if (lastGapConnectorSignatureRef.current === renderSignature) {
      return;
    }

    const gapConnectors = getGapConnectors();
    const dashedLineSymbol: google.maps.Symbol = {
      path: 'M 0,-1 0,1',
      strokeOpacity: GAP_CONNECTOR_STROKE_OPACITY_ICON,
      scale: GAP_CONNECTOR_SYMBOL_SCALE,
    };

    gapConnectors.forEach((connector, connectorIndex) => {
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
      .slice(gapConnectors.length)
      .forEach((connector) => connector.setMap(null));
    gapConnectorRefs.current.length = gapConnectors.length;
    lastGapConnectorSignatureRef.current = renderSignature;
  }, [geometryLib, getGapConnectors, map, renderSignature]);

  useEffect(() => {
    if (!map || !geometryLib || !markerLib || !markerSignature || !renderSignature) {
      cleanupMarkers(markerRefs.current);
      lastMarkerSignatureRef.current = null;
      return;
    }

    if (lastMarkerSignatureRef.current === markerSignature) {
      return;
    }

    const decodedSegments = getDecodedSegments();
    if (decodedSegments.length === 0) {
      cleanupMarkers(markerRefs.current);
      lastMarkerSignatureRef.current = null;
      return;
    }

    const markerPoints: ItineraryMarkerPoint[] = [];
    const firstSegment = decodedSegments[0];
    const firstItem = itemsById.get(firstSegment.fromItemId);
    markerPoints.push({
      itemId: firstSegment.fromItemId,
      visitOrder: firstItem?.visitOrder ?? 1,
      title: firstItem?.name ?? `Stop ${firstItem?.visitOrder ?? 1}`,
      position: firstSegment.path[0],
    });

    decodedSegments.forEach((segment, segmentIndex) => {
      const toItem = itemsById.get(segment.toItemId);
      markerPoints.push({
        itemId: segment.toItemId,
        visitOrder: toItem?.visitOrder ?? segmentIndex + 2,
        title: toItem?.name ?? `Stop ${segmentIndex + 2}`,
        position: segment.path[segment.path.length - 1],
      });
    });

    markerPoints.forEach((markerPoint, markerIndex) => {
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

    markerRefs.current.slice(markerPoints.length).forEach((marker) => {
      marker.map = null;
    });
    markerRefs.current.length = markerPoints.length;
    lastMarkerSignatureRef.current = markerSignature;
  }, [
    geometryLib,
    getDecodedSegments,
    itemsById,
    map,
    markerLib,
    markerSignature,
    renderSignature,
  ]);

  useEffect(() => {
    const polylines = polylineRefs.current;
    const gapConnectors = gapConnectorRefs.current;
    const markers = markerRefs.current;

    return () => {
      cleanupPolylines(polylines);
      cleanupPolylines(gapConnectors);
      cleanupMarkers(markers);
      decodedSegmentsRef.current = {
        signature: null,
        segments: [],
      };
      gapConnectorsRef.current = {
        signature: null,
        connectors: [],
      };
      lastMarkerSignatureRef.current = null;
      lastGapConnectorSignatureRef.current = null;
      lastFittedSignatureRef.current = null;
    };
  }, []);

  return null;
};

export default SelectedDayRoutePolyline;
