import { useLayoutEffect } from 'react';
import { Map } from '@vis.gl/react-google-maps';
import { useShallow } from 'zustand/react/shallow';
import POIMarkers from '@/components/map/PoiMarkers';
import SelectedDayRoutePolyline from '@/components/map/SelectedDayRoutePolyline';
import CustomZoomControl from '../components/map/CustomZoomControl';
import RoutePolyline from '../components/map/RoutePolyline';
import TripPlanMapShell from '@/components/trip-plan/TripPlanMapShell';
import TripPlanWorkspaceShell from '@/components/trip-plan/TripPlanWorkspaceShell';
import { useAppStore } from '@/stores/useAppStore';

const DEFAULT_COORDINATES = { lat: 38.8977, lng: -77.0365 };
const DEFAULT_ZOOM = 13;
const DEFAULT_MOCK_TRIP_ID = 1001;
const defaultCameraProps = {
  center: DEFAULT_COORDINATES,
  zoom: DEFAULT_ZOOM,
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
        <Map
          defaultCenter={defaultCameraProps.center}
          defaultZoom={defaultCameraProps.zoom}
          style={{ width: '100%', height: '100%' }}
          disableDefaultUI={true}
          mapTypeControl={false}
          gestureHandling={'greedy'}
          mapId={'DEMO_MAP_ID'}
        >
          <CustomZoomControl />
          <RoutePolyline />
          <SelectedDayRoutePolyline />
          <POIMarkers />
        </Map>
      </TripPlanMapShell>
    </TripPlanWorkspaceShell>
  );
}
