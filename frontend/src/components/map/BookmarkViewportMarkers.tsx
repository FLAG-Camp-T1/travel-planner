import { useEffect, useMemo, useRef, useState } from 'react';
import { AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import { useShallow } from 'zustand/react/shallow';
import { createBookmarkDetailOverlay } from '@/components/place/placeDetailOverlayFactory';
import { useAppStore } from '@/stores/useAppStore';
import { getFilteredBookmarks } from '@/utils/bookmarkFilters';

const isLongitudeWithinBounds = (lng: number, west: number, east: number) => {
  if (west <= east) {
    return lng >= west && lng <= east;
  }

  return lng >= west || lng <= east;
};

const isPointWithinBounds = (
  latitude: number,
  longitude: number,
  bounds: google.maps.LatLngBoundsLiteral | null,
) => {
  if (!bounds) {
    return false;
  }

  return (
    latitude >= bounds.south &&
    latitude <= bounds.north &&
    isLongitudeWithinBounds(longitude, bounds.west, bounds.east)
  );
};

export default function BookmarkViewportMarkers() {
  const {
    activeDetailOverlay,
    activePlannerPanel,
    bookmarks,
    bookmarksStatus,
    fetchBookmarks,
    hoveredBookmarkId,
    openPlaceDetail,
    selectedBookmarkCategoryFilter,
  } = useAppStore(
    useShallow((state) => ({
      activeDetailOverlay: state.activeDetailOverlay,
      activePlannerPanel: state.activePlannerPanel,
      bookmarks: state.bookmarks,
      bookmarksStatus: state.bookmarksStatus,
      fetchBookmarks: state.fetchBookmarks,
      hoveredBookmarkId: state.hoveredBookmarkId,
      openPlaceDetail: state.openPlaceDetail,
      selectedBookmarkCategoryFilter: state.selectedBookmarkCategoryFilter,
    })),
  );

  const map = useMap();
  const [mapBounds, setMapBounds] = useState<google.maps.LatLngBoundsLiteral | null>(null);
  const lastFocusedBookmarkKeyRef = useRef<string | null>(null);
  const isBookmarksPanelActive = activePlannerPanel === 'bookmarks';

  useEffect(() => {
    if (!isBookmarksPanelActive || bookmarksStatus !== 'idle') {
      return;
    }

    void fetchBookmarks();
  }, [bookmarksStatus, fetchBookmarks, isBookmarksPanelActive]);

  useEffect(() => {
    if (!map || !isBookmarksPanelActive) {
      return;
    }

    const syncBounds = () => {
      setMapBounds(map.getBounds()?.toJSON() ?? null);
    };

    syncBounds();
    const listener = map.addListener('bounds_changed', syncBounds);

    return () => listener.remove();
  }, [isBookmarksPanelActive, map]);

  useEffect(() => {
    if (!map) {
      return;
    }

    if (activeDetailOverlay?.kind !== 'bookmark') {
      lastFocusedBookmarkKeyRef.current = null;
      return;
    }

    const latitude = activeDetailOverlay.sourceSummary.latitude;
    const longitude = activeDetailOverlay.sourceSummary.longitude;

    if (latitude == null || longitude == null) {
      return;
    }

    const focusKey = `${activeDetailOverlay.placeId}:${latitude}:${longitude}`;
    if (lastFocusedBookmarkKeyRef.current === focusKey) {
      return;
    }

    lastFocusedBookmarkKeyRef.current = focusKey;
    map.panTo({ lat: latitude, lng: longitude });

    const currentZoom = map.getZoom() ?? 15;
    if (currentZoom < 15) {
      map.setZoom(15);
    }
  }, [activeDetailOverlay, map]);

  const visibleBookmarks = useMemo(() => {
    if (!isBookmarksPanelActive || !mapBounds) {
      return [];
    }

    return getFilteredBookmarks(bookmarks, selectedBookmarkCategoryFilter).filter((bookmark) => {
      if (bookmark.poiLatitude == null || bookmark.poiLongitude == null) {
        return false;
      }

      return isPointWithinBounds(bookmark.poiLatitude, bookmark.poiLongitude, mapBounds);
    });
  }, [bookmarks, isBookmarksPanelActive, mapBounds, selectedBookmarkCategoryFilter]);

  if (!isBookmarksPanelActive || visibleBookmarks.length === 0) {
    return null;
  }

  return (
    <>
      {visibleBookmarks.map((bookmark) => {
        const isSelectedBookmark =
          activeDetailOverlay?.kind === 'bookmark' &&
          activeDetailOverlay.placeId === bookmark.googlePlaceId;
        const isHoveredBookmark = hoveredBookmarkId === bookmark.bookmarkId;

        return (
          <AdvancedMarker
            key={bookmark.bookmarkId}
            position={{
              lat: bookmark.poiLatitude as number,
              lng: bookmark.poiLongitude as number,
            }}
            title={bookmark.poiName}
            onClick={() => {
              void openPlaceDetail(createBookmarkDetailOverlay(bookmark));
            }}
          >
            <Pin
              background={
                isSelectedBookmark ? '#0f172a' : isHoveredBookmark ? '#0f766e' : '#14b8a6'
              }
              borderColor={
                isSelectedBookmark ? '#020617' : isHoveredBookmark ? '#115e59' : '#0f766e'
              }
              glyphColor="#ffffff"
              scale={isSelectedBookmark ? 1.18 : isHoveredBookmark ? 1.1 : 1}
            />
          </AdvancedMarker>
        );
      })}
    </>
  );
}
