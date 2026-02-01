'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useMapStore } from '@/stores/mapStore';
import { ArrowLeft } from 'lucide-react';

interface StreetViewProps {
  onClose?: () => void;
}

export function StreetView({ onClose }: StreetViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const streetViewRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const { camera, setCamera, setViewMode } = useMapStore();

  useEffect(() => {
    if (!containerRef.current) return;

    const streetViewService = new google.maps.StreetViewService();

    // Check if Street View is available at this location
    streetViewService.getPanorama(
      {
        location: camera.center,
        radius: 100,
        source: google.maps.StreetViewSource.OUTDOOR,
      },
      (data, status) => {
        setIsLoading(false);

        if (status === google.maps.StreetViewStatus.OK && data?.location?.latLng) {
          setIsAvailable(true);

          const panorama = new google.maps.StreetViewPanorama(
            containerRef.current!,
            {
              position: data.location.latLng,
              pov: {
                heading: camera.heading,
                pitch: 0,
              },
              zoom: 1,
              addressControl: true,
              addressControlOptions: {
                position: google.maps.ControlPosition.BOTTOM_CENTER,
              },
              enableCloseButton: false,
              fullscreenControl: false,
              motionTracking: false,
              motionTrackingControl: false,
              showRoadLabels: true,
              zoomControl: true,
              zoomControlOptions: {
                position: google.maps.ControlPosition.RIGHT_CENTER,
              },
            }
          );

          streetViewRef.current = panorama;

          // Listen for position changes
          panorama.addListener('position_changed', () => {
            const pos = panorama.getPosition();
            if (pos) {
              setCamera({
                center: { lat: pos.lat(), lng: pos.lng() },
              });
            }
          });

          // Listen for heading changes
          panorama.addListener('pov_changed', () => {
            const pov = panorama.getPov();
            setCamera({ heading: pov.heading });
          });
        } else {
          setIsAvailable(false);
        }
      }
    );

    return () => {
      if (streetViewRef.current) {
        google.maps.event.clearInstanceListeners(streetViewRef.current);
      }
    };
  }, [camera.center.lat, camera.center.lng]);

  const handleExit = useCallback(() => {
    setViewMode('map2d');
    onClose?.();
  }, [setViewMode, onClose]);

  if (!isAvailable && !isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="text-center p-6">
          <p className="text-white mb-4">
            Street View is not available at this location.
          </p>
          <button
            onClick={handleExit}
            className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Return to Map
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Exit button */}
      <button
        onClick={handleExit}
        className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-lg text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="font-medium">Exit Street View</span>
      </button>

      {/* Street View container */}
      <div ref={containerRef} className="w-full h-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="flex items-center gap-2 text-white">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Loading Street View...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
