'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useApiIsLoaded } from '@vis.gl/react-google-maps';
import { useMapStore } from '@/stores/mapStore';
import { usePlacesStore } from '@/stores/placesStore';
import { useChatIntentStore } from '@/stores/chatIntentStore';
import { config } from '@/lib/config';
import type { Marker, Place } from '@/types';

interface Map3DProps {
  onMarkerClick?: (marker: Marker) => void;
}

export function Map3D({ onMarkerClick }: Map3DProps) {
  const [mapContainer, setMapContainer] = useState<HTMLDivElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<Marker | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const map3dRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const marker3dRefs = useRef<Map<string, any>>(new Map());
  const { camera, markers, selectMarker } = useMapStore();
  const places = usePlacesStore((s) => s.places);
  const setPendingIntent = useChatIntentStore((s) => s.setPendingIntent);

  // Check if API is loaded
  const apiIsLoaded = useApiIsLoaded();

  // Store initial camera for first render
  const initialCameraRef = useRef(camera);

  // Track if changes are from user interaction (to avoid feedback loops)
  const isUserInteracting = useRef(false);
  const lastExternalUpdate = useRef(0);

  // Callback ref to get container element
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      setMapContainer(node);
    }
  }, []);

  // Initialize the 3D map once container and API are available
  useEffect(() => {
    if (!mapContainer || !apiIsLoaded) return;
    if (map3dRef.current) return;

    let isMounted = true;

    const initMap = async () => {
      try {
        // Import the maps3d library
        await window.google.maps.importLibrary('maps3d');

        // Wait for the custom element to be defined (with timeout)
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout waiting for gmp-map-3d')), 10000)
        );
        await Promise.race([
          customElements.whenDefined('gmp-map-3d'),
          timeout,
        ]);

        if (!isMounted) return;

        const initialCamera = initialCameraRef.current;
        const range = Math.pow(2, 21 - initialCamera.zoom) * 50;

        // Create the gmp-map-3d element
        const map3d = document.createElement('gmp-map-3d');

        // Set properties as objects
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const map3dElement = map3d as any;

        // IMPORTANT: mode is REQUIRED since Feb 2025 update (v3.60.1)
        // HYBRID shows 3D buildings with labels, SATELLITE is photorealistic
        map3dElement.mode = 'HYBRID';

        // Camera position
        map3dElement.center = {
          lat: initialCamera.center.lat,
          lng: initialCamera.center.lng,
          altitude: 0,
        };
        map3dElement.heading = initialCamera.heading || 0;
        map3dElement.tilt = initialCamera.tilt || 60;
        map3dElement.range = range;

        // Enable full 3D controls and gestures
        map3dElement.defaultUIDisabled = false;

        map3d.style.width = '100%';
        map3d.style.height = '100%';

        mapContainer.appendChild(map3d);
        map3dRef.current = map3d;

        // Listen for camera changes to sync back to store
        // Use a flag to prevent feedback loops with the camera sync effect
        const syncToStore = () => {
          if (!isMounted) return;
          // Mark as user interaction to prevent feedback loop
          isUserInteracting.current = true;

          const center = map3dElement.center;
          const newRange = map3dElement.range || 1000;
          const zoom = 21 - Math.log2(newRange / 50);

          useMapStore.getState().setCamera({
            center: center ? { lat: center.lat, lng: center.lng } : undefined,
            heading: map3dElement.heading || 0,
            tilt: map3dElement.tilt || 0,
            zoom: Math.max(1, Math.min(21, zoom)),
          });

          // Reset flag after a short delay
          setTimeout(() => {
            isUserInteracting.current = false;
          }, 100);
        };

        map3d.addEventListener('gmp-centerchange', syncToStore);
        map3d.addEventListener('gmp-headingchange', syncToStore);
        map3d.addEventListener('gmp-tiltchange', syncToStore);
        map3d.addEventListener('gmp-rangechange', syncToStore);

        if (isMounted) setIsReady(true);
      } catch (err) {
        console.error('Failed to initialize 3D map:', err);
        if (isMounted) {
          setError('Failed to load 3D map. This feature requires WebGL support.');
        }
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (map3dRef.current && mapContainer.contains(map3dRef.current)) {
        try {
          mapContainer.removeChild(map3dRef.current);
        } catch {
          // Ignore cleanup errors
        }
      }
      map3dRef.current = null;
    };
  }, [mapContainer, apiIsLoaded]);

  // Update camera when it changes from external sources (sidebar controls, flyTo, etc.)
  // Skip if the change came from user interaction with the map itself
  useEffect(() => {
    if (!map3dRef.current || !isReady) return;

    // Skip if user is interacting with the map directly
    if (isUserInteracting.current) return;

    const range = Math.pow(2, 21 - camera.zoom) * 50;

    map3dRef.current.center = {
      lat: camera.center.lat,
      lng: camera.center.lng,
      altitude: 0,
    };
    map3dRef.current.heading = camera.heading;
    map3dRef.current.tilt = camera.tilt || 60;
    map3dRef.current.range = range;

    lastExternalUpdate.current = Date.now();
  }, [camera, isReady]);

  // Create and manage 3D markers
  useEffect(() => {
    if (!map3dRef.current || !isReady) return;

    const map3d = map3dRef.current;
    const currentMarkerIds = new Set(markers.map((m) => m.id));

    // Remove markers that no longer exist
    marker3dRefs.current.forEach((marker3d, id) => {
      if (!currentMarkerIds.has(id)) {
        try {
          map3d.removeChild(marker3d);
        } catch {
          // Ignore removal errors
        }
        marker3dRefs.current.delete(id);
      }
    });

    // Add or update markers using Marker3DInteractiveElement class
    const createMarkers = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { Marker3DInteractiveElement, PinElement } = await (google.maps as any).importLibrary('maps3d') as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const markerLib = await google.maps.importLibrary('marker') as any;
      const PinElementMarker = markerLib.PinElement;

      markers.forEach((marker) => {
        if (!marker3dRefs.current.has(marker.id)) {
          // Get marker color based on type
          const color = config.ui.markerColors[marker.type] || '#6366f1';

          // Create interactive 3D marker using the class constructor
          const marker3d = new Marker3DInteractiveElement({
            position: {
              lat: marker.position.lat,
              lng: marker.position.lng,
              altitude: 50,
            },
            altitudeMode: 'RELATIVE_TO_GROUND',
            extruded: true,
          });

          // Create a custom pin element
          const pin = new PinElementMarker({
            background: color,
            borderColor: '#ffffff',
            glyphColor: '#ffffff',
            glyph: marker.title.charAt(0).toUpperCase(),
            scale: 1.2,
          });

          marker3d.append(pin);

          // Add click handler
          marker3d.addEventListener('gmp-click', (e: Event) => {
            e.stopPropagation();
            console.log('[Map3D] Marker clicked:', marker.title);
            selectMarker(marker.id);
            setSelectedMarker(marker);
            if (onMarkerClick) {
              onMarkerClick(marker);
            }
          });

          map3d.appendChild(marker3d);
          marker3dRefs.current.set(marker.id, marker3d);
        }
      });
    };

    createMarkers().catch(console.error);
  }, [markers, isReady, selectMarker, onMarkerClick]);

  // Get place details for selected marker
  const selectedPlace = selectedMarker?.placeId
    ? places.find((p) => p.placeId === selectedMarker.placeId)
    : undefined;

  // Handle add to trip
  const handleAddToTrip = useCallback(() => {
    if (selectedPlace) {
      setPendingIntent({
        type: 'addToTrip',
        place: selectedPlace,
        timestamp: Date.now(),
      });
      setSelectedMarker(null);
    }
  }, [selectedPlace, setPendingIntent]);

  // Handle get directions
  const handleGetDirections = useCallback(() => {
    if (selectedMarker) {
      const destination = `${selectedMarker.position.lat},${selectedMarker.position.lng}`;
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank');
    }
  }, [selectedMarker]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-6">
          <p className="text-gray-600 mb-2">{error}</p>
          <button
            onClick={() => useMapStore.getState().setViewMode('map2d')}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Switch to 2D Map
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {/* Loading overlay - shown while initializing */}
      {!isReady && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-600">Loading 3D view...</span>
          </div>
        </div>
      )}
      {/* Map container - above loading when ready */}
      <div ref={containerRef} className={`w-full h-full ${isReady ? 'z-20' : ''}`} />

      {/* Info Panel for selected marker */}
      {selectedMarker && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 min-w-[280px] max-w-[350px]">
          {/* Close button */}
          <button
            onClick={() => setSelectedMarker(null)}
            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: config.ui.markerColors[selectedMarker.type] }}
            >
              <span className="text-white font-bold">{selectedMarker.title.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0 pr-6">
              <h3 className="font-semibold text-gray-900 text-sm leading-tight">{selectedMarker.title}</h3>
              <p className="text-xs text-gray-500 capitalize">{selectedMarker.type}</p>
            </div>
          </div>

          {/* Place details */}
          {selectedPlace && (
            <div className="space-y-2 border-t border-gray-100 pt-3 mb-3">
              {selectedPlace.rating && (
                <div className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  <span className="text-sm font-medium text-gray-800">{selectedPlace.rating}</span>
                  {selectedPlace.userRatingsTotal && (
                    <span className="text-xs text-gray-500">({selectedPlace.userRatingsTotal.toLocaleString()})</span>
                  )}
                </div>
              )}
              {selectedPlace.address && (
                <p className="text-xs text-gray-600 line-clamp-2">{selectedPlace.address}</p>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleGetDirections}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
              </svg>
              Directions
            </button>
            {selectedPlace && (
              <button
                onClick={handleAddToTrip}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-white rounded-lg transition-colors"
                style={{ backgroundColor: '#6366f1' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add to Trip
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
