// Clean, minimal map styling inspired by Mapbox

export const cleanMapStyle: google.maps.MapTypeStyle[] = [
  // Water - soft blue
  {
    featureType: 'water',
    elementType: 'geometry.fill',
    stylers: [{ color: '#C6ECFF' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4A90A4' }],
  },

  // Land - light gray
  {
    featureType: 'landscape',
    elementType: 'geometry.fill',
    stylers: [{ color: '#F4F4F4' }],
  },
  {
    featureType: 'landscape.natural',
    elementType: 'geometry.fill',
    stylers: [{ color: '#F0F0F0' }],
  },
  {
    featureType: 'landscape.man_made',
    elementType: 'geometry.fill',
    stylers: [{ color: '#F4F4F4' }],
  },

  // Parks - subtle green
  {
    featureType: 'poi.park',
    elementType: 'geometry.fill',
    stylers: [{ color: '#E8F5E9' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6B9A76' }],
  },

  // Hide most POI labels (we control via markers)
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.business',
    stylers: [{ visibility: 'off' }],
  },

  // Roads - white with subtle borders
  {
    featureType: 'road',
    elementType: 'geometry.fill',
    stylers: [{ color: '#FFFFFF' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#E0E0E0' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.fill',
    stylers: [{ color: '#FFF9C4' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#E0E0E0' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6B7280' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#FFFFFF' }],
  },

  // Transit
  {
    featureType: 'transit',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'geometry.fill',
    stylers: [{ color: '#E8EAF6' }],
  },

  // Buildings - subtle outlines
  {
    featureType: 'building',
    elementType: 'geometry.fill',
    stylers: [{ color: '#EAEAEA' }],
  },
  {
    featureType: 'building',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#DADADA' }],
  },

  // Administrative labels
  {
    featureType: 'administrative',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6B7280' }],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#374151' }],
  },
  {
    featureType: 'administrative.neighborhood',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9CA3AF' }],
  },
];

// Dark mode map style
export const darkMapStyle: google.maps.MapTypeStyle[] = [
  // Background
  {
    elementType: 'geometry',
    stylers: [{ color: '#1F2937' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#D1D5DB' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#1F2937' }],
  },

  // Water
  {
    featureType: 'water',
    elementType: 'geometry.fill',
    stylers: [{ color: '#111827' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6B7280' }],
  },

  // Land
  {
    featureType: 'landscape',
    elementType: 'geometry.fill',
    stylers: [{ color: '#1F2937' }],
  },

  // Parks
  {
    featureType: 'poi.park',
    elementType: 'geometry.fill',
    stylers: [{ color: '#1E3A2F' }],
  },

  // Hide POI labels
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.business',
    stylers: [{ visibility: 'off' }],
  },

  // Roads
  {
    featureType: 'road',
    elementType: 'geometry.fill',
    stylers: [{ color: '#374151' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1F2937' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.fill',
    stylers: [{ color: '#4B5563' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9CA3AF' }],
  },

  // Transit
  {
    featureType: 'transit',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },

  // Buildings
  {
    featureType: 'building',
    elementType: 'geometry.fill',
    stylers: [{ color: '#2D3748' }],
  },

  // Administrative
  {
    featureType: 'administrative',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9CA3AF' }],
  },
];

// Map options
export const defaultMapOptions: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  clickableIcons: false,
  gestureHandling: 'greedy',
};

export const map3DOptions = {
  tilt: 60,
  heading: 0,
  mapTypeId: 'satellite' as google.maps.MapTypeId,
};
