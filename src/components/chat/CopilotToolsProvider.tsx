'use client';

import { useRef, useEffect } from 'react';
import { useTool } from '@yourgpt/copilot-sdk/react';
import { useMapStore } from '@/stores/mapStore';
import { usePlacesStore } from '@/stores/placesStore';
import { useTripsStore } from '@/stores/tripsStore';
import {
  searchPlaces,
  searchNearby,
  getPlaceDetails,
  geocode,
  calculateBounds,
} from '@/services/places';
import type { ViewMode, PlaceType, TripItemCategory } from '@/types';

// Helper hook to get latest ref values (avoids stale closures)
function useLatest<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

// ===========================================
// Individual Tool Components
// ===========================================

function FlyToLocationTool() {
  const mapStore = useMapStore();
  const mapStoreRef = useLatest(mapStore);

  // Debug: log when this component mounts
  useEffect(() => {
    console.log('[FlyToLocationTool] Component mounted, registering tool');
    return () => console.log('[FlyToLocationTool] Component unmounting');
  }, []);

  useTool({
    name: 'flyToLocation',
    description: 'Navigate the map to a specific location. Use this when the user wants to see a place on the map.',
    inputSchema: {
      type: 'object',
      properties: {
        location: { type: 'string', description: 'The name or address of the location' },
        zoom: { type: 'number', description: 'Zoom level (1-20, default 14)' },
      },
      required: ['location'],
    },
    handler: async ({ location, zoom }: { location: string; zoom?: number }) => {
      console.log('🚀 [Frontend Tool] flyToLocation HANDLER CALLED:', { location, zoom });
      try {
        const result = await geocode(location);
        console.log('[Frontend Tool] flyToLocation geocode result:', result);
        if (result) {
          mapStoreRef.current.flyTo(result.location, zoom ?? 14);
          return { success: true, location: result.formattedAddress };
        }
        return { success: false, error: 'Location not found' };
      } catch (err) {
        console.error('[Frontend Tool] flyToLocation error:', err);
        return { success: false, error: 'Failed to geocode location' };
      }
    },
  });

  return null;
}

function SetMapViewTool() {
  const mapStore = useMapStore();
  const mapStoreRef = useLatest(mapStore);

  useTool({
    name: 'setMapView',
    description: 'Switch the map view mode. Use "map2d" for standard map, "map3d" for 3D photorealistic view, or "streetview" for street-level panorama.',
    inputSchema: {
      type: 'object',
      properties: {
        viewMode: { type: 'string', enum: ['map2d', 'map3d', 'streetview'], description: 'The view mode' },
      },
      required: ['viewMode'],
    },
    handler: async ({ viewMode }: { viewMode: string }) => {
      console.log('[Frontend Tool] setMapView called:', { viewMode });
      mapStoreRef.current.setViewMode(viewMode as ViewMode);
      return { success: true, viewMode };
    },
  });

  return null;
}

function AdjustZoomTool() {
  const mapStore = useMapStore();
  const mapStoreRef = useLatest(mapStore);

  useTool({
    name: 'adjustZoom',
    description: 'Adjust map zoom level',
    inputSchema: {
      type: 'object',
      properties: {
        direction: { type: 'string', enum: ['in', 'out'], description: 'Zoom in or out' },
        amount: { type: 'number', description: 'Number of zoom levels' },
      },
      required: ['direction'],
    },
    handler: async ({ direction, amount }: { direction: 'in' | 'out'; amount?: number }) => {
      console.log('[Frontend Tool] adjustZoom called:', { direction, amount });
      const zoomAmount = amount ?? 2;
      const currentZoom = mapStoreRef.current.camera.zoom;
      const newZoom = direction === 'in'
        ? Math.min(currentZoom + zoomAmount, 20)
        : Math.max(currentZoom - zoomAmount, 1);
      mapStoreRef.current.setCamera({ zoom: newZoom });
      return { success: true, zoom: newZoom };
    },
  });

  return null;
}

