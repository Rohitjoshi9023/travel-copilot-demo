'use client';

import { useAIContext } from '@yourgpt/copilot-sdk/react';
import { useMapStore } from '@/stores/mapStore';
import { usePlacesStore } from '@/stores/placesStore';
import { useTripsStore } from '@/stores/tripsStore';

/**
 * Provides AI context about what the user is currently viewing on the map.
 * This helps the AI understand the user's current context and provide relevant suggestions.
 */
export function MapAIContext() {
  const camera = useMapStore((s) => s.camera);
  const viewMode = useMapStore((s) => s.viewMode);
  const markers = useMapStore((s) => s.markers);
  const selectedMarkerId = useMapStore((s) => s.selectedMarkerId);

  const places = usePlacesStore((s) => s.places);
  const selectedPlace = usePlacesStore((s) => s.selectedPlace);

  const activeTrip = useTripsStore((s) => s.getActiveTrip());

  // Get the selected marker details
  const selectedMarker = selectedMarkerId
    ? markers.find((m) => m.id === selectedMarkerId)
    : null;

  // Get place details for selected marker
  const selectedMarkerPlace = selectedMarker?.placeId
    ? places.find((p) => p.placeId === selectedMarker.placeId)
    : null;

  // Current place being viewed
  const currentPlace = selectedMarkerPlace || selectedPlace;

  // Build visible places list
  const visiblePlaces = markers.slice(0, 10).map((m) => m.title).join(', ');

  // Build trip summary
  const tripSummary = activeTrip
    ? `Trip "${activeTrip.name}" to ${activeTrip.destination || 'unspecified destination'}, ${activeTrip.daysCount} days, ${activeTrip.items.length} places added`
    : 'No active trip';

  // Map view context
  useAIContext({
    key: 'map-location',
    data: {
      currentLocation: `Lat: ${camera.center.lat.toFixed(4)}, Lng: ${camera.center.lng.toFixed(4)}`,
      zoomLevel: camera.zoom,
      viewMode: viewMode === 'map2d' ? '2D Map' : viewMode === 'map3d' ? '3D Map' : 'Street View',
      visiblePlacesCount: markers.length,
      visiblePlaces: visiblePlaces || 'None',
    },
    description: 'The current map location and visible places the user is viewing',
  });

  // Selected place context
  useAIContext({
    key: 'selected-place',
    data: currentPlace
      ? {
          name: currentPlace.name,
          type: currentPlace.type,
          address: currentPlace.address || 'Unknown',
          rating: currentPlace.rating || 'No rating',
          priceLevel: currentPlace.priceLevel ? '$'.repeat(currentPlace.priceLevel) : 'Unknown',
          isOpen: currentPlace.openingHours?.openNow ? 'Yes' : 'Unknown',
        }
      : { status: 'No place selected' },
    description: 'The place the user has currently selected or clicked on the map',
  });

  // Active trip context
  useAIContext({
    key: 'current-trip',
    data: activeTrip
      ? {
          tripName: activeTrip.name,
          destination: activeTrip.destination || 'Not specified',
          status: activeTrip.status,
          numberOfDays: activeTrip.daysCount,
          totalPlacesAdded: activeTrip.items.length,
          startDate: activeTrip.startDate || 'Not set',
          endDate: activeTrip.endDate || 'Not set',
          placesPerDay: activeTrip.items.reduce((acc, item) => {
            acc[`Day ${item.day}`] = acc[`Day ${item.day}`] || [];
            acc[`Day ${item.day}`].push(item.place.name);
            return acc;
          }, {} as Record<string, string[]>),
        }
      : { status: 'No active trip - user has not created or selected a trip yet' },
    description: 'The trip the user is currently planning with all its details',
  });

  return null;
}
