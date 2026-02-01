'use client';

import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useTrips, useActiveTrip, useActiveTripItemsByDay, useTripsStore } from '@/stores/tripsStore';
import { TripHeader } from './TripHeader';
import { TripDaySection } from './TripDaySection';
import { TripEmptyState } from './TripEmptyState';
import { TripExportButton } from './TripExportButton';
import { TripItemCard } from './TripItemCard';
import type { TripItem } from '@/types';

export function TripsPanelContent() {
  const trips = useTrips();
  const activeTrip = useActiveTrip();
  const itemsByDay = useActiveTripItemsByDay();
  const addDay = useTripsStore((s) => s.addDay);
  const reorderTripItems = useTripsStore((s) => s.reorderTripItems);
  const moveTripItem = useTripsStore((s) => s.moveTripItem);

  const [activeItem, setActiveItem] = useState<TripItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before starting drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const itemId = active.id as string;

    // Find the item being dragged
    const item = activeTrip.items.find((i) => i.id === itemId);
    if (item) {
      setActiveItem(item);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // We can use this to show visual feedback when hovering over a day
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the source item
    const sourceItem = activeTrip.items.find((i) => i.id === activeId);
    if (!sourceItem) return;

    // Check if we're dropping on a day container
    if (overId.startsWith('day-')) {
      const targetDay = parseInt(overId.replace('day-', ''), 10);

      if (sourceItem.day !== targetDay) {
        // Move to a different day (at the end)
        const targetDayItems = itemsByDay[targetDay] || [];
        moveTripItem(activeTrip.id, activeId, targetDay, targetDayItems.length);
      }
      return;
    }

    // Find if we're dropping on another item
    const targetItem = activeTrip.items.find((i) => i.id === overId);
    if (!targetItem) return;

    const sourceDay = sourceItem.day;
    const targetDay = targetItem.day;

    if (sourceDay === targetDay) {
      // Same day - reorder within the day
      const dayItems = itemsByDay[sourceDay] || [];
      const oldIndex = dayItems.findIndex((item) => item.id === activeId);
      const newIndex = dayItems.findIndex((item) => item.id === overId);

      if (oldIndex !== newIndex) {
        const newItems = [...dayItems];
        const [movedItem] = newItems.splice(oldIndex, 1);
        newItems.splice(newIndex, 0, movedItem);
        reorderTripItems(activeTrip.id, sourceDay, newItems);
      }
    } else {
      // Different day - move to the new day at the target position
      const targetDayItems = itemsByDay[targetDay] || [];
      const targetIndex = targetDayItems.findIndex((item) => item.id === overId);
      moveTripItem(activeTrip.id, activeId, targetDay, targetIndex);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Trip Header */}
      <TripHeader trip={activeTrip} />

      {/* Days List with DnD Context */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {daysToShow.map((day) => (
            <TripDaySection
              key={day}
              tripId={activeTrip.id}
              day={day}
              items={itemsByDay[day] || []}
              startDate={activeTrip.startDate}
              dayInfo={activeTrip.dayInfo?.[day]}
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

        {/* Drag Overlay - shows the item being dragged */}
        <DragOverlay>
          {activeItem ? (
            <div className="opacity-90">
              <TripItemCard item={activeItem} isDragOverlay />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Export Button */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
        <TripExportButton trip={activeTrip} />
      </div>
    </div>
  );
}
