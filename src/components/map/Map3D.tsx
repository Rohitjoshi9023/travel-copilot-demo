'use client';

import { useEffect, useRef, useState } from 'react';
import { useMapStore } from '@/stores/mapStore';
import type { Marker } from '@/types';

interface Map3DProps {
  onMarkerClick?: (marker: Marker) => void;
}

// Note: onMarkerClick will be used when 3D markers are implemented
export function Map3D(_props: Map3DProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const map3dRef = useRef<HTMLElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { camera, setCamera } = useMapStore();

  // Store initial camera values for initialization
  const initialCameraRef = useRef(camera);

  // Initialize 3D map
  useEffect(() => {
    const mapContainer = mapRef.current;
    if (!mapContainer) return;

    const initMap3D = async () => {
      try {
        // Check if google maps is available
        if (typeof window === 'undefined' || !window.google?.maps) {
          setError('Google Maps not loaded. Please check your API key.');
          return;
        }

        const initialCamera = initialCameraRef.current;

        // Create 3D map element
        const map3d = document.createElement('gmp-map-3d');
        map3d.setAttribute('center', `${initialCamera.center.lat},${initialCamera.center.lng}`);
        map3d.setAttribute('tilt', String(initialCamera.tilt || 60));
        map3d.setAttribute('heading', String(initialCamera.heading || 0));
        map3d.setAttribute('range', String(Math.pow(2, 21 - initialCamera.zoom) * 50));
        map3d.style.width = '100%';
        map3d.style.height = '100%';

        // Clear and append
        mapContainer.innerHTML = '';
        mapContainer.appendChild(map3d);
        map3dRef.current = map3d;

        // Listen for camera changes
        map3d.addEventListener('gmp-centerchange', () => {
          const centerAttr = map3d.getAttribute('center');
          if (centerAttr) {
            const [lat, lng] = centerAttr.split(',').map(Number);
            if (!isNaN(lat) && !isNaN(lng)) {
              setCamera({
                center: { lat, lng },
              });
            }
          }
        });

        setIsLoaded(true);
      } catch (err) {
        console.error('Failed to initialize 3D map:', err);
        setError('Failed to load 3D map. Try switching to 2D view.');
      }
    };

    initMap3D();

    return () => {
      mapContainer.innerHTML = '';
      map3dRef.current = null;
    };
  }, [setCamera]);

  // Update camera when store changes
  useEffect(() => {
    if (!map3dRef.current || !isLoaded) return;

    const map3d = map3dRef.current;
    map3d.setAttribute('center', `${camera.center.lat},${camera.center.lng}`);
    map3d.setAttribute('heading', String(camera.heading));
    map3d.setAttribute('tilt', String(camera.tilt || 60));
  }, [camera, isLoaded]);

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
    <div ref={mapRef} className="w-full h-full relative">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-600">Loading 3D view...</span>
          </div>
        </div>
      )}
    </div>
  );
}
