import { useEffect, useMemo, useRef } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useShallow } from 'zustand/react/shallow';
import type { DayRouteSegment, ItineraryItem } from '@/api/tripApi';
import { createPoiDetailOverlayFromItineraryItem } from '@/components/place/placeDetailOverlayFactory';
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
const FOCUSED_SEGMENT_STROKE_OPACITY = 1;
const DIMMED_SEGMENT_STROKE_OPACITY = 0.38;
const FOCUSED_SEGMENT_STROKE_WEIGHT = 7;
const DIMMED_SEGMENT_STROKE_WEIGHT = 4;
const DEFAULT_SEGMENT_Z_INDEX_BASE = 100;
const FOCUSED_SEGMENT_Z_INDEX = 1000;
const SEGMENT_TRANSITION_DURATION_MS = 180;
const COLOR_MODE_SWAP_TRANSITION_DURATION_MS = 260;
const MARKER_BACKGROUND = '#111827';
const MARKER_BORDER = '#F8FAFC';
const MARKER_GLYPH_COLOR = '#F8FAFC';

const EMPTY_SEGMENTS: DayRouteSegment[] = [];
const EMPTY_ITEMS: ItineraryItem[] = [];

type SegmentVisualState = {
  strokeColor: string;
  strokeOpacity: number;
  strokeWeight: number;
};

