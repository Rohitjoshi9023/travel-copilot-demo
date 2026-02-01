'use client';

import { useEffect, useRef } from 'react';
import { useTripsStore } from '@/stores/tripsStore';
import { useMapStore } from '@/stores/mapStore';
import { geocode } from '@/services/places';

/**
 * Hook that syncs the map location with the active trip's destination.
 * When the user switches trips, the map automatically flies to that trip's destination.
 */
export function useTripMapSync() {
  const activeTripId = useTripsStore((s) => s.activeTripId);
  const getActiveTrip = useTripsStore((s) => s.getActiveTrip);
  const flyTo = useMapStore((s) => s.flyTo);

  // Track the last trip ID we navigated to, to avoid duplicate navigations
  const lastNavigatedTripId = useRef<string | null>(null);

  useEffect(() => {
    // Skip if no active trip or if we already navigated to this trip
    if (!activeTripId || activeTripId === lastNavigatedTripId.current) {
      return;
    }

    const trip = getActiveTrip();
    if (!trip?.destination) {
      lastNavigatedTripId.current = activeTripId;
      return;
    }

    // Geocode the destination and fly to it
    const navigateToDestination = async () => {
      try {
        const result = await geocode(trip.destination!);
        if (result) {
          flyTo(result.location, 12); // Zoom level 12 for city-level view
          lastNavigatedTripId.current = activeTripId;
        }
      } catch (error) {
        console.error('Failed to geocode trip destination:', error);
        lastNavigatedTripId.current = activeTripId;
      }
    };

    navigateToDestination();
  }, [activeTripId, getActiveTrip, flyTo]);
}
