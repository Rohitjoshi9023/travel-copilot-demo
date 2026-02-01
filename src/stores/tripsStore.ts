import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Trip, TripItem, TripStatus, Place, TripItemCategory, TripDayInfo } from '@/types';

interface TripsState {
  trips: Trip[];
  activeTripId: string | null;
  isLoading: boolean;
}

interface TripsActions {
  // Trip management
  createTrip: (data: {
    name: string;
    description?: string;
    destination?: string;
    startDate?: string;
    endDate?: string;
  }) => Trip;
  updateTrip: (id: string, updates: Partial<Omit<Trip, 'id' | 'createdAt' | 'items'>>) => void;
  deleteTrip: (id: string) => void;
  setActiveTrip: (id: string | null) => void;

  // Trip item management
  addItemToTrip: (tripId: string, place: Place, day?: number, category?: TripItemCategory) => void;
  removeItemFromTrip: (tripId: string, itemId: string) => void;
  updateTripItem: (tripId: string, itemId: string, updates: Partial<Omit<TripItem, 'id' | 'place'>>) => void;
  reorderTripItems: (tripId: string, day: number, items: TripItem[]) => void;
  moveTripItem: (tripId: string, itemId: string, newDay: number, newOrder: number) => void;

  // Day management
  addDay: (tripId: string) => void;
  removeDay: (tripId: string, day: number) => void;
  updateDayInfo: (tripId: string, day: number, info: TripDayInfo) => void;
  getDayInfo: (tripId: string, day: number) => TripDayInfo | undefined;

  // Utilities
  setLoading: (loading: boolean) => void;
  getActiveTrip: () => Trip | null;
  getTripById: (id: string) => Trip | undefined;
}

const initialState: TripsState = {
  trips: [],
  activeTripId: null,
  isLoading: false,
};

let tripIdCounter = 0;
let itemIdCounter = 0;

const generateTripId = () => `trip-${Date.now()}-${++tripIdCounter}`;
const generateItemId = () => `trip-item-${Date.now()}-${++itemIdCounter}`;

