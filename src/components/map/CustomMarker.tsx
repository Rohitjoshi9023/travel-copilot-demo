'use client';

import { useCallback, useState } from 'react';
import { AdvancedMarker, InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import { motion } from 'framer-motion';
import {
  Hotel,
  Utensils,
  Landmark,
  ShoppingBag,
  Bus,
  MapPin,
  Star,
  Phone,
  Globe,
  Clock,
  Navigation,
  Plus,
  Check,
} from 'lucide-react';
import { config } from '@/lib/config';
import { usePlacesStore } from '@/stores/placesStore';
import type { Marker, PlaceType, Place } from '@/types';

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

// Price level display
function PriceLevel({ level }: { level?: number }) {
  if (!level) return null;
  return (
    <span className="text-gray-600 text-xs">
      {'$'.repeat(level)}
      <span className="text-gray-300">{'$'.repeat(4 - level)}</span>
    </span>
  );
}

// Info Window Content Component
function InfoWindowContent({
  marker,
  place,
  onAddToItinerary,
  onGetDirections,
}: {
  marker: Marker;
  place?: Place;
  onAddToItinerary?: () => void;
  onGetDirections?: () => void;
}) {
  const [isAdded, setIsAdded] = useState(false);
  const color = config.ui.markerColors[marker.type];

  const handleAddClick = () => {
    onAddToItinerary?.();
    setIsAdded(true);
    // Reset after 2 seconds
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="min-w-[250px] max-w-[300px]">
      {/* Header with icon and title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            backgroundColor: color,
          }}
        >
          {(() => {
            const Icon = iconMap[marker.type];
            return <Icon className="w-5 h-5 text-white" />;
          })()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight">
            {marker.title}
          </h3>
          <p className="text-xs text-gray-500 capitalize">{marker.type}</p>
        </div>
      </div>

      {/* Place details if available */}
      {place && (
        <div className="space-y-2 border-t border-gray-100 pt-2 mt-2">
          {/* Rating and price */}
          <div className="flex items-center gap-3">
            {place.rating && (
              <div className="flex items-center gap-1">
                <Star style={{ width: 14, height: 14, color: '#fbbf24', fill: '#fbbf24', stroke: '#fbbf24' }} />
                <span className="text-sm font-medium text-gray-800">{place.rating}</span>
                {place.userRatingsTotal && (
                  <span className="text-xs text-gray-500">
                    ({place.userRatingsTotal.toLocaleString()})
                  </span>
                )}
              </div>
            )}
            <PriceLevel level={place.priceLevel} />
          </div>

          {/* Address */}
          {place.address && (
            <p className="text-xs text-gray-600 line-clamp-2">
              {place.address}
            </p>
          )}

          {/* Open status */}
          {place.openingHours && (
            <div className="flex items-center gap-1.5">
              <Clock style={{ width: 14, height: 14, color: '#9ca3af', stroke: '#9ca3af' }} />
              <span className={`text-xs font-medium ${
                place.openingHours.openNow ? 'text-emerald-600' : 'text-red-500'
              }`}>
                {place.openingHours.openNow ? 'Open now' : 'Closed'}
              </span>
            </div>
          )}

          {/* Contact info */}
          <div className="flex items-center gap-3">
            {place.phone && (
              <a
                href={`tel:${place.phone}`}
                className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
              >
                <Phone style={{ width: 12, height: 12, stroke: 'currentColor' }} />
                <span>Call</span>
              </a>
            )}
            {place.website && (
              <a
                href={place.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
              >
                <Globe style={{ width: 12, height: 12, stroke: 'currentColor' }} />
                <span>Website</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
        <button
          onClick={onGetDirections}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '8px 12px',
            fontSize: '12px',
            fontWeight: 500,
            color: '#374151',
            backgroundColor: '#f3f4f6',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          <Navigation style={{ width: 14, height: 14, color: '#374151', stroke: '#374151' }} />
          Directions
        </button>
        <button
          onClick={handleAddClick}
          disabled={isAdded}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '8px 12px',
            fontSize: '12px',
            fontWeight: 500,
            color: 'white',
            backgroundColor: isAdded ? '#10b981' : '#6366f1',
            border: 'none',
            borderRadius: '8px',
            cursor: isAdded ? 'default' : 'pointer',
            transition: 'background-color 0.2s',
          }}
        >
          {isAdded ? (
            <>
              <Check style={{ width: 14, height: 14, color: 'white', stroke: 'white' }} />
              Added!
            </>
          ) : (
            <>
              <Plus style={{ width: 14, height: 14, color: 'white', stroke: 'white' }} />
              Add to Trip
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export function CustomMarker({
  marker,
  onClick,
  onInfoWindowClose,
  showInfoWindow = false,
}: CustomMarkerProps) {
  const [markerRef, advancedMarker] = useAdvancedMarkerRef();
  const places = usePlacesStore((s) => s.places);
  const addToItinerary = usePlacesStore((s) => s.addToItinerary);

  // Find place details from places store using placeId
  const place = marker.placeId
    ? places.find((p) => p.placeId === marker.placeId)
    : undefined;

  const handleClick = useCallback(() => {
    onClick?.(marker.id);
  }, [marker.id, onClick]);

  const handleAddToItinerary = useCallback(() => {
    if (place) {
      addToItinerary(place, 1);
    }
  }, [place, addToItinerary]);

  const handleGetDirections = useCallback(() => {
    // Open Google Maps directions in a new tab
    const destination = `${marker.position.lat},${marker.position.lng}`;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank');
  }, [marker.position]);

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
        >
          <InfoWindowContent
            marker={marker}
            place={place}
            onAddToItinerary={handleAddToItinerary}
            onGetDirections={handleGetDirections}
          />
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
