'use client';

import { useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Clock, MapPin, Trash2, Edit2, Star } from 'lucide-react';
import { useMapStore } from '@/stores/mapStore';
import { usePlacesStore } from '@/stores/placesStore';
import type { TripItem, TripItemCategory } from '@/types';

const categoryConfig: Record<TripItemCategory, { label: string; color: string; bgColor: string }> = {
  accommodation: { label: 'Stay', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  activity: { label: 'Activity', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  dining: { label: 'Dining', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  transport: { label: 'Transport', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  sightseeing: { label: 'Sightseeing', color: 'text-green-600', bgColor: 'bg-green-100' },
  other: { label: 'Other', color: 'text-gray-600', bgColor: 'bg-gray-100' },
};

interface TripItemCardProps {
  item: TripItem;
  onEdit?: (item: TripItem) => void;
  onDelete?: (itemId: string) => void;
  isDragging?: boolean;
  isDragOverlay?: boolean;
}

export function TripItemCard({ item, onEdit, onDelete, isDragging, isDragOverlay }: TripItemCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: item.id, disabled: isDragOverlay });

  const flyTo = useMapStore((s) => s.flyTo);
  const addMarker = useMapStore((s) => s.addMarker);
  const selectMarker = useMapStore((s) => s.selectMarker);
  const markers = useMapStore((s) => s.markers);
  const setPlaces = usePlacesStore((s) => s.setPlaces);
  const places = usePlacesStore((s) => s.places);

  const style = isDragOverlay
    ? undefined
    : {
        transform: CSS.Transform.toString(transform),
        transition,
      };

  const isCurrentlyDragging = isDragging || isSortableDragging;

  const categoryInfo = item.category ? categoryConfig[item.category] : null;
  const photoUrl = item.place.photos?.[0]?.url;

  // Handle click to show place on map
  const handleShowOnMap = useCallback(() => {
    if (isDragOverlay) return;

    const place = item.place;

    // Add place to places store if not already there
    if (!places.find((p) => p.placeId === place.placeId)) {
      setPlaces([...places, place]);
    }

    // Check if marker already exists for this place
    const existingMarker = markers.find((m) => m.placeId === place.placeId);

    if (!existingMarker) {
      // Add marker for this place and select it to show InfoWindow
      const markerId = addMarker({
        position: place.location,
        title: place.name,
        type: place.type,
        placeId: place.placeId,
      });
      selectMarker(markerId);
    } else {
      // Select existing marker to show InfoWindow
      selectMarker(existingMarker.id);
    }

    // Pan to the location (keep current zoom level)
    flyTo(place.location);
  }, [item.place, isDragOverlay, markers, places, addMarker, selectMarker, flyTo, setPlaces]);

  const formatTime = (time?: string) => {
    if (!time) return null;
    try {
      const [hours, minutes] = time.split(':');
      const h = parseInt(hours, 10);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hour12 = h % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch {
      return time;
    }
  };

  const timeDisplay = item.startTime
    ? item.endTime
      ? `${formatTime(item.startTime)} - ${formatTime(item.endTime)}`
      : formatTime(item.startTime)
    : null;

  return (
    <div
      ref={isDragOverlay ? undefined : setNodeRef}
      style={style}
      className={`
        group relative bg-white border border-gray-200 rounded-xl overflow-hidden
        hover:border-indigo-200 hover:shadow-sm transition-all
        ${isCurrentlyDragging && !isDragOverlay ? 'opacity-50' : ''}
        ${isDragOverlay ? 'shadow-xl border-indigo-300 cursor-grabbing' : ''}
      `}
    >
      <div className="flex">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="flex-shrink-0 w-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-grab active:cursor-grabbing border-r border-gray-100"
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </button>

        {/* Thumbnail */}
        {photoUrl && (
          <div
            className="flex-shrink-0 w-16 h-full cursor-pointer"
            onClick={handleShowOnMap}
          >
            <img
              src={photoUrl}
              alt={item.place.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div
          className="flex-1 p-3 min-w-0 cursor-pointer"
          onClick={handleShowOnMap}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {item.place.name}
                </h4>
                {item.place.rating && (
                  <div className="flex items-center gap-0.5 text-xs text-amber-500">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{item.place.rating}</span>
                  </div>
                )}
              </div>

              {/* Address */}
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                <span className="text-xs text-gray-500 truncate">{item.place.address}</span>
              </div>

              {/* Time and Category */}
              <div className="flex items-center gap-2 mt-1.5">
                {timeDisplay && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{timeDisplay}</span>
                  </div>
                )}
                {categoryInfo && (
                  <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${categoryInfo.bgColor} ${categoryInfo.color}`}>
                    {categoryInfo.label}
                  </span>
                )}
              </div>

              {/* Notes */}
              {item.notes && (
                <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{item.notes}</p>
              )}
            </div>

            {/* Actions */}
            {!isDragOverlay && onEdit && onDelete && (
              <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEdit(item)}
                  className="p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Edit item"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove from trip"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
