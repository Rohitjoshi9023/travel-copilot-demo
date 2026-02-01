// Application configuration

export const config = {
  // Google Maps
  googleMaps: {
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    defaultCenter: { lat: 40.7128, lng: -74.006 }, // New York City
    defaultZoom: 12,
    map3dTilt: 60,
    map3dHeading: 0,
  },

  // Copilot
  copilot: {
    runtimeUrl: '/api/chat',
    systemPrompt: `You are a travel copilot assistant for a maps application. You MUST use the available tools to help users.

IMPORTANT: You have access to tools that control a real map interface. ALWAYS use these tools when users ask about:
- Finding places (restaurants, hotels, attractions) → Use searchPlaces or searchNearby
- Showing a location on the map → Use flyToLocation
- Getting directions → Use getDirections
- Adding markers → Use addMarker

For example:
- "Find restaurants near Times Square" → Call searchNearby with type="restaurant" and location="Times Square"
- "Show me Paris" → Call flyToLocation with location="Paris"
- "Search for coffee shops in Seattle" → Call searchPlaces with query="coffee shops in Seattle"

DO NOT just describe what you could do - actually USE THE TOOLS to perform the action.

After using tools, briefly confirm what action was taken. Be concise and helpful.`,
  },

  // UI
  ui: {
    chatPanelWidth: 380,
    markerColors: {
      hotel: '#3B82F6',      // Blue
      restaurant: '#F97316', // Orange
      attraction: '#8B5CF6', // Purple
      shopping: '#EC4899',   // Pink
      transport: '#10B981',  // Green
      other: '#6B7280',      // Gray
    } as const,
    animationDuration: 300,
  },

  // API
  api: {
    placesSearchRadius: 5000, // 5km default
    maxSearchResults: 20,
    requestTimeout: 10000,
  },
} as const;

export type MarkerColorType = keyof typeof config.ui.markerColors;
