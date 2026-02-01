'use client';

import { useCallback, useState } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { motion, AnimatePresence } from 'framer-motion';
import { useMapStore } from '@/stores/mapStore';
import { usePlacesStore } from '@/stores/placesStore';
import { Map2D } from './Map2D';
import { Map3D } from './Map3D';
import { StreetView } from './StreetView';
import { ViewSwitcher } from './ViewSwitcher';
import { MapControls } from './MapControls';
import type { Marker } from '@/types';

interface MapContainerProps {
  apiKey: string;
  onPlaceSelect?: (placeId: string) => void;
}

export function MapContainer({ apiKey, onPlaceSelect }: MapContainerProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { viewMode, flyTo } = useMapStore();
  const { selectPlace } = usePlacesStore();

  const handleMarkerClick = useCallback(
    (marker: Marker) => {
      if (marker.placeId && onPlaceSelect) {
        onPlaceSelect(marker.placeId);
      }
    },
    [onPlaceSelect]
  );

  const handleLocateUser = useCallback(() => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        flyTo(
          {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          15
        );
      },
      (error) => {
        console.warn('Failed to get location:', error.message);
      },
      { enableHighAccuracy: true }
    );
  }, [flyTo]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  return (
    <APIProvider apiKey={apiKey} libraries={['places', 'maps3d']}>
      <div className="relative w-full h-full">
        <AnimatePresence mode="wait">
          {viewMode === 'map2d' && (
            <motion.div
              key="map2d"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              <Map2D
                isDarkMode={isDarkMode}
                onMarkerClick={handleMarkerClick}
              />
            </motion.div>
          )}

          {viewMode === 'map3d' && (
            <motion.div
              key="map3d"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              <Map3D onMarkerClick={handleMarkerClick} />
            </motion.div>
          )}

          {viewMode === 'streetview' && (
            <motion.div
              key="streetview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              <StreetView />
            </motion.div>
          )}
        </AnimatePresence>

        {/* View Switcher - always visible */}
        <ViewSwitcher />

        {/* Map Controls - hide in Street View */}
        {viewMode !== 'streetview' && (
          <MapControls
            onLocateUser={handleLocateUser}
            isDarkMode={isDarkMode}
            onToggleDarkMode={toggleDarkMode}
          />
        )}

        {/* Loading overlay */}
        <LoadingOverlay />
      </div>
    </APIProvider>
  );
}

function LoadingOverlay() {
  const isLoading = useMapStore((s) => s.isLoading);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-lg shadow-lg">
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-600">Loading...</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Export individual components for custom layouts
export { Map2D } from './Map2D';
export { Map3D } from './Map3D';
export { StreetView } from './StreetView';
export { ViewSwitcher, ViewSwitcherCompact } from './ViewSwitcher';
export { MapControls, MapControlsBottom } from './MapControls';
export { CustomMarker, SimpleMarker } from './CustomMarker';
