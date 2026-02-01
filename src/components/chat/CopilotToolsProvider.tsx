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
    description: 'Add a place to the active trip itinerary. If no trip exists, creates one automatically.',
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
      },
      required: ['placeName'],
    },
    handler: async ({ placeName, placeId, day, tripId, category }: {
      placeName: string;
      placeId?: string;
      day?: number;
      tripId?: string;
      category?: TripItemCategory;
    }) => {
      console.log('[Frontend Tool] addToItinerary called:', { placeName, placeId, day, tripId, category });
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
          tripsStoreRef.current.addItemToTrip(targetTripId, place, day ?? 1, category);
          const trip = tripsStoreRef.current.getTripById(targetTripId);
          return {
            success: true,
            place: place.name,
            day: day ?? 1,
            tripName: trip?.name,
            tripId: targetTripId,
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
    </>
  );
}