export const useTripsStore = create<TripsState & TripsActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        createTrip: (data) => {
          const now = new Date().toISOString();
          const newTrip: Trip = {
            id: generateTripId(),
            name: data.name,
            description: data.description,
            destination: data.destination,
            startDate: data.startDate,
            endDate: data.endDate,
            createdAt: now,
            updatedAt: now,
            items: [],
            status: 'planning',
            daysCount: 1,
          };

          set(
            (state) => ({
              trips: [...state.trips, newTrip],
              activeTripId: newTrip.id,
            }),
            false,
            'createTrip'
          );

          return newTrip;
        },

        updateTrip: (id, updates) => {
          set(
            (state) => ({
              trips: state.trips.map((trip) =>
                trip.id === id
                  ? { ...trip, ...updates, updatedAt: new Date().toISOString() }
                  : trip
              ),
            }),
            false,
            'updateTrip'
          );
        },

        deleteTrip: (id) => {
          set(
            (state) => {
              const remainingTrips = state.trips.filter((trip) => trip.id !== id);
              // Auto-select another trip if the deleted one was active
              let newActiveTripId = state.activeTripId;
              if (state.activeTripId === id) {
                newActiveTripId = remainingTrips.length > 0 ? remainingTrips[0].id : null;
              }
              return {
                trips: remainingTrips,
                activeTripId: newActiveTripId,
              };
            },
            false,
            'deleteTrip'
          );
        },

        setActiveTrip: (id) => {
          set({ activeTripId: id }, false, 'setActiveTrip');
        },

        addItemToTrip: (tripId, place, day = 1, category) => {
          const state = get();
          const trip = state.trips.find((t) => t.id === tripId);
          if (!trip) return;

          // Check if place is already in trip
          if (trip.items.some((item) => item.place.id === place.id)) {
            return;
          }

          // Calculate order for the new item
          const dayItems = trip.items.filter((item) => item.day === day);
          const order = dayItems.length + 1;

          const newItem: TripItem = {
            id: generateItemId(),
            place,
            day,
            order,
            category,
          };

          set(
            (state) => ({
              trips: state.trips.map((t) =>
                t.id === tripId
                  ? {
                      ...t,
                      items: [...t.items, newItem],
                      updatedAt: new Date().toISOString(),
                    }
                  : t
              ),
            }),
            false,
            'addItemToTrip'
          );
        },

        removeItemFromTrip: (tripId, itemId) => {
          set(
            (state) => ({
              trips: state.trips.map((trip) =>
                trip.id === tripId
                  ? {
                      ...trip,
                      items: trip.items.filter((item) => item.id !== itemId),
                      updatedAt: new Date().toISOString(),
                    }
                  : trip
              ),
            }),
            false,
            'removeItemFromTrip'
          );
        },

        updateTripItem: (tripId, itemId, updates) => {
          set(
            (state) => ({
              trips: state.trips.map((trip) =>
                trip.id === tripId
                  ? {
                      ...trip,
                      items: trip.items.map((item) =>
                        item.id === itemId ? { ...item, ...updates } : item
                      ),
                      updatedAt: new Date().toISOString(),
                    }
                  : trip
              ),
            }),
            false,
            'updateTripItem'
          );
        },

        reorderTripItems: (tripId, day, items) => {
          set(
            (state) => ({
              trips: state.trips.map((trip) => {
                if (trip.id !== tripId) return trip;

                // Keep items from other days, replace items for the specified day
                const otherDayItems = trip.items.filter((item) => item.day !== day);
                const reorderedItems = items.map((item, index) => ({
                  ...item,
                  order: index + 1,
                }));

                return {
                  ...trip,
                  items: [...otherDayItems, ...reorderedItems],
                  updatedAt: new Date().toISOString(),
                };
              }),
            }),
            false,
            'reorderTripItems'
          );
        },

        moveTripItem: (tripId, itemId, newDay, newOrder) => {
          set(
            (state) => ({
              trips: state.trips.map((trip) => {
                if (trip.id !== tripId) return trip;

                const itemToMove = trip.items.find((item) => item.id === itemId);
                if (!itemToMove) return trip;

                // Update the moved item
                const updatedItems = trip.items.map((item) => {
                  if (item.id === itemId) {
                    return { ...item, day: newDay, order: newOrder };
                  }
                  // Adjust orders for items in the target day
                  if (item.day === newDay && item.order >= newOrder) {
                    return { ...item, order: item.order + 1 };
                  }
                  return item;
                });

                return {
                  ...trip,
                  items: updatedItems,
                  updatedAt: new Date().toISOString(),
                };
              }),
            }),
            false,
            'moveTripItem'
          );
        },

        addDay: (tripId) => {
          set(
            (state) => ({
              trips: state.trips.map((trip) =>
                trip.id === tripId
                  ? {
                      ...trip,
                      daysCount: trip.daysCount + 1,
                      updatedAt: new Date().toISOString(),
                    }
                  : trip
              ),
            }),
            false,
            'addDay'
          );
        },

        removeDay: (tripId, day) => {
          set(
            (state) => ({
              trips: state.trips.map((trip) => {
                if (trip.id !== tripId) return trip;

                // Remove items from this day and adjust days for items after
                const updatedItems = trip.items
                  .filter((item) => item.day !== day)
                  .map((item) => ({
                    ...item,
                    day: item.day > day ? item.day - 1 : item.day,
                  }));

                // Also adjust dayInfo keys
                const newDayInfo: Record<number, TripDayInfo> = {};
                if (trip.dayInfo) {
                  Object.entries(trip.dayInfo).forEach(([dayStr, info]) => {
                    const dayNum = parseInt(dayStr, 10);
                    if (dayNum < day) {
                      newDayInfo[dayNum] = info;
                    } else if (dayNum > day) {
                      newDayInfo[dayNum - 1] = info;
                    }
                    // Skip the removed day
                  });
                }

                return {
                  ...trip,
                  items: updatedItems,
                  daysCount: Math.max(1, trip.daysCount - 1),
                  dayInfo: Object.keys(newDayInfo).length > 0 ? newDayInfo : undefined,
                  updatedAt: new Date().toISOString(),
                };
              }),
            }),
            false,
            'removeDay'
          );
        },

        updateDayInfo: (tripId, day, info) => {
          set(
            (state) => ({
              trips: state.trips.map((trip) => {
                if (trip.id !== tripId) return trip;

                const currentDayInfo = trip.dayInfo || {};
                const updatedDayInfo = {
                  ...currentDayInfo,
                  [day]: {
                    ...currentDayInfo[day],
                    ...info,
                  },
                };

                return {
                  ...trip,
                  dayInfo: updatedDayInfo,
                  updatedAt: new Date().toISOString(),
                };
              }),
            }),
            false,
            'updateDayInfo'
          );
        },

        getDayInfo: (tripId, day) => {
          const state = get();
          const trip = state.trips.find((t) => t.id === tripId);
          return trip?.dayInfo?.[day];
        },

        setLoading: (loading) => {
          set({ isLoading: loading }, false, 'setLoading');
        },

        getActiveTrip: () => {
          const state = get();
          return state.trips.find((t) => t.id === state.activeTripId) ?? null;
        },

        getTripById: (id) => {
          const state = get();
          return state.trips.find((t) => t.id === id);
        },
      }),
      {
        name: 'trips-storage',
        partialize: (state) => ({
          trips: state.trips,
          activeTripId: state.activeTripId,
        }),
      }
    ),
    { name: 'trips-store' }
  )
);

// Selectors
export const useTrips = () => useTripsStore((s) => s.trips);
export const useActiveTripId = () => useTripsStore((s) => s.activeTripId);
export const useActiveTrip = () => {
  const trips = useTripsStore((s) => s.trips);
  const activeTripId = useTripsStore((s) => s.activeTripId);
  return trips.find((t) => t.id === activeTripId) ?? null;
};
export const useTripsLoading = () => useTripsStore((s) => s.isLoading);

// Computed selectors
export const useTripItemsByDay = (tripId: string) => {
  const trips = useTripsStore((s) => s.trips);
  const trip = trips.find((t) => t.id === tripId);
  if (!trip) return {};

  return trip.items.reduce(
    (acc, item) => {
      const day = item.day;
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(item);
      acc[day].sort((a, b) => a.order - b.order);
      return acc;
    },
    {} as Record<number, TripItem[]>
  );
};

export const useActiveTripItemsByDay = () => {
  const trips = useTripsStore((s) => s.trips);
  const activeTripId = useTripsStore((s) => s.activeTripId);
  const trip = trips.find((t) => t.id === activeTripId);
  if (!trip) return {};

  return trip.items.reduce(
    (acc, item) => {
      const day = item.day;
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(item);
      acc[day].sort((a, b) => a.order - b.order);
      return acc;
    },
    {} as Record<number, TripItem[]>
  );
};

// Get the maximum day number in a trip
export const useTripMaxDay = (tripId: string) => {
  const trips = useTripsStore((s) => s.trips);
  const trip = trips.find((t) => t.id === tripId);
  if (!trip || trip.items.length === 0) return 1;
  return Math.max(...trip.items.map((item) => item.day));
};
