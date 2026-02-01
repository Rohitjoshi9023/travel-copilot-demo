'use client';

import { useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useTrips, useActiveTrip, useActiveTripItemsByDay, useTripsStore } from '@/stores/tripsStore';
import { TripHeader } from './TripHeader';
import { TripDaySection } from './TripDaySection';
import { TripEmptyState } from './TripEmptyState';
import { TripExportButton } from './TripExportButton';

export function TripsPanelContent() {
  const trips = useTrips();
  const activeTrip = useActiveTrip();
  const itemsByDay = useActiveTripItemsByDay();
  const addDay = useTripsStore((s) => s.addDay);

  // Calculate days to show based on daysCount, items, or date range
  const daysToShow = useMemo(() => {
    if (!activeTrip) return [];

    let maxDay = activeTrip.daysCount || 1;

    // Get max day from items (in case items exist beyond daysCount)
    if (activeTrip.items.length > 0) {
      const maxItemDay = Math.max(...activeTrip.items.map((item) => item.day));
      maxDay = Math.max(maxDay, maxItemDay);
    }

    // Or calculate from date range
    if (activeTrip.startDate && activeTrip.endDate) {
      const start = new Date(activeTrip.startDate);
      const end = new Date(activeTrip.endDate);
      const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      maxDay = Math.max(maxDay, diffDays);
    }

    return Array.from({ length: maxDay }, (_, i) => i + 1);
  }, [activeTrip]);

  // If no trips exist
  if (trips.length === 0) {
    return <TripEmptyState hasTrips={false} />;
  }

  // If no active trip selected
  if (!activeTrip) {
    return <TripEmptyState hasTrips={true} />;
  }

  const handleAddDay = () => {
    addDay(activeTrip.id);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Trip Header */}
      <TripHeader trip={activeTrip} />

      {/* Days List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {daysToShow.map((day) => (
          <TripDaySection
            key={day}
            tripId={activeTrip.id}
            day={day}
            items={itemsByDay[day] || []}
            startDate={activeTrip.startDate}
          />
        ))}

        {/* Add Day Button */}
        <button
          onClick={handleAddDay}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Day {daysToShow.length + 1}
        </button>
      </div>

      {/* Export Button */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
        <TripExportButton trip={activeTrip} />
      </div>
    </div>
  );
}
