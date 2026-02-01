'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Calendar, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { TripItemCard } from './TripItemCard';
import { TripItemEditor } from './TripItemEditor';
import { useTripsStore } from '@/stores/tripsStore';
import type { TripItem } from '@/types';

interface TripDaySectionProps {
  tripId: string;
  day: number;
  items: TripItem[];
  startDate?: string;
}

export function TripDaySection({ tripId, day, items, startDate }: TripDaySectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [editingItem, setEditingItem] = useState<TripItem | null>(null);

  const reorderTripItems = useTripsStore((s) => s.reorderTripItems);
  const removeItemFromTrip = useTripsStore((s) => s.removeItemFromTrip);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      // Create a new array with reordered items
      const newItems = [...items];
      const [movedItem] = newItems.splice(oldIndex, 1);
      newItems.splice(newIndex, 0, movedItem);

      reorderTripItems(tripId, day, newItems);
    }
  };

  const handleDelete = (itemId: string) => {
    removeItemFromTrip(tripId, itemId);
  };

  const handleEdit = (item: TripItem) => {
    setEditingItem(item);
  };

  // Calculate the date for this day
  const getDayDate = () => {
    if (!startDate) return null;
    const date = new Date(startDate);
    date.setDate(date.getDate() + day - 1);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const dayDate = getDayDate();

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      {/* Day Header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-gray-900">Day {day}</h3>
            {dayDate && <p className="text-xs text-gray-500">{dayDate}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
            {items.length} {items.length === 1 ? 'place' : 'places'}
          </span>
          {isCollapsed ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* Items */}
      {!isCollapsed && (
        <div className="p-3 space-y-2">
          {items.length === 0 ? (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                <Plus className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">No places added yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Search for places and add them to this day
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                {items.map((item) => (
                  <TripItemCard
                    key={item.id}
                    item={item}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}

      {/* Item Editor Modal */}
      <TripItemEditor
        tripId={tripId}
        item={editingItem}
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
      />
    </div>
  );
}
