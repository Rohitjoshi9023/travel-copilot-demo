'use client';

import { useCallback, useState } from 'react';
import { usePlacesStore } from '@/stores/placesStore';
import { useMapStore } from '@/stores/mapStore';
import {
  searchPlaces as searchPlacesService,
  searchNearby as searchNearbyService,
  getPlaceDetails as getPlaceDetailsService,
  calculateBounds,
} from '@/services/places';
import type { Place, LatLng, PlaceType } from '@/types';

export function usePlaces() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    places,
    selectedPlace,
    searchQuery,
    isSearching,
    itinerary,
    setPlaces,
    addPlace,
    selectPlace,
    setSearchQuery,
    setSearching,
    setItinerary,
    addToItinerary,
    removeFromItinerary,
    reorderItinerary,
  } = usePlacesStore();

  const {
    addMarker,
    addMarkers,
    clearMarkers,
    selectMarker,
    fitBounds,
    flyTo,
  } = useMapStore();

  // Search places by query
  const searchPlaces = useCallback(
    async (query: string, location?: LatLng, radius?: number) => {
      setIsLoading(true);
      setError(null);
      setSearchQuery(query);
      setSearching(true);

      try {
        const { places: results } = await searchPlacesService(
          query,
          location,
          radius
        );

        setPlaces(results);

        // Add markers for results
        clearMarkers();
        results.forEach((place) => {
          addMarker({
            position: place.location,
            title: place.name,
            type: place.type,
            placeId: place.placeId,
          });
        });

        // Fit map to show all results
        const bounds = calculateBounds(results);
        if (bounds) {
          fitBounds(bounds);
        }

        return results;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Search failed';
        setError(errorMessage);
        return [];
      } finally {
        setIsLoading(false);
        setSearching(false);
      }
    },
    [
      setPlaces,
      setSearchQuery,
      setSearching,
      clearMarkers,
      addMarker,
      fitBounds,
    ]
  );

  // Search nearby places by type
  const searchNearby = useCallback(
    async (type: string, location: LatLng, radius?: number) => {
      setIsLoading(true);
      setError(null);
      setSearching(true);

      try {
        const { places: results } = await searchNearbyService(
          type,
          location,
          radius
        );

        setPlaces(results);

        // Add markers for results
        clearMarkers();
        results.forEach((place) => {
          addMarker({
            position: place.location,
            title: place.name,
            type: place.type,
            placeId: place.placeId,
          });
        });

        // Fit map to show all results
        const bounds = calculateBounds(results);
        if (bounds) {
          fitBounds(bounds);
        }

        return results;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Nearby search failed';
        setError(errorMessage);
        return [];
      } finally {
        setIsLoading(false);
        setSearching(false);
      }
    },
    [setPlaces, setSearching, clearMarkers, addMarker, fitBounds]
  );

  // Get place details
  const getPlaceDetails = useCallback(
    async (placeId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const { place } = await getPlaceDetailsService(placeId);
        selectPlace(place);
        return place;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to get details';
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [selectPlace]
  );

  // Select a place from the list
  const handlePlaceSelect = useCallback(
    (place: Place) => {
      selectPlace(place);
      flyTo(place.location, 16);

      // Highlight the marker
      const markers = useMapStore.getState().markers;
      const marker = markers.find((m) => m.placeId === place.placeId);
      if (marker) {
        selectMarker(marker.id);
      }
    },
    [selectPlace, flyTo, selectMarker]
  );

  // Clear selection
  const clearSelection = useCallback(() => {
    selectPlace(null);
    selectMarker(null);
  }, [selectPlace, selectMarker]);

  // Add to trip itinerary
  const handleAddToItinerary = useCallback(
    (place: Place, day?: number) => {
      addToItinerary(place, day);
    },
    [addToItinerary]
  );

  // Remove from itinerary
  const handleRemoveFromItinerary = useCallback(
    (itemId: string) => {
      removeFromItinerary(itemId);
    },
    [removeFromItinerary]
  );

  return {
    // State
    places,
    selectedPlace,
    searchQuery,
    isSearching: isSearching || isLoading,
    itinerary,
    error,

    // Actions
    searchPlaces,
    searchNearby,
    getPlaceDetails,
    handlePlaceSelect,
    clearSelection,
    handleAddToItinerary,
    handleRemoveFromItinerary,
    reorderItinerary,
    clearError: () => setError(null),
  };
}

// Hook for place card interactions
export function usePlaceCard(place: Place) {
  const { flyTo, addMarker, selectMarker } = useMapStore();
  const { selectPlace } = usePlacesStore();
  const { handleAddToItinerary } = usePlaces();

  const handleViewOnMap = useCallback(() => {
    flyTo(place.location, 16);
    selectPlace(place);
  }, [place, flyTo, selectPlace]);

  const handleGetDirections = useCallback(() => {
    // This would open directions panel
    // For now, just navigate to the place
    flyTo(place.location, 16);
  }, [place, flyTo]);

  const handleSave = useCallback(() => {
    handleAddToItinerary(place);
  }, [place, handleAddToItinerary]);

  return {
    handleViewOnMap,
    handleGetDirections,
    handleSave,
  };
}

// Format helpers
export function formatPriceLevel(level?: number): string {
  if (level === undefined) return '';
  return '$'.repeat(level + 1);
}

export function formatRating(rating?: number): string {
  if (rating === undefined) return 'No rating';
  return rating.toFixed(1);
}

export function formatPlaceType(type: PlaceType): string {
  const typeNames: Record<PlaceType, string> = {
    hotel: 'Hotel',
    restaurant: 'Restaurant',
    attraction: 'Attraction',
    shopping: 'Shopping',
    transport: 'Transit',
    other: 'Place',
  };
  return typeNames[type];
}
