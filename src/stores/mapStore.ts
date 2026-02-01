import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  MapState,
  MapActions,
  ViewMode,
  Camera,
  Marker,
  LatLng,
  Route,
} from '@/types';
import { config } from '@/lib/config';

const initialCamera: Camera = {
  center: config.googleMaps.defaultCenter,
  zoom: config.googleMaps.defaultZoom,
  heading: 0,
  tilt: 0,
};

const initialState: MapState = {
  viewMode: 'map2d',
  camera: initialCamera,
  markers: [],
  selectedMarkerId: null,
  route: null,
  isLoading: false,
  error: null,
};

let markerId = 0;
const generateMarkerId = () => `marker-${++markerId}`;

export const useMapStore = create<MapState & MapActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setViewMode: (mode: ViewMode) => {
        set(
          (state) => ({
            viewMode: mode,
            camera:
              mode === 'map3d'
                ? {
                    ...state.camera,
                    tilt: config.googleMaps.map3dTilt,
                    heading: config.googleMaps.map3dHeading,
                  }
                : {
                    ...state.camera,
                    tilt: 0,
                    heading: 0,
                  },
          }),
          false,
          'setViewMode'
        );
      },

      setCamera: (camera: Partial<Camera>) => {
        set(
          (state) => ({
            camera: { ...state.camera, ...camera },
          }),
          false,
          'setCamera'
        );
      },

      flyTo: (location: LatLng, zoom?: number) => {
        set(
          (state) => ({
            camera: {
              ...state.camera,
              center: location,
              zoom: zoom ?? state.camera.zoom,
            },
          }),
          false,
          'flyTo'
        );
      },

      addMarker: (marker: Omit<Marker, 'id'>) => {
        const id = generateMarkerId();
        set(
          (state) => ({
            markers: [...state.markers, { ...marker, id }],
          }),
          false,
          'addMarker'
        );
        return id;
      },

      addMarkers: (markers: Omit<Marker, 'id'>[]) => {
        const newMarkers = markers.map((m) => ({
          ...m,
          id: generateMarkerId(),
        }));
        set(
          (state) => ({
            markers: [...state.markers, ...newMarkers],
          }),
          false,
          'addMarkers'
        );
      },

      removeMarker: (id: string) => {
        set(
          (state) => ({
            markers: state.markers.filter((m) => m.id !== id),
            selectedMarkerId:
              state.selectedMarkerId === id ? null : state.selectedMarkerId,
          }),
          false,
          'removeMarker'
        );
      },

      clearMarkers: () => {
        set(
          {
            markers: [],
            selectedMarkerId: null,
          },
          false,
          'clearMarkers'
        );
      },

      selectMarker: (id: string | null) => {
        set(
          (state) => ({
            selectedMarkerId: id,
            markers: state.markers.map((m) => ({
              ...m,
              selected: m.id === id,
            })),
          }),
          false,
          'selectMarker'
        );
      },

      setRoute: (route: Route | null) => {
        set({ route }, false, 'setRoute');
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading }, false, 'setLoading');
      },

      setError: (error: string | null) => {
        set({ error }, false, 'setError');
      },

      fitBounds: (bounds: { northeast: LatLng; southwest: LatLng }) => {
        // Calculate center and appropriate zoom level
        const center = {
          lat: (bounds.northeast.lat + bounds.southwest.lat) / 2,
          lng: (bounds.northeast.lng + bounds.southwest.lng) / 2,
        };

        // Rough zoom calculation based on bounds
        const latDiff = Math.abs(bounds.northeast.lat - bounds.southwest.lat);
        const lngDiff = Math.abs(bounds.northeast.lng - bounds.southwest.lng);
        const maxDiff = Math.max(latDiff, lngDiff);

        let zoom = 12;
        if (maxDiff > 10) zoom = 5;
        else if (maxDiff > 5) zoom = 7;
        else if (maxDiff > 1) zoom = 9;
        else if (maxDiff > 0.5) zoom = 11;
        else if (maxDiff > 0.1) zoom = 13;
        else if (maxDiff > 0.05) zoom = 14;
        else zoom = 15;

        set(
          (state) => ({
            camera: {
              ...state.camera,
              center,
              zoom,
            },
          }),
          false,
          'fitBounds'
        );
      },
    }),
    { name: 'map-store' }
  )
);

// Selectors for optimized re-renders
export const useViewMode = () => useMapStore((s) => s.viewMode);
export const useCamera = () => useMapStore((s) => s.camera);
export const useMarkers = () => useMapStore((s) => s.markers);
export const useSelectedMarker = () => {
  const markers = useMapStore((s) => s.markers);
  const selectedId = useMapStore((s) => s.selectedMarkerId);
  return markers.find((m) => m.id === selectedId) ?? null;
};
export const useRoute = () => useMapStore((s) => s.route);
export const useMapLoading = () => useMapStore((s) => s.isLoading);
export const useMapError = () => useMapStore((s) => s.error);
