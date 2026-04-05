import type { PointerEvent } from 'react';
import BookmarksPanel from '@/components/trip-plan/panels/BookmarksPanel';
import PlaceDetailOverlay from '@/components/place/PlaceDetailOverlay';
import ExplorePanel from '@/components/trip-plan/panels/ExplorePanel';
import TripsPanel from '@/components/trip-plan/panels/TripsPanel';
import TripPlanSidebarShell from '@/components/trip-plan/TripPlanSidebarShell';
import { useAppStore } from '@/stores/useAppStore';

type SideBarProps = {
  width: number;
  onResizeStart: (event: PointerEvent<HTMLButtonElement>) => void;
};

export default function SideBar({ onResizeStart, width }: SideBarProps) {
  const activePlannerPanel = useAppStore((state) => state.activePlannerPanel);

  return (
    <TripPlanSidebarShell
      onResizeStart={onResizeStart}
      width={width}
      overlay={<PlaceDetailOverlay />}
    >
      {activePlannerPanel === 'explore' ? <ExplorePanel /> : null}
      {activePlannerPanel === 'trips' ? <TripsPanel /> : null}
      {activePlannerPanel === 'bookmarks' ? <BookmarksPanel /> : null}
    </TripPlanSidebarShell>
  );
}
