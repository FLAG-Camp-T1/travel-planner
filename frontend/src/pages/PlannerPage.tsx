import { useState } from 'react';
import { APIProvider, Map } from '@vis.gl/react-google-maps';

const DEFAULT_COORDINATES = { lat: 37.7749, lng: -122.4194 }; // San Francisco
const DEFAULT_ZOOM = 12;

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
          </Map>
        </div>
      </APIProvider>
    </div>
  );
}