function AddMarkerTool() {
  const mapStore = useMapStore();
  const mapStoreRef = useLatest(mapStore);

  useTool({
    name: 'addMarker',
    description: 'Add a marker to the map at a specific location',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Marker title' },
        location: { type: 'string', description: 'Location address' },
        type: { type: 'string', enum: ['hotel', 'restaurant', 'attraction', 'shopping', 'transport', 'other'], description: 'Place type' },
      },
      required: ['title', 'location'],
    },
    handler: async ({ title, location, type }: { title: string; location: string; type?: string }) => {
      console.log('[Frontend Tool] addMarker called:', { title, location, type });
      try {
        const result = await geocode(location);
        if (result) {
          const markerId = mapStoreRef.current.addMarker({
            position: result.location,
            title,
            type: (type ?? 'other') as PlaceType,
          });
          return { success: true, markerId };
        }
        return { success: false, error: 'Location not found' };
      } catch {
        return { success: false, error: 'Failed to add marker' };
      }
    },
  });

  return null;
}

function ClearMarkersTool() {
  const mapStore = useMapStore();
  const mapStoreRef = useLatest(mapStore);

  useTool({
    name: 'clearMarkers',
    description: 'Clear all markers from the map',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    handler: async () => {
      console.log('[Frontend Tool] clearMarkers called');
      mapStoreRef.current.clearMarkers();
      return { success: true };
    },
  });

  return null;
}

function SearchPlacesTool() {
  const mapStore = useMapStore();
  const placesStore = usePlacesStore();
  const mapStoreRef = useLatest(mapStore);
  const placesStoreRef = useLatest(placesStore);

  useEffect(() => {
    console.log('[SearchPlacesTool] Component mounted, registering tool');
    return () => console.log('[SearchPlacesTool] Component unmounting');
  }, []);

  useTool({
    name: 'searchPlaces',
    description: 'Search for places by name or type. Returns a list of matching places with details.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query (e.g., "Italian restaurants", "hotels in Paris")' },
        nearLocation: { type: 'string', description: 'Optional location to search near' },
        radius: { type: 'number', description: 'Search radius in meters (default 5000)' },
      },
      required: ['query'],
    },
    handler: async ({ query, nearLocation, radius }: { query: string; nearLocation?: string; radius?: number }) => {
      console.log('🔍 [Frontend Tool] searchPlaces HANDLER CALLED:', { query, nearLocation, radius });
      try {
        placesStoreRef.current.setSearching(true);
        let location;
        if (nearLocation) {
          const geo = await geocode(nearLocation);
          if (geo) location = geo.location;
        }
        const { places } = await searchPlaces(query, location, radius);
        placesStoreRef.current.setPlaces(places);
        mapStoreRef.current.clearMarkers();
        places.forEach((place) => {
          mapStoreRef.current.addMarker({
            position: place.location,
            title: place.name,
            type: place.type,
            placeId: place.placeId,
          });
        });
        const bounds = calculateBounds(places);
        if (bounds) mapStoreRef.current.fitBounds(bounds);
        placesStoreRef.current.setSearching(false);
        return {
          success: true,
          count: places.length,
          places: places.map((p) => ({ name: p.name, address: p.address, rating: p.rating, type: p.type, placeId: p.placeId })),
        };
      } catch {
        placesStoreRef.current.setSearching(false);
        return { success: false, error: 'Search failed' };
      }
    },
  });

  return null;
}

