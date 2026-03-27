import { ControlPosition, MapControl, useMap } from '@vis.gl/react-google-maps';

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

export default CustomZoomControl;
