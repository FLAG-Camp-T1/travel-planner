import { useEffect, useRef } from 'react';
import { AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import { useAppStore } from '@/stores/useAppStore';
import type { POIDto } from '@/api/poiApi';
import type { ActiveDetailOverlay } from '@/stores/types';

const FOCUS_ZOOM_LEVEL = 15;
const PAN_ANIMATION_DURATION_MS = 450;

const easeInOutCubic = (progress: number) => {
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
};

const toPoiDetailOverlay = (poi: POIDto): ActiveDetailOverlay => ({
  kind: 'poi',
  placeId: poi.placeId,
  sourceSummary: {
    placeId: poi.placeId,
    name: poi.name,
    address: poi.address,
    latitude: poi.latitude,
    longitude: poi.longitude,
    categoryLabel: poi.poiType,
    rating: poi.rating,
  },
});

export default function POIMarkers() {
  const activePlannerPanel = useAppStore((state) => state.activePlannerPanel);
  const poiResults = useAppStore((state) => state.poiResults);
  const selectedPOI = useAppStore((state) => state.selectedPOI);
  const hoveredPOI = useAppStore((state) => state.hoveredPOI);
  const selectPOI = useAppStore((state) => state.selectPOI);
  const openPlaceDetail = useAppStore((state) => state.openPlaceDetail);
  const map = useMap();
  const animationFrameRef = useRef<number | null>(null);
  const isExploreActive = activePlannerPanel === 'explore';
  const visiblePoiResults = poiResults.flatMap((poi, index) =>
    isExploreActive && poi.latitude != null && poi.longitude != null ? [{ poi, index }] : [],
  );

  useEffect(() => {
    if (
      !isExploreActive ||
      !map ||
      selectedPOI?.latitude == null ||
      selectedPOI?.longitude == null
    ) {
      return;
    }

    const startCenter = map.getCenter();
    const targetCenter = { lat: selectedPOI.latitude, lng: selectedPOI.longitude };

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (!startCenter) {
      map.setCenter(targetCenter);
      map.setZoom(FOCUS_ZOOM_LEVEL);
      return;
    }

    const startLat = startCenter.lat();
    const startLng = startCenter.lng();
    const deltaLat = targetCenter.lat - startLat;
    const deltaLng = targetCenter.lng - startLng;

    if (Math.abs(deltaLat) < 1e-7 && Math.abs(deltaLng) < 1e-7) {
      if ((map.getZoom() ?? FOCUS_ZOOM_LEVEL) !== FOCUS_ZOOM_LEVEL) {
        map.setZoom(FOCUS_ZOOM_LEVEL);
      }
      return;
    }

    const animationStart = performance.now();

    const animatePan = (timestamp: number) => {
      const elapsed = timestamp - animationStart;
      const progress = Math.min(elapsed / PAN_ANIMATION_DURATION_MS, 1);
      const easedProgress = easeInOutCubic(progress);

      map.setCenter({
        lat: startLat + deltaLat * easedProgress,
        lng: startLng + deltaLng * easedProgress,
      });

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animatePan);
        return;
      }

      animationFrameRef.current = null;
      if ((map.getZoom() ?? FOCUS_ZOOM_LEVEL) !== FOCUS_ZOOM_LEVEL) {
        map.setZoom(FOCUS_ZOOM_LEVEL);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animatePan);
  }, [isExploreActive, map, selectedPOI]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  if (visiblePoiResults.length === 0) return null;

  return (
    <>
      {visiblePoiResults.map(({ poi, index }) => {
        const isSelected = selectedPOI?.placeId === poi.placeId;
        const isHovered = hoveredPOI?.placeId === poi.placeId;

        return (
          <AdvancedMarker
            key={poi.placeId}
            position={{ lat: poi.latitude, lng: poi.longitude }}
            title={`${index + 1}. ${poi.name}`}
            onClick={() => {
              selectPOI(poi);
              void openPlaceDetail(toPoiDetailOverlay(poi));
            }}
          >
            <Pin
              glyph={`${index + 1}`}
              background={isSelected ? '#ef4444' : isHovered ? '#f59e0b' : '#3b82f6'}
              glyphColor="#fff"
              borderColor={isSelected ? '#b91c1c' : isHovered ? '#b45309' : '#1d4ed8'}
              scale={isSelected ? 1.2 : isHovered ? 1.1 : 1}
            />
          </AdvancedMarker>
        );
      })}
    </>
  );
}