function SearchNearbyTool() {
  const mapStore = useMapStore();
  const placesStore = usePlacesStore();
  const mapStoreRef = useLatest(mapStore);
  const placesStoreRef = useLatest(placesStore);

  useEffect(() => {
    console.log('[SearchNearbyTool] Component mounted, registering tool');
    return () => console.log('[SearchNearbyTool] Component unmounting');
  }, []);

  useTool({
    name: 'searchNearby',
    description: 'Search for places of a specific type near a location',
    inputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string', description: 'Type of place (e.g., "restaurant", "hotel", "museum")' },
        location: { type: 'string', description: 'Location to search near' },
        radius: { type: 'number', description: 'Search radius in meters (default 5000)' },
      },
      required: ['type', 'location'],
    },
    handler: async ({ type, location: locationStr, radius }: { type: string; location: string; radius?: number }) => {
      console.log('📍 [Frontend Tool] searchNearby HANDLER CALLED:', { type, location: locationStr, radius });
      try {
        placesStoreRef.current.setSearching(true);
        const geo = await geocode(locationStr);
        if (!geo) {
          placesStoreRef.current.setSearching(false);
          return { success: false, error: 'Could not find the specified location' };
        }
        const { places } = await searchNearby(type, geo.location, radius);
        placesStoreRef.current.setPlaces(places);
        mapStoreRef.current.clearMarkers();
        places.forEach((place) => {
          mapStoreRef.current.addMarker({
            position: place.location,
            title: place.name,
            type: place.type,
            placeId: place.placeId,
          });
        });
        const bounds = calculateBounds(places);
        if (bounds) mapStoreRef.current.fitBounds(bounds);
        placesStoreRef.current.setSearching(false);
        return {
          success: true,
          count: places.length,
          places: places.map((p) => ({ name: p.name, address: p.address, rating: p.rating })),
        };
      } catch {
        placesStoreRef.current.setSearching(false);
        return { success: false, error: 'Nearby search failed' };
      }
    },
  });

  return null;
}

function GetPlaceDetailsTool() {
  const placesStore = usePlacesStore();
  const placesStoreRef = useLatest(placesStore);

  useTool({
    name: 'getPlaceDetails',
    description: 'Get detailed information about a specific place',
    inputSchema: {
      type: 'object',
      properties: {
        placeId: { type: 'string', description: 'The Google Place ID' },
      },
      required: ['placeId'],
    },
    handler: async ({ placeId }: { placeId: string }) => {
      console.log('[Frontend Tool] getPlaceDetails called:', { placeId });
      try {
        const { place } = await getPlaceDetails(placeId);
        placesStoreRef.current.selectPlace(place);
        return {
          success: true,
          place: { name: place.name, address: place.address, rating: place.rating, phone: place.phone, website: place.website, openNow: place.openingHours?.openNow },
        };
      } catch {
        return { success: false, error: 'Failed to get place details' };
      }
    },
  });

  return null;
}

function GetDirectionsTool() {
  useTool({
    name: 'getDirections',
    description: 'Get directions between two locations',
    inputSchema: {
      type: 'object',
      properties: {
        origin: { type: 'string', description: 'Starting point' },
        destination: { type: 'string', description: 'Ending point' },
        travelMode: { type: 'string', enum: ['driving', 'walking', 'bicycling', 'transit'], description: 'Travel mode' },
      },
      required: ['origin', 'destination'],
    },
    handler: async ({ origin, destination, travelMode }: { origin: string; destination: string; travelMode?: string }) => {
      console.log('[Frontend Tool] getDirections called:', { origin, destination, travelMode });
      return {
        success: true,
        message: `Directions from ${origin} to ${destination} by ${travelMode ?? 'driving'}`,
        note: 'Directions API integration pending',
      };
    },
  });

  return null;
}

