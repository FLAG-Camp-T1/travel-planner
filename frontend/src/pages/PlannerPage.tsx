import { Map } from '@vis.gl/react-google-maps';
import CustomZoomControl from '../components/map/CustomZoomControl';
import RoutePolyline from '../components/map/RoutePolyline';
import TripPlanMapShell from '@/components/trip-plan/TripPlanMapShell';
import TripPlanWorkspaceShell from '@/components/trip-plan/TripPlanWorkspaceShell';

const DEFAULT_COORDINATES = { lat: 38.8977, lng: -77.0365 };
const DEFAULT_ZOOM = 13;
const defaultCameraProps = {
  center: DEFAULT_COORDINATES,
  zoom: DEFAULT_ZOOM,
};

export default function PlannerPage() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

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
        </Map>
      </TripPlanMapShell>
    </TripPlanWorkspaceShell>
  );
}
