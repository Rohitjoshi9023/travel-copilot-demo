import type {
  Place,
  PlaceType,
  LatLng,
  PlacesSearchResponse,
  PlaceDetailsResponse,
} from '@/types';

// Map Google Places types to our simplified types
const mapPlaceType = (types: string[]): PlaceType => {
  if (types.some((t) => t.includes('lodging') || t.includes('hotel'))) {
    return 'hotel';
  }
  if (
    types.some(
      (t) =>
        t.includes('restaurant') || t.includes('food') || t.includes('cafe')
    )
  ) {
    return 'restaurant';
  }
  if (
    types.some(
      (t) =>
        t.includes('tourist') ||
        t.includes('museum') ||
        t.includes('park') ||
        t.includes('point_of_interest')
    )
  ) {
    return 'attraction';
  }
  if (
    types.some(
      (t) => t.includes('store') || t.includes('shop') || t.includes('mall')
    )
  ) {
    return 'shopping';
  }
  if (
    types.some(
      (t) =>
        t.includes('transit') ||
        t.includes('airport') ||
        t.includes('train') ||
        t.includes('bus')
    )
  ) {
    return 'transport';
  }
  return 'other';
};

// Search places by text query
export async function searchPlaces(
  query: string,
  location?: LatLng,
  radius?: number
): Promise<PlacesSearchResponse> {
  const params = new URLSearchParams({ query });
  if (location) {
    params.append('lat', location.lat.toString());
    params.append('lng', location.lng.toString());
  }
  if (radius) {
    params.append('radius', radius.toString());
  }

  const response = await fetch(`/api/places/search?${params}`);
  if (!response.ok) {
    throw new Error('Failed to search places');
  }

  return response.json();
}

// Search nearby places by type
export async function searchNearby(
  type: string,
  location: LatLng,
  radius?: number
): Promise<PlacesSearchResponse> {
  const params = new URLSearchParams({
    type,
    lat: location.lat.toString(),
    lng: location.lng.toString(),
  });
  if (radius) {
    params.append('radius', radius.toString());
  }

  const response = await fetch(`/api/places/nearby?${params}`);
  if (!response.ok) {
    throw new Error('Failed to search nearby places');
  }

  return response.json();
}

// Get place details
export async function getPlaceDetails(
  placeId: string
): Promise<PlaceDetailsResponse> {
  const response = await fetch(`/api/places/details?placeId=${placeId}`);
  if (!response.ok) {
    throw new Error('Failed to get place details');
  }

  return response.json();
}

// Geocode an address or place name to coordinates
export async function geocode(
  address: string
): Promise<{ location: LatLng; formattedAddress: string } | null> {
  const response = await fetch(
    `/api/places/search?query=${encodeURIComponent(address)}`
  );
  if (!response.ok) {
    return null;
  }

  const data: PlacesSearchResponse = await response.json();
  if (data.places.length === 0) {
    return null;
  }

  const place = data.places[0];
  return {
    location: place.location,
    formattedAddress: place.address,
  };
}

// Transform Google Places API response to our Place type
export function transformGooglePlace(googlePlace: {
  id?: string;
  displayName?: { text: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
  types?: string[];
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string;
  photos?: Array<{ name: string }>;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  regularOpeningHours?: {
    openNow?: boolean;
    weekdayDescriptions?: string[];
  };
  reviews?: Array<{
    authorAttribution?: { displayName: string; photoUri?: string };
    rating?: number;
    text?: { text: string };
    relativePublishTimeDescription?: string;
  }>;
}): Place {
  const types = googlePlace.types || [];
  const priceMap: Record<string, number> = {
    PRICE_LEVEL_FREE: 0,
    PRICE_LEVEL_INEXPENSIVE: 1,
    PRICE_LEVEL_MODERATE: 2,
    PRICE_LEVEL_EXPENSIVE: 3,
    PRICE_LEVEL_VERY_EXPENSIVE: 4,
  };

  return {
    id: googlePlace.id || '',
    placeId: googlePlace.id || '',
    name: googlePlace.displayName?.text || '',
    address: googlePlace.formattedAddress || '',
    location: {
      lat: googlePlace.location?.latitude || 0,
      lng: googlePlace.location?.longitude || 0,
    },
    type: mapPlaceType(types),
    rating: googlePlace.rating,
    userRatingsTotal: googlePlace.userRatingCount,
    priceLevel: googlePlace.priceLevel
      ? priceMap[googlePlace.priceLevel]
      : undefined,
    photos: googlePlace.photos?.map((p) => ({
      url: `/api/places/photo?name=${encodeURIComponent(p.name)}`,
      width: 400,
      height: 300,
    })),
    phone: googlePlace.nationalPhoneNumber,
    website: googlePlace.websiteUri,
    openingHours: googlePlace.regularOpeningHours
      ? {
          openNow: googlePlace.regularOpeningHours.openNow ?? false,
          weekdayText: googlePlace.regularOpeningHours.weekdayDescriptions,
        }
      : undefined,
    reviews: googlePlace.reviews?.map((r) => ({
      author: r.authorAttribution?.displayName || 'Anonymous',
      authorPhoto: r.authorAttribution?.photoUri,
      rating: r.rating || 0,
      text: r.text?.text || '',
      time: r.relativePublishTimeDescription || '',
    })),
    types,
  };
}

// Calculate bounds from a list of places
export function calculateBounds(
  places: Place[]
): { northeast: LatLng; southwest: LatLng } | null {
  if (places.length === 0) return null;

  let north = -90;
  let south = 90;
  let east = -180;
  let west = 180;

  places.forEach((place) => {
    north = Math.max(north, place.location.lat);
    south = Math.min(south, place.location.lat);
    east = Math.max(east, place.location.lng);
    west = Math.min(west, place.location.lng);
  });

  // Add some padding
  const latPadding = (north - south) * 0.1 || 0.01;
  const lngPadding = (east - west) * 0.1 || 0.01;

  return {
    northeast: { lat: north + latPadding, lng: east + lngPadding },
    southwest: { lat: south - latPadding, lng: west - lngPadding },
  };
}