function AddToItineraryTool() {
  const placesStore = usePlacesStore();
  const tripsStore = useTripsStore();
  const placesStoreRef = useLatest(placesStore);
  const tripsStoreRef = useLatest(tripsStore);

  useTool({
    name: 'addToItinerary',
    description: 'Add a place to the active trip itinerary. If no trip exists, creates one automatically. You can also set the day\'s title and description when adding places.',
    inputSchema: {
      type: 'object',
      properties: {
        placeName: { type: 'string', description: 'Place name' },
        placeId: { type: 'string', description: 'Google Place ID' },
        day: { type: 'number', description: 'Day number (default 1)' },
        tripId: { type: 'string', description: 'Optional trip ID (uses active trip if not provided)' },
        category: {
          type: 'string',
          enum: ['accommodation', 'activity', 'dining', 'transport', 'sightseeing', 'other'],
          description: 'Category of the place'
        },
        dayTitle: { type: 'string', description: 'Optional title for the day (e.g., "Beach Day", "City Exploration")' },
        dayDescription: { type: 'string', description: 'Optional description of the day\'s activities' },
      },
      required: ['placeName'],
    },
    handler: async ({ placeName, placeId, day, tripId, category, dayTitle, dayDescription }: {
      placeName: string;
      placeId?: string;
      day?: number;
      tripId?: string;
      category?: TripItemCategory;
      dayTitle?: string;
      dayDescription?: string;
    }) => {
      console.log('[Frontend Tool] addToItinerary called:', { placeName, placeId, day, tripId, category, dayTitle, dayDescription });
      try {
        // Determine which trip to use
        let targetTripId = tripId || tripsStoreRef.current.activeTripId;

        // If no trip exists, create one
        if (!targetTripId) {
          const newTrip = tripsStoreRef.current.createTrip({
            name: 'My Trip',
          });
          targetTripId = newTrip.id;
        }

        // Find the place
        let place = placesStoreRef.current.places.find(
          (p) => p.name.toLowerCase() === placeName.toLowerCase() || p.placeId === placeId
        );
        if (!place && placeId) {
          const details = await getPlaceDetails(placeId);
          place = details.place;
        }
        if (!place) {
          const { places } = await searchPlaces(placeName);
          if (places.length > 0) place = places[0];
        }

        if (place) {
          const targetDay = day ?? 1;
          tripsStoreRef.current.addItemToTrip(targetTripId, place, targetDay, category);

          // Update day info if provided
          if (dayTitle || dayDescription) {
            tripsStoreRef.current.updateDayInfo(targetTripId, targetDay, {
              title: dayTitle?.trim() || undefined,
              description: dayDescription?.trim() || undefined,
            });
          }

          const trip = tripsStoreRef.current.getTripById(targetTripId);
          return {
            success: true,
            place: place.name,
            day: targetDay,
            tripName: trip?.name,
            tripId: targetTripId,
            dayTitle: dayTitle?.trim(),
            dayDescription: dayDescription?.trim(),
          };
        }
        return { success: false, error: 'Place not found' };
      } catch {
        return { success: false, error: 'Failed to add to itinerary' };
      }
    },
  });

  return null;
}

function CreateTripTool() {
  const tripsStore = useTripsStore();
  const tripsStoreRef = useLatest(tripsStore);

  useTool({
    name: 'createTrip',
    description: 'Create a new trip for planning. Use this when the user wants to start planning a new trip.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Name of the trip (e.g., "Dubai Adventure", "Paris Vacation")' },
        destination: { type: 'string', description: 'Main destination of the trip' },
        description: { type: 'string', description: 'Brief description of the trip' },
        startDate: { type: 'string', description: 'Start date in YYYY-MM-DD format' },
        endDate: { type: 'string', description: 'End date in YYYY-MM-DD format' },
      },
      required: ['name'],
    },
    handler: async ({ name, destination, description, startDate, endDate }: {
      name: string;
      destination?: string;
      description?: string;
      startDate?: string;
      endDate?: string;
    }) => {
      console.log('[Frontend Tool] createTrip called:', { name, destination, startDate, endDate });
      try {
        const trip = tripsStoreRef.current.createTrip({
          name,
          destination,
          description,
          startDate,
          endDate,
        });
        return {
          success: true,
          tripId: trip.id,
          tripName: trip.name,
          destination: trip.destination,
          message: `Created trip "${trip.name}"${trip.destination ? ` to ${trip.destination}` : ''}. You can now add places to this trip.`,
        };
      } catch {
        return { success: false, error: 'Failed to create trip' };
      }
    },
  });

  return null;
}

