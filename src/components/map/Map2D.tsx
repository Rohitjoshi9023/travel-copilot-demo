'use client';

import { useCallback, useEffect } from 'react';
import { Map, useMap } from '@vis.gl/react-google-maps';
import { useMapStore } from '@/stores/mapStore';
import { CustomMarker } from './CustomMarker';
import type { Marker } from '@/types';


interface Map2DProps {
  isDarkMode?: boolean;
  onMarkerClick?: (marker: Marker) => void;
}

export function Map2D({ isDarkMode = false, onMarkerClick }: Map2DProps) {
  const map = useMap();
  const { camera, markers, selectedMarkerId, setCamera, selectMarker } =
    useMapStore();

  // Sync camera state with map
  useEffect(() => {
    if (!map) return;

    const handleCameraChange = () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      const heading = map.getHeading() ?? 0;
      const tilt = map.getTilt() ?? 0;

      if (center && zoom !== undefined) {
        setCamera({
          center: { lat: center.lat(), lng: center.lng() },
          zoom,
          heading,
          tilt,
        });
      }
    };

    const listener = map.addListener('idle', handleCameraChange);
    return () => {
      listener.remove();
    };
  }, [map, setCamera]);

  // Apply camera changes from store
  useEffect(() => {
    if (!map) return;

    const mapCenter = map.getCenter();
    const mapZoom = map.getZoom();

    if (mapCenter && mapZoom !== undefined) {
      const centerDiff =
        Math.abs(mapCenter.lat() - camera.center.lat) +
        Math.abs(mapCenter.lng() - camera.center.lng);
      const zoomDiff = Math.abs(mapZoom - camera.zoom);

      if (centerDiff > 0.0001 || zoomDiff > 0.5) {
        map.panTo(camera.center);
        map.setZoom(camera.zoom);
      }
    }
  }, [map, camera.center, camera.zoom]);

  const handleMarkerClick = useCallback(
    (markerId: string) => {
      selectMarker(markerId);
      const marker = markers.find((m) => m.id === markerId);
      if (marker && onMarkerClick) {
        onMarkerClick(marker);
      }
    },
    [markers, selectMarker, onMarkerClick]
  );

  const handleInfoWindowClose = useCallback(() => {
    selectMarker(null);
  }, [selectMarker]);

  return (
    <Map
      defaultCenter={camera.center}
      defaultZoom={camera.zoom}
      mapId={isDarkMode ? 'dark-map' : 'light-map'}
      disableDefaultUI={true}
      gestureHandling="greedy"
      clickableIcons={false}
      className="w-full h-full"
    >
      {markers.map((marker) => (
        <CustomMarker
          key={marker.id}
          marker={marker}
          onClick={handleMarkerClick}
          onInfoWindowClose={handleInfoWindowClose}
          showInfoWindow={marker.id === selectedMarkerId}
        />
      ))}
    </Map>
  );
}
