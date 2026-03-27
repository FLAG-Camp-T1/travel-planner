import { useState } from 'react';
import { APIProvider, ControlPosition, Map, MapControl, useMap } from '@vis.gl/react-google-maps';

const DEFAULT_COORDINATES = { lat: 38.8977, lng: -77.0365 }; // Washington, D.C.
const DEFAULT_ZOOM = 13;

const CustomZoomControl = () => {
  const map = useMap();

  const handleZoomIn = () => {
    if (map) map.setZoom((map.getZoom() || DEFAULT_ZOOM) + 1);
  };

  const handleZoomOut = () => {
    if (map) map.setZoom((map.getZoom() || DEFAULT_ZOOM) - 1);
  };

  return (
    <MapControl position={ControlPosition.TOP_RIGHT}>
      <div className="flex flex-col bg-white rounded-md shadow-md m-4 overflow-hidden border border-gray-200">
        <button
          onClick={handleZoomIn}
          className="w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-gray-100 font-bold border-b border-gray-200 transition-colors"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-gray-100 font-bold transition-colors"
          aria-label="Zoom out"
        >
          -
        </button>
      </div>
    </MapControl>
  );
};

export default function PlannerPage() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
  const [cameraProps] = useState({
    center: DEFAULT_COORDINATES,
    zoom: DEFAULT_ZOOM,
  });

  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 text-red-600 font-bold p-10 border-4 border-dashed border-red-200">
        ⚠️ 缺少配置：请检查 .env 文件，确保已配置 VITE_GOOGLE_MAPS_API_KEY
      </div>
    );
  }

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <APIProvider apiKey={apiKey}>
        <div className="relative w-full h-full">
          <Map
            defaultCenter={cameraProps.center}
            defaultZoom={cameraProps.zoom}
            style={{ width: '100%', height: '100%' }}
            disableDefaultUI={true}
            gestureHandling={'greedy'}
            // mapId={''}
          >
            {/* Map Overlay content goes here */}
            <CustomZoomControl />
          </Map>
        </div>
      </APIProvider>
    </div>
  );
}
