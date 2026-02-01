'use client';

import { useCallback } from 'react';
import { AdvancedMarker, InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import { motion } from 'framer-motion';
import {
  Hotel,
  Utensils,
  Landmark,
  ShoppingBag,
  Bus,
  MapPin,
} from 'lucide-react';
import { config } from '@/lib/config';
import type { Marker, PlaceType } from '@/types';

interface CustomMarkerProps {
  marker: Marker;
  onClick?: (id: string) => void;
  onInfoWindowClose?: () => void;
  showInfoWindow?: boolean;
}

const iconMap: Record<PlaceType, React.ComponentType<{ className?: string }>> = {
  hotel: Hotel,
  restaurant: Utensils,
  attraction: Landmark,
  shopping: ShoppingBag,
  transport: Bus,
  other: MapPin,
};

export function CustomMarker({
  marker,
  onClick,
  onInfoWindowClose,
  showInfoWindow = false,
}: CustomMarkerProps) {
  const [markerRef, advancedMarker] = useAdvancedMarkerRef();

  const handleClick = useCallback(() => {
    onClick?.(marker.id);
  }, [marker.id, onClick]);

  const Icon = iconMap[marker.type];
  const color = config.ui.markerColors[marker.type];

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={marker.position}
        onClick={handleClick}
        title={marker.title}
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: marker.selected ? 1.2 : 1,
            opacity: 1,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="relative"
        >
          {/* Marker pin */}
          <div
            className="flex items-center justify-center w-10 h-10 rounded-full shadow-lg cursor-pointer transition-transform hover:scale-110"
            style={{ backgroundColor: color }}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
          {/* Pin tail */}
          <div
            className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0"
            style={{
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: `10px solid ${color}`,
            }}
          />
          {/* Selection ring */}
          {marker.selected && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.3, opacity: 1 }}
              className="absolute inset-0 rounded-full border-2 border-white shadow-md"
              style={{ backgroundColor: `${color}20` }}
            />
          )}
        </motion.div>
      </AdvancedMarker>

      {showInfoWindow && advancedMarker && (
        <InfoWindow
          anchor={advancedMarker}
          onCloseClick={onInfoWindowClose}
          headerContent={
            <h3 className="font-semibold text-gray-900">{marker.title}</h3>
          }
        >
          <div className="p-2 min-w-[200px]">
            <p className="text-sm text-gray-600 capitalize">{marker.type}</p>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

// Simple marker for smaller screens or performance mode
export function SimpleMarker({
  marker,
  onClick,
}: {
  marker: Marker;
  onClick?: (id: string) => void;
}) {
  const handleClick = useCallback(() => {
    onClick?.(marker.id);
  }, [marker.id, onClick]);

  const color = config.ui.markerColors[marker.type];

  return (
    <AdvancedMarker
      position={marker.position}
      onClick={handleClick}
      title={marker.title}
    >
      <div
        className="w-4 h-4 rounded-full border-2 border-white shadow-md"
        style={{ backgroundColor: color }}
      />
    </AdvancedMarker>
  );
}
