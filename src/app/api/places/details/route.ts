import { NextRequest, NextResponse } from 'next/server';
import { transformGooglePlace } from '@/services/places';

const GOOGLE_PLACES_API_BASE = 'https://places.googleapis.com/v1/places';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const placeId = searchParams.get('placeId');

    if (!placeId) {
      return NextResponse.json(
        { error: 'placeId is required' },
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

    const response = await fetch(`${GOOGLE_PLACES_API_BASE}/${placeId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask':
          'id,displayName,formattedAddress,location,types,rating,userRatingCount,priceLevel,photos,nationalPhoneNumber,websiteUri,regularOpeningHours,reviews',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Places API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to get place details' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const place = transformGooglePlace(data);

    return NextResponse.json({ place });
  } catch (error) {
    console.error('Place details error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
