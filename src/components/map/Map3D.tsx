'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useApiIsLoaded } from '@vis.gl/react-google-maps';
import { useMapStore } from '@/stores/mapStore';
import type { Marker } from '@/types';

interface Map3DProps {
  onMarkerClick?: (marker: Marker) => void;
}

// Note: onMarkerClick will be used when 3D markers are implemented
export function Map3D(_props: Map3DProps) {
  const [mapContainer, setMapContainer] = useState<HTMLDivElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const map3dRef = useRef<any>(null);
  const { camera } = useMapStore();

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
    </div>
  );
}
