// Core map types
export interface LatLng {
  lat: number;
  lng: number;
}

export interface Camera {
  center: LatLng;
  zoom: number;
  heading: number;
  tilt: number;
}

export type ViewMode = 'map2d' | 'map3d' | 'streetview';

export interface Marker {
  id: string;
  position: LatLng;
  title: string;
  type: PlaceType;
  selected?: boolean;
  placeId?: string;
}

// Place types
export type PlaceType =
  | 'hotel'
  | 'restaurant'
  | 'attraction'
  | 'shopping'
  | 'transport'
  | 'other';

export interface PlacePhoto {
  url: string;
  width: number;
  height: number;
  attributions?: string[];
}

export interface PlaceReview {
  author: string;
  rating: number;
  text: string;
  time: string;
  authorPhoto?: string;
}

export interface PlaceOpeningHours {
  openNow: boolean;
  periods?: {
    open: { day: number; time: string };
    close: { day: number; time: string };
  }[];
  weekdayText?: string[];
}

export interface Place {
  id: string;
  placeId: string;
  name: string;
  address: string;
  location: LatLng;
  type: PlaceType;
  rating?: number;
  userRatingsTotal?: number;
  priceLevel?: number;
  photos?: PlacePhoto[];
  phone?: string;
  website?: string;
  openingHours?: PlaceOpeningHours;
  reviews?: PlaceReview[];
  types?: string[];
}

// Route types
export type TravelMode = 'driving' | 'walking' | 'bicycling' | 'transit';

export interface RouteStep {
  instruction: string;
  distance: string;
  duration: string;
  startLocation: LatLng;
  endLocation: LatLng;
  maneuver?: string;
}

export interface RouteLeg {
  startAddress: string;
  endAddress: string;
  distance: string;
  duration: string;
  steps: RouteStep[];
}

export interface Route {
  id: string;
  origin: LatLng;
  destination: LatLng;
  waypoints?: LatLng[];
  travelMode: TravelMode;
  legs: RouteLeg[];
  overview: LatLng[];
  bounds: {
    northeast: LatLng;
    southwest: LatLng;
  };
}

// Itinerary types (legacy - kept for backward compatibility)
export interface ItineraryItem {
  id: string;
  place: Place;
  day: number;
  order: number;
  startTime?: string;
  endTime?: string;
  notes?: string;
}

export interface Itinerary {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  items: ItineraryItem[];
}

// Trip types
export type TripStatus = 'planning' | 'upcoming' | 'ongoing' | 'completed';

export type TripItemCategory = 'accommodation' | 'activity' | 'dining' | 'transport' | 'sightseeing' | 'other';

export interface TripItem {
  id: string;
  place: Place;
  day: number;
  order: number;
  startTime?: string;
  endTime?: string;
  notes?: string;
  category?: TripItemCategory;
}

export interface Trip {
  id: string;
  name: string;
  description?: string;
  destination?: string;
  coverImage?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  items: TripItem[];
  status: TripStatus;
  daysCount: number;
}

// Chat/Copilot types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  places?: Place[];
  route?: Route;
}

// Map state for Zustand store
export interface MapState {
  viewMode: ViewMode;
  camera: Camera;
  markers: Marker[];
  selectedMarkerId: string | null;
  route: Route | null;
  isLoading: boolean;
  error: string | null;
}

export interface MapActions {
  setViewMode: (mode: ViewMode) => void;
  setCamera: (camera: Partial<Camera>) => void;
  flyTo: (location: LatLng, zoom?: number) => void;
  addMarker: (marker: Omit<Marker, 'id'>) => string;
  addMarkers: (markers: Omit<Marker, 'id'>[]) => void;
  removeMarker: (id: string) => void;
  clearMarkers: () => void;
  selectMarker: (id: string | null) => void;
  setRoute: (route: Route | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fitBounds: (bounds: { northeast: LatLng; southwest: LatLng }) => void;
}

// Places state for Zustand store
export interface PlacesState {
  places: Place[];
  selectedPlace: Place | null;
  searchQuery: string;
  isSearching: boolean;
  itinerary: Itinerary | null;
}

export interface PlacesActions {
  setPlaces: (places: Place[]) => void;
  addPlace: (place: Place) => void;
  selectPlace: (place: Place | null) => void;
  setSearchQuery: (query: string) => void;
  setSearching: (searching: boolean) => void;
  setItinerary: (itinerary: Itinerary | null) => void;
  addToItinerary: (place: Place, day?: number) => void;
  removeFromItinerary: (itemId: string) => void;
  reorderItinerary: (items: ItineraryItem[]) => void;
}

// API response types
export interface PlacesSearchResponse {
  places: Place[];
  nextPageToken?: string;
}

export interface PlaceDetailsResponse {
  place: Place;
}

export interface DirectionsResponse {
  routes: Route[];
}

// Tool parameter types for Copilot
export interface FlyToLocationParams {
  location: string;
  zoom?: number;
}

export interface SetMapViewParams {
  viewMode: ViewMode;
}

export interface SearchPlacesParams {
  query: string;
  location?: LatLng;
  radius?: number;
}

export interface SearchNearbyParams {
  type: string;
  location: LatLng;
  radius?: number;
}

export interface GetDirectionsParams {
  origin: string;
  destination: string;
  travelMode?: TravelMode;
}

export interface AddMarkerParams {
  location: LatLng;
  title: string;
  type?: PlaceType;
}
