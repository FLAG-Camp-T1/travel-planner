import { useLayoutEffect } from 'react';
import { Map } from '@vis.gl/react-google-maps';
import DayRouteViewportFocusBridge from '@/components/map/DayRouteViewportFocusBridge';
import GlobalApiErrorBanner from '@/components/map/GlobalApiErrorBanner';
import MapPlaceClickOverlayBridge from '@/components/map/MapPlaceClickOverlayBridge';
import PlannerMapCameraSync from '@/components/map/PlannerMapCameraSync';
import POIMarkers from '@/components/map/POIMarkers';
import SelectedDayRoutePolyline from '@/components/map/SelectedDayRoutePolyline';
import TripActionSuccessToast from '@/components/map/TripActionSuccessToast';
import { useShallow } from 'zustand/react/shallow';
import CustomZoomControl from '../components/map/CustomZoomControl';
import TripPlanMapShell from '@/components/trip-plan/TripPlanMapShell';
import TripPlanWorkspaceShell from '@/components/trip-plan/TripPlanWorkspaceShell';
import { useAppStore } from '@/stores/useAppStore';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '@/stores/slices/mapViewSlice';

const DEFAULT_MOCK_TRIP_ID = 1001;
const defaultCameraProps = {
  center: DEFAULT_MAP_CENTER,
  zoom: DEFAULT_MAP_ZOOM,
};
const SHOULD_ENABLE_DEV_FALLBACK =
  import.meta.env.DEV && import.meta.env.VITE_TRIP_PLAN_ENABLE_DEV_FALLBACK === 'true';

export default function PlannerPage() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
  const { bootstrapTrip, currentTrip, tripBootstrapStatus } = useAppStore(
    useShallow((state) => ({
      bootstrapTrip: state.bootstrapTrip,
      currentTrip: state.currentTrip,
      tripBootstrapStatus: state.tripBootstrapStatus,
    })),
  );

  useLayoutEffect(() => {
    if (!apiKey || !SHOULD_ENABLE_DEV_FALLBACK) {
      return;
    }

    if (currentTrip !== null || tripBootstrapStatus !== 'idle') {
      return;
    }

    void bootstrapTrip(DEFAULT_MOCK_TRIP_ID);
  }, [apiKey, bootstrapTrip, currentTrip, tripBootstrapStatus]);

  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 text-red-600 font-bold p-10 border-4 border-dashed border-red-200">
        Configuration Error: VITE_GOOGLE_MAPS_API_KEY is missing in .env
      </div>
    );
  }

  return (
    <TripPlanWorkspaceShell>
      <TripPlanMapShell apiKey={apiKey}>
        <div className="relative h-full w-full">
          <Map
            defaultCenter={defaultCameraProps.center}
            defaultZoom={defaultCameraProps.zoom}
            style={{ width: '100%', height: '100%' }}
            disableDefaultUI={true}
            mapTypeControl={false}
            gestureHandling={'greedy'}
            mapId={'DEMO_MAP_ID'}
          >
            <DayRouteViewportFocusBridge />
            <PlannerMapCameraSync />
            <MapPlaceClickOverlayBridge />
            <CustomZoomControl />
            <SelectedDayRoutePolyline />
            <POIMarkers />
          </Map>

          <GlobalApiErrorBanner />
          <TripActionSuccessToast />
        </div>
      </TripPlanMapShell>
    </TripPlanWorkspaceShell>
  );
}
