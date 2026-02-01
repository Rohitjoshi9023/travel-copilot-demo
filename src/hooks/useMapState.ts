'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useMapStore } from '@/stores/mapStore';
import type { LatLng, ViewMode } from '@/types';

export function useMapState() {
  const mapRef = useRef<google.maps.Map | null>(null);

  const {
    viewMode,
    camera,
    markers,
    selectedMarkerId,
    route,
    isLoading,
    error,
    setViewMode,
    setCamera,
    flyTo,
    addMarker,
    addMarkers,
    removeMarker,
    clearMarkers,
    selectMarker,
    setRoute,
    setLoading,
    setError,
    fitBounds,
  } = useMapStore();

  // Sync map instance with store state
  const setMapInstance = useCallback((map: google.maps.Map | null) => {
    mapRef.current = map;
  }, []);

  // Apply camera changes to the map
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    const { center, zoom, heading, tilt } = camera;

    // Check if map position differs significantly from store
    const mapCenter = map.getCenter();
    const mapZoom = map.getZoom();

    if (mapCenter && mapZoom !== undefined) {
      const centerDiff =
        Math.abs(mapCenter.lat() - center.lat) +
        Math.abs(mapCenter.lng() - center.lng);
      const zoomDiff = Math.abs(mapZoom - zoom);

      // Only update if there's a significant difference
      if (centerDiff > 0.0001 || zoomDiff > 0.5) {
        map.panTo(center);
        map.setZoom(zoom);
      }
    }

    // Apply 3D settings if in 3D mode
    if (viewMode === 'map3d') {
      map.setHeading(heading);
      map.setTilt(tilt);
    }
  }, [camera, viewMode]);

  // Helper to animate to a location
  const animateTo = useCallback(
    (location: LatLng, zoom?: number) => {
      flyTo(location, zoom);
    },
    [flyTo]
  );

  // Helper to get current map bounds
  const getBounds = useCallback(() => {
    if (!mapRef.current) return null;

    const bounds = mapRef.current.getBounds();
    if (!bounds) return null;

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    return {
      northeast: { lat: ne.lat(), lng: ne.lng() },
      southwest: { lat: sw.lat(), lng: sw.lng() },
    };
  }, []);

  // Helper to get current center
  const getCenter = useCallback(() => {
    if (!mapRef.current) return null;

    const center = mapRef.current.getCenter();
    if (!center) return null;

    return { lat: center.lat(), lng: center.lng() };
  }, []);

  return {
    // State
    mapRef,
    viewMode,
    camera,
    markers,
    selectedMarkerId,
    route,
    isLoading,
    error,

    // Map instance
    setMapInstance,

    // Actions
    setViewMode,
    setCamera,
    flyTo,
    animateTo,
    addMarker,
    addMarkers,
    removeMarker,
    clearMarkers,
    selectMarker,
    setRoute,
    setLoading,
    setError,
    fitBounds,

    // Helpers
    getBounds,
    getCenter,
  };
}

// Specialized hook for view mode transitions
export function useViewModeTransition() {
  const { viewMode, setViewMode, camera, setCamera } = useMapStore();

  const transitionTo = useCallback(
    (newMode: ViewMode) => {
      // Store current camera state before transition
      const previousMode = viewMode;

      // Adjust camera settings for the new mode
      if (newMode === 'map3d') {
        setCamera({ tilt: 60, heading: 0 });
      } else if (newMode === 'map2d') {
        setCamera({ tilt: 0, heading: 0 });
      }

      setViewMode(newMode);
    },
    [viewMode, setViewMode, setCamera]
  );

  return {
    currentMode: viewMode,
    transitionTo,
    is2D: viewMode === 'map2d',
    is3D: viewMode === 'map3d',
    isStreetView: viewMode === 'streetview',
  };
}

// Hook for marker interactions
export function useMarkerInteractions() {
  const {
    markers,
    selectedMarkerId,
    selectMarker,
    addMarker,
    removeMarker,
    clearMarkers,
    flyTo,
  } = useMapStore();

  const handleMarkerClick = useCallback(
    (markerId: string) => {
      const marker = markers.find((m) => m.id === markerId);
      if (marker) {
        selectMarker(markerId);
        flyTo(marker.position, 16);
      }
    },
    [markers, selectMarker, flyTo]
  );

  const handleMarkerClose = useCallback(() => {
    selectMarker(null);
  }, [selectMarker]);

  const selectedMarker = markers.find((m) => m.id === selectedMarkerId) ?? null;

  return {
    markers,
    selectedMarker,
    handleMarkerClick,
    handleMarkerClose,
    addMarker,
    removeMarker,
    clearMarkers,
  };
}