type HslColor = {
  hue: number;
  saturation: number;
  lightness: number;
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

const easeOutCubic = (progress: number) => 1 - Math.pow(1 - progress, 3);

const HSL_COLOR_PATTERN =
  /^hsl\(\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%\s*\)$/i;

const parseHslColor = (value: string): HslColor | null => {
  const match = HSL_COLOR_PATTERN.exec(value.trim());
  if (!match) {
    return null;
  }

  return {
    hue: Number(match[1]),
    saturation: Number(match[2]),
    lightness: Number(match[3]),
  };
};

const formatHslColor = ({ hue, saturation, lightness }: HslColor) => {
  return `hsl(${hue.toFixed(1)} ${saturation.toFixed(1)}% ${lightness.toFixed(1)}%)`;
};

const interpolateHue = (startHue: number, endHue: number, progress: number) => {
  const normalizedStart = ((startHue % 360) + 360) % 360;
  const normalizedEnd = ((endHue % 360) + 360) % 360;
  const delta = ((normalizedEnd - normalizedStart + 540) % 360) - 180;
  return normalizedStart + delta * progress;
};

const interpolateStrokeColor = (startColor: string, endColor: string, progress: number) => {
  const parsedStart = parseHslColor(startColor);
  const parsedEnd = parseHslColor(endColor);

  if (!parsedStart || !parsedEnd) {
    return progress < 1 ? startColor : endColor;
  }

  return formatHslColor({
    hue: interpolateHue(parsedStart.hue, parsedEnd.hue, progress),
    saturation: parsedStart.saturation + (parsedEnd.saturation - parsedStart.saturation) * progress,
    lightness: parsedStart.lightness + (parsedEnd.lightness - parsedStart.lightness) * progress,
  });
};

const extendBoundsForMarkerPoints = (
  bounds: google.maps.LatLngBounds,
  markerPoints: Array<{ position: google.maps.LatLng }>,
) => {
  if (markerPoints.length === 0) {
    return false;
  }

  markerPoints.forEach((markerPoint) => bounds.extend(markerPoint.position));
  return true;
};

const SelectedDayRoutePolyline = () => {
  const map = useMap();
  const geometryLib = useMapsLibrary('geometry');
  const markerLib = useMapsLibrary('marker');
  const {
    activeDayRouteSegmentIndex,
    currentTrip,
    dayItemsByDayNumber,
    dayRouteColorMode,
    dayRouteSegmentsByDayNumber,
    openPlaceDetail,
    setActiveDayRouteSegmentIndex,
    selectedDayNumber,
  } = useAppStore(
    useShallow((state) => ({
      activeDayRouteSegmentIndex: state.activeDayRouteSegmentIndex,
      currentTrip: state.currentTrip,
      dayItemsByDayNumber: state.dayItemsByDayNumber,
      dayRouteColorMode: state.dayRouteColorMode,
      dayRouteSegmentsByDayNumber: state.dayRouteSegmentsByDayNumber,
      openPlaceDetail: state.openPlaceDetail,
      setActiveDayRouteSegmentIndex: state.setActiveDayRouteSegmentIndex,
      selectedDayNumber: state.selectedDayNumber,
    })),
  );

  const polylineRefs = useRef<google.maps.Polyline[]>([]);
  const polylineClickListenerRefs = useRef<Array<google.maps.MapsEventListener | null>>([]);
  const polylineAnimationFrameRefs = useRef<Array<number | null>>([]);
  const polylineVisualStateRefs = useRef<Array<SegmentVisualState | null>>([]);
  const gapConnectorRefs = useRef<google.maps.Polyline[]>([]);
  const markerRefs = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const markerClickHandlerRefs = useRef<Array<(() => void) | null>>([]);
  const lastFittedSignatureRef = useRef<string | null>(null);
  const lastMarkerAutoFitDayKeyRef = useRef<string | null>(null);
  const previousDayRouteColorModeRef = useRef(dayRouteColorMode);
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
      return;
    }

    if (mapModel.decodedSegments.length === 0) {
      cleanupPolylines(polylineRefs.current);
      return;
    }

    const didColorModeChange = previousDayRouteColorModeRef.current !== dayRouteColorMode;

    mapModel.decodedSegments.forEach((segment, segmentIndex) => {
      if (!polylineRefs.current[segmentIndex]) {
        polylineRefs.current[segmentIndex] = new google.maps.Polyline({
          map,
          strokeColor: segment.strokeColor,
          strokeOpacity: SEGMENT_STROKE_OPACITY,
          strokeWeight: SEGMENT_STROKE_WEIGHT,
        });
        polylineVisualStateRefs.current[segmentIndex] = {
          strokeColor: segment.strokeColor,
          strokeOpacity: SEGMENT_STROKE_OPACITY,
          strokeWeight: SEGMENT_STROKE_WEIGHT,
        };
      }

      const isFocusedSegment = activeDayRouteSegmentIndex === segment.segmentIndex;
      const hasFocusedSegment = activeDayRouteSegmentIndex !== null;
      const targetStrokeOpacity = hasFocusedSegment
        ? isFocusedSegment
          ? FOCUSED_SEGMENT_STROKE_OPACITY
          : DIMMED_SEGMENT_STROKE_OPACITY
        : SEGMENT_STROKE_OPACITY;
      const targetStrokeWeight = hasFocusedSegment
        ? isFocusedSegment
          ? FOCUSED_SEGMENT_STROKE_WEIGHT
          : DIMMED_SEGMENT_STROKE_WEIGHT
        : SEGMENT_STROKE_WEIGHT;

      polylineRefs.current[segmentIndex].setMap(map);
      polylineRefs.current[segmentIndex].setOptions({
        zIndex: isFocusedSegment
          ? FOCUSED_SEGMENT_Z_INDEX
          : DEFAULT_SEGMENT_Z_INDEX_BASE + segment.segmentIndex,
      });
      polylineRefs.current[segmentIndex].setPath(segment.path);

      const currentVisualState = polylineVisualStateRefs.current[segmentIndex];
      if (polylineAnimationFrameRefs.current[segmentIndex] !== null) {
        cancelAnimationFrame(polylineAnimationFrameRefs.current[segmentIndex] as number);
      }

      if (
        !currentVisualState ||
        (currentVisualState.strokeColor === segment.strokeColor &&
          Math.abs(currentVisualState.strokeOpacity - targetStrokeOpacity) < 0.001 &&
          Math.abs(currentVisualState.strokeWeight - targetStrokeWeight) < 0.001)
      ) {
        polylineRefs.current[segmentIndex].setOptions({
          strokeColor: segment.strokeColor,
          strokeOpacity: targetStrokeOpacity,
          strokeWeight: targetStrokeWeight,
        });
        polylineVisualStateRefs.current[segmentIndex] = {
          strokeColor: segment.strokeColor,
          strokeOpacity: targetStrokeOpacity,
          strokeWeight: targetStrokeWeight,
        };
      } else {
        const animationStart = performance.now();
        const startState = currentVisualState;
        const shouldAnimateColorSwap =
          didColorModeChange && startState.strokeColor !== segment.strokeColor;
        const animationDuration = shouldAnimateColorSwap
          ? COLOR_MODE_SWAP_TRANSITION_DURATION_MS
          : SEGMENT_TRANSITION_DURATION_MS;

        const animateVisualState = (timestamp: number) => {
          const progress = Math.min((timestamp - animationStart) / animationDuration, 1);
          const easedProgress = easeOutCubic(progress);
          const nextStrokeOpacity =
            startState.strokeOpacity +
            (targetStrokeOpacity - startState.strokeOpacity) * easedProgress;
          let nextStrokeColor: string;
          let nextStrokeWeight: number;

          if (shouldAnimateColorSwap) {
            if (progress < 0.5) {
              const collapseProgress = easeOutCubic(progress / 0.5);
              nextStrokeColor = startState.strokeColor;
              nextStrokeWeight = startState.strokeWeight * (1 - collapseProgress);
            } else {
              const expandProgress = easeOutCubic((progress - 0.5) / 0.5);
              nextStrokeColor = segment.strokeColor;
              nextStrokeWeight = targetStrokeWeight * expandProgress;
            }
          } else {
            nextStrokeColor = interpolateStrokeColor(
              startState.strokeColor,
              segment.strokeColor,
              easedProgress,
            );
            nextStrokeWeight =
              startState.strokeWeight +
              (targetStrokeWeight - startState.strokeWeight) * easedProgress;
          }

          polylineRefs.current[segmentIndex]?.setOptions({
            strokeColor: nextStrokeColor,
            strokeOpacity: nextStrokeOpacity,
            strokeWeight: nextStrokeWeight,
          });
          polylineVisualStateRefs.current[segmentIndex] = {
            strokeColor: nextStrokeColor,
            strokeOpacity: nextStrokeOpacity,
            strokeWeight: nextStrokeWeight,
          };

          if (progress < 1) {
            polylineAnimationFrameRefs.current[segmentIndex] =
              requestAnimationFrame(animateVisualState);
            return;
          }

          polylineAnimationFrameRefs.current[segmentIndex] = null;
        };

        polylineAnimationFrameRefs.current[segmentIndex] =
          requestAnimationFrame(animateVisualState);
      }

      polylineClickListenerRefs.current[segmentIndex]?.remove();
      polylineClickListenerRefs.current[segmentIndex] = polylineRefs.current[
        segmentIndex
      ].addListener('click', () => {
        setActiveDayRouteSegmentIndex(
          activeDayRouteSegmentIndex === segment.segmentIndex ? null : segment.segmentIndex,
        );
      });
    });

    previousDayRouteColorModeRef.current = dayRouteColorMode;

    polylineRefs.current
      .slice(mapModel.decodedSegments.length)
      .forEach((polyline) => polyline.setMap(null));
    polylineRefs.current.length = mapModel.decodedSegments.length;
    polylineAnimationFrameRefs.current
      .slice(mapModel.decodedSegments.length)
      .forEach((animationFrame) => {
        if (animationFrame !== null) {
          cancelAnimationFrame(animationFrame);
        }
      });
    polylineAnimationFrameRefs.current.length = mapModel.decodedSegments.length;
    polylineClickListenerRefs.current.slice(mapModel.decodedSegments.length).forEach((listener) => {
      listener?.remove();
    });
    polylineClickListenerRefs.current.length = mapModel.decodedSegments.length;
    polylineVisualStateRefs.current.length = mapModel.decodedSegments.length;

    if (lastFittedSignatureRef.current !== `route:${mapModel.routeSignature}`) {
      const bounds = new google.maps.LatLngBounds();
      const hasBounds = extendBoundsForSelectedDayRoute(bounds, mapModel.decodedSegments);

      if (hasBounds) {
        map.fitBounds(bounds);
        lastFittedSignatureRef.current = `route:${mapModel.routeSignature}`;
      }
    }
  }, [
    activeDayRouteSegmentIndex,
    dayRouteColorMode,
    geometryLib,
    map,
    mapModel,
    setActiveDayRouteSegmentIndex,
  ]);

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

      const previousClickHandler = markerClickHandlerRefs.current[markerIndex];
      if (previousClickHandler) {
        markerRefs.current[markerIndex].removeEventListener('gmp-click', previousClickHandler);
        markerClickHandlerRefs.current[markerIndex] = null;
      }

      if (markerPoint.placeId) {
        const handleMarkerClick = () => {
          const matchedItem = currentDayItems.find((item) => item.itemId === markerPoint.itemId);

          if (!matchedItem) {
            return;
          }

          void openPlaceDetail(
            createPoiDetailOverlayFromItineraryItem({
              item: matchedItem,
              latitude: markerPoint.position.lat(),
              longitude: markerPoint.position.lng(),
            }),
          );
        };

        markerRefs.current[markerIndex].addEventListener('gmp-click', handleMarkerClick);
        markerClickHandlerRefs.current[markerIndex] = handleMarkerClick;
      }
    });

    markerRefs.current.slice(mapModel.markerPoints.length).forEach((marker, index) => {
      const handlerIndex = mapModel.markerPoints.length + index;
      const clickHandler = markerClickHandlerRefs.current[handlerIndex];
      if (clickHandler) {
        marker.removeEventListener('gmp-click', clickHandler);
      }
      marker.map = null;
    });
    markerRefs.current.length = mapModel.markerPoints.length;
    markerClickHandlerRefs.current.length = mapModel.markerPoints.length;
  }, [currentDayItems, map, mapModel, markerLib, openPlaceDetail]);

  useEffect(() => {
    if (!map || !mapModel.markerSignature || mapModel.routeSignature) {
      return;
    }

    if (!dayCacheKey || lastMarkerAutoFitDayKeyRef.current === dayCacheKey) {
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    const hasBounds = extendBoundsForMarkerPoints(bounds, mapModel.markerPoints);

    if (hasBounds) {
      map.fitBounds(bounds);
      lastFittedSignatureRef.current = `markers:${mapModel.markerSignature}`;
      lastMarkerAutoFitDayKeyRef.current = dayCacheKey;
    }
  }, [dayCacheKey, map, mapModel]);

  useEffect(() => {
    const polylines = polylineRefs.current;
    const polylineClickListeners = polylineClickListenerRefs.current;
    const polylineAnimationFrames = polylineAnimationFrameRefs.current;
    const gapConnectors = gapConnectorRefs.current;
    const markers = markerRefs.current;
    const markerClickHandlers = markerClickHandlerRefs.current;

    return () => {
      polylineAnimationFrames.forEach((animationFrame) => {
        if (animationFrame !== null) {
          cancelAnimationFrame(animationFrame);
        }
      });
      polylineClickListeners.forEach((listener) => listener?.remove());
      markerClickHandlers.forEach((clickHandler, index) => {
        if (clickHandler && markers[index]) {
          markers[index].removeEventListener('gmp-click', clickHandler);
        }
      });
      cleanupPolylines(polylines);
      cleanupPolylines(gapConnectors);
      cleanupMarkers(markers);
      polylineAnimationFrames.length = 0;
      polylineClickListeners.length = 0;
      markerClickHandlers.length = 0;
      lastFittedSignatureRef.current = null;
    };
  }, []);

  return null;
};

export default SelectedDayRoutePolyline;
