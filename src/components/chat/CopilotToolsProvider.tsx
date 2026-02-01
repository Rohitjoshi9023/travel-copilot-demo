'use client';

import { useRef, useEffect } from 'react';
import { useTool } from '@yourgpt/copilot-sdk/react';
import { useMapStore } from '@/stores/mapStore';
import { usePlacesStore } from '@/stores/placesStore';
import {
  searchPlaces,
  searchNearby,
  getPlaceDetails,
  geocode,
  calculateBounds,
} from '@/services/places';
import type { ViewMode, PlaceType } from '@/types';

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
  const placesStoreRef = useLatest(placesStore);

  useTool({
    name: 'addToItinerary',
    description: 'Add a place to the trip itinerary',
    inputSchema: {
      type: 'object',
      properties: {
        placeName: { type: 'string', description: 'Place name' },
        placeId: { type: 'string', description: 'Google Place ID' },
        day: { type: 'number', description: 'Day number' },
      },
      required: ['placeName'],
    },
    handler: async ({ placeName, placeId, day }: { placeName: string; placeId?: string; day?: number }) => {
      console.log('[Frontend Tool] addToItinerary called:', { placeName, placeId, day });
      try {
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
          placesStoreRef.current.addToItinerary(place, day ?? 1);
          return { success: true, place: place.name, day: day ?? 1 };
        }
        return { success: false, error: 'Place not found' };
      } catch {
        return { success: false, error: 'Failed to add to itinerary' };
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
    </>
  );
}