function ListTripsTool() {
  const tripsStore = useTripsStore();
  const tripsStoreRef = useLatest(tripsStore);

  useTool({
    name: 'listTrips',
    description: 'List all trips the user has created. Use this to show the user their existing trips.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    handler: async () => {
      console.log('[Frontend Tool] listTrips called');
      const trips = tripsStoreRef.current.trips;
      const activeTrip = tripsStoreRef.current.getActiveTrip();

      if (trips.length === 0) {
        return {
          success: true,
          count: 0,
          trips: [],
          message: 'No trips yet. Would you like to create one?',
        };
      }

      return {
        success: true,
        count: trips.length,
        activeTrip: activeTrip ? {
          id: activeTrip.id,
          name: activeTrip.name,
          destination: activeTrip.destination,
          itemCount: activeTrip.items.length,
        } : null,
        trips: trips.map((t) => ({
          id: t.id,
          name: t.name,
          destination: t.destination,
          status: t.status,
          itemCount: t.items.length,
          startDate: t.startDate,
          endDate: t.endDate,
        })),
      };
    },
  });

  return null;
}

function DeleteTripTool() {
  const tripsStore = useTripsStore();
  const tripsStoreRef = useLatest(tripsStore);

  useTool({
    name: 'deleteTrip',
    description: 'Delete an entire trip. IMPORTANT: Always call this first with confirmed=false to show the user what will be deleted and ask for confirmation. Only call with confirmed=true after the user explicitly agrees to delete.',
    inputSchema: {
      type: 'object',
      properties: {
        tripId: { type: 'string', description: 'The ID of the trip to delete' },
        tripName: { type: 'string', description: 'The name of the trip to delete (alternative to tripId)' },
        confirmed: { type: 'boolean', description: 'Set to true only after user confirms deletion. Default is false.' },
      },
    },
    handler: async ({ tripId, tripName, confirmed }: { tripId?: string; tripName?: string; confirmed?: boolean }) => {
      console.log('[Frontend Tool] deleteTrip called:', { tripId, tripName, confirmed });
      try {
        const trips = tripsStoreRef.current.trips;
        const targetTrip = tripId
          ? trips.find((t) => t.id === tripId)
          : trips.find((t) => t.name.toLowerCase() === tripName?.toLowerCase());

        if (!targetTrip) {
          return { success: false, error: 'Trip not found' };
        }

        // If not confirmed, return trip details and ask for confirmation
        if (!confirmed) {
          return {
            success: false,
            requiresConfirmation: true,
            tripToDelete: {
              id: targetTrip.id,
              name: targetTrip.name,
              destination: targetTrip.destination,
              itemCount: targetTrip.items.length,
              daysCount: targetTrip.daysCount,
            },
            message: `Are you sure you want to delete "${targetTrip.name}"? This trip has ${targetTrip.items.length} places across ${targetTrip.daysCount} days. This action cannot be undone. Please confirm to proceed.`,
          };
        }

        // User confirmed, proceed with deletion
        tripsStoreRef.current.deleteTrip(targetTrip.id);
        return {
          success: true,
          message: `Deleted trip "${targetTrip.name}"`,
          deletedTripName: targetTrip.name,
        };
      } catch {
        return { success: false, error: 'Failed to delete trip' };
      }
    },
  });

  return null;
}

function DeleteTripItemTool() {
  const tripsStore = useTripsStore();
  const tripsStoreRef = useLatest(tripsStore);

  useTool({
    name: 'deleteTripItem',
    description: 'Delete a place from the trip itinerary. Can delete by place name.',
    inputSchema: {
      type: 'object',
      properties: {
        placeName: { type: 'string', description: 'Name of the place to remove' },
        tripId: { type: 'string', description: 'Trip ID (uses active trip if not provided)' },
      },
      required: ['placeName'],
    },
    handler: async ({ placeName, tripId }: { placeName: string; tripId?: string }) => {
      console.log('[Frontend Tool] deleteTripItem called:', { placeName, tripId });
      try {
        const targetTripId = tripId || tripsStoreRef.current.activeTripId;
        if (!targetTripId) {
          return { success: false, error: 'No active trip' };
        }

        const trip = tripsStoreRef.current.getTripById(targetTripId);
        if (!trip) {
          return { success: false, error: 'Trip not found' };
        }

        const item = trip.items.find(
          (i) => i.place.name.toLowerCase().includes(placeName.toLowerCase())
        );

        if (!item) {
          return { success: false, error: `Place "${placeName}" not found in trip` };
        }

        tripsStoreRef.current.removeItemFromTrip(targetTripId, item.id);
        return {
          success: true,
          message: `Removed "${item.place.name}" from ${trip.name}`,
          removedPlace: item.place.name,
          fromDay: item.day,
        };
      } catch {
        return { success: false, error: 'Failed to delete item' };
      }
    },
  });

  return null;
}

