import { useState } from 'react';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import CustomZoomControl from '../components/map/CustomZoomControl';
import RoutePolyline from '../components/map/RoutePolyline';
import DebugRoutePanel from '../components/map/DebugRoutePanel';

const DEFAULT_COORDINATES = { lat: 38.8977, lng: -77.0365 };
const DEFAULT_ZOOM = 13;

/**
 * RouteState is the single source of truth for the currently displayed route on the map.
 * It is managed at the PlannerPage level and passed down to RoutePolyline, which is responsible for rendering the route on the map.
 * If either originId or destinationId is null, RoutePolyline will not attempt to fetch or render a route.
 */
interface RouteState {
  /**
   * Google Place ID for the origin location.
   * @example 'ChIJVVVVVYx3j4ARP-3NGldc8qQ'
   */
  originId: string | null;

  /**
   * Google Place ID for the destination location.
   * @example 'ChIJJcSDXXx3j4ARRef7L0P3GpY'
   */
  destinationId: string | null;
}

export default function PlannerPage() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
  const [cameraProps] = useState({
    center: DEFAULT_COORDINATES,
    zoom: DEFAULT_ZOOM,
  });

  // The single source of truth for the route generation.
  // Other developers will eventually update this state via Context or Props.
  const [routeState, setRouteState] = useState<RouteState>({
    originId: null,
    destinationId: null,
  });

  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 text-red-600 font-bold p-10 border-4 border-dashed border-red-200">
        Configuration Error: VITE_GOOGLE_MAPS_API_KEY is missing in .env
      </div>
    );
  }

  // Exposed handlers for the debug panel (and future search components)
  const handleApplyRoute = (originId: string, destId: string) => {
    setRouteState({ originId, destinationId: destId });
  };

  const handleClearRoute = () => {
    setRouteState({ originId: null, destinationId: null });
  };

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <APIProvider apiKey={apiKey}>
        <div className="relative w-full h-full">
          {/* Debug Panel floating on top of the map */}
          <DebugRoutePanel onApplyRoute={handleApplyRoute} onClearRoute={handleClearRoute} />

          <Map
            defaultCenter={cameraProps.center}
            defaultZoom={cameraProps.zoom}
            style={{ width: '100%', height: '100%' }}
            disableDefaultUI={true}
            mapTypeControl={false}
            gestureHandling={'greedy'}
            mapId={'DEMO_MAP_ID'}
          >
            <CustomZoomControl />

            {routeState.originId && routeState.destinationId && (
              <RoutePolyline
                originPlaceId={routeState.originId}
                destinationPlaceId={routeState.destinationId}
              />
            )}
          </Map>
        </div>
      </APIProvider>
    </div>
  );
}
