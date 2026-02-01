'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Star,
  MapPin,
  Navigation,
  Bookmark,
  Clock,
  Phone,
  Globe,
  ChevronRight,
} from 'lucide-react';
import { usePlaceCard, formatPriceLevel, formatRating, formatPlaceType } from '@/hooks/usePlaces';
import { config } from '@/lib/config';
import type { Place } from '@/types';

interface PlaceCardProps {
  place: Place;
  variant?: 'compact' | 'full';
  showActions?: boolean;
}

export function PlaceCard({
  place,
  variant = 'compact',
  showActions = true,
}: PlaceCardProps) {
  const { handleViewOnMap, handleGetDirections, handleSave } = usePlaceCard(place);

  const color = config.ui.markerColors[place.type];
  const priceLevel = formatPriceLevel(place.priceLevel);
  const rating = formatRating(place.rating);
  const typeLabel = formatPlaceType(place.type);

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
      >
        {/* Image */}
        {place.photos && place.photos.length > 0 && (
          <div className="relative h-32 bg-gray-100">
            <Image
              src={place.photos[0].url}
              alt={place.name}
              fill
              className="object-cover"
            />
            <div
              className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium text-white"
              style={{ backgroundColor: color }}
            >
              {typeLabel}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-3">
          <h4 className="font-semibold text-gray-900 line-clamp-1">
            {place.name}
          </h4>

          <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
            {place.rating && (
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                {rating}
              </span>
            )}
            {priceLevel && <span>{priceLevel}</span>}
            {place.openingHours && (
              <span
                className={
                  place.openingHours.openNow ? 'text-green-600' : 'text-red-600'
                }
              >
                {place.openingHours.openNow ? 'Open' : 'Closed'}
              </span>
            )}
          </div>

          <p className="mt-1 text-xs text-gray-500 line-clamp-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            {place.address}
          </p>

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2 mt-3">
              <ActionButton
                icon={MapPin}
                label="View"
                onClick={handleViewOnMap}
              />
              <ActionButton
                icon={Navigation}
                label="Directions"
                onClick={handleGetDirections}
              />
              <ActionButton
                icon={Bookmark}
                label="Save"
                onClick={handleSave}
              />
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Full variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden"
    >
      {/* Image gallery */}
      {place.photos && place.photos.length > 0 && (
        <div className="relative h-48 bg-gray-100">
          <Image
            src={place.photos[0].url}
            alt={place.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <div
              className="inline-flex px-2 py-1 rounded text-xs font-medium text-white"
              style={{ backgroundColor: color }}
            >
              {typeLabel}
            </div>
            <h3 className="text-white font-bold text-lg mt-1">{place.name}</h3>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Rating and price */}
        <div className="flex items-center gap-3 text-sm">
          {place.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="font-medium">{rating}</span>
              {place.userRatingsTotal && (
                <span className="text-gray-500">
                  ({place.userRatingsTotal.toLocaleString()})
                </span>
              )}
            </div>
          )}
          {priceLevel && (
            <span className="text-gray-600">{priceLevel}</span>
          )}
        </div>

        {/* Address */}
        <p className="mt-2 text-sm text-gray-600 flex items-start gap-2">
          <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {place.address}
        </p>

        {/* Opening hours */}
        {place.openingHours && (
          <p className="mt-2 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span
              className={
                place.openingHours.openNow ? 'text-green-600' : 'text-red-600'
              }
            >
              {place.openingHours.openNow ? 'Open now' : 'Closed'}
            </span>
          </p>
        )}

        {/* Contact info */}
        <div className="mt-3 space-y-1">
          {place.phone && (
            <a
              href={`tel:${place.phone}`}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600"
            >
              <Phone className="w-4 h-4" />
              {place.phone}
            </a>
          )}
          {place.website && (
            <a
              href={place.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600"
            >
              <Globe className="w-4 h-4" />
              Visit website
              <ChevronRight className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={handleViewOnMap}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              <MapPin className="w-4 h-4" />
              View on Map
            </button>
            <button
              onClick={handleGetDirections}
              className="px-3 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Navigation className="w-4 h-4" />
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

// Place card carousel for multiple results
export function PlaceCardCarousel({ places }: { places: Place[] }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-thin">
      {places.map((place) => (
        <div key={place.id} className="flex-shrink-0 w-64">
          <PlaceCard place={place} variant="compact" />
        </div>
      ))}
    </div>
  );
}
