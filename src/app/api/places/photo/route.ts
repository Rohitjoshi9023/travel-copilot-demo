import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_PLACES_API_BASE = 'https://places.googleapis.com/v1';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const photoName = searchParams.get('name');
    const maxWidth = searchParams.get('maxWidth') || '400';
    const maxHeight = searchParams.get('maxHeight') || '300';

    if (!photoName) {
      return NextResponse.json(
        { error: 'Photo name is required' },
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

    // Get the photo media URL
    const mediaUrl = `${GOOGLE_PLACES_API_BASE}/${photoName}/media?maxWidthPx=${maxWidth}&maxHeightPx=${maxHeight}&key=${apiKey}`;

    const response = await fetch(mediaUrl);

    if (!response.ok) {
      console.error('Google Places Photo API error:', response.status);
      return NextResponse.json(
        { error: 'Failed to get photo' },
        { status: response.status }
      );
    }

    // Stream the image directly
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error('Photo fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
