import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  PlacesState,
  PlacesActions,
  Place,
  Itinerary,
  ItineraryItem,
} from '@/types';

const initialState: PlacesState = {
  places: [],
  selectedPlace: null,
  searchQuery: '',
  isSearching: false,
  itinerary: null,
};

let itemId = 0;
const generateItemId = () => `item-${++itemId}`;

export const usePlacesStore = create<PlacesState & PlacesActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setPlaces: (places: Place[]) => {
        set({ places }, false, 'setPlaces');
      },

      addPlace: (place: Place) => {
        set(
          (state) => ({
            places: state.places.some((p) => p.id === place.id)
              ? state.places
              : [...state.places, place],
          }),
          false,
          'addPlace'
        );
      },

      selectPlace: (place: Place | null) => {
        set({ selectedPlace: place }, false, 'selectPlace');
      },

      setSearchQuery: (query: string) => {
        set({ searchQuery: query }, false, 'setSearchQuery');
      },

      setSearching: (searching: boolean) => {
        set({ isSearching: searching }, false, 'setSearching');
      },

      setItinerary: (itinerary: Itinerary | null) => {
        set({ itinerary }, false, 'setItinerary');
      },

      addToItinerary: (place: Place, day: number = 1) => {
        const state = get();
        const currentItinerary = state.itinerary ?? {
          id: 'default-itinerary',
          name: 'My Trip',
          items: [],
        };

        // Check if place is already in itinerary
        if (currentItinerary.items.some((item) => item.place.id === place.id)) {
          return;
        }

        // Calculate order for the new item
        const dayItems = currentItinerary.items.filter(
          (item) => item.day === day
        );
        const order = dayItems.length + 1;

        const newItem: ItineraryItem = {
          id: generateItemId(),
          place,
          day,
          order,
        };

        set(
          {
            itinerary: {
              ...currentItinerary,
              items: [...currentItinerary.items, newItem],
            },
          },
          false,
          'addToItinerary'
        );
      },

      removeFromItinerary: (itemId: string) => {
        const state = get();
        if (!state.itinerary) return;

        set(
          {
            itinerary: {
              ...state.itinerary,
              items: state.itinerary.items.filter((item) => item.id !== itemId),
            },
          },
          false,
          'removeFromItinerary'
        );
      },

      reorderItinerary: (items: ItineraryItem[]) => {
        const state = get();
        if (!state.itinerary) return;

        set(
          {
            itinerary: {
              ...state.itinerary,
              items,
            },
          },
          false,
          'reorderItinerary'
        );
      },
    }),
    { name: 'places-store' }
  )
);

// Selectors
export const usePlaces = () => usePlacesStore((s) => s.places);
export const useSelectedPlace = () => usePlacesStore((s) => s.selectedPlace);
export const useSearchQuery = () => usePlacesStore((s) => s.searchQuery);
export const useIsSearching = () => usePlacesStore((s) => s.isSearching);
export const useItinerary = () => usePlacesStore((s) => s.itinerary);

// Computed selectors
export const useItineraryByDay = () => {
  const itinerary = usePlacesStore((s) => s.itinerary);
  if (!itinerary) return {};

  return itinerary.items.reduce(
    (acc, item) => {
      const day = item.day;
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(item);
      acc[day].sort((a, b) => a.order - b.order);
      return acc;
    },
    {} as Record<number, ItineraryItem[]>
  );
};
