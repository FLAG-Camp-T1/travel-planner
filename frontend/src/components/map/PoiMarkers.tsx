import { useEffect } from 'react';
import { AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import { useAppStore } from '@/stores/useAppStore';

export default function POIMarkers() {
  const poiResults = useAppStore((state) => state.poiResults);
  const selectedPOI = useAppStore((state) => state.selectedPOI);
  const selectPOI = useAppStore((state) => state.selectPOI);
  const map = useMap();

  useEffect(() => {
    if (!map || !selectedPOI) return;
    map.panTo({ lat: selectedPOI.latitude, lng: selectedPOI.longitude });
    map.setZoom(15);
  }, [map, selectedPOI]);

  if (poiResults.length === 0) return null;

  return (
    <>
      {poiResults.map((poi) => (
        <AdvancedMarker
          key={poi.placeId}
          position={{ lat: poi.latitude, lng: poi.longitude }}
          title={poi.name}
          onClick={() => selectPOI(poi)}
        >
          <Pin
            background={selectedPOI?.placeId === poi.placeId ? '#ef4444' : '#3b82f6'}
            glyphColor="#fff"
            borderColor={selectedPOI?.placeId === poi.placeId ? '#b91c1c' : '#1d4ed8'}
          />
        </AdvancedMarker>
      ))}
    </>
  );
}