function MoveTripItemTool() {
  const tripsStore = useTripsStore();
  const tripsStoreRef = useLatest(tripsStore);

  useTool({
    name: 'moveTripItem',
    description: 'Move a place to a different day in the trip itinerary.',
    inputSchema: {
      type: 'object',
      properties: {
        placeName: { type: 'string', description: 'Name of the place to move' },
        toDay: { type: 'number', description: 'Target day number to move the place to' },
        tripId: { type: 'string', description: 'Trip ID (uses active trip if not provided)' },
      },
      required: ['placeName', 'toDay'],
    },
    handler: async ({ placeName, toDay, tripId }: { placeName: string; toDay: number; tripId?: string }) => {
      console.log('[Frontend Tool] moveTripItem called:', { placeName, toDay, tripId });
      try {
        const targetTripId = tripId || tripsStoreRef.current.activeTripId;
        if (!targetTripId) {
          return { success: false, error: 'No active trip' };
        }

        const trip = tripsStoreRef.current.getTripById(targetTripId);
        if (!trip) {
          return { success: false, error: 'Trip not found' };
        }

        const item = trip.items.find(
          (i) => i.place.name.toLowerCase().includes(placeName.toLowerCase())
        );

        if (!item) {
          return { success: false, error: `Place "${placeName}" not found in trip` };
        }

        const fromDay = item.day;
        const targetDayItems = trip.items.filter((i) => i.day === toDay);
        tripsStoreRef.current.moveTripItem(targetTripId, item.id, toDay, targetDayItems.length);

        return {
          success: true,
          message: `Moved "${item.place.name}" from Day ${fromDay} to Day ${toDay}`,
          movedPlace: item.place.name,
          fromDay,
          toDay,
        };
      } catch {
        return { success: false, error: 'Failed to move item' };
      }
    },
  });

  return null;
}

function RemovePlacesFromTripTool() {
  const tripsStore = useTripsStore();
  const tripsStoreRef = useLatest(tripsStore);

  useTool({
    name: 'removePlacesFromTrip',
    description: 'Remove multiple places from the trip at once. Can remove by place names or clear all places from a specific day.',
    inputSchema: {
      type: 'object',
      properties: {
        placeNames: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of place names to remove',
        },
        fromDay: { type: 'number', description: 'Delete all items from this day (alternative to placeNames)' },
        tripId: { type: 'string', description: 'Trip ID (uses active trip if not provided)' },
      },
    },
    handler: async ({ placeNames, fromDay, tripId }: { placeNames?: string[]; fromDay?: number; tripId?: string }) => {
      console.log('[Frontend Tool] removePlacesFromTrip called:', { placeNames, fromDay, tripId });
      try {
        const targetTripId = tripId || tripsStoreRef.current.activeTripId;
        if (!targetTripId) {
          return { success: false, error: 'No active trip' };
        }

        const trip = tripsStoreRef.current.getTripById(targetTripId);
        if (!trip) {
          return { success: false, error: 'Trip not found' };
        }

        let itemsToDelete: typeof trip.items = [];

        if (fromDay !== undefined) {
          // Delete all items from a specific day
          itemsToDelete = trip.items.filter((i) => i.day === fromDay);
        } else if (placeNames && placeNames.length > 0) {
          // Delete specific places by name
          itemsToDelete = trip.items.filter((item) =>
            placeNames.some((name) => item.place.name.toLowerCase().includes(name.toLowerCase()))
          );
        }

        if (itemsToDelete.length === 0) {
          return { success: false, error: 'No matching items found to delete' };
        }

        const deletedNames: string[] = [];
        for (const item of itemsToDelete) {
          tripsStoreRef.current.removeItemFromTrip(targetTripId, item.id);
          deletedNames.push(item.place.name);
        }

        return {
          success: true,
          message: `Deleted ${deletedNames.length} places from ${trip.name}`,
          deletedPlaces: deletedNames,
          count: deletedNames.length,
        };
      } catch {
        return { success: false, error: 'Failed to delete items' };
      }
    },
  });

  return null;
}

