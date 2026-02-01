import { NextRequest, NextResponse } from 'next/server';
import { transformGooglePlace } from '@/services/places';

const GOOGLE_PLACES_API_BASE =
  'https://places.googleapis.com/v1/places:searchNearby';

// Map common type names to Google Places API types
const typeMapping: Record<string, string[]> = {
  restaurant: ['restaurant'],
  hotel: ['lodging', 'hotel'],
  cafe: ['cafe'],
  bar: ['bar'],
  museum: ['museum'],
  park: ['park'],
  shopping: ['shopping_mall', 'store'],
  attraction: ['tourist_attraction'],
  airport: ['airport'],
  train: ['train_station'],
  bus: ['bus_station'],
  hospital: ['hospital'],
  pharmacy: ['pharmacy'],
  bank: ['bank'],
  atm: ['atm'],
  gas: ['gas_station'],
  parking: ['parking'],
  gym: ['gym'],
  spa: ['spa'],
  beach: ['beach'],
  nightclub: ['night_club'],
  cinema: ['movie_theater'],
};

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get('type');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius') || '5000';

    if (!type || !lat || !lng) {
      return NextResponse.json(
        { error: 'Type, lat, and lng are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Maps API key not configured' },
        { status: 500 }
      );
    }

    // Get the Google Places API types for the requested type
    const includedTypes =
      typeMapping[type.toLowerCase()] || [type.toLowerCase()];

    const requestBody = {
      includedTypes,
      maxResultCount: 20,
      languageCode: 'en',
      locationRestriction: {
        circle: {
          center: {
            latitude: parseFloat(lat),
            longitude: parseFloat(lng),
          },
          radius: parseFloat(radius),
        },
      },
    };

    const response = await fetch(GOOGLE_PLACES_API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask':
          'places.id,places.displayName,places.formattedAddress,places.location,places.types,places.rating,places.userRatingCount,places.priceLevel,places.photos,places.regularOpeningHours',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Places API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to search nearby places' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const places = (data.places || []).map(transformGooglePlace);

    return NextResponse.json({ places });
  } catch (error) {
    console.error('Nearby search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