function ReschedulePlacesTool() {
  const tripsStore = useTripsStore();
  const tripsStoreRef = useLatest(tripsStore);

  useTool({
    name: 'reschedulePlaces',
    description: 'Move multiple places to a different day at once. Can move specific places by name or all places from one day to another.',
    inputSchema: {
      type: 'object',
      properties: {
        placeNames: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of place names to move',
        },
        fromDay: { type: 'number', description: 'Move all items from this day (alternative to placeNames)' },
        toDay: { type: 'number', description: 'Target day number to move the places to' },
        tripId: { type: 'string', description: 'Trip ID (uses active trip if not provided)' },
      },
      required: ['toDay'],
    },
    handler: async ({ placeNames, fromDay, toDay, tripId }: {
      placeNames?: string[];
      fromDay?: number;
      toDay: number;
      tripId?: string;
    }) => {
      console.log('[Frontend Tool] reschedulePlaces called:', { placeNames, fromDay, toDay, tripId });
      try {
        const targetTripId = tripId || tripsStoreRef.current.activeTripId;
        if (!targetTripId) {
          return { success: false, error: 'No active trip' };
        }

        const trip = tripsStoreRef.current.getTripById(targetTripId);
        if (!trip) {
          return { success: false, error: 'Trip not found' };
        }

        let itemsToMove: typeof trip.items = [];

        if (fromDay !== undefined) {
          // Move all items from a specific day
          itemsToMove = trip.items.filter((i) => i.day === fromDay && i.day !== toDay);
        } else if (placeNames && placeNames.length > 0) {
          // Move specific places by name
          itemsToMove = trip.items.filter((item) =>
            placeNames.some((name) => item.place.name.toLowerCase().includes(name.toLowerCase()))
          );
        }

        if (itemsToMove.length === 0) {
          return { success: false, error: 'No matching items found to move' };
        }

        const movedNames: string[] = [];
        for (const item of itemsToMove) {
          const targetDayItems = tripsStoreRef.current.getTripById(targetTripId)?.items.filter((i) => i.day === toDay) || [];
          tripsStoreRef.current.moveTripItem(targetTripId, item.id, toDay, targetDayItems.length);
          movedNames.push(item.place.name);
        }

        return {
          success: true,
          message: `Moved ${movedNames.length} places to Day ${toDay}`,
          movedPlaces: movedNames,
          toDay,
          count: movedNames.length,
        };
      } catch {
        return { success: false, error: 'Failed to move items' };
      }
    },
  });

  return null;
}

function GetTripDetailsTool() {
  const tripsStore = useTripsStore();
  const tripsStoreRef = useLatest(tripsStore);

  useTool({
    name: 'getTripDetails',
    description: 'Get detailed information about a trip including all places organized by day.',
    inputSchema: {
      type: 'object',
      properties: {
        tripId: { type: 'string', description: 'Trip ID (uses active trip if not provided)' },
      },
    },
    handler: async ({ tripId }: { tripId?: string }) => {
      console.log('[Frontend Tool] getTripDetails called:', { tripId });
      try {
        const targetTripId = tripId || tripsStoreRef.current.activeTripId;
        if (!targetTripId) {
          return { success: false, error: 'No active trip' };
        }

        const trip = tripsStoreRef.current.getTripById(targetTripId);
        if (!trip) {
          return { success: false, error: 'Trip not found' };
        }

        // Organize items by day with day info
        const itinerary: Record<number, {
          title?: string;
          description?: string;
          places: { name: string; type: string; time?: string }[]
        }> = {};

        // Initialize all days up to daysCount
        for (let day = 1; day <= trip.daysCount; day++) {
          const dayInfo = trip.dayInfo?.[day];
          itinerary[day] = {
            title: dayInfo?.title,
            description: dayInfo?.description,
            places: [],
          };
        }

        // Add places to their respective days
        for (const item of trip.items) {
          if (!itinerary[item.day]) {
            itinerary[item.day] = { places: [] };
          }
          itinerary[item.day].places.push({
            name: item.place.name,
            type: item.place.type,
            time: item.startTime,
          });
        }

        return {
          success: true,
          trip: {
            id: trip.id,
            name: trip.name,
            destination: trip.destination,
            status: trip.status,
            startDate: trip.startDate,
            endDate: trip.endDate,
            daysCount: trip.daysCount,
            totalPlaces: trip.items.length,
          },
          itinerary,
        };
      } catch {
        return { success: false, error: 'Failed to get trip details' };
      }
    },
  });

  return null;
}

function UpdateDayInfoTool() {
  const tripsStore = useTripsStore();
  const tripsStoreRef = useLatest(tripsStore);

  useTool({
    name: 'updateDayInfo',
    description: 'Set or update the title and description for a specific day in the trip. Use this to give each day a meaningful name like "Beach Day" or "City Exploration" and add a brief description of planned activities.',
    inputSchema: {
      type: 'object',
      properties: {
        day: { type: 'number', description: 'The day number to update (e.g., 1, 2, 3)' },
        title: { type: 'string', description: 'A short title for the day (e.g., "Beach & Adventure", "Cultural Exploration", "Shopping Day")' },
        description: { type: 'string', description: 'Brief description of the day\'s activities or theme' },
        tripId: { type: 'string', description: 'Trip ID (uses active trip if not provided)' },
      },
      required: ['day'],
    },
    handler: async ({ day, title, description, tripId }: {
      day: number;
      title?: string;
      description?: string;
      tripId?: string;
    }) => {
      console.log('[Frontend Tool] updateDayInfo called:', { day, title, description, tripId });
      try {
        const targetTripId = tripId || tripsStoreRef.current.activeTripId;
        if (!targetTripId) {
          return { success: false, error: 'No active trip' };
        }

        const trip = tripsStoreRef.current.getTripById(targetTripId);
        if (!trip) {
          return { success: false, error: 'Trip not found' };
        }

        if (day < 1 || day > trip.daysCount) {
          return { success: false, error: `Invalid day number. Trip has ${trip.daysCount} days.` };
        }

        tripsStoreRef.current.updateDayInfo(targetTripId, day, {
          title: title?.trim() || undefined,
          description: description?.trim() || undefined,
        });

        return {
          success: true,
          message: `Updated Day ${day}${title ? `: "${title}"` : ''}`,
          day,
          title: title?.trim(),
          description: description?.trim(),
          tripName: trip.name,
        };
      } catch {
        return { success: false, error: 'Failed to update day info' };
      }
    },
  });

  return null;
}

// ===========================================
// Main Provider Component
// ===========================================

export function CopilotToolsProvider() {
  return (
    <>
      <FlyToLocationTool />
      <SetMapViewTool />
      <AdjustZoomTool />
      <AddMarkerTool />
      <ClearMarkersTool />
      <SearchPlacesTool />
      <SearchNearbyTool />
      <GetPlaceDetailsTool />
      <GetDirectionsTool />
      <AddToItineraryTool />
      <CreateTripTool />
      <ListTripsTool />
      <DeleteTripTool />
      <DeleteTripItemTool />
      <MoveTripItemTool />
      <RemovePlacesFromTripTool />
      <ReschedulePlacesTool />
      <GetTripDetailsTool />
      <UpdateDayInfoTool />
    </>
  );
}
